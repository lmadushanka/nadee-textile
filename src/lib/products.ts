import { connectDB } from "@/lib/mongodb";
import { Product, type ProductDoc } from "@/models/Product";

export type ProductJSON = ProductDoc & { _id: string };

function mapProductRow(r: {
  _id: unknown;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  sizes?: unknown;
  colors?: unknown;
  quantity?: unknown;
  active?: unknown;
  imageUrl: string;
  imageUrls?: unknown;
  featured?: unknown;
}): ProductJSON {
  const imageUrls = Array.isArray(r.imageUrls)
    ? r.imageUrls.map(String).filter((url) => Boolean(url))
    : [];
  const primaryImage = imageUrls[0] ?? r.imageUrl;
  return {
    _id: String(r._id),
    name: r.name,
    slug: r.slug,
    description: r.description,
    price: r.price,
    category: r.category,
    sizes: Array.isArray(r.sizes) ? r.sizes.map(String) : [],
    colors: Array.isArray(r.colors) ? r.colors.map(String) : [],
    quantity: Number(r.quantity ?? 0),
    active: Boolean(r.active ?? true),
    imageUrl: primaryImage,
    imageUrls: imageUrls.length > 0 ? imageUrls : [primaryImage],
    featured: Boolean(r.featured),
  };
}

export async function getProductBySlug(
  slug: string,
  options?: { includeInactive?: boolean },
): Promise<ProductJSON | null> {
  await connectDB();
  const trimmed = slug.trim();
  if (!trimmed) {
    return null;
  }
  const filter: Record<string, unknown> = { slug: trimmed };
  if (!options?.includeInactive) {
    filter.active = true;
  }
  const r = await Product.findOne(filter).lean();
  if (!r) {
    return null;
  }
  return mapProductRow(r);
}

export async function getProducts(options?: {
  featured?: boolean;
  limit?: number;
  includeInactive?: boolean;
  category?: string;
}): Promise<ProductJSON[]> {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (!options?.includeInactive) {
    filter.active = true;
  }
  if (options?.featured) {
    filter.featured = true;
  }
  if (options?.category?.trim()) {
    filter.category = options.category.trim();
  }
  const query = Product.find(filter).sort({ createdAt: -1 }).lean();
  const rows = options?.limit
    ? await query.limit(options.limit).exec()
    : await query.exec();
  return rows.map((r) => mapProductRow(r));
}
