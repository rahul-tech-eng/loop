import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const simulatedData: Record<string, { content: string; customerLabel: string }[]> = {
  SUPPORT: [
    { content: "I cannot reset my password, the email never arrives.", customerLabel: "Alice M." },
    { content: "The app crashes every time I open the reports tab.", customerLabel: "Bob K." },
    { content: "Billing charged me twice this month, please refund.", customerLabel: "Carol P." },
    { content: "I cannot delete my account, the button does nothing.", customerLabel: "David L." },
    { content: "Two factor authentication is not working on my phone.", customerLabel: "Emma R." },
  ],
  APP_STORE: [
    { content: "Best app I have used in years, incredibly intuitive.", customerLabel: "AppUser1" },
    { content: "Crashes on iOS 17, please fix urgently.", customerLabel: "AppUser2" },
    { content: "Love the new update but dark mode is still missing.", customerLabel: "AppUser3" },
    { content: "Five stars, the team behind this is doing great work.", customerLabel: "AppUser4" },
    { content: "Too many bugs in the latest release, reverting to old version.", customerLabel: "AppUser5" },
  ],
  NPS: [
    { content: "Would definitely recommend to my colleagues, very powerful tool.", customerLabel: "NPS001" },
    { content: "Good product but onboarding needs to be much simpler.", customerLabel: "NPS002" },
    { content: "The mobile experience is way behind the desktop version.", customerLabel: "NPS003" },
    { content: "Support team is excellent, always helpful and fast.", customerLabel: "NPS004" },
    { content: "Pricing is too high for small teams, need a cheaper plan.", customerLabel: "NPS005" },
  ],
  SOCIAL: [
    { content: "Just switched to this tool and already saving 2 hours a week.", customerLabel: "twitter_user1" },
    { content: "Why is there no dark mode yet? Come on team!", customerLabel: "twitter_user2" },
    { content: "The export feature is a game changer for our workflow.", customerLabel: "twitter_user3" },
    { content: "Having issues with SSO login, anyone else seeing this?", customerLabel: "twitter_user4" },
    { content: "Customer support responded in under 10 minutes. Impressed!", customerLabel: "twitter_user5" },
  ],
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
  })
  if (!user || user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { channel } = await req.json()

  if (!channel || !simulatedData[channel]) {
    return NextResponse.json({ error: "Invalid channel" }, { status: 400 })
  }

  const data = simulatedData[channel].map((item) => ({
    content: item.content,
    channel: channel as any,
    customerLabel: item.customerLabel,
    status: "NEW" as any,
    workspaceId: user.workspaceId,
    createdAt: new Date(),
  }))

  const result = await db.feedback.createMany({
    data,
    skipDuplicates: true,
  })

  return NextResponse.json({ seeded: result.count, channel })
}