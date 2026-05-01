import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/admin-auth";
import { Order } from "@/models/Order";

type Params = { params: Promise<{ id: string }> };

const ORDER_STATUSES = ["placed", "processing", "shipped", "cancelled"] as const;

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }
  try {
    const body = (await request.json()) as { status?: string };
    const status = body.status?.trim();
    if (!status || !ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }
    await connectDB();
    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true })
      .lean()
      .exec();
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      order: { _id: String(updated._id), status: updated.status },
    });
  } catch (e) {
    console.error("[admin-orders:patch]", e);
    return NextResponse.json(
      { error: "Could not update order status" },
      { status: 500 },
    );
  }
}
