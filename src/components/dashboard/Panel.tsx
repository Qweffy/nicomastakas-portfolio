import type { CSSProperties, ReactNode } from "react";

const panel: CSSProperties = {
  background: "var(--surface)",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-md)",
  overflow: "hidden",
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
  padded = true,
  children,
}: {
  title?: string;
  action?: ReactNode;
  padded?: boolean;
  children: ReactNode;
}) {
  return (
    <section style={panel}>
      {title || action ? (
        <header style={header}>
          <h3 style={titleStyle}>{title}</h3>
          {action ? <div>{action}</div> : null}
        </header>
      ) : null}
      <div style={{ padding: padded ? "var(--space-6)" : 0 }}>{children}</div>
    </section>
  );
}
