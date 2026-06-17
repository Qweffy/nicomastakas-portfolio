import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { defineCollection, defineConfig, s } from "velite";

const caseStudies = defineCollection({
  name: "CaseStudy",
  pattern: "work/**/*.mdx",
  schema: s
    .object({
      title: s.string(),
      summary: s.string().max(300),
      role: s.string(),
      stack: s.array(s.string()),
      date: s.isodate(),
      draft: s.boolean().default(false),
      metadata: s.metadata(), // reading-time, word count
      excerpt: s.excerpt(),
      content: s.mdx(),
      path: s.path(),
    })
    .transform((data) => {
      const slug = data.path.replace(/^work\//, "");
      return { ...data, slug, url: `/work/${slug}` };
    }),
});

export default defineConfig({
  root: "content",
  collections: { caseStudies },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, { theme: "github-dark-default" }],
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },
});
