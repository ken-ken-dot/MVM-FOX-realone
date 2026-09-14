import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * GET /api/admin/settings/users
 * Returns all admin users (excluding password hashes).
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ users: [] });
  }
}

/**
 * POST /api/admin/settings/users
 * Invite a new admin user (creates a pending account with a random password).
 * Body: { email, name, role }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role } = body as {
      email: string;
      name: string;
      role: string;
    };

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Generate a temporary password (user will need to reset)
    const tempPassword = Math.random().toString(36).slice(-12) + "A1!";
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const validRoles = ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "ORDER_MANAGER"] as const;
    const userRole: "SUPER_ADMIN" | "ADMIN" | "CONTENT_MANAGER" | "ORDER_MANAGER" = validRoles.includes(role as typeof validRoles[number]) ? (role as typeof validRoles[number]) : "ADMIN";

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: userRole,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
      inviteLink: `/admin/login?invite=${user.id}`,
      tempPassword,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
