"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

const CHANNELS = [
  { key: "SUPPORT", label: "Support Tickets", icon: "🎫" },
  { key: "APP_STORE", label: "App Store Reviews", icon: "⭐" },
  { key: "NPS", label: "NPS Survey", icon: "📊" },
  { key: "SOCIAL", label: "Social Mentions", icon: "💬" },
]

interface Props {
  onSuccess?: () => void
}

export default function SimulateChannel({ onSuccess }: Props) {
  const { data: session } = useSession()
const isViewer = session?.user?.role === "VIEWER"
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, number>>({})

  const simulate = async (channel: string) => {
    setLoading(channel)
    try {
      const res = await fetch("/api/feedback/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      })
      const data = await res.json()
      if (res.ok) {
        setResults((prev) => ({ ...prev, [channel]: data.seeded }))
        onSuccess?.()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
    if (isViewer) return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Simulate Channel
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Pull in realistic feedback from a simulated source.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {CHANNELS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => simulate(key)}
            disabled={loading === key}
            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg
              hover:bg-indigo-50 hover:border-indigo-300 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <span className="text-xl">{icon}</span>
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              {results[key] !== undefined && (
                <p className="text-xs text-green-600">
                  ✓ {results[key]} items added
                </p>
              )}
              {loading === key && (
                <p className="text-xs text-gray-400">Loading...</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}