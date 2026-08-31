import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge, Card, EmptyState } from "@/components/ui";
import { Pagination } from "@/components/ui/pagination";

const statusVariant: Record<string, "success" | "warning" | "error" | "default"> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  ARCHIVED: "error",
};

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const result = await safeQuery(
    async () => {
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          include: { category: true, brand: true },
          orderBy: { createdAt: "desc" },
          skip,
          take: PAGE_SIZE,
        }),
        prisma.product.count(),
      ]);
      return { products, total };
    },
    { products: [], total: 0 },
  );

  const totalPages = Math.ceil(result.total / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 font-bold tracking-tight">Products</h1>
          <p className="text-body text-text-secondary mt-1">
            Manage your product catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center h-10 px-4 rounded-md bg-accent text-text-on-accent text-body-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} className="mr-1.5" />
          Add Product
        </Link>
      </div>

      {result.products.length === 0 ? (
        <Card>
          <EmptyState
            title="No products yet"
            description="Add your first product to get started."
            action={
              <Link
                href="/admin/products/new"
                className="inline-flex items-center h-9 px-4 rounded-md bg-accent text-text-on-accent text-body-sm font-medium hover:bg-accent-hover transition-colors"
              >
                <Plus size={14} className="mr-1.5" />
                Add Product
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
                    Product
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Category
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Price
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Stock
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
                {result.products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border-subtle last:border-0 hover:bg-surface-neutral/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-surface-neutral flex items-center justify-center shrink-0">
                          <Package size={16} className="text-text-tertiary" />
                        </div>
                        <div>
                          <p className="text-body-sm font-medium">
                            {product.name}
                          </p>
                          <p className="text-caption text-text-tertiary">
                            {product.sku || "No SKU"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">
                      {product.category?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-body-sm font-medium">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          product.stock <= 5
                            ? "text-body-sm text-error font-medium"
                            : "text-body-sm"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[product.status]}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
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
