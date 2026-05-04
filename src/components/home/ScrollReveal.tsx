"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export type ScrollRevealVariant = "fade-up" | "slide-left" | "scale-up";

type Props = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  variant?: ScrollRevealVariant;
  once?: boolean;
};

const variantClass: Record<ScrollRevealVariant, string> = {
  "fade-up": "",
  "slide-left": " nadee-reveal--slide-left",
  "scale-up": " nadee-reveal--scale",
};

export function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
  variant = "fade-up",
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            if (once && e.target) obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  const style: CSSProperties =
    delayMs > 0 ? ({ "--nadee-reveal-delay": `${delayMs}ms` } as CSSProperties) : {};

  return (
    <div
      ref={ref}
      style={style}
      className={`nadee-reveal${variantClass[variant]}${visible ? " nadee-reveal-visible" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
