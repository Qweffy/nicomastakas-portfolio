import type { CSSProperties } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/Button";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { siteConfig } from "@/lib/site";

const CARDS = [
  { slug: "settle", company: "settle", badge: "se", tags: ["Next.js", "TypeScript", "Claude API"] },
  {
    slug: "hiring-radar",
    company: "hiring-radar",
    badge: "hr",
    tags: ["pgvector", "RAG", "Next.js"],
  },
  { slug: "daily-news", company: "daily-news", badge: "dn", tags: ["Flutter", "Firebase", "RAG"] },
  {
    slug: "how-i-build-with-ai",
    company: "writeup · IOHK",
    badge: "AI",
    tags: ["Claude Code", "MCP"],
  },
] as const;

const wrap: CSSProperties = {
  minHeight: "100vh",
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "var(--font-sans)",
};
const main: CSSProperties = {
  maxWidth: "1120px",
  margin: "0 auto",
  padding: "0 var(--space-8)",
  boxSizing: "border-box",
};
const hero: CSSProperties = { padding: "var(--space-16) 0 var(--space-12)" };
const pill: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-2)",
  padding: "var(--space-2) var(--space-3)",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-sm)",
  background: "var(--surface)",
  marginBottom: "var(--space-6)",
};
const dot: CSSProperties = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "var(--accent)",
  flex: "none",
};
const pillText: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
};
const h1: CSSProperties = {
  fontSize: "var(--text-hero)",
  lineHeight: "var(--leading-hero)",
  fontWeight: "var(--weight-bold)",
  letterSpacing: "-0.025em",
  margin: 0,
  color: "var(--text)",
};
const positioning: CSSProperties = {
  fontSize: "var(--text-section)",
  lineHeight: "var(--leading-section)",
  fontWeight: "var(--weight-semibold)",
  letterSpacing: "-0.01em",
  margin: "var(--space-4) 0 0",
  color: "var(--text)",
  maxWidth: "22ch",
};
const bio: CSSProperties = {
  fontSize: "var(--text-body)",
  lineHeight: "var(--leading-body)",
  color: "var(--text-muted)",
  margin: "var(--space-6) 0 0",
  maxWidth: "var(--measure)",
};
const actions: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-3)",
  marginTop: "var(--space-8)",
};
const proofGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-md)",
  background: "var(--surface)",
  overflow: "hidden",
};
const proofCol: CSSProperties = { padding: "var(--space-8)" };
const proofColDivided: CSSProperties = {
  ...proofCol,
  borderRight: "var(--elevation-hairline)",
};
const proofKicker: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};
const proofName: CSSProperties = {
  fontSize: "var(--text-body)",
  lineHeight: 1.4,
  color: "var(--text)",
  marginTop: "var(--space-3)",
};
const proofSub: CSSProperties = {
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  marginTop: "var(--space-1)",
};
const workSection: CSSProperties = { padding: "var(--space-16) 0 var(--space-12)" };
const workHead: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "var(--space-6)",
  marginBottom: "var(--space-8)",
};
const h2: CSSProperties = {
  fontSize: "var(--text-section)",
  lineHeight: "var(--leading-section)",
  fontWeight: "var(--weight-semibold)",
  letterSpacing: "-0.01em",
  margin: 0,
  color: "var(--text)",
};
const workCount: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
};
const cardGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "var(--space-6)",
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const nav = await getTranslations("nav");

  const navLinks = [
    { label: nav("work"), href: "/#work" },
    { label: nav("how"), href: "/work/how-i-build-with-ai" },
    { label: nav("about"), href: "/about" },
    { label: nav("contact"), href: `mailto:${siteConfig.email}`, external: true },
  ];

  return (
    <div style={wrap}>
      <Nav links={navLinks} />

      <main className="nm-container" style={main}>
        <section className="nm-sect" style={hero}>
          <div style={pill}>
            <span className="nm-dot" style={dot} />
            <span style={pillText}>{t("availability")}</span>
          </div>

          <h1 style={h1}>Nico Mastakas</h1>
          <p className="nm-full" style={positioning}>
            {t("positioning")}
          </p>
          <p className="nm-full" style={bio}>
            {t("bio")}
          </p>

          <div className="nm-actions" style={actions}>
            <Button variant="primary" href={`mailto:${siteConfig.email}`}>
              {nav("contact")}
            </Button>
            <Button variant="ghost" href={siteConfig.links.github}>
              GitHub
            </Button>
            <Button variant="ghost" href={siteConfig.links.linkedin}>
              LinkedIn
            </Button>
            <Button variant="ghost" href={siteConfig.resume}>
              {t("resume")}
            </Button>
          </div>
        </section>

        <section className="nm-proof" style={proofGrid}>
          <div style={proofColDivided}>
            <div style={proofKicker}>{t("proof.role1")}</div>
            <div style={proofName}>Input Output (IOHK)</div>
            <div style={proofSub}>{t("proof.sub1")}</div>
          </div>
          <div style={proofColDivided}>
            <div style={proofKicker}>{t("proof.role2")}</div>
            <div style={proofName}>
              Bolster —{" "}
              <span style={{ fontWeight: "var(--weight-bold)", color: "var(--accent)" }}>
                {t("proof.bolsterHi")}
              </span>{" "}
              {t("proof.bolsterPost")}
            </div>
            <div style={proofSub}>{t("proof.sub2")}</div>
          </div>
          <div style={proofCol}>
            <div style={proofKicker}>{t("proof.role3")}</div>
            <div style={proofName}>Globant</div>
            <div style={proofSub}>{t("proof.sub3")}</div>
          </div>
        </section>

        <section id="work" className="nm-sect" style={workSection}>
          <div style={workHead}>
            <h2 style={h2}>{t("workTitle")}</h2>
            <span style={workCount}>{t("workCount")}</span>
          </div>

          <div className="nm-grid-2" style={cardGrid}>
            {CARDS.map((card) => (
              <CaseStudyCard
                key={card.slug}
                href={`/work/${card.slug}`}
                company={card.company}
                badge={card.badge}
                title={t(`cards.${card.slug}.title`)}
                outcome={t(`cards.${card.slug}.outcome`)}
                metrics={[
                  {
                    value: t(`cards.${card.slug}.metricValue`),
                    label: t(`cards.${card.slug}.metricLabel`),
                  },
                ]}
                tags={[...card.tags]}
              />
            ))}
          </div>

          <div style={{ marginTop: "var(--space-8)" }}>
            <Button variant="link" href={siteConfig.links.github}>
              {t("moreGitHub")}
            </Button>
          </div>
        </section>
      </main>

      <Footer positioning={t("positioning")} links={footerLinks()} />
    </div>
  );
}

function footerLinks() {
  return [
    { label: "Email", href: `mailto:${siteConfig.email}` },
    { label: "GitHub", href: siteConfig.links.github },
    { label: "LinkedIn", href: siteConfig.links.linkedin },
    { label: "Resume", href: siteConfig.resume },
  ];
}
