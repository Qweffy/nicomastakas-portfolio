import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { defineCollection, defineConfig, s } from "velite";

// Multi-locale case studies: one collection over per-locale folders
// (content/work/<locale>/<slug>.mdx). The transform derives locale + a shared
// slug from the file path, so the same slug exists across locales.
const work = defineCollection({
  name: "Work",
  pattern: "work/**/*.mdx",
  schema: s
    .object({
      title: s.string(),
      summary: s.string().max(300),
      role: s.string(),
      company: s.string(),
      badge: s.string().optional(),
      stack: s.array(s.string()),
      date: s.isodate(),
      draft: s.boolean().default(false),
      metadata: s.metadata(),
      excerpt: s.excerpt(),
      content: s.mdx(),
      path: s.path(),
    })
    .transform((data) => {
      // path === "work/<locale>/<slug>"
      const segments = data.path.split("/");
      const locale = segments[1] ?? "en";
      const slug = segments.slice(2).join("/");
      return { ...data, locale, slug, url: `/work/${slug}` };
    }),
});

export default defineConfig({
  root: "content",
  collections: { work },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, { theme: "github-dark-default", keepBackground: false }],
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },
});
