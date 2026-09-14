import { NextRequest, NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";
import { checkImageUrl } from "@/lib/image-validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const product = await safeQuery(
    () =>
      prisma.product.findUnique({
        where: { id },
        include: { category: true, brand: true, images: { orderBy: { sortOrder: "asc" } } },
      }),
    null,
  );

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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
    isActive,
    productType,
    tags,
    platform,
    licenseType,
    categoryId,
    brandId,
    sortOrder,
  } = body;

  const result = await safeQuery(
    async () => {
      const existing = await prisma.product.findUnique({
        where: { id },
        include: { images: true },
      });
      if (!existing) return null;

      // Enforce: cannot publish without images
      if (status === "PUBLISHED" && existing.images.length === 0 && !body.imageUrl) {
        throw new Error("Cannot publish a product without at least one image.");
      }

      // Enforce: cannot publish with broken image references
      if (status === "PUBLISHED" && existing.images.length > 0) {
        const brokenImages: string[] = [];
        for (const img of existing.images) {
          const check = await checkImageUrl(img.url);
          if (!check.ok) brokenImages.push(img.alt || img.url);
        }
        if (brokenImages.length > 0) {
          throw new Error(
            `Cannot publish: ${brokenImages.length} image(s) are broken or not resolvable: ${brokenImages.join(", ")}. Please fix or remove them first.`,
          );
        }
      }

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(slug !== undefined && { slug }),
          ...(shortDescription !== undefined && { shortDescription }),
          ...(description !== undefined && { description }),
          ...(story !== undefined && { story: story || null }),
          ...(specs !== undefined && { specs: specs || undefined }),
          ...(price !== undefined && { price: parseFloat(String(price)) }),
          ...(compareAtPrice !== undefined && { compareAtPrice: compareAtPrice ? parseFloat(String(compareAtPrice)) : null }),
          ...(sku !== undefined && { sku: sku || null }),
          ...(stock !== undefined && { stock: parseInt(String(stock), 10) }),
          ...(status !== undefined && { status }),
          ...(isActive !== undefined && { isActive }),
          ...(productType !== undefined && { productType }),
          ...(tags !== undefined && { tags }),
          ...(platform !== undefined && { platform: platform || null }),
          ...(licenseType !== undefined && { licenseType: licenseType || null }),
          ...(categoryId !== undefined && { categoryId: categoryId || null }),
          ...(brandId !== undefined && { brandId: brandId || null }),
          ...(sortOrder !== undefined && { sortOrder: parseInt(String(sortOrder), 10) }),
        },
        include: { category: true, brand: true, images: { orderBy: { sortOrder: "asc" } } },
      });

      return product;
    },
    null,
  );

  if (!result) {
    return NextResponse.json({ error: "Product not found or update failed" }, { status: 404 });
  }
  return NextResponse.json(result);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const result = await safeQuery(
    async () => {
      // Check for order references
      const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
      if (orderItemCount > 0) {
        throw new Error("Cannot delete a product that has been ordered. Archive it instead.");
      }
      await prisma.product.delete({ where: { id } });
      return true;
    },
    false,
  );

  if (!result) {
    return NextResponse.json(
      { error: "Failed to delete product. It may have existing orders." },
      { status: 400 },
    );
  }
  return NextResponse.json({ success: true });
}
