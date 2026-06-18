import { work } from "#site/content";
import { routing, type Locale } from "@/i18n/routing";

export type CaseStudy = (typeof work)[number];

/** Published case studies for a locale, newest first. */
export function listWork(locale: Locale): CaseStudy[] {
  return work
    .filter((study) => study.locale === locale && !study.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * A case study by slug in the requested locale. Falls back to the default-locale
 * entry (flagged `isFallback`) when the translation is missing. `null` → not found.
 */
export function getWork(
  slug: string,
  locale: Locale,
): { study: CaseStudy; isFallback: boolean } | null {
  const exact = work.find((s) => s.slug === slug && s.locale === locale && !s.draft);
  if (exact) return { study: exact, isFallback: false };

  const fallback = work.find(
    (s) => s.slug === slug && s.locale === routing.defaultLocale && !s.draft,
  );
  if (fallback) return { study: fallback, isFallback: true };

  return null;
}

/**
 * Every (locale, slug) pair for generateStaticParams — the cross product of all
 * locales with every published slug, so a slug that lacks a translation still
 * renders in that locale (falling back to the default-locale content, flagged
 * `isFallback`) instead of 404-ing under `dynamicParams = false`.
 */
export function allWorkParams(): { locale: Locale; slug: string }[] {
  const slugs = [...new Set(work.filter((study) => !study.draft).map((study) => study.slug))];
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}
