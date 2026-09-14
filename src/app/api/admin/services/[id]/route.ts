import { NextRequest, NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const service = await safeQuery(
    () =>
      prisma.service.findUnique({
        where: { id },
        include: { category: true, faqs: true },
      }),
    null,
  );

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }
  return NextResponse.json(service);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const {
    title,
    slug,
    shortDescription,
    description,
    imageUrl,
    benefits,
    process,
    categoryId,
    brandId,
    sortOrder,
    isActive,
  } = body;

  const result = await safeQuery(
    async () => {
      const existing = await prisma.service.findUnique({ where: { id } });
      if (!existing) return null;

      const service = await prisma.service.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(slug !== undefined && { slug }),
          ...(shortDescription !== undefined && { shortDescription }),
          ...(description !== undefined && { description }),
          ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
          ...(benefits !== undefined && { benefits }),
          ...(process !== undefined && { process }),
          ...(categoryId !== undefined && { categoryId: categoryId || null }),
          ...(brandId !== undefined && { brandId: brandId || null }),
          ...(sortOrder !== undefined && { sortOrder: parseInt(String(sortOrder), 10) }),
          ...(isActive !== undefined && { isActive }),
        },
        include: { category: true, faqs: true },
      });

      return service;
    },
    null,
  );

  if (!result) {
    return NextResponse.json({ error: "Service not found or update failed" }, { status: 404 });
  }
  return NextResponse.json(result);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const result = await safeQuery(
    async () => {
      const requestCount = await prisma.serviceRequest.count({ where: { serviceId: id } });
      if (requestCount > 0) {
        throw new Error("Cannot delete a service that has existing requests. Deactivate it instead.");
      }
      // Delete related FAQs
      await prisma.fAQ.deleteMany({ where: { serviceId: id } });
      await prisma.service.delete({ where: { id } });
      return true;
    },
    false,
  );

  if (!result) {
    return NextResponse.json(
      { error: "Failed to delete service. It may have existing requests." },
      { status: 400 },
    );
  }
  return NextResponse.json({ success: true });
}
