 import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const ClassificationSchema = z.object({
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()),
  featureArea: z.string(),
  rationale: z.string(),
});

export type Classification = z.infer<typeof ClassificationSchema>;

export async function classifyFeedback(
  content: string,
  existingThemes: string[] = []
): Promise<Classification> {
  const themeHint =
    existingThemes.length > 0
      ? `Existing themes (reuse these where they fit): ${existingThemes.join(", ")}.`
      : "No existing themes yet — create appropriate ones.";

  const prompt = `You are a product analyst. Classify the following customer feedback.

${themeHint}

Feedback:
"${content}"

Respond with ONLY a valid JSON object — no markdown, no explanation, no code fences.

{
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "sentimentScore": number between -1.0 and 1.0,
  "themes": ["theme1", "theme2"],
  "featureArea": "short label like Onboarding, Billing, Mobile, Performance",
  "rationale": "one sentence explaining the classification"
}`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const raw = response.text ?? "";

      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      const validated = ClassificationSchema.parse(parsed);
      return validated;
    } catch (err) {
      if (attempt === 2) {
        console.error("Classification failed:", err);
        return {
          sentiment: "NEUTRAL",
          sentimentScore: 0,
          themes: ["Uncategorised"],
          featureArea: "Unknown",
          rationale: "Auto-classification failed — please review manually.",
        };
      }
    }
  }

  throw new Error("Unreachable");
}