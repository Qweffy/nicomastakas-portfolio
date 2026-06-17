"use client";

import type { CSSProperties } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const LABELS: Record<Locale, string> = { en: "EN", es: "ES" };

const row: CSSProperties = { display: "flex", alignItems: "center", gap: "var(--space-3)" };
const baseLink: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 0,
};

/** Two native-code links (EN / ES). The active one is the accent; clicking the
 *  other navigates to the same page in that locale (next-intl writes NEXT_LOCALE). */
export function LocaleSwitcher() {
  const active = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div style={row}>
      {routing.locales.map((locale) => {
        const isActive = locale === active;
        return (
          <button
            key={locale}
            type="button"
            aria-current={isActive ? "true" : undefined}
            onClick={() => router.replace(pathname, { locale })}
            style={{ ...baseLink, color: isActive ? "var(--accent)" : "var(--text-muted)" }}
          >
            {isActive ? `[${LABELS[locale]}]` : LABELS[locale]}
          </button>
        );
      })}
    </div>
  );
}
