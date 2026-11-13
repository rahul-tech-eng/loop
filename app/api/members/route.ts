import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const userRole = (session.user as any).role;
  if (userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const workspaceId = (session.user as any).workspaceId;

  const members = await db.user.findMany({
    where: { workspaceId },  // ← always scoped by workspaceId
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(members);
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const workspaceId = (session.user as any).workspaceId;

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can remove members" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    let memberId = searchParams.get("id");

    if (!memberId) {
      try {
        const body = await req.json();
        memberId = body?.memberId || body?.id;
      } catch {
        // empty body
      }
    }

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    if (memberId === currentUserId) {
      return NextResponse.json(
        { error: "You cannot remove yourself from the team" },
        { status: 400 }
      );
    }

    // Verify member exists in the same workspace
    const member = await db.user.findFirst({
      where: { id: memberId, workspaceId },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found in your workspace" },
        { status: 404 }
      );
    }

    // Safely delete member and any related reports
    await db.$transaction([
      db.report.deleteMany({ where: { generatedBy: memberId } }),
      db.user.delete({ where: { id: memberId } }),
    ]);

    return NextResponse.json({ success: true, message: "Member removed successfully" });
  } catch (error: any) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}

export { POST } from "./invite/route";