import { prisma, safeQuery } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge, Card, EmptyState } from "@/components/ui";

export default async function AdminCateringPackagesPage() {
  const packages = await safeQuery(
    () => prisma.cateringPackage.findMany({
      orderBy: { sortOrder: "asc" },
      include: { menu: { select: { name: true } } },
    }),
    [],
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Catering Packages</h1>
        <p className="text-body text-text-secondary mt-1">
          Manage catering packages
        </p>
      </div>

      {packages.length === 0 ? (
        <Card>
          <EmptyState
            title="No packages yet"
            description="Catering packages will appear here when created."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Package
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Menu
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Price/Guest
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Min Guests
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="text-body-sm font-medium">{pkg.name}</p>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">
                      {pkg.menu?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-body-sm">
                      {pkg.pricePerGuest
                        ? formatCurrency(pkg.pricePerGuest)
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-body-sm">
                      {pkg.minimumGuests || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={pkg.isActive ? "success" : "default"}>
                        {pkg.isActive ? "Active" : "Inactive"}
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
