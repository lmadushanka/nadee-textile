import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { ProductCard } from "@/components/ProductCard";

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
      <section className="relative isolate overflow-hidden bg-[var(--ink)] text-white">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=2200&q=80"
            alt=""
            fill
            className="object-cover opacity-30"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(245,158,11,0.32),transparent_32%),radial-gradient(circle_at_20%_85%,rgba(96,165,250,0.2),transparent_28%),linear-gradient(120deg,rgba(12,18,34,0.97),rgba(12,18,34,0.8),rgba(30,58,95,0.6))]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-18 sm:px-6 lg:px-8 lg:py-26">
          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
            <div>
              <p className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 backdrop-blur">
                Creative textile studio
              </p>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Design-led fashion for{" "}
                <span className="text-amber-100">everyday confidence</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-200 sm:text-lg">
                From expressive street layers to timeless wardrobe basics, Nadee
                Textile blends comfort, craftsmanship, and modern silhouettes for
                retail and personal styling.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full bg-amber-100 px-6 py-3 text-sm font-semibold text-[var(--ink)] shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition hover:bg-white"
                >
                  Shop new collection
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                >
                  Explore brand story
                </Link>
              </div>

              <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["120+", "Styles"],
                  ["Daily", "Ready stock"],
                  ["Island", "Wide shipping"],
                  ["Custom", "Bulk support"],
                ].map(([title, sub]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur"
                  >
                    <p className="font-display text-2xl font-semibold text-amber-100">
                      {title}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-zinc-300">
                      {sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative h-full rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                <div className="grid gap-4">
                  <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1467043198406-dc953a3defa7?w=1400&q=80"
                      alt="Lookbook frame one"
                      fill
                      sizes="40vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative aspect-square overflow-hidden rounded-2xl">
                      <Image
                        src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000&q=80"
                        alt="Lookbook frame two"
                        fill
                        sizes="20vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-black/25 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">
                        Style direction
                      </p>
                      <p className="mt-2 font-display text-xl text-white">
                        Minimal lines, bold personality.
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-zinc-300">
                        Seasonal drops with core essentials so your catalog always
                        looks fresh.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
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

      <section className="border-y border-[var(--border)] bg-white/60 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
                Featured pieces
              </h2>
              <p className="mt-2 max-w-lg text-[var(--muted)]">
                The latest highlighted items from your catalog, presented with a
                clean showroom-style layout.
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              See all products
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--paper)] p-10 text-center">
              <p className="font-medium text-[var(--ink)]">No products yet</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Run{" "}
                <code className="rounded bg-black/[0.06] px-1.5 py-0.5 text-xs">
                  npm run seed
                </code>{" "}
                or mark items as featured (and active) under Admin → Products, then
                refresh.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p, i) => (
                <ProductCard key={p._id} product={p} priority={i < 2} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
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
