import Link from "next/link";
import type { Range } from "@/lib/dashboard/queries";

const OPTIONS: { key: Range; label: string }[] = [
  { key: "24h", label: "24h" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "all", label: "All" },
];

/** Range selector. Link-based (zero-JS) but styled like the design-system segmented control. */
export function RangeTabs({ active }: { active: Range }) {
  return (
    <div className="nm-seg" role="tablist">
      {OPTIONS.map((o) => {
        const isActive = o.key === active;
        return (
          <Link
            key={o.key}
            href={`/dashboard?range=${o.key}`}
            role="tab"
            aria-selected={isActive}
            className={`nm-seg__tab nm-focusable${isActive ? "is-active" : ""}`}
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}
