import { NextResponse } from "next/server";
import { OWNER_COOKIE, OWNER_MAX_AGE_S, createOwnerToken } from "@/lib/analytics/owner";
import { createSessionToken, SESSION_COOKIE, verifyPassword } from "@/lib/dashboard/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const origin = new URL(request.url).origin;

  if (!verifyPassword(password)) {
    return NextResponse.redirect(new URL("/dashboard/login?error=1", origin), 303);
  }

  const res = NextResponse.redirect(new URL("/dashboard", origin), 303);
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/dashboard",
    maxAge: 60 * 60 * 24 * 30,
  });
  // Site-wide owner cookie so the collector excludes Nico's own visits server-side.
  // Signed (HMAC) + httpOnly so it can't be forged or read; cleared via ?nm-track=on.
  res.cookies.set(OWNER_COOKIE, await createOwnerToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OWNER_MAX_AGE_S,
  });
  return res;
}
