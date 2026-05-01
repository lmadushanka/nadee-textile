import Link from "next/link";
import type { ProductJSON } from "@/lib/products";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductImageSlider } from "@/components/ProductImageSlider";

type Props = { product: ProductJSON; priority?: boolean };

function formatRs(value: number) {
  return `Rs. ${value.toFixed(2)}`;
}

export function ProductCard({ product, priority }: Props) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-zinc-100"
      >
        <ProductImageSlider
          images={product.imageUrls}
          alt={product.name}
          sizes="(max-width:768px) 100vw, 33vw"
          className="h-full w-full group-hover:scale-[1.03]"
          priority={priority}
          autoPlay={false}
          showDots={false}
          showArrows
          enableLightbox={false}
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-[var(--ink)] backdrop-blur">
          {product.category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-[var(--ink)]">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-[var(--accent-deep)] hover:underline"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
          {product.description}
        </p>
        <p className="mt-4 text-base font-semibold text-[var(--accent)]">
          {formatRs(product.price)}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Stock: {product.quantity}
        </p>
        {product.sizes.length > 0 || product.colors.length > 0 ? (
          <Link
            href={`/products/${product.slug}`}
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Select options
          </Link>
        ) : (
          <AddToCartButton
            productId={product._id}
            disabled={!product.active || product.quantity <= 0}
            disabledLabel={!product.active ? "Inactive" : "Out of stock"}
          />
        )}
      </div>
    </article>
  );
}
