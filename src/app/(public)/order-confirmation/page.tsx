import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";
import { AmbientBackground } from "@/components/ui";

export const metadata: Metadata = {
  title: "Order Confirmation",
};

interface Props {
  searchParams: Promise<{ order?: string }>;
}

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const { order: orderNumber } = await searchParams;

  if (!orderNumber) {
    return (
      <div>
        <PageHero
          title="Order Confirmation"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Order Confirmation" },
          ]}
        />
        <section className="relative section-padding bg-bg-primary-light overflow-hidden">
          <AmbientBackground icons="mixed" variant="light" />
          <div className="container-mvm max-w-lg text-center relative z-10">
            <Package size={64} className="mx-auto text-text-tertiary mb-6" />
            <h2 className="text-h2 font-bold mb-4">No Order Found</h2>
            <p className="text-body-lg text-text-secondary mb-6">
              We couldn&apos;t find an order to display. If you just placed an
              order, please check your email for confirmation.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center h-11 px-6 rounded-md bg-accent text-text-on-accent text-body-sm font-medium hover:bg-accent-hover transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) {
    return (
      <div>
        <PageHero
          title="Order Confirmation"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Order Confirmation" },
          ]}
        />
        <section className="relative section-padding bg-bg-primary-light overflow-hidden">
          <AmbientBackground icons="mixed" variant="light" />
          <div className="container-mvm max-w-lg text-center relative z-10">
            <Package size={64} className="mx-auto text-text-tertiary mb-6" />
            <h2 className="text-h2 font-bold mb-4">Order Not Found</h2>
            <p className="text-body-lg text-text-secondary">
              We couldn&apos;t find an order with that number.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        title="Order Confirmed"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Order Confirmation" },
        ]}
      />

      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="mixed" variant="light" />
        <div className="container-mvm max-w-2xl relative z-10">
          <div className="text-center mb-8">
            <CheckCircle size={64} className="mx-auto text-success mb-6" />
            <h2 className="text-h2 font-bold mb-2">Thank You for Your Order!</h2>
            <p className="text-body text-text-secondary mb-2">
              Your order has been placed successfully. Payment will be arranged
              manually.
            </p>
            <div className="inline-block rounded-md bg-accent/10 px-4 py-2 mt-2">
              <p className="text-caption text-accent font-medium">Your Reference Code</p>
              <p className="text-h3 font-bold text-accent">{order.referenceCode}</p>
            </div>
            <p className="text-body-sm text-text-secondary mt-4">
              Save this code — you can use it at <Link href="/track" className="text-accent hover:underline">/track</Link> to check your order status anytime.
            </p>
          </div>

          <div className="rounded-lg border border-border-subtle bg-white p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-caption text-text-tertiary">Order Number</p>
                <p className="text-body font-semibold">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-caption text-text-tertiary">Date</p>
                <p className="text-body font-semibold">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-caption text-text-tertiary">Status</p>
                <p className="text-body font-semibold">{order.status}</p>
              </div>
              <div>
                <p className="text-caption text-text-tertiary">
                  Payment Status
                </p>
                <p className="text-body font-semibold">{order.paymentStatus}</p>
              </div>
            </div>

            <div className="border-t border-border-subtle pt-4">
              <h3 className="text-body font-semibold mb-3">Items</h3>
              <div className="divide-y divide-border-subtle">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="text-body-sm font-medium">
                        {item.productName}
                      </p>
                      <p className="text-caption text-text-tertiary">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-body-sm font-semibold">
                      {formatCurrency(
                        parseFloat(item.price.toString()) * item.quantity,
                      )}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
                <span className="text-body font-semibold">Total</span>
                <span className="text-h4 font-bold text-accent">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-lg border border-border-subtle bg-white p-6 mb-6">
              <h3 className="text-body font-semibold mb-2">Your Order Notes</h3>
              <div className="rounded-md bg-accent/5 border border-accent/10 p-4">
                <p className="text-body-sm text-text-primary whitespace-pre-wrap">
                  {order.notes}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/track"
              className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-accent text-text-on-accent text-body-sm font-medium hover:bg-accent-hover transition-colors"
            >
              Track Your Order
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center h-11 px-6 rounded-md border border-border-default text-text-primary text-body-sm font-medium hover:bg-surface-neutral transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
