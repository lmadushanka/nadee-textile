import type { Metadata } from "next";
import { BrandSettingsForm } from "./BrandSettingsForm";

export const metadata: Metadata = {
  title: "Brand · Site settings",
};

export default function AdminBrandSettingsPage() {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-[var(--ink)]">Logo & favicon</h2>
      <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
        Site-wide header and footer logo, accessible logo name, and browser tab icon. Upload PNG or
        WebP, or paste a URL. Favicons can be ICO or image URLs.
      </p>
      <div className="mt-6">
        <BrandSettingsForm />
      </div>
    </div>
  );
}
