import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Order } from "@/models/Order";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminHomePage() {
  await connectDB();
  const [productCount, categoryCount, featuredCount, orderCount] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    Product.countDocuments({ featured: true }),
    Order.countDocuments(),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">
        Admin
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        Manage products and categories for nadee-textile from a single admin
        panel.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Products", value: productCount },
          { label: "Categories", value: categoryCount },
          { label: "Featured", value: featuredCount },
          { label: "Orders", value: orderCount },
        ].map((s) => (
          <article
            key={s.label}
            className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              {s.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-[var(--ink)]">
              {s.value}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className="inline-flex rounded-full bg-[var(--accent-deep)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Add product
        </Link>
        <Link
          href="/admin/categories"
          className="inline-flex rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper)]"
        >
          Manage categories
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper)]"
        >
          Manage orders
        </Link>
      </div>
    </div>
  );
}
