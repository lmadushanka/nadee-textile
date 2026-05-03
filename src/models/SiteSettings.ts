import { Schema, model, models, type Model } from "mongoose";

export const SITE_SETTINGS_KEY = "default" as const;

const HeroSlideSchema = new Schema(
  {
    src: { type: String, required: true, trim: true, maxlength: 2000 },
    alt: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const AboutValueSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { _id: false },
);

export type SiteSettingsDoc = {
  key: string;
  fabricImageSrc: string;
  fabricImageAlt: string;
  fabricTitle: string;
  fabricSubtitle: string;
  heroEyebrow: string;
  heroTitlePrimary: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  heroSlides: { src: string; alt: string }[];
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
  aboutValues: { title: string; body: string }[];
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
};

const SiteSettingsSchema = new Schema<SiteSettingsDoc>(
  {
    key: { type: String, required: true, unique: true, default: SITE_SETTINGS_KEY },
    fabricImageSrc: { type: String, required: true, trim: true, maxlength: 2000 },
    fabricImageAlt: { type: String, required: true, trim: true, maxlength: 500 },
    fabricTitle: { type: String, required: true, trim: true, maxlength: 400 },
    fabricSubtitle: { type: String, required: true, trim: true, maxlength: 8000 },
    heroEyebrow: { type: String, required: true, trim: true, maxlength: 200 },
    heroTitlePrimary: { type: String, required: true, trim: true, maxlength: 400 },
    heroTitleAccent: { type: String, required: true, trim: true, maxlength: 400 },
    heroSubtitle: { type: String, required: true, trim: true, maxlength: 8000 },
    heroSlides: { type: [HeroSlideSchema], required: true, default: [] },
    featuredEyebrow: { type: String, required: true, trim: true, maxlength: 120 },
    featuredTitleLead: { type: String, required: true, trim: true, maxlength: 120 },
    featuredTitleAccent: { type: String, required: true, trim: true, maxlength: 120 },
    featuredSubtitle: { type: String, required: true, trim: true, maxlength: 2000 },
    featuredCtaLabel: { type: String, required: true, trim: true, maxlength: 120 },
    featuredCtaHref: { type: String, required: true, trim: true, maxlength: 500 },
    featuredProductLimit: { type: Number, required: true, min: 1, max: 12, default: 3 },
    featuredEmptyTitle: { type: String, required: true, trim: true, maxlength: 200 },
    featuredEmptyBody: { type: String, required: true, trim: true, maxlength: 2000 },
    productsEyebrow: { type: String, required: true, trim: true, maxlength: 120 },
    productsTitleAll: { type: String, required: true, trim: true, maxlength: 200 },
    productsCategoryTitleTemplate: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    productsIntro: { type: String, required: true, trim: true, maxlength: 2000 },
    productsSeoTitle: { type: String, required: true, trim: true, maxlength: 120 },
    productsSeoDescription: { type: String, required: true, trim: true, maxlength: 320 },
    aboutSeoTitle: { type: String, required: true, trim: true, maxlength: 120 },
    aboutSeoDescription: { type: String, required: true, trim: true, maxlength: 320 },
    aboutEyebrow: { type: String, required: true, trim: true, maxlength: 120 },
    aboutHeroTitle: { type: String, required: true, trim: true, maxlength: 500 },
    aboutHeroLead: { type: String, required: true, trim: true, maxlength: 2000 },
    aboutStoryImageSrc: { type: String, required: true, trim: true, maxlength: 2000 },
    aboutStoryImageAlt: { type: String, required: true, trim: true, maxlength: 500 },
    aboutStoryHeading: { type: String, required: true, trim: true, maxlength: 200 },
    aboutStoryParagraph1: { type: String, required: true, trim: true, maxlength: 4000 },
    aboutStoryParagraph2: { type: String, required: true, trim: true, maxlength: 4000 },
    aboutValuesHeading: { type: String, required: true, trim: true, maxlength: 200 },
    aboutValues: { type: [AboutValueSchema], required: true, default: [] },
    aboutContactEyebrow: { type: String, required: true, trim: true, maxlength: 120 },
    aboutContactHeading: { type: String, required: true, trim: true, maxlength: 200 },
    aboutContactBusinessName: { type: String, required: true, trim: true, maxlength: 200 },
    aboutContactAddress: { type: String, required: true, trim: true, maxlength: 1000 },
    aboutContactPhoneLabel: { type: String, required: true, trim: true, maxlength: 80 },
    aboutContactPhone: { type: String, required: true, trim: true, maxlength: 80 },
    aboutContactPhoneHref: { type: String, required: true, trim: true, maxlength: 120 },
    aboutMapEmbedUrl: { type: String, required: true, trim: true, maxlength: 2000 },
    aboutCtaHeading: { type: String, required: true, trim: true, maxlength: 200 },
    aboutCtaBody: { type: String, required: true, trim: true, maxlength: 2000 },
    aboutCtaLabel: { type: String, required: true, trim: true, maxlength: 120 },
    aboutCtaHref: { type: String, required: true, trim: true, maxlength: 500 },
    contactSeoTitle: { type: String, required: true, trim: true, maxlength: 120 },
    contactSeoDescription: { type: String, required: true, trim: true, maxlength: 320 },
    contactEyebrow: { type: String, required: true, trim: true, maxlength: 120 },
    contactHeroTitle: { type: String, required: true, trim: true, maxlength: 200 },
    contactHeroLead: { type: String, required: true, trim: true, maxlength: 2000 },
    contactVisitCardHeading: { type: String, required: true, trim: true, maxlength: 120 },
    contactVisitAddress: { type: String, required: true, trim: true, maxlength: 1000 },
    contactHoursLabel: { type: String, required: true, trim: true, maxlength: 80 },
    contactHoursText: { type: String, required: true, trim: true, maxlength: 200 },
    contactReachCardHeading: { type: String, required: true, trim: true, maxlength: 120 },
    contactPhone: { type: String, required: true, trim: true, maxlength: 80 },
    contactPhoneHref: { type: String, required: true, trim: true, maxlength: 120 },
    contactEmail: { type: String, required: true, trim: true, maxlength: 120 },
    contactEmailHref: { type: String, required: true, trim: true, maxlength: 320 },
    contactFooterLead: { type: String, required: true, trim: true, maxlength: 300 },
    contactFooterLinkText: { type: String, required: true, trim: true, maxlength: 120 },
    contactFooterLinkHref: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

const existingSiteSettings = models.SiteSettings as Model<SiteSettingsDoc> | undefined;

// Next.js dev (HMR) can keep an older Mongoose schema in memory. A cached model
// that predates hero/featured paths will strip those keys on findOneAndUpdate,
// so saves appear to work in the API but MongoDB never gets the new fields.
if (
  existingSiteSettings &&
  (!existingSiteSettings.schema.path("heroEyebrow") ||
    !existingSiteSettings.schema.path("heroSlides") ||
    !existingSiteSettings.schema.path("featuredEyebrow") ||
    !existingSiteSettings.schema.path("featuredProductLimit") ||
    !existingSiteSettings.schema.path("productsTitleAll") ||
    !existingSiteSettings.schema.path("aboutHeroTitle") ||
    !existingSiteSettings.schema.path("contactHeroTitle"))
) {
  delete models.SiteSettings;
}

export const SiteSettings =
  (models.SiteSettings as Model<SiteSettingsDoc> | undefined) ??
  model<SiteSettingsDoc>("SiteSettings", SiteSettingsSchema);
