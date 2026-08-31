import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Badge, Card, EmptyState } from "@/components/ui";
import { Pagination } from "@/components/ui/pagination";

const statusVariant: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "success",
  DELIVERED: "success",
  CANCELLED: "error",
};

const PAGE_SIZE = 20;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const result = await safeQuery(
    async () => {
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: PAGE_SIZE,
        }),
        prisma.order.count(),
      ]);
      return { orders, total };
    },
    { orders: [], total: 0 },
  );

  const totalPages = Math.ceil(result.total / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 font-bold tracking-tight">Orders</h1>
          <p className="text-body text-text-secondary mt-1">
            Manage customer orders
          </p>
        </div>
      </div>

      {result.orders.length === 0 ? (
        <Card>
          <EmptyState
            title="No orders yet"
            description="Orders will appear here when customers place them."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Order
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Total
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Status
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Date
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border-subtle last:border-0 hover:bg-surface-neutral/30"
                  >
                    <td className="px-6 py-4">
                      <p className="text-body-sm font-medium">
                        {order.orderNumber}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-body-sm">
                        {order.firstName} {order.lastName}
                      </p>
                      <p className="text-caption text-text-tertiary">
                        {order.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-body-sm font-medium">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[order.status]}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[order.paymentStatus] || "default"}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-body-sm text-accent hover:text-accent-hover transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 pb-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={result.total}
              pageSize={PAGE_SIZE}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
