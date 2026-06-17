import type { CSSProperties, ReactNode } from "react";

export interface CalloutProps {
  children: ReactNode;
  cite?: ReactNode;
}

const box: CSSProperties = {
  fontFamily: "var(--font-sans)",
  background: "var(--surface)",
  border: "var(--elevation-hairline)",
  borderLeft: "2px solid var(--accent)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-6) var(--space-8)",
  boxSizing: "border-box",
};
const text: CSSProperties = {
  fontSize: "var(--text-body)",
  lineHeight: "var(--leading-body)",
  color: "var(--text)",
  margin: 0,
  maxWidth: "var(--measure)",
};
const citeStyle: CSSProperties = {
  display: "block",
  marginTop: "var(--space-3)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  fontStyle: "normal",
};

/** One note / pull-quote box for prose. Surface panel with an accent left rule. */
export function Callout({ children, cite }: CalloutProps) {
  return (
    <div style={box}>
      <p style={text}>{children}</p>
      {cite ? <cite style={citeStyle}>{cite}</cite> : null}
    </div>
  );
}
