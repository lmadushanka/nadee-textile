import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">
        Log in
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Sign in to checkout and track orders. New here?{" "}
        <Link href="/register" className="font-medium text-[var(--accent)] hover:underline">
          Create an account
        </Link>
        .
      </p>
      <LoginForm />
    </div>
  );
}

