import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ShoppingBag, ArrowLeft, Monitor, Code, UtensilsCrossed } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";
import { ScrollReveal } from "@/components/ui";
import { AddToCartButton } from "./add-to-cart-button";

const categoryIcons: Record<string, React.ElementType> = {
  electronics: Monitor,
  software: Code,
  "catering-shop": UtensilsCrossed,
};

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Check if it's a category
  const category = await prisma.productCategory.findUnique({ where: { slug } });
  if (category && !category.parentId) {
    return { title: category.name, description: category.description || `Browse ${category.name} from MVM FOX.` };
  }

  // Check if it's a product
  const product = await prisma.product.findUnique({ where: { slug } });
  if (product) {
    return { title: product.name, description: product.shortDescription, openGraph: { title: product.name, description: product.shortDescription } };
  }

  return { title: "Not Found" };
}

export default async function ShopSlugPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  // ── Try category first ──
  const topLevelCategory = await prisma.productCategory.findUnique({ where: { slug } });
  if (topLevelCategory && !topLevelCategory.parentId) {
    return renderCategoryPage(topLevelCategory, sp.sub);
  }

  // ── Try product ──
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      brand: true,
    },
  });
  if (product) {
    return renderProductPage(product);
  }

  notFound();
}

// ═══ CATEGORY PAGE ═══
async function renderCategoryPage(topLevel: { id: string; slug: string; name: string; description: string | null }, subId?: string) {
  const Icon = categoryIcons[topLevel.slug] || Monitor;

  const subcategories = await prisma.productCategory.findMany({
    where: { parentId: topLevel.id },
    orderBy: { sortOrder: "asc" },
  });

  const filterIds = subId
    ? [subId]
    : [topLevel.id, ...subcategories.map((s) => s.id)];

  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED", isActive: true, categoryId: { in: filterIds } },
    include: { images: { where: { isPrimary: true }, take: 1 }, category: true, brand: true },
    orderBy: { sortOrder: "asc" },
  });

  const selectedSub = subId ? subcategories.find((s) => s.id === subId) : null;

  return (
    <div>
      <PageHero
        title={topLevel.name}
        subtitle={topLevel.description || ""}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: topLevel.name }]}
      />

      <section className="section-padding bg-bg-primary-light">
        <div className="container-mvm">
          <ScrollReveal>
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link href="/shop" className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary hover:text-text-primary transition-colors">
                <ArrowLeft size={14} /> All Categories
              </Link>
              <span className="text-text-tertiary">|</span>
              <Link href={`/shop/${topLevel.slug}`} className={`h-9 px-4 rounded-full text-body-sm font-medium transition-colors ${!subId ? "bg-accent text-text-on-accent" : "border border-border-default text-text-secondary hover:bg-surface-neutral"}`}>
                All {topLevel.name}
              </Link>
              {subcategories.map((sub) => (
                <Link key={sub.id} href={`/shop/${topLevel.slug}?sub=${sub.id}`} className={`h-9 px-4 rounded-full text-body-sm font-medium transition-colors ${subId === sub.id ? "bg-accent text-text-on-accent" : "border border-border-default text-text-secondary hover:bg-surface-neutral"}`}>
                  {sub.name}
                </Link>
              ))}
            </div>
          </ScrollReveal>

          <p className="text-body-sm text-text-secondary mb-6">
            {products.length} product{products.length !== 1 ? "s" : ""}
            {selectedSub ? ` in ${selectedSub.name}` : ""}
          </p>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <Icon size={48} className="mx-auto text-text-tertiary mb-4" />
              <h3 className="text-h3 font-semibold mb-2">No products yet</h3>
              <p className="text-body text-text-secondary">Check back soon.</p>
            </div>
          ) : (
            <ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((p) => {
                  const img = p.images[0];
                  return (
                    <Link key={p.id} href={`/shop/${p.slug}`} className="group rounded-lg border border-border-subtle bg-white overflow-hidden card-interactive">
                      <div className="relative aspect-square bg-surface-neutral overflow-hidden">
                        {img ? (
                          <Image src={img.url} alt={img.alt || p.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center"><Icon size={32} className="text-text-tertiary" /></div>
                        )}
                        {p.compareAtPrice && <div className="absolute top-3 left-3"><span className="inline-flex h-6 px-2 rounded-full bg-error text-white text-caption font-medium items-center">Sale</span></div>}
                      </div>
                      <div className="p-4">
                        {p.brand && <p className="text-caption text-text-tertiary mb-1">{p.brand.name}</p>}
                        {!p.brand && p.category && <p className="text-caption text-accent font-medium mb-1">{p.category.name}</p>}
                        <h3 className="text-body font-semibold mb-1 group-hover:text-accent transition-colors line-clamp-1">{p.name}</h3>
                        <p className="text-body-sm text-text-secondary mb-2 line-clamp-2">{p.shortDescription}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-body font-semibold text-accent">
                            {p.productType === "subscription" ? `${formatCurrency(p.price)}/mo` : formatCurrency(p.price)}
                          </span>
                          {p.compareAtPrice && <span className="text-body-sm text-text-tertiary line-through">{formatCurrency(p.compareAtPrice)}</span>}
                        </div>
                        {p.stock <= 5 && p.stock > 0 && <p className="text-caption text-warning mt-1">Only {p.stock} left</p>}
                        {p.stock === 0 && <p className="text-caption text-error mt-1">Out of stock</p>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>
    </div>
  );
}

// ═══ PRODUCT DETAIL PAGE ═══
async function renderProductPage(product: Awaited<ReturnType<typeof prisma.product.findUnique>> & { images: any[]; category: any; brand: any }) {
  const relatedProducts = await prisma.product.findMany({
    where: { status: "PUBLISHED", isActive: true, id: { not: product.id }, ...(product.categoryId ? { categoryId: product.categoryId } : {}) },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    take: 3, orderBy: { sortOrder: "asc" },
  });

  const inStock = product.stock > 0;
  const categorySlug = product.category ? `/shop/${product.category.parentId ? undefined : product.category.slug}` : "/shop";

  // Find parent category slug for breadcrumb
  let parentCategorySlug = "/shop";
  if (product.category) {
    if (!product.category.parentId) {
      parentCategorySlug = `/shop/${product.category.slug}`;
    } else {
      const parent = await prisma.productCategory.findUnique({ where: { id: product.category.parentId } });
      if (parent) parentCategorySlug = `/shop/${parent.slug}`;
    }
  }

  return (
    <div>
      <PageHero
        title={product.name}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(product.category ? [{ label: product.category.name, href: parentCategorySlug }] : []),
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
                  <Image src={product.images[0].url} alt={product.images[0].alt || product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" priority className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"><ShoppingBag size={64} className="text-text-tertiary" /></div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {product.images.slice(0, 4).map((img: any) => (
                    <div key={img.id} className="relative aspect-square rounded-md border border-border-subtle bg-surface-neutral overflow-hidden">
                      <Image src={img.url} alt={img.alt || product.name} fill sizes="(max-width: 1024px) 25vw, 12.5vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              {product.brand && <p className="text-caption text-accent font-medium mb-2 uppercase tracking-wider">{product.brand.name}</p>}
              <h1 className="text-h1 font-bold tracking-tight mb-4">{product.name}</h1>
              {product.productType === "subscription" && (
                <span className="inline-flex h-6 px-2.5 rounded-full bg-info/10 text-info text-caption font-medium mb-4">Subscription — billed monthly</span>
              )}

              <div className="flex items-center gap-3 mb-6">
                <span className="text-h2 font-bold text-accent">{formatCurrency(product.price)}</span>
                {product.compareAtPrice && <span className="text-body text-text-tertiary line-through">{formatCurrency(product.compareAtPrice)}</span>}
              </div>

              <p className="text-body text-text-secondary mb-6">{product.shortDescription}</p>

              <div className="border-t border-border-subtle pt-6 mb-6">
                <div className="text-body-sm text-text-secondary" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>

              {/* Story */}
              {product.story && (
                <div className="rounded-lg bg-surface-neutral/50 p-5 mb-6">
                  <p className="text-caption text-accent font-medium uppercase tracking-wider mb-2">Our Story</p>
                  <p className="text-body-sm text-text-secondary italic">{product.story}</p>
                </div>
              )}

              {/* Specs */}
              {product.specs && typeof product.specs === "object" && Object.keys(product.specs as Record<string, string>).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-body font-semibold mb-3">Key Specifications</h3>
                  <div className="rounded-lg border border-border-subtle overflow-hidden">
                    {Object.entries(product.specs as Record<string, string>).map(([key, value], i) => (
                      <div key={key} className={`flex items-center px-4 py-3 text-body-sm ${i % 2 === 0 ? "bg-white" : "bg-surface-neutral/30"}`}>
                        <span className="font-medium text-text-primary w-40 shrink-0">{key}</span>
                        <span className="text-text-secondary">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock */}
              <div className="mb-6">
                {inStock ? <p className="text-body-sm text-success">In Stock ({product.stock} available)</p> : <p className="text-body-sm text-error">Out of Stock</p>}
              </div>

              <AddToCartButton productId={product.id} disabled={!inStock} />
              {product.sku && <p className="text-caption text-text-tertiary mt-4">SKU: {product.sku}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Cross-sell */}
      {relatedProducts.length > 0 && (
        <section className="section-padding bg-bg-primary-dark text-text-on-dark">
          <div className="container-mvm">
            <h2 className="text-h2 font-bold tracking-tight mb-8">You might also like...</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rp: any) => (
                <Link key={rp.id} href={`/shop/${rp.slug}`} className="group rounded-lg border border-border-dark bg-surface-card-dark p-5 card-interactive">
                  <div className="relative aspect-square rounded-md bg-bg-primary-dark-elevated mb-4 overflow-hidden">
                    {rp.images[0] ? (
                      <Image src={rp.images[0].url} alt={rp.images[0].alt || rp.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    ) : (
                      <ShoppingBag size={32} className="text-text-on-dark-secondary" />
                    )}
                  </div>
                  <h3 className="text-body font-semibold group-hover:text-accent transition-colors">{rp.name}</h3>
                  <p className="text-body-sm text-text-on-dark-secondary">{formatCurrency(rp.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
