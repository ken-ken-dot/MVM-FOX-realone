import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  dark?: boolean;
  className?: string;
  backgroundImage?: {
    src: string;
    alt: string;
  };
}

export function PageHero({
  title,
  subtitle,
  breadcrumbs,
  dark = true,
  className,
  backgroundImage,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden",
        backgroundImage ? "min-h-[50vh] md:min-h-[55vh] flex items-end" : "",
        "text-text-on-dark",
        className,
      )}
    >
      {/* Background image */}
      {backgroundImage && (
        <>
          <Image
            src={backgroundImage.src}
            alt={backgroundImage.alt}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary-dark/95 via-bg-primary-dark/60 to-bg-primary-dark/30" />
          {/* Subtle side gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary-dark/40 to-transparent" />
        </>
      )}

      {/* Content */}
      <div className="container-mvm relative z-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-body-sm mb-6">
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {idx > 0 && (
                  <span className="text-text-on-dark-secondary">
                    /
                  </span>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors text-text-on-dark-secondary hover:text-text-on-dark"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-text-on-dark">
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
          <p className="mt-4 text-body-lg max-w-2xl text-text-on-dark-secondary">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
