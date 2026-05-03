"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/toast";
import { DEFAULT_SITE_SETTINGS, type ResolvedSiteSettings } from "@/lib/site-settings-defaults";

function contactDefaults(): Pick<
  ResolvedSiteSettings,
  | "contactSeoTitle"
  | "contactSeoDescription"
  | "contactEyebrow"
  | "contactHeroTitle"
  | "contactHeroLead"
  | "contactVisitCardHeading"
  | "contactVisitAddress"
  | "contactHoursLabel"
  | "contactHoursText"
  | "contactReachCardHeading"
  | "contactPhone"
  | "contactPhoneHref"
  | "contactEmail"
  | "contactEmailHref"
  | "contactFooterLead"
  | "contactFooterLinkText"
  | "contactFooterLinkHref"
> {
  return {
    contactSeoTitle: DEFAULT_SITE_SETTINGS.contactSeoTitle,
    contactSeoDescription: DEFAULT_SITE_SETTINGS.contactSeoDescription,
    contactEyebrow: DEFAULT_SITE_SETTINGS.contactEyebrow,
    contactHeroTitle: DEFAULT_SITE_SETTINGS.contactHeroTitle,
    contactHeroLead: DEFAULT_SITE_SETTINGS.contactHeroLead,
    contactVisitCardHeading: DEFAULT_SITE_SETTINGS.contactVisitCardHeading,
    contactVisitAddress: DEFAULT_SITE_SETTINGS.contactVisitAddress,
    contactHoursLabel: DEFAULT_SITE_SETTINGS.contactHoursLabel,
    contactHoursText: DEFAULT_SITE_SETTINGS.contactHoursText,
    contactReachCardHeading: DEFAULT_SITE_SETTINGS.contactReachCardHeading,
    contactPhone: DEFAULT_SITE_SETTINGS.contactPhone,
    contactPhoneHref: DEFAULT_SITE_SETTINGS.contactPhoneHref,
    contactEmail: DEFAULT_SITE_SETTINGS.contactEmail,
    contactEmailHref: DEFAULT_SITE_SETTINGS.contactEmailHref,
    contactFooterLead: DEFAULT_SITE_SETTINGS.contactFooterLead,
    contactFooterLinkText: DEFAULT_SITE_SETTINGS.contactFooterLinkText,
    contactFooterLinkHref: DEFAULT_SITE_SETTINGS.contactFooterLinkHref,
  };
}

export function ContactSettingsForm() {
  const { error, success } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ResolvedSiteSettings>({ ...DEFAULT_SITE_SETTINGS });

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
    success("Contact page settings saved");
  }

  if (loading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-zinc-100" aria-hidden />;
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="max-w-2xl space-y-8">
      <fieldset className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6">
        <legend className="text-base font-semibold text-[var(--ink)]">SEO</legend>
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="contactSeoTitle">
            Browser title
          </label>
          <input
            id="contactSeoTitle"
            type="text"
            value={form.contactSeoTitle}
            onChange={(e) => setForm((f) => ({ ...f, contactSeoTitle: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={120}
            required
          />
        </div>
        <div>
          <label
            className="block text-sm font-semibold text-[var(--ink)]"
            htmlFor="contactSeoDescription"
          >
            Meta description
          </label>
          <textarea
            id="contactSeoDescription"
            value={form.contactSeoDescription}
            onChange={(e) => setForm((f) => ({ ...f, contactSeoDescription: e.target.value }))}
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={320}
            required
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6">
        <legend className="text-base font-semibold text-[var(--ink)]">Page header</legend>
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="contactEyebrow">
            Eyebrow (optional)
          </label>
          <input
            id="contactEyebrow"
            type="text"
            value={form.contactEyebrow}
            onChange={(e) => setForm((f) => ({ ...f, contactEyebrow: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={120}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="contactHeroTitle">
            Main title
          </label>
          <input
            id="contactHeroTitle"
            type="text"
            value={form.contactHeroTitle}
            onChange={(e) => setForm((f) => ({ ...f, contactHeroTitle: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={200}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="contactHeroLead">
            Intro paragraph
          </label>
          <textarea
            id="contactHeroLead"
            value={form.contactHeroLead}
            onChange={(e) => setForm((f) => ({ ...f, contactHeroLead: e.target.value }))}
            rows={4}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={2000}
            required
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6">
        <legend className="text-base font-semibold text-[var(--ink)]">Visit card</legend>
        <div>
          <label
            className="block text-sm font-semibold text-[var(--ink)]"
            htmlFor="contactVisitCardHeading"
          >
            Card title
          </label>
          <input
            id="contactVisitCardHeading"
            type="text"
            value={form.contactVisitCardHeading}
            onChange={(e) => setForm((f) => ({ ...f, contactVisitCardHeading: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={120}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="contactVisitAddress">
            Address (use line breaks)
          </label>
          <textarea
            id="contactVisitAddress"
            value={form.contactVisitAddress}
            onChange={(e) => setForm((f) => ({ ...f, contactVisitAddress: e.target.value }))}
            rows={5}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={1000}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="contactHoursLabel">
              Hours label
            </label>
            <input
              id="contactHoursLabel"
              type="text"
              value={form.contactHoursLabel}
              onChange={(e) => setForm((f) => ({ ...f, contactHoursLabel: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
              maxLength={80}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="contactHoursText">
              Hours text
            </label>
            <input
              id="contactHoursText"
              type="text"
              value={form.contactHoursText}
              onChange={(e) => setForm((f) => ({ ...f, contactHoursText: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
              maxLength={200}
              required
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6">
        <legend className="text-base font-semibold text-[var(--ink)]">Phone &amp; email card</legend>
        <div>
          <label
            className="block text-sm font-semibold text-[var(--ink)]"
            htmlFor="contactReachCardHeading"
          >
            Card title
          </label>
          <input
            id="contactReachCardHeading"
            type="text"
            value={form.contactReachCardHeading}
            onChange={(e) => setForm((f) => ({ ...f, contactReachCardHeading: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={120}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="contactPhone">
              Phone (display)
            </label>
            <input
              id="contactPhone"
              type="text"
              value={form.contactPhone}
              onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
              maxLength={80}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="contactPhoneHref">
              Phone link (tel:)
            </label>
            <input
              id="contactPhoneHref"
              type="text"
              value={form.contactPhoneHref}
              onChange={(e) => setForm((f) => ({ ...f, contactPhoneHref: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
              maxLength={120}
              required
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="contactEmail">
              Email (display)
            </label>
            <input
              id="contactEmail"
              type="text"
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
              maxLength={120}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="contactEmailHref">
              Email link (mailto:)
            </label>
            <input
              id="contactEmailHref"
              type="text"
              value={form.contactEmailHref}
              onChange={(e) => setForm((f) => ({ ...f, contactEmailHref: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
              maxLength={320}
              required
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6">
        <legend className="text-base font-semibold text-[var(--ink)]">Footer line (optional link)</legend>
        <p className="text-xs text-[var(--muted)]">
          To hide the link, clear both <strong>Link text</strong> and <strong>Link path</strong>. To show
          it, both must be filled; the path must start with <code className="rounded bg-black/[0.06] px-1">/</code>.
        </p>
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="contactFooterLead">
            Text before link
          </label>
          <input
            id="contactFooterLead"
            type="text"
            value={form.contactFooterLead}
            onChange={(e) => setForm((f) => ({ ...f, contactFooterLead: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={300}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="block text-sm font-semibold text-[var(--ink)]"
              htmlFor="contactFooterLinkText"
            >
              Link text
            </label>
            <input
              id="contactFooterLinkText"
              type="text"
              value={form.contactFooterLinkText}
              onChange={(e) => setForm((f) => ({ ...f, contactFooterLinkText: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
              maxLength={120}
            />
          </div>
          <div>
            <label
              className="block text-sm font-semibold text-[var(--ink)]"
              htmlFor="contactFooterLinkHref"
            >
              Link path
            </label>
            <input
              id="contactFooterLinkHref"
              type="text"
              value={form.contactFooterLinkHref}
              onChange={(e) => setForm((f) => ({ ...f, contactFooterLinkHref: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
              maxLength={500}
              placeholder="/about"
            />
          </div>
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[var(--accent-deep)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save contact page"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => setForm((f) => ({ ...f, ...contactDefaults() }))}
          className="rounded-full border border-[var(--border)] bg-white px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          Reset contact fields to defaults
        </button>
      </div>
    </form>
  );
}
