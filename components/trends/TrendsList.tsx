"use client"

import { useEffect, useState } from "react"

interface Trend {
  id: string
  name: string
  color: string
  currentCount: number
  previousCount: number
  spike: number
  isSpiking: boolean
  total: number
}

export default function TrendsList() {
  const [trends, setTrends] = useState<Trend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/trends")
      .then((r) => r.json())
      .then((data) => {
        setTrends(data.trends ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-center py-8 text-gray-400 text-sm">Loading trends...</div>
  }

  if (trends.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No trends yet — classify some feedback first.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Themes</p>
          <p className="text-2xl font-semibold text-gray-900">{trends.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Spiking Themes</p>
          <p className="text-2xl font-semibold text-red-500">
            {trends.filter((t) => t.isSpiking).length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Active This Week</p>
          <p className="text-2xl font-semibold text-indigo-600">
            {trends.filter((t) => t.currentCount > 0).length}
          </p>
        </div>
      </div>

      {/* Spiking themes banner */}
      {trends.some((t) => t.isSpiking) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-red-700 mb-2">
            🔺 Spiking themes this week
          </p>
          <div className="flex flex-wrap gap-2">
            {trends
              .filter((t) => t.isSpiking)
              .map((t) => (
                <span
                  key={t.id}
                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full"
                >
                  {t.name} +{t.spike}%
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Trends table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Theme</th>
              <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">This week</th>
              <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Last week</th>
              <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Change</th>
              <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trends.map((trend) => (
              <tr key={trend.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: trend.color }}
                    />
                    <span className="font-medium text-gray-900">{trend.name}</span>
                    {trend.isSpiking && (
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                        🔺 spike
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-gray-700">
                  {trend.currentCount}
                </td>
                <td className="px-4 py-3 text-center text-gray-400">
                  {trend.previousCount}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full
                      ${trend.spike > 0
                        ? "bg-red-100 text-red-600"
                        : trend.spike < 0
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {trend.spike > 0 ? "+" : ""}{trend.spike}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-500">
                  {trend.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}