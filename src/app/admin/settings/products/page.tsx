import type { Metadata } from "next";
import { ProductsSettingsForm } from "./ProductsSettingsForm";

export const metadata: Metadata = {
  title: "Products page · Site settings",
};

export default function AdminProductsPageSettingsPage() {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-[var(--ink)]">Products page</h2>
      <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
        Public <code className="rounded bg-black/[0.06] px-1">/products</code> heading, intro, and
        SEO metadata—stored in MongoDB with the rest of site settings.
      </p>
      <div className="mt-6">
        <ProductsSettingsForm />
      </div>
    </div>
  );
}
