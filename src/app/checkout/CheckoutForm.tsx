"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";

export function CheckoutForm() {
  const router = useRouter();
  const { success, error } = useToast();
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingName,
          shippingPhone,
          shippingAddress,
          shippingCity,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        orderId?: string;
      };
      if (!res.ok) {
        error(data.error ?? "Could not place order");
        return;
      }
      if (data.orderId) {
        window.dispatchEvent(new Event("nadee:cart"));
        success("Order placed successfully");
        router.push(`/checkout/success?id=${encodeURIComponent(data.orderId)}`);
        router.refresh();
      }
    } catch {
      error("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-5">
      <div>
        <label htmlFor="shippingName" className="block text-sm font-medium">
          Full name
        </label>
        <input
          id="shippingName"
          required
          value={shippingName}
          onChange={(e) => setShippingName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="shippingPhone" className="block text-sm font-medium">
          Phone
        </label>
        <input
          id="shippingPhone"
          required
          value={shippingPhone}
          onChange={(e) => setShippingPhone(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="shippingAddress" className="block text-sm font-medium">
          Address
        </label>
        <input
          id="shippingAddress"
          required
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="shippingCity" className="block text-sm font-medium">
          City
        </label>
        <input
          id="shippingCity"
          required
          value={shippingCity}
          onChange={(e) => setShippingCity(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <p className="text-xs text-[var(--muted)]">
        Payment is not processed online in this demo—your order is recorded as
        placed for follow-up (e.g. cash on delivery or bank transfer).
      </p>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-[var(--accent)] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}
