  "use client"
import FeedbackForm from "@/components/feedback/FeedbackList"
import CsvUpload from "@/components/feedback/CsvUpload"
import SimulateChannel from "@/components/feedback/SimulateChannel"
import FeedbackInbox from "@/components/feedback/FeedbackInbox"
import { useState } from "react"

export default function InboxPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => setRefreshKey((k) => k + 1)

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Feedback Inbox</h1>
      <FeedbackForm onSuccess={handleSuccess} />
      <CsvUpload onSuccess={handleSuccess} />
      <SimulateChannel onSuccess={handleSuccess} />
      <FeedbackInbox key={refreshKey} />
    </div>
  )
}