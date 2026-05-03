"use client";

import Image from "next/image";
import Link from "next/link";
import { brandImageUnoptimized, useBrandAssets } from "@/components/BrandAssetsProvider";
import { useLocale } from "@/components/LocaleProvider";

/** Developer credit in the copyright row — tap to call this number on mobile. */
const DEVELOPER_PHONE_HREF = "tel:+94761913533";

export function Footer() {
  const { t } = useLocale();
  const {
    logoSrc,
    logoAlt,
    footerVisitAddress,
    footerPhone,
    footerPhoneHref,
    footerEmail,
    footerEmailHref,
  } = useBrandAssets();
  const year = new Date().getFullYear();
  const brandAlt = logoAlt.trim() ? logoAlt.trim() : t("nav.brandAlt");
  const logoUnopt = brandImageUnoptimized(logoSrc);
  const showEmail = footerEmail.trim().length > 0 && footerEmailHref.trim().length > 0;

  return (
    <footer className="mt-auto border-t border-white/10 bg-[var(--ink)] text-zinc-300">
      <div className="grid w-full gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center">
            <Image
              src={logoSrc}
              alt={brandAlt}
              width={120}
              height={40}
              className="h-9 w-auto max-w-[180px]"
              unoptimized={logoUnopt}
            />
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">{t("footer.tagline")}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">{t("footer.explore")}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="hover:text-white" href="/">
                {t("nav.home")}
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/about">
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/products">
                {t("nav.products")}
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/contact">
                {t("nav.contact")}
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/cart">
                {t("nav.cart")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">{t("footer.contact")}</p>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
            {footerVisitAddress.trim() || "—"}
          </p>
          <p className="mt-3 text-sm">
            <a
              href={footerPhoneHref.trim() || "#"}
              className="font-medium text-zinc-200 hover:text-white"
            >
              {footerPhone.trim() || "—"}
            </a>
          </p>
          {showEmail ? (
            <p className="mt-2 text-sm">
              <a
                href={footerEmailHref.trim()}
                className="font-medium text-zinc-200 underline-offset-2 hover:text-white hover:underline"
              >
                {footerEmail.trim()}
              </a>
            </p>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-center text-xs leading-relaxed text-zinc-500">
        <span>
          © {year} nadee-textile. {t("footer.rights")}
        </span>
        <span className="mx-1.5 text-zinc-600" aria-hidden>
          ·
        </span>
        <a
          href={DEVELOPER_PHONE_HREF}
          className="text-zinc-400 underline decoration-zinc-600 underline-offset-2 transition hover:text-white"
        >
          Developed by Lakshitha Madushanka
        </a>
      </div>
    </footer>
  );
}
