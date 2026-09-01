import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Monitor, Code, UtensilsCrossed } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";
import { ScrollReveal } from "@/components/ui";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse Electronics, Software, and Catering from MVM FOX.",
};

const categoryCards = [
  {
    slug: "electronics",
    name: "Electronics",
    description: "Laptops, phones, smart home devices, and audio — engineered for performance.",
    icon: Monitor,
    color: "bg-accent/10 text-accent",
  },
  {
    slug: "software",
    name: "Software",
    description: "Productivity tools, creative suites, and security solutions — built to empower.",
    icon: Code,
    color: "bg-accent-secondary/10 text-accent-secondary",
  },
  {
    slug: "catering-shop",
    name: "Catering",
    description: "Velvet Fox gourmet meals, desserts, and platters — crafted with care.",
    icon: UtensilsCrossed,
    color: "bg-info/10 text-info",
  },
];

async function getRecentProducts() {
  try {
    return await prisma.product.findMany({
      where: { status: "PUBLISHED", isActive: true },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const products = await getRecentProducts();

  return (
    <div>
      <PageHero
        title="Shop"
        subtitle="Explore our three product categories — each curated with the same attention to quality."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      />

      {/* Category Chooser */}
      <section className="section-padding bg-bg-primary-light">
        <div className="container-mvm">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
                Browse by Category
              </p>
              <h2 className="text-h1 font-bold tracking-tight">
                What Are You Looking For?
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {categoryCards.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.slug}
                    href={`/shop/${cat.slug}`}
                    className="group relative rounded-xl border border-border-subtle bg-white p-8 card-interactive text-center"
                  >
                    <div className={`inline-flex p-4 rounded-xl ${cat.color} mb-5`}>
                      <Icon size={32} />
                    </div>
                    <h3 className="text-h3 font-bold mb-3 group-hover:text-accent transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-body-sm text-text-secondary">
                      {cat.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent mt-4 group-hover:gap-2.5 transition-all">
                      Browse {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </ScrollReveal>

          {/* Recent Products Preview */}
          {products.length > 0 && (
            <ScrollReveal>
              <div>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
                      New Arrivals
                    </p>
                    <h2 className="text-h2 font-bold tracking-tight">
                      Recently Added
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const primaryImage = product.images[0];
                    return (
                      <Link
                        key={product.id}
                        href={`/shop/${product.slug}`}
                        className="group rounded-lg border border-border-subtle bg-white overflow-hidden card-interactive"
                      >
                        <div className="relative aspect-[4/3] bg-surface-neutral overflow-hidden">
                          {primaryImage ? (
                            <Image
                              src={primaryImage.url}
                              alt={primaryImage.alt || product.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Monitor size={32} className="text-text-tertiary" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          {product.category && (
                            <p className="text-caption text-accent font-medium mb-1">
                              {product.category.name}
                            </p>
                          )}
                          <h3 className="text-body font-semibold mb-1 group-hover:text-accent transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-body-sm text-text-secondary mb-2 line-clamp-2">
                            {product.shortDescription}
                          </p>
                          <span className="text-body font-semibold text-accent">
                            {product.productType === "subscription"
                              ? `${formatCurrency(product.price)}/mo`
                              : formatCurrency(product.price)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>
    </div>
  );
}
