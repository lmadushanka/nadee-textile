"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/settings/fabric", label: "Fabric" },
  { href: "/admin/settings/hero", label: "Hero" },
  { href: "/admin/settings/featured", label: "Featured" },
  { href: "/admin/settings/products", label: "Products" },
  { href: "/admin/settings/about", label: "About" },
  { href: "/admin/settings/contact", label: "Contact" },
] as const;

export function SettingsSectionNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Site settings sections"
      className="flex shrink-0 flex-wrap gap-2 border-b border-[var(--border)] pb-4 lg:flex-col lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8"
    >
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            data-active={active ? "true" : "false"}
            className="inline-flex rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--paper)] data-[active=true]:border-[var(--accent-deep)] data-[active=true]:bg-[var(--accent-deep)] data-[active=true]:text-white"
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
