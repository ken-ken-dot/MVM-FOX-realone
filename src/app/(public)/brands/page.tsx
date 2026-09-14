import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ScrollReveal, AmbientBackground } from "@/components/ui";
import { BrandsHeroSlider } from "@/components/sections/brands-hero-slider";

export const metadata: Metadata = {
  title: "Brands",
  description:
    "The brands under MVM FOX. Discover our family of businesses.",
};

// Static showcase data for product lines (not stored in DB as Brand entity)
const productLineShowcases = [
  {
    slug: "mvm-electronics",
    name: "MVM Electronics",
    tagline: "Engineered for performance",
    description:
      "Premium laptops, phones, smart home devices, and audio — built with obsessive attention to detail for everyday life.",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
    coverUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80",
    ctaText: "Shop Electronics",
    ctaLink: "/shop/electronics",
  },
  {
    slug: "mvm-software",
    name: "MVM Software",
    tagline: "Built to empower",
    description:
      "Productivity tools, creative suites, and security solutions — designed to help individuals and teams do their best work.",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
    coverUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=80",
    ctaText: "Explore Software",
    ctaLink: "/shop/software",
  },
];

async function getBrands() {
  try {
    return await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function BrandsPage() {
  const brands = await getBrands();

  // Build brand cards from DB brands + product line showcases
  const brandCards = [
    ...brands.map((b) => ({
      slug: b.slug,
      name: b.name,
      tagline: b.tagline,
      description: b.description,
      coverUrl: b.coverImageUrl,
      logoUrl: b.logoUrl,
      isDbBrand: true as const,
      ctaText: `Visit ${b.name}`,
      ctaLink: `/brands/${b.slug}`,
    })),
    ...productLineShowcases.map((pl) => ({
      slug: pl.slug,
      name: pl.name,
      tagline: pl.tagline,
      description: pl.description,
      coverUrl: pl.coverUrl,
      logoUrl: pl.imageUrl,
      isDbBrand: false as const,
      ctaText: pl.ctaText,
      ctaLink: pl.ctaLink,
    })),
  ];

  // Hero slider slides
  const heroSlides = [
    {
      title: "Software That\nWorks For You",
      subtitle: "MVM Software",
      description:
        "Productivity tools, creative suites, and security solutions — built to help you do your best work.",
      ctaText: "Explore Software",
      ctaLink: "/shop/software",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&q=80",
    },
    {
      title: "Premium Electronics.\nExceptional Quality.",
      subtitle: "MVM Electronics",
      description:
        "Laptops, phones, smart home devices, and audio — engineered for performance, designed for everyday life.",
      ctaText: "Shop Electronics",
      ctaLink: "/shop/electronics",
      imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=80",
    },
    {
      title: "Unforgettable Events.\nPerfectly Crafted.",
      subtitle: "Velvet Fox Catering",
      description:
        "From intimate gatherings to grand celebrations — bespoke culinary experiences tailored to your vision.",
      ctaText: "View Catering",
      ctaLink: "/brands/velvet-fox",
      imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1920&q=80",
    },
  ];

  return (
    <div>
      {/* ─── Cinematic Hero Slider ─── */}
      <BrandsHeroSlider slides={heroSlides} />

      {/* ─── Brand Showcases ─── */}
      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="tech" variant="light" />
        <div className="container-mvm relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
                Our Family
              </p>
              <h2 className="text-h1 font-bold tracking-tight">
                The MVM FOX Brands
              </h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto mt-4">
                Three distinct lines of business — each crafted with the same
                unwavering commitment to quality and innovation.
              </p>
            </div>
          </ScrollReveal>

          {brandCards.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body text-text-secondary">
                We&apos;re building our family of brands. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {brandCards.map((brand, idx) => (
                <ScrollReveal key={brand.slug} delay={idx * 100}>
                  <div className="group rounded-xl border border-border-subtle bg-white overflow-hidden card-interactive flex flex-col h-full">
                    {/* Cover image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {brand.coverUrl ? (
                        <Image
                          src={brand.coverUrl}
                          alt={`${brand.name} showcase`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-bg-primary-dark" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-accent text-caption font-medium tracking-wider uppercase mb-1">
                          {brand.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-h3 font-bold mb-2 group-hover:text-accent transition-colors">
                        {brand.name}
                      </h3>
                      {brand.description && (
                        <p className="text-body-sm text-text-secondary line-clamp-3 mb-4 flex-1">
                          {brand.description}
                        </p>
                      )}
                      <Link
                        href={brand.ctaLink}
                        className="inline-flex items-center gap-2 text-body-sm font-medium text-accent hover:gap-3 transition-all"
                      >
                        {brand.ctaText}
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
