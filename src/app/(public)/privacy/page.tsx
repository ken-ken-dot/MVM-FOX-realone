import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { AmbientBackground } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "MVM FOX Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div>
      <PageHero
        title="Privacy Policy"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />

      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="mixed" variant="light" />
        <div className="container-mvm max-w-3xl relative z-10">
          <p className="text-body-sm text-text-tertiary mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="space-y-8">
            <div>
              <h2 className="text-h3 font-semibold mb-3">Information We Collect</h2>
              <p className="text-body text-text-secondary">
                We collect information you provide directly to us, such as when you
                create an account, make a purchase, submit a catering request, or
                contact us. This may include your name, email address, phone number,
                shipping address, and payment information.
              </p>
            </div>

            <div>
              <h2 className="text-h3 font-semibold mb-3">How We Use Your Information</h2>
              <p className="text-body text-text-secondary">
                We use the information we collect to provide, maintain, and improve
                our services, process transactions, send communications, and respond
                to your inquiries.
              </p>
            </div>

            <div>
              <h2 className="text-h3 font-semibold mb-3">Information Sharing</h2>
              <p className="text-body text-text-secondary">
                We do not sell your personal information. We may share your
                information with third-party service providers who assist us in
                operating our business, subject to confidentiality obligations.
              </p>
            </div>

            <div>
              <h2 className="text-h3 font-semibold mb-3">Data Security</h2>
              <p className="text-body text-text-secondary">
                We implement appropriate security measures to protect your personal
                information against unauthorized access, alteration, disclosure, or
                destruction.
              </p>
            </div>

            <div>
              <h2 className="text-h3 font-semibold mb-3">Contact Us</h2>
              <p className="text-body text-text-secondary">
                If you have questions about this Privacy Policy, please contact us
                at{" "}
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
