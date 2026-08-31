import { ClipboardList } from "lucide-react";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Badge, Card, EmptyState } from "@/components/ui";
import { Pagination } from "@/components/ui/pagination";

const statusVariant: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  NEW: "info",
  REVIEWING: "warning",
  QUOTED: "warning",
  CONFIRMED: "success",
  COMPLETED: "success",
  CANCELLED: "error",
};

const PAGE_SIZE = 20;

export default async function AdminCateringPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const result = await safeQuery(
    async () => {
      const [requests, total] = await Promise.all([
        prisma.cateringRequest.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: PAGE_SIZE,
        }),
        prisma.cateringRequest.count(),
      ]);
      return { requests, total };
    },
    { requests: [], total: 0 },
  );

  const totalPages = Math.ceil(result.total / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 font-bold tracking-tight">Catering Requests</h1>
          <p className="text-body text-text-secondary mt-1">
            Manage catering inquiries and bookings
          </p>
        </div>
      </div>

      {result.requests.length === 0 ? (
        <Card>
          <EmptyState
            title="No catering requests yet"
            description="Catering requests will appear here when customers submit them."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Client
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Event
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Status
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
                {result.requests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-border-subtle last:border-0 hover:bg-surface-neutral/30"
                  >
                    <td className="px-6 py-4">
                      <p className="text-body-sm font-medium">{req.name}</p>
                      <p className="text-caption text-text-tertiary">
                        {req.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-body-sm">
                      {req.eventType || "—"}
                    </td>
                    <td className="px-6 py-4 text-body-sm">
                      {req.guestCount}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[req.status]}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">
                      {req.eventDate
                        ? formatDateTime(req.eventDate)
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/admin/catering/${req.id}`}
                        className="text-body-sm text-accent hover:text-accent-hover transition-colors"
                      >
                        View
                      </a>
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
