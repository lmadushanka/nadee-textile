import Image from "next/image";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import type { FabricSectionSettings } from "@/lib/site-settings-defaults";

type Props = FabricSectionSettings;

export function FabricMindsetSection({
  fabricImageSrc,
  fabricImageAlt,
  fabricTitle,
  fabricSubtitle,
}: Props) {
  return (
    <section className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <ScrollReveal variant="slide-left" className="relative min-w-0">
          <div className="nadee-fabric-frame group/fabric relative aspect-[4/3] cursor-default overflow-hidden rounded-2xl bg-zinc-200">
            <Image
              src={fabricImageSrc}
              alt={fabricImageAlt}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover/fabric:scale-105"
              sizes="(max-width:1024px) 100vw, 50vw"
              priority
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover/fabric:opacity-80"
              aria-hidden
            />
          </div>
        </ScrollReveal>
        <ScrollReveal delayMs={90} className="min-w-0">
          <div>
            <h2 className="font-display text-3xl font-semibold text-[var(--ink)] transition-colors duration-300 hover:text-[var(--accent-deep)] sm:text-4xl">
              {fabricTitle}
            </h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-[var(--muted)]">
              {fabricSubtitle}
            </p>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-[var(--border)] pt-10">
              <ScrollReveal delayMs={0} className="min-w-0">
                <div className="nadee-fabric-stat">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Focus
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-[var(--ink)] transition-colors duration-300 hover:text-[var(--accent-deep)]">
                    Quality
                  </dd>
                </div>
              </ScrollReveal>
              <ScrollReveal delayMs={80} className="min-w-0">
                <div className="nadee-fabric-stat">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Range
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-[var(--ink)] transition-colors duration-300 hover:text-[var(--accent-deep)]">
                    Apparel
                  </dd>
                </div>
              </ScrollReveal>
              <ScrollReveal delayMs={160} className="min-w-0">
                <div className="nadee-fabric-stat">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Name
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-[var(--ink)] transition-colors duration-300 hover:text-[var(--accent-deep)]">
                    nadee
                  </dd>
                </div>
              </ScrollReveal>
            </dl>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
