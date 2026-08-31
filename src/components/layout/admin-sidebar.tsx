"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  UtensilsCrossed,
  ClipboardList,
  Users,
  Building2,
  FileText,
  Star,
  HelpCircle,
  Image,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

const sidebarSections: SidebarSection[] = [
  {
    label: "",
    items: [
      {
        label: "Overview",
        href: "/admin",
        icon: <LayoutDashboard size={18} />,
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: <ShoppingCart size={18} />,
      },
      {
        label: "Products",
        href: "/admin/products",
        icon: <Package size={18} />,
      },
      {
        label: "Categories",
        href: "/admin/products/categories",
        icon: <Tags size={18} />,
      },
    ],
  },
  {
    label: "Catering",
    items: [
      {
        label: "Requests",
        href: "/admin/catering",
        icon: <ClipboardList size={18} />,
      },
      {
        label: "Menus",
        href: "/admin/catering/menus",
        icon: <UtensilsCrossed size={18} />,
      },
      {
        label: "Packages",
        href: "/admin/catering/packages",
        icon: <Package size={18} />,
      },
      {
        label: "Events",
        href: "/admin/catering/events",
        icon: <Calendar size={18} />,
      },
    ],
  },
  {
    label: "Services",
    items: [
      {
        label: "Services",
        href: "/admin/services",
        icon: <FileText size={18} />,
      },
      {
        label: "Service Requests",
        href: "/admin/services/requests",
        icon: <ClipboardList size={18} />,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        label: "Brands",
        href: "/admin/brands",
        icon: <Building2 size={18} />,
      },
      {
        label: "Testimonials",
        href: "/admin/content/testimonials",
        icon: <Star size={18} />,
      },
      {
        label: "FAQs",
        href: "/admin/content/faqs",
        icon: <HelpCircle size={18} />,
      },
      {
        label: "Homepage",
        href: "/admin/content/homepage",
        icon: <LayoutDashboard size={18} />,
      },
      {
        label: "Pages",
        href: "/admin/content/pages",
        icon: <FileText size={18} />,
      },
    ],
  },
  {
    label: "Media & Settings",
    items: [
      {
        label: "Media Library",
        href: "/admin/media",
        icon: <Image size={18} />,
      },
      {
        label: "Customers",
        href: "/admin/customers",
        icon: <Users size={18} />,
      },
      {
        label: "Audit Log",
        href: "/admin/audit-log",
        icon: <BarChart3 size={18} />,
      },
      {
        label: "System",
        href: "/admin/system",
        icon: <Settings size={18} />,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: <Settings size={18} />,
      },
    ],
  },
];


interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-bg-primary-dark h-full border-r border-border-dark transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border-dark">
        {!collapsed && (
          <Link href="/admin" className="flex items-center">
            <span className="text-body-lg font-bold text-text-on-dark tracking-tight">
              MVM
            </span>
            <span className="text-body-lg font-bold text-accent ml-1 tracking-tight">
              FOX
            </span>
            <span className="text-caption text-text-on-dark-secondary ml-2 hidden lg:inline">
              Kitchen
            </span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-text-on-dark-secondary hover:text-text-on-dark hover:bg-bg-primary-dark-elevated transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            size={18}
            className={cn("transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {sidebarSections.map((section, sIdx) => (
          <div key={sIdx} className="mb-3">
            {section.label && !collapsed && (
              <p className="px-3 mb-1.5 text-caption font-medium text-text-on-dark-secondary uppercase tracking-wider">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-body-sm transition-colors mb-0.5",
                  isActive(item.href)
                    ? "bg-accent/15 text-accent font-medium"
                    : "text-text-on-dark-secondary hover:text-text-on-dark hover:bg-bg-primary-dark-elevated",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto h-5 px-1.5 rounded-full bg-accent/20 text-accent text-caption flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border-dark p-2">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-body-sm text-text-on-dark-secondary hover:text-text-on-dark hover:bg-bg-primary-dark-elevated transition-colors",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "Back to site" : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Back to site</span>}
        </Link>
      </div>
    </aside>
  );
}
