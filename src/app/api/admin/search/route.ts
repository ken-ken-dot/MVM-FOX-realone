import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Global admin search.
 * Queries across Orders, Customers, Products, Services, and Catering Requests
 * by name/email/reference number, with results grouped by type.
 */
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q");
    const type = request.nextUrl.searchParams.get("type");

    // Type-specific lookups for form dropdowns
    if (type === "categories") {
      const categories = await prisma.productCategory.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true, parentId: true },
      });
      return NextResponse.json({ categories });
    }
    if (type === "brands") {
      const brands = await prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, slug: true },
      });
      return NextResponse.json({ brands });
    }
    if (type === "serviceCategories") {
      const serviceCategories = await prisma.serviceCategory.findMany({
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, slug: true },
      });
      return NextResponse.json({ serviceCategories });
    }

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ results: {} });
    }

    const query = q.trim();

    const [orders, customers, products, services, cateringRequests] =
      await Promise.all([
        prisma.order.findMany({
          where: {
            OR: [
              { referenceCode: { contains: query, mode: "insensitive" } },
              { orderNumber: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { firstName: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            referenceCode: true,
            orderNumber: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            total: true,
            createdAt: true,
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        }),

        prisma.customer.findMany({
          where: {
            OR: [
              { email: { contains: query, mode: "insensitive" } },
              { firstName: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
              { companyName: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            companyName: true,
            createdAt: true,
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        }),

        prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { slug: { contains: query, mode: "insensitive" } },
              { sku: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            status: true,
            price: true,
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        }),

        prisma.service.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { slug: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            title: true,
            slug: true,
            isActive: true,
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        }),

        prisma.cateringRequest.findMany({
          where: {
            OR: [
              { referenceCode: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            referenceCode: true,
            name: true,
            email: true,
            status: true,
            createdAt: true,
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        }),
      ]);

    return NextResponse.json({
      results: {
        orders,
        customers,
        products,
        services,
        cateringRequests,
      },
    });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json({ results: {} });
  }
}
