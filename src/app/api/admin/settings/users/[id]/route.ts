import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/settings/users/[id]
 * Update a user's role or active status.
 * Body: { role?, isActive? }
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { role, isActive } = body as { role?: string; isActive?: boolean };

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent disabling yourself
    if (isActive === false && user.role === "SUPER_ADMIN") {
      // Count active super admins
      const superAdminCount = await prisma.user.count({
        where: { role: "SUPER_ADMIN", isActive: true },
      });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot disable the only Super Admin" },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (role !== undefined) {
      const validRoles = ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "ORDER_MANAGER"];
      if (validRoles.includes(role)) {
        updateData.role = role;
      }
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/settings/users/[id]
 * Delete a user.
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting the last super admin
    if (user.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({
        where: { role: "SUPER_ADMIN", isActive: true },
      });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the only Super Admin" },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
