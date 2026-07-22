"use client"

import { useEffect, useState } from "react"

interface FeedbackItem {
  id: string
  content: string
  sentiment: string
  channel: string
  status: string
  createdAt: string
  confidence: number
}

interface Theme {
  id: string
  name: string
  color: string
  count: number
  feedbacks: FeedbackItem[]
}

const SENTIMENT_COLORS: Record<string, string> = {
  POSITIVE: "text-green-600",
  NEUTRAL: "text-gray-400",
  NEGATIVE: "text-red-500",
}

export default function ThemeList() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)

  useEffect(() => {
    fetch("/api/themes")
      .then((r) => r.json())
      .then((data) => {
        setThemes(data.themes ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-center py-8 text-gray-400 text-sm">Loading themes...</div>
  }

  if (themes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No themes yet — classify some feedback first.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Theme list */}
      <div className="md:col-span-1 space-y-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setSelectedTheme(theme)}
            className={`w-full text-left p-4 rounded-xl border transition-all
              ${selectedTheme?.id === theme.id
                ? "border-indigo-300 bg-indigo-50"
                : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="text-sm font-medium text-gray-900">
                  {theme.name}
                </span>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {theme.count}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Drill-down panel */}
      <div className="md:col-span-2">
        {!selectedTheme ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm
            border border-gray-200 rounded-xl">
            Select a theme to see its feedback
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedTheme.color }}
              />
              <h2 className="text-base font-semibold text-gray-900">
                {selectedTheme.name}
              </h2>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {selectedTheme.count} items
              </span>
            </div>

            <div className="space-y-3">
              {selectedTheme.feedbacks.length === 0 ? (
                <p className="text-sm text-gray-400">No feedback in this theme yet.</p>
              ) : (
                selectedTheme.feedbacks.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-100 rounded-lg p-3"
                  >
                    <p className="text-sm text-gray-800 mb-2">{item.content}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{item.channel}</span>
                      <span>· {new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.sentiment && (
                        <span className={`font-medium ${SENTIMENT_COLORS[item.sentiment]}`}>
                          · {item.sentiment}
                        </span>
                      )}
                      <span className="ml-auto text-indigo-400">
                        {Math.round(item.confidence * 100)}% match
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}