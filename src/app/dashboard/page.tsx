import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AutoRefresh } from "@/components/dashboard/AutoRefresh";
import { Funnel } from "@/components/dashboard/Funnel";
import { Heatmap } from "@/components/dashboard/Heatmap";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Panel } from "@/components/dashboard/Panel";
import { RangeTabs } from "@/components/dashboard/RangeTabs";
import { RankedBarList } from "@/components/dashboard/RankedBarList";
import { ReadingDepth } from "@/components/dashboard/ReadingDepth";
import { TimeSeriesChart } from "@/components/dashboard/TimeSeriesChart";
import { VitalsCompare } from "@/components/dashboard/VitalsCompare";
import { WebVitalsTile } from "@/components/dashboard/WebVitalsTile";
import { isAuthed } from "@/lib/dashboard/auth";
import { formatDuration, formatNumber, formatPercent } from "@/lib/dashboard/format";
import { getStats, normalizeRange, type Stats } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

const CLICK_LABELS: Record<string, string> = {
  cv_download: "CV downloads",
  outbound: "Outbound clicks",
  contact: "Contact clicks",
  project_card: "Project cards",
  more_work: "More-work links",
  repo: "Repo links",
  demo: "Live demo",
  case_study: "Case study",
  design_card: "Design cards",
  nav: "Nav links",
  footer: "Footer links",
  social: "Social links",
};
const LANG_LABELS: Record<string, string> = { en: "Inglés", es: "Español" };

const PAGE_NAMES: Record<string, string> = { "/": "Home", "/work": "Work", "/design": "Design" };
function titleizeSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
// Turn a stored path into a readable "Page · Lang" label. The site uses as-needed
// locale prefixes, so "/" is the English home and "/es" the Spanish one, etc.
function prettyPath(path: string): string {
  const isEs = path === "/es" || path.startsWith("/es/");
  const logical = isEs ? path.replace(/^\/es/, "") || "/" : path;
  const seg = logical.match(/^\/(?:work|design)\/([^/?#]+)/);
  const name = seg?.[1] ? titleizeSlug(seg[1]) : (PAGE_NAMES[logical] ?? logical);
  return `${name} · ${isEs ? "Español" : "Inglés"}`;
}

const VITALS: Record<
  string,
  { unit: string; thresholds: [number, number]; max?: number; info: string }
> = {
  LCP: { unit: "ms", thresholds: [2500, 4000], info: "Largest Contentful Paint: cuánto tarda en aparecer el contenido principal. Bueno: menos de 2,5s." },
  INP: { unit: "ms", thresholds: [200, 500], info: "Interaction to Next Paint: qué tan rápido responde la página al interactuar. Bueno: menos de 200ms." },
  CLS: { unit: "", thresholds: [0.1, 0.25], max: 0.4, info: "Cumulative Layout Shift: cuánto se mueve el layout mientras carga. Bueno: menos de 0,1." },
  FCP: { unit: "ms", thresholds: [1800, 3000], info: "First Contentful Paint: cuándo aparece el primer contenido. Bueno: menos de 1,8s." },
  TTFB: { unit: "ms", thresholds: [800, 1800], info: "Time To First Byte: cuánto tarda el servidor en responder. Bueno: menos de 0,8s." },
};
const VITAL_ORDER = ["LCP", "INP", "CLS", "FCP", "TTFB"];

const INFO = {
  feed: "Las últimas visitas y eventos, lo más nuevo arriba. Lo verde es alto valor (CV/contacto). Se actualiza al recargar.",
  visitors: "Personas únicas que entraron en el período. Sin cookies, con un hash que se renueva cada día (si vuelven otro día, cuentan como nuevo).",
  pageviews: "Total de páginas vistas. Una misma persona puede sumar varias.",
  avgTime: "Tiempo promedio que la gente pasa de verdad en cada página (solo cuando la pestaña está visible).",
  bounce: "Porcentaje de visitas que vieron una sola página y se fueron. Más bajo es mejor.",
  traffic: "Pageviews (área) y visitantes únicos (línea) en el tiempo. El punto marca el pico.",
  topProjects: "Tus proyectos por interés: vistas de su página + clics en su card, demo o repo.",
  funnel: "El embudo: visitas → vieron un proyecto → exploraron a fondo → CV/contacto.",
  topPages: "Las páginas más vistas del sitio.",
  landing: "Por qué página ENTRAN al sitio (primera vista de cada visitante).",
  avgTimePage: "Tiempo promedio (solo visible) que pasan en cada página.",
  readingDepth: "Qué tan profundo leen cada case study (25/50/75/100% del scroll). Ves dónde abandonan.",
  clicks: "Todos los clics registrados, por tipo (cards, nav, social, demo, CV, contacto...).",
  outbound: "A qué links externos hacen clic (GitHub, LinkedIn, demos, repos).",
  channels: "De qué tipo de fuente vienen: Search (buscadores), Social, Direct o Referral.",
  sources: "El sitio exacto de origen. 'Direct' = entraron directo, sin referente.",
  campaigns: "Tráfico de tus links taggeados con UTM (GitHub/LinkedIn/CV).",
  countries: "Países de tus visitantes (por IP, sin guardarla). Clic en un país para ver sus ciudades.",
  cities: "Ciudades dentro del país elegido.",
  languages: "Visitantes por idioma del sitio (EN/ES).",
  devices: "Tipo de dispositivo: mobile, desktop o tablet.",
  browsers: "Navegador que usan (Chrome, Safari, Firefox...).",
  os: "Sistema operativo (macOS, Windows, iOS, Android, Linux...).",
  heatmap: "Cuándo te visitan, por día y hora (hora de Buenos Aires). Más oscuro = más vistas.",
  vitals: "Rendimiento real de Google medido en tus visitantes. p75 = el valor que cumplen el 75% de las cargas.",
  vitalsDevice: "Core Web Vitals comparados entre mobile y desktop (p75).",
} as const;

const wrap: CSSProperties = { minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-sans)" };
const container: CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "var(--space-12) var(--space-8)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-8)",
  boxSizing: "border-box",
};
const header: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-6)", flexWrap: "wrap" };
const titleGroup: CSSProperties = { display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" };
const titleStyle: CSSProperties = { fontSize: "var(--text-section)", fontWeight: "var(--weight-semibold)", letterSpacing: "-0.015em", margin: 0 };
const activeBadge: CSSProperties = { display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)", whiteSpace: "nowrap" };
const activeDot: CSSProperties = { width: "8px", height: "8px", borderRadius: "9999px", background: "var(--accent)", display: "inline-block" };
const controls: CSSProperties = { display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" };
const logoutBtn: CSSProperties = { background: "transparent", border: "var(--elevation-hairline)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", padding: "var(--space-2) var(--space-3)", cursor: "pointer", whiteSpace: "nowrap" };
const errorCard: CSSProperties = { background: "var(--surface)", border: "var(--elevation-hairline)", borderRadius: "var(--radius-md)", padding: "var(--space-8)", color: "var(--text-muted)", fontSize: "var(--text-body)", lineHeight: "var(--leading-body)" };
const mono: CSSProperties = { fontFamily: "var(--font-mono)", color: "var(--text)" };
const smallStat: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)" };
const backLink: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--accent)", textDecoration: "none" };
const vitalsEmpty: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; country?: string }>;
}) {
  if (!(await isAuthed())) redirect("/dashboard/login");

  const { range: rangeParam, country } = await searchParams;
  const range = normalizeRange(rangeParam);

  let stats: Stats | null = null;
  let errorMsg: string | null = null;
  try {
    stats = await getStats(range, { country });
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <div style={wrap}>
      <main style={container} className="nm-dash-main">
        <header style={header}>
          <div style={titleGroup}>
            <h1 style={titleStyle}>Analytics</h1>
            {stats ? (
              <span style={activeBadge}>
                <span style={activeDot} aria-hidden="true" />
                {stats.activeNow} active now
              </span>
            ) : null}
          </div>
          <div style={controls}>
            <RangeTabs active={range} />
            <form method="post" action="/api/dashboard-logout">
              <button type="submit" style={logoutBtn} className="nm-focusable">
                Log out
              </button>
            </form>
          </div>
        </header>

        <AutoRefresh intervalMs={60_000} />

        {errorMsg || !stats ? (
          <div style={errorCard}>
            <p style={{ margin: 0 }}>
              Could not load analytics. Make sure <span style={mono}>DATABASE_URL</span> is set and
              the schema is pushed (<span style={mono}>pnpm db:push</span>).
            </p>
            {errorMsg ? (
              <p style={{ margin: "var(--space-3) 0 0", ...mono, fontSize: "var(--text-caption)" }}>{errorMsg}</p>
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
  const showDelta = stats.range !== "all";
  const deltaSub = showDelta ? "vs prev" : "all time";
  const clickItems = stats.clicks.map((c) => ({ label: CLICK_LABELS[c.label] ?? c.label, value: c.value }));
  const languageItems = stats.languages.map((l) => ({ label: LANG_LABELS[l.label] ?? l.label, value: l.value }));
  const pageItems = stats.topPages.map((p) => ({ label: prettyPath(p.label), value: p.value }));
  const landingItems = stats.landing.map((p) => ({ label: prettyPath(p.label), value: p.value }));
  const avgTimeItems = stats.avgTimePerPage.map((p) => ({ label: prettyPath(p.label), value: p.value }));
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
      <Panel title="Live activity" info={INFO.feed}>
        <ActivityFeed items={stats.feed} />
      </Panel>

      <div style={kpiGrid} className="nm-dash-kpis">
        <KpiCard label="Visitors" value={formatNumber(stats.kpis.visitors)} now={showDelta ? stats.kpis.visitors : undefined} prev={showDelta ? stats.kpis.visitorsPrev : undefined} sub={deltaSub} info={INFO.visitors} />
        <KpiCard label="Pageviews" value={formatNumber(stats.kpis.pageviews)} now={showDelta ? stats.kpis.pageviews : undefined} prev={showDelta ? stats.kpis.pageviewsPrev : undefined} sub={deltaSub} info={INFO.pageviews} />
        <KpiCard label="Avg. time" value={formatDuration(stats.kpis.avgEngagementMs)} now={showDelta ? stats.kpis.avgEngagementMs : undefined} prev={showDelta ? stats.kpis.avgEngagementPrevMs : undefined} sub={deltaSub} info={INFO.avgTime} />
        <KpiCard label="Bounce rate" value={formatPercent(stats.kpis.bounceRate)} sub="single-page visits" info={INFO.bounce} />
      </div>

      <Panel title="Traffic" info={INFO.traffic}>
        <TimeSeriesChart series={stats.series} bucket={stats.bucket} />
      </Panel>

      <div style={grid} className="nm-dash-2">
        <Panel title="Top projects" padded={false} info={INFO.topProjects}>
          <RankedBarList items={stats.topProjects} />
        </Panel>
        <Panel title="Funnel" info={INFO.funnel}>
          <Funnel steps={stats.funnel} />
        </Panel>
      </div>

      <div style={grid} className="nm-dash-2">
        <Panel title="Top pages" padded={false} info={INFO.topPages}>
          <RankedBarList items={pageItems} />
        </Panel>
        <Panel
          title="Landing pages"
          padded={false}
          info={INFO.landing}
          action={<span style={smallStat}>{stats.pagesPerVisit.toFixed(1)} pages/visit</span>}
        >
          <RankedBarList items={landingItems} />
        </Panel>
      </div>

      <div style={grid} className="nm-dash-2">
        <Panel title="Avg time per page" padded={false} info={INFO.avgTimePage}>
          <RankedBarList items={avgTimeItems} formatValue={formatDuration} />
        </Panel>
        <Panel title="Reading depth" info={INFO.readingDepth}>
          <ReadingDepth rows={stats.readingDepth} />
        </Panel>
      </div>

      <div style={grid} className="nm-dash-2">
        <Panel title="Clicks" padded={false} info={INFO.clicks}>
          <RankedBarList items={clickItems} />
        </Panel>
        <Panel title="Outbound destinations" padded={false} info={INFO.outbound}>
          <RankedBarList items={stats.outbound} />
        </Panel>
      </div>

      <div style={grid} className="nm-dash-3">
        <Panel title="Channels" padded={false} info={INFO.channels}>
          <RankedBarList items={stats.channels} />
        </Panel>
        <Panel title="Sources" padded={false} info={INFO.sources}>
          <RankedBarList items={stats.referrers} />
        </Panel>
        <Panel title="Campaigns" padded={false} info={INFO.campaigns}>
          <RankedBarList items={stats.campaigns} emptyLabel="No UTM traffic yet" />
        </Panel>
      </div>

      <div style={grid} className="nm-dash-2">
        {stats.country ? (
          <Panel
            title={`Cities · ${stats.country}`}
            padded={false}
            info={INFO.cities}
            action={
              <Link href={`/dashboard?range=${stats.range}`} style={backLink} className="nm-focusable">
                ← all countries
              </Link>
            }
          >
            <RankedBarList items={stats.cities} />
          </Panel>
        ) : (
          <Panel title="Countries" padded={false} info={INFO.countries}>
            <RankedBarList
              items={stats.countries}
              hrefFor={(c) => `/dashboard?range=${stats.range}&country=${encodeURIComponent(c)}`}
            />
          </Panel>
        )}
        <Panel title="Language" padded={false} info={INFO.languages}>
          <RankedBarList items={languageItems} />
        </Panel>
      </div>

      <div style={grid} className="nm-dash-3">
        <Panel title="Devices" padded={false} info={INFO.devices}>
          <RankedBarList items={stats.devices} />
        </Panel>
        <Panel title="Browsers" padded={false} info={INFO.browsers}>
          <RankedBarList items={stats.browsers} />
        </Panel>
        <Panel title="OS" padded={false} info={INFO.os}>
          <RankedBarList items={stats.os} />
        </Panel>
      </div>

      <Panel title="When they visit" info={INFO.heatmap}>
        <Heatmap cells={stats.heatmap} />
      </Panel>

      <Panel title="Core Web Vitals · p75" info={INFO.vitals}>
        {vitalTiles.length === 0 ? (
          <p style={vitalsEmpty}>No data for this range</p>
        ) : (
          <div style={grid} className="nm-dash-3">
            {vitalTiles.map((v) => (
              <WebVitalsTile key={v.name} name={v.name} value={v.value} unit={v.unit} thresholds={v.thresholds} max={v.max} info={v.info} />
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Vitals · mobile vs desktop" info={INFO.vitalsDevice}>
        <VitalsCompare rows={stats.vitalsByDevice} />
      </Panel>
    </>
  );
}
