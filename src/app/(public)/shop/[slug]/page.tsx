import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ShoppingBag, ArrowLeft, Monitor, Code, UtensilsCrossed, X, SlidersHorizontal, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, cn } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";
import { CategoryHero } from "@/components/sections/category-hero";
import { ScrollReveal, AmbientBackground, EmptyState } from "@/components/ui";
import { AddToCartButton } from "./add-to-cart-button";
import { CategoryFilters } from "./category-filters";

const categoryIcons: Record<string, React.ElementType> = {
  electronics: Monitor,
  software: Code,
  "catering-shop": UtensilsCrossed,
};

// Filter options per category
const electronicsTagFilters = ["Home", "Office", "Work", "Travel", "Gaming", "Creative"];
const softwarePlatformFilters = ["Cross-platform", "Web", "macOS/Windows"];
const softwareLicenseFilters = ["Subscription", "One-time"];
const cateringTierFilters = ["Classic", "Premium", "Signature"];
const cateringEventFilters = ["Corporate", "Wedding", "Private Event", "Conference", "Party"];

interface SearchParams {
  sub?: string;
  tag?: string;
  platform?: string;
  license?: string;
  tier?: string;
  event?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.productCategory.findUnique({ where: { slug } });
  if (category && !category.parentId) {
    return { title: category.name, description: category.description || `Browse ${category.name} from MVM FOX.` };
  }
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
    return renderCategoryPage(topLevelCategory, sp);
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

// Build filter params into URL search params string
function buildFilterUrl(basePath: string, filters: SearchParams, key: string, value: string | null): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v && k !== key) params.set(k, v);
  }
  if (value) params.set(key, value);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

// Active filter chip component
function FilterChip({ label, onRemove }: { label: string; onRemove: string }) {
  return (
    <Link
      href={onRemove}
      className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-accent/10 text-accent text-caption font-medium hover:bg-accent/20 transition-colors"
    >
      {label}
      <X size={12} />
    </Link>
  );
}

// ═══ CATEGORY PAGE ═══
async function renderCategoryPage(topLevel: { id: string; slug: string; name: string; description: string | null; imageUrl?: string | null }, sp: SearchParams) {
  const Icon = categoryIcons[topLevel.slug] || Monitor;
  const basePath = `/shop/${topLevel.slug}`;

  const subcategories = await prisma.productCategory.findMany({
    where: { parentId: topLevel.id },
    orderBy: { sortOrder: "asc" },
  });

  // ── Build product query with filters ──
  const categoryIds = sp.sub
    ? [sp.sub]
    : [topLevel.id, ...subcategories.map((s) => s.id)];

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
    isActive: true,
    categoryId: { in: categoryIds },
  };

  // Tag filter (Electronics)
  if (sp.tag) {
    where.tags = { has: sp.tag };
  }

  // Platform filter (Software)
  if (sp.platform) {
    where.platform = sp.platform;
  }

  // License filter (Software)
  if (sp.license) {
    where.licenseType = sp.license;
  }

  // Price range
  if (sp.minPrice || sp.maxPrice) {
    where.price = {};
    if (sp.minPrice) (where.price as Record<string, number>).gte = parseFloat(sp.minPrice);
    if (sp.maxPrice) (where.price as Record<string, number>).lte = parseFloat(sp.maxPrice);
  }

  // Search query
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { shortDescription: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: { images: { where: { isPrimary: true }, take: 1 }, category: true, brand: true },
    orderBy: { sortOrder: "asc" },
  });

  // Compute price range for the slider
  const priceStats = await prisma.product.aggregate({
    where: { status: "PUBLISHED", isActive: true, categoryId: { in: [topLevel.id, ...subcategories.map((s) => s.id)] } },
    _min: { price: true },
    _max: { price: true },
  });
  const priceMin = Number(priceStats._min.price || 0);
  const priceMax = Number(priceStats._max.price || 1000);

  const selectedSub = sp.sub ? subcategories.find((s) => s.id === sp.sub) : null;

  // Build active filter chips
  const activeFilters: { label: string; removeUrl: string }[] = [];
  if (selectedSub) activeFilters.push({ label: selectedSub.name, removeUrl: buildFilterUrl(basePath, sp, "sub", null) });
  if (sp.tag) activeFilters.push({ label: sp.tag, removeUrl: buildFilterUrl(basePath, sp, "tag", null) });
  if (sp.platform) activeFilters.push({ label: sp.platform, removeUrl: buildFilterUrl(basePath, sp, "platform", null) });
  if (sp.license) activeFilters.push({ label: sp.license, removeUrl: buildFilterUrl(basePath, sp, "license", null) });
  if (sp.tier) activeFilters.push({ label: sp.tier, removeUrl: buildFilterUrl(basePath, sp, "tier", null) });
  if (sp.event) activeFilters.push({ label: sp.event, removeUrl: buildFilterUrl(basePath, sp, "event", null) });
  if (sp.minPrice) activeFilters.push({ label: `Min $${sp.minPrice}`, removeUrl: buildFilterUrl(basePath, sp, "minPrice", null) });
  if (sp.maxPrice) activeFilters.push({ label: `Max $${sp.maxPrice}`, removeUrl: buildFilterUrl(basePath, sp, "maxPrice", null) });
  if (sp.q) activeFilters.push({ label: `"${sp.q}"`, removeUrl: buildFilterUrl(basePath, sp, "q", null) });

  // Determine which filter sets to show
  const isElectronics = topLevel.slug === "electronics";
  const isSoftware = topLevel.slug === "software";
  const isCatering = topLevel.slug === "catering-shop";

  return (
    <div>
      <CategoryHero
        name={topLevel.name}
        description={topLevel.description}
        backgroundImage={topLevel.imageUrl || (products.length > 0 ? products[0].images[0]?.url : undefined)}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: topLevel.name }]}
      />

      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="tech" variant="light" />
        <div className="container-mvm relative z-10">
          {/* Subcategory chips */}
          <ScrollReveal>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Link href="/shop" className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary hover:text-text-primary transition-colors">
                <ArrowLeft size={14} /> All Categories
              </Link>
              <span className="text-text-tertiary">|</span>
              <Link href={basePath} className={cn(
                "h-9 px-4 rounded-full text-body-sm font-medium transition-colors",
                !sp.sub ? "bg-accent text-text-on-accent" : "border border-border-default text-text-secondary hover:bg-surface-neutral",
              )}>
                All {topLevel.name}
              </Link>
              {subcategories.map((sub) => (
                <Link key={sub.id} href={buildFilterUrl(basePath, sp, "sub", sub.id)} className={cn(
                  "h-9 px-4 rounded-full text-body-sm font-medium transition-colors",
                  sp.sub === sub.id ? "bg-accent text-text-on-accent" : "border border-border-default text-text-secondary hover:bg-surface-neutral",
                )}>
                  {sub.name}
                </Link>
              ))}
            </div>
          </ScrollReveal>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <SlidersHorizontal size={14} className="text-text-tertiary" />
              <span className="text-caption text-text-tertiary">Active filters:</span>
              {activeFilters.map((f) => (
                <FilterChip key={f.label} label={f.label} onRemove={f.removeUrl} />
              ))}
              <Link href={basePath} className="text-caption text-accent hover:underline ml-1">Clear all</Link>
            </div>
          )}

          {/* Content area with sidebar filters + product grid */}
          <div className="flex gap-8">
            {/* Filter sidebar */}
            <CategoryFilters
              basePath={basePath}
              currentFilters={sp as Record<string, string | undefined>}
              subcategories={subcategories.map((s) => ({ id: s.id, name: s.name }))}
              isElectronics={isElectronics}
              isSoftware={isSoftware}
              isCatering={isCatering}
              electronicsTags={electronicsTagFilters}
              softwarePlatforms={softwarePlatformFilters}
              softwareLicenses={softwareLicenseFilters}
              cateringTiers={cateringTierFilters}
              cateringEvents={cateringEventFilters}
              priceMin={priceMin}
              priceMax={priceMax}
            />

            {/* Product grid */}
            <div className="flex-1 min-w-0">
              <p className="text-body-sm text-text-secondary mb-6">
                {products.length} product{products.length !== 1 ? "s" : ""}
                {selectedSub ? ` in ${selectedSub.name}` : ""}
              </p>

              {products.length === 0 ? (
                <EmptyState
                  title="No products match your filters"
                  description="Try adjusting your filters or browse all products in this category."
                  icon={<Search size={32} className="text-text-tertiary" />}
                  action={
                    <Link href={basePath} className="text-body-sm text-accent hover:underline">
                      Clear all filters
                    </Link>
                  }
                />
              ) : (
                <ScrollReveal>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => {
                      const img = p.images[0];
                      return (
                        <Link key={p.id} href={`/shop/${p.slug}`} className="group rounded-lg border border-border-subtle bg-white overflow-hidden card-interactive">
                          <div className="relative aspect-square bg-surface-neutral overflow-hidden">
                            {img ? (
                              <Image src={img.url} alt={img.alt || p.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
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
                            {/* Tags */}
                            {p.tags && p.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {p.tags.slice(0, 3).map((tag: string) => (
                                  <span key={tag} className="inline-flex h-5 px-1.5 rounded bg-surface-neutral text-caption text-text-tertiary">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
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
          </div>
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

      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="tech" variant="light" />
        <div className="container-mvm relative z-10">
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
        <section className="relative section-padding bg-bg-primary-dark text-text-on-dark overflow-hidden">
          <AmbientBackground icons="tech" variant="dark" />
          <div className="container-mvm relative z-10">
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
