import { NextResponse } from "next/server";
import { Types } from "mongoose";
import {
  applyCartCookies,
  buildCartPayload,
  loadOrCreateCart,
} from "@/lib/cart-request";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export async function GET() {
  try {
    const result = await loadOrCreateCart();
    const payload = await buildCartPayload(result.cart);
    const res = NextResponse.json(payload);
    return applyCartCookies(res, result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not load cart" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      productId?: string;
      quantity?: number;
      selectedSize?: string;
      selectedColor?: string;
    };
    const productId = body.productId?.trim();
    if (!productId || !Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }
    await connectDB();
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (!product.active) {
      return NextResponse.json({ error: "Product is inactive" }, { status: 400 });
    }
    if (Number(product.quantity ?? 0) <= 0) {
      return NextResponse.json({ error: "Product is out of stock" }, { status: 400 });
    }
    const selectedSize = body.selectedSize?.trim() || undefined;
    const selectedColor = body.selectedColor?.trim() || undefined;
    const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
    const hasColors = Array.isArray(product.colors) && product.colors.length > 0;
    if (hasSizes && !selectedSize) {
      return NextResponse.json(
        { error: "Please select a size before adding to cart" },
        { status: 400 },
      );
    }
    if (hasColors && !selectedColor) {
      return NextResponse.json(
        { error: "Please select a color before adding to cart" },
        { status: 400 },
      );
    }
    if (selectedSize && hasSizes && !product.sizes.includes(selectedSize)) {
      return NextResponse.json({ error: "Invalid size selected" }, { status: 400 });
    }
    if (selectedColor && hasColors && !product.colors.includes(selectedColor)) {
      return NextResponse.json({ error: "Invalid color selected" }, { status: 400 });
    }
    const qty = Math.min(
      99,
      Math.max(1, Number.isFinite(body.quantity) ? Number(body.quantity) : 1),
    );

    const result = await loadOrCreateCart();
    const { cart } = result;
    const line = cart.items.find(
      (i) =>
        String(i.productId) === productId &&
        (i.selectedSize ?? "") === (selectedSize ?? "") &&
        (i.selectedColor ?? "") === (selectedColor ?? ""),
    );
    if (line) {
      line.quantity = Math.min(99, line.quantity + qty);
    } else {
      cart.items.push({
        productId: new Types.ObjectId(productId),
        quantity: qty,
        selectedSize,
        selectedColor,
      });
    }
    await cart.save();
    const payload = await buildCartPayload(cart);
    const res = NextResponse.json({ ok: true, ...payload });
    return applyCartCookies(res, result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not update cart" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      productId?: string;
      quantity?: number;
      selectedSize?: string;
      selectedColor?: string;
    };
    const productId = body.productId?.trim();
    if (!productId || !Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }
    const qty = Number(body.quantity);
    if (!Number.isFinite(qty)) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const selectedSize = body.selectedSize?.trim() || undefined;
    const selectedColor = body.selectedColor?.trim() || undefined;

    const result = await loadOrCreateCart();
    const { cart } = result;
    const idx = cart.items.findIndex(
      (i) =>
        String(i.productId) === productId &&
        (i.selectedSize ?? "") === (selectedSize ?? "") &&
        (i.selectedColor ?? "") === (selectedColor ?? ""),
    );
    if (idx === -1) {
      return NextResponse.json({ error: "Line not found" }, { status: 404 });
    }
    if (qty <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = Math.min(99, Math.max(1, qty));
    }
    await cart.save();
    const payload = await buildCartPayload(cart);
    const res = NextResponse.json({ ok: true, ...payload });
    return applyCartCookies(res, result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not update cart" },
      { status: 500 },
    );
  }
}
