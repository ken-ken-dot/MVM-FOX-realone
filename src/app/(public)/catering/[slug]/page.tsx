import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";
import { AmbientBackground } from "@/components/ui";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await prisma.cateringPackage.findUnique({ where: { slug } });

  if (!pkg) return { title: "Package Not Found" };

  return {
    title: pkg.name,
    description: pkg.description || `Catering package: ${pkg.name}`,
  };
}

export default async function CateringPackagePage({ params }: Props) {
  const { slug } = await params;

  const pkg = await prisma.cateringPackage.findUnique({
    where: { slug },
    include: { menu: true },
  });

  if (!pkg) notFound();

  const includes = (pkg.includes as string[]) || [];

  return (
    <div>
      <PageHero
        title={pkg.name}
        subtitle={pkg.description || undefined}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Catering", href: "/catering" },
          { label: pkg.name },
        ]}
      />

      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="catering" variant="light" />
        <div className="container-mvm max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {pkg.menu && (
                <p className="text-caption text-accent font-medium mb-2 uppercase tracking-wider">
                  {pkg.menu.name}
                </p>
              )}

              <p className="text-body-lg text-text-secondary mb-8">
                {pkg.description}
              </p>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {pkg.pricePerGuest && (
                  <div className="rounded-lg border border-border-subtle bg-white p-4">
                    <p className="text-caption text-text-tertiary mb-1">
                      Price per Guest
                    </p>
                    <p className="text-h3 font-bold text-accent">
                      {formatCurrency(pkg.pricePerGuest)}
                    </p>
                  </div>
                )}
                {pkg.minimumGuests && (
                  <div className="rounded-lg border border-border-subtle bg-white p-4">
                    <p className="text-caption text-text-tertiary mb-1">
                      Minimum Guests
                    </p>
                    <p className="text-h3 font-bold">{pkg.minimumGuests}</p>
                  </div>
                )}
              </div>

              {/* Includes */}
              {includes.length > 0 && (
                <div>
                  <h2 className="text-h2 font-bold tracking-tight mb-4">
                    What&apos;s Included
                  </h2>
                  <ul className="space-y-3">
                    {includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-body">
                        <Check
                          size={18}
                          className="text-success mt-0.5 shrink-0"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 rounded-lg border border-border-subtle bg-white p-6">
                <h3 className="text-h4 font-semibold mb-4">
                  Interested in this package?
                </h3>
                <p className="text-body-sm text-text-secondary mb-6">
                  Request a customized quote for your event.
                </p>
                <Link
                  href={`/request-catering?package=${pkg.id}`}
                  className="flex items-center justify-center h-11 rounded-md bg-accent text-text-on-accent text-body-sm font-medium hover:bg-accent-hover transition-colors"
                >
                  Request Catering
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
