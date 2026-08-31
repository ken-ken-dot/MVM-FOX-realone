import {
  ShoppingCart,
  ClipboardList,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

async function getDashboardStats() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalOrders,
      todayOrders,
      totalCatering,
      pendingCatering,
      totalProducts,
      lowStockProducts,
      totalCustomers,
      recentOrders,
      recentCatering,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.cateringRequest.count(),
      prisma.cateringRequest.count({ where: { status: "NEW" } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 5 }, status: "PUBLISHED" } }),
      prisma.customer.count(),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          email: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.cateringRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          guestCount: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalOrders,
      todayOrders,
      totalCatering,
      pendingCatering,
      totalProducts,
      lowStockProducts,
      totalCustomers,
      recentOrders,
      recentCatering,
    };
  } catch {
    return {
      totalOrders: 0,
      todayOrders: 0,
      totalCatering: 0,
      pendingCatering: 0,
      totalProducts: 0,
      lowStockProducts: 0,
      totalCustomers: 0,
      recentOrders: [],
      recentCatering: [],
    };
  }
}

const statCards = [
  {
    label: "Total Orders",
    key: "totalOrders",
    icon: ShoppingCart,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    label: "Today's Orders",
    key: "todayOrders",
    icon: TrendingUp,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    label: "Catering Requests",
    key: "totalCatering",
    icon: ClipboardList,
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    label: "Pending Catering",
    key: "pendingCatering",
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    label: "Products",
    key: "totalProducts",
    icon: Package,
    color: "text-accent-secondary",
    bg: "bg-accent-secondary/10",
  },
  {
    label: "Low Stock",
    key: "lowStockProducts",
    icon: AlertTriangle,
    color: "text-error",
    bg: "bg-error/10",
  },
  {
    label: "Customers",
    key: "totalCustomers",
    icon: Users,
    color: "text-info",
    bg: "bg-info/10",
  },
];

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Dashboard</h1>
        <p className="text-body text-text-secondary mt-1">
          Welcome back. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const value = stats[stat.key as keyof typeof stats] as number;
          const Icon = stat.icon;
          return (
            <Card key={stat.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm text-text-secondary">
                    {stat.label}
                  </p>
                  <p className="text-h2 font-bold mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-body-sm text-text-tertiary py-8 text-center">
                No orders yet
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0"
                  >
                    <div>
                      <p className="text-body-sm font-medium">
                        {order.orderNumber}
                      </p>
                      <p className="text-caption text-text-tertiary">
                        {order.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-body-sm font-semibold">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-caption text-text-tertiary">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Catering Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Catering Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentCatering.length === 0 ? (
              <p className="text-body-sm text-text-tertiary py-8 text-center">
                No catering requests yet
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentCatering.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0"
                  >
                    <div>
                      <p className="text-body-sm font-medium">{req.name}</p>
                      <p className="text-caption text-text-tertiary">
                        {req.guestCount} guests · {req.status}
                      </p>
                    </div>
                    <p className="text-caption text-text-tertiary">
                      {formatDateTime(req.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
