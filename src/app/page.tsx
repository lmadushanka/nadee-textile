import Link from "next/link";
import { FabricMindsetSection } from "@/components/home/FabricMindsetSection";
import { FeaturedPieces } from "@/components/home/FeaturedPieces";
import { HomeHero } from "@/components/home/HomeHero";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { getCategories } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import type { ResolvedSiteSettings } from "@/lib/site-settings-defaults";
import { DEFAULT_SITE_SETTINGS, getResolvedSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  let featured: Awaited<ReturnType<typeof getProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let site: ResolvedSiteSettings = { ...DEFAULT_SITE_SETTINGS };
  try {
    site = await getResolvedSiteSettings();
  } catch {
    site = { ...DEFAULT_SITE_SETTINGS };
  }

  try {
    featured = await getProducts({
      featured: true,
      limit: site.featuredProductLimit,
    });
  } catch {
    featured = [];
  }
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }
  return (
    <>
      <HomeHero
        heroEyebrow={site.heroEyebrow}
        heroTitlePrimary={site.heroTitlePrimary}
        heroTitleAccent={site.heroTitleAccent}
        heroSubtitle={site.heroSubtitle}
        heroSlides={site.heroSlides}
      />

      <section className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {categories.length > 0 ? (
          <ScrollReveal className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((item, i) => (
                <ScrollReveal key={item._id} delayMs={i * 50} className="inline-block">
                  <Link
                    href={`/products?category=${encodeURIComponent(item.slug)}`}
                    className="nadee-home-pill inline-block rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--muted)] hover:border-[var(--accent-deep)]/30 hover:text-[var(--accent-deep)]"
                  >
                    {item.name}
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
        ) : null}

        <div className="grid gap-6 md:grid-cols-3">
          {(categories.length > 0
            ? categories.slice(0, 6).map((c) => ({
                title: c.name,
                body: `Browse our ${c.name.toLowerCase()} range, curated for fit, comfort, and everyday styling.`,
                href: `/products?category=${encodeURIComponent(c.slug)}`,
              }))
            : [
                {
                  title: "Shirts & tops",
                  body: "Crisp linens, brushed cottons, and easy silhouettes for daily wear.",
                  href: "/products",
                },
                {
                  title: "Knitwear",
                  body: "Layer-ready pullovers and cardigans with a rich premium hand-feel.",
                  href: "/products",
                },
                {
                  title: "Outerwear",
                  body: "Jackets built for movement, from light shells to denim staples.",
                  href: "/products",
                },
              ]
          ).map((c, i) => (
            <ScrollReveal key={c.title} delayMs={i * 90} className="min-w-0">
              <Link
                href={c.href}
                className="nadee-home-cat-card group block h-full rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-[var(--paper)]/60 p-8 shadow-sm"
              >
                <h2 className="font-display text-xl font-semibold text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--accent)]">
                  {c.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] transition-colors duration-300 group-hover:text-[var(--ink)]/90">
                  {c.body}
                </p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent-deep)] transition-transform duration-300 group-hover:translate-x-1">
                  View range
                  <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <FeaturedPieces
        products={featured}
        featuredEyebrow={site.featuredEyebrow}
        featuredTitleLead={site.featuredTitleLead}
        featuredTitleAccent={site.featuredTitleAccent}
        featuredSubtitle={site.featuredSubtitle}
        featuredCtaLabel={site.featuredCtaLabel}
        featuredCtaHref={site.featuredCtaHref}
        featuredEmptyTitle={site.featuredEmptyTitle}
        featuredEmptyBody={site.featuredEmptyBody}
      />

      <FabricMindsetSection
        fabricImageSrc={site.fabricImageSrc}
        fabricImageAlt={site.fabricImageAlt}
        fabricTitle={site.fabricTitle}
        fabricSubtitle={site.fabricSubtitle}
      />
    </>
  );
}
