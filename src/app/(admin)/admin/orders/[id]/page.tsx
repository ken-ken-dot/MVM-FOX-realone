import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package } from "lucide-react";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

const statusVariant: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "success",
  DELIVERED: "success",
  CANCELLED: "error",
  PENDING_PAYMENT: "warning",
  PAID: "success",
  REFUNDED: "info",
  FAILED: "error",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await safeQuery(
    () =>
      prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
          customer: true,
        },
      }),
    null,
  );

  if (!order) notFound();

  const shipping = order.shippingAddress as Record<string, string> | null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-body-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 font-bold tracking-tight">
            Order {order.orderNumber}
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant[order.status]} size="md">
            {order.status}
          </Badge>
          <Badge variant={statusVariant[order.paymentStatus] || "default"} size="md">
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border-subtle">
                {order.items.map((item) => {
                  const productImage = item.product?.images?.[0]?.url || null;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-3"
                    >
                      {/* Product thumbnail */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface-neutral flex-shrink-0">
                        {productImage ? (
                          <Image
                            src={productImage}
                            alt={item.productName}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-text-tertiary" />
                          </div>
                        )}
                      </div>
                      {/* Item details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-medium truncate">
                          {item.productName}
                        </p>
                        <p className="text-caption text-text-tertiary">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                        {item.product && (
                          <Link
                            href={`/shop/${item.product.slug}`}
                            className="text-caption text-accent hover:text-accent-hover transition-colors"
                            target="_blank"
                          >
                            View product →
                          </Link>
                        )}
                      </div>
                      <p className="text-body-sm font-semibold flex-shrink-0">
                        {formatCurrency(
                          parseFloat(item.price.toString()) * item.quantity,
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
                <span className="text-body-sm text-text-secondary">Subtotal</span>
                <span className="text-body-sm font-medium">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-body-sm text-text-secondary">Tax</span>
                <span className="text-body-sm font-medium">
                  {formatCurrency(order.tax)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle">
                <span className="text-body font-semibold">Total</span>
                <span className="text-h4 font-bold text-accent">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-accent/5 border border-accent/10 p-4">
                  <p className="text-body-sm text-text-primary whitespace-pre-wrap">
                    {order.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Customer & Shipping Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-caption text-text-tertiary">Name</p>
                  <p className="text-body-sm font-medium">
                    {order.firstName} {order.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-text-tertiary">Email</p>
                  <p className="text-body-sm font-medium">{order.email}</p>
                </div>
                {order.phone && (
                  <div>
                    <p className="text-caption text-text-tertiary">Phone</p>
                    <p className="text-body-sm font-medium">{order.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-caption text-text-tertiary">Reference Code</p>
                  <p className="text-body-sm font-medium text-accent">
                    {order.referenceCode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {shipping && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-body-sm space-y-1">
                  <p>{shipping.line1}</p>
                  <p>
                    {[shipping.city, shipping.state, shipping.zip]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {shipping.country && <p>{shipping.country}</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
