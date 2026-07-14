 import { PrismaClient, Channel, Sentiment, Status } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  console.log("Seeding...")

  // Clean existing data first
  await db.feedback.deleteMany()
  await db.theme.deleteMany()
  await db.user.deleteMany()
  await db.workspace.deleteMany()

  const workspace = await db.workspace.create({
    data: { name: "Acme Corp" },
  })

  const hash = await bcrypt.hash("password123", 10)

  await db.user.createMany({
    data: [
      { name: "Alice Admin",  email: "admin@acme.com",   passwordHash: hash, role: "ADMIN",   workspaceId: workspace.id },
      { name: "Bob Analyst",  email: "analyst@acme.com", passwordHash: hash, role: "ANALYST", workspaceId: workspace.id },
      { name: "Carol Viewer", email: "viewer@acme.com",  passwordHash: hash, role: "VIEWER",  workspaceId: workspace.id },
    ],
  })

  await db.theme.createMany({
    data: [
      { name: "Onboarding", color: "#6366f1", workspaceId: workspace.id },
      { name: "Performance", color: "#10b981", workspaceId: workspace.id },
      { name: "Billing",     color: "#f59e0b", workspaceId: workspace.id },
      { name: "Mobile",      color: "#ef4444", workspaceId: workspace.id },
      { name: "SSO / Auth",  color: "#3b82f6", workspaceId: workspace.id },
    ],
  })

  await db.feedback.create({
    data: {
      content: "Onboarding took forever, couldn't figure out how to invite my team.",
      channel: Channel.SUPPORT_TICKET,
      sentiment: Sentiment.NEG,
      sentimentScore: -0.8,
      status: Status.NEW,
      workspaceId: workspace.id,
    },
  })

  console.log("Seed complete!")
  console.log("  admin@acme.com / password123")
  console.log("  analyst@acme.com / password123")
  console.log("  viewer@acme.com / password123")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())