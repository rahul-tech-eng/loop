"use client"
import { useState } from "react"

export default function FeedbackForm ({ onSuccess }: { onSuccess: () => void }) {
  const [content, setContent] = useState("")
  const [channel, setChannel] = useState("SUPPORT")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, channel }),
    })
    setContent("")
    setLoading(false)
    onSuccess()
  }

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg">
      <textarea
        className="border rounded p-2 w-full"
        placeholder="Enter feedback..."
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
      />
      <select
        className="border rounded p-2"
        value={channel}
        onChange={e => setChannel(e.target.value)}
      >
        <option value="SUPPORT">Support Ticket</option>
        <option value="APP_STORE">App Store</option>
        <option value="NPS">NPS Survey</option>
        <option value="SALES">Sales Call</option>
        <option value="SOCIAL">Social</option>
      </select>
      <button
        className="bg-indigo-600 text-white rounded px-4 py-2 disabled:opacity-50"
        onClick={handleSubmit}
        disabled={loading || !content}
      >
        {loading ? "Saving..." : "Add Feedback"}
      </button>
    </div>
  )
}