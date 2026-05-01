"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/toast";

export function RegisterForm() {
  const router = useRouter();
  const { success, error } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        error(data.error ?? "Registration failed");
        return;
      }
      success("Account created—you can sign in now.");
      router.push("/login?registered=1");
      router.refresh();
    } catch {
      error("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--ink)]">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[var(--ink)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-[var(--ink)]"
        >
          Password (min 6 characters)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-[var(--ink)] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--accent)] hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
