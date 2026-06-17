import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next 16 renamed `middleware.ts` → `proxy.ts`. Runs at the edge in front of the
// statically prerendered pages: serves the default locale at `/`, prefixes the
// rest, and detects locale from the NEXT_LOCALE cookie / Accept-Language.
export default createMiddleware(routing);

export const config = {
  // Skip API, Next internals, extension-less metadata routes (e.g. /opengraph-image,
  // /icon), and any path with a file extension.
  matcher: [
    "/((?!api|_next|_vercel|opengraph-image|twitter-image|icon|apple-icon|manifest|.*\\..*).*)",
  ],
};
