import { NextRequest, NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";

export async function GET() {
  const events = await safeQuery(
    () =>
      prisma.cateringEvent.findMany({
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { requests: true } } },
      }),
    [],
  );

  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, slug, description, icon, sortOrder } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
  }

  const result = await safeQuery(
    async () => {
      const event = await prisma.cateringEvent.create({
        data: {
          name,
          slug,
          description: description || null,
          icon: icon || null,
          sortOrder: sortOrder || 0,
        },
        include: { _count: { select: { requests: true } } },
      });
      return event;
    },
    null,
  );

  if (!result) {
    return NextResponse.json({ error: "Failed to create event type." }, { status: 500 });
  }

  return NextResponse.json(result, { status: 201 });
}
