export type AppLocale = "en" | "si" | "ta";

export const DEFAULT_LOCALE: AppLocale = "en";

export const LOCALE_COOKIE = "nadee-locale";

export function isAppLocale(v: string | null | undefined): v is AppLocale {
  return v === "en" || v === "si" || v === "ta";
}

export function readStoredLocale(): AppLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const fromLs = localStorage.getItem(LOCALE_COOKIE);
    if (isAppLocale(fromLs)) return fromLs;
  } catch {
    /* private mode */
  }
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`),
  );
  const raw = match?.[1] ? decodeURIComponent(match[1].trim()) : "";
  if (isAppLocale(raw)) return raw;
  return DEFAULT_LOCALE;
}

export function writeStoredLocale(locale: AppLocale): void {
  if (typeof window === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)};path=/;max-age=${maxAge};SameSite=Lax`;
  try {
    localStorage.setItem(LOCALE_COOKIE, locale);
  } catch {
    /* */
  }
}
