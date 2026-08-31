"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/validators";
import type { Resolver } from "react-hook-form";
import { Input, Textarea, Button, EmptyState } from "@/components/ui";
import { PageHero } from "@/components/sections/page-hero";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    name: string;
    price: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema) as Resolver<CheckoutInput>,
  });

  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
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

  const subtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.product.price) * item.quantity;
  }, 0);

  const onSubmit = async (data: CheckoutInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to place order");
      }
      const order = await res.json();
      router.push(`/order-confirmation?order=${order.orderNumber}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHero
          title="Checkout"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />
        <section className="section-padding bg-bg-primary-light">
          <div className="container-mvm max-w-3xl text-center py-20">
            <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full mx-auto" />
          </div>
        </section>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <PageHero
          title="Checkout"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />
        <section className="section-padding bg-bg-primary-light">
          <div className="container-mvm max-w-3xl">
            <EmptyState
              title="Your cart is empty"
              description="Add some products before checking out."
              action={
                <Link
                  href="/shop"
                  className="inline-flex items-center h-10 px-5 rounded-md bg-accent text-text-on-accent text-body-sm font-medium hover:bg-accent-hover transition-colors"
                >
                  Browse Shop
                </Link>
              }
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        title="Checkout"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <section className="section-padding bg-bg-primary-light">
        <div className="container-mvm max-w-3xl">
          {/* Order summary */}
          <div className="rounded-lg border border-border-subtle bg-white p-6 mb-8">
            <h2 className="text-h4 font-semibold mb-4">Order Summary</h2>
            <div className="divide-y divide-border-subtle">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-body-sm font-medium">
                      {item.product.name}
                    </p>
                    <p className="text-caption text-text-tertiary">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-body-sm font-semibold">
                    {formatCurrency(
                      parseFloat(item.product.price) * item.quantity,
                    )}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
              <span className="text-body font-semibold">Total</span>
              <span className="text-h4 font-bold text-accent">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="text-caption text-text-tertiary mt-2">
              Payment will be arranged manually. No online payment required.
            </p>
          </div>

          {/* Customer info form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <h2 className="text-h3 font-semibold">Your Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="(555) 123-4567"
                error={errors.phone?.message}
                {...register("phone")}
              />
            </div>

            <h3 className="text-h4 font-semibold pt-2">Shipping Address</h3>

            <Input
              label="Address"
              placeholder="123 Main Street"
              error={errors.address?.message}
              {...register("address")}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <Input
                label="City"
                placeholder="New York"
                error={errors.city?.message}
                {...register("city")}
              />
              <Input
                label="State"
                placeholder="NY"
                error={errors.state?.message}
                {...register("state")}
              />
              <Input
                label="ZIP Code"
                placeholder="10001"
                error={errors.zip?.message}
                {...register("zip")}
              />
            </div>

            <Input
              label="Country"
              placeholder="US"
              defaultValue="US"
              error={errors.country?.message}
              {...register("country")}
            />

            <Textarea
              label="Order Notes (optional)"
              placeholder="Any special instructions..."
              {...register("notes")}
            />

            {error && (
              <div className="rounded-md bg-error/10 border border-error/20 p-4">
                <p className="text-body-sm text-error">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" loading={submitting} fullWidth>
              Place Order
            </Button>

            <p className="text-caption text-text-tertiary text-center">
              Your order will be confirmed and payment will be arranged manually.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
