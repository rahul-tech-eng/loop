import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const themes = await db.theme.findMany({
  where: { workspaceId: session.user.workspaceId },
  include: {
    feedback: {
      include: {
        feedback: true,
      },
    },
  },
  orderBy: { createdAt: "desc" },
});

const themesWithCount = themes.map((theme) => ({
  id: theme.id,
  name: theme.name,
  color: theme.color,
  count: theme.feedback.length,
  feedbacks: theme.feedback.map((ft) => ({
    id: ft.feedback.id,
    content: ft.feedback.content,
    sentiment: ft.feedback.sentiment,
    channel: ft.feedback.channel,
    status: ft.feedback.status,
    createdAt: ft.feedback.createdAt,
    confidence: ft.confidence,
  })),
}));
    
    

  return NextResponse.json({ themes: themesWithCount });
}