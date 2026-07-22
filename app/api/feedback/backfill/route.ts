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

  // Get all unclassified feedback for this workspace
  const unclassified = await db.feedback.findMany({
    where: {
      workspaceId: session.user.workspaceId,
    },
  });

  let success = 0;
  let failed = 0;

  const themes = await db.theme.findMany({
    where: { workspaceId: session.user.workspaceId },
    select: { name: true },
  });
  const themeNames = themes.map((t) => t.name);

  for (const feedback of unclassified) {
    try {
      const result = await classifyFeedback(feedback.content, themeNames);

      const sentimentMap: Record<string, Sentiment> = {
        POSITIVE: Sentiment.POSITIVE,
        NEUTRAL: Sentiment.NEUTRAL,
        NEGATIVE: Sentiment.NEGATIVE,
      };

      await db.feedback.update({
        where: { id: feedback.id },
        data: {
          sentiment: sentimentMap[result.sentiment] ?? Sentiment.NEUTRAL,
          sentimentScore: result.sentimentScore,
        },
      });

      success++;
    } catch (err) {
      console.error(`Failed to classify ${feedback.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({
    success: true,
    classified: success,
    failed,
    total: unclassified.length,
  });
}