import type { Metadata } from "next";
import Link from "next/link";
import { UtensilsCrossed, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";

export const metadata: Metadata = {
  title: "Catering",
  description:
    "Premium catering services from Velvet Catering under MVM FOX. Events, weddings, corporate functions.",
};

async function getCateringData() {
  try {
    const [menus, events] = await Promise.all([
      prisma.cateringMenu.findMany({
        where: { isActive: true },
        include: {
          packages: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.cateringEvent.findMany({
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return { menus, events };
  } catch {
    return { menus: [], events: [] };
  }
}

export default async function CateringPage() {
  const { menus, events } = await getCateringData();

  const hasPackages = menus.some((m) => m.packages.length > 0);

  return (
    <div>
      <PageHero
        title="Catering"
        subtitle="Exceptional culinary experiences for every occasion. From intimate gatherings to grand celebrations."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Catering" }]}
      />

      {/* Event types */}
      {events.length > 0 && (
        <section className="section-padding bg-bg-primary-light">
          <div className="container-mvm">
            <div className="text-center mb-12">
              <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
                We Cater
              </p>
              <h2 className="text-h1 font-bold tracking-tight">
                Every Type of Event
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-border-subtle bg-white p-6 text-center hover:shadow-md transition-shadow"
                >
                  {event.icon && (
                    <span className="text-3xl mb-3 block">{event.icon}</span>
                  )}
                  <h3 className="text-body font-semibold">{event.name}</h3>
                  {event.description && (
                    <p className="text-body-sm text-text-secondary mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Menus & Packages */}
      {hasPackages && (
        <section className="section-padding bg-bg-primary-dark text-text-on-dark">
          <div className="container-mvm">
            <div className="text-center mb-12">
              <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
                Our Menus
              </p>
              <h2 className="text-h1 font-bold tracking-tight">
                Catering Packages
              </h2>
            </div>

            {menus.map(
              (menu) =>
                menu.packages.length > 0 && (
                  <div key={menu.id} className="mb-12 last:mb-0">
                    <h3 className="text-h2 font-bold mb-6">{menu.name}</h3>
                    {menu.description && (
                      <p className="text-body text-text-on-dark-secondary mb-6 max-w-2xl">
                        {menu.description}
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {menu.packages.map((pkg) => (
                        <Link
                          key={pkg.id}
                          href={`/catering/${pkg.slug}`}
                          className="group rounded-lg border border-border-dark bg-surface-card-dark p-6 hover:border-accent/30 transition-colors"
                        >
                          <h4 className="text-h4 font-semibold mb-2 group-hover:text-accent transition-colors">
                            {pkg.name}
                          </h4>
                          {pkg.description && (
                            <p className="text-body-sm text-text-on-dark-secondary mb-4 line-clamp-2">
                              {pkg.description}
                            </p>
                          )}
                          {pkg.pricePerGuest && (
                            <p className="text-accent font-semibold mb-3">
                              {formatCurrency(pkg.pricePerGuest)} per guest
                            </p>
                          )}
                          {pkg.minimumGuests && (
                            <p className="text-caption text-text-on-dark-secondary">
                              Minimum {pkg.minimumGuests} guests
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ),
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding bg-bg-primary-light">
        <div className="container-mvm text-center">
          <UtensilsCrossed
            size={48}
            className="mx-auto text-accent mb-6"
          />
          <h2 className="text-h1 font-bold tracking-tight mb-4">
            Ready to Plan Your Event?
          </h2>
          <p className="text-body-lg text-text-secondary max-w-xl mx-auto mb-8">
            Tell us about your event and we&apos;ll create a customized
            catering experience just for you.
          </p>
          <Link
            href="/request-catering"
            className="inline-flex items-center h-12 px-7 rounded-md bg-accent text-text-on-accent text-body font-medium hover:bg-accent-hover transition-colors"
          >
            Request Catering
            <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
