"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const primaryLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/products/new", label: "Add Product" },
  { href: "/admin/categories", label: "Categories" },
] as const;

const settingsChildren = [
  { href: "/admin/settings/brand", label: "Brand" },
  { href: "/admin/settings/fabric", label: "Fabric" },
  { href: "/admin/settings/hero", label: "Hero" },
  { href: "/admin/settings/featured", label: "Featured" },
  { href: "/admin/settings/products", label: "Products" },
  { href: "/admin/settings/about", label: "About" },
  { href: "/admin/settings/contact", label: "Contact" },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const underSettings = pathname.startsWith("/admin/settings");
  const [settingsOpen, setSettingsOpen] = useState(underSettings);

  useEffect(() => {
    if (underSettings) setSettingsOpen(true);
  }, [underSettings]);

  const settingsActive = settingsChildren.some((c) => pathname === c.href);

  return (
    <nav className="space-y-1">
      {primaryLinks.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-[var(--accent-deep)] text-white"
                : "text-[var(--ink)] hover:bg-[var(--paper)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      <div className="pt-1">
        <button
          type="button"
          onClick={() => setSettingsOpen((o) => !o)}
          aria-expanded={settingsOpen}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
            settingsActive && !settingsOpen
              ? "bg-[var(--accent-deep)]/15 text-[var(--accent-deep)]"
              : "text-[var(--ink)] hover:bg-[var(--paper)]"
          }`}
        >
          <span>Settings</span>
          <span
            className={`text-xs text-[var(--muted)] transition ${settingsOpen ? "rotate-90" : ""}`}
            aria-hidden
          >
            ›
          </span>
        </button>
        {settingsOpen ? (
          <div className="ml-2 mt-1 space-y-0.5 border-l border-[var(--border)] pl-2">
            {settingsChildren.map((c) => {
              const active = pathname === c.href;
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  onClick={onNavigate}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--accent-deep)] text-white"
                      : "text-[var(--ink)] hover:bg-[var(--paper)]"
                  }`}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </nav>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)]"
        >
          Open admin menu
        </button>
      </div>

      <aside className="hidden rounded-2xl border border-[var(--border)] bg-white p-3 lg:block">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Admin menu
        </p>
        <NavLinks />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu backdrop"
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-xs border-r border-[var(--border)] bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--ink)]">Admin menu</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-[var(--muted)] hover:bg-[var(--paper)]"
              >
                Close
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
