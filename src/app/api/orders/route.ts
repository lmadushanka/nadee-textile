import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/models/Cart";
import { Order, type OrderLine } from "@/models/Order";
import { Product } from "@/models/Product";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const orders = await Order.find({
      userId: new Types.ObjectId(session.user.id),
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return NextResponse.json(
      orders.map((o) => ({
        _id: String(o._id),
        total: Number(o.total ?? 0),
        status: o.status,
        trackingNumber:
          typeof o.trackingNumber === "string" && o.trackingNumber.trim().length > 0
            ? o.trackingNumber.trim()
            : null,
        createdAt: o.createdAt,
        shippingName: o.shippingName,
        shippingPhone: o.shippingPhone,
        shippingAddress: o.shippingAddress,
        shippingCity: o.shippingCity,
        lines: Array.isArray(o.lines)
          ? (o.lines as OrderLine[]).map((line) => ({
              name: line.name,
              unitPrice: Number(line.unitPrice ?? 0),
              quantity: Number(line.quantity ?? 0),
              imageUrl: line.imageUrl,
              selectedSize: line.selectedSize,
              selectedColor: line.selectedColor,
            }))
          : [],
      })),
    );
  } catch (e) {
    console.error("[orders:get]", e);
    return NextResponse.json({ error: "Could not load orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      shippingName?: string;
      shippingPhone?: string;
      shippingAddress?: string;
      shippingCity?: string;
    };
    const shippingName = body.shippingName?.trim();
    const shippingPhone = body.shippingPhone?.trim();
    const shippingAddress = body.shippingAddress?.trim();
    const shippingCity = body.shippingCity?.trim();
    if (!shippingName || !shippingPhone || !shippingAddress || !shippingCity) {
      return NextResponse.json(
        { error: "All shipping fields are required" },
        { status: 400 },
      );
    }

    await connectDB();
    const userOid = new Types.ObjectId(session.user.id);
    const cart = await Cart.findOne({ userId: userOid });
    if (!cart?.items.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const lines: {
      productId: Types.ObjectId;
      name: string;
      unitPrice: number;
      quantity: number;
      imageUrl: string;
      selectedSize?: string;
      selectedColor?: string;
    }[] = [];
    let total = 0;

    for (const item of cart.items) {
      const p = await Product.findById(item.productId).lean();
      if (!p) {
        continue;
      }
      const unitPrice = p.price;
      const quantity = item.quantity;
      total += unitPrice * quantity;
      lines.push({
        productId: new Types.ObjectId(String(p._id)),
        name: p.name,
        unitPrice,
        quantity,
        imageUrl: p.imageUrl,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      });
    }

    if (!lines.length) {
      return NextResponse.json(
        { error: "No valid products in cart" },
        { status: 400 },
      );
    }

    const order = await Order.create({
      userId: userOid,
      lines,
      total,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      status: "placed",
    });

    cart.items = [];
    await cart.save();

    return NextResponse.json({ ok: true, orderId: String(order._id) });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not place order" },
      { status: 500 },
    );
  }
}
