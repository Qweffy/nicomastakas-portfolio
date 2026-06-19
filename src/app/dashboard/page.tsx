import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Panel } from "@/components/dashboard/Panel";
import { RangeTabs } from "@/components/dashboard/RangeTabs";
import { RankedBarList } from "@/components/dashboard/RankedBarList";
import { TimeSeriesChart } from "@/components/dashboard/TimeSeriesChart";
import { WebVitalsTile } from "@/components/dashboard/WebVitalsTile";
import { isAuthed } from "@/lib/dashboard/auth";
import { formatDuration, formatNumber, formatPercent } from "@/lib/dashboard/format";
import { getStats, normalizeRange, type Stats } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

const EVENT_LABELS: Record<string, string> = {
  cv_download: "CV downloads",
  outbound: "Outbound clicks",
  contact: "Contact clicks",
  scroll: "Scroll depth",
};

const VITALS: Record<string, { unit: string; thresholds: [number, number]; max?: number }> = {
  LCP: { unit: "ms", thresholds: [2500, 4000] },
  INP: { unit: "ms", thresholds: [200, 500] },
  CLS: { unit: "", thresholds: [0.1, 0.25], max: 0.4 },
  FCP: { unit: "ms", thresholds: [1800, 3000] },
  TTFB: { unit: "ms", thresholds: [800, 1800] },
};
const VITAL_ORDER = ["LCP", "INP", "CLS", "FCP", "TTFB"];

const wrap: CSSProperties = {
  minHeight: "100vh",
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "var(--font-sans)",
};
const container: CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "var(--space-12) var(--space-8)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-8)",
  boxSizing: "border-box",
};
const header: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-6)",
  flexWrap: "wrap",
};
const titleStyle: CSSProperties = {
  fontSize: "var(--text-section)",
  fontWeight: "var(--weight-semibold)",
  letterSpacing: "-0.015em",
  margin: 0,
};
const controls: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-4)",
  flexWrap: "wrap",
};
const logoutBtn: CSSProperties = {
  background: "transparent",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-sm)",
  color: "var(--text-muted)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  padding: "var(--space-2) var(--space-3)",
  cursor: "pointer",
  whiteSpace: "nowrap",
};
const errorCard: CSSProperties = {
  background: "var(--surface)",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-8)",
  color: "var(--text-muted)",
  fontSize: "var(--text-body)",
  lineHeight: "var(--leading-body)",
};
const mono: CSSProperties = { fontFamily: "var(--font-mono)", color: "var(--text)" };
const vitalsEmpty: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  if (!(await isAuthed())) redirect("/dashboard/login");

  const { range: rangeParam } = await searchParams;
  const range = normalizeRange(rangeParam);

  let stats: Stats | null = null;
  let errorMsg: string | null = null;
  try {
    stats = await getStats(range);
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <div style={wrap}>
      <main style={container} className="nm-dash-main">
        <header style={header}>
          <h1 style={titleStyle}>Analytics</h1>
          <div style={controls}>
            <RangeTabs active={range} />
            <form method="post" action="/api/dashboard-logout">
              <button type="submit" style={logoutBtn} className="nm-focusable">
                Log out
              </button>
            </form>
          </div>
        </header>

        {errorMsg || !stats ? (
          <div style={errorCard}>
            <p style={{ margin: 0 }}>
              Could not load analytics. Make sure <span style={mono}>DATABASE_URL</span> is set and
              the schema is pushed (<span style={mono}>pnpm db:push</span>).
            </p>
            {errorMsg ? (
              <p style={{ margin: "var(--space-3) 0 0", ...mono, fontSize: "var(--text-caption)" }}>
                {errorMsg}
              </p>
            ) : null}
          </div>
        ) : (
          <DashboardBody stats={stats} />
        )}
      </main>
    </div>
  );
}

function DashboardBody({ stats }: { stats: Stats }) {
  const eventItems = stats.events.map((e) => ({
    label: EVENT_LABELS[e.label] ?? e.label,
    value: e.value,
  }));
  const vitalTiles = VITAL_ORDER.map((name) => {
    const v = stats.vitals.find((x) => x.name === name);
    const cfg = VITALS[name];
    if (!v || !cfg) return null;
    return { name, value: v.p75, ...cfg };
  }).filter((v): v is NonNullable<typeof v> => v !== null);

  const grid: CSSProperties = { display: "grid", gap: "var(--space-6)" };
  const kpiGrid: CSSProperties = { display: "grid", gap: "var(--space-4)" };

  return (
    <>
      <div style={kpiGrid} className="nm-dash-kpis">
        <KpiCard
          label="Visitors"
          value={formatNumber(stats.kpis.visitors)}
          now={stats.kpis.visitors}
          prev={stats.kpis.visitorsPrev}
          sub="vs prev"
        />
        <KpiCard
          label="Pageviews"
          value={formatNumber(stats.kpis.pageviews)}
          now={stats.kpis.pageviews}
          prev={stats.kpis.pageviewsPrev}
          sub="vs prev"
        />
        <KpiCard
          label="Avg. time"
          value={formatDuration(stats.kpis.avgEngagementMs)}
          now={stats.kpis.avgEngagementMs}
          prev={stats.kpis.avgEngagementPrevMs}
          sub="vs prev"
        />
        <KpiCard
          label="Bounce rate"
          value={formatPercent(stats.kpis.bounceRate)}
          sub="single-page visits"
        />
      </div>

      <Panel title="Traffic">
        <TimeSeriesChart series={stats.series} bucket={stats.bucket} />
      </Panel>

      <div style={grid} className="nm-dash-2">
        <Panel title="Top pages" padded={false}>
          <RankedBarList items={stats.topPages} />
        </Panel>
        <Panel title="Sources" padded={false}>
          <RankedBarList items={stats.referrers} />
        </Panel>
      </div>

      <div style={grid} className="nm-dash-2">
        <Panel title="Countries" padded={false}>
          <RankedBarList items={stats.countries} />
        </Panel>
        <Panel title="Events" padded={false}>
          <RankedBarList items={eventItems} />
        </Panel>
      </div>

      <div style={grid} className="nm-dash-3">
        <Panel title="Devices" padded={false}>
          <RankedBarList items={stats.devices} />
        </Panel>
        <Panel title="Browsers" padded={false}>
          <RankedBarList items={stats.browsers} />
        </Panel>
        <Panel title="OS" padded={false}>
          <RankedBarList items={stats.os} />
        </Panel>
      </div>

      <Panel title="Core Web Vitals · p75">
        {vitalTiles.length === 0 ? (
          <p style={vitalsEmpty}>No data for this range</p>
        ) : (
          <div style={grid} className="nm-dash-3">
            {vitalTiles.map((v) => (
              <WebVitalsTile
                key={v.name}
                name={v.name}
                value={v.value}
                unit={v.unit}
                thresholds={v.thresholds}
                max={v.max}
              />
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
