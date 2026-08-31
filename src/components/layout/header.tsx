"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Shop", href: "/shop" },
  { label: "Brands", href: "/brands" },
  { label: "Catering", href: "/catering" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          const count = (data.items || []).reduce(
            (sum: number, item: { quantity: number }) => sum + item.quantity,
            0
          );
          setCartCount(count);
        }
      } catch {
        // silently fail
      }
    };
    fetchCartCount();
    // Re-fetch on focus (e.g., after adding to cart)
    window.addEventListener("focus", fetchCartCount);
    return () => window.removeEventListener("focus", fetchCartCount);
  }, []);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[var(--z-nav)] transition-all duration-[var(--motion-base)]",
        scrolled
          ? "bg-bg-primary-dark/95 backdrop-blur-md shadow-md"
          : "bg-transparent",
      )}
    >
      <div className="container-mvm">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center">
              <span className="text-h3 font-bold text-text-on-dark tracking-tight">
                MVM
              </span>
              <span className="text-h3 font-bold text-accent ml-1 tracking-tight">
                FOX
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 text-body-sm rounded-md transition-colors duration-[var(--motion-fast)]",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-accent font-medium"
                    : "text-text-on-dark-secondary hover:text-text-on-dark",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2 text-text-on-dark-secondary hover:text-text-on-dark transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/request-quote"
              className="hidden md:inline-flex h-9 px-4 items-center rounded-md bg-accent text-text-on-accent text-body-sm font-medium hover:bg-accent-hover transition-colors duration-[var(--motion-fast)]"
            >
              Get a Quote
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-text-on-dark-secondary hover:text-text-on-dark"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav — Full-height drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-bg-primary-dark z-[var(--z-dropdown)]">
          <nav className="container-mvm py-6 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-4 rounded-md text-body-lg transition-colors min-h-[44px] flex items-center",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-accent font-medium bg-accent/10"
                    : "text-text-on-dark-secondary hover:text-text-on-dark hover:bg-bg-primary-dark-elevated",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-6 pt-6 border-t border-border-dark">
              <Link
                href="/request-quote"
                className="flex items-center justify-center h-12 rounded-md bg-accent text-text-on-accent text-body font-medium hover:bg-accent-hover transition-colors"
              >
                Get a Quote
              </Link>
            </div>
            <div className="mt-4">
              <Link
                href="/track"
                className="flex items-center justify-center h-12 rounded-md border border-border-dark text-text-on-dark text-body font-medium hover:bg-bg-primary-dark-elevated transition-colors"
              >
                Track a Request
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
