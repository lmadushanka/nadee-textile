"use client";

import { signOutAction } from "@/app/auth-actions";
import { useLocale } from "@/components/LocaleProvider";

export function SignOutButton() {
  const { t } = useLocale();
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-black/[0.04] hover:text-[var(--ink)]"
      >
        {t("nav.signOut")}
      </button>
    </form>
  );
}
