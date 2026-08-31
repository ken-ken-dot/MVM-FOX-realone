import { FileText } from "lucide-react";
import { prisma, safeQuery } from "@/lib/prisma";
import { Badge, Card, EmptyState } from "@/components/ui";

export default async function AdminPagesPage() {
  const pages = await safeQuery(
    () => prisma.page.findMany({ orderBy: { createdAt: "desc" } }),
    [],
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Pages</h1>
        <p className="text-body text-text-secondary mt-1">
          Manage CMS pages
        </p>
      </div>

      {pages.length === 0 ? (
        <Card>
          <EmptyState
            title="No pages yet"
            description="CMS pages will appear here when created."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Page
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr
                    key={page.id}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="text-body-sm font-medium">{page.title}</p>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">
                      /{page.slug}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={page.isPublished ? "success" : "default"}>
                        {page.isPublished ? "Published" : "Draft"}
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
