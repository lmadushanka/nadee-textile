import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { requireAdminSession } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }
  try {
    const body = (await request.json()) as {
      quantity?: number;
      active?: boolean;
      featured?: boolean;
      sizes?: string[];
      colors?: string[];
    };
    const update: Record<string, unknown> = {};
    if (body.quantity !== undefined) {
      const quantity = Number(body.quantity);
      if (!Number.isFinite(quantity) || quantity < 0) {
        return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
      }
      update.quantity = Math.floor(quantity);
    }
    if (body.active !== undefined) {
      update.active = Boolean(body.active);
    }
    if (body.featured !== undefined) {
      update.featured = Boolean(body.featured);
    }
    if (body.sizes !== undefined) {
      if (!Array.isArray(body.sizes)) {
        return NextResponse.json({ error: "sizes must be an array" }, { status: 400 });
      }
      update.sizes = Array.from(
        new Set(
          body.sizes
            .map((s) => String(s).trim())
            .filter((s) => Boolean(s)),
        ),
      );
    }
    if (body.colors !== undefined) {
      if (!Array.isArray(body.colors)) {
        return NextResponse.json({ error: "colors must be an array" }, { status: 400 });
      }
      update.colors = Array.from(
        new Set(
          body.colors
            .map((s) => String(s).trim())
            .filter((s) => Boolean(s)),
        ),
      );
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    await connectDB();
    const updated = await Product.findByIdAndUpdate(id, update, {
      new: true,
    }).lean();
    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const sizes = Array.isArray(updated.sizes) ? updated.sizes.map(String) : [];
    const colors = Array.isArray(updated.colors) ? updated.colors.map(String) : [];
    return NextResponse.json({
      ok: true,
      product: {
        _id: String(updated._id),
        quantity: Number(updated.quantity ?? 0),
        active: Boolean(updated.active ?? true),
        featured: Boolean(updated.featured),
        sizes,
        colors,
      },
    });
  } catch (e) {
    console.error("[admin-products:patch]", e);
    return NextResponse.json({ error: "Could not update product" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  try {
    await connectDB();
    const deleted = await Product.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin-products:delete]", e);
    return NextResponse.json({ error: "Could not delete product" }, { status: 500 });
  }
}
