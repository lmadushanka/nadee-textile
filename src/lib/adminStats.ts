import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

export type DashboardDayPoint = {
  date: string;
  label: string;
  sales: number;
  orders: number;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Local calendar date key YYYY-MM-DD */
function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function lastNDayKeys(n: number): string[] {
  const keys: string[] = [];
  const base = new Date();
  base.setHours(12, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    keys.push(localDateKey(d));
  }
  return keys;
}

function shortLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Daily sales (revenue, excluding cancelled) and order counts for the admin dashboard.
 */
export async function getDashboardDailySeries(days = 21): Promise<DashboardDayPoint[]> {
  await connectDB();
  const keys = lastNDayKeys(days);
  const start = new Date(keys[0] + "T00:00:00");
  const orders = await Order.find({ createdAt: { $gte: start } })
    .select("total status createdAt")
    .lean();

  const map = new Map<string, { sales: number; orders: number }>();
  for (const k of keys) {
    map.set(k, { sales: 0, orders: 0 });
  }

  for (const o of orders) {
    const created = o.createdAt as Date | undefined;
    if (!created) continue;
    const key = localDateKey(new Date(created));
    const bucket = map.get(key);
    if (!bucket) continue;
    bucket.orders += 1;
    if (o.status !== "cancelled") {
      bucket.sales += Number(o.total) || 0;
    }
  }

  return keys.map((date) => {
    const b = map.get(date)!;
    return {
      date,
      label: shortLabel(date),
      sales: b.sales,
      orders: b.orders,
    };
  });
}
