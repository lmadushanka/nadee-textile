"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  images: string[];
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  enableLightbox?: boolean;
};

export function ProductImageSlider({
  images,
  alt,
  priority,
  sizes = "(max-width:768px) 100vw, 33vw",
  className = "",
  showDots = true,
  showArrows = true,
  autoPlay = false,
  enableLightbox = false,
}: Props) {
  const safeImages = images.length > 0 ? images : ["/logo.png"];
  const [idx, setIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const currentIdx = idx % safeImages.length;

  useEffect(() => {
    if (!autoPlay || safeImages.length <= 1) {
      return;
    }
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % safeImages.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [autoPlay, safeImages.length]);

  function goPrev(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIdx((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  }

  function goNext(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIdx((prev) => (prev + 1) % safeImages.length);
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            if (enableLightbox) {
              e.preventDefault();
              e.stopPropagation();
              setLightboxOpen(true);
            }
          }}
          className={`absolute inset-0 block ${enableLightbox ? "cursor-zoom-in" : "cursor-default"}`}
          aria-label={enableLightbox ? "Open full image" : alt}
        >
          <Image
            src={safeImages[currentIdx]}
            alt={alt}
            fill
            sizes={sizes}
            className="object-cover transition duration-500"
            priority={priority}
          />
        </button>
        {showArrows && safeImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-black/65"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-black/65"
            >
              ›
            </button>
          </>
        ) : null}
        {showDots && safeImages.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2 py-1 backdrop-blur-sm">
            {safeImages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show image ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIdx(i);
                }}
                className={`h-1.5 w-1.5 rounded-full transition ${i === currentIdx ? "bg-white" : "bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        ) : null}
      </div>
      {enableLightbox && lightboxOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <button
            type="button"
            aria-label="Close full image view"
            onClick={() => setLightboxOpen(false)}
            className="absolute inset-0"
          />
          <div className="relative z-10 h-[80vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-black">
            <Image
              src={safeImages[currentIdx]}
              alt={`${alt} full view`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
            {safeImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 px-3 py-1 text-2xl font-semibold text-white backdrop-blur-sm transition hover:bg-black/70"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 px-3 py-1 text-2xl font-semibold text-white backdrop-blur-sm transition hover:bg-black/70"
                >
                  ›
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-3 top-3 z-20 rounded-full bg-black/50 px-3 py-1 text-sm font-semibold text-white transition hover:bg-black/75"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
