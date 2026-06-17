import type { CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
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
const linkStyle: CSSProperties = {
  fontSize: "var(--text-body)",
  color: "var(--text-muted)",
  textDecoration: "none",
};

/** Top bar: logotype left, links + locale switcher right. One variant, no hamburger. */
export function Nav({ name = "Nico Mastakas", links }: { name?: string; links: NavLink[] }) {
  return (
    <nav style={bar}>
      <Link href="/" style={logo}>
        {name}
      </Link>
      <ul style={list}>
        {links.map((l) => (
          <li key={l.href}>
            {l.external ? (
              <a href={l.href} style={linkStyle}>
                {l.label}
              </a>
            ) : (
              <Link href={l.href} style={linkStyle}>
                {l.label}
              </Link>
            )}
          </li>
        ))}
        <li>
          <LocaleSwitcher />
        </li>
      </ul>
    </nav>
  );
}
