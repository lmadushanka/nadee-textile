import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { HeaderNav } from "@/components/HeaderNav";

export async function Header() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const isAdmin = session?.user?.role === "admin";
  const userLabel = session?.user?.name ?? session?.user?.email ?? "";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--paper)_84%,white_16%)]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="Nadee Textile"
            width={54}
            height={54}
            className="h-11 w-auto drop-shadow-[0_6px_14px_rgba(0,0,0,0.16)]"
            priority
          />
        </Link>
        <HeaderNav isLoggedIn={isLoggedIn} isAdmin={isAdmin} userLabel={userLabel} />
      </div>
    </header>
  );
}
