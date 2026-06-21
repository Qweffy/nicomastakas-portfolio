import type { CSSProperties } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/Button";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";

const CARDS = [
  {
    slug: "hiring-radar",
    company: "hiring-radar",
    badge: "hr",
    tags: ["pgvector", "RAG", "Next.js"],
  },
  { slug: "shoebox", company: "shoebox", badge: "sb", tags: ["PaddleOCR", "Qwen-3B", "QLoRA"] },
  { slug: "rubric", company: "rubric", badge: "ru", tags: ["TypeScript", "LLM-judge", "CI"] },
  { slug: "settle", company: "settle", badge: "se", tags: ["Next.js", "Claude API", "Playwright"] },
  {
    slug: "today-only",
    company: "personal product",
    badge: "to",
    tags: ["SwiftUI", "Tauri", "product"],
  },
  {
    slug: "how-i-build-with-ai",
    company: "writeup",
    badge: "AI",
    tags: ["multi-agent", "MCP", "FinOps"],
  },
] as const;

// Compact "More work" rows — not full cards. Internal slugs link to a case study;
// external entries link straight to the repo.
const MORE = [
  { key: "daily-news", href: "/work/daily-news", external: false },
  { key: "tether", href: "https://github.com/Qweffy/tether-wdk-challenge", external: true },
  { key: "offline", href: "https://github.com/Qweffy/JSONPlaceholderApp", external: true },
] as const;

const wrap: CSSProperties = {
  minHeight: "100vh",
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "var(--font-sans)",
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
const strengthBody: CSSProperties = {
  fontSize: "var(--text-body)",
  lineHeight: 1.5,
  color: "var(--text-muted)",
  marginTop: "var(--space-3)",
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
const moreHead: CSSProperties = {
  fontSize: "var(--text-card-title)",
  lineHeight: "var(--leading-title)",
  fontWeight: "var(--weight-semibold)",
  letterSpacing: "-0.01em",
  margin: "0 0 var(--space-4)",
  color: "var(--text)",
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const nav = await getTranslations("nav");

  const navLinks = [
    { label: nav("work"), href: "/#work", analytics: "nav:work" },
    { label: nav("how"), href: "/work/how-i-build-with-ai", analytics: "nav:how" },
    { label: nav("design"), href: "/design", analytics: "nav:design" },
    { label: nav("about"), href: "/about", analytics: "nav:about" },
    { label: nav("contact"), href: `mailto:${siteConfig.email}`, external: true },
  ];

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.url,
    image: `${siteConfig.url}/nico.jpg`,
    jobTitle: "AI-native Product Engineer",
    description: siteConfig.description,
    sameAs: [siteConfig.links.github, siteConfig.links.linkedin],
  };

  return (
    <div style={wrap}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <Nav links={navLinks} />

      <main className="nm-container">
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
            <Button variant="ghost" href={siteConfig.links.github} dataAnalytics="social:github">
              GitHub
            </Button>
            <Button
              variant="ghost"
              href={siteConfig.links.linkedin}
              dataAnalytics="social:linkedin"
            >
              LinkedIn
            </Button>
            <Button variant="ghost" href={siteConfig.resume}>
              {t("resume")}
            </Button>
          </div>
        </section>

        <section className="nm-proof" style={proofGrid}>
          {(t.raw("strengths") as { title: string; body: string }[]).map((s, i) => (
            <div key={s.title} style={i < 2 ? proofColDivided : proofCol}>
              <div style={proofKicker}>{s.title}</div>
              <div style={strengthBody}>{s.body}</div>
            </div>
          ))}
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
                dataAnalytics={`project_card:${card.slug}`}
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

          <div style={{ marginTop: "var(--space-16)" }}>
            <h3 style={moreHead}>{t("moreTitle")}</h3>
            <div className="nm-morework">
              {MORE.map((m) =>
                m.external ? (
                  <a
                    key={m.key}
                    href={m.href}
                    className="nm-morework__row"
                    target="_blank"
                    rel="noreferrer"
                    data-analytics={`repo:${m.key}`}
                  >
                    <div className="nm-morework__main">
                      <div className="nm-morework__title">{t(`more.${m.key}.title`)}</div>
                      <div className="nm-morework__sub">{t(`more.${m.key}.sub`)}</div>
                    </div>
                    <span className="nm-morework__meta">{t(`more.${m.key}.meta`)}</span>
                  </a>
                ) : (
                  <Link
                    key={m.key}
                    href={m.href}
                    className="nm-morework__row"
                    data-analytics={`more_work:${m.key}`}
                  >
                    <div className="nm-morework__main">
                      <div className="nm-morework__title">{t(`more.${m.key}.title`)}</div>
                      <div className="nm-morework__sub">{t(`more.${m.key}.sub`)}</div>
                    </div>
                    <span className="nm-morework__meta">{t(`more.${m.key}.meta`)}</span>
                  </Link>
                ),
              )}
            </div>
          </div>

          <div style={{ marginTop: "var(--space-8)" }}>
            <Button variant="link" href={siteConfig.links.github} dataAnalytics="social:github">
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
    { label: "GitHub", href: siteConfig.links.github, analytics: "social:github" },
    { label: "LinkedIn", href: siteConfig.links.linkedin, analytics: "social:linkedin" },
    { label: "Resume", href: siteConfig.resume },
  ];
}
