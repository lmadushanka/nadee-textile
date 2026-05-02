import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/admin-auth";
import { Order } from "@/models/Order";

type Params = { params: Promise<{ id: string }> };

const ORDER_STATUSES = ["placed", "processing", "shipped", "cancelled"] as const;

const MAX_TRACKING_LEN = 120;

function normalizeTracking(raw: unknown): string {
  if (raw == null) return "";
  const s = typeof raw === "string" ? raw : String(raw);
  return s.trim().slice(0, MAX_TRACKING_LEN);
}

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
    const body = (await request.json()) as {
      status?: string;
      trackingNumber?: string | null;
    };
    const status = body.status?.trim();
    if (!status || !ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }

    await connectDB();
    const oid = new Types.ObjectId(id);

    /** Use native collection update so `trackingNumber` is never dropped by a stale Mongoose strict schema cache in dev. */
    const patch: { $set: Record<string, unknown>; $unset?: Record<string, 1> } = { $set: {} };

    if (status === "shipped") {
      const tn = normalizeTracking(body.trackingNumber);
      patch.$set.status = "shipped";
      if (tn) {
        patch.$set.trackingNumber = tn;
      } else {
        patch.$unset = { trackingNumber: 1 };
      }
    } else {
      patch.$set.status = status;
      patch.$unset = { trackingNumber: 1 };
    }

    const result = await Order.collection.updateOne({ _id: oid }, patch);
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await Order.findById(oid).lean().exec();
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const tnOut =
      typeof updated.trackingNumber === "string" && updated.trackingNumber.trim().length > 0
        ? updated.trackingNumber.trim()
        : null;

    return NextResponse.json({
      ok: true,
      order: {
        _id: String(updated._id),
        status: updated.status,
        trackingNumber: tnOut,
      },
    });
  } catch (e) {
    console.error("[admin-orders:patch]", e);
    return NextResponse.json(
      { error: "Could not update order status" },
      { status: 500 },
    );
  }
}
