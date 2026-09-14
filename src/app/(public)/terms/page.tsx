import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { AmbientBackground } from "@/components/ui";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "MVM FOX Terms of Service",
};

export default function TermsPage() {
  return (
    <div>
      <PageHero
        title="Terms of Service"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]}
      />

      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="mixed" variant="light" />
        <div className="container-mvm max-w-3xl relative z-10">
          <p className="text-body-sm text-text-tertiary mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="space-y-8">
            <div>
              <h2 className="text-h3 font-semibold mb-3">Acceptance of Terms</h2>
              <p className="text-body text-text-secondary">
                By accessing or using the MVM FOX platform, you agree to be bound
                by these Terms of Service. If you do not agree to these terms,
                please do not use our services.
              </p>
            </div>

            <div>
              <h2 className="text-h3 font-semibold mb-3">Services</h2>
              <p className="text-body text-text-secondary">
                MVM FOX provides a multi-service business platform including
                catering services, product sales, and professional services.
                Specific terms may apply to individual services.
              </p>
            </div>

            <div>
              <h2 className="text-h3 font-semibold mb-3">Orders and Payments</h2>
              <p className="text-body text-text-secondary">
                All orders are subject to availability. Payment terms are specified
                at the time of order. We reserve the right to refuse or cancel
                any order for any reason.
              </p>
            </div>

            <div>
              <h2 className="text-h3 font-semibold mb-3">Intellectual Property</h2>
              <p className="text-body text-text-secondary">
                All content on this platform, including text, graphics, logos, and
                software, is the property of MVM FOX and is protected by
                intellectual property laws.
              </p>
            </div>

            <div>
              <h2 className="text-h3 font-semibold mb-3">Contact Us</h2>
              <p className="text-body text-text-secondary">
                If you have questions about these Terms, please contact us at{" "}
                <a href="mailto:info@mvmfox.com" className="text-accent hover:underline">
                  info@mvmfox.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
