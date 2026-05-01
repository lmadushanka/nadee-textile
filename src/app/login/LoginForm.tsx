"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useToast } from "@/components/toast";

function LoginFields() {
  const router = useRouter();
  const search = useSearchParams();
  const { success, error: toastError } = useToast();
  const callbackUrl = search.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setBusy(false);
    if (res?.error) {
      toastError("Invalid email or password");
      return;
    }
    success("Signed in successfully");
    router.push(callbackUrl.startsWith("/") ? callbackUrl : "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
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
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
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
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="mt-8 h-40 animate-pulse rounded-lg bg-zinc-100" />}>
      <LoginFields />
    </Suspense>
  );
}
