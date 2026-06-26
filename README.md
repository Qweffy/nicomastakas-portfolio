# nicomastakas.com

Personal portfolio of **Nico Mastakas** (Nicolás Mastakas), Senior Product Engineer building AI-native products end-to-end.

Notable: a from-scratch, first-party, cookieless analytics system (own collector → Neon Postgres → a private dashboard), built without any third-party tracker.

## Stack

- **Next.js 16** (App Router, Turbopack, 100% SSG)
- **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first, dark-only design system)
- **Velite** — type-safe MDX content collections for case studies
- **Shiki** (via rehype-pretty-code) — build-time code highlighting
- Deployed on **Vercel**

## Development

```bash
pnpm install
pnpm dev          # dev server at http://localhost:3000
pnpm typecheck    # velite build + tsc --noEmit
pnpm lint         # eslint
pnpm format       # prettier --write .
pnpm build        # production build
```

## Structure

```
src/
  app/            # routes (App Router)
  components/     # UI components (named exports)
  lib/            # site config + content helpers
content/
  work/           # case studies (*.mdx, typed via Velite)
```

## Links

- Live: https://nicomastakas.com
- GitHub: https://github.com/Qweffy
