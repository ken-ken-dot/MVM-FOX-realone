import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";
import { AddToCartButton } from "./add-to-cart-button";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      brand: true,
    },
  });

  if (!product) notFound();

  // Cross-sell: related products
  const relatedProducts = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      isActive: true,
      id: { not: product.id },
      ...(product.categoryId ? { categoryId: product.categoryId } : {}),
    },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    take: 3,
    orderBy: { sortOrder: "asc" },
  });

  const inStock = product.stock > 0;

  return (
    <div>
      <PageHero
        title={product.name}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: product.name },
        ]}
      />

      <section className="section-padding bg-bg-primary-light">
        <div className="container-mvm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="relative aspect-square rounded-lg border border-border-subtle bg-surface-neutral overflow-hidden">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingBag size={64} className="text-text-tertiary" />
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {product.images.slice(0, 4).map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square rounded-md border border-border-subtle bg-surface-neutral overflow-hidden"
                    >
                      <Image
                        src={img.url}
                        alt={img.alt || product.name}
                        fill
                        sizes="(max-width: 1024px) 25vw, 12.5vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              {product.brand && (
                <p className="text-caption text-accent font-medium mb-2 uppercase tracking-wider">
                  {product.brand.name}
                </p>
              )}
              <h1 className="text-h1 font-bold tracking-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-h2 font-bold text-accent">
                  {formatCurrency(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-body text-text-tertiary line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <p className="text-body text-text-secondary mb-6">
                {product.shortDescription}
              </p>

              <div className="border-t border-border-subtle pt-6 mb-6">
                <div
                  className="text-body-sm text-text-secondary prose"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>

              {/* Stock */}
              <div className="mb-6">
                {inStock ? (
                  <p className="text-body-sm text-success">
                    In Stock ({product.stock} available)
                  </p>
                ) : (
                  <p className="text-body-sm text-error">Out of Stock</p>
                )}
              </div>

              {/* Add to cart */}
              <AddToCartButton
                productId={product.id}
                disabled={!inStock}
              />

              {product.sku && (
                <p className="text-caption text-text-tertiary mt-4">
                  SKU: {product.sku}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cross-sell */}
      {relatedProducts.length > 0 && (
        <section className="section-padding bg-bg-primary-dark text-text-on-dark">
          <div className="container-mvm">
            <h2 className="text-h2 font-bold tracking-tight mb-8">
              You might also like...
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/shop/${rp.slug}`}
                  className="group rounded-lg border border-border-dark bg-surface-card-dark p-5 hover:border-accent/30 transition-colors"
                >
                  <div className="relative aspect-square rounded-md bg-bg-primary-dark-elevated mb-4 overflow-hidden">
                    {rp.images[0] ? (
                      <Image
                        src={rp.images[0].url}
                        alt={rp.images[0].alt || rp.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <ShoppingBag
                        size={32}
                        className="text-text-on-dark-secondary"
                      />
                    )}
                  </div>
                  <h3 className="text-body font-semibold group-hover:text-accent transition-colors">
                    {rp.name}
                  </h3>
                  <p className="text-body-sm text-text-on-dark-secondary">
                    {formatCurrency(rp.price)}
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
