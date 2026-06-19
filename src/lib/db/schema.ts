import { index, integer, jsonb, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Single append-only table for first-party, cookieless analytics. One row per
 * beacon. No raw IP is ever stored; `visitor` is a privacy-preserving daily hash.
 */
export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    ts: timestamp("ts", { withTimezone: true }).defaultNow().notNull(),
    // pageview | event | vital | engagement
    type: text("type").notNull(),
    path: text("path"),
    referrerHost: text("referrer_host"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    country: text("country"),
    region: text("region"),
    city: text("city"),
    // mobile | tablet | desktop
    device: text("device"),
    os: text("os"),
    browser: text("browser"),
    locale: text("locale"),
    // daily-rotating hash of ip+ua+salt+date (cookieless visitor id)
    visitor: text("visitor"),
    // for type=event: cv_download | outbound | contact | scroll | ...
    eventName: text("event_name"),
    props: jsonb("props"),
    // for type=vital: LCP | CLS | INP | FCP | TTFB
    vitalName: text("vital_name"),
    vitalValue: real("vital_value"),
    // for type=engagement: visible time on the page in ms
    engagementMs: integer("engagement_ms"),
  },
  (t) => [
    index("events_ts_idx").on(t.ts),
    index("events_type_idx").on(t.type),
    index("events_path_idx").on(t.path),
  ],
);

export type EventRow = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
