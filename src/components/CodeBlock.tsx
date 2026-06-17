import type { CSSProperties, ReactNode } from "react";

export interface CodeBlockProps {
  children: ReactNode;
  /** Optional filename label shown in the top rule. */
  label?: ReactNode;
}

const wrap: CSSProperties = {
  background: "var(--surface)",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-md)",
  overflow: "hidden",
  boxSizing: "border-box",
};
const head: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  padding: "var(--space-3) var(--space-4)",
  borderBottom: "var(--elevation-hairline)",
};
const pre: CSSProperties = {
  margin: 0,
  padding: "var(--space-4)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  lineHeight: 1.6,
  color: "var(--text)",
  overflowX: "auto",
  whiteSpace: "pre",
};

/** Monospace code on a surface panel with a hairline border. No syntax highlighting. */
export function CodeBlock({ children, label }: CodeBlockProps) {
  return (
    <div style={wrap}>
      {label ? <div style={head}>{label}</div> : null}
      <pre style={pre}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
