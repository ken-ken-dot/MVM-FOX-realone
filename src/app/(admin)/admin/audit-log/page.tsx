import { prisma, safeQuery } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Card, EmptyState, Badge } from "@/components/ui";

const actionColors: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "error",
  STATUS_CHANGE: "warning",
};

export default async function AuditLogPage() {
  const logs = await safeQuery(
    () =>
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { user: { select: { name: true, email: true } } },
      }),
    [],
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Audit Log</h1>
        <p className="text-body text-text-secondary mt-1">
          Track all admin actions and mutations for accountability
        </p>
      </div>

      {logs.length === 0 ? (
        <Card>
          <EmptyState
            title="No audit entries yet"
            description="Admin actions will be logged here as they occur."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Actor
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Action
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Changes
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border-subtle last:border-0 hover:bg-surface-neutral/30"
                  >
                    <td className="px-6 py-4 text-body-sm text-text-secondary whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-body-sm font-medium">
                        {log.user?.name || "Unknown"}
                      </p>
                      <p className="text-caption text-text-tertiary">
                        {log.user?.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={actionColors[log.action] || "default"}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-body-sm">
                      {log.entity}
                      {log.entityId && (
                        <span className="text-text-tertiary ml-1">
                          ({log.entityId.slice(0, 8)}...)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.before || log.after ? (
                        <details className="group">
                          <summary className="text-body-sm text-accent cursor-pointer hover:text-accent-hover">
                            View changes
                          </summary>
                          <div className="mt-2 p-3 rounded-md bg-surface-neutral/50 text-caption font-mono max-w-xs overflow-x-auto">
                            {log.before && (
                              <div className="mb-1">
                                <span className="text-error">Before:</span>{" "}
                                {JSON.stringify(log.before)}
                              </div>
                            )}
                            {log.after && (
                              <div>
                                <span className="text-success">After:</span>{" "}
                                {JSON.stringify(log.after)}
                              </div>
                            )}
                          </div>
                        </details>
                      ) : (
                        <span className="text-caption text-text-tertiary">—</span>
                      )}
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
