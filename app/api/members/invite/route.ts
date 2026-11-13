import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can invite members" },
        { status: 403 }
      );
    }

    const workspaceId = (session.user as any).workspaceId;
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace not found for current user" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, email, role, password } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const validRoles = ["ADMIN", "ANALYST", "VIEWER"];
    const memberRole = validRoles.includes(role) ? (role as "ADMIN" | "ANALYST" | "VIEWER") : "ANALYST";

    const memberPassword = (typeof password === "string" && password.trim()) ? password.trim() : "password123";
    const passwordHash = await bcrypt.hash(memberPassword, 10);

    const newMember = await db.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        passwordHash,
        role: memberRole,
        workspaceId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error: any) {
    console.error("Error creating team member:", error);
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
}
