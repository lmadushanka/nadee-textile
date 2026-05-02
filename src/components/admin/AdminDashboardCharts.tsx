"use client";

import type { DashboardDayPoint } from "@/lib/adminStats";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = { data: DashboardDayPoint[] };

function formatRs(n: number) {
  if (n >= 1_000_000) return `Rs. ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `Rs. ${(n / 1000).toFixed(1)}k`;
  return `Rs. ${Math.round(n)}`;
}

function formatRsAxis(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(Math.round(n));
}

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.96)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "0 8px 24px rgba(12,18,34,0.12)",
};

const axisTick = { fill: "var(--muted)", fontSize: 11 };
const gridStroke = "rgba(12, 18, 34, 0.06)";

export function AdminDashboardCharts({ data }: Props) {
  const empty = data.length === 0 || data.every((d) => d.sales === 0 && d.orders === 0);

  return (
    <div className="mt-8 grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <article className="min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="font-display text-lg font-semibold text-[var(--ink)] sm:text-xl">
            Sales
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Revenue per day (excl. cancelled)
          </p>
        </div>
        <div className="mt-4 h-[200px] w-full min-w-0 sm:h-[240px] lg:h-[260px]">
          {empty ? (
            <p className="flex h-full items-center justify-center text-center text-sm text-[var(--muted)]">
              No order data in this period yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 6, right: 4, left: -6, bottom: 4 }}>
                <defs>
                  <linearGradient id="adminSalesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={{ stroke: gridStroke }}
                  interval="preserveStartEnd"
                  angle={-32}
                  textAnchor="end"
                  height={52}
                  dy={6}
                />
                <YAxis
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={formatRsAxis}
                />
                <Tooltip
                  formatter={(value) => [formatRs(Number(value)), "Sales"]}
                  labelFormatter={(label, payload) =>
                    (payload?.[0]?.payload as DashboardDayPoint | undefined)?.date ??
                    String(label ?? "")
                  }
                  contentStyle={tooltipStyle}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#adminSalesFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>

      <article className="min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="font-display text-lg font-semibold text-[var(--ink)] sm:text-xl">
            Orders
          </h2>
          <p className="text-xs text-[var(--muted)]">Orders placed per day</p>
        </div>
        <div className="mt-4 h-[200px] w-full min-w-0 sm:h-[240px] lg:h-[260px]">
          {empty ? (
            <p className="flex h-full items-center justify-center text-center text-sm text-[var(--muted)]">
              No order data in this period yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 6, right: 4, left: -18, bottom: 4 }} barCategoryGap="18%">
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={{ stroke: gridStroke }}
                  interval="preserveStartEnd"
                  angle={-32}
                  textAnchor="end"
                  height={52}
                  dy={6}
                />
                <YAxis
                  allowDecimals={false}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <Tooltip
                  formatter={(value) => [Number(value), "Orders"]}
                  labelFormatter={(label, payload) =>
                    (payload?.[0]?.payload as DashboardDayPoint | undefined)?.date ??
                    String(label ?? "")
                  }
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="orders" name="Orders" fill="var(--accent-deep)" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>
    </div>
  );
}
