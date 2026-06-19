import manifest from "./designManifest.json";

export interface DSCard {
  file: string;
  name: string;
  subtitle: string;
  group: string;
}
export type DSManifest = Record<string, { overview: string; cards: DSCard[] }>;

export const designManifest = manifest as DSManifest;

export interface DesignSystem {
  slug: string;
  live: string;
  liveExternal: boolean;
  caseStudy: string;
  tags: readonly string[];
}

/** Design systems with a clean, structured Claude Design handoff. Order = display order. */
export const DESIGN_SYSTEMS: readonly DesignSystem[] = [
  {
    slug: "hiring-radar",
    live: "https://hiring-radar.nicomastakas.com",
    liveExternal: true,
    caseStudy: "/work/hiring-radar",
    tags: ["Space Grotesk", "Inter", "JetBrains Mono"],
  },
  {
    slug: "settle",
    live: "https://settle.nicomastakas.com",
    liveExternal: true,
    caseStudy: "/work/settle",
    tags: ["light theme", "money-dense", "lucide"],
  },
  {
    slug: "portfolio",
    live: "/",
    liveExternal: false,
    caseStudy: "/about",
    tags: ["Geist", "dark-only", "one accent"],
  },
];

export const designSystemSlugs = DESIGN_SYSTEMS.map((s) => s.slug);
export const getDesignSystem = (slug: string) => DESIGN_SYSTEMS.find((s) => s.slug === slug);

/** Manifest cards grouped by their `group`, preserving first-seen order. */
export function groupedCards(slug: string): { group: string; cards: DSCard[] }[] {
  const cards = designManifest[slug]?.cards ?? [];
  const order: string[] = [];
  const byGroup = new Map<string, DSCard[]>();
  for (const c of cards) {
    if (!byGroup.has(c.group)) {
      byGroup.set(c.group, []);
      order.push(c.group);
    }
    byGroup.get(c.group)!.push(c);
  }
  return order.map((group) => ({ group, cards: byGroup.get(group)! }));
}
