import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";
import { findRelevantFeedback } from "@/lib/search";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question } = await req.json();
  if (!question) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const workspaceId = session.user.workspaceId;

  // Get all feedback for this workspace
  const allFeedback = await db.feedback.findMany({
    where: { workspaceId },
    select: {
      id: true,
      content: true,
      channel: true,
      sentiment: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Find most relevant feedback using keyword search
  const relevantIds =  findRelevantFeedback(
    question,
    allFeedback,
    5
  );

   // Get the actual relevant feedback items
  const relevantFeedback = allFeedback.filter((f) =>
    relevantIds.includes(f.id)
  );

  // Fallback to first 5 if no relevant found
  const contextFeedback =
    relevantFeedback.length > 0 ? relevantFeedback : allFeedback.slice(0, 5);

  // Build context for Gemini
  const context = contextFeedback
    .map((f, i) => `[${i + 1}] "${f.content}" (${f.channel}, ${f.sentiment ?? "unclassified"})`)
    .join("\n");

  const prompt = `You are a product analyst answering questions about customer feedback.

Answer ONLY based on the feedback provided below. If the answer is not in the feedback, say "I don't have enough feedback data to answer this question."

Customer feedback:
${context}

Question: ${question}

Give a clear, concise answer in 2-3 sentences. Reference specific feedback items by their number [1], [2], etc.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const answer = response.text ?? "Could not generate an answer.";

    return NextResponse.json({
      answer,
      sources: contextFeedback.map((f) => ({
        id: f.id,
        content: f.content,
        channel: f.channel,
        sentiment: f.sentiment,
        createdAt: f.createdAt,
      })),
    });
  } catch (err) {
    console.error("Ask LOOP failed:", err);
    return NextResponse.json(
      { error: "Failed to generate answer —  quota may be exceeded" },
      { status: 500 }
    );
  }
}