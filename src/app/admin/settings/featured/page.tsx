import type { Metadata } from "next";
import { FeaturedSettingsForm } from "./FeaturedSettingsForm";

export const metadata: Metadata = {
  title: "Featured · Site settings",
};

export default function AdminFeaturedSettingsPage() {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-[var(--ink)]">Featured pieces</h2>
      <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
        Headline, description, call-to-action, how many featured products appear on the home page,
        and the empty-state message when none are marked featured.
      </p>
      <div className="mt-6">
        <FeaturedSettingsForm />
      </div>
    </div>
  );
}
