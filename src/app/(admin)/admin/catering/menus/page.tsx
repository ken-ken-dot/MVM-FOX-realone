import { prisma, safeQuery } from "@/lib/prisma";
import { Badge, Card, EmptyState } from "@/components/ui";

export default async function AdminCateringMenusPage() {
  const menus = await safeQuery(
    () => prisma.cateringMenu.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { packages: true } } },
    }),
    [],
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Catering Menus</h1>
        <p className="text-body text-text-secondary mt-1">
          Manage catering menus
        </p>
      </div>

      {menus.length === 0 ? (
        <Card>
          <EmptyState
            title="No menus yet"
            description="Catering menus will appear here when created."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Menu
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Packages
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {menus.map((menu) => (
                  <tr
                    key={menu.id}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="text-body-sm font-medium">{menu.name}</p>
                      {menu.description && (
                        <p className="text-caption text-text-tertiary line-clamp-1">
                          {menu.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-body-sm">
                      {menu._count.packages}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={menu.isActive ? "success" : "default"}>
                        {menu.isActive ? "Active" : "Inactive"}
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
