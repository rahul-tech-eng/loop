"use client"

import { useState } from "react"

interface Source {
  id: string
  content: string
  channel: string
  sentiment: string
  createdAt: string
}

interface Answer {
  answer: string
  sources: Source[]
}

const SENTIMENT_COLORS: Record<string, string> = {
  POSITIVE: "text-green-600",
  NEUTRAL: "text-gray-400",
  NEGATIVE: "text-red-500",
}

const SUGGESTED_QUESTIONS = [
  "What are users saying about onboarding?",
  "What features are users requesting most?",
  "What are the most common complaints?",
  "What do users love about the product?",
]

export default function AskLoop() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const ask = async (q?: string) => {
    const finalQuestion = q ?? question
    if (!finalQuestion.trim()) return

    setLoading(true)
    setError("")
    setAnswer(null)

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: finalQuestion }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setAnswer(data)
      }
    } catch {
      setError("Something went wrong. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Question input */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="Ask a question about your feedback..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={() => ask()}
            disabled={loading || !question.trim()}
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm rounded-lg
              hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>

        {/* Suggested questions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => { setQuestion(q); ask(q) }}
              className="text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5
                rounded-full hover:bg-indigo-100 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Searching feedback and generating answer...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Answer */}
      {answer && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
            <p className="text-xs text-indigo-500 font-medium mb-2">ANSWER</p>
            <p className="text-sm text-gray-800 leading-relaxed">{answer.answer}</p>
          </div>

          {/* Sources */}
          {answer.sources.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-500 font-medium mb-3">
                BASED ON {answer.sources.length} FEEDBACK ITEMS
              </p>
              <div className="space-y-3">
                {answer.sources.map((source, i) => (
                  <div
                    key={source.id}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-xs text-gray-400 font-medium mt-0.5">
                      [{i + 1}]
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{source.content}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>{source.channel}</span>
                        <span>·</span>
                        <span>{new Date(source.createdAt).toLocaleDateString()}</span>
                        {source.sentiment && (
                          <>
                            <span>·</span>
                            <span className={SENTIMENT_COLORS[source.sentiment]}>
                              {source.sentiment}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}