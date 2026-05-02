import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Nadee Textile—location, hours, phone, and email for orders and enquiries.",
};

export default function ContactPage() {
  return (
    <div className="w-full px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        Contact us
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-[var(--ink)] sm:text-5xl">
        We are here to help
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
        Visit the showroom, call us during business hours, or send an email—we
        will get back to you as soon as we can.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
            Visit
          </h2>
          <address className="mt-4 not-italic text-base leading-relaxed text-[var(--muted)]">
            Nadee Textile
            <br />
            No 2/A, Yaya 7,
            <br />
            Morakatiya,
            <br />
            Embilipitiya
          </address>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Hours
          </p>
          <p className="mt-2 text-[var(--ink)]">Mon–Friday, 09:00 – 17:00</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
            Phone &amp; email
          </h2>
          <p className="mt-4">
            <a
              href="tel:+94741980433"
              className="text-lg font-semibold text-[var(--accent)] hover:underline"
            >
              074 198 0433
            </a>
          </p>
          <p className="mt-4">
            <a
              href="mailto:info@nadeetextile.com"
              className="text-[var(--accent-deep)] hover:underline"
            >
              info@nadeetextile.com
            </a>
          </p>
        </div>
      </div>

      <p className="mt-12 text-sm text-[var(--muted)]">
        Want to know more about the brand?{" "}
        <Link href="/about" className="font-semibold text-[var(--accent)] hover:underline">
          Read our story
        </Link>
        .
      </p>
    </div>
  );
}
