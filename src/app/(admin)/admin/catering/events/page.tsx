import { prisma, safeQuery } from "@/lib/prisma";
import { Card, EmptyState } from "@/components/ui";

export default async function AdminCateringEventsPage() {
  const events = await safeQuery(
    () => prisma.cateringEvent.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { requests: true } } },
    }),
    [],
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Catering Events</h1>
        <p className="text-body text-text-secondary mt-1">
          Manage event types for catering
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <EmptyState
            title="No event types yet"
            description="Event types will appear here when created."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Requests
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {event.icon && <span>{event.icon}</span>}
                        <div>
                          <p className="text-body-sm font-medium">
                            {event.name}
                          </p>
                          {event.description && (
                            <p className="text-caption text-text-tertiary">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm">
                      {event._count.requests}
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
