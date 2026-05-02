import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/admin-auth";
import { Order, type OrderLine } from "@/models/Order";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    await connectDB();
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return NextResponse.json(
      orders.map((o) => ({
        _id: String(o._id),
        userId: String(o.userId),
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
    console.error("[admin-orders:get]", e);
    return NextResponse.json({ error: "Could not load orders" }, { status: 500 });
  }
}
