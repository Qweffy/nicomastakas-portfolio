import type { CSSProperties } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/Button";
import { Footer } from "@/components/Footer";
import { Metric } from "@/components/Metric";
import { Nav } from "@/components/Nav";
import { Tag } from "@/components/Tag";
import { siteConfig } from "@/lib/site";

const ROLES = ["wallet", "fintech", "proptech", "founder"] as const;

type RoleMetric = { value: string; label: string };

const wrap: CSSProperties = {
  minHeight: "100vh",
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "var(--font-sans)",
};
const article: CSSProperties = {
  maxWidth: "920px",
  margin: "0 auto",
  padding: "0 var(--space-8)",
  boxSizing: "border-box",
};
const kicker: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "var(--space-6)",
};
const dot: CSSProperties = { color: "var(--accent)" };
const intro: CSSProperties = { padding: "var(--space-16) 0 var(--space-12)" };
const introTitle: CSSProperties = {
  fontSize: "var(--text-section)",
  lineHeight: "var(--leading-section)",
  fontWeight: "var(--weight-semibold)",
  letterSpacing: "-0.01em",
  margin: 0,
  color: "var(--text)",
  maxWidth: "26ch",
};
const body: CSSProperties = {
  fontSize: "var(--text-body)",
  lineHeight: "var(--leading-body)",
  color: "var(--text-muted)",
  margin: "var(--space-6) 0 0",
  maxWidth: "var(--measure)",
};
const section: CSSProperties = {
  padding: "var(--space-12) 0 var(--space-6)",
  borderTop: "var(--elevation-hairline)",
};
const roleList: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-12)",
};
const roleHead: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "var(--space-6)",
  flexWrap: "wrap",
};
const roleName: CSSProperties = {
  fontSize: "var(--text-card-title)",
  lineHeight: "var(--leading-title)",
  fontWeight: "var(--weight-semibold)",
  margin: 0,
  color: "var(--text)",
};
const roleMeta: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
};
const roleBody: CSSProperties = { ...body, margin: "var(--space-3) 0 0" };
const metricRow: CSSProperties = {
  display: "flex",
  gap: "var(--space-12)",
  flexWrap: "wrap",
  marginTop: "var(--space-6)",
};
const tagRow: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-2)",
  marginTop: "var(--space-6)",
};
const howText: CSSProperties = { ...body, color: "var(--text)", margin: 0 };
const practiceList: CSSProperties = {
  listStyle: "none",
  margin: "var(--space-6) 0 0",
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
  maxWidth: "var(--measure)",
};
const practiceItem: CSSProperties = {
  fontSize: "var(--text-body)",
  lineHeight: "var(--leading-body)",
  color: "var(--text-muted)",
  paddingLeft: "var(--space-4)",
  borderLeft: "2px solid var(--border)",
};
const practiceTitle: CSSProperties = { color: "var(--text)", fontWeight: "var(--weight-semibold)" };
const contactSection: CSSProperties = {
  padding: "var(--space-12) 0 var(--space-16)",
  borderTop: "var(--elevation-hairline)",
};
const actions: CSSProperties = { display: "flex", flexWrap: "wrap", gap: "var(--space-3)" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("kicker"), description: t("intro").slice(0, 160) };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const footer = await getTranslations("footer");

  return (
    <div style={wrap}>
      <Nav links={navLinks(await getTranslations("nav"))} />

      <article className="nm-container" style={article}>
        <section className="nm-sect" style={intro}>
          <div style={kicker}>
            <span style={dot}>·</span> {t("kicker")}
          </div>
          <h1 style={introTitle}>{t("title")}</h1>
          <p className="nm-full" style={body}>
            {t("intro")}
          </p>
        </section>

        <section className="nm-sect" style={section}>
          <div style={{ ...kicker, marginBottom: "var(--space-8)" }}>
            <span style={dot}>·</span> {t("experienceKicker")}
          </div>
          <div style={roleList}>
            {ROLES.map((role) => {
              const metrics = t.raw(`roles.${role}.metrics`) as RoleMetric[];
              const tags = t.raw(`roles.${role}.tags`) as string[];
              return (
                <div key={role} className="nm-exp">
                  <div className="nm-entry-head" style={roleHead}>
                    <h2 style={roleName}>{t(`roles.${role}.name`)}</h2>
                    <span style={roleMeta}>{t(`roles.${role}.meta`)}</span>
                  </div>
                  <p style={roleBody}>{t(`roles.${role}.body`)}</p>
                  {metrics.length > 0 ? (
                    <div className="nm-metric-row" style={metricRow}>
                      {metrics.map((m) => (
                        <Metric key={m.label} value={m.value} label={m.label} />
                      ))}
                    </div>
                  ) : null}
                  <div style={tagRow}>
                    {tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="nm-sect" style={{ ...section, padding: "var(--space-12) 0" }}>
          <div style={kicker}>
            <span style={dot}>·</span> {t("howKicker")}
          </div>
          <p className="nm-full" style={howText}>
            {t("howIntro")}
          </p>
          <ul style={practiceList}>
            {(t.raw("practice") as { title: string; body: string }[]).map((p) => (
              <li key={p.title} style={practiceItem}>
                <span style={practiceTitle}>{p.title}</span>: {p.body}
              </li>
            ))}
          </ul>
        </section>

        <section className="nm-sect" style={contactSection}>
          <div style={kicker}>
            <span style={dot}>·</span> {t("contactKicker")}
          </div>
          <div className="nm-actions" style={actions}>
            <Button variant="primary" href={`mailto:${siteConfig.email}`}>
              Email
            </Button>
            <Button variant="ghost" href={siteConfig.links.github}>
              GitHub
            </Button>
            <Button variant="ghost" href={siteConfig.links.linkedin}>
              LinkedIn
            </Button>
            <Button variant="ghost" href={siteConfig.resume}>
              Resume (PDF)
            </Button>
          </div>
        </section>
      </article>

      <Footer positioning={footer("positioning")} links={footerLinks()} />
    </div>
  );
}

function navLinks(nav: Awaited<ReturnType<typeof getTranslations>>) {
  return [
    { label: nav("work"), href: "/#work" },
    { label: nav("how"), href: "/work/how-i-build-with-ai" },
    { label: nav("design"), href: "/design" },
    { label: nav("about"), href: "/about" },
    { label: nav("contact"), href: `mailto:${siteConfig.email}`, external: true },
  ];
}

function footerLinks() {
  return [
    { label: "Email", href: `mailto:${siteConfig.email}` },
    { label: "GitHub", href: siteConfig.links.github },
    { label: "LinkedIn", href: siteConfig.links.linkedin },
    { label: "Resume", href: siteConfig.resume },
  ];
}
