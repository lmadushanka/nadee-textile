import type { Metadata } from "next";
import { OrdersManager } from "./OrdersManager";

export const metadata: Metadata = {
  title: "Orders",
};

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">
        Orders
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        View order details and update order status.
      </p>
      <div className="mt-6">
        <OrdersManager />
      </div>
    </div>
  );
}
