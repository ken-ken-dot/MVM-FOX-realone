import { prisma, safeQuery } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { CheckCircle, XCircle, Database, Clock, Bell, ShoppingCart, ClipboardList } from "lucide-react";

async function getSystemStatus() {
  const checks = await Promise.all([
    // DB health
    safeQuery(async () => {
      await prisma.$queryRaw`SELECT 1`;
      return { name: "Database Connection", status: "healthy" as string };
    }, { name: "Database Connection", status: "error" as string }),

    // Pending counts
    safeQuery(() => prisma.order.count({ where: { status: "PENDING" } }), 0),
    safeQuery(() => prisma.cateringRequest.count({ where: { status: "NEW" } }), 0),
    safeQuery(() => prisma.serviceRequest.count({ where: { status: "NEW" } }), 0),
    safeQuery(() => prisma.notification.count({ where: { isRead: false } }), 0),
    safeQuery(() => prisma.product.count({ where: { stock: { lte: 5 }, status: "PUBLISHED" } }), 0),
  ]);

  return {
    dbHealth: checks[0],
    pendingOrders: checks[1],
    newCatering: checks[2],
    newServiceRequests: checks[3],
    unreadNotifications: checks[4],
    lowStockProducts: checks[5],
  };
}

export default async function AdminSystemPage() {
  const status = await getSystemStatus();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">System Status</h1>
        <p className="text-body text-text-secondary mt-1">
          Platform health and pending items overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* DB Health */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Database size={20} className="text-accent" />
            <h2 className="text-h4 font-semibold">Database</h2>
          </div>
          <div className="flex items-center gap-2">
            {status.dbHealth.status === "healthy" ? (
              <>
                <CheckCircle size={18} className="text-success" />
                <span className="text-body-sm text-success font-medium">Connected</span>
              </>
            ) : (
              <>
                <XCircle size={18} className="text-error" />
                <span className="text-body-sm text-error font-medium">Connection Failed</span>
              </>
            )}
          </div>
        </Card>

        {/* Pending Orders */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart size={20} className="text-accent" />
            <h2 className="text-h4 font-semibold">Pending Orders</h2>
          </div>
          <p className="text-h2 font-bold">{status.pendingOrders}</p>
          <p className="text-caption text-text-tertiary mt-1">Awaiting processing</p>
        </Card>

        {/* New Catering */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList size={20} className="text-accent" />
            <h2 className="text-h4 font-semibold">New Catering Requests</h2>
          </div>
          <p className="text-h2 font-bold">{status.newCatering}</p>
          <p className="text-caption text-text-tertiary mt-1">Awaiting review</p>
        </Card>

        {/* New Service Requests */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Clock size={20} className="text-accent" />
            <h2 className="text-h4 font-semibold">New Service Inquiries</h2>
          </div>
          <p className="text-h2 font-bold">{status.newServiceRequests}</p>
          <p className="text-caption text-text-tertiary mt-1">Awaiting response</p>
        </Card>

        {/* Unread Notifications */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Bell size={20} className="text-accent" />
            <h2 className="text-h4 font-semibold">Unread Notifications</h2>
          </div>
          <p className="text-h2 font-bold">{status.unreadNotifications}</p>
          <p className="text-caption text-text-tertiary mt-1">In notification center</p>
        </Card>

        {/* Low Stock */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <XCircle size={20} className={status.lowStockProducts > 0 ? "text-warning" : "text-text-tertiary"} />
            <h2 className="text-h4 font-semibold">Low Stock Products</h2>
          </div>
          <p className={`text-h2 font-bold ${status.lowStockProducts > 0 ? "text-warning" : ""}`}>
            {status.lowStockProducts}
          </p>
          <p className="text-caption text-text-tertiary mt-1">Products with ≤5 units</p>
        </Card>
      </div>
    </div>
  );
}
