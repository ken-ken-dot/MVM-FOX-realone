import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about MVM FOX — a multi-service business platform delivering premium experiences.",
};

export default function AboutPage() {
  return (
    <div>
      <PageHero
        title="About MVM FOX"
        subtitle="A multi-service business platform built on quality, trust, and exceptional experiences."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <section className="section-padding bg-bg-primary-light">
        <div className="container-mvm max-w-3xl">
          <h2 className="text-h2 font-bold tracking-tight mb-6">
            Our Story
          </h2>
          <p className="text-body-lg text-text-secondary mb-6">
            MVM FOX was founded with a simple mission: to bring premium quality
            services, products, and experiences under one roof. We believe that
            excellence isn&apos;t just about what you deliver — it&apos;s about
            how you deliver it.
          </p>
          <p className="text-body-lg text-text-secondary mb-6">
            From our catering arm, Velvet Fox, to our curated product
            shop and professional services, every touchpoint is designed with
            care, attention to detail, and an unwavering commitment to quality.
          </p>

          <h2 className="text-h2 font-bold tracking-tight mt-12 mb-6">
            Our Mission
          </h2>
          <p className="text-body-lg text-text-secondary">
            To deliver exceptional experiences across catering, products, and
            professional services — building lasting relationships through
            quality, trust, and innovation.
          </p>
        </div>
      </section>

      <section className="section-padding bg-bg-primary-dark text-text-on-dark">
        <div className="container-mvm">
          <h2 className="text-h2 font-bold tracking-tight mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Quality First",
                description:
                  "Every product, service, and experience we deliver meets the highest standards of quality.",
              },
              {
                title: "Client-Focused",
                description:
                  "Your needs drive our approach. We listen, adapt, and deliver exactly what you envision.",
              },
              {
                title: "Innovation",
                description:
                  "We continuously evolve, embracing new ideas and technologies to serve you better.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-lg border border-border-dark bg-surface-card-dark p-6 text-center"
              >
                <h3 className="text-h4 font-semibold mb-3">{value.title}</h3>
                <p className="text-body-sm text-text-on-dark-secondary">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
