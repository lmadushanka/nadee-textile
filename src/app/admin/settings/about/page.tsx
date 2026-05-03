import type { Metadata } from "next";
import { AboutSettingsForm } from "./AboutSettingsForm";

export const metadata: Metadata = {
  title: "About · Site settings",
};

export default function AdminAboutSettingsPage() {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-[var(--ink)]">About us</h2>
      <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
        Public <code className="rounded bg-black/[0.06] px-1">/about</code> page: hero, story,
        values, contact, map embed, and footer CTA—all stored in MongoDB.
      </p>
      <div className="mt-6">
        <AboutSettingsForm />
      </div>
    </div>
  );
}
