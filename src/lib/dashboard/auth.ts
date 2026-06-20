import { cookies } from "next/headers";
import { createSignedToken, timingSafeEqual, verifySignedToken } from "./sign";

export const SESSION_COOKIE = "nm_admin";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

/** Compare the submitted password to DASHBOARD_PASSWORD in constant time. */
export function verifyPassword(input: string): boolean {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(input, expected);
}

/** Build a signed `<issuedAt>.<hmac>` session token. */
export async function createSessionToken(): Promise<string> {
  return createSignedToken(process.env.DASHBOARD_SECRET ?? "");
}

/** True when the current request carries a valid admin session cookie. */
export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifySignedToken(store.get(SESSION_COOKIE)?.value, process.env.DASHBOARD_SECRET ?? "", MAX_AGE_MS);
}
