export const siteConfig = {
  name: "Nico Mastakas",
  title: "Nico Mastakas — AI-native Product Engineer",
  description:
    "Senior product engineer building AI-native products end-to-end. Case studies in LLM features, RAG, and full-stack TypeScript.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nicomastakas.com",
  links: {
    github: "https://github.com/Qweffy",
    linkedin: "https://www.linkedin.com/in/nicomastakas",
    email: "nicolasmastakas@gmail.com",
  },
} as const;
