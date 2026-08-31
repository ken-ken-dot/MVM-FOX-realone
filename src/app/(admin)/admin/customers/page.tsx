import { Users } from "lucide-react";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Card, EmptyState } from "@/components/ui";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 20;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const result = await safeQuery(
    async () => {
      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: PAGE_SIZE,
          include: {
            _count: { select: { orders: true, cateringRequests: true, serviceRequests: true } },
          },
        }),
        prisma.customer.count(),
      ]);
      return { customers, total };
    },
    { customers: [], total: 0 },
  );

  const totalPages = Math.ceil(result.total / PAGE_SIZE);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Customers</h1>
        <p className="text-body text-text-secondary mt-1">
          View your customer base
        </p>
      </div>

      {result.customers.length === 0 ? (
        <Card>
          <EmptyState
            title="No customers yet"
            description="Customers will appear here when they place orders or submit requests."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Company
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Catering
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Services
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Since
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-border-subtle last:border-0 hover:bg-surface-neutral/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <Users size={14} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-body-sm font-medium">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-caption text-text-tertiary">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">
                      {customer.companyName || "—"}
                    </td>
                    <td className="px-6 py-4 text-body-sm">
                      {customer._count.orders}
                    </td>
                    <td className="px-6 py-4 text-body-sm">
                      {customer._count.cateringRequests}
                    </td>
                    <td className="px-6 py-4 text-body-sm">
                      {customer._count.serviceRequests}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">
                      {formatDateTime(customer.createdAt)}
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
