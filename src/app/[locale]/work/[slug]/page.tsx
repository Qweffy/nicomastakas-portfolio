import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { Mdx } from "@/components/Mdx";
import { Nav } from "@/components/Nav";
import { Tag } from "@/components/Tag";
import { type Locale } from "@/i18n/routing";
import { allWorkParams, getWork } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return allWorkParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const res = getWork(slug, locale as Locale);
  if (!res) return {};
  return { title: res.study.title, description: res.study.summary };
}

const wrap: CSSProperties = {
  minHeight: "100vh",
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "var(--font-sans)",
};
const article: CSSProperties = {
  maxWidth: "840px",
  margin: "0 auto",
  padding: "var(--space-16) var(--space-8) var(--space-12)",
  boxSizing: "border-box",
};
const companyLine: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
const title: CSSProperties = {
  fontSize: "var(--text-section)",
  lineHeight: "var(--leading-section)",
  fontWeight: "var(--weight-semibold)",
  letterSpacing: "-0.01em",
  margin: "var(--space-4) 0 0",
  color: "var(--text)",
};
const summary: CSSProperties = {
  fontSize: "var(--text-body)",
  lineHeight: "var(--leading-body)",
  color: "var(--text-muted)",
  margin: "var(--space-4) 0 0",
  maxWidth: "var(--measure)",
};
const roleLine: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  marginTop: "var(--space-4)",
};
const tagRow: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-2)",
  margin: "var(--space-6) 0 var(--space-12)",
};
const fallbackNote: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-caption)",
  color: "var(--text-muted)",
  background: "var(--surface)",
  border: "var(--elevation-hairline)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-3) var(--space-4)",
  marginBottom: "var(--space-8)",
};

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const res = getWork(slug, locale as Locale);
  if (!res) notFound();

  const { study, isFallback } = res;
  const t = await getTranslations("work");
  const nav = await getTranslations("nav");
  const footer = await getTranslations("footer");

  const navLinks = [
    { label: nav("work"), href: "/#work" },
    { label: nav("how"), href: "/work/how-i-build-with-ai" },
    { label: nav("design"), href: "/design" },
    { label: nav("about"), href: "/about" },
    { label: nav("contact"), href: `mailto:${siteConfig.email}`, external: true },
  ];

  return (
    <div style={wrap}>
      <Nav links={navLinks} />

      <article className="nm-container nm-reveal" style={article}>
        <div style={companyLine}>{study.company}</div>
        <h1 style={title}>{study.title}</h1>
        <p style={summary}>{study.summary}</p>
        <div style={roleLine}>{study.role}</div>
        <div style={tagRow}>
          {study.stack.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        {isFallback ? <p style={fallbackNote}>{t("notTranslated")}</p> : null}

        <div className="mdx">
          <Mdx code={study.content} />
        </div>
      </article>

      <Footer positioning={footer("positioning")} links={footerLinks()} />
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
