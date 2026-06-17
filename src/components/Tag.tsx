import type { CSSProperties, ReactNode } from "react";

const style: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  fontWeight: "var(--weight-medium)",
  lineHeight: 1,
  color: "var(--text-muted)",
  background: "var(--surface)",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-2) var(--space-3)",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
};

/** Tech-stack / category pill. One size, one style. */
export function Tag({ children }: { children: ReactNode }) {
  return <span style={style}>{children}</span>;
}
