import Image from "next/image";
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
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-200">
          <Image
            src={fabricImageSrc}
            alt={fabricImageAlt}
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div>
          <h2 className="font-display text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
            {fabricTitle}
          </h2>
          <p className="mt-4 whitespace-pre-line text-[var(--muted)] leading-relaxed">
            {fabricSubtitle}
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-[var(--border)] pt-10">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Focus
              </dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-[var(--ink)]">
                Quality
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Range
              </dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-[var(--ink)]">
                Apparel
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Name
              </dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-[var(--ink)]">
                nadee
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
