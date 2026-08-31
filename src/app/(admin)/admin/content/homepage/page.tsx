import { prisma, safeQuery } from "@/lib/prisma";
import { Badge, Card, EmptyState } from "@/components/ui";

export default async function AdminHomepagePage() {
  const sections = await safeQuery(
    () => prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } }),
    [],
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Homepage Content</h1>
        <p className="text-body text-text-secondary mt-1">
          Manage homepage sections and content
        </p>
      </div>

      {sections.length === 0 ? (
        <Card>
          <EmptyState
            title="No homepage sections yet"
            description="Homepage sections will appear here when configured."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Section
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Type
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Visible
                  </th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <tr
                    key={section.id}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="text-body-sm font-medium">
                        {section.title || section.type}
                      </p>
                      {section.subtitle && (
                        <p className="text-caption text-text-tertiary">
                          {section.subtitle}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">
                      {section.type}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={section.isVisible ? "success" : "default"}>
                        {section.isVisible ? "Visible" : "Hidden"}
                      </Badge>
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
