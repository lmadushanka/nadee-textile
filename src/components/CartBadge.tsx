"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function sumQty(items: { quantity: number }[]) {
  return items.reduce((a, i) => a + i.quantity, 0);
}

export function CartBadge() {
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
      className="relative rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-black/[0.04] hover:text-[var(--ink)]"
    >
      Cart
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[11px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
