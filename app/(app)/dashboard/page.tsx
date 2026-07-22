 "use client"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from "recharts"

const SENTIMENT_COLORS: Record<string, string> = {
  POSITIVE: "#22c55e",
  NEUTRAL: "#94a3b8",
  NEGATIVE: "#ef4444",
}

const CHANNEL_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"]

interface DashboardData {
  total: number
  newThisWeek: number
  percentNegative: number
  sentimentData: { name: string; value: number }[]
  channelData: { name: string; value: number }[]
  volumeData: { date: string; count: number }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading dashboard...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Failed to load dashboard.
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your customer feedback</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Total Feedback</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{data.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">New This Week</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{data.newThisWeek}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">% Negative</p>
          <p className={`text-3xl font-bold mt-1 ${data.percentNegative > 30 ? "text-red-500" : "text-green-500"}`}>
            {data.percentNegative}%
          </p>
        </div>
      </div>

      {/* Volume over time */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Feedback Volume — Last 7 Days
        </h2>
        {data.volumeData.every((d) => d.count === 0) ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No feedback in the last 7 days.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sentiment + Channel charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Sentiment pie chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Sentiment Breakdown
          </h2>
          {data.sentimentData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet.</p>
          ) : (
             <ResponsiveContainer width="100%" height={220}>
  <PieChart>
    <Pie
      data={data.sentimentData}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={80}
      label
    >
      {data.sentimentData.map((entry, index) => (
        <Cell
          key={index}
          fill={SENTIMENT_COLORS[entry.name] ?? "#94a3b8"}
        />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
          )}
        </div>

        {/* Channel bar chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Feedback by Channel
          </h2>
          {data.channelData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.channelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {data.channelData.map((_, index) => (
                    <Cell key={index} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}