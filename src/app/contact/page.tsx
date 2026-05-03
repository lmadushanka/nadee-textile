import type { Metadata } from "next";
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
    title: site.contactSeoTitle,
    description: site.contactSeoDescription,
  };
}

export default async function ContactPage() {
  let site = { ...DEFAULT_SITE_SETTINGS };
  try {
    site = await getResolvedSiteSettings();
  } catch {
    site = { ...DEFAULT_SITE_SETTINGS };
  }

  const showFooterRow =
    site.contactFooterLead.trim().length > 0 ||
    site.contactFooterLinkText.trim().length > 0;

  return (
    <div className="w-full px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {site.contactEyebrow.trim() ? (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          {site.contactEyebrow}
        </p>
      ) : null}
      <h1
        className={`font-display text-4xl font-semibold text-[var(--ink)] sm:text-5xl ${
          site.contactEyebrow.trim() ? "mt-3" : ""
        }`}
      >
        {site.contactHeroTitle}
      </h1>
      <p className="mt-4 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-[var(--muted)]">
        {site.contactHeroLead}
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
            {site.contactVisitCardHeading}
          </h2>
          <address className="mt-4 whitespace-pre-line not-italic text-base leading-relaxed text-[var(--muted)]">
            {site.contactVisitAddress}
          </address>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            {site.contactHoursLabel}
          </p>
          <p className="mt-2 text-[var(--ink)]">{site.contactHoursText}</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
            {site.contactReachCardHeading}
          </h2>
          <p className="mt-4">
            <a
              href={site.contactPhoneHref}
              className="text-lg font-semibold text-[var(--accent)] hover:underline"
            >
              {site.contactPhone}
            </a>
          </p>
          <p className="mt-4">
            <a
              href={site.contactEmailHref}
              className="text-[var(--accent-deep)] hover:underline"
            >
              {site.contactEmail}
            </a>
          </p>
        </div>
      </div>

      {showFooterRow ? (
        <p className="mt-12 text-sm text-[var(--muted)]">
          {site.contactFooterLead.trim() ? <>{site.contactFooterLead.trim()} </> : null}
          {site.contactFooterLinkText.trim() ? (
            <Link
              href={site.contactFooterLinkHref}
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              {site.contactFooterLinkText.trim()}
            </Link>
          ) : null}
          {site.contactFooterLinkText.trim() ? "." : site.contactFooterLead.trim() ? "." : null}
        </p>
      ) : null}
    </div>
  );
}
