import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/settings/notifications
 * Returns notification preference toggles.
 */
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { group: "notifications" },
    });

    const preferences: Record<string, boolean> = {};
    for (const s of settings) {
      preferences[s.key] = s.value === "true" || s.value === true;
    }

    return NextResponse.json({ preferences });
  } catch {
    return NextResponse.json({ preferences: {} });
  }
}

/**
 * PUT /api/admin/settings/notifications
 * Update notification preferences.
 * Body: { preferences: { key: boolean, ... } }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { preferences } = body as { preferences: Record<string, boolean> };

    if (!preferences || typeof preferences !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const updates = Object.entries(preferences).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value), group: "notifications" },
        create: { key, value: String(value), group: "notifications" },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}
