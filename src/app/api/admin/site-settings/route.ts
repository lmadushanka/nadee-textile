import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  ABOUT_VALUES_CONSTRAINTS,
  DEFAULT_SITE_SETTINGS,
  FEATURED_PRODUCT_LIMIT_RANGE,
  HERO_SLIDES_CONSTRAINTS,
  type AboutValueBlock,
  type HeroSlide,
  type ResolvedSiteSettings,
} from "@/lib/site-settings-defaults";
import { getResolvedSiteSettings } from "@/lib/site-settings";
import { SITE_SETTINGS_KEY, SiteSettings } from "@/models/SiteSettings";

export const dynamic = "force-dynamic";

function isAllowedImageSrc(v: string) {
  const s = v.trim();
  if (!s) return false;
  if (s.startsWith("/")) return true;
  return /^https?:\/\//i.test(s);
}

function isInternalHref(v: string) {
  const s = v.trim();
  if (s.length < 1 || s.length > 500) return false;
  if (!s.startsWith("/") || s.startsWith("//")) return false;
  return !/\s/.test(s);
}

function isHttpsEmbedUrl(v: string) {
  const s = v.trim();
  if (s.length < 12 || s.length > 2000) return false;
  if (!s.startsWith("https://")) return false;
  return !/\s/.test(s);
}

function isTelHref(v: string) {
  const s = v.trim();
  if (s.length < 4 || s.length > 120) return false;
  if (!s.toLowerCase().startsWith("tel:")) return false;
  return !/\s/.test(s);
}

function isMailtoHref(v: string) {
  const s = v.trim();
  if (s.length < 12 || s.length > 320) return false;
  if (!s.toLowerCase().startsWith("mailto:")) return false;
  return !/\s/.test(s);
}

function clampFeaturedLimit(n: unknown): number {
  const raw = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(raw)) return DEFAULT_SITE_SETTINGS.featuredProductLimit;
  const i = Math.floor(raw);
  return Math.min(
    FEATURED_PRODUCT_LIMIT_RANGE.max,
    Math.max(FEATURED_PRODUCT_LIMIT_RANGE.min, i),
  );
}

function parseHeroSlides(input: unknown): { ok: true; slides: HeroSlide[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) {
    return { ok: false, error: "Hero slides must be an array" };
  }
  if (
    input.length < HERO_SLIDES_CONSTRAINTS.min ||
    input.length > HERO_SLIDES_CONSTRAINTS.max
  ) {
    return {
      ok: false,
      error: `Hero must have between ${HERO_SLIDES_CONSTRAINTS.min} and ${HERO_SLIDES_CONSTRAINTS.max} background images`,
    };
  }
  const slides: HeroSlide[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "Each hero slide must be an object with src and alt" };
    }
    const src = "src" in item && typeof item.src === "string" ? item.src.trim() : "";
    const alt = "alt" in item && typeof item.alt === "string" ? item.alt.trim().slice(0, 500) : "";
    if (!src || !isAllowedImageSrc(src)) {
      return { ok: false, error: "Each slide image URL must start with / or http(s)://" };
    }
    if (!alt) {
      return { ok: false, error: "Each slide needs alt text for accessibility" };
    }
    slides.push({ src, alt });
  }
  return { ok: true, slides };
}

function parseAboutValues(
  input: unknown,
): { ok: true; values: AboutValueBlock[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) {
    return { ok: false, error: "About values must be an array" };
  }
  if (
    input.length < ABOUT_VALUES_CONSTRAINTS.min ||
    input.length > ABOUT_VALUES_CONSTRAINTS.max
  ) {
    return {
      ok: false,
      error: `About page needs between ${ABOUT_VALUES_CONSTRAINTS.min} and ${ABOUT_VALUES_CONSTRAINTS.max} value blocks`,
    };
  }
  const values: AboutValueBlock[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "Each value block must have title and body" };
    }
    const title = "title" in item && typeof item.title === "string" ? item.title.trim() : "";
    const body = "body" in item && typeof item.body === "string" ? item.body.trim() : "";
    if (!title || !body) {
      return { ok: false, error: "Each value block needs a title and body" };
    }
    values.push({ title: title.slice(0, 200), body: body.slice(0, 2000) });
  }
  return { ok: true, values };
}

function mergePatch(
  base: ResolvedSiteSettings,
  body: Partial<{
    brandLogoSrc: string;
    brandLogoAlt: string;
    brandFaviconSrc: string;
    brandSiteTitleDefault: string;
    brandSiteTitleTemplate: string;
    fabricImageSrc: string;
    fabricImageAlt: string;
    fabricTitle: string;
    fabricSubtitle: string;
    heroEyebrow: string;
    heroTitlePrimary: string;
    heroTitleAccent: string;
    heroSubtitle: string;
    heroSlides: HeroSlide[];
    featuredEyebrow: string;
    featuredTitleLead: string;
    featuredTitleAccent: string;
    featuredSubtitle: string;
    featuredCtaLabel: string;
    featuredCtaHref: string;
    featuredProductLimit: number;
    featuredEmptyTitle: string;
    featuredEmptyBody: string;
    productsEyebrow: string;
    productsTitleAll: string;
    productsCategoryTitleTemplate: string;
    productsIntro: string;
    productsSeoTitle: string;
    productsSeoDescription: string;
    aboutSeoTitle: string;
    aboutSeoDescription: string;
    aboutEyebrow: string;
    aboutHeroTitle: string;
    aboutHeroLead: string;
    aboutStoryImageSrc: string;
    aboutStoryImageAlt: string;
    aboutStoryHeading: string;
    aboutStoryParagraph1: string;
    aboutStoryParagraph2: string;
    aboutValuesHeading: string;
    aboutValues: AboutValueBlock[];
    aboutContactEyebrow: string;
    aboutContactHeading: string;
    aboutContactBusinessName: string;
    aboutContactAddress: string;
    aboutContactPhoneLabel: string;
    aboutContactPhone: string;
    aboutContactPhoneHref: string;
    aboutMapEmbedUrl: string;
    aboutCtaHeading: string;
    aboutCtaBody: string;
    aboutCtaLabel: string;
    aboutCtaHref: string;
    contactSeoTitle: string;
    contactSeoDescription: string;
    contactEyebrow: string;
    contactHeroTitle: string;
    contactHeroLead: string;
    contactVisitCardHeading: string;
    contactVisitAddress: string;
    contactHoursLabel: string;
    contactHoursText: string;
    contactReachCardHeading: string;
    contactPhone: string;
    contactPhoneHref: string;
    contactEmail: string;
    contactEmailHref: string;
    contactFooterLead: string;
    contactFooterLinkText: string;
    contactFooterLinkHref: string;
  }>,
): ResolvedSiteSettings {
  return {
    brandLogoSrc:
      typeof body.brandLogoSrc === "string"
        ? body.brandLogoSrc.trim().slice(0, 2000)
        : base.brandLogoSrc,
    brandLogoAlt:
      typeof body.brandLogoAlt === "string"
        ? body.brandLogoAlt.trim().slice(0, 200)
        : base.brandLogoAlt,
    brandFaviconSrc:
      typeof body.brandFaviconSrc === "string"
        ? body.brandFaviconSrc.trim().slice(0, 2000)
        : base.brandFaviconSrc,
    brandSiteTitleDefault:
      typeof body.brandSiteTitleDefault === "string"
        ? body.brandSiteTitleDefault.trim().slice(0, 120)
        : base.brandSiteTitleDefault,
    brandSiteTitleTemplate:
      typeof body.brandSiteTitleTemplate === "string"
        ? body.brandSiteTitleTemplate.trim().slice(0, 120)
        : base.brandSiteTitleTemplate,
    fabricImageSrc:
      typeof body.fabricImageSrc === "string"
        ? body.fabricImageSrc.trim()
        : base.fabricImageSrc,
    fabricImageAlt:
      typeof body.fabricImageAlt === "string"
        ? body.fabricImageAlt.trim().slice(0, 500)
        : base.fabricImageAlt,
    fabricTitle:
      typeof body.fabricTitle === "string" ? body.fabricTitle.trim().slice(0, 400) : base.fabricTitle,
    fabricSubtitle:
      typeof body.fabricSubtitle === "string"
        ? body.fabricSubtitle.trim().slice(0, 8000)
        : base.fabricSubtitle,
    heroEyebrow:
      typeof body.heroEyebrow === "string"
        ? body.heroEyebrow.trim().slice(0, 200)
        : base.heroEyebrow,
    heroTitlePrimary:
      typeof body.heroTitlePrimary === "string"
        ? body.heroTitlePrimary.trim().slice(0, 400)
        : base.heroTitlePrimary,
    heroTitleAccent:
      typeof body.heroTitleAccent === "string"
        ? body.heroTitleAccent.trim().slice(0, 400)
        : base.heroTitleAccent,
    heroSubtitle:
      typeof body.heroSubtitle === "string"
        ? body.heroSubtitle.trim().slice(0, 8000)
        : base.heroSubtitle,
    heroSlides: Array.isArray(body.heroSlides) ? body.heroSlides : base.heroSlides,
    featuredEyebrow:
      typeof body.featuredEyebrow === "string"
        ? body.featuredEyebrow.trim().slice(0, 120)
        : base.featuredEyebrow,
    featuredTitleLead:
      typeof body.featuredTitleLead === "string"
        ? body.featuredTitleLead.trim().slice(0, 120)
        : base.featuredTitleLead,
    featuredTitleAccent:
      typeof body.featuredTitleAccent === "string"
        ? body.featuredTitleAccent.trim().slice(0, 120)
        : base.featuredTitleAccent,
    featuredSubtitle:
      typeof body.featuredSubtitle === "string"
        ? body.featuredSubtitle.trim().slice(0, 2000)
        : base.featuredSubtitle,
    featuredCtaLabel:
      typeof body.featuredCtaLabel === "string"
        ? body.featuredCtaLabel.trim().slice(0, 120)
        : base.featuredCtaLabel,
    featuredCtaHref:
      typeof body.featuredCtaHref === "string"
        ? body.featuredCtaHref.trim().slice(0, 500)
        : base.featuredCtaHref,
    featuredProductLimit:
      body.featuredProductLimit !== undefined
        ? clampFeaturedLimit(body.featuredProductLimit)
        : base.featuredProductLimit,
    featuredEmptyTitle:
      typeof body.featuredEmptyTitle === "string"
        ? body.featuredEmptyTitle.trim().slice(0, 200)
        : base.featuredEmptyTitle,
    featuredEmptyBody:
      typeof body.featuredEmptyBody === "string"
        ? body.featuredEmptyBody.trim().slice(0, 2000)
        : base.featuredEmptyBody,
    productsEyebrow:
      typeof body.productsEyebrow === "string"
        ? body.productsEyebrow.trim().slice(0, 120)
        : base.productsEyebrow,
    productsTitleAll:
      typeof body.productsTitleAll === "string"
        ? body.productsTitleAll.trim().slice(0, 200)
        : base.productsTitleAll,
    productsCategoryTitleTemplate:
      typeof body.productsCategoryTitleTemplate === "string"
        ? body.productsCategoryTitleTemplate.trim().slice(0, 200)
        : base.productsCategoryTitleTemplate,
    productsIntro:
      typeof body.productsIntro === "string"
        ? body.productsIntro.trim().slice(0, 2000)
        : base.productsIntro,
    productsSeoTitle:
      typeof body.productsSeoTitle === "string"
        ? body.productsSeoTitle.trim().slice(0, 120)
        : base.productsSeoTitle,
    productsSeoDescription:
      typeof body.productsSeoDescription === "string"
        ? body.productsSeoDescription.trim().slice(0, 320)
        : base.productsSeoDescription,
    aboutSeoTitle:
      typeof body.aboutSeoTitle === "string"
        ? body.aboutSeoTitle.trim().slice(0, 120)
        : base.aboutSeoTitle,
    aboutSeoDescription:
      typeof body.aboutSeoDescription === "string"
        ? body.aboutSeoDescription.trim().slice(0, 320)
        : base.aboutSeoDescription,
    aboutEyebrow:
      typeof body.aboutEyebrow === "string"
        ? body.aboutEyebrow.trim().slice(0, 120)
        : base.aboutEyebrow,
    aboutHeroTitle:
      typeof body.aboutHeroTitle === "string"
        ? body.aboutHeroTitle.trim().slice(0, 500)
        : base.aboutHeroTitle,
    aboutHeroLead:
      typeof body.aboutHeroLead === "string"
        ? body.aboutHeroLead.trim().slice(0, 2000)
        : base.aboutHeroLead,
    aboutStoryImageSrc:
      typeof body.aboutStoryImageSrc === "string"
        ? body.aboutStoryImageSrc.trim().slice(0, 2000)
        : base.aboutStoryImageSrc,
    aboutStoryImageAlt:
      typeof body.aboutStoryImageAlt === "string"
        ? body.aboutStoryImageAlt.trim().slice(0, 500)
        : base.aboutStoryImageAlt,
    aboutStoryHeading:
      typeof body.aboutStoryHeading === "string"
        ? body.aboutStoryHeading.trim().slice(0, 200)
        : base.aboutStoryHeading,
    aboutStoryParagraph1:
      typeof body.aboutStoryParagraph1 === "string"
        ? body.aboutStoryParagraph1.trim().slice(0, 4000)
        : base.aboutStoryParagraph1,
    aboutStoryParagraph2:
      typeof body.aboutStoryParagraph2 === "string"
        ? body.aboutStoryParagraph2.trim().slice(0, 4000)
        : base.aboutStoryParagraph2,
    aboutValuesHeading:
      typeof body.aboutValuesHeading === "string"
        ? body.aboutValuesHeading.trim().slice(0, 200)
        : base.aboutValuesHeading,
    aboutValues: Array.isArray(body.aboutValues) ? body.aboutValues : base.aboutValues,
    aboutContactEyebrow:
      typeof body.aboutContactEyebrow === "string"
        ? body.aboutContactEyebrow.trim().slice(0, 120)
        : base.aboutContactEyebrow,
    aboutContactHeading:
      typeof body.aboutContactHeading === "string"
        ? body.aboutContactHeading.trim().slice(0, 200)
        : base.aboutContactHeading,
    aboutContactBusinessName:
      typeof body.aboutContactBusinessName === "string"
        ? body.aboutContactBusinessName.trim().slice(0, 200)
        : base.aboutContactBusinessName,
    aboutContactAddress:
      typeof body.aboutContactAddress === "string"
        ? body.aboutContactAddress.trim().slice(0, 1000)
        : base.aboutContactAddress,
    aboutContactPhoneLabel:
      typeof body.aboutContactPhoneLabel === "string"
        ? body.aboutContactPhoneLabel.trim().slice(0, 80)
        : base.aboutContactPhoneLabel,
    aboutContactPhone:
      typeof body.aboutContactPhone === "string"
        ? body.aboutContactPhone.trim().slice(0, 80)
        : base.aboutContactPhone,
    aboutContactPhoneHref:
      typeof body.aboutContactPhoneHref === "string"
        ? body.aboutContactPhoneHref.trim().slice(0, 120)
        : base.aboutContactPhoneHref,
    aboutMapEmbedUrl:
      typeof body.aboutMapEmbedUrl === "string"
        ? body.aboutMapEmbedUrl.trim().slice(0, 2000)
        : base.aboutMapEmbedUrl,
    aboutCtaHeading:
      typeof body.aboutCtaHeading === "string"
        ? body.aboutCtaHeading.trim().slice(0, 200)
        : base.aboutCtaHeading,
    aboutCtaBody:
      typeof body.aboutCtaBody === "string"
        ? body.aboutCtaBody.trim().slice(0, 2000)
        : base.aboutCtaBody,
    aboutCtaLabel:
      typeof body.aboutCtaLabel === "string"
        ? body.aboutCtaLabel.trim().slice(0, 120)
        : base.aboutCtaLabel,
    aboutCtaHref:
      typeof body.aboutCtaHref === "string"
        ? body.aboutCtaHref.trim().slice(0, 500)
        : base.aboutCtaHref,
    contactSeoTitle:
      typeof body.contactSeoTitle === "string"
        ? body.contactSeoTitle.trim().slice(0, 120)
        : base.contactSeoTitle,
    contactSeoDescription:
      typeof body.contactSeoDescription === "string"
        ? body.contactSeoDescription.trim().slice(0, 320)
        : base.contactSeoDescription,
    contactEyebrow:
      typeof body.contactEyebrow === "string"
        ? body.contactEyebrow.trim().slice(0, 120)
        : base.contactEyebrow,
    contactHeroTitle:
      typeof body.contactHeroTitle === "string"
        ? body.contactHeroTitle.trim().slice(0, 200)
        : base.contactHeroTitle,
    contactHeroLead:
      typeof body.contactHeroLead === "string"
        ? body.contactHeroLead.trim().slice(0, 2000)
        : base.contactHeroLead,
    contactVisitCardHeading:
      typeof body.contactVisitCardHeading === "string"
        ? body.contactVisitCardHeading.trim().slice(0, 120)
        : base.contactVisitCardHeading,
    contactVisitAddress:
      typeof body.contactVisitAddress === "string"
        ? body.contactVisitAddress.trim().slice(0, 1000)
        : base.contactVisitAddress,
    contactHoursLabel:
      typeof body.contactHoursLabel === "string"
        ? body.contactHoursLabel.trim().slice(0, 80)
        : base.contactHoursLabel,
    contactHoursText:
      typeof body.contactHoursText === "string"
        ? body.contactHoursText.trim().slice(0, 200)
        : base.contactHoursText,
    contactReachCardHeading:
      typeof body.contactReachCardHeading === "string"
        ? body.contactReachCardHeading.trim().slice(0, 120)
        : base.contactReachCardHeading,
    contactPhone:
      typeof body.contactPhone === "string"
        ? body.contactPhone.trim().slice(0, 80)
        : base.contactPhone,
    contactPhoneHref:
      typeof body.contactPhoneHref === "string"
        ? body.contactPhoneHref.trim().slice(0, 120)
        : base.contactPhoneHref,
    contactEmail:
      typeof body.contactEmail === "string"
        ? body.contactEmail.trim().slice(0, 120)
        : base.contactEmail,
    contactEmailHref:
      typeof body.contactEmailHref === "string"
        ? body.contactEmailHref.trim().slice(0, 320)
        : base.contactEmailHref,
    contactFooterLead:
      typeof body.contactFooterLead === "string"
        ? body.contactFooterLead.trim().slice(0, 300)
        : base.contactFooterLead,
    contactFooterLinkText:
      typeof body.contactFooterLinkText === "string"
        ? body.contactFooterLinkText.trim().slice(0, 120)
        : base.contactFooterLinkText,
    contactFooterLinkHref:
      typeof body.contactFooterLinkHref === "string"
        ? body.contactFooterLinkHref.trim().slice(0, 500)
        : base.contactFooterLinkHref,
  };
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const settings = await getResolvedSiteSettings();
    return NextResponse.json(settings);
  } catch (e) {
    console.error("[admin-site-settings:get]", e);
    return NextResponse.json({ error: "Could not load settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = (await request.json()) as Partial<Record<string, unknown>>;
    const base = await getResolvedSiteSettings();
    const merged = mergePatch(base, {
      brandLogoSrc: body.brandLogoSrc as string | undefined,
      brandLogoAlt: body.brandLogoAlt as string | undefined,
      brandFaviconSrc: body.brandFaviconSrc as string | undefined,
      brandSiteTitleDefault: body.brandSiteTitleDefault as string | undefined,
      brandSiteTitleTemplate: body.brandSiteTitleTemplate as string | undefined,
      fabricImageSrc: body.fabricImageSrc as string | undefined,
      fabricImageAlt: body.fabricImageAlt as string | undefined,
      fabricTitle: body.fabricTitle as string | undefined,
      fabricSubtitle: body.fabricSubtitle as string | undefined,
      heroEyebrow: body.heroEyebrow as string | undefined,
      heroTitlePrimary: body.heroTitlePrimary as string | undefined,
      heroTitleAccent: body.heroTitleAccent as string | undefined,
      heroSubtitle: body.heroSubtitle as string | undefined,
      heroSlides: body.heroSlides as HeroSlide[] | undefined,
      featuredEyebrow: body.featuredEyebrow as string | undefined,
      featuredTitleLead: body.featuredTitleLead as string | undefined,
      featuredTitleAccent: body.featuredTitleAccent as string | undefined,
      featuredSubtitle: body.featuredSubtitle as string | undefined,
      featuredCtaLabel: body.featuredCtaLabel as string | undefined,
      featuredCtaHref: body.featuredCtaHref as string | undefined,
      featuredProductLimit: body.featuredProductLimit as number | undefined,
      featuredEmptyTitle: body.featuredEmptyTitle as string | undefined,
      featuredEmptyBody: body.featuredEmptyBody as string | undefined,
      productsEyebrow: body.productsEyebrow as string | undefined,
      productsTitleAll: body.productsTitleAll as string | undefined,
      productsCategoryTitleTemplate: body.productsCategoryTitleTemplate as string | undefined,
      productsIntro: body.productsIntro as string | undefined,
      productsSeoTitle: body.productsSeoTitle as string | undefined,
      productsSeoDescription: body.productsSeoDescription as string | undefined,
      aboutSeoTitle: body.aboutSeoTitle as string | undefined,
      aboutSeoDescription: body.aboutSeoDescription as string | undefined,
      aboutEyebrow: body.aboutEyebrow as string | undefined,
      aboutHeroTitle: body.aboutHeroTitle as string | undefined,
      aboutHeroLead: body.aboutHeroLead as string | undefined,
      aboutStoryImageSrc: body.aboutStoryImageSrc as string | undefined,
      aboutStoryImageAlt: body.aboutStoryImageAlt as string | undefined,
      aboutStoryHeading: body.aboutStoryHeading as string | undefined,
      aboutStoryParagraph1: body.aboutStoryParagraph1 as string | undefined,
      aboutStoryParagraph2: body.aboutStoryParagraph2 as string | undefined,
      aboutValuesHeading: body.aboutValuesHeading as string | undefined,
      aboutValues: body.aboutValues as AboutValueBlock[] | undefined,
      aboutContactEyebrow: body.aboutContactEyebrow as string | undefined,
      aboutContactHeading: body.aboutContactHeading as string | undefined,
      aboutContactBusinessName: body.aboutContactBusinessName as string | undefined,
      aboutContactAddress: body.aboutContactAddress as string | undefined,
      aboutContactPhoneLabel: body.aboutContactPhoneLabel as string | undefined,
      aboutContactPhone: body.aboutContactPhone as string | undefined,
      aboutContactPhoneHref: body.aboutContactPhoneHref as string | undefined,
      aboutMapEmbedUrl: body.aboutMapEmbedUrl as string | undefined,
      aboutCtaHeading: body.aboutCtaHeading as string | undefined,
      aboutCtaBody: body.aboutCtaBody as string | undefined,
      aboutCtaLabel: body.aboutCtaLabel as string | undefined,
      aboutCtaHref: body.aboutCtaHref as string | undefined,
      contactSeoTitle: body.contactSeoTitle as string | undefined,
      contactSeoDescription: body.contactSeoDescription as string | undefined,
      contactEyebrow: body.contactEyebrow as string | undefined,
      contactHeroTitle: body.contactHeroTitle as string | undefined,
      contactHeroLead: body.contactHeroLead as string | undefined,
      contactVisitCardHeading: body.contactVisitCardHeading as string | undefined,
      contactVisitAddress: body.contactVisitAddress as string | undefined,
      contactHoursLabel: body.contactHoursLabel as string | undefined,
      contactHoursText: body.contactHoursText as string | undefined,
      contactReachCardHeading: body.contactReachCardHeading as string | undefined,
      contactPhone: body.contactPhone as string | undefined,
      contactPhoneHref: body.contactPhoneHref as string | undefined,
      contactEmail: body.contactEmail as string | undefined,
      contactEmailHref: body.contactEmailHref as string | undefined,
      contactFooterLead: body.contactFooterLead as string | undefined,
      contactFooterLinkText: body.contactFooterLinkText as string | undefined,
      contactFooterLinkHref: body.contactFooterLinkHref as string | undefined,
    });

    if (!isAllowedImageSrc(merged.brandLogoSrc)) {
      return NextResponse.json(
        { error: "Brand logo URL must start with / or http(s)://" },
        { status: 400 },
      );
    }
    if (!isAllowedImageSrc(merged.brandFaviconSrc)) {
      return NextResponse.json(
        { error: "Favicon URL must start with / or http(s)://" },
        { status: 400 },
      );
    }
    if (!merged.brandSiteTitleDefault.trim()) {
      return NextResponse.json(
        { error: "Default browser tab title is required" },
        { status: 400 },
      );
    }
    if (!merged.brandSiteTitleTemplate.includes("%s")) {
      return NextResponse.json(
        {
          error:
            'Browser title template must include %s for the page name (example: "%s | My shop")',
        },
        { status: 400 },
      );
    }

    if (!isAllowedImageSrc(merged.fabricImageSrc)) {
      return NextResponse.json(
        { error: "Fabric image URL must start with / or http(s)://" },
        { status: 400 },
      );
    }

    const slidesCheck = parseHeroSlides(merged.heroSlides);
    if (!slidesCheck.ok) {
      return NextResponse.json({ error: slidesCheck.error }, { status: 400 });
    }
    merged.heroSlides = slidesCheck.slides;

    if (!merged.fabricTitle.trim()) {
      return NextResponse.json({ error: "Fabric title is required" }, { status: 400 });
    }
    if (!merged.fabricSubtitle.trim()) {
      return NextResponse.json({ error: "Fabric subtitle / body is required" }, { status: 400 });
    }
    if (!merged.heroEyebrow.trim()) {
      return NextResponse.json({ error: "Hero eyebrow line is required" }, { status: 400 });
    }
    if (!merged.heroTitlePrimary.trim() || !merged.heroTitleAccent.trim()) {
      return NextResponse.json({ error: "Hero headline lines are required" }, { status: 400 });
    }
    if (!merged.heroSubtitle.trim()) {
      return NextResponse.json({ error: "Hero intro paragraph is required" }, { status: 400 });
    }

    if (!merged.featuredEyebrow.trim()) {
      return NextResponse.json({ error: "Featured section eyebrow is required" }, { status: 400 });
    }
    if (!merged.featuredTitleLead.trim() || !merged.featuredTitleAccent.trim()) {
      return NextResponse.json(
        { error: "Featured heading (both lines) is required" },
        { status: 400 },
      );
    }
    if (!merged.featuredSubtitle.trim()) {
      return NextResponse.json({ error: "Featured section description is required" }, { status: 400 });
    }
    if (!merged.featuredCtaLabel.trim()) {
      return NextResponse.json({ error: "Featured CTA label is required" }, { status: 400 });
    }
    if (!isInternalHref(merged.featuredCtaHref)) {
      return NextResponse.json(
        { error: "Featured CTA link must be an internal path starting with /" },
        { status: 400 },
      );
    }
    if (!merged.featuredEmptyTitle.trim() || !merged.featuredEmptyBody.trim()) {
      return NextResponse.json(
        { error: "Featured empty-state title and message are required" },
        { status: 400 },
      );
    }

    if (!merged.productsTitleAll.trim()) {
      return NextResponse.json(
        { error: "Products page title (all products) is required" },
        { status: 400 },
      );
    }
    if (!merged.productsCategoryTitleTemplate.includes("{category}")) {
      return NextResponse.json(
        {
          error:
            'Category title template must include the placeholder {category} (e.g. "{category} products")',
        },
        { status: 400 },
      );
    }
    if (!merged.productsIntro.trim()) {
      return NextResponse.json(
        { error: "Products page intro paragraph is required" },
        { status: 400 },
      );
    }
    if (!merged.productsSeoTitle.trim()) {
      return NextResponse.json(
        { error: "Products SEO browser title is required" },
        { status: 400 },
      );
    }
    if (!merged.productsSeoDescription.trim()) {
      return NextResponse.json(
        { error: "Products SEO meta description is required" },
        { status: 400 },
      );
    }

    if (!isAllowedImageSrc(merged.aboutStoryImageSrc)) {
      return NextResponse.json(
        { error: "About story image URL must start with / or http(s)://" },
        { status: 400 },
      );
    }
    const aboutValuesCheck = parseAboutValues(merged.aboutValues);
    if (!aboutValuesCheck.ok) {
      return NextResponse.json({ error: aboutValuesCheck.error }, { status: 400 });
    }
    merged.aboutValues = aboutValuesCheck.values;

    if (!merged.aboutSeoTitle.trim() || !merged.aboutSeoDescription.trim()) {
      return NextResponse.json(
        { error: "About SEO title and description are required" },
        { status: 400 },
      );
    }
    if (!merged.aboutHeroTitle.trim() || !merged.aboutHeroLead.trim()) {
      return NextResponse.json(
        { error: "About hero title and lead paragraph are required" },
        { status: 400 },
      );
    }
    if (!merged.aboutStoryImageAlt.trim()) {
      return NextResponse.json(
        { error: "About story image alt text is required" },
        { status: 400 },
      );
    }
    if (!merged.aboutStoryHeading.trim() || !merged.aboutStoryParagraph1.trim()) {
      return NextResponse.json(
        { error: "About story heading and first paragraph are required" },
        { status: 400 },
      );
    }
    if (!merged.aboutValuesHeading.trim()) {
      return NextResponse.json(
        { error: "About values section heading is required" },
        { status: 400 },
      );
    }
    if (
      !merged.aboutContactHeading.trim() ||
      !merged.aboutContactBusinessName.trim() ||
      !merged.aboutContactAddress.trim()
    ) {
      return NextResponse.json(
        { error: "About contact heading, business name, and address are required" },
        { status: 400 },
      );
    }
    if (!merged.aboutContactPhone.trim() || !isTelHref(merged.aboutContactPhoneHref)) {
      return NextResponse.json(
        { error: "Phone display and a valid tel: link (e.g. tel:+94123456789) are required" },
        { status: 400 },
      );
    }
    if (!merged.aboutContactPhoneLabel.trim()) {
      return NextResponse.json(
        { error: "Phone label (e.g. Mobile) is required" },
        { status: 400 },
      );
    }
    if (!isHttpsEmbedUrl(merged.aboutMapEmbedUrl)) {
      return NextResponse.json(
        {
          error:
            "Map embed URL must be a full https:// link with no spaces (paste from Google Maps embed)",
        },
        { status: 400 },
      );
    }
    if (!merged.aboutCtaHeading.trim() || !merged.aboutCtaBody.trim() || !merged.aboutCtaLabel.trim()) {
      return NextResponse.json(
        { error: "About bottom CTA heading, text, and button label are required" },
        { status: 400 },
      );
    }
    if (!isInternalHref(merged.aboutCtaHref)) {
      return NextResponse.json(
        { error: "About CTA link must be an internal path starting with /" },
        { status: 400 },
      );
    }

    if (!merged.contactSeoTitle.trim() || !merged.contactSeoDescription.trim()) {
      return NextResponse.json(
        { error: "Contact SEO title and description are required" },
        { status: 400 },
      );
    }
    if (!merged.contactHeroTitle.trim() || !merged.contactHeroLead.trim()) {
      return NextResponse.json(
        { error: "Contact page title and intro are required" },
        { status: 400 },
      );
    }
    if (
      !merged.contactVisitCardHeading.trim() ||
      !merged.contactVisitAddress.trim() ||
      !merged.contactHoursLabel.trim() ||
      !merged.contactHoursText.trim()
    ) {
      return NextResponse.json(
        { error: "Visit card heading, address, hours label, and hours text are required" },
        { status: 400 },
      );
    }
    if (!merged.contactReachCardHeading.trim()) {
      return NextResponse.json(
        { error: "Phone & email card heading is required" },
        { status: 400 },
      );
    }
    if (!merged.contactPhone.trim() || !isTelHref(merged.contactPhoneHref)) {
      return NextResponse.json(
        { error: "Phone display and a valid tel: link are required on the contact page" },
        { status: 400 },
      );
    }
    if (!merged.contactEmail.trim() || !isMailtoHref(merged.contactEmailHref)) {
      return NextResponse.json(
        { error: "Email display and a valid mailto: link are required" },
        { status: 400 },
      );
    }
    const hasFooterLink =
      merged.contactFooterLinkText.trim().length > 0 ||
      merged.contactFooterLinkHref.trim().length > 0;
    if (hasFooterLink) {
      if (!merged.contactFooterLinkText.trim() || !merged.contactFooterLinkHref.trim()) {
        return NextResponse.json(
          {
            error:
              "Footer link: provide both link text and an internal path, or clear both to hide the link",
          },
          { status: 400 },
        );
      }
      if (!isInternalHref(merged.contactFooterLinkHref)) {
        return NextResponse.json(
          { error: "Footer link must be an internal path starting with /" },
          { status: 400 },
        );
      }
    }

    const fabricImageAlt =
      merged.fabricImageAlt.trim() || DEFAULT_SITE_SETTINGS.fabricImageAlt;
    const brandLogoAlt =
      merged.brandLogoAlt.trim() || DEFAULT_SITE_SETTINGS.brandLogoAlt;

    await connectDB();
    await SiteSettings.findOneAndUpdate(
      { key: SITE_SETTINGS_KEY },
      {
        key: SITE_SETTINGS_KEY,
        brandLogoSrc: merged.brandLogoSrc,
        brandLogoAlt,
        brandFaviconSrc: merged.brandFaviconSrc,
        brandSiteTitleDefault: merged.brandSiteTitleDefault,
        brandSiteTitleTemplate: merged.brandSiteTitleTemplate,
        fabricImageSrc: merged.fabricImageSrc,
        fabricImageAlt,
        fabricTitle: merged.fabricTitle,
        fabricSubtitle: merged.fabricSubtitle,
        heroEyebrow: merged.heroEyebrow,
        heroTitlePrimary: merged.heroTitlePrimary,
        heroTitleAccent: merged.heroTitleAccent,
        heroSubtitle: merged.heroSubtitle,
        heroSlides: merged.heroSlides,
        featuredEyebrow: merged.featuredEyebrow,
        featuredTitleLead: merged.featuredTitleLead,
        featuredTitleAccent: merged.featuredTitleAccent,
        featuredSubtitle: merged.featuredSubtitle,
        featuredCtaLabel: merged.featuredCtaLabel,
        featuredCtaHref: merged.featuredCtaHref,
        featuredProductLimit: merged.featuredProductLimit,
        featuredEmptyTitle: merged.featuredEmptyTitle,
        featuredEmptyBody: merged.featuredEmptyBody,
        productsEyebrow: merged.productsEyebrow,
        productsTitleAll: merged.productsTitleAll,
        productsCategoryTitleTemplate: merged.productsCategoryTitleTemplate,
        productsIntro: merged.productsIntro,
        productsSeoTitle: merged.productsSeoTitle,
        productsSeoDescription: merged.productsSeoDescription,
        aboutSeoTitle: merged.aboutSeoTitle,
        aboutSeoDescription: merged.aboutSeoDescription,
        aboutEyebrow: merged.aboutEyebrow,
        aboutHeroTitle: merged.aboutHeroTitle,
        aboutHeroLead: merged.aboutHeroLead,
        aboutStoryImageSrc: merged.aboutStoryImageSrc,
        aboutStoryImageAlt: merged.aboutStoryImageAlt.trim() || DEFAULT_SITE_SETTINGS.aboutStoryImageAlt,
        aboutStoryHeading: merged.aboutStoryHeading,
        aboutStoryParagraph1: merged.aboutStoryParagraph1,
        aboutStoryParagraph2: merged.aboutStoryParagraph2,
        aboutValuesHeading: merged.aboutValuesHeading,
        aboutValues: merged.aboutValues,
        aboutContactEyebrow: merged.aboutContactEyebrow,
        aboutContactHeading: merged.aboutContactHeading,
        aboutContactBusinessName: merged.aboutContactBusinessName,
        aboutContactAddress: merged.aboutContactAddress,
        aboutContactPhoneLabel: merged.aboutContactPhoneLabel,
        aboutContactPhone: merged.aboutContactPhone,
        aboutContactPhoneHref: merged.aboutContactPhoneHref,
        aboutMapEmbedUrl: merged.aboutMapEmbedUrl,
        aboutCtaHeading: merged.aboutCtaHeading,
        aboutCtaBody: merged.aboutCtaBody,
        aboutCtaLabel: merged.aboutCtaLabel,
        aboutCtaHref: merged.aboutCtaHref,
        contactSeoTitle: merged.contactSeoTitle,
        contactSeoDescription: merged.contactSeoDescription,
        contactEyebrow: merged.contactEyebrow,
        contactHeroTitle: merged.contactHeroTitle,
        contactHeroLead: merged.contactHeroLead,
        contactVisitCardHeading: merged.contactVisitCardHeading,
        contactVisitAddress: merged.contactVisitAddress,
        contactHoursLabel: merged.contactHoursLabel,
        contactHoursText: merged.contactHoursText,
        contactReachCardHeading: merged.contactReachCardHeading,
        contactPhone: merged.contactPhone,
        contactPhoneHref: merged.contactPhoneHref,
        contactEmail: merged.contactEmail,
        contactEmailHref: merged.contactEmailHref,
        contactFooterLead: merged.contactFooterLead,
        contactFooterLinkText: merged.contactFooterLinkText,
        contactFooterLinkHref: merged.contactFooterLinkHref,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();

    const settings = await getResolvedSiteSettings();
    return NextResponse.json({ ok: true, settings });
  } catch (e) {
    console.error("[admin-site-settings:patch]", e);
    return NextResponse.json({ error: "Could not save settings" }, { status: 500 });
  }
}
