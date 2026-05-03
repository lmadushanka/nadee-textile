"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/toast";
import {
  DEFAULT_SITE_SETTINGS,
  type ResolvedSiteSettings,
} from "@/lib/site-settings-defaults";

function productsDefaults(): Pick<
  ResolvedSiteSettings,
  | "productsEyebrow"
  | "productsTitleAll"
  | "productsCategoryTitleTemplate"
  | "productsIntro"
  | "productsSeoTitle"
  | "productsSeoDescription"
> {
  return {
    productsEyebrow: DEFAULT_SITE_SETTINGS.productsEyebrow,
    productsTitleAll: DEFAULT_SITE_SETTINGS.productsTitleAll,
    productsCategoryTitleTemplate: DEFAULT_SITE_SETTINGS.productsCategoryTitleTemplate,
    productsIntro: DEFAULT_SITE_SETTINGS.productsIntro,
    productsSeoTitle: DEFAULT_SITE_SETTINGS.productsSeoTitle,
    productsSeoDescription: DEFAULT_SITE_SETTINGS.productsSeoDescription,
  };
}

export function ProductsSettingsForm() {
  const { error, success } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ResolvedSiteSettings>({
    ...DEFAULT_SITE_SETTINGS,
  });

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/site-settings")
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!alive) return;
        if (!ok) {
          error((d as { error?: string }).error ?? "Could not load settings");
          return;
        }
        setForm({ ...(d as ResolvedSiteSettings) });
      })
      .catch(() => alive && error("Could not load settings"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [error]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/site-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      settings?: ResolvedSiteSettings;
    };
    setSaving(false);
    if (!res.ok) {
      error(data.error ?? "Could not save");
      return;
    }
    if (data.settings) setForm(data.settings);
    success("Products page settings saved");
  }

  if (loading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-zinc-100" aria-hidden />;
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="productsEyebrow">
          Eyebrow label
        </label>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Small line above the main heading. Leave empty to hide it on the storefront.
        </p>
        <input
          id="productsEyebrow"
          type="text"
          value={form.productsEyebrow}
          onChange={(e) => setForm((f) => ({ ...f, productsEyebrow: e.target.value }))}
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
          maxLength={120}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="productsTitleAll">
          Page title — all products
        </label>
        <input
          id="productsTitleAll"
          type="text"
          value={form.productsTitleAll}
          onChange={(e) => setForm((f) => ({ ...f, productsTitleAll: e.target.value }))}
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
          maxLength={200}
          required
        />
      </div>

      <div>
        <label
          className="block text-sm font-semibold text-[var(--ink)]"
          htmlFor="productsCategoryTitleTemplate"
        >
          Page title — category filter
        </label>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Must include <code className="rounded bg-black/[0.06] px-1">{"{category}"}</code> where the
          category name should appear (example:{" "}
          <code className="rounded bg-black/[0.06] px-1">{"{category} products"}</code>).
        </p>
        <input
          id="productsCategoryTitleTemplate"
          type="text"
          value={form.productsCategoryTitleTemplate}
          onChange={(e) =>
            setForm((f) => ({ ...f, productsCategoryTitleTemplate: e.target.value }))
          }
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
          maxLength={200}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="productsIntro">
          Intro paragraph
        </label>
        <textarea
          id="productsIntro"
          value={form.productsIntro}
          onChange={(e) => setForm((f) => ({ ...f, productsIntro: e.target.value }))}
          rows={4}
          className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
          maxLength={2000}
          required
        />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--paper)]/40 p-4">
        <p className="text-sm font-semibold text-[var(--ink)]">SEO (browser tab & search)</p>
        <div className="mt-4 space-y-4">
          <div>
            <label
              className="block text-xs font-semibold text-[var(--muted)]"
              htmlFor="productsSeoTitle"
            >
              Default tab title
            </label>
            <input
              id="productsSeoTitle"
              type="text"
              value={form.productsSeoTitle}
              onChange={(e) => setForm((f) => ({ ...f, productsSeoTitle: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
              maxLength={120}
              required
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold text-[var(--muted)]"
              htmlFor="productsSeoDescription"
            >
              Meta description
            </label>
            <textarea
              id="productsSeoDescription"
              value={form.productsSeoDescription}
              onChange={(e) => setForm((f) => ({ ...f, productsSeoDescription: e.target.value }))}
              rows={3}
              className="mt-1 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
              maxLength={320}
              required
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[var(--accent-deep)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save products page"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => setForm((f) => ({ ...f, ...productsDefaults() }))}
          className="rounded-full border border-[var(--border)] bg-white px-6 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper)] disabled:opacity-60"
        >
          Reset products page fields to defaults
        </button>
      </div>
    </form>
  );
}
