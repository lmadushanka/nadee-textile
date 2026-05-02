import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
      className={`${display.variable} ${sans.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--paper)] text-[var(--ink)]">
        <AppSessionProvider>
          <ToastProvider>
            <Header />
            <MainTopClearance>{children}</MainTopClearance>
            <Footer />
          </ToastProvider>
        </AppSessionProvider>
      </body>
    </html>
  );
}
