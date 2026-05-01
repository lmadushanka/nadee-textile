import type { Metadata } from "next";
import { CategoriesManager } from "./CategoriesManager";

export const metadata: Metadata = {
  title: "Admin Categories",
};

export default function AdminCategoriesPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">
        Categories
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Create and manage categories separately, then use them when adding
        products.
      </p>
      <div className="mt-8">
        <CategoriesManager />
      </div>
    </div>
  );
}
