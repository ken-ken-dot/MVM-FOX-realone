"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Users,
  Shield,
  Plug,
  Bell,
  Save,
  Check,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Globe,
  Loader2,
  UserPlus,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";

// ─── Tab definitions ───
const tabs = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "users", label: "Users", icon: Users },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;

type TabId = (typeof tabs)[number]["id"];

// ─── Save state indicator ───
function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-body-sm">
      {state === "saving" && (
        <>
          <Loader2 size={14} className="animate-spin text-text-tertiary" />
          <span className="text-text-tertiary">Saving…</span>
        </>
      )}
      {state === "saved" && (
        <>
          <Check size={14} className="text-success" />
          <span className="text-success">Saved</span>
        </>
      )}
      {state === "error" && (
        <>
          <AlertCircle size={14} className="text-error" />
          <span className="text-error">Error saving</span>
        </>
      )}
    </span>
  );
}

// ─── Company Sub-Panel ───
function CompanyPanel() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/settings/company")
      .then((r) => r.json())
      .then((data) => {
        const flat: Record<string, string> = {};
        for (const group of Object.values(data.settings) as Array<Array<{ key: string; value: unknown }>>) {
          for (const s of group) {
            flat[s.key] = typeof s.value === "string" ? s.value : JSON.stringify(s.value);
          }
        }
        setSettings(flat);
      })
      .catch(() => {});
  }, []);

  const updateField = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaveState("saving");
    try {
      const res = await fetch("/api/admin/settings/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } else {
        setSaveState("error");
        setTimeout(() => setSaveState("idle"), 3000);
      }
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-h3 font-semibold">Company Profile</h3>
          <p className="text-body-sm text-text-secondary mt-1">
            Manage your company information. Changes propagate to the footer, SEO defaults, and public pages.
          </p>
        </div>
        <SaveIndicator state={saveState} />
      </div>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={settings.site_name || ""}
              onChange={(e) => updateField("site_name", e.target.value)}
            />
            <Input
              label="Tagline"
              value={settings.site_tagline || ""}
              onChange={(e) => updateField("site_tagline", e.target.value)}
            />
            <div className="md:col-span-2">
              <Textarea
                label="Site Description (SEO default)"
                value={settings.site_description || ""}
                onChange={(e) => updateField("site_description", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={18} />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={settings.contact_email || ""}
              onChange={(e) => updateField("contact_email", e.target.value)}
            />
            <Input
              label="Phone"
              value={settings.contact_phone || ""}
              onChange={(e) => updateField("contact_phone", e.target.value)}
            />
            <div className="md:col-span-2">
              <Input
                label="Address"
                value={settings.contact_address || ""}
                onChange={(e) => updateField("contact_address", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={18} />
            Social Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Twitter / X"
              value={settings.social_twitter || ""}
              onChange={(e) => updateField("social_twitter", e.target.value)}
              placeholder="https://twitter.com/..."
            />
            <Input
              label="LinkedIn"
              value={settings.social_linkedin || ""}
              onChange={(e) => updateField("social_linkedin", e.target.value)}
              placeholder="https://linkedin.com/company/..."
            />
            <Input
              label="Instagram"
              value={settings.social_instagram || ""}
              onChange={(e) => updateField("social_instagram", e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saveState === "saving"}>
          <Save size={16} />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ─── Users Sub-Panel ───
interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ link: string; tempPassword: string } | null>(null);
  const [inviteForm, setInviteForm] = useState({ email: "", name: "", role: "ADMIN" });
  const [inviteError, setInviteError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInvite = async () => {
    setInviteError("");
    if (!inviteForm.email || !inviteForm.name) {
      setInviteError("Email and name are required");
      return;
    }
    try {
      const res = await fetch("/api/admin/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error || "Failed to create user");
        return;
      }
      setInviteResult({
        link: data.inviteLink,
        tempPassword: data.tempPassword,
      });
      setInviteForm({ email: "", name: "", role: "ADMIN" });
      fetchUsers();
    } catch {
      setInviteError("Failed to create user");
    }
  };

  const toggleUserActive = async (user: AdminUser) => {
    setActionLoading(user.id);
    try {
      await fetch(`/api/admin/settings/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      fetchUsers();
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      await fetch(`/api/admin/settings/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      fetchUsers();
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  const roleBadge = (role: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "info" | "error"> = {
      SUPER_ADMIN: "error",
      ADMIN: "info",
      CONTENT_MANAGER: "success",
      ORDER_MANAGER: "warning",
    };
    return <Badge variant={variants[role] || "default"}>{role.replace(/_/g, " ")}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-h3 font-semibold">Admin Users</h3>
          <p className="text-body-sm text-text-secondary mt-1">
            Manage admin accounts, roles, and access.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus size={16} />
          Invite User
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-text-tertiary" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="Invite your first admin user to get started." />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left text-caption font-medium text-text-tertiary uppercase tracking-wider px-6 py-3">User</th>
                  <th className="text-left text-caption font-medium text-text-tertiary uppercase tracking-wider px-6 py-3">Role</th>
                  <th className="text-left text-caption font-medium text-text-tertiary uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-caption font-medium text-text-tertiary uppercase tracking-wider px-6 py-3">Joined</th>
                  <th className="text-right text-caption font-medium text-text-tertiary uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border-subtle last:border-0">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-body-sm font-medium">{user.name || "Unnamed"}</p>
                        <p className="text-caption text-text-tertiary">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        options={[
                          { value: "SUPER_ADMIN", label: "Super Admin" },
                          { value: "ADMIN", label: "Admin" },
                          { value: "CONTENT_MANAGER", label: "Content Manager" },
                          { value: "ORDER_MANAGER", label: "Order Manager" },
                        ]}
                        value={user.role}
                        onChange={(e) => changeRole(user.id, e.target.value)}
                        className="h-8 text-caption w-40"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.isActive ? "success" : "default"}>
                        {user.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-caption text-text-tertiary">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserActive(user)}
                        disabled={actionLoading === user.id}
                      >
                        {user.isActive ? "Disable" : "Enable"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Invite Modal */}
      <Modal open={inviteOpen} onClose={() => { setInviteOpen(false); setInviteResult(null); setInviteError(""); }} title={inviteResult ? "User Created" : "Invite New User"}>
        {inviteResult ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-success/10 p-4">
              <p className="text-body-sm font-medium text-success mb-1">User created successfully</p>
              <p className="text-body-sm text-text-secondary">
                Share this invite link and temporary password with the new user.
              </p>
            </div>
            <div>
              <p className="text-caption text-text-tertiary mb-1">Invite Link</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-body-sm bg-surface-neutral rounded px-3 py-2 font-mono">{inviteResult.link}</code>
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(inviteResult.link)}>
                  Copy
                </Button>
              </div>
            </div>
            <div>
              <p className="text-caption text-text-tertiary mb-1">Temporary Password</p>
              <code className="text-body-sm bg-surface-neutral rounded px-3 py-2 font-mono block">{inviteResult.tempPassword}</code>
              <p className="text-caption text-text-tertiary mt-1">The user should change this on first login.</p>
            </div>
            <Button fullWidth onClick={() => { setInviteOpen(false); setInviteResult(null); }}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {inviteError && (
              <div className="rounded-lg bg-error/10 p-3 text-body-sm text-error">{inviteError}</div>
            )}
            <Input
              label="Email"
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Full Name"
              value={inviteForm.name}
              onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Select
              label="Role"
              options={[
                { value: "ADMIN", label: "Admin" },
                { value: "CONTENT_MANAGER", label: "Content Manager" },
                { value: "ORDER_MANAGER", label: "Order Manager" },
                { value: "SUPER_ADMIN", label: "Super Admin" },
              ]}
              value={inviteForm.role}
              onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value }))}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button onClick={handleInvite}>Create User</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Roles Sub-Panel ───
const rolesMatrix = [
  {
    role: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Full access to all features and settings.",
    permissions: ["All admin sections", "Manage users & roles", "System settings", "Delete data"],
  },
  {
    role: "ADMIN",
    label: "Admin",
    description: "Access to most admin features except user management.",
    permissions: ["Orders, Products, Catering", "Content management", "View users", "Media library"],
  },
  {
    role: "CONTENT_MANAGER",
    label: "Content Manager",
    description: "Manage public-facing content, products, and media.",
    permissions: ["Products & categories", "Content (pages, FAQs, testimonials)", "Media library", "Brands"],
  },
  {
    role: "ORDER_MANAGER",
    label: "Order Manager",
    description: "Manage orders, catering requests, and customer communications.",
    permissions: ["View & manage orders", "Catering requests", "Service requests", "Customer records"],
  },
];

function RolesPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-h3 font-semibold">Roles & Permissions</h3>
        <p className="text-body-sm text-text-secondary mt-1">
          Overview of the four admin roles and what each can access. This is a read-only view — role editing is a planned feature.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rolesMatrix.map((r) => (
          <Card key={r.role} hover>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-body font-semibold">{r.label}</h4>
                <p className="text-body-sm text-text-secondary mt-1">{r.description}</p>
              </div>
              <Badge variant={r.role === "SUPER_ADMIN" ? "error" : r.role === "ADMIN" ? "info" : r.role === "CONTENT_MANAGER" ? "success" : "warning"}>
                {r.role.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="border-t border-border-subtle pt-3">
              <p className="text-caption text-text-tertiary uppercase tracking-wider mb-2">Access</p>
              <ul className="space-y-1.5">
                {r.permissions.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-body-sm text-text-secondary">
                    <Check size={14} className="text-success shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Integrations Sub-Panel ───
const integrations = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing for orders and catering deposits.",
    connected: !!process.env.NEXT_PUBLIC_STRIPE_KEY,
    docs: "https://stripe.com/docs",
  },
  {
    id: "resend",
    name: "Resend",
    description: "Transactional email delivery (order confirmations, notifications).",
    connected: !!process.env.RESEND_API_KEY,
    docs: "https://resend.com/docs",
  },
  {
    id: "cloudinary",
    name: "Cloudinary",
    description: "Image hosting and optimization for the media library.",
    connected: !!process.env.CLOUDINARY_URL,
    docs: "https://cloudinary.com/documentation",
  },
  {
    id: "posthog",
    name: "PostHog",
    description: "Product analytics and session recording.",
    connected: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
    docs: "https://posthog.com/docs",
  },
];

function IntegrationsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-h3 font-semibold">Integrations</h3>
        <p className="text-body-sm text-text-secondary mt-1">
          Connected services and third-party integrations. Status reflects actual environment configuration.
        </p>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => (
          <Card key={integration.id} hover>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-lg",
                  integration.connected ? "bg-success/10" : "bg-surface-neutral",
                )}>
                  <Plug size={20} className={integration.connected ? "text-success" : "text-text-tertiary"} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-body font-semibold">{integration.name}</h4>
                    <Badge variant={integration.connected ? "success" : "default"}>
                      {integration.connected ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                  <p className="text-body-sm text-text-secondary mt-0.5">{integration.description}</p>
                </div>
              </div>
              <a
                href={integration.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-sm text-accent hover:underline flex items-center gap-1"
              >
                Docs <ExternalLink size={12} />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Notifications Sub-Panel ───
function NotificationsPanel() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/settings/notifications")
      .then((r) => r.json())
      .then((data) => setPreferences(data.preferences || {}))
      .catch(() => {});
  }, []);

  const togglePref = (key: string) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaveState("saving");
    try {
      const res = await fetch("/api/admin/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });
      if (res.ok) {
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } else {
        setSaveState("error");
        setTimeout(() => setSaveState("idle"), 3000);
      }
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  const notifOptions = [
    { key: "notif_new_orders", label: "New Orders", description: "Get notified when a new order is placed." },
    { key: "notif_new_catering", label: "New Catering Requests", description: "Get notified when a catering request is submitted." },
    { key: "notif_low_stock", label: "Low Stock Alerts", description: "Get notified when product stock drops below threshold." },
    { key: "notif_new_service_requests", label: "New Service Requests", description: "Get notified when a service/quote request is submitted." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-h3 font-semibold">Notification Preferences</h3>
          <p className="text-body-sm text-text-secondary mt-1">
            Control which events generate admin notifications. These toggles affect whether the Notification entity is created.
          </p>
        </div>
        <SaveIndicator state={saveState} />
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            {notifOptions.map((opt) => (
              <label
                key={opt.key}
                className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0 cursor-pointer"
              >
                <div>
                  <p className="text-body font-medium">{opt.label}</p>
                  <p className="text-body-sm text-text-secondary">{opt.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePref(opt.key)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                    preferences[opt.key] ? "bg-accent" : "bg-surface-neutral",
                  )}
                  role="switch"
                  aria-checked={preferences[opt.key] || false}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5",
                      preferences[opt.key] ? "translate-x-5 ml-0.5" : "translate-x-0.5",
                    )}
                  />
                </button>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saveState === "saving"}>
          <Save size={16} />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

// ─── Main Settings Client ───
export function SettingsClient() {
  const [activeTab, setActiveTab] = useState<TabId>("company");

  const renderPanel = () => {
    switch (activeTab) {
      case "company":
        return <CompanyPanel />;
      case "users":
        return <UsersPanel />;
      case "roles":
        return <RolesPanel />;
      case "integrations":
        return <IntegrationsPanel />;
      case "notifications":
        return <NotificationsPanel />;
    }
  };

  return (
    <div className="flex gap-6 min-h-[calc(100vh-10rem)]">
      {/* Sub-sidebar navigation */}
      <nav className="w-56 shrink-0">
        <div className="sticky top-6 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm transition-colors text-left",
                  activeTab === tab.id
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-neutral",
                )}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Panel content */}
      <div className="flex-1 min-w-0">{renderPanel()}</div>
    </div>
  );
}
