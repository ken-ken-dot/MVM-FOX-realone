"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Subcategory {
  id: string;
  name: string;
}

interface CategoryFiltersProps {
  basePath: string;
  currentFilters: Record<string, string | undefined>;
  subcategories: Subcategory[];
  isElectronics: boolean;
  isSoftware: boolean;
  isCatering: boolean;
  electronicsTags: string[];
  softwarePlatforms: string[];
  softwareLicenses: string[];
  cateringTiers: string[];
  cateringEvents: string[];
  priceMin: number;
  priceMax: number;
}

function buildUrl(basePath: string, current: Record<string, string | undefined>, key: string, value: string | null): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) {
    if (v && k !== key) params.set(k, v);
  }
  if (value) params.set(key, value);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border-subtle pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left mb-2"
      >
        <span className="text-body-sm font-semibold text-text-primary">{title}</span>
        {open ? <ChevronUp size={14} className="text-text-tertiary" /> : <ChevronDown size={14} className="text-text-tertiary" />}
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block px-2 py-1.5 rounded text-body-sm transition-colors",
        active
          ? "bg-accent/10 text-accent font-medium"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-neutral",
      )}
    >
      {label}
    </Link>
  );
}

export function CategoryFilters({
  basePath,
  currentFilters,
  subcategories,
  isElectronics,
  isSoftware,
  isCatering,
  electronicsTags,
  softwarePlatforms,
  softwareLicenses,
  cateringTiers,
  cateringEvents,
  priceMin,
  priceMax,
}: CategoryFiltersProps) {
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || "");

  const handlePriceApply = () => {
    // Navigate with price params via link
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(currentFilters)) {
      if (v && k !== "minPrice" && k !== "maxPrice") params.set(k, v);
    }
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    const qs = params.toString();
    window.location.href = qs ? `${basePath}?${qs}` : basePath;
  };

  const hasActiveFilters = Object.entries(currentFilters).some(
    ([k, v]) => v && !["minPrice", "maxPrice"].includes(k)
  );

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-6">
        <div className="rounded-lg border border-border-subtle bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-body font-semibold">Filters</h3>
            {hasActiveFilters && (
              <Link href={basePath} className="text-caption text-accent hover:underline">
                Clear all
              </Link>
            )}
          </div>

          {/* Subcategories */}
          <FilterSection title="Category">
            <FilterLink
              href={basePath}
              label={`All ${isElectronics ? "Electronics" : isSoftware ? "Software" : "Catering"}`}
              active={!currentFilters.sub}
            />
            {subcategories.map((sub) => (
              <FilterLink
                key={sub.id}
                href={buildUrl(basePath, currentFilters, "sub", sub.id)}
                label={sub.name}
                active={currentFilters.sub === sub.id}
              />
            ))}
          </FilterSection>

          {/* Electronics: Use-case tags */}
          {isElectronics && (
            <FilterSection title="Use Case">
              {electronicsTags.map((tag) => (
                <FilterLink
                  key={tag}
                  href={buildUrl(basePath, currentFilters, "tag", tag)}
                  label={tag}
                  active={currentFilters.tag === tag}
                />
              ))}
            </FilterSection>
          )}

          {/* Software: Platform */}
          {isSoftware && (
            <>
              <FilterSection title="Platform">
                {softwarePlatforms.map((platform) => (
                  <FilterLink
                    key={platform}
                    href={buildUrl(basePath, currentFilters, "platform", platform)}
                    label={platform}
                    active={currentFilters.platform === platform}
                  />
                ))}
              </FilterSection>
              <FilterSection title="License Type">
                {softwareLicenses.map((license) => (
                  <FilterLink
                    key={license}
                    href={buildUrl(basePath, currentFilters, "license", license)}
                    label={license}
                    active={currentFilters.license === license}
                  />
                ))}
              </FilterSection>
            </>
          )}

          {/* Catering: Event type + Tier */}
          {isCatering && (
            <>
              <FilterSection title="Event Type">
                {cateringEvents.map((event) => (
                  <FilterLink
                    key={event}
                    href={buildUrl(basePath, currentFilters, "event", event)}
                    label={event}
                    active={currentFilters.event === event}
                  />
                ))}
              </FilterSection>
              <FilterSection title="Package Tier">
                {cateringTiers.map((tier) => (
                  <FilterLink
                    key={tier}
                    href={buildUrl(basePath, currentFilters, "tier", tier)}
                    label={tier}
                    active={currentFilters.tier === tier}
                  />
                ))}
              </FilterSection>
            </>
          )}

          {/* Price Range */}
          <FilterSection title="Price Range">
            <div className="space-y-3 px-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder={`$${priceMin}`}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-8 w-full rounded border border-border-default bg-white px-2 text-caption focus:outline-none focus:ring-1 focus:ring-accent"
                  min={0}
                />
                <span className="text-text-tertiary">—</span>
                <input
                  type="number"
                  placeholder={`$${priceMax}`}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-8 w-full rounded border border-border-default bg-white px-2 text-caption focus:outline-none focus:ring-1 focus:ring-accent"
                  min={0}
                />
              </div>
              <button
                onClick={handlePriceApply}
                className="w-full h-8 rounded bg-accent text-text-on-accent text-caption font-medium hover:bg-accent-hover transition-colors"
              >
                Apply
              </button>
            </div>
          </FilterSection>
        </div>
      </div>
    </aside>
  );
}