import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  ClipboardList,
  DollarSign,
} from "lucide-react";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

async function getAnalytics() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders,
      thisMonthOrders,
      lastMonthOrders,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      totalCustomers,
      thisMonthCustomers,
      lastMonthCustomers,
      totalProducts,
      publishedProducts,
      lowStockProducts,
      totalCateringRequests,
      pendingCatering,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      prisma.customer.count(),
      prisma.customer.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.customer.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      prisma.product.count(),
      prisma.product.count({ where: { status: "PUBLISHED" } }),
      prisma.product.count({ where: { stock: { lte: 5 }, status: "PUBLISHED" } }),
      prisma.cateringRequest.count(),
      prisma.cateringRequest.count({ where: { status: "NEW" } }),
    ]);

    const calcChange = (thisMonth: number, lastMonth: number) => {
      if (lastMonth === 0) return thisMonth > 0 ? 100 : 0;
      return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
    };

    return {
      totalOrders,
      ordersChange: calcChange(thisMonthOrders, lastMonthOrders),
      totalRevenue: totalRevenue._sum.total || 0,
      revenueChange: calcChange(
        Number(thisMonthRevenue._sum.total || 0),
        Number(lastMonthRevenue._sum.total || 0)
      ),
      totalCustomers,
      customersChange: calcChange(thisMonthCustomers, lastMonthCustomers),
      totalProducts,
      publishedProducts,
      lowStockProducts,
      totalCateringRequests,
      pendingCatering,
    };
  } catch {
    return {
      totalOrders: 0,
      ordersChange: 0,
      totalRevenue: 0,
      revenueChange: 0,
      totalCustomers: 0,
      customersChange: 0,
      totalProducts: 0,
      publishedProducts: 0,
      lowStockProducts: 0,
      totalCateringRequests: 0,
      pendingCatering: 0,
    };
  }
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-body-sm text-text-secondary">{label}</p>
          <p className="text-h2 font-bold mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {change >= 0 ? (
                <TrendingUp size={14} className="text-success" />
              ) : (
                <TrendingDown size={14} className="text-error" />
              )}
              <span
                className={`text-caption font-medium ${
                  change >= 0 ? "text-success" : "text-error"
                }`}
              >
                {change >= 0 ? "+" : ""}
                {change}% from last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bg}`}>
          <Icon size={20} className={color} />
        </div>
      </div>
    </Card>
  );
}

export default async function AdminAnalyticsPage() {
  const stats = await getAnalytics();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Analytics</h1>
        <p className="text-body text-text-secondary mt-1">
          Overview of your business performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          change={stats.ordersChange}
          icon={ShoppingCart}
          color="text-accent"
          bg="bg-accent/10"
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          change={stats.revenueChange}
          icon={DollarSign}
          color="text-success"
          bg="bg-success/10"
        />
        <StatCard
          label="Customers"
          value={stats.totalCustomers}
          change={stats.customersChange}
          icon={Users}
          color="text-info"
          bg="bg-info/10"
        />
        <StatCard
          label="Catering Requests"
          value={stats.totalCateringRequests}
          icon={ClipboardList}
          color="text-warning"
          bg="bg-warning/10"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-text-secondary">
                  Total Products
                </span>
                <span className="text-body-sm font-semibold">
                  {stats.totalProducts}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-text-secondary">
                  Published
                </span>
                <span className="text-body-sm font-semibold text-success">
                  {stats.publishedProducts}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-text-secondary">
                  Low Stock
                </span>
                <span className="text-body-sm font-semibold text-error">
                  {stats.lowStockProducts}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-text-secondary">
                  Total Orders
                </span>
                <span className="text-body-sm font-semibold">
                  {stats.totalOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-text-secondary">
                  Total Revenue
                </span>
                <span className="text-body-sm font-semibold">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catering</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-text-secondary">
                  Total Requests
                </span>
                <span className="text-body-sm font-semibold">
                  {stats.totalCateringRequests}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-text-secondary">
                  Pending
                </span>
                <span className="text-body-sm font-semibold text-warning">
                  {stats.pendingCatering}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
