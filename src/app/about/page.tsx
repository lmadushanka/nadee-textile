import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about nadee-textile—our story, how we work with materials, and what we stand for in garments and apparel.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-[var(--border)] bg-white/80">
        <div className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            About nadee-textile
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">
            We sell clothes the way we would want to buy them—clear, honest, and
            built to wear.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
            nadee-textile is a garments-focused business: shirts, knitwear,
            outerwear, and everyday basics chosen for comfort, fit, and
            longevity. Whether you are stocking a rail or refreshing your own
            wardrobe, we aim to make the decision easy.
          </p>
        </div>
      </section>

      <section className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-zinc-100">
            <Image
              src="/img2.jpeg"
              alt="Nadee Textile — our store and garments"
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
              Our story
            </h2>
            <p className="mt-4 leading-relaxed text-[var(--muted)]">
              nadee-textile started from a simple frustration: too much fashion
              noise, not enough dependable pieces. We focus on textiles that feel
              right on the skin, silhouettes that work across seasons, and
              pricing that respects both the maker and the buyer.
            </p>
            <p className="mt-4 leading-relaxed text-[var(--muted)]">
              Today we combine that mindset with a modern stack—this site runs on
              Next.js with product data living in MongoDB under the{" "}
              <code className="rounded bg-black/[0.06] px-1.5 py-0.5 text-sm">
                nadee-textile
              </code>{" "}
              database—so our catalog can grow as we do.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--accent-deep)] py-16 text-white lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            What we stand for
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {[
              {
                title: "Materials that make sense",
                body: "We favor fibers and finishes that age well—breathable naturals, responsible blends, and fabrics chosen for hand-feel.",
              },
              {
                title: "Fit you can trust",
                body: "Proportions are tuned for real bodies and real movement—not just a lookbook pose.",
              },
              {
                title: "Partnership, not hype",
                body: "Retailers and end customers get straightforward information: composition, care, and price.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-display text-lg font-semibold text-amber-100">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-white/70 py-16 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Location &amp; contact
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
            Visit Nadee Textile
          </h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-12">
            <div className="flex flex-col justify-center">
              <p className="font-display text-lg font-semibold text-[var(--ink)]">
                Nadee Textile
              </p>
              <address className="mt-3 not-italic text-base leading-relaxed text-[var(--muted)]">
                No 2/A, Yaya 7,
                <br />
                Morakatiya,
                <br />
                Embilipitiya
              </address>
              <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Mobile
              </p>
              <a
                href="tel:+94741980433"
                className="mt-2 inline-flex w-fit text-lg font-semibold text-[var(--accent)] hover:underline"
              >
                074 198 0433
              </a>
            </div>
            <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-[var(--border)] bg-zinc-100 shadow-sm sm:min-h-[360px] lg:min-h-[420px]">
              <iframe
                title="Nadee Textile on Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253786.70230188224!2d80.89447129999999!3d6.3399719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae401f4b13c801b%3A0x702c16f9386a94cd!2sNadee%20textile!5e0!3m2!1sen!2slk!4v1777613926800!5m2!1sen!2slk"
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
        <h2 className="font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
          Ready to browse the catalog?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">
          Head to the products page to see live items from your MongoDB
          collection.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          View products
        </Link>
      </section>
    </div>
  );
}
