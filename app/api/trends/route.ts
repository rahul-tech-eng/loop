import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = session.user.workspaceId;

  // Current period = last 7 days
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - 7);

  // Previous period = 7 days before that
  const previousStart = new Date(now);
  previousStart.setDate(previousStart.getDate() - 14);
  const previousEnd = new Date(currentStart);

  // Get all themes for this workspace
  const themes = await db.theme.findMany({
    where: { workspaceId },
    include: {
      feedback: {
        include: {
          feedback: true,
        },
      },
    },
  });

  const trends = themes.map((theme) => {
    const allFeedback = theme.feedback.map((ft) => ft.feedback);

    // Count feedback in current period
    const currentCount = allFeedback.filter(
      (f) => new Date(f.createdAt) >= currentStart
    ).length;

    // Count feedback in previous period
    const previousCount = allFeedback.filter(
      (f) =>
        new Date(f.createdAt) >= previousStart &&
        new Date(f.createdAt) < previousEnd
    ).length;

    // spike 
    const spike =
      previousCount === 0
        ? currentCount > 0 ? 100 : 0
        : Math.round(((currentCount - previousCount) / previousCount) * 100);

    const isSpiking = spike >= 50 && currentCount > 0;

    return {
      id: theme.id,
      name: theme.name,
      color: theme.color,
      currentCount,
      previousCount,
      spike,
      isSpiking,
      total: allFeedback.length,
    };
  });

  // Sort by current count descending
  trends.sort((a, b) => b.currentCount - a.currentCount);

  return NextResponse.json({ trends });
}