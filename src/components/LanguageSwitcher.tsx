"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { AppLocale } from "@/lib/i18n/locale-storage";

const LOCALES: { code: AppLocale; short: string }[] = [
  { code: "en", short: "EN" },
  { code: "si", short: "සිං" },
  { code: "ta", short: "தமிழ்" },
];

type Props = {
  /** e.g. compact pills in header vs full width in drawer */
  variant?: "inline" | "block";
  className?: string;
};

export function LanguageSwitcher({ variant = "inline", className = "" }: Props) {
  const { locale, setLocale, t } = useLocale();

  const wrap =
    variant === "block"
      ? `flex w-full flex-row gap-2 ${className}`
      : `inline-flex shrink-0 items-center rounded-full border border-zinc-200 bg-zinc-50/80 p-0.5 ${className}`;

  return (
    <div className={wrap} role="group" aria-label={t("lang.switcher")}>
      {LOCALES.map(({ code, short }) => {
        const active = locale === code;
        const base =
          variant === "block"
            ? "flex min-h-[44px] flex-1 items-center justify-center rounded-xl border py-2 text-xs font-semibold transition sm:text-sm"
            : "rounded-full px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide transition sm:px-2.5 sm:text-[11px]";
        const activeCls =
          "border-[#0c1222] bg-[#0c1222] text-white shadow-sm hover:bg-[#151d33]";
        const idleCls =
          "border-transparent text-[#1a202c] hover:bg-white/90 hover:border-zinc-200";
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            title={t(`lang.${code}`)}
            className={`${base} ${active ? activeCls : idleCls}`}
            aria-pressed={active}
          >
            {short}
          </button>
        );
      })}
    </div>
  );
}
