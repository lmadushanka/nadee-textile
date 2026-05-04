import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { formatRs } from "@/lib/format-currency";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

export const metadata: Metadata = {
  title: "Order placed",
};

type Props = { searchParams: Promise<{ id?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { id } = await searchParams;
  if (!id || !Types.ObjectId.isValid(id)) {
    redirect("/products");
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order || String(order.userId) !== session.user.id) {
    redirect("/products");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
        Thank you
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--ink)]">
        Order placed
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Your order reference is{" "}
        <span className="font-mono font-medium text-[var(--ink)]">{id}</span>.
        We will contact you to confirm delivery and payment.
      </p>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Total:{" "}
        <span className="font-semibold text-[var(--ink)]">
          {formatRs(Number(order.total))}
        </span>
      </p>
      <Link
        href="/products"
        className="mt-8 inline-flex rounded-full bg-[var(--ink)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Continue shopping
      </Link>
    </div>
  );
}
