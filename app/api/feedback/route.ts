 import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { classifyFeedback } from "@/lib/ai"
import { Sentiment } from "@prisma/client"

const schema = z.object({
  content: z.string().min(1),
  channel: z.enum(["SUPPORT", "APP_STORE", "NPS", "SALES", "SOCIAL"]),
  customerLabel: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 })

  // Create feedback first
  const feedback = await db.feedback.create({
    data: {
      content: parsed.data.content,
      channel: parsed.data.channel as any,
      customerLabel: parsed.data.customerLabel ?? null,
      workspaceId: session.user.workspaceId,
      status: "NEW",
    }
  })

  // Auto-classify after creation
  try {
    const themes = await db.theme.findMany({
      where: { workspaceId: session.user.workspaceId },
      select: { name: true },
    })
    const themeNames = themes.map((t) => t.name)

    const result = await classifyFeedback(feedback.content, themeNames)

    const sentimentMap: Record<string, Sentiment> = {
      POSITIVE: Sentiment.POSITIVE,
      NEUTRAL: Sentiment.NEUTRAL,
      NEGATIVE: Sentiment.NEGATIVE,
    }

    await db.feedback.update({
      where: { id: feedback.id },
      data: {
        sentiment: sentimentMap[result.sentiment] ?? Sentiment.NEUTRAL,
        sentimentScore: result.sentimentScore,
      },
    })

    // Link themes
    for (const themeName of result.themes) {
      let theme = await db.theme.findFirst({
        where: { name: themeName, workspaceId: session.user.workspaceId },
      })

      if (!theme) {
        theme = await db.theme.create({
          data: {
            name: themeName,
            workspaceId: session.user.workspaceId,
            color: randomColor(),
          },
        })
      }

      await db.feedbackTheme.upsert({
        where: {
          feedbackId_themeId: {
            feedbackId: feedback.id,
            themeId: theme.id,
          },
        },
        update: { confidence: Math.abs(result.sentimentScore) },
        create: {
          feedbackId: feedback.id,
          themeId: theme.id,
          confidence: Math.abs(result.sentimentScore),
        },
      })
    }
  } catch (err) {
    // Don't fail the whole request if classification fails
    console.error("Auto-classification failed:", err)
  }

  return Response.json(feedback)
}

function randomColor() {
  const colors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6"]
  return colors[Math.floor(Math.random() * colors.length)]
}

 export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
  })
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "10")
  const search = searchParams.get("search") ?? ""
  const channel = searchParams.get("channel") ?? ""
  const sentiment = searchParams.get("sentiment") ?? ""
  const status = searchParams.get("status") ?? ""
  const dateFrom = searchParams.get("dateFrom") ?? ""
  const dateTo = searchParams.get("dateTo") ?? ""

  const skip = (page - 1) * limit

  const where: any = {
    workspaceId: user.workspaceId,
    ...(search && {
      content: { contains: search, mode: "insensitive" },
    }),
  ...(channel && { channel: channel as any }),
  ...(sentiment && { sentiment: sentiment as any }),
  ...(status && { status: status as any }),
  ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : {}),
  }

  const [feedback, total] = await Promise.all([
    db.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.feedback.count({ where }),
  ])

  return Response.json({
    feedback,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}