 
 import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { classifyFeedback } from "@/lib/ai"; 
import { Sentiment } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { feedbackId } = await req.json();
  if (!feedbackId) {
    return NextResponse.json({ error: "feedbackId is required" }, { status: 400 });
  }

  const feedback = await db.feedback.findFirst({
    where: { id: feedbackId, workspaceId: session.user.workspaceId },
  });

  if (!feedback) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
  }

  
  if (feedback.sentiment !== null) {
    return NextResponse.json({ success: true, message: "Already classified" });
  }

  const themes = await db.theme.findMany({
    where: { workspaceId: session.user.workspaceId },
    select: { name: true },
  });
  const themeNames = themes.map((t) => t.name);

  const result = await classifyFeedback(feedback.content, themeNames);

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

  for (const themeName of result.themes ?? []) {
    let theme = await db.theme.findFirst({
      where: { name: themeName, workspaceId: session.user.workspaceId },
    });

    if (!theme) {
      theme = await db.theme.create({
        data: { name: themeName, workspaceId: session.user.workspaceId, color: randomColor() },
      });
    }

    await db.feedbackTheme.upsert({
      where: { feedbackId_themeId: { feedbackId, themeId: theme.id } },
      update: { confidence: Math.abs(result.sentimentScore ?? 0) },
      create: {
        feedbackId,
        themeId: theme.id,
        confidence: Math.abs(result.sentimentScore ?? 0),
      },
    });
  }

  return NextResponse.json({ success: true, classification: result });
}

function randomColor() {
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
  return colors[Math.floor(Math.random() * colors.length)];
}