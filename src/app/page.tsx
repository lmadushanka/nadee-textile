import Image from "next/image";
import Link from "next/link";
import { FeaturedPieces } from "@/components/home/FeaturedPieces";
import { HomeHero } from "@/components/home/HomeHero";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
export const dynamic = "force-dynamic";

export default async function Home() {
  let featured: Awaited<ReturnType<typeof getProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    featured = await getProducts({ featured: true, limit: 3 });
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
      <HomeHero />

      <section className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {categories.length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((item) => (
              <Link
                key={item._id}
                href={`/products?category=${encodeURIComponent(item.slug)}`}
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent-deep)]/25 hover:text-[var(--accent-deep)]"
              >
                {item.name}
              </Link>
            ))}
          </div>
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
              ]).map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-[var(--paper)]/60 p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="font-display text-xl font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]">
                {c.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {c.body}
              </p>
              <span className="mt-6 inline-flex text-sm font-semibold text-[var(--accent-deep)]">
                View range →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <FeaturedPieces products={featured} />

      <section className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-200">
            <Image
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80"
              alt="Fabric and tailoring"
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
              Fabric-first mindset
            </h2>
            <p className="mt-4 text-[var(--muted)] leading-relaxed">
              We care how garments look and how they last. From drape and
              breathability to shape retention after many washes, each piece is
              selected for real-world wear.
            </p>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-[var(--border)] pt-10">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Focus
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-[var(--ink)]">
                  Quality
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Range
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-[var(--ink)]">
                  Apparel
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Name
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-[var(--ink)]">
                  nadee
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
