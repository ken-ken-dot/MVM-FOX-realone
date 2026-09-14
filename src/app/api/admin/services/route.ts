import { NextRequest, NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = 20;
  const skip = (page - 1) * pageSize;
  const q = searchParams.get("q") || "";

  const result = await safeQuery(
    async () => {
      const where = q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { shortDescription: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where,
          include: { category: true },
          orderBy: { sortOrder: "asc" },
          skip,
          take: pageSize,
        }),
        prisma.service.count({ where }),
      ]);
      return { services, total, page, pageSize };
    },
    { services: [], total: 0, page: 1, pageSize },
  );

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
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

  if (!title || !slug || !shortDescription || !description) {
    return NextResponse.json(
      { error: "Title, slug, short description, and description are required." },
      { status: 400 },
    );
  }

  const result = await safeQuery(
    async () => {
      const service = await prisma.service.create({
        data: {
          title,
          slug,
          shortDescription,
          description,
          imageUrl: imageUrl || null,
          benefits: benefits || [],
          process: process || [],
          categoryId: categoryId || null,
          brandId: brandId || null,
          sortOrder: sortOrder !== undefined ? parseInt(String(sortOrder), 10) : 0,
          isActive: isActive !== undefined ? isActive : true,
        },
        include: { category: true },
      });
      return service;
    },
    null,
  );

  if (!result) {
    return NextResponse.json({ error: "Failed to create service." }, { status: 500 });
  }

  return NextResponse.json(result, { status: 201 });
}
