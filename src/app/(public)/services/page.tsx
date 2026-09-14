import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/sections/page-hero";
import { ScrollReveal, AmbientBackground } from "@/components/ui";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Professional services from MVM FOX. Explore our full range of business solutions.",
};

async function getServices() {
  try {
    const [services, categories] = await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.serviceCategory.findMany({
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return { services, categories };
  } catch {
    return { services: [], categories: [] };
  }
}

export default async function ServicesPage() {
  const { services, categories } = await getServices();

  return (
    <div>
      <PageHero
        title="Our Services"
        subtitle="Professional solutions tailored to your needs. From initial consultation to final delivery."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        backgroundImage={{
          src: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80",
          alt: "Professional team collaborating on business solutions",
        }}
      />

      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="tech" variant="light" />
        <div className="container-mvm relative z-10">
          {/* Category filter — rendered as anchor links, works without JS */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              <a
                href="#all"
                className="h-9 px-4 rounded-full bg-accent text-text-on-accent text-body-sm font-medium"
              >
                All
              </a>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.slug}`}
                  className="h-9 px-4 rounded-full border border-border-default text-text-secondary text-body-sm font-medium hover:bg-surface-neutral transition-colors"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          )}

          <ScrollReveal>
          {services.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase size={48} className="mx-auto text-text-tertiary mb-4" />
              <h3 className="text-h3 font-semibold mb-2">No services yet</h3>
              <p className="text-body text-text-secondary">
                We&apos;re preparing our service offerings. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group rounded-lg border border-border-subtle bg-white overflow-hidden card-interactive"
                >
                  {service.imageUrl && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={service.imageUrl}
                        alt={service.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                  {service.category && (
                    <p className="text-caption text-accent font-medium mb-2">
                      {service.category.name}
                    </p>
                  )}
                  <h3 className="text-h4 font-semibold mb-2 group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-body-sm text-text-secondary mb-4 line-clamp-3">
                    {service.shortDescription}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent group-hover:gap-2.5 transition-all">
                    Learn more <ArrowRight size={14} />
                  </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
