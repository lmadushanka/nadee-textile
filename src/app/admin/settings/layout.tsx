import type { Metadata } from "next";
import { SettingsSectionNav } from "./SettingsSectionNav";

export const metadata: Metadata = {
  title: "Site settings",
};

export default function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">Site settings</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        Home page content is stored in MongoDB. Open Fabric, Hero, or Featured below—each page
        saves the full settings document so other sections keep their current values.
      </p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <SettingsSectionNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
