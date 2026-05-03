import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import type { FeaturedPiecesSectionSettings } from "@/lib/site-settings-defaults";
import type { ProductJSON } from "@/lib/products";

type Props = { products: ProductJSON[] } & FeaturedPiecesSectionSettings;

export function FeaturedPieces({
  products,
  featuredEyebrow,
  featuredTitleLead,
  featuredTitleAccent,
  featuredSubtitle,
  featuredCtaLabel,
  featuredCtaHref,
  featuredEmptyTitle,
  featuredEmptyBody,
}: Props) {
  const n = products.length;

  return (
    <section className="relative isolate overflow-hidden border-y border-[var(--border)] py-16 sm:py-20 lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(184,92,56,0.12),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(30,58,95,0.08),transparent_50%),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(184,92,56,0.06),transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden
      />

      <div className="relative w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
              <span
                className="h-px w-8 bg-gradient-to-r from-[var(--accent)] to-transparent"
                aria-hidden
              />
              {featuredEyebrow}
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--ink)] sm:text-5xl lg:text-[3.25rem]">
              {featuredTitleLead}{" "}
              <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-deep)] bg-clip-text text-transparent">
                {featuredTitleAccent}
              </span>
            </h2>
            <p className="mt-5 max-w-lg whitespace-pre-line text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              {featuredSubtitle}
            </p>
          </div>
          <Link
            href={featuredCtaHref}
            className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[var(--ink)]/10 bg-white/80 px-6 py-3 text-sm font-semibold text-[var(--ink)] shadow-sm backdrop-blur transition hover:border-[var(--accent-deep)]/30 hover:bg-white hover:shadow-md"
          >
            {featuredCtaLabel}
            <span
              className="inline-block transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              →
            </span>
          </Link>
        </div>

        {n === 0 ? (
          <div className="relative mt-14 overflow-hidden rounded-3xl border border-dashed border-[var(--border)] bg-gradient-to-br from-white to-[var(--paper)] px-6 py-16 text-center sm:px-10 sm:py-20">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent)]/10 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[var(--accent-deep)]/10 blur-3xl"
              aria-hidden
            />
            <p className="relative font-display text-xl font-semibold text-[var(--ink)]">
              {featuredEmptyTitle}
            </p>
            <p className="relative mx-auto mt-3 max-w-md whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">
              {featuredEmptyBody}
            </p>
          </div>
        ) : (
          <div
            className={`mx-auto mt-12 grid gap-4 sm:gap-5 ${
              n === 1
                ? "max-w-[280px] grid-cols-1"
                : n === 2
                  ? "max-w-2xl grid-cols-1 sm:grid-cols-2"
                  : "max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {products.map((p, i) => (
              <ProductCard
                key={p._id}
                product={p}
                priority={i === 0}
                size="compact"
                className="h-full"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
