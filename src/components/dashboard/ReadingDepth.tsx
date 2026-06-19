import type { CSSProperties } from "react";
import type { ReadingDepthRow } from "@/lib/dashboard/queries";

const empty: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
};
const list: CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--space-6)" };
const head: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: "var(--space-3)",
  marginBottom: "var(--space-3)",
};
const slugStyle: CSSProperties = {
  fontSize: "var(--text-body)",
  color: "var(--text)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  minWidth: 0,
};
const viewersStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  whiteSpace: "nowrap",
};
const bars: CSSProperties = {
  display: "flex",
  gap: "var(--space-2)",
  alignItems: "flex-end",
  height: "56px",
};
const col: CSSProperties = { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-1)" };
const pctText: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)" };
const track: CSSProperties = {
  width: "100%",
  height: "36px",
  display: "flex",
  alignItems: "flex-end",
  background: "var(--surface-2)",
  borderRadius: "var(--radius-sm)",
  overflow: "hidden",
};
const depthLabel: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)" };

export function ReadingDepth({ rows }: { rows: ReadingDepthRow[] }) {
  if (rows.length === 0) return <p style={empty}>No reads yet.</p>;

  return (
    <div style={list}>
      {rows.map((r) => {
        const segs = [
          { m: "25%", c: r.d25 },
          { m: "50%", c: r.d50 },
          { m: "75%", c: r.d75 },
          { m: "100%", c: r.d100 },
        ];
        return (
          <div key={r.slug}>
            <div style={head}>
              <span style={slugStyle}>{r.slug}</span>
              <span style={viewersStyle}>{r.viewers} viewers</span>
            </div>
            <div style={bars}>
              {segs.map((s) => {
                const pct = r.viewers ? Math.round((s.c / r.viewers) * 100) : 0;
                return (
                  <div key={s.m} style={col}>
                    <span style={pctText}>{pct}%</span>
                    <div style={track} title={`${s.m}: ${s.c}/${r.viewers}`}>
                      <div
                        style={{
                          width: "100%",
                          height: `${Math.min(100, pct)}%`,
                          background: "var(--accent)",
                        }}
                      />
                    </div>
                    <span style={depthLabel}>{s.m}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
