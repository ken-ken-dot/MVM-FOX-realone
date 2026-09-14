import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  Star,
  Phone,
  Monitor,
  Code,
  Wifi,
} from "lucide-react";
import { ScrollReveal, AmbientBackground } from "@/components/ui";
import { HeroSlider } from "@/components/sections/hero-slider";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

interface SectionContent {
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  content?: Record<string, unknown> | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  imageUrl?: string | null;
}

async function getHomepageData() {
  try {
    const [services, products, testimonials, brands, sections] =
      await Promise.all([
        prisma.service.findMany({
          where: { isActive: true },
          include: { category: true },
          orderBy: { sortOrder: "asc" },
          take: 4,
        }),
        prisma.product.findMany({
          where: { status: "PUBLISHED", isActive: true },
          include: { images: { where: { isPrimary: true }, take: 1 } },
          orderBy: { sortOrder: "asc" },
          take: 4,
        }),
        prisma.testimonial.findMany({
          where: { isPublished: true },
          orderBy: { sortOrder: "asc" },
          take: 3,
        }),
        prisma.brand.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        }),
        prisma.homepageSection.findMany({
          where: { isVisible: true },
          orderBy: { sortOrder: "asc" },
        }),
      ]);

    // Build section map by type
    const sectionMap: Record<string, SectionContent> = {};
    for (const section of sections) {
      sectionMap[section.type] = {
        title: section.title,
        subtitle: section.subtitle,
        description: (section.content as Record<string, unknown> | null)?.description as string | null || null,
        content: section.content as Record<string, unknown> | null,
        ctaText: section.ctaText,
        ctaLink: section.ctaLink,
        imageUrl: section.imageUrl,
      };
    }

    // Build hero slides from hero_slide_N sections
    const heroSlides = sections
      .filter((s) => s.type.startsWith("hero_slide_"))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({
        title: s.title || "",
        subtitle: s.subtitle || "",
        description: (s.content as Record<string, unknown> | null)?.description as string || "",
        ctaText: s.ctaText || "Explore",
        ctaLink: s.ctaLink || "/shop",
        imageUrl: s.imageUrl || "",
      }));

    return { services, products, testimonials, brands, sectionMap, heroSlides };
  } catch {
    return {
      services: [],
      products: [],
      testimonials: [],
      brands: [],
      sectionMap: {} as Record<string, SectionContent>,
      heroSlides: [],
    };
  }
}

// Default content when no CMS section exists
const defaultCatering = {
  subtitle: "Velvet Fox",
  title: "Unforgettable Events,\nPerfectly Crafted",
  description:
    "From intimate gatherings to grand celebrations, our catering team delivers exceptional culinary experiences tailored to your vision.",
  ctaText: "View Catering",
  ctaLink: "/catering",
};

const defaultFinalCta = {
  title: "Ready to Get Started?",
  description:
    "Whether you need catering for a special event, want to shop our products, or are looking for professional services — we're here to help.",
  ctaText: "Get a Quote",
  ctaLink: "/request-quote",
};

export default async function HomePage() {
  const { services, products, testimonials, brands, sectionMap, heroSlides } =
    await getHomepageData();

  const catering = sectionMap["catering_cta"] || defaultCatering;
  const finalCta = sectionMap["final_cta"] || defaultFinalCta;
  const cateringTitle = (catering.title || defaultCatering.title).split("\n");

  return (
    <div className="flex flex-col">
      {/* ─── Hero Slider — CMS: hero_slide_N ─── */}
      {heroSlides.length > 0 ? (
        <HeroSlider slides={heroSlides} />
      ) : (
        <section className="relative bg-bg-primary-dark text-text-on-dark pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
          <div className="container-mvm relative z-10">
            <div className="max-w-3xl">
              <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-4">MVM FOX</p>
              <h1 className="text-display md:text-[4.5rem] font-bold tracking-tight leading-[1.05] mb-6">
                Premium Services.<br /><span className="text-accent">Exceptional Quality.</span>
              </h1>
              <p className="text-body-lg text-text-on-dark-secondary max-w-xl mb-8">
                From world-class catering to curated products and professional services.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ─── Services Preview (Light) — DB: live services ─── */}
      <ScrollReveal>
      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="tech" variant="light" />
        <div className="container-mvm relative z-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
                What We Do
              </p>
              <h2 className="text-h1 font-bold tracking-tight">
                Our Services
              </h2>
            </div>
            <Link
              href="/services"
              className="hidden md:inline-flex items-center gap-2 text-body-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              View all services
              <ArrowRight size={16} />
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase size={48} className="mx-auto text-text-tertiary mb-4" />
              <p className="text-body-lg text-text-secondary">
                Services coming soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group rounded-lg border border-border-subtle bg-white p-6 card-interactive"
                >
                  {service.category && (
                    <p className="text-caption text-accent font-medium mb-2">
                      {service.category.name}
                    </p>
                  )}
                  <h3 className="text-h4 font-semibold mb-2 group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-body-sm text-text-secondary line-clamp-2">
                    {service.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <div className="md:hidden mt-8 text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-body-sm font-medium text-accent"
            >
              View all services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ─── Products Preview (Dark) — DB: live products ─── */}
      <ScrollReveal>
      <section className="relative section-padding bg-bg-primary-dark text-text-on-dark overflow-hidden">
        <AmbientBackground icons="tech" variant="dark" />
        <div className="container-mvm relative z-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
                Shop
              </p>
              <h2 className="text-h1 font-bold tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden md:inline-flex items-center gap-2 text-body-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              Browse shop
              <ArrowRight size={16} />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={48} className="mx-auto text-text-on-dark-secondary mb-4" />
              <p className="text-body-lg text-text-on-dark-secondary">
                Products coming soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group rounded-lg border border-border-dark bg-surface-card-dark p-5 card-interactive"
                >
                  <div className="aspect-square rounded-md bg-bg-primary-dark-elevated mb-4 flex items-center justify-center overflow-hidden relative">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover rounded-md transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingBag size={32} className="text-text-on-dark-secondary" />
                        <span className="text-caption text-text-on-dark-secondary">No image</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-body font-semibold mb-1 group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-body-sm text-text-on-dark-secondary">
                    {formatCurrency(product.price)}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <div className="md:hidden mt-8 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-body-sm font-medium text-accent"
            >
              Browse shop <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ─── Catering CTA (Light, editorial split) — CMS: catering_cta ─── */}
      <ScrollReveal>
      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="catering" variant="light" />
        <div className="container-mvm relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
                {catering.subtitle || defaultCatering.subtitle}
              </p>
              <h2 className="text-h1 font-bold tracking-tight mb-4">
                {cateringTitle[0]}
                <br />
                {cateringTitle[1]}
              </h2>
              <p className="text-body-lg text-text-secondary mb-6">
                {catering.description || defaultCatering.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={catering.ctaLink || defaultCatering.ctaLink}
                  className="inline-flex items-center justify-center h-12 px-7 rounded-md bg-accent text-text-on-accent text-body font-medium hover:bg-accent-hover transition-colors"
                >
                  {catering.ctaText || defaultCatering.ctaText}
                  <ArrowRight size={18} className="ml-2" />
                </Link>
                <Link
                  href="/request-catering"
                  className="inline-flex items-center justify-center h-12 px-7 rounded-md border border-border-default text-text-primary text-body font-medium hover:bg-surface-neutral transition-colors"
                >
                  Request Quote
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-xl bg-bg-primary-dark overflow-hidden">
              {catering.imageUrl ? (
                <Image
                  src={catering.imageUrl}
                  alt="Catering event setup"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <UtensilsCrossed size={64} className="text-accent/30" />
                  <span className="text-body-sm text-text-on-dark-secondary">Catering image coming soon</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ─── Testimonials (Dark) — DB: live testimonials ─── */}
      {testimonials.length > 0 && (
      <ScrollReveal>
        <section className="relative section-padding bg-bg-primary-dark text-text-on-dark overflow-hidden">
          <AmbientBackground icons="mixed" variant="dark" />
          <div className="container-mvm relative z-10">
            <div className="text-center mb-12">
              <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
                Testimonials
              </p>
              <h2 className="text-h1 font-bold tracking-tight">
                What People Say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border border-border-dark bg-surface-card-dark p-6"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="text-accent fill-accent"
                      />
                    ))}
                  </div>
                  <p className="text-body-sm text-text-on-dark-secondary italic mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p className="text-body-sm font-semibold text-text-on-dark">
                      {t.authorName}
                    </p>
                    {t.authorTitle && (
                      <p className="text-caption text-text-on-dark-secondary">
                        {t.authorTitle}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>
      )}

      {/* ─── Brands (Light) — DB: live brands ─── */}
      {brands.length > 0 && (
      <ScrollReveal>
        <section className="relative section-padding bg-bg-primary-light overflow-hidden">
          <AmbientBackground icons="tech" variant="light" />
          <div className="container-mvm relative z-10">
            <div className="text-center mb-12">
              <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
                Our Brands
              </p>
              <h2 className="text-h1 font-bold tracking-tight">
                The MVM FOX Family
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group rounded-lg border border-border-subtle bg-white overflow-hidden card-interactive"
                >
                  {brand.coverImageUrl && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={brand.coverImageUrl}
                        alt={`${brand.name} brand image`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-h4 font-semibold group-hover:text-accent transition-colors">
                      {brand.name}
                    </h3>
                    {brand.tagline && (
                      <p className="text-body-sm text-text-secondary mt-1">
                        {brand.tagline}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 text-body-sm font-medium text-accent hover:text-accent-hover transition-colors"
              >
                View all brands
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>
      )}

      {/* ─── Final CTA (Dark) — CMS: final_cta ─── */}
      <ScrollReveal>
      <section className="relative section-padding bg-bg-primary-dark text-text-on-dark overflow-hidden">
        <AmbientBackground icons="mixed" variant="dark" />
        <div className="container-mvm text-center relative z-10">
          <h2 className="text-h1 md:text-display font-bold tracking-tight mb-4">
            {finalCta.title || defaultFinalCta.title}
          </h2>
          <p className="text-body-lg text-text-on-dark-secondary max-w-xl mx-auto mb-8">
            {finalCta.description || defaultFinalCta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={finalCta.ctaLink || defaultFinalCta.ctaLink}
              className="inline-flex items-center justify-center h-12 px-7 rounded-md bg-accent text-text-on-accent text-body font-medium hover:bg-accent-hover transition-colors"
            >
              {finalCta.ctaText || defaultFinalCta.ctaText}
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-12 px-7 rounded-md border border-border-dark text-text-on-dark text-body font-medium hover:bg-bg-primary-dark-elevated transition-colors"
            >
              <Phone size={18} className="mr-2" />
              Contact Us
            </Link>
          </div>
        </div>
      </section>
      </ScrollReveal>
    </div>
  );
}
