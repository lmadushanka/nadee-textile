import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/models/Cart";
import { Types } from "mongoose";
import { buildCartPayload } from "@/lib/cart-request";
import { formatRs } from "@/lib/format-currency";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  await connectDB();
  const cart = await Cart.findOne({
    userId: new Types.ObjectId(session.user.id),
  });
  const payload = cart
    ? await buildCartPayload(cart)
    : { items: [], subtotal: 0 };

  if (!payload.items.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold text-[var(--ink)]">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Add products before checking out.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-full bg-[var(--ink)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">
        Checkout
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Subtotal:{" "}
        <span className="font-semibold text-[var(--ink)]">
          {formatRs(payload.subtotal)}
        </span>{" "}
        · {payload.items.length} line
        {payload.items.length === 1 ? "" : "s"}
      </p>
      <div className="mt-10">
        <CheckoutForm />
      </div>
    </div>
  );
}
