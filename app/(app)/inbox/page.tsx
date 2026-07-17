"use client"
import { useEffect, useState } from "react"
import FeedbackForm from "@/components/FeedbackForm"

export default function InboxPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchFeedback() {
    setLoading(true)
    const res = await fetch("/api/feedback")
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { fetchFeedback() }, [])

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Feedback Inbox</h1>
      <FeedbackForm onSuccess={fetchFeedback} />

      {loading && <p className="text-gray-500">Loading...</p>}
      {!loading && items.length === 0 && (
        <p className="text-gray-400">No feedback yet. Add some above!</p>
      )}
      {items.map((item: any) => (
        <div key={item.id} className="border rounded-lg p-4 flex flex-col gap-1">
          <p className="text-sm text-gray-500">{item.channel} · {new Date(item.createdAt).toLocaleDateString()}</p>
          <p>{item.content}</p>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded w-fit">{item.status}</span>
        </div>
      ))}
    </div>
  )
}