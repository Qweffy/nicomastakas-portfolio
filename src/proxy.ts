import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { OWNER_COOKIE, OWNER_MAX_AGE_S, createOwnerToken } from "@/lib/analytics/owner";
import { routing } from "@/i18n/routing";

// Next 16 renamed `middleware.ts` → `proxy.ts`. Runs at the edge in front of the
// statically prerendered pages: serves the default locale at `/`, prefixes the
// rest, and detects locale from the NEXT_LOCALE cookie / Accept-Language.
const handleI18n = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = handleI18n(request);

  // Owner opt-out toggle. `?nm-track=off` sets a signed, httpOnly owner cookie
  // server-side (so it survives ITP and can't be forged); `?nm-track=on` clears it.
  // The client tracker also flips a localStorage flag for a same-page short-circuit.
  const pref = request.nextUrl.searchParams.get("nm-track");
  if (pref === "off") {
    response.cookies.set(OWNER_COOKIE, await createOwnerToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: OWNER_MAX_AGE_S,
    });
  } else if (pref === "on") {
    response.cookies.set(OWNER_COOKIE, "", { path: "/", maxAge: 0 });
  }

  return response;
}

export const config = {
  // Skip API, the private /dashboard (its own root layout), Next internals,
  // extension-less metadata routes (e.g. /opengraph-image, /icon), and any path
  // with a file extension.
  matcher: [
    "/((?!api|dashboard|_next|_vercel|opengraph-image|twitter-image|icon|apple-icon|manifest|.*\\..*).*)",
  ],
};
