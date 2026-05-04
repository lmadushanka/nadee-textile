import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductImageSlider } from "@/components/ProductImageSlider";
import { formatRs } from "@/lib/format-currency";
import type { ProductJSON } from "@/lib/products";

type Props = {
  product: ProductJSON;
  priority?: boolean;
  /** default: catalog card · large: spotlight · compact: smaller featured grid */
  size?: "default" | "large" | "compact";
  className?: string;
};

export function ProductCard({
  product,
  priority,
  size = "default",
  className = "",
}: Props) {
  const large = size === "large";
  const compact = size === "compact";

  const radius = compact ? "rounded-xl" : "rounded-2xl";
  const imgAspect = compact ? "aspect-[3/4]" : large ? "aspect-[4/5] min-h-[220px] lg:min-h-[280px] lg:flex-1" : "aspect-[4/5]";

  return (
    <article
      className={`nadee-product-card-home group flex h-full min-h-0 flex-col overflow-hidden border border-[var(--border)] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:border-[var(--accent-deep)]/25 ${
        compact
          ? "hover:-translate-y-1 hover:shadow-lg"
          : "hover:-translate-y-2 hover:shadow-xl"
      } ${radius} ${large ? "lg:flex-1" : ""} ${className}`}
    >
      <Link
        href={`/products/${product.slug}`}
        className={`relative block overflow-hidden bg-zinc-100 ${imgAspect}`}
      >
        <ProductImageSlider
          images={product.imageUrls}
          alt={product.name}
          sizes={
            compact
              ? "(max-width:640px) 100vw, (max-width:1024px) 50vw, 240px"
              : "(max-width:768px) 100vw, 33vw"
          }
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          priority={priority}
          autoPlay={false}
          showDots={false}
          showArrows
          enableLightbox={false}
        />
        <span
          className={`absolute rounded-full bg-white/90 font-medium text-[var(--ink)] backdrop-blur ${
            compact
              ? "left-2 top-2 px-2 py-0.5 text-[10px]"
              : "left-3 top-3 px-2.5 py-0.5 text-xs"
          }`}
        >
          {product.category}
        </span>
      </Link>
      <div
        className={`flex flex-1 flex-col ${large ? "p-6 lg:p-7" : compact ? "p-3.5 sm:p-4" : "p-5"}`}
      >
        <h3
          className={`font-display font-semibold text-[var(--ink)] ${
            large ? "text-xl lg:text-2xl" : compact ? "text-base leading-snug" : "text-lg"
          }`}
        >
          <Link
            href={`/products/${product.slug}`}
            className="transition-colors duration-300 hover:text-[var(--accent-deep)] hover:underline"
          >
            {product.name}
          </Link>
        </h3>
        <p
          className={`mt-1.5 line-clamp-2 flex-1 leading-relaxed text-[var(--muted)] ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {product.description}
        </p>
        <p
          className={`mt-3 font-semibold text-[var(--accent)] ${compact ? "text-sm" : "text-base"}`}
        >
          {formatRs(product.price)}
        </p>
        <p className={`text-[var(--muted)] ${compact ? "mt-0.5 text-[10px]" : "mt-1 text-xs"}`}>
          Stock: {product.quantity}
        </p>
        {product.sizes.length > 0 || product.colors.length > 0 ? (
          <Link
            href={`/products/${product.slug}`}
            className={`mt-3 inline-flex w-full items-center justify-center rounded-full bg-[var(--ink)] font-semibold text-white transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg hover:brightness-110 active:scale-[0.98] ${
              compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
            }`}
          >
            {product.sizes.length > 0 && product.colors.length > 0
              ? "Select size & color"
              : product.sizes.length > 0
                ? "Select size"
                : "Select color"}
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
