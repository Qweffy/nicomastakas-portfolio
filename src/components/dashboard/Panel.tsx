import type { CSSProperties, ReactNode } from "react";
import { InfoTip } from "./InfoTip";

const panel: CSSProperties = {
  background: "var(--surface)",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-md)",
  boxSizing: "border-box",
  minWidth: 0,
};
const header: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-4)",
  padding: "var(--space-4) var(--space-6)",
  borderBottom: "var(--elevation-hairline)",
};
const titleStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  letterSpacing: "var(--tracking-label)",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  margin: 0,
};

export function Panel({
  title,
  action,
  info,
  padded = true,
  children,
}: {
  title?: string;
  action?: ReactNode;
  info?: string;
  padded?: boolean;
  children: ReactNode;
}) {
  const hasHeader = Boolean(title || action || info);
  return (
    <section style={panel}>
      {hasHeader ? (
        <header style={header}>
          <h3 style={titleStyle}>{title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            {action}
            {info ? <InfoTip text={info} /> : null}
          </div>
        </header>
      ) : null}
      <div
        style={{
          padding: padded ? "var(--space-6)" : 0,
          // Clip body content (e.g. bar rows) to the panel's rounded corners without
          // clipping the header's tooltip, which now escapes the panel freely.
          overflow: "hidden",
          borderRadius: hasHeader ? "0 0 var(--radius-md) var(--radius-md)" : "var(--radius-md)",
        }}
      >
        {children}
      </div>
    </section>
  );
}
