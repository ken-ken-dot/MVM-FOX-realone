import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Monitor, Code, UtensilsCrossed } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";
import { ScrollReveal, AmbientBackground } from "@/components/ui";

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
    // Get top-level category IDs to ensure cross-category mix
    const topCategories = await prisma.productCategory.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
    });
    const catIds = topCategories.map((c) => c.id);

    // Pull 2 products from each top-level category for a balanced mix
    const perCategory = 2;
    type ProductWithRelations = Awaited<ReturnType<typeof prisma.product.findMany>>[number] & { images: { url: string; alt: string | null }[]; category: { name: string } | null };
    const allProducts: ProductWithRelations[] = [];

    for (const catId of catIds) {
      // Also include subcategories of this parent
      const subs = await prisma.productCategory.findMany({ where: { parentId: catId } });
      const ids = [catId, ...subs.map((s) => s.id)];

      const products = await prisma.product.findMany({
        where: { status: "PUBLISHED", isActive: true, categoryId: { in: ids } },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: true,
        },
        orderBy: { createdAt: "desc" },
        take: perCategory,
      });
      allProducts.push(...products);
    }

    return allProducts;
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
        backgroundImage={{
          src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
          alt: "Premium retail display showcasing curated products",
        }}
      />

      {/* Category Chooser */}
      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="tech" variant="light" />
        <div className="container-mvm relative z-10">
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
                            <span className="inline-flex h-5 px-2 rounded-full bg-accent/10 text-accent text-caption font-medium mb-1.5">
                              {product.category.name}
                            </span>
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
