import type { CSSProperties, MouseEvent, ReactNode } from "react";

export interface ButtonProps {
  /** primary = accent fill, ghost = hairline border, link = inline accent text. */
  variant?: "primary" | "ghost" | "link";
  /** If set, renders an anchor instead of a button. */
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: (e: MouseEvent) => void;
  children?: ReactNode;
}

const base: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "var(--text-body)",
  fontWeight: "var(--weight-medium)",
  lineHeight: 1,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  transition: "none",
};

const variants: Record<NonNullable<ButtonProps["variant"]>, CSSProperties> = {
  primary: {
    ...base,
    padding: "var(--space-3) var(--space-6)",
    background: "var(--accent)",
    color: "var(--bg)",
    border: "1px solid var(--accent)",
    borderRadius: "var(--radius-sm)",
  },
  ghost: {
    ...base,
    padding: "var(--space-3) var(--space-6)",
    background: "transparent",
    color: "var(--text)",
    border: "var(--elevation-hairline)",
    borderRadius: "var(--radius-sm)",
  },
  link: {
    ...base,
    padding: 0,
    background: "transparent",
    color: "var(--accent)",
    border: "none",
    borderRadius: 0,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    textDecorationThickness: "1px",
  },
};

export function Button({
  variant = "primary",
  href,
  onClick,
  disabled = false,
  type = "button",
  children,
}: ButtonProps) {
  const style: CSSProperties = {
    ...variants[variant],
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
  };

  if (href && !disabled) {
    return (
      <a href={href} style={style} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} style={style} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
