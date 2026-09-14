import { NextRequest, NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";
import { checkImageUrl } from "@/lib/image-validation";

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
              { name: { contains: q, mode: "insensitive" as const } },
              { sku: { contains: q, mode: "insensitive" as const } },
              { shortDescription: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { category: true, brand: true, images: true },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        prisma.product.count({ where }),
      ]);
      return { products, total, page, pageSize };
    },
    { products: [], total: 0, page: 1, pageSize },
  );

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    slug,
    shortDescription,
    description,
    story,
    specs,
    price,
    compareAtPrice,
    sku,
    stock,
    status,
    productType,
    tags,
    platform,
    licenseType,
    categoryId,
    brandId,
    imageUrl,
    imageAlt,
  } = body;

  if (!name || !slug || !shortDescription || !description || price === undefined) {
    return NextResponse.json(
      { error: "Name, slug, short description, description, and price are required." },
      { status: 400 },
    );
  }

  // Enforce: cannot save as Published with zero images
  if (status === "PUBLISHED" && !imageUrl) {
    return NextResponse.json(
      { error: "Cannot publish a product without at least one image. Please attach an image first." },
      { status: 400 },
    );
  }

  // Validate imageUrl is resolvable before persisting
  if (imageUrl) {
    const urlCheck = await checkImageUrl(imageUrl);
    if (!urlCheck.ok) {
      return NextResponse.json(
        { error: `Image URL is not resolvable (HTTP ${urlCheck.status || "error"}: ${urlCheck.reason || "not found"}). Please use a valid image URL.` },
        { status: 400 },
      );
    }
  }

  const result = await safeQuery(
    async () => {
      const product = await prisma.product.create({
        data: {
          name,
          slug,
          shortDescription,
          description,
          story: story || null,
          specs: specs || undefined,
          price: parseFloat(String(price)),
          compareAtPrice: compareAtPrice ? parseFloat(String(compareAtPrice)) : null,
          sku: sku || null,
          stock: stock !== undefined ? parseInt(String(stock), 10) : 0,
          status: status || "DRAFT",
          isActive: true,
          productType: productType || "physical",
          tags: tags || [],
          platform: platform || null,
          licenseType: licenseType || null,
          categoryId: categoryId || null,
          brandId: brandId || null,
        },
        include: { category: true, brand: true, images: true },
      });

      // Create primary image if provided
      if (imageUrl) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: imageUrl,
            alt: imageAlt || name,
            isPrimary: true,
            sortOrder: 0,
          },
        });
      }

      return product;
    },
    null,
  );

  if (!result) {
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }

  return NextResponse.json(result, { status: 201 });
}
