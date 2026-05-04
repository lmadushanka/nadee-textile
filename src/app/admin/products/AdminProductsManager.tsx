"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useToast } from "@/components/toast";
import { formatRs } from "@/lib/format-currency";

type Product = {
  _id: string;
  name: string;
  category: string;
  imageUrl: string;
  price: number;
  quantity: number;
  active: boolean;
  featured: boolean;
  sizes: string[];
  colors: string[];
};

function normalizeProduct(raw: Record<string, unknown>): Product {
  return {
    _id: String(raw._id),
    name: String(raw.name ?? ""),
    category: String(raw.category ?? ""),
    imageUrl: String(raw.imageUrl ?? ""),
    price: Number(raw.price ?? 0),
    quantity: Number(raw.quantity ?? 0),
    active: Boolean(raw.active ?? true),
    featured: Boolean(raw.featured),
    sizes: Array.isArray(raw.sizes) ? raw.sizes.map(String) : [],
    colors: Array.isArray(raw.colors) ? raw.colors.map(String) : [],
  };
}

export function AdminProductsManager() {
  const { success, error } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/products", { cache: "no-store" })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!alive) {
          return;
        }
        if (!ok) {
          error((d as { error?: string }).error ?? "Could not load products");
          return;
        }
        const list = Array.isArray(d) ? d : [];
        setProducts(list.map((item) => normalizeProduct(item as Record<string, unknown>)));
      })
      .catch(() => {
        if (alive) {
          error("Could not load products");
        }
      });
    return () => {
      alive = false;
    };
  }, [error]);

  async function updateProduct(
    id: string,
    patch: Partial<
      Pick<Product, "quantity" | "active" | "featured" | "sizes" | "colors">
    >,
  ) {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      product?: Partial<Product>;
    };
    if (!res.ok) {
      error(data.error ?? "Could not update product");
      return;
    }
    setProducts((prev) =>
      prev.map((p) =>
        p._id === id
          ? {
              ...p,
              quantity:
                data.product?.quantity !== undefined
                  ? data.product.quantity
                  : p.quantity,
              active:
                data.product?.active !== undefined ? data.product.active : p.active,
              featured:
                data.product?.featured !== undefined
                  ? data.product.featured
                  : p.featured,
              sizes:
                data.product?.sizes !== undefined ? data.product.sizes : p.sizes,
              colors:
                data.product?.colors !== undefined ? data.product.colors : p.colors,
            }
          : p,
      ),
    );
  }

  async function removeProduct(id: string) {
    setDeleteBusy(true);
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      error(data.error ?? "Could not delete product");
      setDeleteBusy(false);
      return;
    }
    setProducts((prev) => prev.filter((p) => p._id !== id));
    setConfirmDeleteId(null);
    setDeleteBusy(false);
    success("Product deleted");
  }

  const confirmProduct = confirmDeleteId
    ? products.find((p) => p._id === confirmDeleteId) ?? null
    : null;

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--muted)]">
        Featured items appear on the home page only when both{" "}
        <span className="font-semibold text-[var(--ink)]">Featured</span> and{" "}
        <span className="font-semibold text-[var(--ink)]">Active</span> are enabled.
      </p>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-10 text-center">
          <p className="font-medium text-[var(--ink)]">No products yet</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <li
              key={product._id}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-zinc-100">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="space-y-2 p-4">
                <p className="font-semibold text-[var(--ink)]">{product.name}</p>
                <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                  {product.category}
                </p>
                <p className="text-sm font-semibold text-[var(--accent)]">
                  {formatRs(product.price)}
                </p>

                <div className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--paper)] p-2">
                  <label className="text-xs font-medium text-[var(--muted)]">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={Number.isFinite(product.quantity) ? product.quantity : 0}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      const q =
                        e.target.value === "" || !Number.isFinite(n)
                          ? 0
                          : Math.max(0, Math.floor(n));
                      setProducts((prev) =>
                        prev.map((p) =>
                          p._id === product._id ? { ...p, quantity: q } : p,
                        ),
                      );
                    }}
                    onBlur={(e) => {
                      const n = Number(e.target.value);
                      const q =
                        e.target.value === "" || !Number.isFinite(n)
                          ? 0
                          : Math.max(0, Math.floor(n));
                      void updateProduct(product._id, { quantity: q });
                    }}
                    className="w-24 rounded-md border border-[var(--border)] bg-white px-2 py-1 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--muted)]">
                    Sizes (comma-separated)
                  </label>
                  <input
                    key={`sizes-${product._id}-${product.sizes.join("|")}`}
                    type="text"
                    defaultValue={product.sizes.join(", ")}
                    onBlur={(e) => {
                      const sizes = e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      void updateProduct(product._id, { sizes });
                    }}
                    placeholder="S, M, L, XL"
                    className="w-full rounded-md border border-[var(--border)] bg-white px-2 py-1.5 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--muted)]">
                    Colors (comma-separated hex or names)
                  </label>
                  <input
                    key={`colors-${product._id}-${product.colors.join("|")}`}
                    type="text"
                    defaultValue={product.colors.join(", ")}
                    onBlur={(e) => {
                      const colors = e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      void updateProduct(product._id, { colors });
                    }}
                    placeholder="#111111, Navy, #ffffff"
                    className="w-full rounded-md border border-[var(--border)] bg-white px-2 py-1.5 text-sm"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={product.featured}
                    onChange={(e) =>
                      void updateProduct(product._id, {
                        featured: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[var(--border)]"
                  />
                  Featured on home
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={product.active}
                    onChange={(e) =>
                      void updateProduct(product._id, { active: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-[var(--border)]"
                  />
                  Active
                </label>

                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(product._id)}
                  className="w-full rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Delete product
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {confirmProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close delete confirmation"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={() => {
              if (!deleteBusy) {
                setConfirmDeleteId(null);
              }
            }}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-200 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-red-50 to-white px-6 py-5">
              <h3 className="font-display text-2xl font-semibold text-[var(--ink)]">
                Delete product?
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                This action cannot be undone. The product{" "}
                <span className="font-semibold text-[var(--ink)]">
                  {confirmProduct.name}
                </span>{" "}
                will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-5">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleteBusy}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper)] disabled:opacity-60"
              >
                No, keep it
              </button>
              <button
                type="button"
                onClick={() => void removeProduct(confirmProduct._id)}
                disabled={deleteBusy}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteBusy ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
