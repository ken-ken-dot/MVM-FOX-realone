import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, HelpCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/sections/page-hero";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
  });

  if (!service) return { title: "Service Not Found" };

  return {
    title: service.title,
    description: service.shortDescription,
    openGraph: { title: service.title, description: service.shortDescription },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      category: true,
      faqs: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!service) notFound();

  const benefits = (service.benefits as string[]) || [];
  const process = (service.process as string[]) || [];

  // Cross-sell: other services in same category
  const relatedServices = await prisma.service.findMany({
    where: {
      isActive: true,
      id: { not: service.id },
      ...(service.categoryId ? { categoryId: service.categoryId } : {}),
    },
    take: 3,
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <PageHero
        title={service.title}
        subtitle={service.shortDescription}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
      />

      {/* Main content */}
      <section className="section-padding bg-bg-primary-light">
        <div className="container-mvm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Content */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none text-text-primary">
                <div
                  dangerouslySetInnerHTML={{
                    __html: service.description
                      .split("\n")
                      .map((line) => (line.trim() ? `<p>${line}</p>` : ""))
                      .join(""),
                  }}
                />
              </div>

              {/* Benefits */}
              {benefits.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-h2 font-bold tracking-tight mb-6">
                    Benefits
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {benefits.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-body"
                      >
                        <Check
                          size={18}
                          className="text-success mt-0.5 shrink-0"
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Process */}
              {process.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-h2 font-bold tracking-tight mb-6">
                    Our Process
                  </h2>
                  <ol className="space-y-4">
                    {process.map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-4"
                      >
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-text-on-accent text-body-sm font-bold shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-body pt-1">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 rounded-lg border border-border-subtle bg-white p-6">
                <h3 className="text-h4 font-semibold mb-4">
                  Interested in this service?
                </h3>
                <p className="text-body-sm text-text-secondary mb-6">
                  Get a personalized quote tailored to your specific needs.
                </p>
                <Link
                  href={`/request-quote?service=${service.id}`}
                  className="flex items-center justify-center h-11 rounded-md bg-accent text-text-on-accent text-body-sm font-medium hover:bg-accent-hover transition-colors"
                >
                  Request a Quote
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* FAQs */}
      {service.faqs.length > 0 && (
        <section className="section-padding bg-bg-primary-dark text-text-on-dark">
          <div className="container-mvm">
            <h2 className="text-h2 font-bold tracking-tight mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="rounded-lg border border-border-dark bg-surface-card-dark p-6"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle
                      size={18}
                      className="text-accent mt-0.5 shrink-0"
                    />
                    <h3 className="text-body font-semibold">{faq.question}</h3>
                  </div>
                  <p className="text-body-sm text-text-on-dark-secondary pl-7">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cross-sell */}
      {relatedServices.length > 0 && (
        <section className="section-padding bg-bg-primary-light">
          <div className="container-mvm">
            <h2 className="text-h2 font-bold tracking-tight mb-8">
              You might also need...
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedServices.map((rs) => (
                <Link
                  key={rs.id}
                  href={`/services/${rs.slug}`}
                  className="group rounded-lg border border-border-subtle bg-white p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-h4 font-semibold mb-2 group-hover:text-accent transition-colors">
                    {rs.title}
                  </h3>
                  <p className="text-body-sm text-text-secondary line-clamp-2">
                    {rs.shortDescription}
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
