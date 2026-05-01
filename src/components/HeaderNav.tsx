"use client";

import Link from "next/link";
import { useState } from "react";
import { CartBadge } from "@/components/CartBadge";
import { SignOutButton } from "@/components/SignOutButton";

type Props = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userLabel?: string;
};

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
];

export function HeaderNav({ isLoggedIn, isAdmin, userLabel }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden flex-wrap items-center justify-end gap-1 sm:flex sm:gap-1.5">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full border border-transparent px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-white hover:text-[var(--ink)] sm:px-4"
          >
            {l.label}
          </Link>
        ))}
        <CartBadge />
        {isAdmin ? (
          <Link
            href="/admin"
            className="rounded-full border border-[var(--accent-deep)]/25 bg-[var(--accent-deep)]/5 px-3 py-2 text-sm font-semibold text-[var(--accent-deep)] transition hover:bg-[var(--accent-deep)]/10 sm:px-4"
          >
            Admin
          </Link>
        ) : null}
        {isLoggedIn ? (
          <>
            <Link
              href="/orders"
              className="rounded-full border border-transparent px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-white hover:text-[var(--ink)] sm:px-4"
            >
              Orders
            </Link>
            <span className="hidden max-w-[140px] truncate px-2 text-sm text-[var(--muted)] lg:inline">
              {userLabel}
            </span>
            <SignOutButton />
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-full border border-transparent px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-white hover:text-[var(--ink)] sm:px-4"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(12,18,34,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Register
            </Link>
          </>
        )}
      </nav>

      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--ink)] sm:hidden"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <span className="space-y-1.5">
          <span className="block h-0.5 w-5 rounded bg-current" />
          <span className="block h-0.5 w-5 rounded bg-current" />
          <span className="block h-0.5 w-5 rounded bg-current" />
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] sm:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-xl"
            aria-label="Close menu backdrop"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-[82%] max-w-sm border-l border-[var(--border)] bg-white/95 p-5 shadow-2xl">
            <div className="relative">
            <div className="mb-5 flex items-center justify-between">
              <p className="font-display text-xl font-semibold text-[var(--ink)]">
                Menu
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-[var(--muted)] hover:bg-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)]"
                >
                  {l.label}
                </Link>
              ))}
              {isAdmin ? (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border border-[var(--accent-deep)]/25 bg-[var(--accent-deep)]/10 px-4 py-3 text-sm font-semibold text-[var(--accent-deep)]"
                >
                  Admin
                </Link>
              ) : null}
              {isLoggedIn ? (
                <>
                  <Link
                    href="/orders"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)]"
                  >
                    Orders
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)]"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl bg-[var(--ink)] px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Register
                  </Link>
                </>
              )}
              {isLoggedIn ? (
                <div className="pt-2">
                  <SignOutButton />
                </div>
              ) : null}
            </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
