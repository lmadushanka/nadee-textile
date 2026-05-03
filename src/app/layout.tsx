import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_Sinhala, Noto_Sans_Tamil, Playfair_Display } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrandAssetsProvider } from "@/components/BrandAssetsProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { MainTopClearance } from "@/components/MainTopClearance";
import { AppSessionProvider } from "@/components/AppSessionProvider";
import { ToastProvider } from "@/components/toast";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings-defaults";
import { getResolvedSiteSettingsForLayout } from "@/lib/site-settings";
import "./globals.css";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
});

/** Primary UI font: good Sinhala + Latin for mixed copy site-wide. */
const notoSinhala = Noto_Sans_Sinhala({
  variable: "--font-noto-sinhala",
  subsets: ["latin", "sinhala"],
  weight: ["400", "500", "600", "700"],
});

const notoTamil = Noto_Sans_Tamil({
  variable: "--font-noto-tamil",
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getResolvedSiteSettingsForLayout();
  const fav =
    site.brandFaviconSrc.trim() || DEFAULT_SITE_SETTINGS.brandFaviconSrc;
  const titleDefault =
    site.brandSiteTitleDefault.trim() || DEFAULT_SITE_SETTINGS.brandSiteTitleDefault;
  const titleTemplate =
    site.brandSiteTitleTemplate.trim() || DEFAULT_SITE_SETTINGS.brandSiteTitleTemplate;
  return {
    title: {
      default: titleDefault,
      template: titleTemplate,
    },
    description:
      "nadee-textile—quality clothes and basics for retail and wholesale. Discover shirts, knitwear, outerwear, and more.",
    icons: {
      icon: fav,
      shortcut: fav,
      apple: fav,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = await getResolvedSiteSettingsForLayout();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${notoSinhala.variable} ${notoTamil.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--paper)] text-[var(--ink)]">
        <BrandAssetsProvider
          logoSrc={site.brandLogoSrc}
          logoAlt={site.brandLogoAlt}
          faviconSrc={site.brandFaviconSrc}
          footerVisitAddress={site.contactVisitAddress}
          footerPhone={site.contactPhone}
          footerPhoneHref={site.contactPhoneHref}
          footerEmail={site.contactEmail}
          footerEmailHref={site.contactEmailHref}
        >
          <AppSessionProvider>
            <ToastProvider>
              <LocaleProvider>
                <Header />
                <MainTopClearance>{children}</MainTopClearance>
                <Footer />
              </LocaleProvider>
            </ToastProvider>
          </AppSessionProvider>
        </BrandAssetsProvider>
      </body>
    </html>
  );
}
