
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { classifyFeedback } from "@/lib/ai";
import { Sentiment } from "@prisma/client";

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  const { feedbackId } = await req.json();
  if (!feedbackId) {
    return NextResponse.json({ error: "feedbackId is required" }, { status: 400 });
  }

  // 3. Fetch feedback — scoped to caller's workspace (security rule)
  const feedback = await db.feedback.findFirst({
    where: {
      id: feedbackId,
      workspaceId: session.user.workspaceId, // never skip this
    },
  });

  if (!feedback) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
  }

  // 4. Get existing theme names for this workspace (so Claude reuses them)
  const themes = await db.theme.findMany({
    where: { workspaceId: session.user.workspaceId },
    select: { name: true },
  });
  const themeNames = themes.map((t) => t.name);

  // 5. Call Claude
  const result = await classifyFeedback(feedback.content, themeNames);

  // 6. Save sentiment back to the feedback row
  // 6. Save sentiment back to the feedback row
const sentimentMap: Record<string, Sentiment> = {
  POSITIVE: Sentiment.POSITIVE,
  NEUTRAL: Sentiment.NEUTRAL,
  NEGATIVE: Sentiment.NEGATIVE,
};

await db.feedback.update({
  where: { id: feedbackId },
  data: {
    sentiment: sentimentMap[result.sentiment] ?? Sentiment.NEUTRAL,
    sentimentScore: result.sentimentScore,
  },
});

   // 7. Upsert themes and link them via FeedbackTheme join table
for (const themeName of result.themes) {
  // Find or create theme
  let theme = await db.theme.findFirst({
    where: {
      name: themeName,
      workspaceId: session.user.workspaceId,
    },
  });

  if (!theme) {
    theme = await db.theme.create({
      data: {
        name: themeName,
        workspaceId: session.user.workspaceId,
        color: randomColor(),
      },
    });
  }

  // Link feedback ↔ theme
  await db.feedbackTheme.upsert({
    where: {
      feedbackId_themeId: {
        feedbackId: feedbackId,
        themeId: theme.id,
      },
    },
    update: { confidence: Math.abs(result.sentimentScore) },
    create: {
      feedbackId: feedbackId,
      themeId: theme.id,
      confidence: Math.abs(result.sentimentScore),
    },
  });
}

  return NextResponse.json({ success: true, classification: result });
}

function randomColor() {
  const colors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6"];
  return colors[Math.floor(Math.random() * colors.length)];
}