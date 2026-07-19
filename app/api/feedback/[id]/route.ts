 import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
  })
  if (!user || user.role === "VIEWER") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params 

  const existing = await db.feedback.findFirst({
    where: { id, workspaceId: user.workspaceId },
  })
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 })

  const { status } = await req.json()

  const validStatuses = ["NEW", "REVIEWED", "ACTIONED"]
  if (!validStatuses.includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 })
  }

  const updated = await db.feedback.update({
    where: { id },
    data: { status },
  })

  return Response.json(updated)
}