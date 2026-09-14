import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Shield,
  Heart,
  Lightbulb,
  Users,
} from "lucide-react";
import { AboutVideoHero } from "@/components/sections/about-video-hero";
import { ScrollReveal, AmbientBackground } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about MVM FOX — a multi-service business platform delivering premium experiences.",
};

const values = [
  {
    icon: Shield,
    title: "Quality First",
    description:
      "Every product, service, and experience we deliver meets the highest standards of quality. We never ship anything we wouldn't use ourselves.",
  },
  {
    icon: Heart,
    title: "Client-Focused",
    description:
      "Your needs drive our approach. We listen, adapt, and deliver exactly what you envision — because your success is our success.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We continuously evolve, embracing new ideas and technologies to serve you better. Staying still isn't in our vocabulary.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We build lasting relationships with our clients, partners, and team — because great business is built on trust.",
  },
];

const stats = [
  { value: "3", label: "Business Lines" },
  { value: "50+", label: "Products & Services" },
  { value: "100%", label: "Commitment to Quality" },
  { value: "24/7", label: "Support Available" },
];

const timeline = [
  {
    year: "The Beginning",
    title: "A Vision Takes Shape",
    description:
      "MVM FOX was founded on a single belief: premium quality shouldn't be scattered across a dozen different providers. We brought catering, electronics, software, and professional services under one roof — each delivered with the same obsessive attention to detail.",
  },
  {
    year: "Building the Foundation",
    title: "Velvet Fox Catering Launches",
    description:
      "Our catering arm, Velvet Fox, was born from a love of exceptional food and unforgettable events. From intimate dinners to grand galas, Velvet Fox became known for turning occasions into experiences.",
  },
  {
    year: "Expanding Horizons",
    title: "Electronics & Software",
    description:
      "We launched MVM Electronics and MVM Software — our first-party product lines designed from the ground up. No white-labeling, no shortcuts. Every laptop, phone, and app carries the MVM FOX standard of quality.",
  },
  {
    year: "Today & Beyond",
    title: "The Platform Grows",
    description:
      "Today, MVM FOX is a full multi-service business platform — connecting premium products, professional services, and world-class catering under a single, trusted brand. We're just getting started.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* ─── Cinematic Video Hero ─── */}
      <AboutVideoHero
        videoSrc="https://videos.pexels.com/video-files/3253199/3253199-uhd_2560_1440_25fps.mp4"
        posterSrc="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80"
        title={"Our Story.\nCrafted With Purpose."}
        subtitle="About MVM FOX"
      />

      {/* ─── Story Section ─── */}
      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="mixed" variant="light" />
        <div className="container-mvm max-w-4xl relative z-10">
          <ScrollReveal>
            <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-4">
              Who We Are
            </p>
            <h2 className="text-h1 font-bold tracking-tight mb-8">
              A Multi-Service Platform Built on Excellence
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <p className="text-body-lg text-text-secondary mb-6 leading-relaxed">
              MVM FOX was founded with a simple mission: to bring premium
              quality services, products, and experiences under one roof. We
              believe that excellence isn&apos;t just about what you deliver
              — it&apos;s about how you deliver it.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-body-lg text-text-secondary mb-6 leading-relaxed">
              From our catering arm, Velvet Fox, to our curated electronics
              and software product lines, every touchpoint is designed with
              care, attention to detail, and an unwavering commitment to
              quality. We don&apos;t believe in &quot;good enough.&quot;
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <p className="text-body-lg text-text-secondary leading-relaxed">
              Whether you&apos;re planning a wedding, equipping your office,
              or looking for software that actually works — MVM FOX is
              built to deliver. Not someday. Today.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="relative py-16 bg-bg-primary-dark text-text-on-dark overflow-hidden">
        <AmbientBackground icons="mixed" variant="dark" />
        <div className="container-mvm relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-display font-bold text-accent mb-1">
                  {stat.value}
                </p>
                <p className="text-body-sm text-text-on-dark-secondary">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mission + Values ─── */}
      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="tech" variant="light" />
        <div className="container-mvm relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
                Our Mission
              </p>
              <h2 className="text-h1 font-bold tracking-tight max-w-3xl mx-auto">
                To deliver exceptional experiences across catering,
                products, and professional services.
              </h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto mt-4">
                Building lasting relationships through quality, trust, and
                innovation — one experience at a time.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <ScrollReveal key={value.title} delay={idx * 100}>
                  <div className="rounded-xl border border-border-subtle bg-white p-6 text-center h-full">
                    <div className="inline-flex p-3 rounded-xl bg-accent/10 text-accent mb-4">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-h4 font-semibold mb-2">
                      {value.title}
                    </h3>
                    <p className="text-body-sm text-text-secondary">
                      {value.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Timeline / Journey ─── */}
      <section className="relative section-padding bg-bg-primary-dark text-text-on-dark overflow-hidden">
        <AmbientBackground icons="mixed" variant="dark" />
        <div className="container-mvm relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
                Our Journey
              </p>
              <h2 className="text-h1 font-bold tracking-tight">
                How We Got Here
              </h2>
            </div>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto">
            {timeline.map((item, idx) => (
              <ScrollReveal key={item.title} delay={idx * 100}>
                <div className="relative pl-8 pb-12 last:pb-0">
                  {/* Timeline line */}
                  {idx < timeline.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-px bg-border-dark" />
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>

                  <p className="text-accent text-caption font-medium uppercase tracking-wider mb-1">
                    {item.year}
                  </p>
                  <h3 className="text-h3 font-bold mb-2">{item.title}</h3>
                  <p className="text-body text-text-on-dark-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Brand Showcase Preview ─── */}
      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="mixed" variant="light" />
        <div className="container-mvm relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-2">
                Our Brands
              </p>
              <h2 className="text-h1 font-bold tracking-tight">
                The MVM FOX Family
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "MVM Electronics",
                tagline: "Engineered for performance",
                image:
                  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
                link: "/shop/electronics",
              },
              {
                name: "MVM Software",
                tagline: "Built to empower",
                image:
                  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
                link: "/shop/software",
              },
              {
                name: "Velvet Fox",
                tagline: "Elevating every occasion",
                image:
                  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
                link: "/brands/velvet-fox",
              },
            ].map((brand, idx) => (
              <ScrollReveal key={brand.name} delay={idx * 100}>
                <Link
                  href={brand.link}
                  className="group relative block rounded-xl overflow-hidden aspect-[4/3] card-interactive"
                >
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-accent text-caption font-medium uppercase tracking-wider mb-1">
                      {brand.tagline}
                    </p>
                    <h3 className="text-h3 font-bold text-white mb-2">
                      {brand.name}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent group-hover:gap-2.5 transition-all">
                      Explore
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative section-padding bg-bg-primary-dark text-text-on-dark overflow-hidden">
        <AmbientBackground icons="mixed" variant="dark" />
        <div className="container-mvm text-center relative z-10">
          <h2 className="text-h1 md:text-display font-bold tracking-tight mb-4">
            Ready to Experience MVM FOX?
          </h2>
          <p className="text-body-lg text-text-on-dark-secondary max-w-xl mx-auto mb-8">
            Whether you need catering, want to shop our products, or are
            looking for professional services — we&apos;re here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/request-quote"
              className="inline-flex items-center justify-center h-12 px-7 rounded-md bg-accent text-text-on-accent text-body font-medium hover:bg-accent-hover transition-colors"
            >
              Get a Quote
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-12 px-7 rounded-md border border-border-dark text-text-on-dark text-body font-medium hover:bg-bg-primary-dark-elevated transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
