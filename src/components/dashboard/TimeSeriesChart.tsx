import type { CSSProperties } from "react";
import { formatNumber } from "@/lib/dashboard/format";
import type { SeriesPoint } from "@/lib/dashboard/queries";

const W = 800;
const H = 260;
const PAD_L = 8;
const PAD_R = 8;
const PAD_T = 16;
const PAD_B = 24;
const INNER_W = W - PAD_L - PAD_R;
const INNER_H = H - PAD_T - PAD_B;

const wrap: CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--space-4)" };
const empty: CSSProperties = {
  ...wrap,
  alignItems: "center",
  justifyContent: "center",
  height: `${H}px`,
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  border: "1px dashed var(--border)",
  borderRadius: "var(--radius-md)",
};
const legend: CSSProperties = { display: "flex", gap: "var(--space-6)", alignItems: "center" };
const legItem: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
};
const axisRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  letterSpacing: "var(--tracking-label)",
};

function formatBucket(value: string, bucket: "hour" | "day"): string {
  // Buckets come back as Buenos Aires wall-time text with no offset
  // (date_trunc(..., ts AT TIME ZONE tz)::text); read them as UTC so the rendered
  // numbers match that wall time regardless of the server's own timezone.
  const d = new Date(`${value.replace(" ", "T")}Z`);
  if (Number.isNaN(d.getTime())) return value;
  return bucket === "hour"
    ? d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", timeZone: "UTC" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function TimeSeriesChart({
  series,
  bucket,
}: {
  series: SeriesPoint[];
  bucket: "hour" | "day";
}) {
  if (series.length === 0) return <div style={empty}>No traffic in this range</div>;

  const n = series.length;
  const maxV = Math.max(...series.flatMap((p) => [p.pageviews, p.visitors]), 1);
  const x = (i: number) => PAD_L + (n === 1 ? INNER_W / 2 : (i / (n - 1)) * INNER_W);
  const y = (v: number) => PAD_T + INNER_H - (v / maxV) * INNER_H;

  const areaPts = series.map((p, i) => `${x(i).toFixed(1)},${y(p.pageviews).toFixed(1)}`);
  const linePts = series.map((p, i) => `${x(i).toFixed(1)},${y(p.visitors).toFixed(1)}`);
  const areaPath = `M ${PAD_L},${PAD_T + INNER_H} L ${areaPts.join(" L ")} L ${PAD_L + INNER_W},${PAD_T + INNER_H} Z`;
  const linePath = `M ${linePts.join(" L ")}`;

  const peakIdx = series.reduce(
    (best, p, i) => (p.pageviews > (series[best]?.pageviews ?? 0) ? i : best),
    0,
  );
  const peak = series[peakIdx];
  const peakX = x(peakIdx);
  const peakY = peak ? y(peak.pageviews) : 0;
  // Keep the "peak N" label inside the chart: drop it below the point when the peak
  // sits near the top edge (the common case when traffic is flat at the max).
  const peakLabelY = peakY - 10 < PAD_T + 14 ? peakY + 20 : peakY - 10;
  const peakAnchor = peakIdx > n * 0.7 ? "end" : peakIdx < n * 0.3 ? "start" : "middle";
  const grids = [0, 0.5, 1].map((g) => PAD_T + INNER_H - g * INNER_H);

  return (
    <div style={wrap}>
      <div style={legend}>
        <span style={legItem}>
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "2px",
              background: "var(--chart-series-1)",
              opacity: 0.85,
            }}
          />
          Pageviews
        </span>
        <span style={legItem}>
          <span style={{ width: "12px", height: "2px", background: "var(--chart-series-2)" }} />
          Visitors
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={280}
        preserveAspectRatio="none"
        role="img"
        aria-label="Pageviews and visitors over time"
      >
        {grids.map((gy) => (
          <line
            key={gy}
            x1={PAD_L}
            y1={gy}
            x2={PAD_L + INNER_W}
            y2={gy}
            stroke="var(--chart-grid)"
            strokeWidth="1"
          />
        ))}
        <path d={areaPath} fill="var(--chart-area)" stroke="none" />
        <polyline
          points={areaPts.join(" ")}
          fill="none"
          stroke="var(--chart-series-1)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={linePath}
          fill="none"
          stroke="var(--chart-series-2)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {peak ? (
          <>
            <line
              x1={peakX}
              y1={PAD_T}
              x2={peakX}
              y2={PAD_T + INNER_H}
              stroke="var(--chart-peak)"
              strokeWidth="1"
              strokeOpacity="0.4"
            />
            <circle
              cx={peakX}
              cy={y(peak.pageviews)}
              r="3.5"
              fill="var(--bg)"
              stroke="var(--chart-peak)"
              strokeWidth="2"
            />
            <text
              x={peakX}
              y={peakLabelY}
              textAnchor={peakAnchor}
              fill="var(--text)"
              fontFamily="var(--font-mono)"
              fontSize="13"
            >
              peak {formatNumber(peak.pageviews)}
            </text>
          </>
        ) : null}
      </svg>

      <div style={axisRow}>
        <span>{formatBucket(series[0]?.bucket ?? "", bucket)}</span>
        {n >= 3 ? (
          <span>{formatBucket(series[Math.floor((n - 1) / 2)]?.bucket ?? "", bucket)}</span>
        ) : null}
        <span>{formatBucket(series[n - 1]?.bucket ?? "", bucket)}</span>
      </div>
    </div>
  );
}
