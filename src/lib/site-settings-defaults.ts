/**
 * Shared defaults + types for site-wide home content (no Mongo / Node-only deps).
 * Client components must import from this file only — not `site-settings.ts`.
 */

export type HeroSlide = { src: string; alt: string };

/** Hero carousel length limits (admin + API validation). */
export const HERO_SLIDES_CONSTRAINTS = { min: 1, max: 6 } as const;

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=2400&q=80",
    alt: "Fashion retail floor with clothing displays",
  },
  {
    src: "https://images.unsplash.com/photo-1467043198406-dc953a3defa7?auto=format&fit=crop&w=2400&q=80",
    alt: "Garments and apparel on display",
  },
  {
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=80",
    alt: "Studio rail of garments and textiles",
  },
  {
    src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=2400&q=80",
    alt: "Apparel product and fabric detail",
  },
];

/** How many featured products to show on the home grid (admin + API). */
export const FEATURED_PRODUCT_LIMIT_RANGE = { min: 1, max: 12 } as const;

/** “What we stand for” blocks on `/about`. */
export const ABOUT_VALUES_CONSTRAINTS = { min: 1, max: 6 } as const;

/** Admin-edited list of size labels (new product form + display order on product pages). */
export const DEFAULT_PRODUCT_SIZE_CATALOG = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const PRODUCT_SIZE_CATALOG_CONSTRAINTS = {
  maxLabels: 48,
  maxLabelLength: 32,
} as const;

/** How size options render on the product detail add-to-cart block. */
export const PRODUCT_SIZE_DISPLAY_STYLES = ["table", "chips"] as const;
export type ProductSizeDisplayStyle = (typeof PRODUCT_SIZE_DISPLAY_STYLES)[number];

export function parseProductSizeDisplayStyle(raw: unknown): ProductSizeDisplayStyle {
  const s = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (s === "table") return "table";
  return "chips";
}

export function parseProductSizeCatalog(raw: unknown): string[] {
  const fallback = [...DEFAULT_PRODUCT_SIZE_CATALOG];
  if (!Array.isArray(raw) || raw.length === 0) return fallback;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const s =
      typeof item === "string"
        ? item.trim().slice(0, PRODUCT_SIZE_CATALOG_CONSTRAINTS.maxLabelLength)
        : "";
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= PRODUCT_SIZE_CATALOG_CONSTRAINTS.maxLabels) break;
  }
  return out.length > 0 ? out : fallback;
}

/** Order a product’s sizes to match the admin catalog (table rows follow this order). */
export function orderProductSizesForDisplay(sizes: string[], catalog: string[]): string[] {
  if (sizes.length === 0) return [];
  const rank = new Map<string, number>();
  catalog.forEach((label, i) => {
    const k = label.trim().toLowerCase();
    if (k && !rank.has(k)) rank.set(k, i);
  });
  return [...sizes].sort((a, b) => {
    const ka = a.trim().toLowerCase();
    const kb = b.trim().toLowerCase();
    const ra = rank.get(ka);
    const rb = rank.get(kb);
    if (ra !== undefined && rb !== undefined) return ra - rb;
    if (ra !== undefined) return -1;
    if (rb !== undefined) return 1;
    return a.localeCompare(b, undefined, { sensitivity: "base" });
  });
}

export type AboutValueBlock = { title: string; body: string };

export type ResolvedSiteSettings = {
  /** Header / footer logo image URL (`/` path or `https://`). */
  brandLogoSrc: string;
  /** Accessible name for the logo (shown when set; otherwise UI falls back to i18n). */
  brandLogoAlt: string;
  /** Site favicon URL (`/` path or `https://`). */
  brandFaviconSrc: string;
  /** Default `<title>` for the home tab and site-wide fallback. */
  brandSiteTitleDefault: string;
  /**
   * Next.js title template for inner pages. Must include `%s` where the page title is inserted
   * (e.g. `%s | nadee-textile`).
   */
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
  /** Small label above the main products page heading (e.g. “Catalog”). */
  productsEyebrow: string;
  /** `<h1>` when viewing all products (no category filter). */
  productsTitleAll: string;
  /** Title when a category is selected; must include `{category}` (replaced with the category name). */
  productsCategoryTitleTemplate: string;
  /** Intro paragraph under the title on `/products`. */
  productsIntro: string;
  /** `<title>` / tab title for the products listing page. */
  productsSeoTitle: string;
  /** Meta description for `/products`. */
  productsSeoDescription: string;
  /** Size labels offered when creating products in Admin (comma / custom sizes still work in product list). */
  productSizeCatalog: string[];
  /** Size picker layout on product detail (`table` = rows; `chips` = pills). */
  productSizeDisplayStyle: ProductSizeDisplayStyle;
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
};

export const DEFAULT_SITE_SETTINGS: ResolvedSiteSettings = {
  brandLogoSrc: "/logo.png",
  brandLogoAlt: "Nadee Textile",
  brandFaviconSrc: "/icon.ico",
  brandSiteTitleDefault: "nadee-textile | Garments & apparel",
  brandSiteTitleTemplate: "%s | nadee-textile",
  fabricImageSrc: "/img1.jpeg",
  fabricImageAlt: "Fabric and tailoring",
  fabricTitle: "Fabric-first mindset",
  fabricSubtitle:
    "We care how garments look and how they last. From drape and breathability to shape retention after many washes, each piece is selected for real-world wear.",
  heroEyebrow: "The future of fabric begins here",
  heroTitlePrimary: "Global perspective",
  heroTitleAccent: "Nadee textile industry",
  heroSubtitle:
    "Since day one, Nadee Textile has focused on honest garments and dependable production—from fabric selection through finishing—so retailers and customers get pieces that look right, feel right, and hold up to real life.",
  heroSlides: DEFAULT_HERO_SLIDES.map((s) => ({ ...s })),
  featuredEyebrow: "Handpicked",
  featuredTitleLead: "Featured",
  featuredTitleAccent: "pieces",
  featuredSubtitle:
    "A rotating spotlight on standout styles from your catalog—chosen for craft, fit, and everyday appeal.",
  featuredCtaLabel: "View full collection",
  featuredCtaHref: "/products",
  featuredProductLimit: 3,
  featuredEmptyTitle: "Your showroom is ready",
  featuredEmptyBody:
    "Mark products as featured in Admin, or seed sample data—then this grid fills with rich cards automatically.\n\nRun npm run seed from the project root, then refresh.",
  productsEyebrow: "Catalog",
  productsTitleAll: "Products",
  productsCategoryTitleTemplate: "{category} products",
  productsIntro:
    "Every item below is loaded from your nadee-textile MongoDB database via Next.js—add more documents to grow this grid.",
  productsSeoTitle: "Products",
  productsSeoDescription:
    "Browse nadee-textile garments—shirts, knitwear, outerwear, and basics from our MongoDB catalog.",
  productSizeCatalog: [...DEFAULT_PRODUCT_SIZE_CATALOG],
  productSizeDisplayStyle: "chips",
  aboutSeoTitle: "About",
  aboutSeoDescription:
    "Learn about nadee-textile—our story, how we work with materials, and what we stand for in garments and apparel.",
  aboutEyebrow: "About nadee-textile",
  aboutHeroTitle:
    "We sell clothes the way we would want to buy them—clear, honest, and built to wear.",
  aboutHeroLead:
    "nadee-textile is a garments-focused business: shirts, knitwear, outerwear, and everyday basics chosen for comfort, fit, and longevity. Whether you are stocking a rail or refreshing your own wardrobe, we aim to make the decision easy.",
  aboutStoryImageSrc: "/img2.jpeg",
  aboutStoryImageAlt: "Nadee Textile — our store and garments",
  aboutStoryHeading: "Our story",
  aboutStoryParagraph1:
    "nadee-textile started from a simple frustration: too much fashion noise, not enough dependable pieces. We focus on textiles that feel right on the skin, silhouettes that work across seasons, and pricing that respects both the maker and the buyer.",
  aboutStoryParagraph2:
    "Today we combine that mindset with a modern stack—this site runs on Next.js with product data living in MongoDB under the nadee-textile database—so our catalog can grow as we do.",
  aboutValuesHeading: "What we stand for",
  aboutValues: [
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
  ],
  aboutContactEyebrow: "Location & contact",
  aboutContactHeading: "Visit Nadee Textile",
  aboutContactBusinessName: "Nadee Textile",
  aboutContactAddress: "No 2/A, Yaya 7,\nMorakatiya,\nEmbilipitiya",
  aboutContactPhoneLabel: "Mobile",
  aboutContactPhone: "074 198 0433",
  aboutContactPhoneHref: "tel:+94741980433",
  aboutMapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253786.70230188224!2d80.89447129999999!3d6.3399719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae401f4b13c801b%3A0x702c16f9386a94cd!2sNadee%20textile!5e0!3m2!1sen!2slk!4v1777613926800!5m2!1sen!2slk",
  aboutCtaHeading: "Ready to browse the catalog?",
  aboutCtaBody:
    "Head to the products page to see live items from your MongoDB collection.",
  aboutCtaLabel: "View products",
  aboutCtaHref: "/products",
  contactSeoTitle: "Contact",
  contactSeoDescription:
    "Get in touch with Nadee Textile—location, hours, phone, and email for orders and enquiries.",
  contactEyebrow: "Contact us",
  contactHeroTitle: "We are here to help",
  contactHeroLead:
    "Visit the showroom, call us during business hours, or send an email—we will get back to you as soon as we can.",
  contactVisitCardHeading: "Visit",
  contactVisitAddress: "Nadee Textile\nNo 2/A, Yaya 7,\nMorakatiya,\nEmbilipitiya",
  contactHoursLabel: "Hours",
  contactHoursText: "Mon–Friday, 09:00 – 17:00",
  contactReachCardHeading: "Phone & email",
  contactPhone: "074 198 0433",
  contactPhoneHref: "tel:+94741980433",
  contactEmail: "info@nadeetextile.com",
  contactEmailHref: "mailto:info@nadeetextile.com",
  contactFooterLead: "Want to know more about the brand?",
  contactFooterLinkText: "Read our story",
  contactFooterLinkHref: "/about",
};

/** Heading for `/products` when a category chip is selected. */
export function formatProductsCategoryTitle(template: string, categoryName: string): string {
  const t = template.trim();
  if (t.includes("{category}")) {
    return t.replaceAll("{category}", categoryName);
  }
  return `${categoryName} products`;
}

export type BrandAssetsSettings = Pick<
  ResolvedSiteSettings,
  | "brandLogoSrc"
  | "brandLogoAlt"
  | "brandFaviconSrc"
  | "brandSiteTitleDefault"
  | "brandSiteTitleTemplate"
>;

export type FabricSectionSettings = Pick<
  ResolvedSiteSettings,
  "fabricImageSrc" | "fabricImageAlt" | "fabricTitle" | "fabricSubtitle"
>;

export type HomeHeroSettings = Pick<
  ResolvedSiteSettings,
  "heroEyebrow" | "heroTitlePrimary" | "heroTitleAccent" | "heroSubtitle" | "heroSlides"
>;

export type FeaturedPiecesSectionSettings = Pick<
  ResolvedSiteSettings,
  | "featuredEyebrow"
  | "featuredTitleLead"
  | "featuredTitleAccent"
  | "featuredSubtitle"
  | "featuredCtaLabel"
  | "featuredCtaHref"
  | "featuredEmptyTitle"
  | "featuredEmptyBody"
>;

export type ProductsPageSettings = Pick<
  ResolvedSiteSettings,
  | "productsEyebrow"
  | "productsTitleAll"
  | "productsCategoryTitleTemplate"
  | "productsIntro"
  | "productsSeoTitle"
  | "productsSeoDescription"
  | "productSizeCatalog"
  | "productSizeDisplayStyle"
>;

export type AboutPageSettings = Pick<
  ResolvedSiteSettings,
  | "aboutSeoTitle"
  | "aboutSeoDescription"
  | "aboutEyebrow"
  | "aboutHeroTitle"
  | "aboutHeroLead"
  | "aboutStoryImageSrc"
  | "aboutStoryImageAlt"
  | "aboutStoryHeading"
  | "aboutStoryParagraph1"
  | "aboutStoryParagraph2"
  | "aboutValuesHeading"
  | "aboutValues"
  | "aboutContactEyebrow"
  | "aboutContactHeading"
  | "aboutContactBusinessName"
  | "aboutContactAddress"
  | "aboutContactPhoneLabel"
  | "aboutContactPhone"
  | "aboutContactPhoneHref"
  | "aboutMapEmbedUrl"
  | "aboutCtaHeading"
  | "aboutCtaBody"
  | "aboutCtaLabel"
  | "aboutCtaHref"
>;

export type ContactPageSettings = Pick<
  ResolvedSiteSettings,
  | "contactSeoTitle"
  | "contactSeoDescription"
  | "contactEyebrow"
  | "contactHeroTitle"
  | "contactHeroLead"
  | "contactVisitCardHeading"
  | "contactVisitAddress"
  | "contactHoursLabel"
  | "contactHoursText"
  | "contactReachCardHeading"
  | "contactPhone"
  | "contactPhoneHref"
  | "contactEmail"
  | "contactEmailHref"
  | "contactFooterLead"
  | "contactFooterLinkText"
  | "contactFooterLinkHref"
>;
