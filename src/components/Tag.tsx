import type { ReactNode } from "react";

/** Tech-stack / category pill. One size, one style. */
export function Tag({ children }: { children: ReactNode }) {
  return <span className="nm-tag">{children}</span>;
}
