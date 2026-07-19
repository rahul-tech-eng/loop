import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { any, z } from "zod"

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

  const feedback = await db.feedback.create({
  data: {
    content: parsed.data.content,
    channel: parsed.data.channel as any,
    customerLabel: parsed.data.customerLabel ?? null,
    workspaceId: session.user.workspaceId,
    status: "NEW",
  }
})

  return Response.json(feedback)
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