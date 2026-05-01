"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useToast } from "@/components/toast";

type OrderStatus = "placed" | "processing" | "shipped" | "cancelled";

type OrderLine = {
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
  selectedSize?: string;
  selectedColor?: string;
};

type OrderItem = {
  _id: string;
  userId: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  lines: OrderLine[];
};

const STATUSES: OrderStatus[] = ["placed", "processing", "shipped", "cancelled"];

function formatRs(value: number) {
  return `Rs. ${value.toFixed(2)}`;
}

function badgeClass(status: OrderStatus) {
  if (status === "placed") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "processing")
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "shipped") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-red-50 text-red-700 border-red-200";
}

export function OrdersManager() {
  const { error, success } = useToast();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/orders")
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!alive) return;
        if (!ok) {
          error((d as { error?: string }).error ?? "Could not load orders");
          return;
        }
        setOrders((Array.isArray(d) ? d : []) as OrderItem[]);
      })
      .catch(() => alive && error("Could not load orders"))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [error]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setBusyId(orderId);
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      order?: { status?: OrderStatus };
    };
    if (!res.ok) {
      error(data.error ?? "Could not update order status");
      setBusyId(null);
      return;
    }
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, status: data.order?.status ?? o.status } : o,
      ),
    );
    setBusyId(null);
    success("Order status updated");
  }

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" aria-hidden />;
  }

  if (!orders.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-10 text-center">
        <p className="font-medium text-[var(--ink)]">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <article
          key={order._id}
          className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Order ID</p>
              <p className="font-mono text-sm text-[var(--ink)]">{order._id}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(order.status)}`}
              >
                {order.status}
              </span>
              <p className="mt-2 text-sm font-semibold text-[var(--accent)]">
                {formatRs(order.total)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
            <p>
              <span className="font-semibold text-[var(--ink)]">Customer:</span>{" "}
              {order.shippingName}
            </p>
            <p>
              <span className="font-semibold text-[var(--ink)]">Phone:</span>{" "}
              {order.shippingPhone}
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold text-[var(--ink)]">Address:</span>{" "}
              {order.shippingAddress}, {order.shippingCity}
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            {order.lines.map((line, i) => (
              <div
                key={`${line.name}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--paper)]/60 p-3"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                  <Image src={line.imageUrl} alt={line.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--ink)]">{line.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {formatRs(line.unitPrice)} × {line.quantity}
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

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Update status
            </p>
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                disabled={busyId === order._id || order.status === s}
                onClick={() => void updateStatus(order._id, s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  order.status === s
                    ? "border-[var(--accent-deep)] bg-[var(--accent-deep)] text-white"
                    : "border-[var(--border)] bg-white text-[var(--ink)] hover:border-[var(--accent-deep)]/25"
                } disabled:opacity-60`}
              >
                {s}
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
