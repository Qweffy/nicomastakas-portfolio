import type { CSSProperties } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Shot } from "@/components/Shot";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";

const SWATCHES = [
  { var: "--bg", name: "--bg", hex: "#0E0F11" },
  { var: "--surface", name: "--surface", hex: "#16181C" },
  { var: "--border", name: "--border", hex: "#26282E" },
  { var: "--text", name: "--text", hex: "#E6E6E6" },
  { var: "--text-muted", name: "--text-muted", hex: "#9BA1A8" },
  { var: "--accent", name: "--accent", hex: "#4F8CFF" },
] as const;

const SYSTEMS = [
  { key: "hiring-radar", src: "/images/design/ds-hiring-radar.webp", id: "ds-hiring-radar" },
  { key: "settle", src: "/images/design/ds-settle.webp", id: "ds-settle" },
] as const;

const PRODUCTS = [
  {
    key: "hiring-radar",
    shot: "/images/hiring-radar/dashboard.png",
    live: "https://hiring-radar.nicomastakas.com",
    caseStudy: "/work/hiring-radar",
  },
  {
    key: "rubric",
    shot: "/images/rubric/suites-overview.png",
    live: "https://rubric.nicomastakas.com",
    caseStudy: "/work/rubric",
  },
  {
    key: "settle",
    shot: "/images/settle/cockpit.png",
    live: "https://settle.nicomastakas.com",
    caseStudy: "/work/settle",
  },
  { key: "shoebox", shot: "/images/shoebox/overview.png", live: null, caseStudy: "/work/shoebox" },
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
const intro: CSSProperties = { padding: "var(--space-16) 0 var(--space-12)" };
const kicker: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "var(--space-6)",
};
const dot: CSSProperties = { color: "var(--accent)" };
const h1: CSSProperties = {
  fontSize: "var(--text-hero)",
  lineHeight: "var(--leading-hero)",
  fontWeight: "var(--weight-bold)",
  letterSpacing: "-0.025em",
  margin: 0,
  color: "var(--text)",
};
const lead: CSSProperties = {
  fontSize: "var(--text-body)",
  lineHeight: "var(--leading-body)",
  color: "var(--text-muted)",
  margin: "var(--space-6) 0 0",
  maxWidth: "var(--measure)",
};
const toolchain: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--accent)",
  marginTop: "var(--space-6)",
};
const section: CSSProperties = {
  padding: "var(--space-12) 0",
  borderTop: "var(--elevation-hairline)",
};
const sectionTitle: CSSProperties = {
  fontSize: "var(--text-section)",
  lineHeight: "var(--leading-section)",
  fontWeight: "var(--weight-semibold)",
  letterSpacing: "-0.01em",
  margin: 0,
  color: "var(--text)",
};
const note: CSSProperties = {
  fontSize: "var(--text-body)",
  lineHeight: "var(--leading-body)",
  color: "var(--text-muted)",
  margin: "var(--space-3) 0 var(--space-8)",
  maxWidth: "var(--measure)",
};
const grid2: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "var(--space-6)",
};
const shotFoot: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "var(--space-4)",
  flexWrap: "wrap",
  marginTop: "var(--space-3)",
};
const prodName: CSSProperties = {
  fontSize: "var(--text-body)",
  fontWeight: "var(--weight-medium)",
  color: "var(--text)",
  minWidth: 0,
};
const prodLinks: CSSProperties = {
  display: "flex",
  gap: "var(--space-6)",
  flex: "none",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "design" });
  return { title: t("kicker"), description: t("intro").slice(0, 160) };
}

export default async function DesignPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("design");
  const nav = await getTranslations("nav");
  const footer = await getTranslations("footer");

  return (
    <div style={wrap}>
      <Nav links={navLinks(nav)} />

      <main className="nm-container" style={main}>
        <section className="nm-sect" style={intro}>
          <div style={kicker}>
            <span style={dot}>·</span> {t("kicker")}
          </div>
          <h1 style={h1}>{t("title")}</h1>
          <p className="nm-full" style={lead}>
            {t("intro")}
          </p>
          <div style={toolchain}>{t("toolchain")}</div>
        </section>

        <section className="nm-sect" style={section}>
          <h2 style={sectionTitle}>{t("tokensKicker")}</h2>
          <p className="nm-full" style={note}>
            {t("tokensNote")}
          </p>
          <div className="nm-tokens">
            {SWATCHES.map((s) => (
              <div key={s.var} className="nm-swatch">
                <div className="nm-swatch__chip" style={{ background: `var(${s.var})` }} />
                <div className="nm-swatch__meta">
                  <div className="nm-swatch__name">{s.name}</div>
                  <div className="nm-swatch__hex">{s.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="nm-sect" style={section}>
          <h2 style={sectionTitle}>{t("systemsKicker")}</h2>
          <p className="nm-full" style={note}>
            {t("systemsNote")}
          </p>

          <div style={{ marginBottom: "var(--space-6)" }}>
            <Shot
              src="/images/design/ds-portfolio.webp"
              alt="Nico Mastakas design system: Foundations"
              id="ds-portfolio"
              tall
              caption={t("ds.portfolio")}
            />
          </div>

          <div className="nm-grid-2" style={grid2}>
            {SYSTEMS.map((s) => (
              <Shot
                key={s.id}
                src={s.src}
                alt={`${s.key} design system`}
                id={s.id}
                tall
                caption={t(`ds.${s.key}`)}
              />
            ))}
          </div>
        </section>

        <section className="nm-sect" style={section}>
          <h2 style={sectionTitle}>{t("shippedKicker")}</h2>
          <p className="nm-full" style={note}>
            {t("shippedNote")}
          </p>
          <div className="nm-grid-2" style={grid2}>
            {PRODUCTS.map((p) => (
              <div key={p.key}>
                <Shot src={p.shot} alt={`${p.key} shipped to production`} id={`shipped-${p.key}`} />
                <div style={shotFoot}>
                  <span style={prodName}>{t(`products.${p.key}`)}</span>
                  <span style={prodLinks}>
                    {p.live ? (
                      <a
                        className="nm-footlink nm-focusable"
                        href={p.live}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("live")}
                      </a>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>{t("noDemo")}</span>
                    )}
                    <Link className="nm-footlink nm-focusable" href={p.caseStudy}>
                      {t("caseStudy")}
                    </Link>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

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
