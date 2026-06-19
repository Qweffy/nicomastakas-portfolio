import type { CSSProperties } from "react";

export type DeltaDirection = "up" | "down" | "flat";

// Flat uses a neutral middot (not the "->" arrow Nico dislikes).
const MAP: Record<DeltaDirection, { color: string; glyph: string }> = {
  up: { color: "var(--delta-up)", glyph: "↑" },
  down: { color: "var(--delta-down)", glyph: "↓" },
  flat: { color: "var(--delta-flat)", glyph: "·" },
};

const base: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-1)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  fontWeight: "var(--weight-medium)",
  lineHeight: 1,
  background: "color-mix(in oklab, currentColor 12%, transparent)",
  border: "1px solid color-mix(in oklab, currentColor 28%, transparent)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-1) var(--space-2)",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
};

/** Reusable up/down/flat pill showing change vs the previous period. */
export function DeltaBadge({ direction, value }: { direction: DeltaDirection; value: string }) {
  const { color, glyph } = MAP[direction];
  return (
    <span style={{ ...base, color }}>
      <span aria-hidden="true">{glyph}</span>
      <span>{value}</span>
    </span>
  );
}
