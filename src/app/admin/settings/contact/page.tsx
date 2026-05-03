import type { Metadata } from "next";
import { ContactSettingsForm } from "./ContactSettingsForm";

export const metadata: Metadata = {
  title: "Contact · Site settings",
};

export default function AdminContactSettingsPage() {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-[var(--ink)]">Contact page</h2>
      <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
        Public <code className="rounded bg-black/[0.06] px-1">/contact</code> copy, hours, phone,
        email, and optional footer link—all stored in MongoDB.
      </p>
      <div className="mt-6">
        <ContactSettingsForm />
      </div>
    </div>
  );
}
