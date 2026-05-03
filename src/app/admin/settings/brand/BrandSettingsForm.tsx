"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { brandImageUnoptimized } from "@/components/BrandAssetsProvider";
import { useToast } from "@/components/toast";
import {
  DEFAULT_SITE_SETTINGS,
  type ResolvedSiteSettings,
} from "@/lib/site-settings-defaults";

function brandDefaults(): Pick<
  ResolvedSiteSettings,
  | "brandLogoSrc"
  | "brandLogoAlt"
  | "brandFaviconSrc"
  | "brandSiteTitleDefault"
  | "brandSiteTitleTemplate"
> {
  return {
    brandLogoSrc: DEFAULT_SITE_SETTINGS.brandLogoSrc,
    brandLogoAlt: DEFAULT_SITE_SETTINGS.brandLogoAlt,
    brandFaviconSrc: DEFAULT_SITE_SETTINGS.brandFaviconSrc,
    brandSiteTitleDefault: DEFAULT_SITE_SETTINGS.brandSiteTitleDefault,
    brandSiteTitleTemplate: DEFAULT_SITE_SETTINGS.brandSiteTitleTemplate,
  };
}

export function BrandSettingsForm() {
  const { error, success, info } = useToast();
  const logoFileRef = useRef<HTMLInputElement>(null);
  const faviconFileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadLogoBusy, setUploadLogoBusy] = useState(false);
  const [uploadFaviconBusy, setUploadFaviconBusy] = useState(false);
  const [logoPreviewBroken, setLogoPreviewBroken] = useState(false);
  const [faviconPreviewBroken, setFaviconPreviewBroken] = useState(false);
  const [form, setForm] = useState<ResolvedSiteSettings>({
    ...DEFAULT_SITE_SETTINGS,
  });

  useEffect(() => {
    setLogoPreviewBroken(false);
  }, [form.brandLogoSrc]);

  useEffect(() => {
    setFaviconPreviewBroken(false);
  }, [form.brandFaviconSrc]);

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

  async function uploadLogo(file: File) {
    if (!file.type.startsWith("image/")) {
      error("Please choose an image file for the logo.");
      return;
    }
    setUploadLogoBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
      if (!res.ok || !data.url) {
        error(data.error ?? "Upload failed");
        return;
      }
      setForm((f) => ({ ...f, brandLogoSrc: data.url! }));
      success("Logo uploaded — click Save to publish.");
    } catch {
      error("Network error while uploading");
    } finally {
      setUploadLogoBusy(false);
      if (logoFileRef.current) logoFileRef.current.value = "";
    }
  }

  async function uploadFavicon(file: File) {
    const acceptImage = file.type.startsWith("image/");
    const acceptIco =
      file.name.toLowerCase().endsWith(".ico") &&
      (!file.type ||
        file.type === "application/octet-stream" ||
        file.type === "image/x-icon" ||
        file.type === "image/vnd.microsoft.icon");
    if (!acceptImage && !acceptIco) {
      error("Choose an image (PNG/WebP) or a .ico file for the favicon.");
      return;
    }
    setUploadFaviconBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
      if (!res.ok || !data.url) {
        error(data.error ?? "Upload failed");
        return;
      }
      setForm((f) => ({ ...f, brandFaviconSrc: data.url! }));
      success("Favicon uploaded — click Save to publish.");
    } catch {
      error("Network error while uploading");
    } finally {
      setUploadFaviconBusy(false);
      if (faviconFileRef.current) faviconFileRef.current.value = "";
    }
  }

  function resetBrandToDefaults() {
    setForm((f) => ({ ...f, ...brandDefaults() }));
    info("Brand fields reset to built-in defaults. Click Save to publish.");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/site-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandLogoSrc: form.brandLogoSrc,
        brandLogoAlt: form.brandLogoAlt,
        brandFaviconSrc: form.brandFaviconSrc,
        brandSiteTitleDefault: form.brandSiteTitleDefault,
        brandSiteTitleTemplate: form.brandSiteTitleTemplate,
      }),
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
    success("Brand settings saved");
  }

  if (loading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-zinc-100" aria-hidden />;
  }

  const logoUnopt = brandImageUnoptimized(form.brandLogoSrc);

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="max-w-2xl space-y-8">
      <input
        ref={logoFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadLogo(file);
        }}
      />
      <input
        ref={faviconFileRef}
        type="file"
        accept="image/*,.ico"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadFavicon(file);
        }}
      />

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-5">
        <h3 className="text-sm font-semibold text-[var(--ink)]">Browser tab title</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Shown in the tab for the home page. Inner pages combine their own title with the template
          below — the template must include a{" "}
          <span className="font-mono text-[11px]">%s</span> placeholder where the page name goes.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label
              className="block text-sm font-semibold text-[var(--ink)]"
              htmlFor="brandSiteTitleDefault"
            >
              Default tab title
            </label>
            <input
              id="brandSiteTitleDefault"
              type="text"
              maxLength={120}
              required
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
              value={form.brandSiteTitleDefault}
              onChange={(e) => setForm((f) => ({ ...f, brandSiteTitleDefault: e.target.value }))}
              placeholder={DEFAULT_SITE_SETTINGS.brandSiteTitleDefault}
            />
          </div>
          <div>
            <label
              className="block text-sm font-semibold text-[var(--ink)]"
              htmlFor="brandSiteTitleTemplate"
            >
              Inner pages template
            </label>
            <input
              id="brandSiteTitleTemplate"
              type="text"
              maxLength={120}
              required
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 font-mono text-sm text-[var(--ink)]"
              value={form.brandSiteTitleTemplate}
              onChange={(e) => setForm((f) => ({ ...f, brandSiteTitleTemplate: e.target.value }))}
              placeholder={DEFAULT_SITE_SETTINGS.brandSiteTitleTemplate}
            />
            <p className="mt-1 text-xs text-[var(--muted)]">
              Example: <span className="font-mono">%s | My store</span> → Products page becomes{" "}
              <span className="font-mono">Products | My store</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="brandLogoSrc">
          Logo image URL
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--paper)]">
            {!logoPreviewBroken ? (
              <Image
                src={form.brandLogoSrc}
                alt=""
                fill
                className="object-contain p-1"
                sizes="56px"
                unoptimized={logoUnopt}
                onError={() => setLogoPreviewBroken(true)}
              />
            ) : (
              <span className="flex h-full items-center justify-center text-[10px] text-[var(--muted)]">
                ?
              </span>
            )}
          </div>
          <input
            id="brandLogoSrc"
            type="url"
            inputMode="url"
            placeholder="https://… or /logo.png"
            className="min-w-[200px] flex-1 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
            value={form.brandLogoSrc}
            onChange={(e) => setForm((f) => ({ ...f, brandLogoSrc: e.target.value }))}
          />
        </div>
        <button
          type="button"
          disabled={uploadLogoBusy}
          onClick={() => logoFileRef.current?.click()}
          className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--paper)] disabled:opacity-50"
        >
          {uploadLogoBusy ? "Uploading…" : "Upload logo"}
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="brandLogoAlt">
          Logo accessible name
        </label>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          Used as the logo image alt text when set; otherwise the storefront translation is used.
        </p>
        <input
          id="brandLogoAlt"
          type="text"
          maxLength={200}
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
          value={form.brandLogoAlt}
          onChange={(e) => setForm((f) => ({ ...f, brandLogoAlt: e.target.value }))}
          placeholder={DEFAULT_SITE_SETTINGS.brandLogoAlt}
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="brandFaviconSrc">
          Favicon URL
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-[var(--border)] bg-white">
            {!faviconPreviewBroken ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview may be .ico from any host
              <img
                src={form.brandFaviconSrc}
                alt=""
                className="h-full w-full object-contain p-0.5"
                onError={() => setFaviconPreviewBroken(true)}
              />
            ) : (
              <span className="flex h-full items-center justify-center text-[10px] text-[var(--muted)]">
                ?
              </span>
            )}
          </div>
          <input
            id="brandFaviconSrc"
            type="url"
            inputMode="url"
            placeholder="https://… or /icon.ico"
            className="min-w-[200px] flex-1 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
            value={form.brandFaviconSrc}
            onChange={(e) => setForm((f) => ({ ...f, brandFaviconSrc: e.target.value }))}
          />
        </div>
        <button
          type="button"
          disabled={uploadFaviconBusy}
          onClick={() => faviconFileRef.current?.click()}
          className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--paper)] disabled:opacity-50"
        >
          {uploadFaviconBusy ? "Uploading…" : "Upload favicon"}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[var(--accent-deep)] px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save brand"}
        </button>
        <button
          type="button"
          onClick={resetBrandToDefaults}
          className="rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--paper)]"
        >
          Reset to defaults
        </button>
      </div>
    </form>
  );
}
