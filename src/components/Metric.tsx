import type { CSSProperties, ReactNode } from "react";

export interface MetricProps {
  value: ReactNode;
  label: ReactNode;
}

const wrap: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
  fontFamily: "var(--font-sans)",
};
const num: CSSProperties = {
  fontSize: "var(--text-hero)",
  lineHeight: "var(--leading-hero)",
  fontWeight: "var(--weight-bold)",
  letterSpacing: "-0.025em",
  color: "var(--text)",
};
const lab: CSSProperties = {
  fontSize: "var(--text-caption)",
  lineHeight: "var(--leading-caption)",
  color: "var(--text-muted)",
};

/** Big number + small label — the core credibility unit. */
export function Metric({ value, label }: MetricProps) {
  return (
    <div style={wrap}>
      <span style={num}>{value}</span>
      <span style={lab}>{label}</span>
    </div>
  );
}
