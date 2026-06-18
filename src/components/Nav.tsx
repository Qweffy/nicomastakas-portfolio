"use client";

import type { CSSProperties } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

export interface NavLink {
  label: string;
  href: string;
  /** External links (mailto:, https:, files) render as a plain anchor. */
  external?: boolean;
}

const bar: CSSProperties = {
  fontFamily: "var(--font-sans)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "var(--space-4) var(--space-8)",
  background: "var(--bg)",
  borderBottom: "var(--elevation-hairline)",
  boxSizing: "border-box",
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
                <a href={l.href} className="nm-navlink nm-focusable">
                  {l.label}
                </a>
              ) : (
                <Link href={l.href} className="nm-navlink nm-focusable" aria-current={current}>
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
    </nav>
  );
}
