import type { CSSProperties, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Tag } from "./Tag";

export interface CaseStudyMetric {
  value: ReactNode;
  label: ReactNode;
}

export interface CaseStudyCardProps {
  title: ReactNode;
  outcome: ReactNode;
  company: ReactNode;
  /** Short badge text/initials shown in the company mark. */
  badge?: ReactNode;
  metrics?: CaseStudyMetric[];
  tags?: string[];
  /** Internal route (e.g. `/work/settle`). Makes the whole card a locale-aware link. */
  href?: string;
}

const card: CSSProperties = {
  fontFamily: "var(--font-sans)",
  background: "var(--surface)",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-8)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-6)",
  textDecoration: "none",
  color: "inherit",
  boxSizing: "border-box",
};
const badgeRow: CSSProperties = { display: "flex", alignItems: "center", gap: "var(--space-3)" };
const badgeMark: CSSProperties = {
  width: "28px",
  height: "28px",
  flex: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--bg)",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-sm)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  fontWeight: "var(--weight-medium)",
  color: "var(--text)",
};
const companyName: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
};
const titleStyle: CSSProperties = {
  fontSize: "var(--text-card-title)",
  lineHeight: "var(--leading-title)",
  fontWeight: "var(--weight-semibold)",
  color: "var(--text)",
  margin: 0,
};
const outcomeStyle: CSSProperties = {
  fontSize: "var(--text-body)",
  lineHeight: "var(--leading-body)",
  color: "var(--text-muted)",
  margin: "var(--space-2) 0 0",
  maxWidth: "var(--measure)",
};
const metricRow: CSSProperties = { display: "flex", gap: "var(--space-8)", flexWrap: "wrap" };
const metricChip: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-1)",
};
const chipValue: CSSProperties = {
  fontSize: "var(--text-card-title)",
  fontWeight: "var(--weight-bold)",
  color: "var(--text)",
  letterSpacing: "-0.01em",
};
const chipLabel: CSSProperties = { fontSize: "var(--text-caption)", color: "var(--text-muted)" };
const tagRow: CSSProperties = { display: "flex", gap: "var(--space-2)", flexWrap: "wrap" };

/** The one project card: company badge + title + one-line outcome + metric chips + tag pills. */
export function CaseStudyCard({
  title,
  outcome,
  company,
  badge,
  metrics = [],
  tags = [],
  href,
}: CaseStudyCardProps) {
  const body = (
    <>
      <div style={badgeRow}>
        <span style={badgeMark}>{badge}</span>
        <span style={companyName}>{company}</span>
      </div>

      <div>
        <h3 style={titleStyle}>{title}</h3>
        <p style={outcomeStyle}>{outcome}</p>
      </div>

      {metrics.length > 0 ? (
        <div style={metricRow}>
          {metrics.map((m, i) => (
            <div key={i} style={metricChip}>
              <span style={chipValue}>{m.value}</span>
              <span style={chipLabel}>{m.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div style={tagRow}>
          {tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} style={card}>
        {body}
      </Link>
    );
  }
  return <div style={card}>{body}</div>;
}
