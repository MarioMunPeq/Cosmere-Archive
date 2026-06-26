# Contributing

## Prerequisites

- Node.js >= 22
- pnpm (enable via `corepack enable && corepack prepare pnpm@latest --activate`)

## Setup

```bash
git clone <repo-url>
cd cosmere-archive
pnpm install
pnpm dev
```

## Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `pnpm dev`        | Start dev server at localhost:5173  |
| `pnpm build`      | TypeScript check + production build |
| `pnpm test`       | Run vitest                          |
| `pnpm test:watch` | Run tests in watch mode             |
| `pnpm lint`       | ESLint check                        |
| `pnpm preview`    | Preview production build            |

## Guidelines

- All visible content must be in **English** (canonical Cosmere terminology).
- TypeScript strict mode is enabled — no `any` without explicit `eslint-disable`.
- Use `import type` for type-only imports (`verbatimModuleSyntax`).
- SVG coordinates use the same 900×600 viewBox as the map.
- CSS animations go in `src/index.css` — no inline animation styles.
