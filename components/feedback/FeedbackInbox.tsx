 "use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"

interface FeedbackItem {
  id: string
  content: string
  channel: string
  sentiment: string
  status: string
  createdAt: string
  customerLabel: string | null
}

const STATUS_NEXT: Record<string, string> = {
  NEW: "REVIEWED",
  REVIEWED: "ACTIONED",
  ACTIONED: "NEW",
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  REVIEWED: "bg-yellow-100 text-yellow-700",
  ACTIONED: "bg-green-100 text-green-700",
}

const SENTIMENT_COLORS: Record<string, string> = {
  POS: "text-green-600",
  NEU: "text-gray-400",
  NEG: "text-red-500",
}

export default function FeedbackInbox() {
  const { data: session } = useSession()
const isViewer = session?.user?.role === "VIEWER"
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
 // search
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")

  // filters
  const [channel, setChannel] = useState("")
  const [sentiment, setSentiment] = useState("")
  const [status, setStatus] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const [reclassifyingId, setReclassifyingId] = useState<string | null>(null)

const reclassify = async (feedbackId: string) => {
  setReclassifyingId(feedbackId)
  await fetch("/api/feedback/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feedbackId }),
  })
  await fetchFeedback()
  setReclassifyingId(null)
}
  const fetchFeedback = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
      ...(search && { search }),
      ...(channel && { channel }),
      ...(sentiment && { sentiment }),
      ...(status && { status }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    })
    const res = await fetch(`/api/feedback?${params}`)
    const data = await res.json()
    setItems(data.feedback ?? [])
    setTotal(data.total ?? 0)
    setTotalPages(data.totalPages ?? 1)
    setLoading(false)
  }, [page, search, channel, sentiment, status, dateFrom, dateTo])

  useEffect(() => { fetchFeedback() }, [fetchFeedback])

  const handleSearch = () => {
    setSearch(searchInput.trim().replace(/"/g, ""))
    setPage(1)
  }

  const clearFilters = () => {
    setChannel("")
    setSentiment("")
    setStatus("")
    setDateFrom("")
    setDateTo("")
    setSearch("")
    setSearchInput("")
    setPage(1)
  }

  const hasActiveFilters = channel || sentiment || status || dateFrom || dateTo || search

  const updateStatus = async (id: string, currentStatus: string) => {
     if (isViewer) return 
    setUpdatingId(id)
    const nextStatus = STATUS_NEXT[currentStatus]
    await fetch(`/api/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    })
    await fetchFeedback()
    setUpdatingId(null)
    
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Feedback Inbox</h2>
          <p className="text-sm text-gray-500">{total} total items</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`text-sm px-3 py-1.5 rounded-lg border transition-colors
            ${showFilters
              ? "bg-indigo-50 border-indigo-300 text-indigo-700"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
        >
          🔽 Filters {hasActiveFilters && <span className="ml-1 text-indigo-600 font-bold">•</span>}
        </button>
      </div>

      {/* search */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Search feedback..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg
            hover:bg-indigo-700 transition-colors"
        >
          Search
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-500 border border-gray-200
              rounded-lg hover:bg-gray-50"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 p-4
          bg-gray-50 rounded-lg border border-gray-100">

          {/* Channel */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Channel</label>
            <select
              value={channel}
              onChange={(e) => { setChannel(e.target.value); setPage(1) }}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5
                text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">All channels</option>
              <option value="SUPPORT">Support</option>
              <option value="APP_STORE">App Store</option>
              <option value="NPS">NPS Survey</option>
              <option value="SOCIAL">Social</option>
              <option value="CSV">CSV Import</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>

          {/* Sentiment */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Sentiment</label>
            <select
              value={sentiment}
              onChange={(e) => { setSentiment(e.target.value); setPage(1) }}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5
                text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">All sentiments</option>
              <option value="POSITIVE">Positive</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="NEGATIVE">Negative</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5
                text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">All statuses</option>
              <option value="NEW">New</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="ACTIONED">Actioned</option>
            </select>
          </div>

          {/* date */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date from</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5
                text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date to</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5
                text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
      )}

      
      {loading && (
        <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
      )}

      
      {!loading && items.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No feedback found. Try adjusting your filters.
        </div>
      )}

      {/* Feedbacklist */}
      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-100 rounded-lg p-4 flex flex-col gap-2
                hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-gray-800 flex-1">{item.content}</p>
                 
                {!isViewer ? (
                  <button
                    onClick={() => updateStatus(item.id, item.status)}
                    disabled={updatingId === item.id}
                    className={`text-xs px-2 py-1 rounded-full font-medium shrink-0
                      ${STATUS_COLORS[item.status]} hover:opacity-80 transition-opacity
                      disabled:opacity-50 cursor-pointer`}
                  >
                    {updatingId === item.id ? "..." : item.status}
                  </button>
                ) : (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0
                    ${STATUS_COLORS[item.status]}`}>
                    {item.status}
                  </span>
                )}

                
                {!isViewer && (
                  <button
                    onClick={() => reclassify(item.id)}
                    disabled={reclassifyingId === item.id}
                    className="text-xs px-2 py-1 rounded-full font-medium shrink-0
                    bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors
                    disabled:opacity-50 cursor-pointer">
                    {reclassifyingId === item.id ? "..." : "Re-classify"}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{item.channel}</span>
                {item.customerLabel && <span>· {item.customerLabel}</span>}
                <span>· {new Date(item.createdAt).toLocaleDateString()}</span>
                {item.sentiment && (
                  <span className={`font-medium ${SENTIMENT_COLORS[item.sentiment]}`}>
                    · {item.sentiment}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* pagintion */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg
              hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
        
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg
              hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}