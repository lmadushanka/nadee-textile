import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">
        Create account
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Register as a customer to save your cart and place orders.
      </p>
      <RegisterForm />
    </div>
  );
}
