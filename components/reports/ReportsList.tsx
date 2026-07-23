 "use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import ReportGenerator from "./ReportGenerator"

interface Report {
  id: string
  title: string
  periodStart: string
  periodEnd: string
  createdAt: string
}
 export default function ReportsList() {
  const { data: session } = useSession()
  const isViewer = session?.user?.role === "VIEWER"
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [exporting, setExporting] = useState(false)

  const fetchReports = async () => {
    const res = await fetch("/api/reports")
    const data = await res.json()
    setReports(data.reports ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchReports() }, [])

  const viewReport = async (id: string) => {
    setSelectedId(id)
    setLoadingReport(true)
    const res = await fetch(`/api/reports/${id}`)
    const data = await res.json()
    const content = data.report.contentJson
    setSelectedReport({ ...data.report, ...content })
    setLoadingReport(false)
  }

  const exportPDF = async () => {
    if (!selectedReport) return
    setExporting(true)

    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    // Title
    doc.setFontSize(20)
    doc.setTextColor(79, 70, 229)
    doc.text("LOOP — Voice of Customer Report", 20, 20)

    // Report title
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(selectedReport.title, 20, 35)

    // Period
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `Period: ${new Date(selectedReport.periodStart).toDateString()} — ${new Date(selectedReport.periodEnd).toDateString()}`,
      20, 45
    )

    // Stats
    if (selectedReport.stats) {
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text("Summary Stats", 20, 60)
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Total Feedback: ${selectedReport.stats.total}`, 20, 70)
      doc.text(`Positive: ${selectedReport.stats.positive}`, 20, 78)
      doc.text(`Neutral: ${selectedReport.stats.neutral}`, 20, 86)
      doc.text(`Negative: ${selectedReport.stats.negative}`, 20, 94)
    }

    // Report content
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Report", 20, 110)
    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)

    // Split long text into lines
    const lines = doc.splitTextToSize(selectedReport.content ?? "", 170)
    doc.text(lines, 20, 120)

    // Save
    doc.save(`${selectedReport.title ?? "report"}.pdf`)
    setExporting(false)
  }

  const copyShareLink = () => {
    if (!selectedId) return
    const url = `${window.location.origin}/reports/${selectedId}`
    navigator.clipboard.writeText(url)
    alert("Link copied to clipboard!")
  }

  return (
    <div className="space-y-6">
      {!isViewer && <ReportGenerator onGenerated={fetchReports} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reports list */}
        <div className="md:col-span-1 space-y-3">
          <h2 className="text-sm font-medium text-gray-700">Saved Reports</h2>
          {loading && <p className="text-sm text-gray-400">Loading...</p>}
          {!loading && reports.length === 0 && (
            <p className="text-sm text-gray-400">
              No reports yet — generate one above.
            </p>
          )}
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => viewReport(report.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all
                ${selectedId === report.id
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
            >
              <p className="text-sm font-medium text-gray-900 truncate">
                {report.title}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>

        {/* Report content */}
        <div className="md:col-span-2">
          {!selectedId && (
            <div className="flex items-center justify-center h-48
              border border-gray-200 rounded-xl text-gray-400 text-sm">
              Select a report to view it
            </div>
          )}
          {loadingReport && (
            <div className="flex items-center justify-center h-48
              border border-gray-200 rounded-xl text-gray-400 text-sm">
              Loading report...
            </div>
          )}
          {selectedReport && !loadingReport && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              {/* Header with export buttons */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedReport.title}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(selectedReport.periodStart).toDateString()} —{" "}
                    {new Date(selectedReport.periodEnd).toDateString()}
                  </p>
                </div>
                {/* Export buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={copyShareLink}
                    className="text-xs px-3 py-1.5 border border-gray-200
                      rounded-lg hover:bg-gray-50 text-gray-600"
                  >
                    🔗 Copy Link
                  </button>
                  <button
                    onClick={exportPDF}
                    disabled={exporting}
                    className="text-xs px-3 py-1.5 bg-indigo-600 text-white
                      rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {exporting ? "Exporting..." : "⬇ Export PDF"}
                  </button>
                </div>
              </div>

              {/* Stats */}
              {selectedReport.stats && (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedReport.stats.total}
                    </p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-green-600">
                      {selectedReport.stats.positive}
                    </p>
                    <p className="text-xs text-gray-500">Positive</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-gray-500">
                      {selectedReport.stats.neutral}
                    </p>
                    <p className="text-xs text-gray-500">Neutral</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-red-500">
                      {selectedReport.stats.negative}
                    </p>
                    <p className="text-xs text-gray-500">Negative</p>
                  </div>
                </div>
              )}

              {/* Report content */}
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700
                  font-sans leading-relaxed">
                  {selectedReport.content}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}