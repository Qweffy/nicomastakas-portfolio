export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
  return String(n);
}

export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export type Delta = { pct: number; dir: "up" | "down" | "flat" };

export function delta(now: number, prev: number): Delta {
  if (prev === 0) return { pct: now > 0 ? 100 : 0, dir: now > 0 ? "up" : "flat" };
  const pct = Math.round(((now - prev) / prev) * 100);
  return { pct: Math.abs(pct), dir: pct > 0 ? "up" : pct < 0 ? "down" : "flat" };
}
