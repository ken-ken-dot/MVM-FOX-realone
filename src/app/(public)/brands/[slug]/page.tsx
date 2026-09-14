import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ShoppingBag, Briefcase } from "lucide-react";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ScrollReveal, AmbientBackground } from "@/components/ui";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await safeQuery(
    () => prisma.brand.findUnique({ where: { slug } }),
    null,
  );

  if (!brand) return { title: "Brand Not Found" };

  return {
    title: brand.name,
    description: brand.description || brand.tagline || `${brand.name} — MVM FOX`,
  };
}

export default async function BrandDetailPage({ params }: Props) {
  const { slug } = await params;

  const brand = await safeQuery(
    () => prisma.brand.findUnique({
      where: { slug },
      include: {
        services: { where: { isActive: true }, take: 4 },
        products: {
          where: { status: "PUBLISHED", isActive: true },
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: true,
          },
          take: 8,
        },
      },
    }),
    null,
  );

  if (!brand) notFound();

  return (
    <div>
      {/* ─── Brand Hero ─── */}
      {brand.coverImageUrl && (
        <section className="relative h-[50vh] min-h-[400px] overflow-hidden bg-bg-primary-dark">
          <Image
            src={brand.coverImageUrl}
            alt={`${brand.name} cover`}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary-dark via-bg-primary-dark/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end container-mvm pb-12">
            {brand.logoUrl && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white/20 mb-4">
                <Image
                  src={brand.logoUrl}
                  alt={`${brand.name} logo`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            )}
            <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
              {brand.tagline}
            </p>
            <h1 className="text-h1 md:text-display font-bold tracking-tight text-text-on-dark">
              {brand.name}
            </h1>
          </div>
        </section>
      )}

      {/* Fallback hero if no cover image */}
      {!brand.coverImageUrl && (
        <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-bg-primary-dark text-text-on-dark">
          <div className="container-mvm">
            <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
              Brand
            </p>
            <h1 className="text-h1 md:text-display font-bold tracking-tight">
              {brand.name}
            </h1>
            {brand.tagline && (
              <p className="mt-4 text-body-lg text-text-on-dark-secondary max-w-2xl">
                {brand.tagline}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Description */}
      {brand.description && (
        <section className="relative section-padding bg-bg-primary-light overflow-hidden">
          <AmbientBackground icons="tech" variant="light" />
          <div className="container-mvm max-w-3xl relative z-10">
            <ScrollReveal>
              <div className="text-body-lg text-text-secondary whitespace-pre-line leading-relaxed">
                {brand.description}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Products by this brand */}
      {brand.products.length > 0 && (
        <section className="relative section-padding bg-bg-primary-light overflow-hidden">
          <AmbientBackground icons="tech" variant="light" />
          <div className="container-mvm relative z-10">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
                    Products
                  </p>
                  <h2 className="text-h2 font-bold tracking-tight">
                    {brand.name} Products
                  </h2>
                </div>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {brand.products.map((product: any) => {
                const img = product.images[0];
                return (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    className="group rounded-lg border border-border-subtle bg-white overflow-hidden card-interactive"
                  >
                    <div className="relative aspect-square bg-surface-neutral overflow-hidden">
                      {img ? (
                        <Image
                          src={img.url}
                          alt={img.alt || product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ShoppingBag size={32} className="text-text-tertiary" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      {product.category && (
                        <span className="inline-flex h-5 px-2 rounded-full bg-accent/10 text-accent text-caption font-medium mb-1.5">
                          {product.category.name}
                        </span>
                      )}
                      <h3 className="text-body font-semibold group-hover:text-accent transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-body-sm text-text-secondary mt-1 line-clamp-2">
                        {product.shortDescription}
                      </p>
                      <span className="text-body font-semibold text-accent mt-2 inline-block">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Services by this brand */}
      {brand.services.length > 0 && (
        <section className="relative section-padding bg-bg-primary-dark text-text-on-dark overflow-hidden">
          <AmbientBackground icons="tech" variant="dark" />
          <div className="container-mvm relative z-10">
            <ScrollReveal>
              <h2 className="text-h2 font-bold tracking-tight mb-8">
                Services
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brand.services.map((service, idx) => (
                <ScrollReveal key={service.id} delay={idx * 100}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="group rounded-lg border border-border-dark bg-surface-card-dark p-6 hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-accent/10 text-accent shrink-0">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h3 className="text-h4 font-semibold mb-1 group-hover:text-accent transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-body-sm text-text-on-dark-secondary line-clamp-2">
                          {service.shortDescription}
                        </p>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
