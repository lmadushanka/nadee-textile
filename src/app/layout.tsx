import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_Sinhala, Noto_Sans_Tamil, Playfair_Display } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LocaleProvider } from "@/components/LocaleProvider";
import { MainTopClearance } from "@/components/MainTopClearance";
import { AppSessionProvider } from "@/components/AppSessionProvider";
import { ToastProvider } from "@/components/toast";
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

export const metadata: Metadata = {
  title: {
    default: "nadee-textile | Garments & apparel",
    template: "%s | nadee-textile",
  },
  description:
    "nadee-textile—quality clothes and basics for retail and wholesale. Discover shirts, knitwear, outerwear, and more.",
  icons: {
    icon: "/icon.ico",
    shortcut: "/icon.ico",
    apple: "/icon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${notoSinhala.variable} ${notoTamil.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--paper)] text-[var(--ink)]">
        <AppSessionProvider>
          <ToastProvider>
            <LocaleProvider>
              <Header />
              <MainTopClearance>{children}</MainTopClearance>
              <Footer />
            </LocaleProvider>
          </ToastProvider>
        </AppSessionProvider>
      </body>
    </html>
  );
}
