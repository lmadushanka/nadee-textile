"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import type { HomeHeroSettings } from "@/lib/site-settings-defaults";

const SLIDE_INTERVAL_MS = 5500;

function subscribePrefersReducedMotion(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getPrefersReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function SocialLink({
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
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
    >
      {children}
    </a>
  );
}

function SocialIconLinks() {
  return (
    <>
      <SocialLink
        href="https://web.facebook.com/profile.php?id=61578354034563&sk=about"
        label="Facebook"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </SocialLink>
      <SocialLink href="https://twitter.com" label="X (Twitter)">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </SocialLink>
      <SocialLink href="https://instagram.com" label="Instagram">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      </SocialLink>
      <SocialLink href="https://linkedin.com" label="LinkedIn">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </SocialLink>
    </>
  );
}

type Props = HomeHeroSettings;

export function HomeHero({
  heroEyebrow,
  heroTitlePrimary,
  heroTitleAccent,
  heroSubtitle,
  heroSlides,
}: Props) {
  const slides = heroSlides.length > 0 ? heroSlides : [];
  const slidesKey = slides.map((s) => `${s.src}|${s.alt}`).join(";");
  const [active, setActive] = useState(0);
  const prefersReducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotionSnapshot,
    () => false,
  );
  const motionOk = !prefersReducedMotion;

  useEffect(() => {
    setActive(0);
  }, [slidesKey]);

  useEffect(() => {
    if (!motionOk || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [motionOk, slides.length, slidesKey]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative isolate min-h-[100svh] w-full max-w-none overflow-hidden bg-zinc-900 text-white">
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={`${i}-${slide.src}`}
            className="absolute inset-0 transition-opacity duration-[900ms] ease-out"
            style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 1 : 0 }}
            aria-hidden={i !== active}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority={i === 0}
              quality={85}
              unoptimized
            />
          </div>
        ))}
        <div
          className="absolute inset-0 z-[2] bg-gradient-to-r from-black/75 via-black/55 to-black/35"
          aria-hidden
        />
        <div className="absolute inset-0 z-[2] bg-black/20" aria-hidden />
      </div>

      <div className="relative z-10 flex min-h-[100svh] flex-col">
        <div className="flex flex-1 flex-col px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28 lg:px-8 lg:pb-16 lg:pt-32 xl:px-12 2xl:px-16">
          <div className="relative grid w-full max-w-none flex-1 grid-cols-1 gap-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8 xl:gap-12">
            <div className="w-full min-w-0 max-w-none lg:py-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/95 backdrop-blur-sm sm:text-[11px]">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                  aria-hidden
                />
                {heroEyebrow}
              </p>
              <h1 className="mt-6 font-sans text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-[3.5rem]">
                {heroTitlePrimary}
                <br />
                <span className="text-white">{heroTitleAccent}</span>
              </h1>
              <p className="mt-6 max-w-none whitespace-pre-line text-sm leading-relaxed text-zinc-200 sm:text-base">
                {heroSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full bg-[#f5e000] px-7 py-3 text-sm font-bold uppercase tracking-wide text-zinc-900 shadow-lg transition hover:bg-[#edd800]"
                >
                  Shop collection
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Our story
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-3 lg:hidden">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                  Follow
                </p>
                <div className="flex gap-2">
                  <SocialIconLinks />
                </div>
              </div>
            </div>

            <div className="hidden flex-col items-center gap-6 self-end pb-4 lg:flex lg:self-stretch lg:pb-8">
              <div className="flex flex-col gap-3">
                <SocialIconLinks />
              </div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/70"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                Follow
              </p>
              <div className="mt-2 flex flex-col items-center gap-2" aria-hidden>
                <div className="h-16 w-px bg-gradient-to-b from-white/80 to-white/0" />
              </div>
            </div>
          </div>

          <div
            className="mt-auto flex w-full max-w-none items-center justify-between gap-4 pt-8"
            role="tablist"
            aria-label="Hero slides"
          >
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={`tab-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === active
                      ? "w-8 bg-[#f5e000]"
                      : "w-2 bg-white/35 hover:bg-white/55"
                  }`}
                />
              ))}
            </div>
            <p className="hidden text-[10px] font-medium uppercase tracking-[0.25em] text-white/50 sm:block">
              Scroll to explore
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
