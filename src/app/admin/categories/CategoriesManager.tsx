"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/toast";

type Category = {
  _id: string;
  name: string;
  slug: string;
};

export function CategoriesManager() {
  const { success, error } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/categories")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!alive) {
          return;
        }
        if (!ok) {
          const msg =
            (data as { error?: string }).error ?? "Could not load categories";
          error(msg);
          return;
        }
        setCategories(Array.isArray(data) ? (data as Category[]) : []);
      })
      .catch(() => {
        if (alive) {
          error("Could not load categories");
        }
      });
    return () => {
      alive = false;
    };
  }, [error]);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        category?: Category;
      };
      if (!res.ok || !data.category) {
        error(data.error ?? "Could not create category");
        return;
      }
      const created = data.category;
      setCategories((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setName("");
      success(`Category "${created.name}" added`);
    } catch {
      error("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function removeCategory(id: string) {
    const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      error(data.error ?? "Could not delete category");
      return;
    }
    setCategories((prev) => prev.filter((c) => c._id !== id));
    success("Category removed");
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={addCategory}
        className="rounded-2xl border border-[var(--border)] bg-white p-5"
      >
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
          Add category
        </h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Shirts"
            className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent-deep)] focus:ring-2"
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-[var(--accent-deep)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Adding..." : "Add"}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
          Existing categories
        </h2>
        {categories.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            No categories yet. Add your first category above.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {categories.map((c) => (
              <li
                key={c._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--paper)] px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">{c.name}</p>
                  <p className="text-xs text-[var(--muted)]">slug: {c.slug}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeCategory(c._id)}
                  className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
