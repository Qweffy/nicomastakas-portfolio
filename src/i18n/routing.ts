import { defineRouting } from "next-intl/routing";

/**
 * The locale registry. Adding a language = add its code here + a
 * `messages/<code>.json` catalog. Default is English (recruiter funnel);
 * `as-needed` keeps the default locale at `/` and prefixes the rest (`/es`).
 */
export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
