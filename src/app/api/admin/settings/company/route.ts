import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/settings/company
 * Returns all site settings grouped by group.
 */
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: "asc" },
    });

    // Group by category
    const grouped: Record<string, { key: string; value: unknown }[]> = {};
    for (const s of settings) {
      const group = s.group || "general";
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push({ key: s.key, value: s.value });
    }

    return NextResponse.json({ settings: grouped });
  } catch {
    return NextResponse.json({ settings: {} });
  }
}

/**
 * PUT /api/admin/settings/company
 * Update multiple site settings at once.
 * Body: { settings: { key: value, ... } }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body as { settings: Record<string, string> };

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const updates = Object.entries(settings).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value, group: key.startsWith("social_") ? "social" : key.startsWith("notif_") ? "notifications" : key.startsWith("contact_") ? "contact" : key.startsWith("site_") ? "general" : "general" },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
