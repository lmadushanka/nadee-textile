import { signOutAction } from "@/app/auth-actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-black/[0.04] hover:text-[var(--ink)]"
      >
        Sign out
      </button>
    </form>
  );
}
