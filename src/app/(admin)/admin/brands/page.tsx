import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { prisma, safeQuery } from "@/lib/prisma";
import { Badge, Card, EmptyState } from "@/components/ui";

export default async function AdminBrandsPage() {
  const brands = await safeQuery(
    () => prisma.brand.findMany({ orderBy: { sortOrder: "asc" } }),
    [],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 font-bold tracking-tight">Brands</h1>
          <p className="text-body text-text-secondary mt-1">
            Manage your brand portfolio
          </p>
        </div>
        <Link
          href="/admin/brands/new"
          className="inline-flex items-center h-10 px-4 rounded-md bg-accent text-text-on-accent text-body-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} className="mr-1.5" />
          Add Brand
        </Link>
      </div>

      {brands.length === 0 ? (
        <Card>
          <EmptyState
            title="No brands yet"
            description="Add your first brand to get started."
            action={
              <Link
                href="/admin/brands/new"
                className="inline-flex items-center h-9 px-4 rounded-md bg-accent text-text-on-accent text-body-sm font-medium hover:bg-accent-hover transition-colors"
              >
                <Plus size={14} className="mr-1.5" />
                Add Brand
              </Link>
            }
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Tagline
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Status
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="border-b border-border-subtle last:border-0 hover:bg-surface-neutral/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-surface-neutral flex items-center justify-center shrink-0">
                          <Building2 size={16} className="text-text-tertiary" />
                        </div>
                        <div>
                          <p className="text-body-sm font-medium">
                            {brand.name}
                          </p>
                          <p className="text-caption text-text-tertiary">
                            /{brand.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">
                      {brand.tagline || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={brand.isActive ? "success" : "default"}>
                        {brand.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/brands/${brand.id}/edit`}
                        className="text-body-sm text-accent hover:text-accent-hover transition-colors"
                      >
                        Edit
                      </Link>
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
