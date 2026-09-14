import type { Metadata } from "next";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = {
  title: "Settings | MVM FOX Kitchen",
};

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Settings</h1>
        <p className="text-body text-text-secondary mt-1">
          Manage your business configuration, users, and integrations.
        </p>
      </div>

      <SettingsClient />
    </div>
  );
}
