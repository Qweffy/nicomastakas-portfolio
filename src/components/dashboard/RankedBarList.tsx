import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { formatNumber } from "@/lib/dashboard/format";
import type { RankItem } from "@/lib/dashboard/queries";

const empty: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  padding: "var(--space-8) var(--space-6)",
  textAlign: "center",
};
const row: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  gap: "var(--space-4)",
  padding: "var(--space-3) var(--space-6)",
  overflow: "hidden",
  textDecoration: "none",
  color: "inherit",
};
const label: CSSProperties = {
  position: "relative",
  fontFamily: "var(--font-sans)",
  fontSize: "var(--text-body)",
  color: "var(--text)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  minWidth: 0,
};
const val: CSSProperties = {
  position: "relative",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  whiteSpace: "nowrap",
};

export function RankedBarList({
  items,
  formatValue = formatNumber,
  emptyLabel = "No data for this range",
  hrefFor,
}: {
  items: RankItem[];
  formatValue?: (n: number) => string;
  emptyLabel?: string;
  hrefFor?: (label: string) => string;
}) {
  if (items.length === 0) return <div style={empty}>{emptyLabel}</div>;
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div>
      {items.map((item) => {
        const inner: ReactNode = (
          <>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${Math.round((item.value / max) * 100)}%`,
                background: "var(--chart-area)",
                borderRight: "1px solid var(--chart-area-edge)",
                pointerEvents: "none",
              }}
            />
            <span style={label}>{item.label}</span>
            <span style={val}>{formatValue(item.value)}</span>
          </>
        );
        return hrefFor ? (
          <Link key={item.label} href={hrefFor(item.label)} className="nm-rank__row" style={row}>
            {inner}
          </Link>
        ) : (
          <div key={item.label} className="nm-rank__row" style={row}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
