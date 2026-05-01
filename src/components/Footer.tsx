import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[var(--ink)] text-zinc-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Nadee Textile"
              width={120}
              height={40}
              className="h-9 w-auto max-w-[180px]"
            />
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
            Garments and basics built for everyday wear—honest materials, fair
            construction, and a focus on pieces you will reach for again and
            again.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Explore
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="hover:text-white" href="/">
                Home
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/about">
                About
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/products">
                Products
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/cart">
                Cart
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Contact
          </p>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            Nadee Textile
            <br />
            No 2/A, Yaya 7, Morakatiya, Embilipitiya
          </p>
          <p className="mt-3 text-sm">
            <a
              href="tel:+94741980433"
              className="font-medium text-zinc-200 hover:text-white"
            >
              074 198 0433
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} nadee-textile. All rights reserved.
      </div>
    </footer>
  );
}
