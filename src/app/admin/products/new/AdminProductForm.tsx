"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/components/toast";
import {
  DEFAULT_SITE_SETTINGS,
  type ResolvedSiteSettings,
} from "@/lib/site-settings-defaults";

type Category = {
  _id: string;
  name: string;
  slug: string;
};

const COLOR_OPTIONS = [
  { label: "Black", value: "#111111" },
  { label: "White", value: "#ffffff" },
  { label: "Navy", value: "#1f2a44" },
  { label: "Gray", value: "#8b8f97" },
  { label: "Red", value: "#c62828" },
  { label: "Blue", value: "#1976d2" },
  { label: "Green", value: "#2e7d32" },
  { label: "Brown", value: "#6d4c41" },
] as const;

export function AdminProductForm() {
  const router = useRouter();
  const { success, error: toastError, info } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState("#000000");
  const [quantity, setQuantity] = useState("0");
  const [active, setActive] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [sizeCatalog, setSizeCatalog] = useState<string[]>(() => [
    ...DEFAULT_SITE_SETTINGS.productSizeCatalog,
  ]);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/site-settings")
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!alive || !ok) return;
        const s = d as ResolvedSiteSettings;
        if (Array.isArray(s.productSizeCatalog) && s.productSizeCatalog.length > 0) {
          setSizeCatalog([...s.productSizeCatalog]);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? (data as Category[]) : [];
        setCategories(list);
        if (list.length > 0) {
          setCategory(list[0].name);
        }
      })
      .catch(() => {
        // Keep silent here; submit will show errors if category is missing.
      });
  }, []);

  async function uploadImages(files: File[]) {
    if (files.length === 0) {
      info("Choose at least one image.");
      return;
    }
    setUploadBusy(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: form,
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          url?: string;
        };
        if (!res.ok || !data.url) {
          toastError(data.error ?? `Upload failed for ${file.name}`);
          return;
        }
        uploadedUrls.push(data.url);
      }
      setImageUrls((prev) => Array.from(new Set([...prev, ...uploadedUrls])));
      success(
        uploadedUrls.length === 1
          ? "Image uploaded"
          : `${uploadedUrls.length} images uploaded`,
      );
    } catch {
      toastError("Network error while uploading image.");
    } finally {
      setUploadBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const qtyParsed = Number(quantity);
      const qtySafe = Number.isFinite(qtyParsed)
        ? Math.max(0, Math.floor(qtyParsed))
        : 0;
      if (imageUrls.length === 0) {
        toastError("Please upload at least one image.");
        return;
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          category,
          sizes: [...sizes],
          colors: [...colors],
          quantity: qtySafe,
          active,
          imageUrl: imageUrls[0],
          imageUrls: [...imageUrls],
          featured,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toastError(data.error ?? "Could not save product");
        return;
      }
      success("Product created");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toastError("Network error");
    } finally {
      setBusy(false);
    }
  }

  function toggleSize(value: string) {
    setSizes((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    );
  }

  function toggleColor(value: string) {
    setColors((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
  }

  function addCustomColor() {
    const value = customColor.toLowerCase();
    setColors((prev) => (prev.includes(value) ? prev : [...prev, value]));
  }

  function removeUploadedImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent-deep)] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent-deep)] focus:ring-2"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="block text-sm font-medium">
            Price (Rs.)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent-deep)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent-deep)] focus:ring-2"
          >
            {categories.length === 0 ? (
              <option value="">No categories. Create one first.</option>
            ) : null}
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Need a new category? Go to <span className="font-semibold">Admin → Categories</span>.
          </p>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min="0"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent-deep)] focus:ring-2"
          />
        </div>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="block text-sm font-medium">Sizes</p>
          <Link
            href="/admin/settings/products"
            className="text-xs font-semibold text-[var(--accent-deep)] hover:underline"
          >
            Edit size list
          </Link>
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Check the sizes this product comes in. Add new labels under Settings → Products.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {sizeCatalog
            .filter((label) => label.trim().length > 0)
            .map((size) => (
              <label
                key={size}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-2 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={sizes.includes(size)}
                  onChange={() => toggleSize(size)}
                  className="h-4 w-4 rounded border-[var(--border)]"
                />
                {size}
              </label>
            ))}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-4">
        <p className="block text-sm font-medium">Colors</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {COLOR_OPTIONS.map((color) => (
            <label
              key={color.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-2 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={colors.includes(color.value)}
                onChange={() => toggleColor(color.value)}
                className="h-4 w-4 rounded border-[var(--border)]"
              />
              <span
                className="h-4 w-4 rounded-full border border-black/20"
                style={{ backgroundColor: color.value }}
              />
              {color.label}
            </label>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded border border-[var(--border)] bg-white p-1"
            aria-label="Pick custom color"
          />
          <button
            type="button"
            onClick={addCustomColor}
            className="rounded-full border border-[var(--accent-deep)] px-4 py-2 text-sm font-semibold text-[var(--accent-deep)] hover:bg-[var(--paper)]"
          >
            Add picked color
          </button>
        </div>

        {colors.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--paper)] px-3 py-1 text-xs text-[var(--ink)]"
                title="Click to remove"
              >
                <span
                  className="h-3 w-3 rounded-full border border-black/20"
                  style={{ backgroundColor: color }}
                />
                {color}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="sizes" className="block text-sm font-medium">
            Selected sizes
          </label>
          <input
            id="sizes"
            value={sizes.join(", ")}
            readOnly
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent-deep)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="colors" className="block text-sm font-medium">
            Selected colors
          </label>
          <input
            id="colors"
            value={colors.join(", ")}
            readOnly
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent-deep)] focus:ring-2"
          />
        </div>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--paper)] p-4">
        <label htmlFor="productImageFile" className="block text-sm font-medium">
          Product images (auto-upload)
        </label>
        <input
          id="productImageFile"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            void uploadImages(files);
            e.currentTarget.value = "";
          }}
          className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
        />
        <p className="mt-2 text-xs text-[var(--muted)]">
          Select one or more images. They upload automatically.
        </p>
        {uploadBusy ? (
          <p className="mt-2 text-xs font-medium text-[var(--accent-deep)]">
            Uploading...
          </p>
        ) : null}
        {imageUrls.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {imageUrls.map((url, idx) => (
              <div
                key={url}
                className="relative overflow-hidden rounded-lg border border-[var(--border)] bg-white"
              >
                <div className="relative h-24 w-full">
                  <Image
                    src={url}
                    alt={`Uploaded image ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 px-2 py-1">
                  <span className="truncate text-[10px] text-[var(--muted)]">
                    {idx === 0 ? "Cover image" : `Image ${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(url)}
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)]"
        />
        Featured on home page
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)]"
        />
        Active product
      </label>
      <button
        type="submit"
        disabled={busy || uploadBusy || categories.length === 0}
        className="w-full rounded-full bg-[var(--accent-deep)] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Saving…" : "Create product"}
      </button>
    </form>
  );
}
