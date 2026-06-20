import type { CSSProperties } from "react";
import { formatRelativeTime } from "@/lib/dashboard/format";
import type { FeedItem } from "@/lib/dashboard/queries";

const empty: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
};
const list: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  maxHeight: "360px",
  overflowY: "auto",
};
const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "var(--space-4)",
  padding: "var(--space-2) 0",
  borderBottom: "var(--elevation-hairline)",
};
const text: CSSProperties = {
  fontSize: "var(--text-caption)",
  color: "var(--text)",
  minWidth: 0,
};
const dot: CSSProperties = {
  display: "inline-block",
  width: "6px",
  height: "6px",
  borderRadius: "9999px",
  background: "var(--success)",
  marginRight: "var(--space-2)",
  flexShrink: 0,
};
const place: CSSProperties = { color: "var(--text-muted)" };
const placeAccent: CSSProperties = { color: "var(--accent)", fontWeight: "var(--weight-medium)" };
const time: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

// ISO country code (from Vercel geo headers) to a full Spanish name, e.g. NL -> Países Bajos.
const regionNames = new Intl.DisplayNames(["es"], { type: "region" });
function countryName(code: string): string {
  try {
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

function cleanPath(path: string | null): string {
  if (!path) return "una página";
  const p = path.replace(/^\/es(?=\/|$)/, "") || "/";
  return p === "/" ? "el inicio" : p;
}

function action(item: FeedItem): { text: string; highValue: boolean } {
  if (item.type === "pageview") return { text: `vio ${cleanPath(item.path)}`, highValue: false };
  const l = item.label ?? "";
  switch (item.eventName) {
    case "cv_download":
      return { text: "bajó tu CV", highValue: true };
    case "contact":
      return { text: "tocó contacto", highValue: true };
    case "outbound":
      return { text: `fue a ${item.host ?? "un link externo"}`, highValue: false };
    case "demo":
      return { text: `abrió la demo de ${l}`, highValue: false };
    case "case_study":
      return { text: `abrió el case study de ${l}`, highValue: false };
    case "repo":
      return { text: `fue al repo de ${l}`, highValue: false };
    case "social":
      return { text: `fue a ${l}`, highValue: false };
    case "project_card":
    case "design_card":
    case "more_work":
      return { text: `abrió ${l}`, highValue: false };
    case "nav":
    case "footer":
      return { text: `navegó a ${l}`, highValue: false };
    default:
      return { text: "interactuó", highValue: false };
  }
}

export function ActivityFeed({ items }: { items: FeedItem[] }) {
  if (items.length === 0) return <p style={empty}>No activity yet.</p>;

  return (
    <div style={list}>
      {items.map((item, i) => {
        const who = item.country
          ? item.city
            ? `${item.city}, ${countryName(item.country)}`
            : countryName(item.country)
          : null;
        const a = action(item);
        return (
          <div key={`${item.epoch}-${i}`} style={rowStyle}>
            <span style={text}>
              {a.highValue ? <span style={dot} aria-hidden="true" /> : null}
              {who ? (
                <span style={place}>
                  Alguien de <span style={placeAccent}>{who}</span>
                </span>
              ) : (
                <span style={place}>Alguien</span>
              )}{" "}
              <span style={{ color: a.highValue ? "var(--success)" : "var(--text)" }}>
                {a.text}
              </span>
            </span>
            <span style={time}>{formatRelativeTime(item.epoch)}</span>
          </div>
        );
      })}
    </div>
  );
}
