import { connectDB } from "@/lib/mongodb";
import {
  DEFAULT_SITE_SETTINGS,
  FEATURED_PRODUCT_LIMIT_RANGE,
  type AboutValueBlock,
  type HeroSlide,
  type ResolvedSiteSettings,
} from "@/lib/site-settings-defaults";
import { SITE_SETTINGS_KEY, SiteSettings } from "@/models/SiteSettings";

export type {
  ResolvedSiteSettings,
  HeroSlide,
  FabricSectionSettings,
  HomeHeroSettings,
  FeaturedPiecesSectionSettings,
  ProductsPageSettings,
  AboutPageSettings,
  AboutValueBlock,
  ContactPageSettings,
} from "@/lib/site-settings-defaults";
export { ABOUT_VALUES_CONSTRAINTS } from "@/lib/site-settings-defaults";
export { formatProductsCategoryTitle } from "@/lib/site-settings-defaults";
export { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings-defaults";
export { SITE_SETTINGS_KEY } from "@/models/SiteSettings";

function clampFeaturedProductLimit(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_SITE_SETTINGS.featuredProductLimit;
  const i = Math.floor(n);
  return Math.min(
    FEATURED_PRODUCT_LIMIT_RANGE.max,
    Math.max(FEATURED_PRODUCT_LIMIT_RANGE.min, i),
  );
}

function normalizeAboutValues(raw: unknown): AboutValueBlock[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_SITE_SETTINGS.aboutValues.map((v) => ({ ...v }));
  }
  const out: AboutValueBlock[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const title = "title" in item && typeof item.title === "string" ? item.title.trim() : "";
    const body = "body" in item && typeof item.body === "string" ? item.body.trim() : "";
    if (title && body) {
      out.push({ title: title.slice(0, 200), body: body.slice(0, 2000) });
    }
  }
  return out.length > 0
    ? out
    : DEFAULT_SITE_SETTINGS.aboutValues.map((v) => ({ ...v }));
}

function normalizeHeroSlides(raw: unknown): HeroSlide[] {
  if (!Array.isArray(raw) || raw.length === 0) return [...DEFAULT_SITE_SETTINGS.heroSlides];
  const out: HeroSlide[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const src = "src" in item && typeof item.src === "string" ? item.src.trim() : "";
    const alt = "alt" in item && typeof item.alt === "string" ? item.alt.trim() : "";
    if (src && alt) out.push({ src, alt: alt.slice(0, 500) });
  }
  return out.length > 0 ? out : [...DEFAULT_SITE_SETTINGS.heroSlides];
}

export async function getResolvedSiteSettings(): Promise<ResolvedSiteSettings> {
  await connectDB();
  const doc = await SiteSettings.findOne({ key: SITE_SETTINGS_KEY }).lean().exec();
  return {
    fabricImageSrc:
      (doc?.fabricImageSrc && String(doc.fabricImageSrc).trim()) ||
      DEFAULT_SITE_SETTINGS.fabricImageSrc,
    fabricImageAlt:
      (doc?.fabricImageAlt && String(doc.fabricImageAlt).trim()) ||
      DEFAULT_SITE_SETTINGS.fabricImageAlt,
    fabricTitle:
      (doc?.fabricTitle && String(doc.fabricTitle).trim()) || DEFAULT_SITE_SETTINGS.fabricTitle,
    fabricSubtitle:
      (doc?.fabricSubtitle && String(doc.fabricSubtitle).trim()) ||
      DEFAULT_SITE_SETTINGS.fabricSubtitle,
    heroEyebrow:
      (doc?.heroEyebrow && String(doc.heroEyebrow).trim()) || DEFAULT_SITE_SETTINGS.heroEyebrow,
    heroTitlePrimary:
      (doc?.heroTitlePrimary && String(doc.heroTitlePrimary).trim()) ||
      DEFAULT_SITE_SETTINGS.heroTitlePrimary,
    heroTitleAccent:
      (doc?.heroTitleAccent && String(doc.heroTitleAccent).trim()) ||
      DEFAULT_SITE_SETTINGS.heroTitleAccent,
    heroSubtitle:
      (doc?.heroSubtitle && String(doc.heroSubtitle).trim()) ||
      DEFAULT_SITE_SETTINGS.heroSubtitle,
    heroSlides: normalizeHeroSlides(doc?.heroSlides),
    featuredEyebrow:
      (doc?.featuredEyebrow && String(doc.featuredEyebrow).trim()) ||
      DEFAULT_SITE_SETTINGS.featuredEyebrow,
    featuredTitleLead:
      (doc?.featuredTitleLead && String(doc.featuredTitleLead).trim()) ||
      DEFAULT_SITE_SETTINGS.featuredTitleLead,
    featuredTitleAccent:
      (doc?.featuredTitleAccent && String(doc.featuredTitleAccent).trim()) ||
      DEFAULT_SITE_SETTINGS.featuredTitleAccent,
    featuredSubtitle:
      (doc?.featuredSubtitle && String(doc.featuredSubtitle).trim()) ||
      DEFAULT_SITE_SETTINGS.featuredSubtitle,
    featuredCtaLabel:
      (doc?.featuredCtaLabel && String(doc.featuredCtaLabel).trim()) ||
      DEFAULT_SITE_SETTINGS.featuredCtaLabel,
    featuredCtaHref:
      (doc?.featuredCtaHref && String(doc.featuredCtaHref).trim()) ||
      DEFAULT_SITE_SETTINGS.featuredCtaHref,
    featuredProductLimit: clampFeaturedProductLimit(doc?.featuredProductLimit),
    featuredEmptyTitle:
      (doc?.featuredEmptyTitle && String(doc.featuredEmptyTitle).trim()) ||
      DEFAULT_SITE_SETTINGS.featuredEmptyTitle,
    featuredEmptyBody:
      (doc?.featuredEmptyBody && String(doc.featuredEmptyBody).trim()) ||
      DEFAULT_SITE_SETTINGS.featuredEmptyBody,
    productsEyebrow:
      (doc?.productsEyebrow && String(doc.productsEyebrow).trim()) ||
      DEFAULT_SITE_SETTINGS.productsEyebrow,
    productsTitleAll:
      (doc?.productsTitleAll && String(doc.productsTitleAll).trim()) ||
      DEFAULT_SITE_SETTINGS.productsTitleAll,
    productsCategoryTitleTemplate:
      (doc?.productsCategoryTitleTemplate &&
        String(doc.productsCategoryTitleTemplate).trim()) ||
      DEFAULT_SITE_SETTINGS.productsCategoryTitleTemplate,
    productsIntro:
      (doc?.productsIntro && String(doc.productsIntro).trim()) ||
      DEFAULT_SITE_SETTINGS.productsIntro,
    productsSeoTitle:
      (doc?.productsSeoTitle && String(doc.productsSeoTitle).trim()) ||
      DEFAULT_SITE_SETTINGS.productsSeoTitle,
    productsSeoDescription:
      (doc?.productsSeoDescription && String(doc.productsSeoDescription).trim()) ||
      DEFAULT_SITE_SETTINGS.productsSeoDescription,
    aboutSeoTitle:
      (doc?.aboutSeoTitle && String(doc.aboutSeoTitle).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutSeoTitle,
    aboutSeoDescription:
      (doc?.aboutSeoDescription && String(doc.aboutSeoDescription).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutSeoDescription,
    aboutEyebrow:
      doc?.aboutEyebrow !== undefined && doc?.aboutEyebrow !== null
        ? String(doc.aboutEyebrow).trim().slice(0, 120)
        : DEFAULT_SITE_SETTINGS.aboutEyebrow,
    aboutHeroTitle:
      (doc?.aboutHeroTitle && String(doc.aboutHeroTitle).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutHeroTitle,
    aboutHeroLead:
      (doc?.aboutHeroLead && String(doc.aboutHeroLead).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutHeroLead,
    aboutStoryImageSrc:
      (doc?.aboutStoryImageSrc && String(doc.aboutStoryImageSrc).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutStoryImageSrc,
    aboutStoryImageAlt:
      (doc?.aboutStoryImageAlt && String(doc.aboutStoryImageAlt).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutStoryImageAlt,
    aboutStoryHeading:
      (doc?.aboutStoryHeading && String(doc.aboutStoryHeading).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutStoryHeading,
    aboutStoryParagraph1:
      (doc?.aboutStoryParagraph1 && String(doc.aboutStoryParagraph1).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutStoryParagraph1,
    aboutStoryParagraph2:
      doc?.aboutStoryParagraph2 !== undefined && doc?.aboutStoryParagraph2 !== null
        ? String(doc.aboutStoryParagraph2).trim().slice(0, 4000)
        : DEFAULT_SITE_SETTINGS.aboutStoryParagraph2,
    aboutValuesHeading:
      (doc?.aboutValuesHeading && String(doc.aboutValuesHeading).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutValuesHeading,
    aboutValues: normalizeAboutValues(doc?.aboutValues),
    aboutContactEyebrow:
      doc?.aboutContactEyebrow !== undefined && doc?.aboutContactEyebrow !== null
        ? String(doc.aboutContactEyebrow).trim().slice(0, 120)
        : DEFAULT_SITE_SETTINGS.aboutContactEyebrow,
    aboutContactHeading:
      (doc?.aboutContactHeading && String(doc.aboutContactHeading).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutContactHeading,
    aboutContactBusinessName:
      (doc?.aboutContactBusinessName && String(doc.aboutContactBusinessName).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutContactBusinessName,
    aboutContactAddress:
      (doc?.aboutContactAddress && String(doc.aboutContactAddress).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutContactAddress,
    aboutContactPhoneLabel:
      (doc?.aboutContactPhoneLabel && String(doc.aboutContactPhoneLabel).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutContactPhoneLabel,
    aboutContactPhone:
      (doc?.aboutContactPhone && String(doc.aboutContactPhone).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutContactPhone,
    aboutContactPhoneHref:
      (doc?.aboutContactPhoneHref && String(doc.aboutContactPhoneHref).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutContactPhoneHref,
    aboutMapEmbedUrl:
      (doc?.aboutMapEmbedUrl && String(doc.aboutMapEmbedUrl).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutMapEmbedUrl,
    aboutCtaHeading:
      (doc?.aboutCtaHeading && String(doc.aboutCtaHeading).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutCtaHeading,
    aboutCtaBody:
      (doc?.aboutCtaBody && String(doc.aboutCtaBody).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutCtaBody,
    aboutCtaLabel:
      (doc?.aboutCtaLabel && String(doc.aboutCtaLabel).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutCtaLabel,
    aboutCtaHref:
      (doc?.aboutCtaHref && String(doc.aboutCtaHref).trim()) ||
      DEFAULT_SITE_SETTINGS.aboutCtaHref,
    contactSeoTitle:
      (doc?.contactSeoTitle && String(doc.contactSeoTitle).trim()) ||
      DEFAULT_SITE_SETTINGS.contactSeoTitle,
    contactSeoDescription:
      (doc?.contactSeoDescription && String(doc.contactSeoDescription).trim()) ||
      DEFAULT_SITE_SETTINGS.contactSeoDescription,
    contactEyebrow:
      doc?.contactEyebrow !== undefined && doc?.contactEyebrow !== null
        ? String(doc.contactEyebrow).trim().slice(0, 120)
        : DEFAULT_SITE_SETTINGS.contactEyebrow,
    contactHeroTitle:
      (doc?.contactHeroTitle && String(doc.contactHeroTitle).trim()) ||
      DEFAULT_SITE_SETTINGS.contactHeroTitle,
    contactHeroLead:
      (doc?.contactHeroLead && String(doc.contactHeroLead).trim()) ||
      DEFAULT_SITE_SETTINGS.contactHeroLead,
    contactVisitCardHeading:
      (doc?.contactVisitCardHeading && String(doc.contactVisitCardHeading).trim()) ||
      DEFAULT_SITE_SETTINGS.contactVisitCardHeading,
    contactVisitAddress:
      (doc?.contactVisitAddress && String(doc.contactVisitAddress).trim()) ||
      DEFAULT_SITE_SETTINGS.contactVisitAddress,
    contactHoursLabel:
      (doc?.contactHoursLabel && String(doc.contactHoursLabel).trim()) ||
      DEFAULT_SITE_SETTINGS.contactHoursLabel,
    contactHoursText:
      (doc?.contactHoursText && String(doc.contactHoursText).trim()) ||
      DEFAULT_SITE_SETTINGS.contactHoursText,
    contactReachCardHeading:
      (doc?.contactReachCardHeading && String(doc.contactReachCardHeading).trim()) ||
      DEFAULT_SITE_SETTINGS.contactReachCardHeading,
    contactPhone:
      (doc?.contactPhone && String(doc.contactPhone).trim()) ||
      DEFAULT_SITE_SETTINGS.contactPhone,
    contactPhoneHref:
      (doc?.contactPhoneHref && String(doc.contactPhoneHref).trim()) ||
      DEFAULT_SITE_SETTINGS.contactPhoneHref,
    contactEmail:
      (doc?.contactEmail && String(doc.contactEmail).trim()) ||
      DEFAULT_SITE_SETTINGS.contactEmail,
    contactEmailHref:
      (doc?.contactEmailHref && String(doc.contactEmailHref).trim()) ||
      DEFAULT_SITE_SETTINGS.contactEmailHref,
    contactFooterLead:
      doc?.contactFooterLead !== undefined && doc?.contactFooterLead !== null
        ? String(doc.contactFooterLead).trim().slice(0, 300)
        : DEFAULT_SITE_SETTINGS.contactFooterLead,
    contactFooterLinkText:
      doc?.contactFooterLinkText !== undefined && doc?.contactFooterLinkText !== null
        ? String(doc.contactFooterLinkText).trim().slice(0, 120)
        : DEFAULT_SITE_SETTINGS.contactFooterLinkText,
    contactFooterLinkHref:
      doc?.contactFooterLinkHref !== undefined && doc?.contactFooterLinkHref !== null
        ? String(doc.contactFooterLinkHref).trim().slice(0, 500)
        : DEFAULT_SITE_SETTINGS.contactFooterLinkHref,
  };
}
