import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { periodStart, periodEnd, title } = await req.json();
  if (!periodStart || !periodEnd) {
    return NextResponse.json({ error: "Period is required" }, { status: 400 });
  }

  const workspaceId = session.user.workspaceId;
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  // 1. Get feedback for the period
  const feedback = await db.feedback.findMany({
    where: {
      workspaceId,
      createdAt: { gte: start, lte: end },
    },
    include: {
      themes: { include: { theme: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (feedback.length === 0) 
    {
    return NextResponse.json(
      { error: "No feedback found for this period" },
      { status: 400 }
    );
  }

  const existingReport = await db.report.findFirst({
    where: {
      workspaceId,
      periodStart: start,
      periodEnd: end,
    },
  });

  if (existingReport) {
    return NextResponse.json({ success: true, report: existingReport });
  }

   
  // 2. Pre-compute stat
  const total = feedback.length;
  const positive = feedback.filter((f) => f.sentiment === "POSITIVE").length;
  const negative = feedback.filter((f) => f.sentiment === "NEGATIVE").length;
  const neutral = feedback.filter((f) => f.sentiment === "NEUTRAL").length;

  // Count themes
  const themeCounts: Record<string, number> = {};
  feedback.forEach((f) => {
    f.themes.forEach((ft) => {
      const name = ft.theme.name;
      themeCounts[name] = (themeCounts[name] ?? 0) + 1;
    });
  });

  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Notable quotes — top 3 negative and top 3 positive
  const negativeQuotes = feedback
    .filter((f) => f.sentiment === "NEGATIVE")
    .slice(0, 3)
    .map((f) => f.content);

  const positiveQuotes = feedback
    .filter((f) => f.sentiment === "POSITIVE")
    .slice(0, 3)
    .map((f) => f.content);

  // 3. Build prompt with pre-computed stats
  const prompt = `You are a product analyst writing a Voice-of-Customer report for leadership.

PERIOD: ${start.toDateString()} to ${end.toDateString()}

STATS (use these exact numbers — do not invent your own):
- Total feedback: ${total}
- Positive: ${positive} (${Math.round((positive / total) * 100)}%)
- Neutral: ${neutral} (${Math.round((neutral / total) * 100)}%)
- Negative: ${negative} (${Math.round((negative / total) * 100)}%)

TOP THEMES:
${topThemes.map((t, i) => `${i + 1}. ${t.name} — ${t.count} mentions`).join("\n")}

NOTABLE NEGATIVE FEEDBACK:
${negativeQuotes.map((q, i) => `${i + 1}. "${q}"`).join("\n")}

NOTABLE POSITIVE FEEDBACK:
${positiveQuotes.map((q, i) => `${i + 1}. "${q}"`).join("\n")}

Write a professional Voice-of-Customer report with these sections:
1. Executive Summary (2-3 sentences)
2. Sentiment Overview (use the exact numbers above)
3. Top Themes (summarise each theme briefly)
4. Notable Customer Quotes (include the actual quotes)
5. Recommended Actions (3-5 specific actions based on the feedback)

Keep it professional and concise — something a Head of Product could forward to leadership.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

     const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
     const content = text ?? "Could not generate report.";

    // 4. Save report to database
    const report = await db.report.create({
  data: {
    title: title ?? `VoC Report — ${start.toDateString()} to ${end.toDateString()}`,
    periodStart: start,
    periodEnd: end,
    contentJson: {
      content,
      stats: { total, positive, negative, neutral },
      topThemes,
    },
    workspaceId,
    generatedBy: session.user.id,
  },
});

    return NextResponse.json({ success: true, report });
  } catch (err) {
    console.error("Report generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reports = await db.report.findMany({
    where: { workspaceId: session.user.workspaceId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      periodStart: true,
      periodEnd: true,
      createdAt: true,
      generatedBy: true,
    },
  });

  return NextResponse.json({ reports });
}