import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { prisma, safeQuery } from "@/lib/prisma";
import { PageHero } from "@/components/sections/page-hero";

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
        products: { where: { status: "PUBLISHED", isActive: true }, take: 4 },
      },
    }),
    null,
  );

  if (!brand) notFound();

  return (
    <div>
      <PageHero
        title={brand.name}
        subtitle={brand.tagline || undefined}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Brands", href: "/brands" },
          { label: brand.name },
        ]}
      />

      {/* Description */}
      {brand.description && (
        <section className="section-padding bg-bg-primary-light">
          <div className="container-mvm max-w-3xl">
            <div className="text-body-lg text-text-secondary whitespace-pre-line">
              {brand.description}
            </div>
          </div>
        </section>
      )}

      {/* Services by this brand */}
      {brand.services.length > 0 && (
        <section className="section-padding bg-bg-primary-dark text-text-on-dark">
          <div className="container-mvm">
            <h2 className="text-h2 font-bold tracking-tight mb-8">
              Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brand.services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group rounded-lg border border-border-dark bg-surface-card-dark p-6 hover:border-accent/30 transition-colors"
                >
                  <h3 className="text-h4 font-semibold mb-2 group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-body-sm text-text-on-dark-secondary line-clamp-2">
                    {service.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products by this brand */}
      {brand.products.length > 0 && (
        <section className="section-padding bg-bg-primary-light">
          <div className="container-mvm">
            <h2 className="text-h2 font-bold tracking-tight mb-8">Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {brand.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group rounded-lg border border-border-subtle bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-body font-semibold group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-body-sm text-text-secondary mt-1 line-clamp-2">
                    {product.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
