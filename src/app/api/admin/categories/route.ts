import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { slugify } from "@/lib/slug";
import { requireAdminSession } from "@/lib/admin-auth";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";

type CategoryJSON = { _id: string; name: string; slug: string };

function normalize(categories: Array<{ _id: unknown; name: string; slug: string }>) {
  return categories.map((c) => ({
    _id: String(c._id),
    name: c.name,
    slug: c.slug,
  })) as CategoryJSON[];
}

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return NextResponse.json(normalize(categories));
  } catch (e) {
    console.error("[admin-categories:get]", e);
    return NextResponse.json(
      { error: "Could not load categories" },
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
    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }
    await connectDB();
    const existingByName = await Category.findOne({
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
    });
    if (existingByName) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 },
      );
    }
    const base = slugify(name);
    let slug = base;
    let n = 0;
    while (await Category.findOne({ slug })) {
      n += 1;
      slug = `${base}-${n}`;
    }
    const created = await Category.create({ name, slug });
    return NextResponse.json({
      ok: true,
      category: { _id: String(created._id), name: created.name, slug: created.slug },
    });
  } catch (e) {
    console.error("[admin-categories:post]", e);
    return NextResponse.json(
      { error: "Could not create category" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Category id is required" }, { status: 400 });
    }
    await connectDB();
    const existing = await Category.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    const linkedProducts = await Product.countDocuments({ category: existing.name });
    if (linkedProducts > 0) {
      return NextResponse.json(
        { error: "Cannot delete category used by existing products" },
        { status: 409 },
      );
    }
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin-categories:delete]", e);
    return NextResponse.json(
      { error: "Could not delete category" },
      { status: 500 },
    );
  }
}
