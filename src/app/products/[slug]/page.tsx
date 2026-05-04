import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductImageSlider } from "@/components/ProductImageSlider";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings-defaults";
import { formatRs } from "@/lib/format-currency";
import { getResolvedSiteSettings } from "@/lib/site-settings";
import { getProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Product" };
  }
  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  let sizeDisplayStyle = DEFAULT_SITE_SETTINGS.productSizeDisplayStyle;
  try {
    const site = await getResolvedSiteSettings();
    sizeDisplayStyle = site.productSizeDisplayStyle;
  } catch {
    /* use defaults */
  }

  /** Sizes are read from MongoDB on this product (`sizes`); order matches the document. */
  const sizesFromDb = Array.isArray(product.sizes) ? [...product.sizes] : [];
  const hasSizes = sizesFromDb.length > 0;
  const hasColors = product.colors.length > 0;
  const optionCardTitle = hasSizes
    ? "Select size"
    : hasColors
      ? "Select color"
      : "Add to cart";
  const optionCardSubtitle = hasSizes && hasColors
    ? "Choose a size from this product’s list below, then color and quantity."
    : hasSizes
      ? "Choose a size from this product’s list below, then quantity."
      : hasColors
        ? "Choose a color and quantity."
        : "Set quantity and add to cart.";

  return (
    <div className="w-full px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/products" className="font-semibold text-[var(--accent)] hover:underline">
          Products
        </Link>
        <span className="mx-2 opacity-60">/</span>
        <span className="text-[var(--ink)]">{product.name}</span>
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--border)] bg-zinc-100">
          <ProductImageSlider
            images={product.imageUrls}
            alt={product.name}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-full w-full"
            priority
            autoPlay={false}
            showArrows
            showDots
            enableLightbox
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[var(--ink)] backdrop-blur">
            {product.category}
          </span>
        </div>

        <div className="flex flex-col">
          <h1 className="font-display text-4xl font-semibold text-[var(--ink)] sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[var(--muted)]">
            {product.description}
          </p>

          <p className="mt-8 text-3xl font-semibold text-[var(--accent)]">
            {formatRs(product.price)}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {product.quantity <= 0
              ? "Out of stock"
              : `${product.quantity} in stock`}
          </p>

          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-[var(--paper)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              {optionCardTitle}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{optionCardSubtitle}</p>
            <AddToCartButton
              productId={product._id}
              disabled={!product.active || product.quantity <= 0}
              disabledLabel={!product.active ? "Unavailable" : "Out of stock"}
              sizes={sizesFromDb}
              colors={product.colors}
              sizeDisplayStyle={sizeDisplayStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
