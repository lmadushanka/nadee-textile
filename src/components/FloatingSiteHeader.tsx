"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CartBadge } from "@/components/CartBadge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";
import { SignOutButton } from "@/components/SignOutButton";

export type FloatingSiteHeaderProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userLabel?: string;
};

/** Main nav order: Home → Products → About → Contact; Orders (when signed in) follows. */
const NAV_KEYS = [
  { key: "nav.home", href: "/" },
  { key: "nav.products", href: "/products" },
  { key: "nav.about", href: "/about" },
  { key: "nav.contact", href: "/contact" },
] as const;

function routeActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const pillNavBase =
  "inline-flex items-center rounded-full px-2.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition xl:px-3.5";
const pillNavIdle = "text-[#1a202c] hover:bg-zinc-100";
const pillNavActive = "bg-[#0c1222] text-white shadow-sm hover:bg-[#151d33]";

const pillNavAdminActive =
  "bg-amber-950 text-white shadow-sm hover:bg-amber-900";

const drawerNavBase =
  "flex border-b border-zinc-100 py-4 text-sm font-bold uppercase tracking-[0.12em]";
const drawerNavIdle = "text-[#0c1222]";
const drawerNavActive = "bg-zinc-100 text-[#0c1222]";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <span className="flex flex-col gap-1">
      <span className="block h-0.5 w-5 rounded-full bg-[#0c1222]" />
      <span className="block h-0.5 w-5 rounded-full bg-[#0c1222]" />
      <span className="block h-0.5 w-5 rounded-full bg-[#0c1222]" />
    </span>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="text-[#0c1222]">
      <path
        fill="currentColor"
        d="M1.41 0L7 5.59 12.59 0 14 1.41 8.41 7 14 12.59 12.59 14 7 8.41 1.41 14 0 12.59 5.59 7 0 1.41z"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#0c1222]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#0c1222]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#0c1222]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#0c1222]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function DrawerSocial({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-[#0c1222] transition hover:border-zinc-300"
    >
      {children}
    </a>
  );
}

export function FloatingSiteHeader({
  isLoggedIn,
  isAdmin,
  userLabel,
}: FloatingSiteHeaderProps) {
  const { t } = useLocale();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const iconBtn =
    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-[#1a202c] transition sm:h-12 sm:w-12";
  const iconBtnIdle = "border-zinc-200 hover:bg-zinc-50";
  const iconBtnActive = "border-[#0c1222] bg-[#0c1222] text-white hover:bg-[#151d33]";

  const brandAlt = t("nav.brandAlt");

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[100] px-2 pt-2 sm:px-3 sm:pt-3 lg:px-4 lg:pt-4">
      <div className="pointer-events-auto flex w-full max-w-none min-h-[3.75rem] items-center gap-2 rounded-[100px] bg-white py-3 pl-3 pr-2 shadow-[0_12px_40px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.06] sm:min-h-[4.25rem] sm:gap-3 sm:py-3.5 sm:pl-5 sm:pr-3 md:pl-6">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center transition hover:opacity-90 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c1222]/30 focus-visible:ring-offset-2"
          aria-current={pathname === "/" ? "page" : undefined}
        >
          <Image
            src="/logo.png"
            alt={brandAlt}
            width={48}
            height={48}
            className="h-11 w-auto sm:h-12"
            priority
          />
        </Link>

        <nav className="ml-1 hidden min-h-0 flex-1 items-center justify-center gap-0.5 lg:flex xl:gap-1">
          {NAV_KEYS.map((item) => {
            const active = routeActive(pathname, item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${pillNavBase} ${active ? pillNavActive : pillNavIdle}`}
              >
                {t(item.key)}
              </Link>
            );
          })}
          {isLoggedIn ? (
            <Link
              href="/orders"
              aria-current={routeActive(pathname, "/orders") ? "page" : undefined}
              className={`${pillNavBase} ${
                routeActive(pathname, "/orders") ? pillNavActive : pillNavIdle
              }`}
            >
              {t("nav.orders")}
            </Link>
          ) : null}
          {isAdmin ? (
            <Link
              href="/admin"
              aria-current={routeActive(pathname, "/admin") ? "page" : undefined}
              className={`${pillNavBase} ${
                routeActive(pathname, "/admin") ? pillNavAdminActive : "text-amber-900 hover:bg-amber-50"
              }`}
            >
              {t("nav.admin")}
            </Link>
          ) : null}
        </nav>

        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/products"
            className={`${iconBtn} ${
              routeActive(pathname, "/products") ? iconBtnActive : iconBtnIdle
            }`}
            aria-label={t("nav.searchCatalog")}
            aria-current={routeActive(pathname, "/products") ? "page" : undefined}
          >
            <SearchIcon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
          </Link>
          <div className="hidden sm:block">
            <CartBadge />
          </div>
          {isLoggedIn ? (
            <span className="hidden max-w-[100px] truncate text-xs text-zinc-500 xl:inline">
              {userLabel}
            </span>
          ) : null}
          {isLoggedIn ? (
            <div className="hidden sm:block [&_button]:rounded-full [&_button]:px-3 [&_button]:py-2.5 [&_button]:text-[#1a202c] [&_button]:hover:bg-zinc-100">
              <SignOutButton />
            </div>
          ) : (
            <>
              <Link
                href="/login"
                aria-current={pathname === "/login" ? "page" : undefined}
                className={`hidden rounded-full px-3 py-2.5 text-xs font-semibold sm:inline ${
                  pathname === "/login" ? pillNavActive : "text-[#1a202c] hover:bg-zinc-100"
                }`}
              >
                {t("nav.logIn")}
              </Link>
              <Link
                href="/register"
                aria-current={pathname === "/register" ? "page" : undefined}
                className={`hidden rounded-full px-3 py-2.5 text-xs font-semibold md:inline ${
                  pathname === "/register"
                    ? pillNavActive
                    : "text-[#1a202c] hover:bg-zinc-100"
                }`}
              >
                {t("nav.register")}
              </Link>
            </>
          )}
          <LanguageSwitcher className="hidden min-[360px]:inline-flex lg:inline-flex" />
          <Link
            href="/contact"
            aria-current={routeActive(pathname, "/contact") ? "page" : undefined}
            className={`inline-flex min-w-0 shrink items-center gap-1.5 rounded-full px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] shadow-sm transition sm:px-6 sm:py-3 sm:text-[11px] ${
              routeActive(pathname, "/contact")
                ? "bg-[#e8d040] text-[#0c1222] ring-2 ring-[#0c1222]/25 hover:bg-[#dfc938]"
                : "bg-[#ffeb7a] text-[#0c1222] hover:bg-[#f5e000]"
            }`}
          >
            <span className="truncate">{t("nav.contactUs")}</span>
            <span aria-hidden className="shrink-0 text-sm leading-none">
              →
            </span>
          </Link>

          <Link
            href="/cart"
            className={`${iconBtn} lg:hidden ${
              routeActive(pathname, "/cart") ? iconBtnActive : iconBtnIdle
            }`}
            aria-label={t("nav.cart")}
            aria-current={routeActive(pathname, "/cart") ? "page" : undefined}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </Link>

          <button
            type="button"
            className={`${iconBtn} lg:hidden`}
            aria-label={t("nav.openMenu")}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {drawerOpen ? (
        <div className="pointer-events-auto fixed inset-0 z-[120] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            aria-label={t("nav.closeMenu")}
            onClick={closeDrawer}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[min(100%,380px)] flex-col bg-white shadow-2xl">
            <div className="flex min-h-[4.25rem] items-center justify-between border-b border-zinc-100 px-5 py-3">
              <Link href="/" className="flex items-center" onClick={closeDrawer}>
                <Image
                  src="/logo.png"
                  alt={brandAlt}
                  width={44}
                  height={44}
                  className="h-11 w-auto"
                />
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#ffeb7a] text-[#0c1222] shadow-sm"
                aria-label={t("nav.close")}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="border-b border-zinc-100 px-5 py-3">
              <LanguageSwitcher variant="block" />
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-2">
              {NAV_KEYS.map((item) => {
                const active = routeActive(pathname, item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={closeDrawer}
                    aria-current={active ? "page" : undefined}
                    className={`${drawerNavBase} ${
                      active ? drawerNavActive : drawerNavIdle
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}

              {isLoggedIn ? (
                <Link
                  href="/orders"
                  onClick={closeDrawer}
                  aria-current={routeActive(pathname, "/orders") ? "page" : undefined}
                  className={`${drawerNavBase} ${
                    routeActive(pathname, "/orders")
                      ? drawerNavActive
                      : drawerNavIdle
                  }`}
                >
                  {t("nav.orders")}
                </Link>
              ) : null}
              {isAdmin ? (
                <Link
                  href="/admin"
                  onClick={closeDrawer}
                  aria-current={routeActive(pathname, "/admin") ? "page" : undefined}
                  className={`${drawerNavBase} ${
                    routeActive(pathname, "/admin")
                      ? `${drawerNavActive} text-amber-950`
                      : "text-amber-900"
                  }`}
                >
                  {t("nav.admin")}
                </Link>
              ) : null}
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login"
                    onClick={closeDrawer}
                    aria-current={pathname === "/login" ? "page" : undefined}
                    className={`${drawerNavBase} ${
                      pathname === "/login" ? drawerNavActive : drawerNavIdle
                    }`}
                  >
                    {t("nav.logIn")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeDrawer}
                    aria-current={pathname === "/register" ? "page" : undefined}
                    className={`${drawerNavBase} ${
                      pathname === "/register" ? drawerNavActive : drawerNavIdle
                    }`}
                  >
                    {t("nav.register")}
                  </Link>
                </>
              ) : (
                <div className="border-b border-zinc-100 py-3 [&_button]:font-bold [&_button]:uppercase [&_button]:tracking-[0.12em]">
                  <SignOutButton />
                </div>
              )}

              <p className="mt-8 text-sm font-bold text-[#0c1222]">{t("drawer.contactInfo")}</p>
              <ul className="mt-4 space-y-4 text-sm text-zinc-600">
                <li className="flex gap-3">
                  <PinIcon />
                  <span>{t("drawer.address")}</span>
                </li>
                <li className="flex gap-3">
                  <MailIcon />
                  <a href="mailto:info@nadeetextile.com" className="hover:text-[#0c1222]">
                    info@nadeetextile.com
                  </a>
                </li>
                <li className="flex gap-3">
                  <ClockIcon />
                  <span>{t("drawer.hours")}</span>
                </li>
                <li className="flex gap-3">
                  <PhoneIcon />
                  <a href="tel:+94741980433" className="font-medium hover:text-[#0c1222]">
                    074 198 0433
                  </a>
                </li>
              </ul>

              <Link
                href="/products"
                onClick={closeDrawer}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#ffeb7a] py-3.5 text-sm font-bold uppercase tracking-wide text-[#0c1222] shadow-sm"
              >
                {t("drawer.shopNow")}
                <span aria-hidden>↗</span>
              </Link>
            </nav>

            <div className="border-t border-zinc-100 px-5 py-5">
              <div className="flex justify-center gap-3">
                <DrawerSocial
                  href="https://web.facebook.com/profile.php?id=61578354034563&sk=about"
                  label="Facebook"
                >
                  <span className="text-sm font-bold">f</span>
                </DrawerSocial>
                <DrawerSocial href="https://twitter.com" label="X">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </DrawerSocial>
                <DrawerSocial href="https://youtube.com" label="YouTube">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </DrawerSocial>
                <DrawerSocial href="https://linkedin.com" label="LinkedIn">
                  <span className="text-xs font-bold">in</span>
                </DrawerSocial>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
