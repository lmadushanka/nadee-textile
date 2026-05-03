"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/toast";
import {
  DEFAULT_SITE_SETTINGS,
  type ResolvedSiteSettings,
} from "@/lib/site-settings-defaults";

function fabricDefaults(): Pick<
  ResolvedSiteSettings,
  "fabricImageSrc" | "fabricImageAlt" | "fabricTitle" | "fabricSubtitle"
> {
  return {
    fabricImageSrc: DEFAULT_SITE_SETTINGS.fabricImageSrc,
    fabricImageAlt: DEFAULT_SITE_SETTINGS.fabricImageAlt,
    fabricTitle: DEFAULT_SITE_SETTINGS.fabricTitle,
    fabricSubtitle: DEFAULT_SITE_SETTINGS.fabricSubtitle,
  };
}

export function FabricSettingsForm() {
  const { error, success, info } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [fabricPreviewBroken, setFabricPreviewBroken] = useState(false);
  const [form, setForm] = useState<ResolvedSiteSettings>({
    ...DEFAULT_SITE_SETTINGS,
  });

  useEffect(() => {
    setFabricPreviewBroken(false);
  }, [form.fabricImageSrc]);

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

  async function uploadFabricImage(file: File) {
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
      setForm((f) => ({ ...f, fabricImageSrc: data.url! }));
      success("Image uploaded — URL filled in. Click Save to publish.");
    } catch {
      error("Network error while uploading");
    } finally {
      setUploadBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function resetFabricImageToDefault() {
    setForm((f) => ({
      ...f,
      fabricImageSrc: DEFAULT_SITE_SETTINGS.fabricImageSrc,
      fabricImageAlt: DEFAULT_SITE_SETTINGS.fabricImageAlt,
    }));
    info("Fabric image URL and alt reset to defaults. Click Save to publish.");
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
    success("Fabric settings saved");
  }

  if (loading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-zinc-100" aria-hidden />;
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="fabricImageSrc">
          Section image
        </label>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Upload to your GCS bucket (same as product images), paste a URL, or use{" "}
          <code className="rounded bg-black/[0.06] px-1">/img1.jpeg</code> for a file in{" "}
          <code className="rounded bg-black/[0.06] px-1">public</code>.
        </p>

        <div className="mt-3 flex flex-wrap items-start gap-4">
          <div className="relative flex h-36 w-56 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-zinc-100">
            {fabricPreviewBroken ? (
              <span className="px-2 text-center text-xs text-[var(--muted)]">Preview unavailable</span>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview; arbitrary URLs */}
                <img
                  src={form.fabricImageSrc}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => setFabricPreviewBroken(true)}
                />
              </>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Upload fabric section image"
              disabled={uploadBusy || saving}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadFabricImage(f);
              }}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={uploadBusy || saving}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-[var(--accent-deep)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {uploadBusy ? "Uploading…" : "Upload image"}
              </button>
              <button
                type="button"
                disabled={saving || uploadBusy}
                onClick={() => resetFabricImageToDefault()}
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--paper)] disabled:opacity-60"
              >
                Reset image to default
              </button>
            </div>
            <input
              id="fabricImageSrc"
              type="text"
              value={form.fabricImageSrc}
              onChange={(e) => setForm((f) => ({ ...f, fabricImageSrc: e.target.value }))}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="fabricImageAlt">
          Image alt text (accessibility)
        </label>
        <input
          id="fabricImageAlt"
          type="text"
          value={form.fabricImageAlt}
          onChange={(e) => setForm((f) => ({ ...f, fabricImageAlt: e.target.value }))}
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
          maxLength={500}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="fabricTitle">
          Main title
        </label>
        <input
          id="fabricTitle"
          type="text"
          value={form.fabricTitle}
          onChange={(e) => setForm((f) => ({ ...f, fabricTitle: e.target.value }))}
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
          maxLength={400}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="fabricSubtitle">
          Subtitle / body
        </label>
        <textarea
          id="fabricSubtitle"
          value={form.fabricSubtitle}
          onChange={(e) => setForm((f) => ({ ...f, fabricSubtitle: e.target.value }))}
          rows={5}
          className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--accent-deep)]/20 focus:ring-2"
          maxLength={8000}
          required
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving || uploadBusy}
          className="rounded-full bg-[var(--accent-deep)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save fabric section"}
        </button>
        <button
          type="button"
          disabled={saving || uploadBusy}
          onClick={() => setForm((f) => ({ ...f, ...fabricDefaults() }))}
          className="rounded-full border border-[var(--border)] bg-white px-6 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper)] disabled:opacity-60"
        >
          Reset fabric fields to defaults
        </button>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Changes apply on the home page after you save. Hero content is unchanged — edit it under{" "}
        <strong>Hero</strong>.
      </p>
    </form>
  );
}
