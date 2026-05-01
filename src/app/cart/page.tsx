import type { Metadata } from "next";
import { CartClient } from "./CartClient";

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">
        Shopping cart
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Update quantities here. Sign in before checkout to place your order.
      </p>
      <div className="mt-8">
        <CartClient />
      </div>
    </div>
  );
}
