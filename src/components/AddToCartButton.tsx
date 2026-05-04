"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";
import type { ProductSizeDisplayStyle } from "@/lib/site-settings-defaults";

type Props = {
  productId: string;
  disabled?: boolean;
  disabledLabel?: string;
  sizes?: string[];
  colors?: string[];
  sizeDisplayStyle?: ProductSizeDisplayStyle;
};

function isHexColor(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

export function AddToCartButton({
  productId,
  disabled,
  disabledLabel,
  sizes = [],
  colors = [],
  sizeDisplayStyle = "chips",
}: Props) {
  const { success, error } = useToast();
  const [busy, setBusy] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const missingSize = sizes.length > 0 && !selectedSize;
  const missingColor = colors.length > 0 && !selectedColor;
  const selectionMissing = missingSize || missingColor;
  const selectionCtaLabel =
    missingSize && missingColor
      ? "Select size & color"
      : missingSize
        ? "Select size"
        : missingColor
          ? "Select color"
          : "Add to cart";

  async function add() {
    if (missingSize) {
      error("Please select a size");
      return;
    }
    if (missingColor) {
      error("Please select a color");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          selectedSize: selectedSize || undefined,
          selectedColor: selectedColor || undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        error(data.error ?? "Could not add to cart");
        return;
      }
      window.dispatchEvent(new Event("nadee:cart"));
      success("Added to cart");
    } catch {
      error("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      {sizes.length > 0 ? (
        <div className="mb-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Select size
          </p>
          {sizeDisplayStyle === "table" ? (
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--paper)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    <th scope="col" className="px-3 py-2">
                      Size
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => {
                    const active = selectedSize === size;
                    return (
                      <tr key={size} className="border-b border-[var(--border)] last:border-b-0">
                        <td className="p-0">
                          <button
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`flex w-full items-center justify-between px-3 py-2.5 text-left font-semibold text-[var(--ink)] transition hover:bg-[var(--paper)] ${
                              active ? "bg-[var(--accent-deep)]/10 text-[var(--accent-deep)]" : ""
                            }`}
                          >
                            <span>{size}</span>
                            {active ? (
                              <span className="text-xs font-semibold text-[var(--accent-deep)]">
                                Selected
                              </span>
                            ) : null}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    selectedSize === size
                      ? "border-[var(--accent-deep)] bg-[var(--accent-deep)] text-white"
                      : "border-[var(--border)] bg-white text-[var(--ink)] hover:border-[var(--accent-deep)]/30"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
      {colors.length > 0 ? (
        <div className="mb-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Select color
          </p>
          <div className="flex flex-wrap gap-1.5">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  selectedColor === color
                    ? "border-[var(--accent-deep)] bg-[var(--accent-deep)] text-white"
                    : "border-[var(--border)] bg-white text-[var(--ink)] hover:border-[var(--accent-deep)]/30"
                }`}
              >
                {isHexColor(color) ? (
                  <span
                    className="h-3 w-3 rounded-full border border-black/20"
                    style={{ backgroundColor: color }}
                  />
                ) : (
                  color
                )}
                {isHexColor(color) ? <span>Shade</span> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mb-3 rounded-xl border border-[var(--border)] bg-[var(--paper)] p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Quantity
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white p-1">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-8 w-8 rounded-full text-lg font-medium hover:bg-[var(--paper)]"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-[2ch] text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="h-8 w-8 rounded-full text-lg font-medium hover:bg-[var(--paper)]"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={add}
        disabled={busy || disabled || selectionMissing}
        className="w-full rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(12,18,34,0.18)] transition hover:opacity-90 disabled:opacity-60"
      >
        {disabled
          ? disabledLabel ?? "Unavailable"
          : busy
            ? "Adding…"
            : selectionMissing
              ? selectionCtaLabel
              : "Add to cart"}
      </button>
    </div>
  );
}
