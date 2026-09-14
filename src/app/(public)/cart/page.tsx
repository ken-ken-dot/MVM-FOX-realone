"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2, ArrowRight, Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";
import { Button, EmptyState, AmbientBackground, AmbientIconField } from "@/components/ui";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: string;
    slug: string;
    images: { url: string; alt: string | null }[];
  };
}

export default function CartPage() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          setCartId(data.id);
          setItems(data.items || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, []);

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity } : item,
          ),
        );
      }
    } catch {
      // ignore
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
      }
    } catch {
      // ignore
    }
  };

  const subtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.product.price) * item.quantity;
  }, 0);

  return (
    <div>
      <PageHero
        title="Your Cart"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]}
      />

      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="tech" variant="light" />
        <AmbientIconField variant="light" density="low" />
        <div className="container-mvm max-w-4xl relative z-10">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full mx-auto" />
              <p className="text-body-sm text-text-tertiary mt-4">
                Loading cart...
              </p>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              description="Browse our shop to find products you'll love."
              action={
                <Link
                  href="/shop"
                  className="inline-flex items-center h-10 px-5 rounded-md bg-accent text-text-on-accent text-body-sm font-medium hover:bg-accent-hover transition-colors"
                >
                  Browse Shop
                </Link>
              }
            />
          ) : (
            <>
              <div className="divide-y divide-border-subtle border border-border-subtle rounded-lg bg-white">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4"
                  >
                    <div className="relative w-16 h-16 rounded-md bg-surface-neutral shrink-0 overflow-hidden">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.images[0].alt || item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <ShoppingBag
                          size={20}
                          className="text-text-tertiary"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/shop/${item.product.slug}`}
                        className="text-body font-medium hover:text-accent transition-colors truncate block"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-body-sm text-accent font-medium">
                        {formatCurrency(item.product.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-md border border-border-default flex items-center justify-center hover:bg-surface-neutral transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-body-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-md border border-border-default flex items-center justify-center hover:bg-surface-neutral transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-body font-semibold w-20 text-right">
                      {formatCurrency(
                        parseFloat(item.product.price) * item.quantity,
                      )}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-text-tertiary hover:text-error transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 rounded-lg border border-border-subtle bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-body text-text-secondary">
                    Subtotal
                  </span>
                  <span className="text-body font-semibold">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-6 text-caption text-text-tertiary">
                  <span>Tax and shipping calculated at checkout</span>
                </div>
                <Link
                  href="/checkout"
                  className="flex items-center justify-center h-12 w-full rounded-md bg-accent text-text-on-accent text-body font-medium hover:bg-accent-hover transition-colors"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
