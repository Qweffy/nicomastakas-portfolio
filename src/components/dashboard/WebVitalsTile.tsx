import type { CSSProperties } from "react";

const tile: CSSProperties = {
  background: "var(--surface)",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-6)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-4)",
  boxSizing: "border-box",
  minWidth: 0,
};
const topRow: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "var(--space-3)",
};
const nameStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  letterSpacing: "var(--tracking-label)",
  textTransform: "uppercase",
  color: "var(--text-muted)",
};
const valueStyle: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "var(--text-card-title)",
  fontWeight: "var(--weight-semibold)",
  color: "var(--text)",
  lineHeight: 1,
};
const unitStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  marginLeft: "var(--space-1)",
};
const barWrap: CSSProperties = {
  position: "relative",
  height: "6px",
  borderRadius: "var(--radius-sm)",
  overflow: "hidden",
  display: "flex",
};

const clampPct = (n: number, scale: number) => Math.max(0, Math.min(100, (n / scale) * 100));

export function WebVitalsTile({
  name,
  value,
  unit = "",
  thresholds,
  max,
}: {
  name: string;
  value: number;
  unit?: string;
  thresholds: [number, number];
  max?: number;
}) {
  const [goodMax, niMax] = thresholds;
  const scaleMax = max ?? niMax * 1.35;

  const rating = value <= goodMax ? "Good" : value <= niMax ? "Needs work" : "Poor";
  const color =
    value <= goodMax
      ? "var(--vital-good)"
      : value <= niMax
        ? "var(--vital-ni)"
        : "var(--vital-poor)";

  const goodW = clampPct(goodMax, scaleMax);
  const niW = clampPct(niMax, scaleMax) - goodW;
  const poorW = 100 - clampPct(niMax, scaleMax);
  const markerPct = clampPct(value, scaleMax);
  const display = unit ? Math.round(value).toLocaleString() : value.toFixed(2);

  return (
    <div style={tile}>
      <div style={topRow}>
        <span style={nameStyle}>{name}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color }}>
          {rating}
        </span>
      </div>
      <div>
        <span style={valueStyle}>{display}</span>
        {unit ? <span style={unitStyle}>{unit}</span> : null}
      </div>
      <div style={{ position: "relative" }}>
        <div style={barWrap}>
          <span style={{ width: `${goodW}%`, background: "var(--zone-good)" }} />
          <span style={{ width: `${niW}%`, background: "var(--zone-ni)" }} />
          <span style={{ width: `${poorW}%`, background: "var(--zone-poor)" }} />
        </div>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-3px",
            left: `calc(${markerPct}% - 1px)`,
            width: "2px",
            height: "12px",
            background: "var(--text)",
            borderRadius: "1px",
          }}
        />
      </div>
    </div>
  );
}
