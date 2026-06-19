import type { CSSProperties } from "react";
import { formatNumber } from "@/lib/dashboard/format";
import type { FunnelStep } from "@/lib/dashboard/queries";

const empty: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
};
const list: CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--space-4)" };
const head: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: "var(--space-3)",
  marginBottom: "var(--space-2)",
};
const label: CSSProperties = { fontSize: "var(--text-body)", color: "var(--text)" };
const val: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  whiteSpace: "nowrap",
};
const track: CSSProperties = {
  height: "10px",
  borderRadius: "var(--radius-sm)",
  background: "var(--surface-2)",
  overflow: "hidden",
};
const fill: CSSProperties = { height: "100%", background: "var(--accent)", borderRadius: "var(--radius-sm)" };

export function Funnel({ steps }: { steps: FunnelStep[] }) {
  const top = steps[0]?.value ?? 0;
  if (top === 0) return <p style={empty}>No data for this range</p>;

  return (
    <div style={list}>
      {steps.map((s) => {
        const pct = Math.round((s.value / top) * 100);
        return (
          <div key={s.label}>
            <div style={head}>
              <span style={label}>{s.label}</span>
              <span style={val}>
                {formatNumber(s.value)} · {pct}%
              </span>
            </div>
            <div style={track}>
              <span style={{ ...fill, width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
