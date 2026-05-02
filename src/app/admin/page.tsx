import type { Metadata } from "next";
import Link from "next/link";
import { AdminDashboardCharts } from "@/components/admin/AdminDashboardCharts";
import { connectDB } from "@/lib/mongodb";
import { getDashboardDailySeries } from "@/lib/adminStats";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Order } from "@/models/Order";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminHomePage() {
  await connectDB();
  const [productCount, categoryCount, featuredCount, orderCount, chartSeries] =
    await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Product.countDocuments({ featured: true }),
      Order.countDocuments(),
      getDashboardDailySeries(21),
    ]);

  return (
    <div className="min-w-0">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
        Admin
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
        Manage products and categories for nadee-textile from a single admin
        panel.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 min-[480px]:gap-4 lg:mt-8 lg:grid-cols-4">
        {[
          { label: "Products", value: productCount },
          { label: "Categories", value: categoryCount },
          { label: "Featured", value: featuredCount },
          { label: "Orders", value: orderCount },
        ].map((s) => (
          <article
            key={s.label}
            className="min-w-0 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5"
          >
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] sm:text-xs">
              {s.label}
            </p>
            <p className="mt-1.5 truncate font-display text-2xl font-semibold tabular-nums text-[var(--ink)] sm:mt-2 sm:text-3xl">
              {s.value}
            </p>
          </article>
        ))}
      </div>

      <p className="mt-6 text-xs text-[var(--muted)] sm:text-sm">
        Statistics cover the last 21 days (local dates).
      </p>
      <AdminDashboardCharts data={chartSeries} />

      <div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3">
        <Link
          href="/admin/products/new"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-[var(--accent-deep)] px-5 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90"
        >
          Add product
        </Link>
        <Link
          href="/admin/categories"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-center text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper)]"
        >
          Manage categories
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-center text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper)]"
        >
          Manage orders
        </Link>
      </div>
    </div>
  );
}
