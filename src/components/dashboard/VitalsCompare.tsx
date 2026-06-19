import type { CSSProperties } from "react";
import type { VitalByDevice } from "@/lib/dashboard/queries";

const ORDER = ["LCP", "INP", "CLS", "FCP", "TTFB"];

const empty: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
};
const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto auto",
  gap: "var(--space-3) var(--space-6)",
  alignItems: "baseline",
};
const head: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  letterSpacing: "var(--tracking-label)",
  textTransform: "uppercase",
  color: "var(--text-muted)",
};
const name: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)" };
const value: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "var(--text-body)",
  color: "var(--text)",
  textAlign: "right",
};

function fmt(name: string, v: number | null): string {
  if (v == null) return "·";
  if (name === "CLS") return v.toFixed(2);
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${Math.round(v)}ms`;
}

export function VitalsCompare({ rows }: { rows: VitalByDevice[] }) {
  const present = ORDER.map((n) => rows.find((r) => r.name === n)).filter(
    (r): r is VitalByDevice => r !== undefined,
  );
  if (present.length === 0) return <p style={empty}>No data yet.</p>;

  return (
    <div style={grid}>
      <span style={head}>Metric</span>
      <span style={{ ...head, textAlign: "right" }}>Mobile</span>
      <span style={{ ...head, textAlign: "right" }}>Desktop</span>
      {present.map((r) => (
        <Cells key={r.name} r={r} />
      ))}
    </div>
  );
}

function Cells({ r }: { r: VitalByDevice }) {
  return (
    <>
      <span style={name}>{r.name}</span>
      <span style={value}>{fmt(r.name, r.mobile)}</span>
      <span style={value}>{fmt(r.name, r.desktop)}</span>
    </>
  );
}
