"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

function sumQty(items: { quantity: number }[]) {
  return items.reduce((a, i) => a + i.quantity, 0);
}

export function CartBadge() {
  const { t } = useLocale();
  const pathname = usePathname();
  const cartActive = pathname === "/cart" || pathname.startsWith("/cart/");
  const [count, setCount] = useState(0);

  useEffect(() => {
    function load() {
      fetch("/api/cart")
        .then((r) => r.json())
        .then((d) => {
          setCount(sumQty(d.items ?? []));
        })
        .catch(() => setCount(0));
    }
    load();
    window.addEventListener("nadee:cart", load);
    return () => window.removeEventListener("nadee:cart", load);
  }, []);

  return (
    <Link
      href="/cart"
      aria-current={cartActive ? "page" : undefined}
      className={`relative rounded-full px-3 py-2.5 text-sm font-medium transition ${
        cartActive
          ? "bg-[#0c1222] text-white hover:bg-[#151d33]"
          : "text-[#1a202c] hover:bg-zinc-100"
      }`}
    >
      {t("nav.cart")}
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[11px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
