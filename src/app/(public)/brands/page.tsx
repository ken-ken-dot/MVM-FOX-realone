import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/sections/page-hero";

export const metadata: Metadata = {
  title: "Brands",
  description:
    "The brands under MVM FOX. Discover our family of businesses.",
};

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

  return (
    <div>
      <PageHero
        title="Our Brands"
        subtitle="The MVM FOX family of businesses — each bringing something unique to the table."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Brands" }]}
      />

      <section className="section-padding bg-bg-primary-light">
        <div className="container-mvm">
          {brands.length === 0 ? (
            <div className="text-center py-20">
              <Building2 size={48} className="mx-auto text-text-tertiary mb-4" />
              <h3 className="text-h3 font-semibold mb-2">No brands yet</h3>
              <p className="text-body text-text-secondary">
                We&apos;re building our family of brands. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group rounded-lg border border-border-subtle bg-white overflow-hidden hover:shadow-md transition-shadow"
                >
                  {brand.coverImageUrl && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={brand.coverImageUrl}
                        alt={`${brand.name} brand cover image`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-h2 font-bold mb-2 group-hover:text-accent transition-colors">
                      {brand.name}
                    </h2>
                    {brand.tagline && (
                      <p className="text-body text-accent mb-2">
                        {brand.tagline}
                      </p>
                    )}
                    {brand.description && (
                      <p className="text-body-sm text-text-secondary line-clamp-3">
                        {brand.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
