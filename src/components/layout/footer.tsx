import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/about#careers" },
  ],
  services: [
    { label: "All Services", href: "/services" },
    { label: "Request Quote", href: "/request-quote" },
    { label: "Catering", href: "/catering" },
  ],
  shop: [
    { label: "Shop", href: "/shop" },
    { label: "Cart", href: "/cart" },
    { label: "Track a Request", href: "/track" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-bg-primary-dark text-text-on-dark">
      <div className="container-mvm section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <span className="text-h3 font-bold text-text-on-dark tracking-tight">
                MVM
              </span>
              <span className="text-h3 font-bold text-accent ml-1 tracking-tight">
                FOX
              </span>
            </Link>
            <p className="text-body-sm text-text-on-dark-secondary max-w-sm mb-6">
              A multi-service business platform delivering premium catering,
              products, and professional services.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:info@mvmfox.com"
                className="flex items-center gap-2 text-body-sm text-text-on-dark-secondary hover:text-text-on-dark transition-colors"
              >
                <Mail size={16} />
                info@mvmfox.com
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 text-body-sm text-text-on-dark-secondary hover:text-text-on-dark transition-colors"
              >
                <Phone size={16} />
                (123) 456-7890
              </a>
              <span className="flex items-center gap-2 text-body-sm text-text-on-dark-secondary">
                <MapPin size={16} />
                United States
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-body-sm font-semibold text-text-on-dark mb-4 capitalize">
                {category === "company"
                  ? "Company"
                  : category === "shop"
                    ? "Shop"
                    : category}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-text-on-dark-secondary hover:text-text-on-dark transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border-dark">
        <div className="container-mvm py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-caption text-text-on-dark-secondary">
            &copy; {new Date().getFullYear()} MVM FOX. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-caption text-text-on-dark-secondary hover:text-text-on-dark transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-caption text-text-on-dark-secondary hover:text-text-on-dark transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
