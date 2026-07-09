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

Redesign the Books page (cosmic/cyan aesthetic, cross-ref links), improve all synopses and character descriptions to Coppermind quality, redesign Stats page with 10 cosmic-themed sections.

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

##### Done (this session: Highstorm V4 — canvas-based fluid storm)

- **Complete rewrite from scratch**: deleted `HighstormLayer.tsx` and all SVG-based highstorm code (3 iterations over previous sessions: orbital ring, atmospheric belt, compact storm entity). Replaced with canvas-based dynamic fluid storm system
- **New architecture**: Two `<foreignObject>` canvas overlays inside the SVG — `HighstormBackCanvas` (behind planet, larger extent for limb glow) and `HighstormFrontCanvas` (on planet disk, clipped circular). Planet SVG naturally occludes the back canvas. No masks, no filters
- **Fluid storm**: Per-pixel simplex noise (4-octave FBM) sampled at spherical coordinates on the planet surface. Storm density follows a Gaussian envelope centered at a moving longitude (band wraps around equator). Noise advection + evolution creates continuous organic flow
- **3D wrap**: Canvas coordinates mapped to sphere (u, v → longitude, latitude via atan2 + asin). Storm center rotates at `STORM_SPEED = 0.03 rad/s` (~209s per revolution). Noise sampled in 3D: longitude drift + latitude drift + temporal evolution
- **Back canvas glow**: Renders annular region (0.92r to 1.25r) with same noise-based storm density at low opacity (max 0.12). Creates subtle limb illumination when storm passes behind
- **Front canvas storm**: Cold white/blue palette (R 200-255, G 205-255, B 215-255). Density-driven opacity (cap at 0.6). FBM noise creates wisps, filaments, dense patches
- **Stormlight particles**: 8 particles advected along storm flow, rendered as cyan glow circles with pulsing brightness
- **Lightning**: Occasional (<200ms) polyline flash, 5-15s interval, simple white stroke
- **Performance**: Canvas at native resolution (~r² pixels, typically 10-40K). Single `putImageData` per frame. Test suite 8.52s
- **Files created**: `src/utils/simplex-noise.ts` (pure TS 3D simplex noise), `src/components/map/HighstormFluid.tsx` (canvas storm with back/front layers)
- **Files deleted**: `src/components/map/HighstormLayer.tsx`
- **Files modified**: `PlanetRenderer.tsx` (replaced SVG highstorm imports), `index.css` (removed all `hs-*` CSS keyframes/classes), `AGENTS.md`
- All 265 tests pass, `tsc -b` clean, `pnpm lint` clean

##### Done (this session: Second-pass dead code audit)

- **Three parallel audits** (CSS, types/interfaces, imports/dead-code) across the entire codebase
- **CSS removed**: `@utility flex-between`, `@utility text-muted`, `@keyframes route-pulse`, `@keyframes storm-spin`, `--font-size-scale` + `body { font-size: calc(100% * ...) }`, dead `@media print` selectors (`.back-to-top`, `.theme-toggle`, `.font-size-controls`, `.command-palette-trigger`, `#search-bar`, `.breadcrumbs`)
- **Types simplified**: deleted `HighstormConfig` interface (all 7 fields unused) + removed `highstorm`, `speed`, `extendPx` from `ThematicConfig`; removed `rotationSpeed` from `AnimationConfig` (all unused); removed `magicSystem` from `Planet` type; pruned `RelationshipType` (`partner`, `friend`); pruned `SearchResult['type']` (`glossary`); pruned `AtmosphereConfig.animation` (`rotate`); pruned `HaloConfig.animation` (`steady`); pruned `ThematicConfig.type` (`storm-spiral`)
- **Data files cleaned**: all `magicSystem` fields removed from `planets.ts` (11 planets); all `rotationSpeed` / thematic `speed` / `extendPx` / `highstorm` removed from `planet-visuals.ts`
- **PlanetRenderer.tsx**: removed `storm-spiral` case (dead branch, no planet uses it)
- **Constants cleaned**: removed 8 unreferenced exports from `constants.ts` (`ZOOM_STEP`, `FLY_MIN_MS`, `FLY_MAX_MS`, `FLY_PULLBACK_FACTOR`, `FLY_OVERSHOOT`, `PANEL_ANIM_MS`, `PANEL_FADE_MS`, `WORLDHOPPER_PAUSE_MS`)
- **Icons cleaned**: removed `PlusIcon` and `MinusIcon` from `icons.tsx` and barrel export
- Confirmed `useCamera.ts` and `useAnimationEngine.ts` already deleted in first pass; `void pubMin; void pubMax;` already removed
- `tsc -b` clean, 220/220 tests pass

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
- Stats page uses scroll-triggered section reveals (IntersectionObserver), pure SVG for all charts, `AnimatedCounter` for number animations, star field background matching rest of site
- Sections order: Hero → Stat Cards → Books by Saga → Characters by Planet → Word Count → Publication Timeline → Shards Grid → Magic Categories → Event Density → Heralds
- BookShelf uses spine images when available (`book.spine` field), falls back to CSS gradient + initials for missing images
- Word count badge removed from spine for realism; shown as tooltip on hover
- Wood texture from Texturize.app: free, seamless, dark walnut, no attribution required
- Click animation (300ms delay before navigate) provides tactile "extracting" feedback
- Books per shelf determined by ResizeObserver thresholds (3/4/5/6/7 based on container width)

#### Fixed (StatsPage readability + layout, round 2)

- **Root cause**: inner items had `animate-fade-in-up opacity-0` with CSS overlay, but parent `SectionWrap` started at `opacity: 0` — children never became visible even after their animation completed. Replaced with single `SectionWrap` that uses CSS `transition-all` (translate + opacity) triggered by IntersectionObserver — parent fades in, all children visible immediately
- **All text sizes increased significantly**: HTML uses `text-base`/`text-lg` minimum, SVG `font-size="11/14/20"`, stat card values `text-3xl`, bar heights `h-4` (16px), heralds circles `h-14 w-14` (56px)
- **Section dividers**: `Divider` component with `h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent` between every section
- **Removed `StarField`** from StatsPage for simplicity (was not needed for data viz page)
- All 263 tests pass, `tsc -b` clean, `pnpm lint` clean

##### Done (this session: Premium book UX, Phase 4 — paper grain + dust + Phase 1A — Direct presentation + Phase 2C — Corner-fold navigation + Phase 3A — 3D page curl)

- **Phase 1A — Direct presentation**: Replaced the 4-step extract→rotate→center→open sequence with a single `spawning` state. Book materializes in center view with `easeOutBack` scale-up animation and a radial glow sprite (grows to 5×, fades out over 1.2s). Camera moved from `[0.3, 0.9, 3.0]` to `[0, 0.15, 3.0]` (centric, no tilt). Closing now fades the book out smoothly (`easeOutQuad`). `BookAnimator.ts` simplified to 6 states: `idle → spawning → opened → turningPage → closing → finished`. Removed `extracting/rotating/centering/opening/returning` states and all shelf-position/`spineRect` dependency code. Glow sprite uses `CanvasTexture` with radial gradient (white→cyan→transparent).

- **Phase 2C — Corner-fold navigation**: Removed floating navigation bar (prev/next/close buttons at viewport bottom). Replaced with invisible click zones: left 45% = prev, right 45% = next, middle 10% passes through to Canvas's `onPointerMissed` for close backdrop-click. Added `CornerFold.tsx` (SVG component showing a folded page corner with gradient + shadow, mirrored for left side). Keyboard navigation: ArrowLeft/ArrowRight for page turns, Escape to close. Uses `useRef` pattern for stale-free keyboard handler.

- **Phase 3A — 3D page curl**: Custom `BufferGeometry` with 36×4 subdivisions updated per-frame during `turningPage`. Vertex deformation creates a travelling wave from right to left — `sin(curlU * PI)` lifts the page while `compress` slides it inward, simulating paper curl. Shadow plane (`MeshStandardMaterial` at 0→18% opacity) beneath the curl adds depth. Right page surface hidden via `visible={state !== 'turningPage'}`. Geometry cloned from `PlaneGeometry`; vertices mutated directly via `Float32BufferAttribute`.

- **First page redesigned**: Archive entry layout with hero title, subtitle, unique archive description per book (from `book-archive-entries.ts`), metadata grid (volume number, classification, archive ID, date recorded). Drop cap overlap fix: lines beside drop cap stay indented until below the drop cap
- **Archive data**: `src/data/static/book-archive-entries.ts` with archive descriptions for all 22 books (volumeNumber, classification, archiveDescription, dateRecorded)
- **`archive-header` page type**: Added to `page-texture.ts` (FONT_SMALL, centered, muted, uppercase). Removed archive header from first page per user request
- **Page-turn tilt animation**: `p.groupRotX = Math.sin(t * Math.PI) * 0.025` during `turningPage` state — subtle tilt on page turn
- **Navigation controls redesigned** (superseded by Phase 2C): SVG chevrons in circular buttons, hover glow effects, dark pill shape with blur + border — premium feel
- **Html overlay for text selection**: `PageHtmlOverlay` component in `BookModel3D.tsx` renders page text as `color: transparent` via `@react-three/drei` `<Html>`, positioned at each page surface — allows selectable/copyable text
- **Paper grain texture**: `createPageTexture()` now draws a canvas noise pattern (composite sinusoidal, 256×256 tile) over the paper background in `page-texture.ts`. Subtle grain at 18-28% opacity
- **Dust motes**: 30 Three.js `Points` in `BookScene.tsx`, animated with sinusoidal drift in `useFrame` while `state === 'opened'`. Particles colored `#d4c8b0` at 15% opacity, `sizeAttenuation` on, confined to bounds with bounce-back
- **Page edge variation**: `BookModel3D.tsx` uses two edge materials (`pageEdgeMat`, `pageEdgeMat2`) with slightly different tints — bottom edges use the lighter variant
- All 220 tests pass, `tsc -b` clean

### Next Steps

1. **Phase 3A refinements**: Adjust curl radius, add page-turn direction support (left→right), fine-tune timing/easing
2. **General polish**: Verify production build, check all book interactions work end-to-end

#### Hybrid R3F book architecture (this round)

- **Complete rewrite**: Replaced CSS-only book viewer (BookViewer.tsx, BookModel.tsx, PageTurn.tsx, BookPaper.tsx, BookAnimation.ts) with hybrid HTML + React Three Fiber (R3F) architecture. Opened book is a physically rendered 3D hardcover in Three.js; text content remains HTML overlay for perfect rendering/accessibility.
- **New deps**: `@react-three/fiber 9.6.1`, `@react-three/drei 10.7.7`, `three 0.185.1`, `@types/three 0.185.0`
- **Deterministic state machine**: `BookAnimator.ts` — 10 states (`idle → extracting → rotating → centering → opening → opened → turningPage → closing → returning → finished`), pure-function `transition(state, event)`, all timing in `ANIM_TIMING` constants. Event-driven (no chained useEffects).
- **3D book model**: `BookModel3D.tsx` — back cover box, spine box, left/right page stack boxes (depth adjusts for turned pages), left/right page surfaces, front cover group hinged at left edge. Reads `AnimProgress` ref for per-frame cover rotation during opening/closing.
- **Scene orchestration**: `BookScene.tsx` — camera `fov 35, position (0, 0.3, 3)`, 3-point lighting (warm key, cool fill, rim backlight), `useFrame` driving extraction/rotation/centering/opening/closing/returning via shared `AnimProgress` ref.
- **HTML overlay**: `BookOverlay.tsx` — absolute div centered over 3D pages with left-page + spine-gap + right-page layout + BookControls navigation at bottom.
- **Canvas wrapper**: `BookCanvas.tsx` — R3F `<Canvas>` with `useReducer`-style dispatch, backdrop blur/dim during reading, page-content sync from `generatePages()`, resize listener. `pointerEvents: none` on Canvas, `auto` on overlay. Handles `onPointerMissed` for close.
- **Typography overhaul**: `BookContentRenderer.tsx` — body text `clamp(15px, 1.05vw, 19px)`, headings `clamp(28px, 2.6vw, 44px)`, drop cap `clamp(48px, 4vw, 72px)` with float, running header + thin rule, decorative divider (line + dot + line), page number footer.
- **Dynamic pagination**: `BookContent.ts` — `chunk()` splitter (6 characters/page, 4 magic systems/page, connections grouped), new `dropcap-text` page type for synopsis. No content truncation — generates additional spreads as needed.
- **Old files deleted**: `BookViewer.tsx`, `BookModel.tsx`, `PageTurn.tsx`, `BookPaper.tsx`, `BookAnimation.ts`
- **New files created**: `BookAnimator.ts`, `BookModel3D.tsx`, `BookScene.tsx`, `BookOverlay.tsx`, `BookCanvas.tsx`
- All 220 tests pass, `npx tsc -b` clean, `pnpm lint` clean

#### Word Count redesign (this round)

- **What changed**: Step 5 of StatsPage ("Word Count by Book") was redesigned from a simple horizontal bar chart (gradient bars sorted by size) into a full virtual bookshelf (`BookShelf` component)
- **BookShelf component**: image-based spines (`book.spine` → `<img>`), CSS gradient fallback (saga color + initials + decorative bands), wood texture background (seamless dark walnut, CSS `background-image: repeat`), proportional widths (√(wordCount) normalized to 32–64px), saga filter pills (multi-select) + sort toggle (Desc/Asc), hover lift + glow, click extract animation (slide+rotate → navigate)
- **Data**: added `spine: 'images/spines/{id}.webp'` to all 22 books in `books.ts`, added optional `spine` field to `Book` type, downloaded `public/images/wood-texture.png`
- **Old grid removed**: `WordCountGrid` function (cover gallery with word count badges) was deleted from StatsPage; replaced with `<BookShelf books={booksByWordCount} />`

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

- `src/components/library/BookAnimator.ts`: deterministic state machine (6 states, pure-function transitions, timing constants in ANIM_TIMING)
- `src/components/library/BookModel3D.tsx`: 3D book mesh (back cover, spine, left/right page stacks, page surfaces, front cover hinged at left edge, page edge material variants)
- `src/components/library/BookScene.tsx`: R3F scene with camera fov 35 at (0,0.15,3), 3-point lighting, useFrame animation loop, glow sprite, dust particles, turned page geo
- `src/components/library/BookCanvas.tsx`: R3F Canvas wrapper, dispatch-based state machine, backdrop blur/dim, invisible click zones, CornerFold, keyboard navigation
- `src/components/library/BookContent.ts`: dynamic pagination with chunk() splitter (6 chars/page, 4 magic/page), dropcap-text type
- `src/components/library/BookContentRenderer.tsx`: typography 15-44px, drop caps, running header, decorative divider, page number
- `src/components/library/CornerFold.tsx`: SVG corner-fold indicator (gradient + shadow, mirrorable for left/right sides)
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
- `src/data/static/books.ts`: all 27 books with Coppermind-style synopses, relative cover paths, and word counts
- `src/data/generated/characters.json`: all 93 characters with Coppermind-style descriptions
- `public/images/covers/`: `.webp` cover image files
- `src/pages/StatsPage.tsx`: redesigned Stats page with 10 cosmic-themed sections, SVG visualizations, scroll-triggered animations
- `src/components/stats/BookShelf.tsx`: virtual bookshelf component with spine images, wood texture, tooltip, filter/sort, click animation
- `src/types/book.ts`: added optional `spine: string` field
- `public/images/wood-texture.png`: dark walnut wood texture (seamless, 2048×2048, Texturize.app)
- `public/images/spines/`: directory for spine images (placeholder paths exist; actual images needed)
- `src/test/StatsPage.test.tsx`: 11 tests for all sections + back link
