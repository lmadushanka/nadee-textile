"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useToast } from "@/components/toast";
import { formatRs } from "@/lib/format-currency";

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
  trackingNumber: string | null;
  createdAt: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  lines: OrderLine[];
};

const STATUSES: OrderStatus[] = ["placed", "processing", "shipped", "cancelled"];

function badgeClass(status: OrderStatus) {
  if (status === "placed") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "processing")
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "shipped") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-red-50 text-red-700 border-red-200";
}

function shortOrderId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…`;
}

export function OrdersManager() {
  const { error, success } = useToast();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  /** When set, admin is entering tracking before confirming shipped (or editing tracking). */
  const [shipFocus, setShipFocus] = useState<{ orderId: string; tracking: string } | null>(null);

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
        const list = (Array.isArray(d) ? d : []) as Partial<OrderItem>[];
        setOrders(
          list.map((row) => ({
            ...row,
            trackingNumber:
              typeof row.trackingNumber === "string" && row.trackingNumber.trim().length > 0
                ? row.trackingNumber.trim()
                : null,
          })) as OrderItem[],
        );
      })
      .catch(() => alive && error("Could not load orders"))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [error]);

  async function updateStatus(
    orderId: string,
    status: OrderStatus,
    trackingWhenShipped?: string,
  ) {
    setBusyId(orderId);
    const body =
      status === "shipped"
        ? { status, trackingNumber: (trackingWhenShipped ?? "").trim() }
        : { status };
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      order?: { status?: OrderStatus; trackingNumber?: string | null };
    };
    if (!res.ok) {
      error(data.error ?? "Could not update order status");
      setBusyId(null);
      return;
    }
    setOrders((prev) =>
      prev.map((o) => {
        if (String(o._id) !== String(orderId)) return o;
        const nextStatus = data.order?.status ?? o.status;
        const rawTn = data.order?.trackingNumber;
        const nextTracking =
          typeof rawTn === "string" && rawTn.trim().length > 0 ? rawTn.trim() : null;
        return { ...o, status: nextStatus, trackingNumber: nextTracking };
      }),
    );
    setBusyId(null);
    setShipFocus((prev) => (prev?.orderId === orderId ? null : prev));
    success("Order status updated");
  }

  function onStatusPillClick(order: OrderItem, s: OrderStatus) {
    if (s === "shipped") {
      setShipFocus({
        orderId: order._id,
        tracking: order.trackingNumber ?? "",
      });
      return;
    }
    if (shipFocus?.orderId === order._id) setShipFocus(null);
    void updateStatus(order._id, s);
  }

  function confirmShipped() {
    if (!shipFocus) return;
    void updateStatus(shipFocus.orderId, "shipped", shipFocus.tracking);
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
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white shadow-sm [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--paper)]/80 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tracking</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={`row-${order._id}`}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--paper)]/40"
              >
                <td className="px-4 py-3 font-mono text-xs text-[var(--ink)]" title={order._id}>
                  {shortOrderId(order._id)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--muted)]">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="max-w-[140px] truncate px-4 py-3 text-[var(--ink)]" title={order.shippingName}>
                  {order.shippingName}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="max-w-[200px] px-4 py-3 font-mono text-xs text-[var(--ink)]">
                  {order.trackingNumber ? (
                    <span className="break-all" title={order.trackingNumber}>
                      {order.trackingNumber}
                    </span>
                  ) : (
                    <span className="text-[var(--muted)]">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-[var(--accent)]">
                  {formatRs(order.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
              {order.status === "shipped" && order.trackingNumber ? (
                <p className="mt-2 max-w-[220px] break-all text-right font-mono text-xs text-[var(--muted)]">
                  Tracking: {order.trackingNumber}
                </p>
              ) : null}
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
                disabled={busyId === order._id || (order.status === s && s !== "shipped")}
                onClick={() => onStatusPillClick(order, s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  order.status === s && shipFocus?.orderId !== order._id
                    ? "border-[var(--accent-deep)] bg-[var(--accent-deep)] text-white"
                    : shipFocus?.orderId === order._id && s === "shipped"
                      ? "border-[var(--accent-deep)] bg-[var(--accent-deep)]/15 text-[var(--accent-deep)]"
                      : "border-[var(--border)] bg-white text-[var(--ink)] hover:border-[var(--accent-deep)]/25"
                } disabled:opacity-60`}
              >
                {s}
              </button>
            ))}
          </div>

          {shipFocus?.orderId === order._id ? (
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--paper)]/50 p-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Tracking number{" "}
                <span className="font-normal normal-case text-[var(--muted)]">(optional)</span>
              </label>
              <input
                type="text"
                value={shipFocus.tracking}
                onChange={(e) =>
                  setShipFocus((prev) =>
                    prev && prev.orderId === order._id
                      ? { ...prev, tracking: e.target.value.slice(0, 120) }
                      : prev,
                  )
                }
                placeholder="e.g. carrier AWB / reference"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
                autoComplete="off"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === order._id}
                  onClick={() => void confirmShipped()}
                  className="rounded-full bg-[var(--accent-deep)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {order.status === "shipped" ? "Save tracking" : "Mark as shipped"}
                </button>
                <button
                  type="button"
                  disabled={busyId === order._id}
                  onClick={() => setShipFocus(null)}
                  className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--paper)] disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </article>
      ))}
      </div>
    </div>
  );
}
