# Cosmere Archive — Agent Guide

## Project overview

- React 19 + Vite 8 + TypeScript 6 + Tailwind CSS v4
- HashRouter (React Router v6) with lazy-loaded routes
- PWA via `vite-plugin-pwa` with Workbox
- Tests: Vitest (unit) + Playwright (e2e)
- Package manager: pnpm

## Key conventions

- **Imports**: Use `@/` alias (e.g. `import { X } from '@/types'`)
- **Styling**: Tailwind utility classes only — no CSS modules or styled-components
- **Types**: Co-located in `src/types/` with one file per domain
- **Pages**: Every route page in `src/pages/`, uses `useSEOMeta()` for head tags
- **Components**: Shared UI in `src/components/ui/`, domain-specific in `src/components/detail/` or `src/components/map/`
- **Data**: Static data in `src/data/static/`, generated JSON in `src/data/generated/`
- **State**: Hooks + `useLocalStorage` for persistence; no global state library
- **Routing**: HashRouter; all routes defined in `src/App.tsx`
- **Build**: `pnpm build` — runs `tsc -b` then `vite build`
- **Test**: `pnpm test` — runs `vitest run` (must always pass)

## Important rules

- NEVER edit `src/data/generated/` files directly except `characters.json`
- ALL tests must pass before completing any task
- Run `npx tsc -b` after every batch of changes
- The `useDocumentTitle` hook was replaced by `useSEOMeta` — use that instead

## Available scripts

- `pnpm dev` — local dev server
- `pnpm build` — production build with typecheck
- `pnpm test` — run unit tests
- `pnpm lint` — ESLint check
- `pnpm typecheck` — TypeScript check only (no build)
- `pnpm analyze` — build + bundle visualizer
