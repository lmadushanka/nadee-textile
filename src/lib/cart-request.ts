import { Types } from "mongoose";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import type { HydratedDocument } from "mongoose";
import type { CartDoc } from "@/models/Cart";

export const GUEST_CART_COOKIE = "nadee_guest";

export type CartLinePayload = {
  lineId: string;
  productId: string;
  quantity: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  selectedSize?: string;
  selectedColor?: string;
};

export type CartPayload = {
  items: CartLinePayload[];
  subtotal: number;
};

export type LoadCartResult = {
  cart: HydratedDocument<CartDoc>;
  newGuestId?: string;
  mergeClearedGuest?: boolean;
};

export function mergeCartItems(
  target: {
    productId: Types.ObjectId;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  }[],
  source: {
    productId: Types.ObjectId;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  }[],
) {
  for (const s of source) {
    const id = String(s.productId);
    const found = target.find(
      (t) =>
        String(t.productId) === id &&
        (t.selectedSize ?? "") === (s.selectedSize ?? "") &&
        (t.selectedColor ?? "") === (s.selectedColor ?? ""),
    );
    if (found) {
      found.quantity += s.quantity;
    } else {
      target.push({
        productId: new Types.ObjectId(id),
        quantity: s.quantity,
        selectedSize: s.selectedSize,
        selectedColor: s.selectedColor,
      });
    }
  }
}

export async function loadOrCreateCart(): Promise<LoadCartResult> {
  await connectDB();
  const session = await auth();
  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_CART_COOKIE)?.value ?? null;

  if (session?.user?.id) {
    const userOid = new Types.ObjectId(session.user.id);
    let cart = await Cart.findOne({ userId: userOid });
    if (!cart) {
      cart = await Cart.create({ userId: userOid, items: [] });
    }
    let mergeClearedGuest = false;
    if (guestId) {
      const guestCart = await Cart.findOne({ guestId });
      if (guestCart?.items?.length) {
        mergeCartItems(cart.items, guestCart.items);
        await cart.save();
        await guestCart.deleteOne();
        mergeClearedGuest = true;
      }
    }
    return { cart, mergeClearedGuest };
  }

  if (!guestId) {
    const id = crypto.randomUUID();
    const cart = await Cart.create({ guestId: id, items: [] });
    return { cart, newGuestId: id };
  }

  let cart = await Cart.findOne({ guestId });
  if (!cart) {
    cart = await Cart.create({ guestId, items: [] });
  }
  return { cart };
}

export function applyCartCookies(
  res: import("next/server").NextResponse,
  result: LoadCartResult,
) {
  if (result.newGuestId) {
    res.cookies.set(GUEST_CART_COOKIE, result.newGuestId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
  }
  if (result.mergeClearedGuest) {
    res.cookies.delete(GUEST_CART_COOKIE);
  }
  return res;
}

export async function buildCartPayload(
  cart: HydratedDocument<CartDoc>,
): Promise<CartPayload> {
  if (!cart.items.length) {
    return { items: [], subtotal: 0 };
  }
  const ids = cart.items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: ids } }).lean();
  const map = new Map(products.map((p) => [String(p._id), p]));
  let subtotal = 0;
  const items: CartLinePayload[] = [];
  for (const line of cart.items) {
    const p = map.get(String(line.productId));
    if (!p) {
      continue;
    }
    subtotal += p.price * line.quantity;
    items.push({
      lineId: `${String(line.productId)}::${line.selectedSize ?? ""}::${line.selectedColor ?? ""}`,
      productId: String(line.productId),
      quantity: line.quantity,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
      category: p.category,
      selectedSize: line.selectedSize,
      selectedColor: line.selectedColor,
    });
  }
  return { items, subtotal };
}
