import { cn } from "@/lib/utils";
import Link from "next/link";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  dark?: boolean;
  className?: string;
}

export function PageHero({
  title,
  subtitle,
  breadcrumbs,
  dark = true,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "pt-32 pb-16 md:pt-40 md:pb-20",
        dark ? "bg-bg-primary-dark text-text-on-dark" : "bg-bg-primary-light text-text-primary",
        className,
      )}
    >
      <div className="container-mvm">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-body-sm mb-6">
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {idx > 0 && (
                  <span className={dark ? "text-text-on-dark-secondary" : "text-text-tertiary"}>
                    /
                  </span>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className={cn(
                      "transition-colors",
                      dark
                        ? "text-text-on-dark-secondary hover:text-text-on-dark"
                        : "text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={dark ? "text-text-on-dark" : "text-text-primary"}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-h1 md:text-display font-bold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "mt-4 text-body-lg max-w-2xl",
              dark ? "text-text-on-dark-secondary" : "text-text-secondary",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
