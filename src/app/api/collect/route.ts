import { isbot } from "isbot";
import { z } from "zod";
import { OWNER_COOKIE, isValidOwnerToken, readCookieValue } from "@/lib/analytics/owner";
import { getDb } from "@/lib/db";
import { events } from "@/lib/db/schema";

// Beacon payload sent by src/components/Analytics.tsx via navigator.sendBeacon.
const payload = z.object({
  type: z.enum(["pageview", "event", "vital", "engagement"]),
  path: z.string().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  locale: z.string().max(8).optional(),
  event: z.string().max(64).optional(),
  props: z.record(z.string(), z.unknown()).optional(),
  vital: z.string().max(16).optional(),
  value: z.number().optional(),
  engagementMs: z.number().int().nonnegative().max(86_400_000).optional(),
});

export async function POST(request: Request) {
  // Analytics is a no-op until the database is configured (avoids log spam pre-Neon).
  if (!process.env.DATABASE_URL) return new Response(null, { status: 204 });

  // Owner opt-out: a signed, httpOnly nm_owner cookie (set on dashboard login or via
  // ?nm-track=off) excludes Nico's own visits server-side, robustly, even if localStorage
  // is cleared. The HMAC makes it unforgeable, so no visitor can poison their own count.
  const ownerToken = readCookieValue(request.headers.get("cookie"), OWNER_COOKIE);
  if (await isValidOwnerToken(ownerToken)) return new Response(null, { status: 204 });

  const ua = request.headers.get("user-agent") ?? "";
  if (isbot(ua)) return new Response(null, { status: 204 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const parsed = payload.safeParse(body);
  if (!parsed.success) return new Response(null, { status: 204 });
  const data = parsed.data;

  const h = request.headers;
  const country = h.get("x-vercel-ip-country");
  const region = h.get("x-vercel-ip-country-region");
  const cityRaw = h.get("x-vercel-ip-city");
  const city = cityRaw ? decodeURIComponent(cityRaw) : null;

  // Cookieless visitor id: a daily-rotating hash. The IP is hashed, never stored.
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ?? "";
  const day = new Date().toISOString().slice(0, 10);
  const visitor = await sha256(`${ip}|${ua}|${process.env.ANALYTICS_SALT ?? ""}|${day}`);

  const { device, os, browser } = parseUa(ua);
  const utm = parseUtm(data.path);

  try {
    await getDb()
      .insert(events)
      .values({
        type: data.type,
        path: cleanPath(data.path),
        referrerHost: hostOf(data.referrer),
        utmSource: utm.source,
        utmMedium: utm.medium,
        utmCampaign: utm.campaign,
        country,
        region,
        city,
        device,
        os,
        browser,
        locale: data.locale ?? null,
        visitor,
        eventName: data.event ?? null,
        props: data.props ?? null,
        vitalName: data.vital ?? null,
        vitalValue: data.value ?? null,
        engagementMs: data.engagementMs ?? null,
      });
  } catch (err) {
    // A beacon must never surface errors to the visitor; surface to Vercel logs instead.
    // eslint-disable-next-line no-console -- serverless error reporting (no app logger exists)
    console.error("analytics insert failed", err);
  }

  return new Response(null, { status: 204 });
}

async function sha256(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function parseUa(ua: string): { device: string; os: string; browser: string } {
  const device = /iPad|Tablet/i.test(ua)
    ? "tablet"
    : /Mobi|Android|iPhone|iPod/i.test(ua)
      ? "mobile"
      : "desktop";
  const os = /Windows/i.test(ua)
    ? "Windows"
    : /Mac OS X|Macintosh/i.test(ua)
      ? "macOS"
      : /Android/i.test(ua)
        ? "Android"
        : /iPhone|iPad|iPod|iOS/i.test(ua)
          ? "iOS"
          : /Linux/i.test(ua)
            ? "Linux"
            : "Other";
  const browser = /Edg\//i.test(ua)
    ? "Edge"
    : /OPR\/|Opera/i.test(ua)
      ? "Opera"
      : /Chrome\//i.test(ua)
        ? "Chrome"
        : /Firefox\//i.test(ua)
          ? "Firefox"
          : /Safari\//i.test(ua)
            ? "Safari"
            : "Other";
  return { device, os, browser };
}

function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function cleanPath(path: string | undefined): string | null {
  if (!path) return null;
  try {
    return new URL(path, "https://x").pathname || "/";
  } catch {
    return path.slice(0, 512);
  }
}

function parseUtm(path: string | undefined): {
  source: string | null;
  medium: string | null;
  campaign: string | null;
} {
  if (!path) return { source: null, medium: null, campaign: null };
  try {
    const q = new URL(path, "https://x").searchParams;
    return {
      source: q.get("utm_source"),
      medium: q.get("utm_medium"),
      campaign: q.get("utm_campaign"),
    };
  } catch {
    return { source: null, medium: null, campaign: null };
  }
}
