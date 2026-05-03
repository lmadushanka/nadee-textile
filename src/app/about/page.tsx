import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings-defaults";
import { getResolvedSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  let site = { ...DEFAULT_SITE_SETTINGS };
  try {
    site = await getResolvedSiteSettings();
  } catch {
    site = { ...DEFAULT_SITE_SETTINGS };
  }
  return {
    title: site.aboutSeoTitle,
    description: site.aboutSeoDescription,
  };
}

export default async function AboutPage() {
  let site = { ...DEFAULT_SITE_SETTINGS };
  try {
    site = await getResolvedSiteSettings();
  } catch {
    site = { ...DEFAULT_SITE_SETTINGS };
  }

  return (
    <div>
      <section className="border-b border-[var(--border)] bg-white/80">
        <div className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          {site.aboutEyebrow.trim() ? (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              {site.aboutEyebrow}
            </p>
          ) : null}
          <h1
            className={`max-w-3xl font-display text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl ${
              site.aboutEyebrow.trim() ? "mt-4" : ""
            }`}
          >
            {site.aboutHeroTitle}
          </h1>
          <p className="mt-6 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-[var(--muted)]">
            {site.aboutHeroLead}
          </p>
        </div>
      </section>

      <section className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-zinc-100">
            <Image
              src={site.aboutStoryImageSrc}
              alt={site.aboutStoryImageAlt}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
              priority
              unoptimized
            />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
              {site.aboutStoryHeading}
            </h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-[var(--muted)]">
              {site.aboutStoryParagraph1}
            </p>
            {site.aboutStoryParagraph2.trim() ? (
              <p className="mt-4 whitespace-pre-line leading-relaxed text-[var(--muted)]">
                {site.aboutStoryParagraph2}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--accent-deep)] py-16 text-white lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            {site.aboutValuesHeading}
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {site.aboutValues.map((item, i) => (
              <div key={`${i}-${item.title.slice(0, 24)}`}>
                <h3 className="font-display text-lg font-semibold text-amber-100">{item.title}</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-white/70 py-16 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {site.aboutContactEyebrow.trim() ? (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              {site.aboutContactEyebrow}
            </p>
          ) : null}
          <h2
            className={`font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl ${
              site.aboutContactEyebrow.trim() ? "mt-3" : ""
            }`}
          >
            {site.aboutContactHeading}
          </h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-12">
            <div className="flex flex-col justify-center">
              <p className="font-display text-lg font-semibold text-[var(--ink)]">
                {site.aboutContactBusinessName}
              </p>
              <address className="mt-3 whitespace-pre-line not-italic text-base leading-relaxed text-[var(--muted)]">
                {site.aboutContactAddress}
              </address>
              <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                {site.aboutContactPhoneLabel}
              </p>
              <a
                href={site.aboutContactPhoneHref}
                className="mt-2 inline-flex w-fit text-lg font-semibold text-[var(--accent)] hover:underline"
              >
                {site.aboutContactPhone}
              </a>
            </div>
            <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-[var(--border)] bg-zinc-100 shadow-sm sm:min-h-[360px] lg:min-h-[420px]">
              <iframe
                title={`${site.aboutContactBusinessName} on map`}
                src={site.aboutMapEmbedUrl}
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
          {site.aboutCtaHeading}
        </h2>
        <p className="mx-auto mt-4 max-w-xl whitespace-pre-line text-[var(--muted)]">
          {site.aboutCtaBody}
        </p>
        <Link
          href={site.aboutCtaHref}
          className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {site.aboutCtaLabel}
        </Link>
      </section>
    </div>
  );
}
