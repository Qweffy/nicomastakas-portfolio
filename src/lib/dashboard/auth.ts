import { cookies } from "next/headers";

export const SESSION_COOKIE = "nm_admin";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Compare the submitted password to DASHBOARD_PASSWORD in constant time. */
export function verifyPassword(input: string): boolean {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(input, expected);
}

/** Build a signed `<issuedAt>.<hmac>` session token. */
export async function createSessionToken(): Promise<string> {
  const issued = String(Date.now());
  const sig = await hmac(issued, process.env.DASHBOARD_SECRET ?? "");
  return `${issued}.${sig}`;
}

async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.DASHBOARD_SECRET;
  if (!secret) return false;
  const [issued, sig] = token.split(".");
  if (!issued || !sig) return false;
  const expected = await hmac(issued, secret);
  if (!timingSafeEqual(sig, expected)) return false;
  const age = Date.now() - Number(issued);
  return Number.isFinite(age) && age >= 0 && age < MAX_AGE_MS;
}

/** True when the current request carries a valid admin session cookie. */
export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return isValidToken(store.get(SESSION_COOKIE)?.value);
}
