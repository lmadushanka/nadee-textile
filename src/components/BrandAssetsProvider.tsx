"use client";

import { createContext, useContext, type ReactNode } from "react";

export type BrandAssets = {
  logoSrc: string;
  logoAlt: string;
  faviconSrc: string;
  /** Visit block (business + address lines) from site contact settings. */
  footerVisitAddress: string;
  footerPhone: string;
  footerPhoneHref: string;
  footerEmail: string;
  footerEmailHref: string;
};

const BrandAssetsContext = createContext<BrandAssets | null>(null);

export function BrandAssetsProvider({
  logoSrc,
  logoAlt,
  faviconSrc,
  footerVisitAddress,
  footerPhone,
  footerPhoneHref,
  footerEmail,
  footerEmailHref,
  children,
}: BrandAssets & { children: ReactNode }) {
  return (
    <BrandAssetsContext.Provider
      value={{
        logoSrc,
        logoAlt,
        faviconSrc,
        footerVisitAddress,
        footerPhone,
        footerPhoneHref,
        footerEmail,
        footerEmailHref,
      }}
    >
      {children}
    </BrandAssetsContext.Provider>
  );
}

export function useBrandAssets(): BrandAssets {
  const ctx = useContext(BrandAssetsContext);
  if (!ctx) {
    throw new Error("useBrandAssets must be used within BrandAssetsProvider");
  }
  return ctx;
}

/** Remote `/` paths are optimized; absolute URLs skip the optimizer. */
export function brandImageUnoptimized(src: string): boolean {
  const s = src.trim();
  return s.length > 0 && !s.startsWith("/");
}
