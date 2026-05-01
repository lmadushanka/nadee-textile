import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { slugify } from "@/lib/slug";
import { getProducts } from "@/lib/products";
import { requireAdminSession } from "@/lib/admin-auth";
import { Category } from "@/models/Category";

export const dynamic = "force-dynamic";

function normalizeStringList(input: unknown): string[] {
  if (input == null) {
    return [];
  }
  const parts: unknown[] = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(",")
      : [];
  return Array.from(
    new Set(
      parts
        .map((item) => String(item).trim())
        .filter((s) => s.length > 0),
    ),
  );
}

function normalizeUrlList(input: unknown): string[] {
  return normalizeStringList(input).filter((url) => /^https?:\/\//i.test(url));
}

function normalizeQuantity(input: unknown): number {
  const n =
    typeof input === "number" && Number.isFinite(input)
      ? input
      : Number(input ?? 0);
  if (!Number.isFinite(n) || n < 0) {
    return 0;
  }
  return Math.floor(n);
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const products = await getProducts({ includeInactive: true });
    return NextResponse.json(products, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not load products" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      price?: number;
      category?: string;
      sizes?: string[];
      colors?: string[];
      quantity?: number;
      active?: boolean;
      imageUrl?: string;
      imageUrls?: string[];
      featured?: boolean;
    };
    const name = body.name?.trim();
    const description = body.description?.trim();
    const category = body.category?.trim();
    const sizes = normalizeStringList(body.sizes);
    const colors = normalizeStringList(body.colors);
    const imageUrl = body.imageUrl?.trim();
    const imageUrls = normalizeUrlList(body.imageUrls);
    const mergedImageUrls = Array.from(
      new Set(
        imageUrl && /^https?:\/\//i.test(imageUrl)
          ? [imageUrl, ...imageUrls]
          : imageUrls,
      ),
    );
    const primaryImageUrl = mergedImageUrls[0] ?? "";
    const price = Number(body.price);
    const quantity = normalizeQuantity(body.quantity ?? 0);
    const active = body.active !== false;
    const featured = Boolean(body.featured);

    if (!name || !description || !category || !primaryImageUrl) {
      return NextResponse.json(
        { error: "Name, description, category, and at least one image are required" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    await connectDB();
    const categoryDoc = await Category.findOne({
      name: new RegExp(`^${escapeRegex(category)}$`, "i"),
    }).lean();
    if (!categoryDoc) {
      return NextResponse.json(
        {
          error: "Category does not exist. Create it in Admin > Categories first.",
          hint: `No category matching "${category}" (check spelling; names are matched case-insensitively).`,
        },
        { status: 400 },
      );
    }
    const categoryName = String(categoryDoc.name);
    const base = slugify(name);
    let slug = base;
    let n = 0;
    while (await Product.findOne({ slug })) {
      n += 1;
      slug = `${base}-${n}`;
    }

    const doc = await Product.create({
      name,
      slug,
      description,
      price,
      category: categoryName,
      sizes,
      colors,
      quantity,
      active,
      imageUrl: primaryImageUrl,
      imageUrls: mergedImageUrls,
      featured,
    });

    return NextResponse.json({
      ok: true,
      product: {
        _id: String(doc._id),
        slug: doc.slug,
        quantity: Number(doc.quantity ?? 0),
        sizes: Array.isArray(doc.sizes) ? [...doc.sizes] : [],
        colors: Array.isArray(doc.colors) ? [...doc.colors] : [],
        imageUrl: String(doc.imageUrl),
        imageUrls: Array.isArray(doc.imageUrls) ? [...doc.imageUrls] : [doc.imageUrl],
        featured: Boolean(doc.featured),
        active: Boolean(doc.active ?? true),
      },
    });
  } catch (e) {
    console.error("[admin-products POST]", e);
    const detail =
      e instanceof Error
        ? e.message
        : typeof e === "string"
          ? e
          : "Unknown error";
    return NextResponse.json(
      { error: "Could not create product", detail },
      { status: 500 },
    );
  }
}
