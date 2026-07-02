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

## Anchored Summary

### Goal

Redesign the Books page (cosmic/cyan aesthetic, cross-ref links), improve all synopses and character descriptions to Coppermind quality.

### Constraints & Preferences

- Locations: Keep Planets + Shards tabs, same pattern as Characters (search + filter pills + detail drawer), force graph toggle, BackToMapButton, deep space/cosmic color scheme
- Timeline: Improve existing horizontal layout (taller, better spacing), eras as expandible colored blocks, dots improved with glow + pulse + tooltip + card overlay, cosmic/cyan colors, elegant animations (staggered, glow, fade, slide-up), maintain max-5 sagas forks, stay inside page layout (no full-screen), no extra visualizations (only timeline)
- Books: flat card grid, saga pills, star field, cross-references to characters/planets/magic, `import.meta.env.BASE_URL` prefix for cover images
- Characters.json: only generated file that may be edited directly; descriptions should be Coppermind-style (wiki, lore-rich)

### Progress

#### Done

- Deleted `GlossaryPage.tsx` and `src/types/glossary.ts` / `src/data/static/glossary.ts`; route `/glossary` redirects to `/magic`
- Fixed `MagicSystemsPage` groupedByPlanet memo dependency and "Appears in" test regex
- Updated all references after glossary removal (App.tsx, Layout.tsx, SideDrawer.tsx, Breadcrumbs.tsx, CommandPalette.tsx, LandingPage.tsx, Skeleton.tsx, components/ui/index.ts, useSearch.ts, CharacterDetailModal.tsx, static-data.ts, MagicSystemsPage test)
- Rewrote `CharacterRelationships.tsx` (viewBox 900×540, SVG glow filters, relationship labels on edges, transition classes)
- Rewrote `RelationshipsTabContent.tsx`: horizontal scrollable character chips with avatar‑initial + count badges, planet filter pills, default Hoid selection, radial graph as centerpiece, compact info bar with clickable relationship links
- Added `Element.prototype.scrollIntoView` polyfill to `src/test/setup.ts`
- Updated `CharactersPage` relationship tests for Hoid preselected, Kelsier/Vin in chip + SVG + info bar
- Created `PlanetForceGraph.tsx` — D3 force-directed graph with connectedPlanets + worldhopper edges, pan/zoom
- Created `PlanetDetailPanel.tsx` — slide-in detail panel with planets, shards, sagas, investiture, characters, worldhoppers, connected planets (clickable)
- Created `PlanetsTabContent.tsx` — cosmic/awwwards redesign with star field, staggered cards, gradient cards, Saga filter pills, Grid/Network toggle, detail panel overlay, cosmic glow effects
- Created `ShardsTabContent.tsx` — cosmic/awwwards redesign with star field, staggered cards, gradient cards, detail panel overlay
- Rewrote `LocationsPage.tsx` — tab switcher with gradient tab bar, subtle star background
- Rewrote `PlanetDetailPanel.tsx` — cosmic gradient header, `animate-float` glow dot, better info hierarchy
- Enhanced `PlanetForceGraph.tsx` — orbiting particles, animated edges, `hashSeed()` deterministic positions (fixes ESLint react-hooks/purity Math.random error), node hover/selected glow
- Added `animate-twinkle-slow`, `animate-glow-pulse`, `animate-float` keyframes to `index.css`
- Fixed `LocationsPage.test.tsx` `shows saga names for planets` test (`getByText` → `getAllByText`)
- Fixed overflow bug on Locations/Shards tabs: removed extra flex wrappers, added `min-h-0` to `mx-auto` div, `h-full` to grid container, `shrink-0` to non-scrollable elements
- All 251 tests pass, `tsc -b` clean, `pnpm lint` clean, ESLint clean (can commit)

#### Done (this session: Books + synopses)

- Improved `BookCover.tsx` — `lg` size (160×240), gradient fills, star dots, `onError` SVG fallback with `import.meta.env.BASE_URL` prefix
- Rewrote `BooksPage.tsx` — flat card grid, star field, saga filter pills, stagger animation, cosmic hover effects, no page chrome
- Created `StandaloneBooksPage.tsx` — gradient title, BackToMapButton, nebula blur
- Rewrote `BookPage.tsx` — planets section (PLANETS filtered by book.id), magic systems section (MAGIC_SYSTEMS filtered by book.id), cosmic gradient cards, hover glow
- Updated `public/images/covers/` with cover paths in `books.ts`
- Updated `App.tsx` — `/books` route uses StandaloneBooksPage
- Rewrote all 27 book synopses in `books.ts` — Coppermind-style, 4–6 sentences each, lore-rich, covering setting/protagonist/conflict/significance
- Rewrote all 93 character descriptions in `characters.json` — Coppermind-style, 2–4 sentences each, covering origin/role/abilities/significance
- Added cross-reference URL params: CharactersPage reads `character` param to auto-open detail modal; PlanetsTabContent reads `planet` param to auto-select planet and open PlanetDetailPanel (matching MagicSystemsPage `system` param pattern)
- Updated BooksPage.test.tsx, BookPage.test.tsx, created StandaloneBooksPage.test.tsx
- All 257 tests pass, `tsc -b` clean, `pnpm lint` clean, `pnpm build` clean

#### Blocked

- (none)

### Key Decisions

- Remove glossary entirely rather than keep as a tab
- Character chips use avatar‑initial + planet‑color dot in horizontal scrollable row (solves "long scroll" complaint)
- Hoid preselected because he has the most connections (8) and is the most iconic Cosmere character
- Relationship labels displayed both on edge midpoints in SVG and as clickable pills in bottom info bar
- Detail panel uses right-side slide-in overlay (`w-96`) matching MagicSystemsPage panel pattern
- Shards tab reuses existing shard data derivation logic (parses `planet.shard` field)
- Timeline: keep horizontal layout (made taller: 100px main line, 64px fork spacing), eras as clickable colored rect bands + separate era buttons bar, dashed straight fork connections, SVG glow filters + CSS dot-enter for staggered entrance, cosmic/cyan theme matching Locations
- Era info shown as inline collapsible bar below eras row (name, year range, event count, description)
- Active dots: just stronger glow + cyan stroke, no breathing ring (removed in v2 for cleanliness)
- SVG filters need `x/y/width/height` bounds to avoid square clipping on glow
- Books page uses flat card grid (not grouped by saga sections), renders content-only and wrapped by StandaloneBooksPage for page chrome
- Cover images stored as `.webp` in `public/images/covers/` with relative paths in `books.ts`, BookCover prepends `import.meta.env.BASE_URL`
- Image failure falls back to SVG cover (onError handler), not broken img tag
- Cross-reference URL params follow MagicSystemsPage `system` param pattern: CharactersPage reads `character`, PlanetsTabContent reads `planet`

### Next Steps

1. (all books + characters tasks completed)

### Critical Context

- `animate-fade-in-up` is the only fade-in class available (defined in `index.css`), not `animate-fade-in`
- `tailwind-scrollbar` plugin is not installed; global scrollbar styles in `index.css` handle overflow scrolling
- `planet.shard` field may contain multiple shards separated by `&` or `,`
- `MAGIC_SYSTEMS` is NOT re-exported from `@/data/static/index.ts` — import directly from `@/data/static/magic-systems`
- `WORLDHOPPER_MOVEMENTS` is from `@/data/static/timeline`, NOT re-exported from `@/data/static/index.ts`
- `Math.random()` inside useMemo causes ESLint react-hooks/purity error — use `hashSeed()` instead
- Timeline data: 120+ events across 11 cosmic eras, spans `timeline-layout.ts` (yearToX, MAIN_LINE_Y=100, FORK_START_Y=164, FORK_SPACING=64, TOTAL_WIDTH), era colors from `eras.ts`
- `MAX_FORK_SAGAS = 5` constant from `@/constants`
- Timeline uses both SVG `<filter>` glow (`#glow`, `#glow-heavy`) for hover/select states and CSS classes (`animate-dot-enter`, `animate-era-glow`) for entrance/pulse animations
- SVG filters need `x="-50%" y="-50%" width="200%" height="200%"` to prevent square clipping on glow effects
- Book descriptions are in `books.ts` (single-quoted strings, must escape `'s` with `\'` inside single quotes)
- Cover paths in `books.ts` are relative (`images/covers/{id}.webp`), BookCover prepends `import.meta.env.BASE_URL`
- Characters in `characters.json` use Coppermind-style descriptions (2-4 sentences, origin/role/abilities/significance)
- ALL_CHARACTERS has `requiredBooks`, PLANETS has `books`, MAGIC_SYSTEMS has `bookIds` — all arrays of book IDs for cross-filtering

### Relevant Files

- `src/pages/TimelinePage.tsx`: main timeline page with star field, eras bar, era detail panel, saga selector, SVG container
- `src/pages/StandaloneTimelinePage.tsx`: wrapper with gradient title, back button
- `src/components/timeline/Timeline.tsx`: SVG timeline with era bands, glow dots, curved fork connections, staggered entrance
- `src/components/timeline/TooltipOverlay.tsx`: cosmic tooltip (fade-in-up, gradient, cyan accents)
- `src/components/timeline/CardOverlay.tsx`: cosmic detail card (slide-up, gradient header, cyan/purple)
- `src/utils/timeline-layout.ts`: year-to-X conversion, SVG constants (MAIN_LINE_Y=100, FORK_START_Y=164, FORK_SPACING=64)
- `src/data/static/timeline/events.ts`: all 120+ events (1535 lines)
- `src/data/static/timeline/eras.ts`: 11 cosmic eras with colors
- `src/data/static/timeline/index.ts`: exports ERAS, TIMELINE_EVENTS, CHARACTER_SPANS, WORLDHOPPER_MOVEMENTS, WORLDHOPPERS
- `src/index.css`: contains `animate-dot-enter`, `animate-dot-pulse`, `animate-era-glow`, `animate-fade-in-up`, `animate-slide-up`, `animate-slide-in-right`, `animate-twinkle-slow`, `animate-glow-pulse`, `animate-float`, and other cosmic keyframes
- `src/test/StandaloneTimelinePage.test.tsx`: 5 tests (heading, description, back link, saga buttons, event SVGs)
- `src/components/detail/PlanetForceGraph.tsx`: reference for `hashSeed()` pattern
- `src/pages/BooksPage.tsx`: cosmic card grid for books (content only, wrapped by StandaloneBooksPage)
- `src/pages/StandaloneBooksPage.tsx`: wrapper with gradient title, BackToMapButton
- `src/pages/BookPage.tsx`: detail page with planets, characters, magic system cross-references
- `src/components/common/BookCover.tsx`: SVG fallback, gradient fills, star dots, `import.meta.env.BASE_URL` prefix
- `src/data/static/books.ts`: all 27 books with Coppermind-style synopses and relative cover paths
- `src/data/generated/characters.json`: all 93 characters with Coppermind-style descriptions
- `public/images/covers/`: `.webp` cover image files
