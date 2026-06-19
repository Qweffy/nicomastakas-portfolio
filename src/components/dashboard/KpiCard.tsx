import type { CSSProperties } from "react";
import { delta as computeDelta } from "@/lib/dashboard/format";
import { DeltaBadge } from "./DeltaBadge";
import { InfoTip } from "./InfoTip";

const card: CSSProperties = {
  background: "var(--surface)",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-6)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
  boxSizing: "border-box",
  minWidth: 0,
};
const label: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  letterSpacing: "var(--tracking-label)",
  textTransform: "uppercase",
  color: "var(--text-muted)",
};
const value: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "var(--text-section)",
  fontWeight: "var(--weight-semibold)",
  letterSpacing: "-0.015em",
  color: "var(--text)",
  lineHeight: 1,
};
const deltaRow: CSSProperties = { display: "flex", alignItems: "center", gap: "var(--space-2)" };
const sub: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
};

const labelRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-2)",
};

export function KpiCard({
  label: labelText,
  value: valueText,
  now,
  prev,
  sub: subText,
  info,
}: {
  label: string;
  value: string;
  now?: number;
  prev?: number;
  sub?: string;
  info?: string;
}) {
  const d = now !== undefined && prev !== undefined ? computeDelta(now, prev) : null;
  return (
    <div style={card}>
      <div style={labelRow}>
        <span style={label}>{labelText}</span>
        {info ? <InfoTip text={info} /> : null}
      </div>
      <span style={value}>{valueText}</span>
      {d ? (
        <div style={deltaRow}>
          <DeltaBadge direction={d.dir} value={`${d.pct}%`} />
          {subText ? <span style={sub}>{subText}</span> : null}
        </div>
      ) : subText ? (
        <span style={sub}>{subText}</span>
      ) : null}
    </div>
  );
}
