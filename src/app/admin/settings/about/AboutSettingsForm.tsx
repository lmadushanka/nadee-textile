"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/toast";
import {
  ABOUT_VALUES_CONSTRAINTS,
  DEFAULT_SITE_SETTINGS,
  type AboutValueBlock,
  type ResolvedSiteSettings,
} from "@/lib/site-settings-defaults";

function aboutDefaults(): Pick<
  ResolvedSiteSettings,
  | "aboutSeoTitle"
  | "aboutSeoDescription"
  | "aboutEyebrow"
  | "aboutHeroTitle"
  | "aboutHeroLead"
  | "aboutStoryImageSrc"
  | "aboutStoryImageAlt"
  | "aboutStoryHeading"
  | "aboutStoryParagraph1"
  | "aboutStoryParagraph2"
  | "aboutValuesHeading"
  | "aboutValues"
  | "aboutContactEyebrow"
  | "aboutContactHeading"
  | "aboutContactBusinessName"
  | "aboutContactAddress"
  | "aboutContactPhoneLabel"
  | "aboutContactPhone"
  | "aboutContactPhoneHref"
  | "aboutMapEmbedUrl"
  | "aboutCtaHeading"
  | "aboutCtaBody"
  | "aboutCtaLabel"
  | "aboutCtaHref"
> {
  return {
    aboutSeoTitle: DEFAULT_SITE_SETTINGS.aboutSeoTitle,
    aboutSeoDescription: DEFAULT_SITE_SETTINGS.aboutSeoDescription,
    aboutEyebrow: DEFAULT_SITE_SETTINGS.aboutEyebrow,
    aboutHeroTitle: DEFAULT_SITE_SETTINGS.aboutHeroTitle,
    aboutHeroLead: DEFAULT_SITE_SETTINGS.aboutHeroLead,
    aboutStoryImageSrc: DEFAULT_SITE_SETTINGS.aboutStoryImageSrc,
    aboutStoryImageAlt: DEFAULT_SITE_SETTINGS.aboutStoryImageAlt,
    aboutStoryHeading: DEFAULT_SITE_SETTINGS.aboutStoryHeading,
    aboutStoryParagraph1: DEFAULT_SITE_SETTINGS.aboutStoryParagraph1,
    aboutStoryParagraph2: DEFAULT_SITE_SETTINGS.aboutStoryParagraph2,
    aboutValuesHeading: DEFAULT_SITE_SETTINGS.aboutValuesHeading,
    aboutValues: DEFAULT_SITE_SETTINGS.aboutValues.map((v) => ({ ...v })),
    aboutContactEyebrow: DEFAULT_SITE_SETTINGS.aboutContactEyebrow,
    aboutContactHeading: DEFAULT_SITE_SETTINGS.aboutContactHeading,
    aboutContactBusinessName: DEFAULT_SITE_SETTINGS.aboutContactBusinessName,
    aboutContactAddress: DEFAULT_SITE_SETTINGS.aboutContactAddress,
    aboutContactPhoneLabel: DEFAULT_SITE_SETTINGS.aboutContactPhoneLabel,
    aboutContactPhone: DEFAULT_SITE_SETTINGS.aboutContactPhone,
    aboutContactPhoneHref: DEFAULT_SITE_SETTINGS.aboutContactPhoneHref,
    aboutMapEmbedUrl: DEFAULT_SITE_SETTINGS.aboutMapEmbedUrl,
    aboutCtaHeading: DEFAULT_SITE_SETTINGS.aboutCtaHeading,
    aboutCtaBody: DEFAULT_SITE_SETTINGS.aboutCtaBody,
    aboutCtaLabel: DEFAULT_SITE_SETTINGS.aboutCtaLabel,
    aboutCtaHref: DEFAULT_SITE_SETTINGS.aboutCtaHref,
  };
}

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor={htmlFor}>
        {children}
      </label>
      {hint ? <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

export function AboutSettingsForm() {
  const { error, success, info } = useToast();
  const storyFileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
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

  async function uploadStoryImage(file: File) {
    if (!file.type.startsWith("image/")) {
      error("Please choose an image file.");
      return;
    }
    setUploadBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
      if (!res.ok || !data.url) {
        error(data.error ?? "Upload failed");
        return;
      }
      setForm((f) => ({ ...f, aboutStoryImageSrc: data.url! }));
      success("Story image uploaded — click Save about page to publish.");
    } catch {
      error("Network error while uploading");
    } finally {
      setUploadBusy(false);
      if (storyFileRef.current) storyFileRef.current.value = "";
    }
  }

  function resetStoryImage() {
    setForm((f) => ({
      ...f,
      aboutStoryImageSrc: DEFAULT_SITE_SETTINGS.aboutStoryImageSrc,
      aboutStoryImageAlt: DEFAULT_SITE_SETTINGS.aboutStoryImageAlt,
    }));
    info("Story image reset to defaults. Save to publish.");
  }

  function updateValue(index: number, patch: Partial<AboutValueBlock>) {
    setForm((f) => ({
      ...f,
      aboutValues: f.aboutValues.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  }

  function addValueBlock() {
    if (form.aboutValues.length >= ABOUT_VALUES_CONSTRAINTS.max) {
      error(`At most ${ABOUT_VALUES_CONSTRAINTS.max} value blocks.`);
      return;
    }
    setForm((f) => ({
      ...f,
      aboutValues: [...f.aboutValues, { title: "New pillar", body: "Describe what you stand for." }],
    }));
  }

  function removeValueBlock(index: number) {
    if (form.aboutValues.length <= ABOUT_VALUES_CONSTRAINTS.min) {
      error(`Keep at least ${ABOUT_VALUES_CONSTRAINTS.min} value block.`);
      return;
    }
    setForm((f) => ({
      ...f,
      aboutValues: f.aboutValues.filter((_, i) => i !== index),
    }));
  }

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
    success("About page settings saved");
  }

  if (loading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-zinc-100" aria-hidden />;
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="max-w-3xl space-y-10">
      <fieldset className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6">
        <legend className="text-base font-semibold text-[var(--ink)]">SEO</legend>
        <div>
          <FieldLabel htmlFor="aboutSeoTitle">Browser title</FieldLabel>
          <input
            id="aboutSeoTitle"
            type="text"
            value={form.aboutSeoTitle}
            onChange={(e) => setForm((f) => ({ ...f, aboutSeoTitle: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={120}
            required
          />
        </div>
        <div>
          <FieldLabel htmlFor="aboutSeoDescription">Meta description</FieldLabel>
          <textarea
            id="aboutSeoDescription"
            value={form.aboutSeoDescription}
            onChange={(e) => setForm((f) => ({ ...f, aboutSeoDescription: e.target.value }))}
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={320}
            required
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6">
        <legend className="text-base font-semibold text-[var(--ink)]">Hero</legend>
        <div>
          <FieldLabel
            htmlFor="aboutEyebrow"
            hint="Optional. Leave empty to hide the small line above the title."
          >
            Eyebrow
          </FieldLabel>
          <input
            id="aboutEyebrow"
            type="text"
            value={form.aboutEyebrow}
            onChange={(e) => setForm((f) => ({ ...f, aboutEyebrow: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={120}
          />
        </div>
        <div>
          <FieldLabel htmlFor="aboutHeroTitle">Main title</FieldLabel>
          <textarea
            id="aboutHeroTitle"
            value={form.aboutHeroTitle}
            onChange={(e) => setForm((f) => ({ ...f, aboutHeroTitle: e.target.value }))}
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={500}
            required
          />
        </div>
        <div>
          <FieldLabel htmlFor="aboutHeroLead">Lead paragraph</FieldLabel>
          <textarea
            id="aboutHeroLead"
            value={form.aboutHeroLead}
            onChange={(e) => setForm((f) => ({ ...f, aboutHeroLead: e.target.value }))}
            rows={4}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={2000}
            required
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6">
        <legend className="text-base font-semibold text-[var(--ink)]">Story + image</legend>
        <input
          ref={storyFileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Upload about story image"
          disabled={uploadBusy || saving}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadStoryImage(file);
          }}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={uploadBusy || saving}
            onClick={() => storyFileRef.current?.click()}
            className="rounded-full bg-[var(--accent-deep)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {uploadBusy ? "Uploading…" : "Upload story image"}
          </button>
          <button
            type="button"
            disabled={saving || uploadBusy}
            onClick={() => resetStoryImage()}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold disabled:opacity-60"
          >
            Reset image to default
          </button>
        </div>
        <div>
          <FieldLabel htmlFor="aboutStoryImageSrc" hint="Or paste a URL (/public path or https).">
            Story image URL
          </FieldLabel>
          <input
            id="aboutStoryImageSrc"
            type="text"
            value={form.aboutStoryImageSrc}
            onChange={(e) => setForm((f) => ({ ...f, aboutStoryImageSrc: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={2000}
            required
          />
        </div>
        <div>
          <FieldLabel htmlFor="aboutStoryImageAlt">Story image alt text</FieldLabel>
          <input
            id="aboutStoryImageAlt"
            type="text"
            value={form.aboutStoryImageAlt}
            onChange={(e) => setForm((f) => ({ ...f, aboutStoryImageAlt: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={500}
            required
          />
        </div>
        <div>
          <FieldLabel htmlFor="aboutStoryHeading">Story section heading</FieldLabel>
          <input
            id="aboutStoryHeading"
            type="text"
            value={form.aboutStoryHeading}
            onChange={(e) => setForm((f) => ({ ...f, aboutStoryHeading: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={200}
            required
          />
        </div>
        <div>
          <FieldLabel htmlFor="aboutStoryParagraph1">Story — first paragraph</FieldLabel>
          <textarea
            id="aboutStoryParagraph1"
            value={form.aboutStoryParagraph1}
            onChange={(e) => setForm((f) => ({ ...f, aboutStoryParagraph1: e.target.value }))}
            rows={4}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={4000}
            required
          />
        </div>
        <div>
          <FieldLabel
            htmlFor="aboutStoryParagraph2"
            hint="Optional second paragraph (leave blank to hide)."
          >
            Story — second paragraph
          </FieldLabel>
          <textarea
            id="aboutStoryParagraph2"
            value={form.aboutStoryParagraph2}
            onChange={(e) => setForm((f) => ({ ...f, aboutStoryParagraph2: e.target.value }))}
            rows={4}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={4000}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6">
        <legend className="text-base font-semibold text-[var(--ink)]">
          What we stand for ({ABOUT_VALUES_CONSTRAINTS.min}–{ABOUT_VALUES_CONSTRAINTS.max} blocks)
        </legend>
        <div>
          <FieldLabel htmlFor="aboutValuesHeading">Section heading</FieldLabel>
          <input
            id="aboutValuesHeading"
            type="text"
            value={form.aboutValuesHeading}
            onChange={(e) => setForm((f) => ({ ...f, aboutValuesHeading: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={200}
            required
          />
        </div>
        <ul className="space-y-4">
          {form.aboutValues.map((block, index) => (
            <li
              key={`ab-${index}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--paper)]/30 p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[var(--muted)]">Block {index + 1}</span>
                <button
                  type="button"
                  disabled={saving || form.aboutValues.length <= ABOUT_VALUES_CONSTRAINTS.min}
                  onClick={() => removeValueBlock(index)}
                  className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={block.title}
                onChange={(e) => updateValue(index, { title: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                maxLength={200}
                placeholder="Title"
                aria-label={`Value block ${index + 1} title`}
              />
              <textarea
                value={block.body}
                onChange={(e) => updateValue(index, { body: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                maxLength={2000}
                placeholder="Body"
                aria-label={`Value block ${index + 1} body`}
              />
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled={saving || form.aboutValues.length >= ABOUT_VALUES_CONSTRAINTS.max}
          onClick={() => addValueBlock()}
          className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold disabled:opacity-60"
        >
          Add value block
        </button>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6">
        <legend className="text-base font-semibold text-[var(--ink)]">Location &amp; map</legend>
        <div>
          <FieldLabel
            htmlFor="aboutContactEyebrow"
            hint="Optional line above the contact heading (leave empty to hide)."
          >
            Contact eyebrow
          </FieldLabel>
          <input
            id="aboutContactEyebrow"
            type="text"
            value={form.aboutContactEyebrow}
            onChange={(e) => setForm((f) => ({ ...f, aboutContactEyebrow: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={120}
          />
        </div>
        <div>
          <FieldLabel htmlFor="aboutContactHeading">Contact section title</FieldLabel>
          <input
            id="aboutContactHeading"
            type="text"
            value={form.aboutContactHeading}
            onChange={(e) => setForm((f) => ({ ...f, aboutContactHeading: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={200}
            required
          />
        </div>
        <div>
          <FieldLabel htmlFor="aboutContactBusinessName">Business name</FieldLabel>
          <input
            id="aboutContactBusinessName"
            type="text"
            value={form.aboutContactBusinessName}
            onChange={(e) => setForm((f) => ({ ...f, aboutContactBusinessName: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={200}
            required
          />
        </div>
        <div>
          <FieldLabel htmlFor="aboutContactAddress" hint="Use line breaks for separate address lines.">
            Address
          </FieldLabel>
          <textarea
            id="aboutContactAddress"
            value={form.aboutContactAddress}
            onChange={(e) => setForm((f) => ({ ...f, aboutContactAddress: e.target.value }))}
            rows={4}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={1000}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="aboutContactPhoneLabel">Phone label</FieldLabel>
            <input
              id="aboutContactPhoneLabel"
              type="text"
              value={form.aboutContactPhoneLabel}
              onChange={(e) => setForm((f) => ({ ...f, aboutContactPhoneLabel: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
              maxLength={80}
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="aboutContactPhone">Phone (display)</FieldLabel>
            <input
              id="aboutContactPhone"
              type="text"
              value={form.aboutContactPhone}
              onChange={(e) => setForm((f) => ({ ...f, aboutContactPhone: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
              maxLength={80}
              required
            />
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="aboutContactPhoneHref" hint='Must start with tel: (e.g. tel:+94741980433).'>
            Phone link (tel:)
          </FieldLabel>
          <input
            id="aboutContactPhoneHref"
            type="text"
            value={form.aboutContactPhoneHref}
            onChange={(e) => setForm((f) => ({ ...f, aboutContactPhoneHref: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={120}
            required
          />
        </div>
        <div>
          <FieldLabel
            htmlFor="aboutMapEmbedUrl"
            hint="Paste the full iframe src from Google Maps (must be https, no spaces)."
          >
            Map embed URL
          </FieldLabel>
          <textarea
            id="aboutMapEmbedUrl"
            value={form.aboutMapEmbedUrl}
            onChange={(e) => setForm((f) => ({ ...f, aboutMapEmbedUrl: e.target.value }))}
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] px-4 py-2.5 font-mono text-xs"
            maxLength={2000}
            required
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6">
        <legend className="text-base font-semibold text-[var(--ink)]">Bottom call-to-action</legend>
        <div>
          <FieldLabel htmlFor="aboutCtaHeading">Heading</FieldLabel>
          <input
            id="aboutCtaHeading"
            type="text"
            value={form.aboutCtaHeading}
            onChange={(e) => setForm((f) => ({ ...f, aboutCtaHeading: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={200}
            required
          />
        </div>
        <div>
          <FieldLabel htmlFor="aboutCtaBody">Supporting text</FieldLabel>
          <textarea
            id="aboutCtaBody"
            value={form.aboutCtaBody}
            onChange={(e) => setForm((f) => ({ ...f, aboutCtaBody: e.target.value }))}
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            maxLength={2000}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="aboutCtaLabel">Button label</FieldLabel>
            <input
              id="aboutCtaLabel"
              type="text"
              value={form.aboutCtaLabel}
              onChange={(e) => setForm((f) => ({ ...f, aboutCtaLabel: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
              maxLength={120}
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="aboutCtaHref" hint="Internal path, e.g. /products">
              Button link
            </FieldLabel>
            <input
              id="aboutCtaHref"
              type="text"
              value={form.aboutCtaHref}
              onChange={(e) => setForm((f) => ({ ...f, aboutCtaHref: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
              maxLength={500}
              required
            />
          </div>
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving || uploadBusy}
          className="rounded-full bg-[var(--accent-deep)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save about page"}
        </button>
        <button
          type="button"
          disabled={saving || uploadBusy}
          onClick={() => setForm((f) => ({ ...f, ...aboutDefaults() }))}
          className="rounded-full border border-[var(--border)] bg-white px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          Reset about fields to defaults
        </button>
      </div>
    </form>
  );
}
