import { prisma, safeQuery } from "@/lib/prisma";
import { Card, EmptyState } from "@/components/ui";

export default async function AdminSettingsPage() {
  const settings = await safeQuery(
    () => prisma.siteSetting.findMany({ orderBy: { key: "asc" } }),
    [],
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Settings</h1>
        <p className="text-body text-text-secondary mt-1">
          Manage site configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-h3 font-semibold mb-4">Company Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-body-sm text-text-tertiary">Company Name</p>
              <p className="text-body font-medium">MVM FOX</p>
            </div>
            <div>
              <p className="text-body-sm text-text-tertiary">Email</p>
              <p className="text-body font-medium">info@mvmfox.com</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-h3 font-semibold mb-4">Site Settings</h2>
          {settings.length === 0 ? (
            <p className="text-body-sm text-text-tertiary">
              No custom settings configured yet.
            </p>
          ) : (
            <div className="space-y-3">
              {settings.map((setting) => (
                <div key={setting.id}>
                  <p className="text-body-sm text-text-tertiary">
                    {setting.key}
                  </p>
                  <p className="text-body font-medium">
                    {typeof setting.value === "string"
                      ? setting.value
                      : JSON.stringify(setting.value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
