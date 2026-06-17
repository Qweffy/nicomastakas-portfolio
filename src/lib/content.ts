import { caseStudies } from "#site/content";

export type CaseStudy = (typeof caseStudies)[number];

/** Published case studies, newest first. */
export function getCaseStudies(): CaseStudy[] {
  return caseStudies.filter((study) => !study.draft).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}
