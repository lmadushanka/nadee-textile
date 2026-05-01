import type { Metadata } from "next";
import { AdminProductForm } from "./AdminProductForm";

export const metadata: Metadata = {
  title: "New product",
};

export default function AdminNewProductPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">
        Add product
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        New items appear on the public products page immediately.
      </p>
      <div className="mt-10">
        <AdminProductForm />
      </div>
    </div>
  );
}
