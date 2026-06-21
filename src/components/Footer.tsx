import type { CSSProperties } from "react";

export interface FooterLink {
  label: string;
  href: string;
  /** Analytics tag, e.g. "footer:github". Captured on click by the collector. */
  analytics?: string;
}

const foot: CSSProperties = {
  fontFamily: "var(--font-sans)",
  paddingBlock: "var(--space-12)",
  background: "var(--bg)",
  borderTop: "var(--elevation-hairline)",
};
const row: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "var(--space-8)",
  flexWrap: "wrap",
};
const left: CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--space-2)" };
const nameStyle: CSSProperties = {
  fontSize: "var(--text-card-title)",
  fontWeight: "var(--weight-semibold)",
  letterSpacing: "-0.01em",
  color: "var(--text)",
};
const pos: CSSProperties = {
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  maxWidth: "40ch",
};
const right: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "var(--space-4)",
};
const linkRow: CSSProperties = { display: "flex", gap: "var(--space-6)" };
const copy: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
};

/** Name, one-line positioning, links, copyright. One variant. */
export function Footer({
  name = "Nico Mastakas",
  positioning,
  links,
  year = new Date().getFullYear(),
}: {
  name?: string;
  positioning: string;
  links: FooterLink[];
  year?: number;
}) {
  return (
    <footer className="nm-footer" style={foot}>
      <div className="nm-container nm-footer__row" style={row}>
        <div style={left}>
          <span style={nameStyle}>{name}</span>
          <span style={pos}>{positioning}</span>
        </div>
        <div style={right}>
          <div style={linkRow}>
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="nm-footlink nm-focusable"
                data-analytics={l.analytics}
              >
                {l.label}
              </a>
            ))}
          </div>
          <span style={copy}>
            © {year} {name}
          </span>
        </div>
      </div>
    </footer>
  );
}
