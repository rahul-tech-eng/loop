 export function findRelevantFeedback(
  question: string,
  feedbackItems: { id: string; content: string }[],
  topK: number = 5
): string[] {
  const keywords = question
    .toLowerCase()
    .split(" ")
    .filter((w) => w.length > 3);

  const scored = feedbackItems.map((f) => {
    const content = f.content.toLowerCase();
    const score = keywords.reduce((sum, keyword) => {
      return sum + (content.includes(keyword) ? 1 : 0);
    }, 0);
    return { id: f.id, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.id);
}