import type { MouseEvent, ReactNode } from "react";

export interface ButtonProps {
  /** primary = accent fill, ghost = hairline border, link = inline accent text. */
  variant?: "primary" | "ghost" | "link";
  /** If set, renders an anchor instead of a button. */
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  /** Larger, attention-grabbing CTA (design-system detail). */
  large?: boolean;
  onClick?: (e: MouseEvent) => void;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  href,
  onClick,
  disabled = false,
  type = "button",
  large = false,
  children,
}: ButtonProps) {
  const className = `nm-btn nm-btn--${variant}${large ? " nm-btn--lg" : ""} nm-focusable${disabled ? " is-disabled" : ""}`;

  if (href && !disabled) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
