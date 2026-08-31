import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mvmfox.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/catering`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic pages
  let services: { slug: string; updatedAt: Date }[] = [];
  let products: { slug: string; updatedAt: Date }[] = [];
  let cateringPackages: { slug: string; updatedAt: Date }[] = [];
  let brands: { slug: string; updatedAt: Date }[] = [];
  try {
    [services, products, cateringPackages, brands] = await Promise.all([
      prisma.service.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.product.findMany({ where: { status: "PUBLISHED", isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.cateringPackage.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.brand.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    ]);
  } catch {
    // DB unavailable — return only static pages
  }

  const dynamicPages: MetadataRoute.Sitemap = [
    ...services.map((s) => ({
      url: `${baseUrl}/services/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${baseUrl}/shop/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...cateringPackages.map((c) => ({
      url: `${baseUrl}/catering/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...brands.map((b) => ({
      url: `${baseUrl}/brands/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticPages, ...dynamicPages];
}
