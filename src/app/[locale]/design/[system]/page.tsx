import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Shot } from "@/components/Shot";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { designSystemSlugs, getDesignSystem, groupedCards } from "@/lib/design";
import { siteConfig } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    designSystemSlugs.map((system) => ({ locale, system })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; system: string }>;
}) {
  const { locale, system } = await params;
  if (!getDesignSystem(system)) return {};
  const t = await getTranslations({ locale, namespace: "design" });
  return {
    title: `${t(`systems.${system}.name`)} · ${t("kicker")}`,
    description: t(`systems.${system}.tagline`),
  };
}

const wrap: CSSProperties = {
  minHeight: "100vh",
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "var(--font-sans)",
};
const head: CSSProperties = { padding: "var(--space-16) 0 var(--space-12)" };
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
  maxWidth: "28ch",
};
const ctaRow: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-4)",
  marginTop: "var(--space-8)",
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
const groupTitle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  margin: "var(--space-8) 0 var(--space-4)",
};
const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "var(--space-6)",
};
const capName: CSSProperties = { color: "var(--text)", fontWeight: "var(--weight-medium)" };

export default async function DesignSystemPage({
  params,
}: {
  params: Promise<{ locale: string; system: string }>;
}) {
  const { locale, system } = await params;
  setRequestLocale(locale);
  const sys = getDesignSystem(system);
  if (!sys) notFound();

  const t = await getTranslations("design");
  const nav = await getTranslations("nav");
  const footer = await getTranslations("footer");
  const groups = groupedCards(system);
  const liveLabel = t(`systems.${system}.liveLabel`);
  const caseLabel = t(`systems.${system}.caseLabel`);

  return (
    <div style={wrap}>
      <Nav links={navLinks(nav)} />

      <main className="nm-container">
        <section className="nm-sect" style={head}>
          <div style={kicker}>
            <Link href="/design" className="nm-footlink nm-focusable">
              {t("kicker")}
            </Link>{" "}
            <span style={dot}>·</span> {t(`systems.${system}.name`)}
          </div>
          <h1 style={h1}>{t(`systems.${system}.tagline`)}</h1>

          <div className="nm-actions" style={ctaRow}>
            {sys.liveExternal ? (
              <a
                className="nm-btn nm-btn--primary nm-btn--lg nm-focusable"
                href={sys.live}
                target="_blank"
                rel="noreferrer"
                data-analytics={`demo:${system}`}
              >
                {liveLabel}
              </a>
            ) : (
              <Link
                className="nm-btn nm-btn--primary nm-btn--lg nm-focusable"
                href={sys.live}
                data-analytics={`demo:${system}`}
              >
                {liveLabel}
              </Link>
            )}
            <Link
              className="nm-btn nm-btn--ghost nm-btn--lg nm-focusable"
              href={sys.caseStudy}
              data-analytics={`case_study:${system}`}
            >
              {caseLabel}
            </Link>
          </div>
        </section>

        <section className="nm-sect" style={section}>
          <h2 style={sectionTitle}>{t("completeKicker")}</h2>
          <p className="nm-full" style={note}>
            {t("completeNote")}
          </p>

          <div style={groupTitle}>{t("foundations")}</div>
          <Shot
            src={`/images/design/${system}/overview.webp`}
            alt={`${t(`systems.${system}.name`)} foundations`}
            id={`${system}-overview`}
            tall
          />

          {groups.map((g) => (
            <div key={g.group}>
              <div style={groupTitle}>{t(`groups.${g.group}`)}</div>
              <div className="nm-grid-2" style={grid}>
                {g.cards.map((c) => (
                  <Shot
                    key={c.file}
                    src={`/images/design/${system}/${c.file}`}
                    alt={c.name}
                    id={`${system}-${c.file.replace(/\.webp$/, "")}`}
                    caption={
                      <>
                        <span style={capName}>{c.name}</span>
                        {c.subtitle ? ` · ${c.subtitle}` : ""}
                      </>
                    }
                  />
                ))}
              </div>
            </div>
          ))}
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
