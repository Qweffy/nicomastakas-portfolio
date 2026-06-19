import { neon } from "@neondatabase/serverless";

export type Range = "24h" | "7d" | "30d" | "90d" | "all";
export type RankItem = { label: string; value: number };
export type SeriesPoint = { bucket: string; visitors: number; pageviews: number };
export type VitalStat = { name: string; p75: number; count: number };

export type Stats = {
  range: Range;
  bucket: "hour" | "day";
  kpis: {
    visitors: number;
    visitorsPrev: number;
    pageviews: number;
    pageviewsPrev: number;
    avgEngagementMs: number;
    avgEngagementPrevMs: number;
    bounceRate: number;
  };
  series: SeriesPoint[];
  topPages: RankItem[];
  referrers: RankItem[];
  countries: RankItem[];
  devices: RankItem[];
  browsers: RankItem[];
  os: RankItem[];
  events: RankItem[];
  vitals: VitalStat[];
};

const DAYS: Record<Exclude<Range, "all">, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 };

export function normalizeRange(value: string | undefined): Range {
  return value === "24h" || value === "7d" || value === "30d" || value === "90d" || value === "all"
    ? value
    : "7d";
}

function sqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export async function getStats(rangeInput: string | undefined): Promise<Stats> {
  const range = normalizeRange(rangeInput);
  const now = Date.now();
  const sinceMs = range === "all" ? 0 : now - DAYS[range] * 86_400_000;
  const prevMs = range === "all" ? 0 : sinceMs - (now - sinceMs);
  const bucket: "hour" | "day" = range === "24h" ? "hour" : "day";
  const since = new Date(sinceMs).toISOString();
  const prev = new Date(prevMs).toISOString();

  const sql = sqlClient();

  const kpiP = sql`
    SELECT
      count(*) FILTER (WHERE type = 'pageview' AND ts >= ${since})::int AS pv_now,
      count(*) FILTER (WHERE type = 'pageview' AND ts >= ${prev} AND ts < ${since})::int AS pv_prev,
      count(DISTINCT visitor) FILTER (WHERE ts >= ${since})::int AS v_now,
      count(DISTINCT visitor) FILTER (WHERE ts >= ${prev} AND ts < ${since})::int AS v_prev
    FROM events WHERE ts >= ${prev}
  ` as unknown as Promise<
    Array<{ pv_now: number; pv_prev: number; v_now: number; v_prev: number }>
  >;

  const engP = sql`
    SELECT
      coalesce(avg(engagement_ms) FILTER (WHERE ts >= ${since}), 0)::int AS now,
      coalesce(avg(engagement_ms) FILTER (WHERE ts >= ${prev} AND ts < ${since}), 0)::int AS prev
    FROM events WHERE type = 'engagement' AND ts >= ${prev}
  ` as unknown as Promise<Array<{ now: number; prev: number }>>;

  const bounceP = sql`
    SELECT coalesce(avg(CASE WHEN pv = 1 THEN 1.0 ELSE 0.0 END), 0)::float AS rate
    FROM (
      SELECT visitor, count(*) FILTER (WHERE type = 'pageview') AS pv
      FROM events WHERE ts >= ${since} AND visitor IS NOT NULL
      GROUP BY visitor
    ) s WHERE pv > 0
  ` as unknown as Promise<Array<{ rate: number }>>;

  const seriesP = sql`
    SELECT (date_trunc(${bucket}, ts))::text AS bucket,
      count(*) FILTER (WHERE type = 'pageview')::int AS pageviews,
      count(DISTINCT visitor)::int AS visitors
    FROM events WHERE ts >= ${since}
    GROUP BY 1 ORDER BY 1
  ` as unknown as Promise<Array<{ bucket: string; pageviews: number; visitors: number }>>;

  const pagesP = sql`
    SELECT path AS label, count(*)::int AS value
    FROM events WHERE type = 'pageview' AND ts >= ${since} AND path IS NOT NULL
    GROUP BY path ORDER BY value DESC LIMIT 10
  ` as unknown as Promise<RankItem[]>;

  const refP = sql`
    SELECT coalesce(referrer_host, 'Direct') AS label, count(*)::int AS value
    FROM events WHERE type = 'pageview' AND ts >= ${since}
    GROUP BY 1 ORDER BY value DESC LIMIT 10
  ` as unknown as Promise<RankItem[]>;

  const countriesP = sql`
    SELECT country AS label, count(DISTINCT visitor)::int AS value
    FROM events WHERE ts >= ${since} AND country IS NOT NULL
    GROUP BY country ORDER BY value DESC LIMIT 10
  ` as unknown as Promise<RankItem[]>;

  const devicesP = sql`
    SELECT device AS label, count(DISTINCT visitor)::int AS value
    FROM events WHERE ts >= ${since} AND device IS NOT NULL
    GROUP BY device ORDER BY value DESC
  ` as unknown as Promise<RankItem[]>;

  const browsersP = sql`
    SELECT browser AS label, count(DISTINCT visitor)::int AS value
    FROM events WHERE ts >= ${since} AND browser IS NOT NULL
    GROUP BY browser ORDER BY value DESC LIMIT 10
  ` as unknown as Promise<RankItem[]>;

  const osP = sql`
    SELECT os AS label, count(DISTINCT visitor)::int AS value
    FROM events WHERE ts >= ${since} AND os IS NOT NULL
    GROUP BY os ORDER BY value DESC LIMIT 10
  ` as unknown as Promise<RankItem[]>;

  const eventsP = sql`
    SELECT event_name AS label, count(*)::int AS value
    FROM events WHERE type = 'event' AND ts >= ${since} AND event_name IS NOT NULL
    GROUP BY event_name ORDER BY value DESC
  ` as unknown as Promise<RankItem[]>;

  const vitalsP = sql`
    SELECT vital_name AS name,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY vital_value)::float AS p75,
      count(*)::int AS count
    FROM events WHERE type = 'vital' AND ts >= ${since} AND vital_value IS NOT NULL
    GROUP BY vital_name
  ` as unknown as Promise<VitalStat[]>;

  const [
    kpi,
    eng,
    bounce,
    series,
    topPages,
    referrers,
    countries,
    devices,
    browsers,
    os,
    events,
    vitals,
  ] = await Promise.all([
    kpiP,
    engP,
    bounceP,
    seriesP,
    pagesP,
    refP,
    countriesP,
    devicesP,
    browsersP,
    osP,
    eventsP,
    vitalsP,
  ]);

  const k = kpi[0] ?? { pv_now: 0, pv_prev: 0, v_now: 0, v_prev: 0 };
  const e = eng[0] ?? { now: 0, prev: 0 };

  return {
    range,
    bucket,
    kpis: {
      visitors: k.v_now,
      visitorsPrev: k.v_prev,
      pageviews: k.pv_now,
      pageviewsPrev: k.pv_prev,
      avgEngagementMs: e.now,
      avgEngagementPrevMs: e.prev,
      bounceRate: bounce[0]?.rate ?? 0,
    },
    series,
    topPages,
    referrers,
    countries,
    devices,
    browsers,
    os,
    events,
    vitals,
  };
}
