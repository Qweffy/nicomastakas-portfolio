"use client";

import type { CSSProperties } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

export interface NavLink {
  label: string;
  href: string;
  /** External links (mailto:, https:, files) render as a plain anchor. */
  external?: boolean;
  /** Analytics tag, e.g. "nav:work". Captured on click by the collector. */
  analytics?: string;
}

const bar: CSSProperties = {
  fontFamily: "var(--font-sans)",
  paddingBlock: "var(--space-4)",
  background: "var(--bg)",
  borderBottom: "var(--elevation-hairline)",
};
const row: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};
const logo: CSSProperties = {
  fontSize: "var(--text-card-title)",
  fontWeight: "var(--weight-semibold)",
  letterSpacing: "-0.01em",
  color: "var(--text)",
  textDecoration: "none",
};
const list: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-8)",
  listStyle: "none",
  margin: 0,
  padding: 0,
};

/** Path part of an href (drops hash/query) so `/#work` matches the home route. */
function pathOf(href: string) {
  return href.split(/[#?]/)[0] || "/";
}

/** Top bar: logotype left, links + locale switcher right. One variant, no hamburger. */
export function Nav({ name = "Nico Mastakas", links }: { name?: string; links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="nm-nav" style={bar}>
      <div className="nm-container nm-nav__row" style={row}>
        <Link href="/" className="nm-focusable" style={logo}>
          {name}
        </Link>
        <ul style={list}>
          {links.map((l) => {
            const active = !l.external && pathOf(l.href) === pathname;
            const current = active ? "page" : undefined;
            return (
              <li key={l.href}>
                {l.external ? (
                  <a href={l.href} className="nm-navlink nm-focusable" data-analytics={l.analytics}>
                    {l.label}
                  </a>
                ) : (
                  <Link
                    href={l.href}
                    className="nm-navlink nm-focusable"
                    aria-current={current}
                    data-analytics={l.analytics}
                  >
                    {l.label}
                  </Link>
                )}
              </li>
            );
          })}
          <li>
            <LocaleSwitcher />
          </li>
        </ul>
      </div>
    </nav>
  );
}
