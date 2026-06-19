import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/dashboard/auth";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const res = NextResponse.redirect(new URL("/dashboard/login", origin), 303);
  res.cookies.set(SESSION_COOKIE, "", { path: "/dashboard", maxAge: 0 });
  return res;
}
