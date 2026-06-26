/* eslint-disable @next/next/no-img-element -- SSG site, build-time-optimized committed WebP previews */
import type { CSSProperties } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { DESIGN_SYSTEMS } from "@/lib/design";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";

const wrap: CSSProperties = {
  minHeight: "100vh",
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "var(--font-sans)",
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
  fontSize: "var(--text-section)",
  lineHeight: "var(--leading-section)",
  fontWeight: "var(--weight-semibold)",
  letterSpacing: "-0.01em",
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
  padding: "var(--space-12) 0 var(--space-16)",
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
const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "var(--space-6)",
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

      <main className="nm-container">
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
          <h2 style={sectionTitle}>{t("systemsKicker")}</h2>
          <p className="nm-full" style={note}>
            {t("systemsNote")}
          </p>
          <div className="nm-grid-2" style={grid}>
            {DESIGN_SYSTEMS.map((s) => (
              <Link
                key={s.slug}
                href={`/design/${s.slug}`}
                className="nm-syscard nm-focusable"
                data-analytics={`design_card:${s.slug}`}
              >
                <div className="nm-syscard__preview">
                  <img
                    src={`/images/design/${s.slug}/overview.webp`}
                    alt={`${t(`systems.${s.slug}.name`)} design system`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="nm-syscard__body">
                  <div className="nm-syscard__name">{t(`systems.${s.slug}.name`)}</div>
                  <div className="nm-syscard__tagline">{t(`systems.${s.slug}.tagline`)}</div>
                  <div className="nm-syscard__cta">{t("viewSystem")}</div>
                </div>
              </Link>
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
    { label: "GitHub", href: siteConfig.links.github, analytics: "social:github" },
    { label: "LinkedIn", href: siteConfig.links.linkedin, analytics: "social:linkedin" },
    { label: "Resume", href: siteConfig.resume },
  ];
}
