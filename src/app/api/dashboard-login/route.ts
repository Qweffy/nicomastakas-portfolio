import { NextResponse } from "next/server";
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
  // Site-wide owner flag so the collector excludes Nico's own visits (readable by the
  // client too, so ?nm-track=on can clear it). Not httpOnly, not sensitive.
  res.cookies.set("nm_owner", "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
