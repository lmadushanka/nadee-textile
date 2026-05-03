import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getCategories } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import {
  DEFAULT_SITE_SETTINGS,
  formatProductsCategoryTitle,
} from "@/lib/site-settings-defaults";
import { getResolvedSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ category?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  let site = { ...DEFAULT_SITE_SETTINGS };
  try {
    site = await getResolvedSiteSettings();
  } catch {
    site = { ...DEFAULT_SITE_SETTINGS };
  }
  const sp = await searchParams;
  const categorySlug = (sp.category ?? "").trim().toLowerCase();
  let title = site.productsSeoTitle;
  if (categorySlug) {
    try {
      const categories = await getCategories();
      const cat = categories.find((c) => c.slug.toLowerCase() === categorySlug);
      if (cat) {
        title = `${formatProductsCategoryTitle(site.productsCategoryTitleTemplate, cat.name)} · ${site.productsSeoTitle}`;
      }
    } catch {
      /* keep default title */
    }
  }
  return {
    title,
    description: site.productsSeoDescription,
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const categorySlug = (sp.category ?? "").trim().toLowerCase();

  let site = { ...DEFAULT_SITE_SETTINGS };
  try {
    site = await getResolvedSiteSettings();
  } catch {
    site = { ...DEFAULT_SITE_SETTINGS };
  }

  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }
  const selectedCategory = categories.find(
    (c) => c.slug.toLowerCase() === categorySlug,
  );

  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let loadError = false;
  try {
    products = await getProducts({
      category: selectedCategory?.name,
    });
  } catch {
    loadError = true;
    products = [];
  }

  const heading = selectedCategory
    ? formatProductsCategoryTitle(
        site.productsCategoryTitleTemplate,
        selectedCategory.name,
      )
    : site.productsTitleAll;

  return (
    <div className="w-full px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="max-w-2xl">
        {site.productsEyebrow.trim() ? (
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            {site.productsEyebrow}
          </p>
        ) : null}
        <h1
          className={`font-display text-4xl font-semibold text-[var(--ink)] sm:text-5xl ${
            site.productsEyebrow.trim() ? "mt-3" : ""
          }`}
        >
          {heading}
        </h1>
        <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-[var(--muted)]">
          {site.productsIntro}
        </p>
      </header>

      {categories.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/products"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              !selectedCategory
                ? "border-[var(--accent-deep)] bg-[var(--accent-deep)] text-white"
                : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--accent-deep)]/25 hover:text-[var(--accent-deep)]"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c._id}
              href={`/products?category=${encodeURIComponent(c.slug)}`}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedCategory?._id === c._id
                  ? "border-[var(--accent-deep)] bg-[var(--accent-deep)] text-white"
                  : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--accent-deep)]/25 hover:text-[var(--accent-deep)]"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      ) : null}

      {loadError ? (
        <div className="mt-14 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-950">
          <p className="font-medium">Could not connect to the database.</p>
          <p className="mt-2 text-sm leading-relaxed opacity-90">
            Check that{" "}
            <code className="rounded bg-black/10 px-1.5 py-0.5 text-xs">
              MONGODB_URI
            </code>{" "}
            is set in{" "}
            <code className="rounded bg-black/10 px-1.5 py-0.5 text-xs">
              .env.local
            </code>{" "}
            and that your Atlas cluster allows your IP address.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-dashed border-[var(--border)] bg-white p-12 text-center">
          <p className="font-medium text-[var(--ink)]">
            {selectedCategory
              ? `No products in ${selectedCategory.name}`
              : "No products in the database"}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {selectedCategory
              ? "Try another category or add products to this category in Admin."
              : "From the project root, run "}
            {!selectedCategory ? (
              <>
                <code className="rounded bg-black/[0.06] px-1.5 py-0.5 text-xs">
                  npm run seed
                </code>{" "}
                to insert sample clothes, then reload this page.
              </>
            ) : null}
          </p>
        </div>
      ) : (
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p._id} product={p} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
