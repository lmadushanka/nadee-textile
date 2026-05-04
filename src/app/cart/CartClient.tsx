"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CartPayload } from "@/lib/cart-request";
import { formatRs } from "@/lib/format-currency";
import { useToast } from "@/components/toast";

function isHexColor(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

export function CartClient() {
  const { error: toastError } = useToast();
  const [data, setData] = useState<CartPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    return fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => {
        setData(d as CartPayload);
        setError(null);
      })
      .catch(() => {
        const msg = "Could not load cart";
        setError(msg);
        toastError(msg);
      });
  }, [toastError]);

  useEffect(() => {
    let alive = true;
    refresh().finally(() => {
      if (alive) {
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [refresh]);

  async function updateQty(
    productId: string,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string,
  ) {
    setError(null);
    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantity,
        selectedSize,
        selectedColor,
      }),
    });
    if (!res.ok) {
      const msg = "Could not update quantity";
      setError(msg);
      toastError(msg);
      return;
    }
    const next = (await res.json()) as CartPayload & { ok?: boolean };
    setData({
      items: next.items ?? [],
      subtotal: next.subtotal ?? 0,
    });
    window.dispatchEvent(new Event("nadee:cart"));
  }

  if (loading && !data) {
    return (
      <div className="h-48 animate-pulse rounded-2xl bg-zinc-100" aria-hidden />
    );
  }

  if (error && !data) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  const items = data?.items ?? [];
  const subtotal = data?.subtotal ?? 0;

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-10 text-center">
        <p className="font-medium text-[var(--ink)]">Your cart is empty</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Browse products and use &quot;Add to cart&quot; to build your order.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-full bg-[var(--ink)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Shop products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
        {items.map((line) => (
          <li
            key={line.lineId}
            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
              <Image
                src={line.imageUrl}
                alt={line.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--ink)]">{line.name}</p>
              <p className="text-sm text-[var(--muted)]">{line.category}</p>
              {line.selectedSize || line.selectedColor ? (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                  {line.selectedSize ? (
                    <span>{`Size: ${line.selectedSize}`}</span>
                  ) : null}
                  {line.selectedColor ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span>Color:</span>
                      {isHexColor(line.selectedColor) ? (
                        <>
                          <span
                            className="h-3 w-3 rounded-full border border-black/20"
                            style={{ backgroundColor: line.selectedColor }}
                          />
                          <span>Shade</span>
                        </>
                      ) : (
                        <span>{line.selectedColor}</span>
                      )}
                    </span>
                  ) : null}
                </div>
              ) : null}
              <p className="mt-1 text-sm font-semibold text-[var(--accent)]">
                {formatRs(line.price)} each
              </p>
            </div>
            <div className="flex items-center gap-2 sm:flex-col sm:items-end">
              <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--paper)] p-1">
                <button
                  type="button"
                  className="h-8 w-8 rounded-full text-lg font-medium hover:bg-white"
                  aria-label="Decrease quantity"
                  onClick={() =>
                    updateQty(
                      line.productId,
                      Math.max(0, line.quantity - 1),
                      line.selectedSize,
                      line.selectedColor,
                    )
                  }
                >
                  −
                </button>
                <span className="min-w-[2ch] text-center text-sm font-semibold">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  className="h-8 w-8 rounded-full text-lg font-medium hover:bg-white"
                  aria-label="Increase quantity"
                  onClick={() =>
                    updateQty(
                      line.productId,
                      line.quantity + 1,
                      line.selectedSize,
                      line.selectedColor,
                    )
                  }
                >
                  +
                </button>
              </div>
              <p className="text-sm font-semibold text-[var(--ink)]">
                {formatRs(line.price * line.quantity)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[var(--muted)]">Subtotal</p>
          <p className="font-display text-2xl font-semibold text-[var(--ink)]">
            {formatRs(subtotal)}
          </p>
        </div>
        <Link
          href="/checkout"
          className="inline-flex justify-center rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Proceed to checkout
        </Link>
      </div>
      <p className="text-center text-xs text-[var(--muted)]">
        You need to be signed in to complete checkout. Your guest cart merges
        into your account when you log in.
      </p>
    </div>
  );
}
