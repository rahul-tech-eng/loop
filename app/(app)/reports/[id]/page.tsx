import { db } from "@/lib/db"
import { notFound } from "next/navigation"

export default async function SharedReportPage({
  params,
}: {
  params: { id: string }
}) {
  const report = await db.report.findFirst({
    where: { id: params.id },
  })

  if (!report) notFound()

  const content = report.contentJson as any

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-6">
        <p className="text-indigo-600 font-bold text-lg">LOOP</p>
        <h1 className="text-2xl font-semibold text-gray-900 mt-1">
          {report.title}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {new Date(report.periodStart).toDateString()} —{" "}
          {new Date(report.periodEnd).toDateString()}
        </p>
      </div>

      {/* Stats */}
      {content.stats && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-lg font-semibold">{content.stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-lg font-semibold text-green-600">
              {content.stats.positive}
            </p>
            <p className="text-xs text-gray-500">Positive</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-lg font-semibold text-gray-500">
              {content.stats.neutral}
            </p>
            <p className="text-xs text-gray-500">Neutral</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-lg font-semibold text-red-500">
              {content.stats.negative}
            </p>
            <p className="text-xs text-gray-500">Negative</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <pre className="whitespace-pre-wrap text-sm text-gray-700
          font-sans leading-relaxed">
          {content.content}
        </pre>
      </div>
    </div>
  )
}