import { createSignedToken, verifySignedToken } from "@/lib/dashboard/sign";

// Owner opt-out cookie. A signed, httpOnly cookie set server-side (dashboard login
// or ?nm-track=off) and verified in /api/collect so Nico's own visits are dropped.
// Signing (HMAC over DASHBOARD_SECRET) makes it unforgeable; httpOnly + server-set
// keeps it readable only by the server and lets it survive Safari/iOS ITP for the
// full Max-Age (a first-party, same-origin Set-Cookie, not a document.cookie write).
export const OWNER_COOKIE = "nm_owner";
export const OWNER_MAX_AGE_S = 60 * 60 * 24 * 400; // ~400 days, the browser cookie ceiling
const OWNER_MAX_AGE_MS = OWNER_MAX_AGE_S * 1000;

export async function createOwnerToken(): Promise<string> {
  return createSignedToken(process.env.DASHBOARD_SECRET ?? "");
}

export async function isValidOwnerToken(token: string | undefined): Promise<boolean> {
  return verifySignedToken(token, process.env.DASHBOARD_SECRET ?? "", OWNER_MAX_AGE_MS);
}

/** Read a single cookie value from a raw `Cookie` request header. */
export function readCookieValue(header: string | null | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(/; */)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return undefined;
}
