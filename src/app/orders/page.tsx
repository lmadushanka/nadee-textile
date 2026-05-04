import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { formatRs } from "@/lib/format-currency";
import { Order, type OrderLine } from "@/models/Order";
import { Types } from "mongoose";

export const metadata: Metadata = {
  title: "My orders",
};

function badgeClass(status: string) {
  if (status === "placed") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "processing")
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "shipped") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-red-50 text-red-700 border-red-200";
}

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/orders");
  }

  await connectDB();
  const orders = await Order.find({
    userId: new Types.ObjectId(session.user.id),
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return (
    <div className="w-full px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">
        My orders
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Track your order history and current order status.
      </p>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--border)] bg-white p-10 text-center">
          <p className="font-medium text-[var(--ink)]">No orders yet</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Start by adding products to your cart and placing an order.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-[var(--ink)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <article
              key={String(order._id)}
              className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                    Order reference
                  </p>
                  <p className="font-mono text-sm text-[var(--ink)]">{String(order._id)}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {new Date(String(order.createdAt)).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(String(order.status))}`}
                  >
                    {String(order.status)}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-[var(--accent)]">
                    {formatRs(Number(order.total ?? 0))}
                  </p>
                </div>
              </div>

              {(() => {
                const tracking =
                  String(order.status) === "shipped"
                    ? String(
                        (order as { trackingNumber?: string | null }).trackingNumber ?? "",
                      ).trim()
                    : "";
                if (!tracking) return null;
                return (
                  <div className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                      Tracking number
                    </p>
                    <p className="mt-1 break-all font-mono text-sm font-medium text-[var(--ink)]">
                      {tracking}
                    </p>
                  </div>
                );
              })()}

              <div className="mt-4 grid gap-3">
                {(Array.isArray(order.lines) ? (order.lines as OrderLine[]) : []).map(
                  (line, i) => (
                  <div
                    key={`${line.name}-${i}`}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--paper)]/60 p-3"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                      <Image
                        src={line.imageUrl}
                        alt={line.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--ink)]">
                        {line.name}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {formatRs(Number(line.unitPrice ?? 0))} × {Number(line.quantity ?? 0)}
                      </p>
                      {line.selectedSize || line.selectedColor ? (
                        <p className="text-xs text-[var(--muted)]">
                          {line.selectedSize ? `Size: ${line.selectedSize}` : ""}
                          {line.selectedSize && line.selectedColor ? " | " : ""}
                          {line.selectedColor ? `Color: ${line.selectedColor}` : ""}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
