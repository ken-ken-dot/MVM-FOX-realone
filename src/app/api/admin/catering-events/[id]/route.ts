import { NextRequest, NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { name, slug, description, icon, sortOrder } = body;

  const result = await safeQuery(
    async () => {
      const existing = await prisma.cateringEvent.findUnique({ where: { id } });
      if (!existing) return null;

      return prisma.cateringEvent.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(slug !== undefined && { slug }),
          ...(description !== undefined && { description: description || null }),
          ...(icon !== undefined && { icon: icon || null }),
          ...(sortOrder !== undefined && { sortOrder: parseInt(String(sortOrder), 10) }),
        },
        include: { _count: { select: { requests: true } } },
      });
    },
    null,
  );

  if (!result) {
    return NextResponse.json({ error: "Event type not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const result = await safeQuery(
    async () => {
      const requestCount = await prisma.cateringRequest.count({
        where: { eventTypeId: id },
      });
      if (requestCount > 0) {
        throw new Error("Cannot delete an event type that has existing requests.");
      }
      // Unlink packages
      await prisma.cateringPackage.updateMany({
        where: { eventTypeId: id },
        data: { eventTypeId: null },
      });
      await prisma.cateringEvent.delete({ where: { id } });
      return true;
    },
    false,
  );

  if (!result) {
    return NextResponse.json(
      { error: "Failed to delete event type. It may have existing requests." },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
