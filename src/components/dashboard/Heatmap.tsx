import type { CSSProperties } from "react";
import type { HeatCell } from "@/lib/dashboard/queries";

const DAYS = [
  { i: 1, l: "Mon" },
  { i: 2, l: "Tue" },
  { i: 3, l: "Wed" },
  { i: 4, l: "Thu" },
  { i: 5, l: "Fri" },
  { i: 6, l: "Sat" },
  { i: 0, l: "Sun" },
];

const empty: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
};
const wrap: CSSProperties = { overflowX: "auto" };
const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "32px repeat(24, minmax(10px, 1fr))",
  gap: "2px",
  alignItems: "center",
  minWidth: "440px",
};
const dayLabel: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  color: "var(--text-muted)",
};
const hourLabel: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: "var(--text-muted)",
  textAlign: "center",
};
const caption: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  color: "var(--text-muted)",
  marginTop: "var(--space-3)",
};

export function Heatmap({ cells }: { cells: HeatCell[] }) {
  if (cells.length === 0) return <p style={empty}>No data yet.</p>;

  const matrix: number[][] = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  let max = 1;
  for (const c of cells) {
    if (c.dow >= 0 && c.dow < 7 && c.hour >= 0 && c.hour < 24) {
      matrix[c.dow]![c.hour] = c.value;
      if (c.value > max) max = c.value;
    }
  }

  const cell = (v: number): CSSProperties => ({
    height: "13px",
    borderRadius: "2px",
    background:
      v === 0
        ? "var(--surface-2)"
        : `color-mix(in oklab, var(--accent) ${Math.max(18, Math.round((v / max) * 100))}%, var(--surface-2))`,
  });

  return (
    <div style={wrap}>
      <div style={grid}>
        <span />
        {Array.from({ length: 24 }, (_, h) => (
          <span key={`h${h}`} style={hourLabel}>
            {h % 6 === 0 ? h : ""}
          </span>
        ))}
        {DAYS.map((d) => (
          <Row key={d.i} label={d.l} row={matrix[d.i]!} cellStyle={cell} />
        ))}
      </div>
      <div style={caption}>Times in Buenos Aires (UTC−3). Darker = more pageviews.</div>
    </div>
  );
}

function Row({
  label,
  row,
  cellStyle,
}: {
  label: string;
  row: number[];
  cellStyle: (v: number) => CSSProperties;
}) {
  return (
    <>
      <span style={dayLabel}>{label}</span>
      {row.map((v, h) => (
        <span key={h} style={cellStyle(v)} title={`${label} ${h}:00 · ${v}`} />
      ))}
    </>
  );
}

