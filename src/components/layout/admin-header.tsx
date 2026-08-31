"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, User, X, ShoppingCart, Package, Users, ClipboardList, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "Admin", href: "/admin" }];

  let currentPath = "";
  for (const segment of segments.slice(1)) {
    currentPath += `/${segment}`;
    crumbs.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      href: `/admin${currentPath}`,
    });
  }

  return crumbs;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entityId: string | null;
  entityType: string | null;
  isRead: boolean;
  createdAt: string;
}

interface SearchResults {
  orders: Array<{ id: string; referenceCode: string; email: string; firstName: string; lastName: string; status: string }>;
  customers: Array<{ id: string; email: string; firstName: string; lastName: string }>;
  products: Array<{ id: string; name: string; slug: string; status: string }>;
  services: Array<{ id: string; title: string; slug: string }>;
  cateringRequests: Array<{ id: string; referenceCode: string; name: string; email: string; status: string }>;
}

const entityTypeIcons: Record<string, React.ReactNode> = {
  Order: <ShoppingCart size={14} />,
  Product: <Package size={14} />,
  Customer: <Users size={14} />,
  Service: <FileText size={14} />,
  CateringRequest: <ClipboardList size={14} />,
};

const entityTypeRoutes: Record<string, (entity: { id: string }) => string> = {
  Order: (e) => `/admin/orders`,
  Product: (e) => `/admin/products`,
  Customer: (e) => `/admin/customers`,
  Service: (e) => `/admin/services`,
  CateringRequest: (e) => `/admin/catering`,
};

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = getBreadcrumbs(pathname);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch {
        // silently fail
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (query.trim().length < 2) {
      setSearchResults(null);
      setShowSearch(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results);
          setShowSearch(true);
        }
      } catch {
        // silently fail
      }
    }, 300);
  };

  // Mark notification as read
  const markRead = async (id: string) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  };

  // Mark all as read
  const markAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasResults = searchResults && (
    searchResults.orders.length > 0 ||
    searchResults.customers.length > 0 ||
    searchResults.products.length > 0 ||
    searchResults.services.length > 0 ||
    searchResults.cateringRequests.length > 0
  );

  return (
    <header className="h-16 border-b border-border-default bg-white flex items-center justify-between px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-body-sm">
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {idx > 0 && <span className="text-text-tertiary">/</span>}
            {idx === breadcrumbs.length - 1 ? (
              <span className="text-text-primary font-medium">{crumb.label}</span>
            ) : (
              <a href={crumb.href} className="text-text-secondary hover:text-text-primary transition-colors">
                {crumb.label}
              </a>
            )}
          </span>
        ))}
      </nav>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <div className="flex items-center">
            {showSearch && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search orders, customers, products..."
                className="h-9 w-64 rounded-md border border-border-default px-3 text-body-sm mr-2 focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
            )}
            <button
              onClick={() => {
                if (showSearch) {
                  setShowSearch(false);
                  setSearchQuery("");
                  setSearchResults(null);
                } else {
                  setShowSearch(true);
                }
              }}
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-neutral transition-colors"
              aria-label="Search"
            >
              {showSearch ? <X size={18} /> : <Search size={18} />}
            </button>
          </div>

          {/* Search results dropdown */}
          {showSearch && hasResults && (
            <div className="absolute top-full right-0 mt-2 w-[400px] max-h-[400px] overflow-y-auto rounded-lg border border-border-default bg-white shadow-lg z-[var(--z-dropdown)]">
              {searchResults.orders.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-caption font-medium text-text-tertiary uppercase">Orders</p>
                  {searchResults.orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => { setShowSearch(false); router.push("/admin/orders"); }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-surface-neutral text-left transition-colors"
                    >
                      <ShoppingCart size={14} className="text-text-tertiary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium truncate">{order.referenceCode} — {order.firstName} {order.lastName}</p>
                        <p className="text-caption text-text-tertiary">{order.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.customers.length > 0 && (
                <div className="p-2 border-t border-border-subtle">
                  <p className="px-2 py-1 text-caption font-medium text-text-tertiary uppercase">Customers</p>
                  {searchResults.customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => { setShowSearch(false); router.push("/admin/customers"); }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-surface-neutral text-left transition-colors"
                    >
                      <Users size={14} className="text-text-tertiary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium truncate">{customer.firstName} {customer.lastName}</p>
                        <p className="text-caption text-text-tertiary">{customer.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.products.length > 0 && (
                <div className="p-2 border-t border-border-subtle">
                  <p className="px-2 py-1 text-caption font-medium text-text-tertiary uppercase">Products</p>
                  {searchResults.products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => { setShowSearch(false); router.push("/admin/products"); }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-surface-neutral text-left transition-colors"
                    >
                      <Package size={14} className="text-text-tertiary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium truncate">{product.name}</p>
                        <p className="text-caption text-text-tertiary">{product.status}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.cateringRequests.length > 0 && (
                <div className="p-2 border-t border-border-subtle">
                  <p className="px-2 py-1 text-caption font-medium text-text-tertiary uppercase">Catering Requests</p>
                  {searchResults.cateringRequests.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => { setShowSearch(false); router.push("/admin/catering"); }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-surface-neutral text-left transition-colors"
                    >
                      <ClipboardList size={14} className="text-text-tertiary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium truncate">{req.referenceCode} — {req.name}</p>
                        <p className="text-caption text-text-tertiary">{req.status}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-neutral transition-colors relative"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-[380px] max-h-[400px] overflow-y-auto rounded-lg border border-border-default bg-white shadow-lg z-[var(--z-dropdown)]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                <p className="text-body-sm font-semibold">Notifications</p>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-caption text-accent hover:text-accent-hover transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-body-sm text-text-tertiary">No notifications yet</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => {
                        markRead(notif.id);
                        if (notif.entityType && notif.entityId) {
                          const routeFn = entityTypeRoutes[notif.entityType];
                          if (routeFn) {
                            setShowNotifications(false);
                            router.push(routeFn({ id: notif.entityId }));
                          }
                        }
                      }}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-neutral/50 transition-colors",
                        "border-b border-border-subtle last:border-0",
                        !notif.isRead && "bg-accent/5",
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        {entityTypeIcons[notif.entityType || ""] || <Bell size={14} className="text-text-tertiary" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-body-sm", !notif.isRead ? "font-semibold" : "font-medium")}>
                          {notif.title}
                        </p>
                        <p className="text-caption text-text-tertiary truncate">{notif.message}</p>
                        <p className="text-caption text-text-tertiary mt-0.5">
                          {new Date(notif.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-3 border-l border-border-default">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <User size={16} className="text-accent" />
          </div>
          <div className="hidden md:block">
            <p className="text-body-sm font-medium text-text-primary">Admin</p>
            <p className="text-caption text-text-tertiary">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
