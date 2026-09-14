import { NextRequest, NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";
import { checkImageUrl } from "@/lib/image-validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { url, alt, isPrimary } = body;

  if (!url) {
    return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
  }

  // Validate the image URL is actually resolvable before persisting
  const urlCheck = await checkImageUrl(url);
  if (!urlCheck.ok) {
    return NextResponse.json(
      { error: `Image URL is not resolvable (HTTP ${urlCheck.status || "error"}: ${urlCheck.reason || "not found"}). Please use a valid image URL.` },
      { status: 400 },
    );
  }

  const result = await safeQuery(
    async () => {
      const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
      if (!product) return null;

      // If setting as primary, unset existing primary
      if (isPrimary) {
        await prisma.productImage.updateMany({
          where: { productId: id, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const image = await prisma.productImage.create({
        data: {
          productId: id,
          url,
          alt: alt || product.name,
          isPrimary: isPrimary ?? product.images.length === 0,
          sortOrder: product.images.length,
        },
      });

      return image;
    },
    null,
  );

  if (!result) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(result, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const imageId = searchParams.get("imageId");

  if (!imageId) {
    return NextResponse.json({ error: "imageId is required" }, { status: 400 });
  }

  const result = await safeQuery(
    async () => {
      const image = await prisma.productImage.findUnique({ where: { id: imageId } });
      if (!image || image.productId !== id) return null;

      await prisma.productImage.delete({ where: { id: imageId } });

      // If deleted image was primary, promote the next one
      if (image.isPrimary) {
        const next = await prisma.productImage.findFirst({
          where: { productId: id },
          orderBy: { sortOrder: "asc" },
        });
        if (next) {
          await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
        }
      }

      return true;
    },
    false,
  );

  if (!result) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
