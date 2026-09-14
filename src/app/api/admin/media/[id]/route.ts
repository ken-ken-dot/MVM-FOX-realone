import { NextRequest, NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const media = await safeQuery(
    () => prisma.media.findUnique({ where: { id } }),
    null,
  );

  if (!media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  // Check where this media URL is referenced
  const references = await safeQuery(async () => {
    const url = media.url;
    const [products, categories, services, sections] = await Promise.all([
      prisma.productImage.findMany({ where: { url }, select: { id: true, productId: true } }),
      prisma.productCategory.findMany({ where: { imageUrl: url }, select: { id: true, name: true } }),
      prisma.service.findMany({ where: { imageUrl: url }, select: { id: true, title: true } }),
      prisma.homepageSection.findMany({ where: { imageUrl: url }, select: { id: true, type: true } }),
    ]);
    return { products, categories, services, sections };
  }, { products: [], categories: [], services: [], sections: [] });

  return NextResponse.json({ media, references });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { url, isPlaceholder, alt } = body;

  const result = await safeQuery(
    async () => {
      const existing = await prisma.media.findUnique({ where: { id } });
      if (!existing) return null;

      // If URL is being changed, update all references
      if (url && url !== existing.url) {
        const oldUrl = existing.url;

        // Update all product images that reference this URL
        await prisma.productImage.updateMany({ where: { url: oldUrl }, data: { url } });

        // Update category image URLs
        await prisma.productCategory.updateMany({ where: { imageUrl: oldUrl }, data: { imageUrl: url } });

        // Update service image URLs
        await prisma.service.updateMany({ where: { imageUrl: oldUrl }, data: { imageUrl: url } });

        // Update homepage section image URLs
        await prisma.homepageSection.updateMany({ where: { imageUrl: oldUrl }, data: { imageUrl: url } });

        // Update brand image URLs
        await prisma.brand.updateMany({
          where: { OR: [{ logoUrl: oldUrl }, { coverImageUrl: oldUrl }] },
          data: { logoUrl: url },
        });
      }

      const media = await prisma.media.update({
        where: { id },
        data: {
          ...(url !== undefined && { url }),
          ...(isPlaceholder !== undefined && { isPlaceholder }),
          ...(alt !== undefined && { alt }),
        },
      });

      return media;
    },
    null,
  );

  if (!result) {
    return NextResponse.json({ error: "Media not found or update failed" }, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const result = await safeQuery(
    async () => {
      const media = await prisma.media.findUnique({ where: { id } });
      if (!media) return null;

      // Check if URL is referenced anywhere
      const url = media.url;
      const [productImages, categories, services, sections] = await Promise.all([
        prisma.productImage.count({ where: { url } }),
        prisma.productCategory.count({ where: { imageUrl: url } }),
        prisma.service.count({ where: { imageUrl: url } }),
        prisma.homepageSection.count({ where: { imageUrl: url } }),
      ]);

      const totalReferences = productImages + categories + services + sections;
      if (totalReferences > 0) {
        throw new Error(
          `Cannot delete: this image is still referenced by ${totalReferences} item(s) on the site. Replace the image first, then delete.`,
        );
      }

      await prisma.media.delete({ where: { id } });
      return true;
    },
    false,
  );

  if (!result) {
    return NextResponse.json(
      { error: "Failed to delete media. It may still be referenced somewhere." },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
