"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/toast";
import {
  DEFAULT_SITE_SETTINGS,
  HERO_SLIDES_CONSTRAINTS,
  type HeroSlide,
  type ResolvedSiteSettings,
} from "@/lib/site-settings-defaults";

function heroDefaults(): Pick<
  ResolvedSiteSettings,
  | "heroEyebrow"
  | "heroTitlePrimary"
  | "heroTitleAccent"
  | "heroSubtitle"
  | "heroSlides"
> {
  return {
    heroEyebrow: DEFAULT_SITE_SETTINGS.heroEyebrow,
    heroTitlePrimary: DEFAULT_SITE_SETTINGS.heroTitlePrimary,
    heroTitleAccent: DEFAULT_SITE_SETTINGS.heroTitleAccent,
    heroSubtitle: DEFAULT_SITE_SETTINGS.heroSubtitle,
    heroSlides: DEFAULT_SITE_SETTINGS.heroSlides.map((s) => ({ ...s })),
  };
}

function defaultSlidesOnly(): HeroSlide[] {
  return DEFAULT_SITE_SETTINGS.heroSlides.map((s) => ({ ...s }));
}

export function HeroSettingsForm() {
  const { error, success, info } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSlideIndex, setUploadSlideIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
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

  function openUploadForSlide(index: number) {
    setUploadSlideIndex(index);
    fileInputRef.current?.click();
  }

  async function onFileSelected(file: File) {
    if (uploadSlideIndex === null) return;
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
      const i = uploadSlideIndex;
      setForm((f) => {
        const next = f.heroSlides.map((s, idx) =>
          idx === i ? { ...s, src: data.url! } : s,
        );
        return { ...f, heroSlides: next };
      });
      success("Slide image uploaded — click Save hero to publish.");
    } catch {
      error("Network error while uploading");
    } finally {
      setUploadBusy(false);
      setUploadSlideIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function updateSlide(index: number, patch: Partial<HeroSlide>) {
    setForm((f) => ({
      ...f,
      heroSlides: f.heroSlides.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  }

  function addSlide() {
    if (form.heroSlides.length >= HERO_SLIDES_CONSTRAINTS.max) {
      error(`You can have at most ${HERO_SLIDES_CONSTRAINTS.max} slides.`);
      return;
    }
    setForm((f) => {
      const blocks = DEFAULT_SITE_SETTINGS.heroSlides;
      const template = blocks[f.heroSlides.length % blocks.length];
      return {
        ...f,
        heroSlides: [...f.heroSlides, { src: template.src, alt: template.alt }],
      };
    });
  }

  function removeSlide(index: number) {
    if (form.heroSlides.length <= HERO_SLIDES_CONSTRAINTS.min) {
      error("Keep at least one background slide.");
      return;
    }
    setForm((f) => ({
      ...f,
      heroSlides: f.heroSlides.filter((_, i) => i !== index),
    }));
  }

  function resetSlidesOnly() {
    setForm((f) => ({ ...f, heroSlides: defaultSlidesOnly() }));
    info("Hero backgrounds reset to defaults. Click Save hero to publish.");
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
    success("Hero settings saved");
  }

  if (loading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-zinc-100" aria-hidden />;
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="max-w-3xl space-y-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Upload hero slide background"
        disabled={uploadBusy || saving}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFileSelected(f);
        }}
      />

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[var(--ink)]">Headlines</h3>
        <div>
          <label className="block text-xs font-semibold text-[var(--muted)]" htmlFor="heroEyebrow">
            Eyebrow (small line above title)
          </label>
          <input
            id="heroEyebrow"
            type="text"
            value={form.heroEyebrow}
            onChange={(e) => setForm((f) => ({ ...f, heroEyebrow: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
            maxLength={200}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="block text-xs font-semibold text-[var(--muted)]"
              htmlFor="heroTitlePrimary"
            >
              Title line 1
            </label>
            <input
              id="heroTitlePrimary"
              type="text"
              value={form.heroTitlePrimary}
              onChange={(e) => setForm((f) => ({ ...f, heroTitlePrimary: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
              maxLength={400}
              required
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold text-[var(--muted)]"
              htmlFor="heroTitleAccent"
            >
              Title line 2 (accent)
            </label>
            <input
              id="heroTitleAccent"
              type="text"
              value={form.heroTitleAccent}
              onChange={(e) => setForm((f) => ({ ...f, heroTitleAccent: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
              maxLength={400}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--muted)]" htmlFor="heroSubtitle">
            Intro paragraph
          </label>
          <textarea
            id="heroSubtitle"
            value={form.heroSubtitle}
            onChange={(e) => setForm((f) => ({ ...f, heroSubtitle: e.target.value }))}
            rows={4}
            className="mt-1 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
            maxLength={8000}
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--ink)]">Background slides</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {HERO_SLIDES_CONSTRAINTS.min}–{HERO_SLIDES_CONSTRAINTS.max} images; the home hero
              rotates through them. Each needs a URL (or upload) and alt text.
            </p>
          </div>
          <button
            type="button"
            disabled={saving || uploadBusy}
            onClick={() => addSlide()}
            className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--paper)] disabled:opacity-60"
          >
            Add slide
          </button>
        </div>

        <ul className="space-y-4">
          {form.heroSlides.map((slide, index) => (
            <li
              key={`slide-${index}`}
              className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap gap-4">
                <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={uploadBusy || saving}
                      onClick={() => openUploadForSlide(index)}
                      className="rounded-full bg-[var(--accent-deep)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                    >
                      {uploadBusy ? "Uploading…" : "Upload image"}
                    </button>
                    <button
                      type="button"
                      disabled={saving || uploadBusy || form.heroSlides.length <= HERO_SLIDES_CONSTRAINTS.min}
                      onClick={() => removeSlide(index)}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-100 disabled:opacity-40"
                    >
                      Remove slide
                    </button>
                  </div>
                  <input
                    type="text"
                    value={slide.src}
                    onChange={(e) => updateSlide(index, { src: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--ink)]"
                    placeholder="Image URL"
                    aria-label={`Slide ${index + 1} image URL`}
                  />
                  <input
                    type="text"
                    value={slide.alt}
                    onChange={(e) => updateSlide(index, { alt: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--ink)]"
                    placeholder="Alt text"
                    maxLength={500}
                    aria-label={`Slide ${index + 1} alt text`}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={saving || uploadBusy}
          onClick={() => resetSlidesOnly()}
          className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--paper)] disabled:opacity-60"
        >
          Reset backgrounds to default set
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving || uploadBusy}
          className="rounded-full bg-[var(--accent-deep)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save hero"}
        </button>
        <button
          type="button"
          disabled={saving || uploadBusy}
          onClick={() => setForm((f) => ({ ...f, ...heroDefaults() }))}
          className="rounded-full border border-[var(--border)] bg-white px-6 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper)] disabled:opacity-60"
        >
          Reset all hero fields to defaults
        </button>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Saving updates the hero on the home page. Fabric section is edited separately under{" "}
        <strong>Fabric</strong>.
      </p>
    </form>
  );
}
