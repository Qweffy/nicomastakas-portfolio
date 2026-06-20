"use client";

import type { CSSProperties } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/dashboard/format";
import type { SeriesPoint } from "@/lib/dashboard/queries";

const HEIGHT = 280;

const wrap: CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--space-4)" };
const empty: CSSProperties = {
  ...wrap,
  alignItems: "center",
  justifyContent: "center",
  height: `${HEIGHT}px`,
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

const tick = { fill: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 } as const;
const tooltipStyle: CSSProperties = {
  background: "var(--surface)",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-sm)",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
};

function formatBucket(value: string, bucket: "hour" | "day"): string {
  // Buckets come back as Buenos Aires wall-time text with no offset
  // (date_trunc(..., ts AT TIME ZONE tz)::text); read them as UTC so the rendered
  // numbers match that wall time regardless of the server's own timezone.
  const d = new Date(`${value.replace(" ", "T")}Z`);
  if (Number.isNaN(d.getTime())) return value;
  return bucket === "hour"
    ? d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        timeZone: "UTC",
      })
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

  const data = series.map((p) => ({
    label: formatBucket(p.bucket, bucket),
    pageviews: p.pageviews,
    visitors: p.visitors,
  }));
  const first = data[0];
  const peak = first
    ? data.reduce((best, p) => (p.pageviews > best.pageviews ? p : best), first)
    : null;

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
          <span
            style={{ width: "14px", height: 0, borderTop: "2px dashed var(--chart-series-2)" }}
          />
          Visitors
        </span>
      </div>

      <ResponsiveContainer width="100%" height={HEIGHT}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 12, bottom: 0, left: 0 }}
          accessibilityLayer
        >
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeWidth={1} />
          <XAxis
            dataKey="label"
            tick={tick}
            tickLine={false}
            axisLine={{ stroke: "var(--chart-grid)" }}
            tickMargin={8}
            minTickGap={48}
            interval="preserveStartEnd"
            padding={{ left: 28, right: 28 }}
          />
          <YAxis
            tick={tick}
            tickLine={false}
            axisLine={false}
            width={36}
            allowDecimals={false}
            tickFormatter={(v: number) => formatNumber(v)}
          />
          <Tooltip
            cursor={{ stroke: "var(--chart-grid)", strokeWidth: 1 }}
            contentStyle={tooltipStyle}
            labelStyle={{ color: "var(--text-muted)" }}
            itemStyle={{ color: "var(--text)" }}
          />
          <Area
            type="monotone"
            dataKey="pageviews"
            name="Pageviews"
            stroke="var(--chart-series-1)"
            strokeWidth={2}
            fill="var(--chart-area)"
            isAnimationActive={false}
            dot={false}
            activeDot={{
              r: 3.5,
              fill: "var(--chart-series-1)",
              stroke: "var(--bg)",
              strokeWidth: 2,
            }}
          />
          <Line
            type="monotone"
            dataKey="visitors"
            name="Visitors"
            stroke="var(--chart-series-2)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
          {peak ? (
            <ReferenceDot
              x={peak.label}
              y={peak.pageviews}
              r={3.5}
              fill="var(--bg)"
              stroke="var(--chart-peak)"
              strokeWidth={2}
              label={{
                value: `peak ${formatNumber(peak.pageviews)}`,
                position: "top",
                fill: "var(--text)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
