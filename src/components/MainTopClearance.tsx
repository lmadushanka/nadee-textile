"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Fixed floating header overlaps content. Home hero is full-bleed under the header;
 * other routes need top padding so the first line of content is not hidden.
 */
export function MainTopClearance({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pad =
    pathname === "/"
      ? ""
      : "pt-[5.25rem] sm:pt-[6rem] lg:pt-[6.25rem]";

  return (
    <main className={`min-w-0 flex-1 w-full ${pad}`}>{children}</main>
  );
}
