import type { Metadata } from "next";
import { HeroSettingsForm } from "./HeroSettingsForm";

export const metadata: Metadata = {
  title: "Hero · Site settings",
};

export default function AdminHeroSettingsPage() {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-[var(--ink)]">Hero</h2>
      <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
        Full-viewport hero: headline lines, intro text, and rotating background images stored in
        the database.
      </p>
      <div className="mt-6">
        <HeroSettingsForm />
      </div>
    </div>
  );
}
