import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our curated selection of premium products from MVM FOX.",
};

async function getProducts() {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { status: "PUBLISHED", isActive: true },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: true,
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.productCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

    return { products, categories };
  } catch {
    return { products: [], categories: [] };
  }
}

export default async function ShopPage() {
  const { products, categories } = await getProducts();

  return (
    <div>
      <PageHero
        title="Shop"
        subtitle="Curated products crafted with care. Browse our selection."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      />

      <section className="section-padding bg-bg-primary-light">
        <div className="container-mvm">
          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              <span className="h-9 px-4 rounded-full bg-accent text-text-on-accent text-body-sm font-medium">
                All
              </span>
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="h-9 px-4 rounded-full border border-border-default text-text-secondary text-body-sm font-medium cursor-pointer hover:bg-surface-neutral transition-colors"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag
                size={48}
                className="mx-auto text-text-tertiary mb-4"
              />
              <h3 className="text-h3 font-semibold mb-2">Shop coming soon</h3>
              <p className="text-body text-text-secondary">
                We&apos;re curating our product selection. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const primaryImage = product.images[0];
                return (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    className="group rounded-lg border border-border-subtle bg-white overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square bg-surface-neutral overflow-hidden">
                      {primaryImage ? (
                        <Image
                          src={primaryImage.url}
                          alt={primaryImage.alt || product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <ShoppingBag
                          size={40}
                          className="text-text-tertiary"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      {product.category && (
                        <p className="text-caption text-accent font-medium mb-1">
                          {product.category.name}
                        </p>
                      )}
                      <h3 className="text-body font-semibold mb-1 group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-body-sm text-text-secondary mb-2 line-clamp-2">
                        {product.shortDescription}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-body font-semibold text-accent">
                          {formatCurrency(product.price)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-body-sm text-text-tertiary line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
