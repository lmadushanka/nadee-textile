"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/toast";
import {
  DEFAULT_SITE_SETTINGS,
  FEATURED_PRODUCT_LIMIT_RANGE,
  type ResolvedSiteSettings,
} from "@/lib/site-settings-defaults";

function featuredDefaults(): Pick<
  ResolvedSiteSettings,
  | "featuredEyebrow"
  | "featuredTitleLead"
  | "featuredTitleAccent"
  | "featuredSubtitle"
  | "featuredCtaLabel"
  | "featuredCtaHref"
  | "featuredProductLimit"
  | "featuredEmptyTitle"
  | "featuredEmptyBody"
> {
  return {
    featuredEyebrow: DEFAULT_SITE_SETTINGS.featuredEyebrow,
    featuredTitleLead: DEFAULT_SITE_SETTINGS.featuredTitleLead,
    featuredTitleAccent: DEFAULT_SITE_SETTINGS.featuredTitleAccent,
    featuredSubtitle: DEFAULT_SITE_SETTINGS.featuredSubtitle,
    featuredCtaLabel: DEFAULT_SITE_SETTINGS.featuredCtaLabel,
    featuredCtaHref: DEFAULT_SITE_SETTINGS.featuredCtaHref,
    featuredProductLimit: DEFAULT_SITE_SETTINGS.featuredProductLimit,
    featuredEmptyTitle: DEFAULT_SITE_SETTINGS.featuredEmptyTitle,
    featuredEmptyBody: DEFAULT_SITE_SETTINGS.featuredEmptyBody,
  };
}

export function FeaturedSettingsForm() {
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
    success("Featured section saved");
  }

  if (loading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-zinc-100" aria-hidden />;
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="featuredEyebrow">
          Eyebrow label
        </label>
        <input
          id="featuredEyebrow"
          type="text"
          value={form.featuredEyebrow}
          onChange={(e) => setForm((f) => ({ ...f, featuredEyebrow: e.target.value }))}
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
          maxLength={120}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="block text-sm font-semibold text-[var(--ink)]"
            htmlFor="featuredTitleLead"
          >
            Heading — first word(s)
          </label>
          <input
            id="featuredTitleLead"
            type="text"
            value={form.featuredTitleLead}
            onChange={(e) => setForm((f) => ({ ...f, featuredTitleLead: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
            maxLength={120}
            required
          />
        </div>
        <div>
          <label
            className="block text-sm font-semibold text-[var(--ink)]"
            htmlFor="featuredTitleAccent"
          >
            Heading — gradient word(s)
          </label>
          <input
            id="featuredTitleAccent"
            type="text"
            value={form.featuredTitleAccent}
            onChange={(e) => setForm((f) => ({ ...f, featuredTitleAccent: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
            maxLength={120}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="featuredSubtitle">
          Description
        </label>
        <textarea
          id="featuredSubtitle"
          value={form.featuredSubtitle}
          onChange={(e) => setForm((f) => ({ ...f, featuredSubtitle: e.target.value }))}
          rows={4}
          className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
          maxLength={2000}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="featuredCtaLabel">
            CTA button label
          </label>
          <input
            id="featuredCtaLabel"
            type="text"
            value={form.featuredCtaLabel}
            onChange={(e) => setForm((f) => ({ ...f, featuredCtaLabel: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
            maxLength={120}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="featuredCtaHref">
            CTA link (internal path)
          </label>
          <input
            id="featuredCtaHref"
            type="text"
            value={form.featuredCtaHref}
            onChange={(e) => setForm((f) => ({ ...f, featuredCtaHref: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
            maxLength={500}
            placeholder="/products"
            required
          />
        </div>
      </div>

      <div>
        <label
          className="block text-sm font-semibold text-[var(--ink)]"
          htmlFor="featuredProductLimit"
        >
          Max featured products on home
        </label>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Uses products marked <strong>featured</strong> in Admin (newest first). Allowed range:{" "}
          {FEATURED_PRODUCT_LIMIT_RANGE.min}–{FEATURED_PRODUCT_LIMIT_RANGE.max}.
        </p>
        <input
          id="featuredProductLimit"
          type="number"
          min={FEATURED_PRODUCT_LIMIT_RANGE.min}
          max={FEATURED_PRODUCT_LIMIT_RANGE.max}
          step={1}
          value={form.featuredProductLimit}
          onChange={(e) => {
            const v = Number(e.target.value);
            setForm((f) => ({
              ...f,
              featuredProductLimit: Number.isFinite(v)
                ? Math.min(
                    FEATURED_PRODUCT_LIMIT_RANGE.max,
                    Math.max(FEATURED_PRODUCT_LIMIT_RANGE.min, Math.floor(v)),
                  )
                : f.featuredProductLimit,
            }));
          }}
          className="mt-2 w-32 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
          required
        />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--paper)]/40 p-4">
        <p className="text-sm font-semibold text-[var(--ink)]">When no featured products exist</p>
        <div className="mt-4 space-y-4">
          <div>
            <label
              className="block text-xs font-semibold text-[var(--muted)]"
              htmlFor="featuredEmptyTitle"
            >
              Title
            </label>
            <input
              id="featuredEmptyTitle"
              type="text"
              value={form.featuredEmptyTitle}
              onChange={(e) => setForm((f) => ({ ...f, featuredEmptyTitle: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
              maxLength={200}
              required
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold text-[var(--muted)]"
              htmlFor="featuredEmptyBody"
            >
              Message
            </label>
            <textarea
              id="featuredEmptyBody"
              value={form.featuredEmptyBody}
              onChange={(e) => setForm((f) => ({ ...f, featuredEmptyBody: e.target.value }))}
              rows={5}
              className="mt-1 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
              maxLength={2000}
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
          {saving ? "Saving…" : "Save featured section"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => setForm((f) => ({ ...f, ...featuredDefaults() }))}
          className="rounded-full border border-[var(--border)] bg-white px-6 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper)] disabled:opacity-60"
        >
          Reset featured fields to defaults
        </button>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Hero and fabric copy are edited on their own settings pages; this save sends your full site
        document so other sections stay as they are.
      </p>
    </form>
  );
}
