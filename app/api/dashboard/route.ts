import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
  })
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const workspaceId = user.workspaceId

  // Total feedback count
  const total = await db.feedback.count({ where: { workspaceId } })

  // New this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const newThisWeek = await db.feedback.count({
    where: { workspaceId, createdAt: { gte: weekAgo } },
  })

  // Sentiment breakdown
  const sentimentData = await db.feedback.groupBy({
    by: ["sentiment"],
    where: { workspaceId },
    _count: { sentiment: true },
  })

  // Channel breakdown
  const channelData = await db.feedback.groupBy({
    by: ["channel"],
    where: { workspaceId },
    _count: { channel: true },
  })

  // Volume over last 7 days
  const last7Days = await Promise.all(
    Array.from({ length: 7 }, async (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const start = new Date(date.setHours(0, 0, 0, 0))
      const end = new Date(date.setHours(23, 59, 59, 999))
      const count = await db.feedback.count({
        where: { workspaceId, createdAt: { gte: start, lte: end } },
      })
      return {
        date: start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        count,
      }
    })
  )

  // % negative
  const negativeCount = sentimentData.find((s) => s.sentiment === "NEGATIVE")?._count.sentiment ?? 0
  const percentNegative = total > 0 ? Math.round((negativeCount / total) * 100) : 0

  return Response.json({
    total,
    newThisWeek,
    percentNegative,
    sentimentData: sentimentData.map((s) => ({
      name: s.sentiment,
      value: s._count.sentiment,
    })),
    channelData: channelData.map((c) => ({
      name: c.channel,
      value: c._count.channel,
    })),
    volumeData: last7Days,
  })
}