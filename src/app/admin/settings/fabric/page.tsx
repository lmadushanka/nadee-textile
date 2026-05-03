import type { Metadata } from "next";
import { FabricSettingsForm } from "./FabricSettingsForm";

export const metadata: Metadata = {
  title: "Fabric · Site settings",
};

export default function AdminFabricSettingsPage() {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-[var(--ink)]">Fabric section</h2>
      <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
        Image, title, and body for the “Fabric-first mindset” block on the home page.
      </p>
      <div className="mt-6">
        <FabricSettingsForm />
      </div>
    </div>
  );
}
