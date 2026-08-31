import { prisma, safeQuery } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Badge, Card, EmptyState } from "@/components/ui";

const statusVariant: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  NEW: "info",
  REVIEWING: "warning",
  QUOTED: "warning",
  COMPLETED: "success",
  CANCELLED: "error",
};

export default async function AdminServiceRequestsPage() {
  const requests = await safeQuery(
    () => prisma.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { service: { select: { title: true } } },
    }),
    [],
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Service Requests</h1>
        <p className="text-body text-text-secondary mt-1">
          Manage quote requests and service inquiries
        </p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <EmptyState
            title="No service requests yet"
            description="Service requests will appear here when customers submit them."
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
                    Service
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Status
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
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
                      {req.service?.title || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[req.status]}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">
                      {formatDateTime(req.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
