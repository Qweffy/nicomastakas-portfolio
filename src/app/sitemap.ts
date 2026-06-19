import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { allWorkParams } from "@/lib/content";
import { designSystemSlugs } from "@/lib/design";
import { siteConfig } from "@/lib/site";

function localizedUrl(locale: string, path: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${siteConfig.url}${prefix}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = [...new Set(allWorkParams().map((p) => p.slug))];
  const paths = [
    "",
    "/about",
    "/design",
    ...designSystemSlugs.map((s) => `/design/${s}`),
    ...slugs.map((s) => `/work/${s}`),
  ];

  return paths.map((path) => ({
    url: `${siteConfig.url}${path}`,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, path)])),
    },
  }));
}
