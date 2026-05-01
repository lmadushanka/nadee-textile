import type { Metadata } from "next";
import Link from "next/link";
import { AdminProductsManager } from "./AdminProductsManager";

export const metadata: Metadata = {
  title: "Admin Products",
};

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">
            Products
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Manage your catalog and add new clothing items.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex rounded-full bg-[var(--accent-deep)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          + Add product
        </Link>
      </div>

      <div className="mt-8">
        <AdminProductsManager />
      </div>
    </div>
  );
}
