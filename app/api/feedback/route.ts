import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

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

  const feedback = await db.feedback.findMany({
    where: { workspaceId: session.user.workspaceId }, // always filter by workspace
    orderBy: { createdAt: "desc" },
  })

  return Response.json(feedback)
}