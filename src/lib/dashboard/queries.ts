import { neon } from "@neondatabase/serverless";

export type Range = "24h" | "7d" | "30d" | "90d" | "all";
export type RankItem = { label: string; value: number };
export type SeriesPoint = { bucket: string; visitors: number; pageviews: number };
export type VitalStat = { name: string; p75: number; count: number };
export type FunnelStep = { label: string; value: number };
export type FeedItem = {
  epoch: number;
  type: string;
  eventName: string | null;
  path: string | null;
  country: string | null;
  city: string | null;
  host: string | null;
  label: string | null;
};
export type HeatCell = { dow: number; hour: number; value: number };
export type VitalByDevice = { name: string; mobile: number | null; desktop: number | null };
export type ReadingDepthRow = {
  slug: string;
  viewers: number;
  d25: number;
  d50: number;
  d75: number;
  d100: number;
};

export type Stats = {
  range: Range;
  bucket: "hour" | "day";
  country: string | null;
  activeNow: number;
  pagesPerVisit: number;
  kpis: {
    visitors: number;
    visitorsPrev: number;
    pageviews: number;
    pageviewsPrev: number;
    avgEngagementMs: number;
    avgEngagementPrevMs: number;
    bounceRate: number;
  };
  feed: FeedItem[];
  series: SeriesPoint[];
  topPages: RankItem[];
  topProjects: RankItem[];
  landing: RankItem[];
  referrers: RankItem[];
  channels: RankItem[];
  campaigns: RankItem[];
  outbound: RankItem[];
  countries: RankItem[];
  cities: RankItem[];
  languages: RankItem[];
  devices: RankItem[];
  browsers: RankItem[];
  os: RankItem[];
  clicks: RankItem[];
  avgTimePerPage: RankItem[];
  reads: RankItem[];
  readingDepth: ReadingDepthRow[];
  funnel: FunnelStep[];
  vitals: VitalStat[];
  vitalsByDevice: VitalByDevice[];
  heatmap: HeatCell[];
};

const DAYS: Record<Exclude<Range, "all">, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 };
const PROJECT_CATEGORIES = ["project_card", "more_work", "repo", "demo", "case_study", "design_card"];
const TZ = "America/Argentina/Buenos_Aires";

export function normalizeRange(value: string | undefined): Range {
  return value === "24h" || value === "7d" || value === "30d" || value === "90d" || value === "all"
    ? value
    : "all";
}

function sqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export async function getStats(
  rangeInput: string | undefined,
  opts: { country?: string } = {},
): Promise<Stats> {
  const range = normalizeRange(rangeInput);
  const country = opts.country && opts.country.length <= 4 ? opts.country : null;
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

  const activeP = sql`
    SELECT count(DISTINCT visitor)::int AS n
    FROM events WHERE ts > now() - interval '30 minutes'
  ` as unknown as Promise<Array<{ n: number }>>;

  const ppvP = sql`
    SELECT coalesce(
      count(*) FILTER (WHERE type = 'pageview')::float
        / NULLIF(count(DISTINCT visitor) FILTER (WHERE type = 'pageview' AND visitor IS NOT NULL), 0)
    , 0)::float AS ppv
    FROM events WHERE ts >= ${since}
  ` as unknown as Promise<Array<{ ppv: number }>>;

  const feedP = sql`
    SELECT extract(epoch from ts)::float8 AS epoch, type, event_name AS "eventName",
      path, country, city, props->>'host' AS host, props->>'label' AS label
    FROM events
    WHERE ts >= ${since} AND type IN ('pageview', 'event')
      AND NOT (type = 'event' AND event_name = 'scroll')
    ORDER BY ts DESC LIMIT 60
  ` as unknown as Promise<FeedItem[]>;

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

  const projectsP = sql`
    SELECT slug AS label, count(*)::int AS value FROM (
      SELECT substring(path from '^/(?:es/)?(?:work|design)/([^/?#]+)') AS slug
      FROM events
      WHERE type = 'pageview' AND ts >= ${since} AND path ~ '^/(?:es/)?(?:work|design)/'
      UNION ALL
      SELECT props->>'label' AS slug
      FROM events
      WHERE type = 'event' AND ts >= ${since}
        AND event_name = ANY(${PROJECT_CATEGORIES}) AND props->>'label' IS NOT NULL
    ) s
    WHERE slug IS NOT NULL AND slug <> ''
    GROUP BY slug ORDER BY value DESC LIMIT 10
  ` as unknown as Promise<RankItem[]>;

  const landingP = sql`
    SELECT path AS label, count(*)::int AS value FROM (
      SELECT DISTINCT ON (visitor) visitor, path
      FROM events
      WHERE type = 'pageview' AND ts >= ${since} AND visitor IS NOT NULL AND path IS NOT NULL
      ORDER BY visitor, ts ASC
    ) s GROUP BY path ORDER BY value DESC LIMIT 10
  ` as unknown as Promise<RankItem[]>;

  const refP = sql`
    SELECT coalesce(referrer_host, 'Direct') AS label, count(*)::int AS value
    FROM events WHERE type = 'pageview' AND ts >= ${since}
    GROUP BY 1 ORDER BY value DESC LIMIT 10
  ` as unknown as Promise<RankItem[]>;

  const channelsP = sql`
    SELECT CASE
      WHEN referrer_host IS NULL OR referrer_host = '' THEN 'Direct'
      WHEN referrer_host ~ '(google|bing|duckduckgo|ecosia|yahoo)\.' THEN 'Search'
      WHEN referrer_host = 'x.com' OR referrer_host ~ '(linkedin|twitter|t\.co|facebook|instagram|reddit|youtube)' THEN 'Social'
      ELSE 'Referral'
    END AS label, count(*)::int AS value
    FROM events WHERE type = 'pageview' AND ts >= ${since}
    GROUP BY 1 ORDER BY value DESC
  ` as unknown as Promise<RankItem[]>;

  const campaignsP = sql`
    SELECT utm_source AS label, count(*)::int AS value
    FROM events WHERE type = 'pageview' AND ts >= ${since} AND utm_source IS NOT NULL AND utm_source <> ''
    GROUP BY utm_source ORDER BY value DESC LIMIT 10
  ` as unknown as Promise<RankItem[]>;

  const outboundP = sql`
    SELECT label, sum(value)::int AS value FROM (
      SELECT props->>'host' AS label, count(*) AS value
      FROM events WHERE type = 'event' AND event_name = 'outbound' AND ts >= ${since} AND props->>'host' IS NOT NULL
      GROUP BY 1
      UNION ALL
      SELECT props->>'label' AS label, count(*) AS value
      FROM events WHERE type = 'event' AND event_name = ANY(${["social", "demo", "repo"]})
        AND ts >= ${since} AND props->>'label' IS NOT NULL
      GROUP BY 1
    ) s WHERE label IS NOT NULL AND label <> ''
    GROUP BY label ORDER BY value DESC LIMIT 12
  ` as unknown as Promise<RankItem[]>;

  const countriesP = sql`
    SELECT country AS label, count(DISTINCT visitor)::int AS value
    FROM events WHERE ts >= ${since} AND country IS NOT NULL
    GROUP BY country ORDER BY value DESC LIMIT 10
  ` as unknown as Promise<RankItem[]>;

  const citiesP = sql`
    SELECT city AS label, count(DISTINCT visitor)::int AS value
    FROM events WHERE ts >= ${since} AND country = ${country} AND city IS NOT NULL AND city <> ''
    GROUP BY city ORDER BY value DESC LIMIT 12
  ` as unknown as Promise<RankItem[]>;

  const languagesP = sql`
    SELECT locale AS label, count(DISTINCT visitor)::int AS value
    FROM events WHERE ts >= ${since} AND locale IS NOT NULL AND locale <> ''
    GROUP BY locale ORDER BY value DESC
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

  const clicksP = sql`
    SELECT event_name AS label, count(*)::int AS value
    FROM events
    WHERE type = 'event' AND ts >= ${since} AND event_name IS NOT NULL AND event_name <> 'scroll'
    GROUP BY event_name ORDER BY value DESC LIMIT 12
  ` as unknown as Promise<RankItem[]>;

  const avgTimeP = sql`
    SELECT path AS label, coalesce(avg(engagement_ms), 0)::int AS value
    FROM events WHERE type = 'engagement' AND ts >= ${since} AND path IS NOT NULL
    GROUP BY path ORDER BY value DESC LIMIT 10
  ` as unknown as Promise<RankItem[]>;

  const readsP = sql`
    SELECT label, round(100.0 * finishers / NULLIF(viewers, 0))::int AS value FROM (
      SELECT
        substring(path from '^/(?:es/)?work/([^/?#]+)') AS label,
        count(DISTINCT visitor) FILTER (WHERE type = 'pageview') AS viewers,
        count(DISTINCT visitor) FILTER (
          WHERE type = 'event' AND event_name = 'scroll' AND props->>'depth' = '100'
        ) AS finishers
      FROM events WHERE ts >= ${since} AND path ~ '^/(?:es/)?work/'
      GROUP BY 1
    ) s
    WHERE label IS NOT NULL AND viewers > 0
    ORDER BY value DESC LIMIT 10
  ` as unknown as Promise<RankItem[]>;

  const depthP = sql`
    SELECT slug, viewers::int, d25::int, d50::int, d75::int, d100::int FROM (
      SELECT
        substring(path from '^/(?:es/)?work/([^/?#]+)') AS slug,
        count(DISTINCT visitor) FILTER (WHERE type = 'pageview') AS viewers,
        count(DISTINCT visitor) FILTER (WHERE type='event' AND event_name='scroll' AND props->>'depth'='25') AS d25,
        count(DISTINCT visitor) FILTER (WHERE type='event' AND event_name='scroll' AND props->>'depth'='50') AS d50,
        count(DISTINCT visitor) FILTER (WHERE type='event' AND event_name='scroll' AND props->>'depth'='75') AS d75,
        count(DISTINCT visitor) FILTER (WHERE type='event' AND event_name='scroll' AND props->>'depth'='100') AS d100
      FROM events WHERE ts >= ${since} AND path ~ '^/(?:es/)?work/'
      GROUP BY 1
    ) s WHERE slug IS NOT NULL AND viewers > 0
    ORDER BY viewers DESC LIMIT 8
  ` as unknown as Promise<ReadingDepthRow[]>;

  const funnelP = sql`
    SELECT
      count(DISTINCT visitor)::int AS visited,
      count(DISTINCT visitor) FILTER (
        WHERE (type = 'pageview' AND path ~ '^/(?:es/)?(?:work|design)/')
           OR (type = 'event' AND event_name = ANY(${["project_card", "more_work", "design_card"]}))
      )::int AS viewed_project,
      count(DISTINCT visitor) FILTER (
        WHERE (type = 'event' AND event_name = ANY(${["demo", "repo", "case_study"]}))
           OR (type = 'event' AND event_name = 'scroll' AND props->>'depth' = '100')
      )::int AS explored,
      count(DISTINCT visitor) FILTER (
        WHERE type = 'event' AND event_name = ANY(${["cv_download", "contact"]})
      )::int AS converted
    FROM events WHERE ts >= ${since}
  ` as unknown as Promise<
    Array<{ visited: number; viewed_project: number; explored: number; converted: number }>
  >;

  const vitalsP = sql`
    SELECT vital_name AS name,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY vital_value)::float AS p75,
      count(*)::int AS count
    FROM events WHERE type = 'vital' AND ts >= ${since} AND vital_value IS NOT NULL
    GROUP BY vital_name
  ` as unknown as Promise<VitalStat[]>;

  const vitalsDevP = sql`
    SELECT vital_name AS name, device,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY vital_value)::float AS p75
    FROM events
    WHERE type = 'vital' AND ts >= ${since} AND vital_value IS NOT NULL AND device IN ('mobile', 'desktop')
    GROUP BY vital_name, device
  ` as unknown as Promise<Array<{ name: string; device: string; p75: number }>>;

  const heatP = sql`
    SELECT extract(dow from ts AT TIME ZONE ${TZ})::int AS dow,
      extract(hour from ts AT TIME ZONE ${TZ})::int AS hour,
      count(*)::int AS value
    FROM events WHERE type = 'pageview' AND ts >= ${since}
    GROUP BY 1, 2
  ` as unknown as Promise<HeatCell[]>;

  const [
    kpi,
    eng,
    bounce,
    active,
    ppv,
    feed,
    series,
    topPages,
    topProjects,
    landing,
    referrers,
    channels,
    campaigns,
    outbound,
    countries,
    cities,
    languages,
    devices,
    browsers,
    os,
    clicks,
    avgTimePerPage,
    reads,
    readingDepth,
    funnelRows,
    vitals,
    vitalsDev,
    heatmap,
  ] = await Promise.all([
    kpiP,
    engP,
    bounceP,
    activeP,
    ppvP,
    feedP,
    seriesP,
    pagesP,
    projectsP,
    landingP,
    refP,
    channelsP,
    campaignsP,
    outboundP,
    countriesP,
    citiesP,
    languagesP,
    devicesP,
    browsersP,
    osP,
    clicksP,
    avgTimeP,
    readsP,
    depthP,
    funnelP,
    vitalsP,
    vitalsDevP,
    heatP,
  ]);

  const k = kpi[0] ?? { pv_now: 0, pv_prev: 0, v_now: 0, v_prev: 0 };
  const e = eng[0] ?? { now: 0, prev: 0 };
  const f = funnelRows[0] ?? { visited: 0, viewed_project: 0, explored: 0, converted: 0 };

  const vitalNames = [...new Set(vitalsDev.map((v) => v.name))];
  const vitalsByDevice: VitalByDevice[] = vitalNames.map((name) => ({
    name,
    mobile: vitalsDev.find((v) => v.name === name && v.device === "mobile")?.p75 ?? null,
    desktop: vitalsDev.find((v) => v.name === name && v.device === "desktop")?.p75 ?? null,
  }));

  return {
    range,
    bucket,
    country,
    activeNow: active[0]?.n ?? 0,
    pagesPerVisit: ppv[0]?.ppv ?? 0,
    kpis: {
      visitors: k.v_now,
      visitorsPrev: k.v_prev,
      pageviews: k.pv_now,
      pageviewsPrev: k.pv_prev,
      avgEngagementMs: e.now,
      avgEngagementPrevMs: e.prev,
      bounceRate: bounce[0]?.rate ?? 0,
    },
    feed,
    series,
    topPages,
    topProjects,
    landing,
    referrers,
    channels,
    campaigns,
    outbound,
    countries,
    cities,
    languages,
    devices,
    browsers,
    os,
    clicks,
    avgTimePerPage,
    reads,
    readingDepth,
    funnel: [
      { label: "Visited", value: f.visited },
      { label: "Viewed a project", value: f.viewed_project },
      { label: "Explored deeply", value: f.explored },
      { label: "CV / contact", value: f.converted },
    ],
    vitals,
    vitalsByDevice,
    heatmap,
  };
}
