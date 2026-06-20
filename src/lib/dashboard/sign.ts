// HMAC primitives shared by the admin session cookie (auth.ts) and the owner
// opt-out cookie (analytics/owner.ts). Kept free of `next/headers` so it is safe
// to import from edge middleware (proxy.ts) as well as route handlers.

async function hmacHex(value: string, secret: string): Promise<string> {
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

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Build a tamper-proof `<issuedAt>.<hmac>` token signed with `secret`. */
export async function createSignedToken(secret: string): Promise<string> {
  const issued = String(Date.now());
  const sig = await hmacHex(issued, secret);
  return `${issued}.${sig}`;
}

/** Verify a `<issuedAt>.<hmac>` token: valid signature and not older than `maxAgeMs`. */
export async function verifySignedToken(
  token: string | undefined,
  secret: string,
  maxAgeMs: number,
): Promise<boolean> {
  if (!token || !secret) return false;
  const [issued, sig] = token.split(".");
  if (!issued || !sig) return false;
  const expected = await hmacHex(issued, secret);
  if (!timingSafeEqual(sig, expected)) return false;
  const age = Date.now() - Number(issued);
  return Number.isFinite(age) && age >= 0 && age < maxAgeMs;
}
