import { prisma, safeQuery } from "@/lib/prisma";
import { Card, EmptyState } from "@/components/ui";

export default async function AdminProductCategoriesPage() {
  const categories = await safeQuery(
    () => prisma.productCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    [],
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Product Categories</h1>
        <p className="text-body text-text-secondary mt-1">
          Manage product categories
        </p>
      </div>

      {categories.length === 0 ? (
        <Card>
          <EmptyState
            title="No categories yet"
            description="Product categories will appear here when created."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Category
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Products
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="text-body-sm font-medium">{cat.name}</p>
                      <p className="text-caption text-text-tertiary">
                        /{cat.slug}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-body-sm">
                      {cat._count.products}
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
