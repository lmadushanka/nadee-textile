/** Standard storefront / line-item rupee display (two decimals). */
export function formatRs(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  return `Rs. ${n.toFixed(2)}`;
}

/** Compact rupee labels for charts (e.g. Rs. 1.2M, Rs. 450k). */
export function formatRsAbbreviated(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `Rs. ${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `Rs. ${(n / 1000).toFixed(1)}k`;
  return `Rs. ${Math.round(n)}`;
}

/** Chart axis ticks: whole k / M where possible. */
export function formatRsAxisTick(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `Rs. ${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `Rs. ${(n / 1000).toFixed(0)}k`;
  return `Rs. ${Math.round(n)}`;
}
