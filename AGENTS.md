<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# nicomastakas-portfolio

Personal portfolio. **Next.js 16 App Router, TypeScript, Tailwind v4, MDX case studies (Velite), 100% SSG, deployed on Vercel.** The repo is itself a portfolio piece — code quality is on display.

> Personal global rules in `~/.claude/CLAUDE.md` already apply (Spanish for conversation, Conventional Commits, no `any`, named exports, no `console.log`, early returns). This file only adds project-specific deltas — don't repeat the globals.

## Commands

```bash
pnpm dev          # dev server (Turbopack)
pnpm build        # production build (runs Velite first via next.config hook)
pnpm typecheck    # velite build + tsc --noEmit
pnpm lint         # eslint  (NOTE: `next lint` was REMOVED in Next 16 — never use it)
pnpm format       # prettier --write .
pnpm velite       # regenerate the .velite content layer
```

## Stack specifics (non-obvious — these prevent real mistakes)

- **Tailwind v4 is CSS-first.** Theme tokens live in `@theme` in `src/app/globals.css`. There is **NO `tailwind.config.js` — do not create one.**
- **Dark only.** No light-mode variants, no theme toggle. The only allowed colors are the tokens: `background`, `surface`, `border`, `foreground`, `muted`, `accent` (utilities: `bg-background`, `text-foreground`, `text-muted`, `border-border`, `text-accent`…). One accent. Don't introduce new colors.
- **Content collections via Velite.** Case studies are MDX in `content/work/*.mdx`, typed by `velite.config.ts`, imported from `#site/content` (helpers in `src/lib/content.ts`). After editing `velite.config.ts` or content, run `pnpm velite`. `.velite/` is generated and gitignored.
- **Server Components by default.** Add `'use client'` only for state/handlers/effects/browser APIs, as low in the tree as possible.

## Workflow

- After changes, run in order: **`pnpm typecheck` → `pnpm lint` → `pnpm build`.**
- **Trunk-based: commit straight to `main`** (solo repo, no PR review). Conventional Commits, small and focused. Feature branches are optional — use one only when you want a preview deploy before promoting.
- **Deploy is automatic — never run `vercel deploy` by hand.** The Vercel project (`nicomastakas-portfolio`) is connected to `Qweffy/nicomastakas-portfolio` with production branch `main`: **push to `main` → Vercel builds & deploys to production** (the live `nicomastakas.com`); any other branch → a preview URL. So shipping = `git push origin main`. (CLI token deploys are redundant duplicates — don't.)
- **`*_BRIEF.md` are internal strategy docs — gitignored. Never commit them and never make this repo public with them in history.**
- Secrets: only in `.env.local` or the Vercel dashboard. `.env.example` documents the keys.
