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

Redesign the Books page (cosmic/cyan aesthetic, cross-ref links), improve all synopses and character descriptions to Coppermind quality, redesign Stats page with 10 cosmic-themed sections, redesign Heralds page as immersive Aharietiam experience.

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

- **SHADESMAR — Ocean of Souls (Canvas2D)**: Pure Canvas2D ocean of ~700 living constellation beads. No Three.js. 10 files in `src/components/shadesmar/`.
- **Constellation philosophy**: Each planet is a recognizable constellation. The silhouette is sacred. Beads are anchored to permanent home positions with only tiny idle animation. Interaction adapts around the layout, not the opposite.
- **Three interaction stages**: Stage 1 (Observation) — compact, elegant, almost still. Stage 2 (Focus) — cursor approaches, constellation smoothly expands 160-180% via uniform scaling around cluster center, preserving every relative position. Stage 3 (Inspection) — after 300ms over cluster, full expansion, physics nearly frozen, precise character selection.
- **Soul system**: 8 entity types (neutral/character/herald/radiant/shard/world/magic/event) with distinct colors. 20 planet-based clusters, ~35 souls each. Spatial grid (0.02u cell) for fast queries. Bead sizes: character 8-12px, important 14-20px, herald 18-26px (~30% larger).
- **PhysicsSystem**: Minimal — spring toward rest (`SPRING_K=6.0`), damping (`pow(0.94, dt*60)`), tiny noise (`NOISE_AMP=0.0003`). No cursor attraction. No repulsion. Frozen clusters skip all physics.
- **InteractionModel**: Direct cluster expansion (critically damped spring, uniform scale `1 + amp × factor`), smart hover (best-candidate scoring within `SMART_HOVER_RADIUS=0.08`), planet focus dimming (non-active clusters reduced to 35% opacity), hovered bead freeze (vx/vy=0), neighbor glow/scale ripple.
- **Camera**: Float drift + drag + wheel zoom + fly-to. Frame-rate independent lerp/inertia. Never auto-zooms during interaction.
- **SelectionSystem**: 3-phase click animation (grow → reveal → display), connection lines, spiral particles, dimmed background. Push strength reduced 3×.
- **Visual language**: Near-black ocean (#050508), 80 fog particles, vignette, 3-layer radial gradient souls (larger: 8-26px). Hover label with fade transition. Elegant slow glow/scale feedback — no game-like effects.

- Built Aharietiam v4 environment-only scene (10 components: Sky, Camera, Terrain, Altar, Debris, Atmosphere, Particles, Lighting, Scene) — pure CSS 3D perspective, no images, no blades, no UI
- Added CircleOfBlades — 10 Honorblade objects in a perfect circle, each with 9 CSS layers (Shadow, GroundCrack, ContactShadow, StormlightGlow, BladeImage, Reflection, StormlightSweep, Particles, Hitbox), no `<img>` only, mathematical positioning, Taln placeholder with silhouette only
- All 206 tests pass, `tsc -b` clean, `pnpm lint` clean, `pnpm build` clean (47 entries)

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
- Sections order: Hero → Stat Cards → Books by Saga → Characters by Planet → Word Count → Publication Timeline → Shards Grid → Magic Categories → Event Density → Aharietiam
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

- **Phase 1A — Physical extraction animation**: Replaced the `spawning` state with a full shelf-to-reading extraction. The book starts at its HTML getBoundingClientRect position (via `screenRectToWorld`), then animates through 7 states: `idle → extracting → stabilizing → opened → turningPage → closing → finished`. The `extracting` phase (900ms) uses `easeInOutQuad` with a rotational wobble and radial glow sprite. The `stabilizing` phase (400ms) adds a gentle overshoot settle. The `closing` phase reverses the extraction back to shelf position. Direct Three.js group mutation avoids ESLint `react-hooks/immutability` rule. `screen-to-world.ts` utility converts screen coordinates to 3D world space using camera unproject.

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

1. **Honorblade interactions**: Add click/hover states, camera focus on selected blade
2. **Information Monolith**: Add UI panel showing blade info on click
3. **Visual refinements**: Add Stormlight particles per blade, blade shockwave effects

#### Hybrid R3F book architecture (this round)

- **Complete rewrite**: Replaced CSS-only book viewer (BookViewer.tsx, BookModel.tsx, PageTurn.tsx, BookPaper.tsx, BookAnimation.ts) with hybrid HTML + React Three Fiber (R3F) architecture. Opened book is a physically rendered 3D hardcover in Three.js; text content remains HTML overlay for perfect rendering/accessibility.
- **New deps**: `@react-three/fiber 9.6.1`, `@react-three/drei 10.7.7`, `three 0.185.1`, `@types/three 0.185.0`
- **Deterministic state machine**: `BookAnimator.ts` — 7 states (`idle → extracting → stabilizing → opened → turningPage → closing → finished`), pure-function `transition(state, event)`, all timing in `ANIM_TIMING` constants.
- **3D book model**: `BookModel3D.tsx` — back cover box, spine box, left/right page stack boxes (depth adjusts for turned pages), left/right page surfaces, front cover group hinged at left edge.
- **Scene orchestration**: `BookScene.tsx` — camera `fov 35, position (0, 0.15, 3)`, 3-point lighting, `useFrame` driving extraction/stabilizing/closing via direct Three.js group mutations (`g.position.set`, `g.scale.set`, `g.rotation.set`). `initRef` + `initReadyRef` + `useLayoutEffect` (with `camera.updateProjectionMatrix()`) pattern ensures first 3D frame matches HTML book position even when `useThree().size` is {0,0} on mount. `fittedScale` falls back to `window.innerWidth/innerHeight` when size is 0.
- **Extraction animation**: `easeInOutQuad` (900ms), rotational wobble (`sin(raw * π * 3.5) * 0.008 * (1 - raw)`), glow sprite fade-in/fade-out. Stabilization (400ms): `easeOutQuad` with sine overshoot settle.
- **Closing animation**: reverse of extraction — returns to shelf position (`initRef.current`) with spine rotation, `easeInOutQuad` (800ms).
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

##### Done (this session: 3D Genealogy Scene)

- **Complete rewrite from scratch**: Replaced the two-page manuscript CSS layout (`GenealogyArchive.tsx`) with a full React Three Fiber 3D scene. New architecture: `GenealogyArchiveScene.tsx` (Canvas wrapper), `ArchiveStudy3D.tsx` (desk + parchment meshes + camera animation + lighting + Html overlay), `GenealogyOverlay.tsx` (HTML content positioned via drei `<Html transform>` on the parchment surface).
- **3D desk**: `BoxGeometry` (3.0×0.06×2.2) with procedural wood texture (dark walnut streaks via canvas noise), subtle tilt animation on camera settle.
- **3D parchment**: Two-page `BoxGeometry` (0.7×0.004×0.5 each) with procedural parchment texture (fibre noise, age stains), center fold shadow strip, edge material variant. Pages positioned with a 0.03-unit gutter.
- **Camera animation**: Starts at (0, 1.1, 2.8), moves to (0, 0.55, 1.6) over 2 seconds using `easeOutCubic`. Desk tilts −0.008 rad during final approach for realism.
- **Lighting**: 4-point setup matching BookScene — ambient 0.3 + warm key (2.5,4,3) 0.85 + cool fill (−1.5,2,−1) 0.25 + rim (2.5,0.5,−2.5) 0.15 + fill (0,3,0) 0.1.
- **HTML overlay**: Left page = archival index table (family entries with roman numerals, ink lines, active flourish marker, member count). Right page = family heading + `GenealogyTree` with `CharacterPortrait` annotation fragment. Content same as previous two-page manuscript but rendered inside `<Html transform>`.
- **Files created**: `ArchiveStudy3D.tsx` (3D scene + procedural textures + camera + lighting + overlay), `GenealogyOverlay.tsx` (left/right page content + annotation), `GenealogyArchiveScene.tsx` (Canvas wrapper with state management).
- **Files modified**: `CharactersPage.tsx` (imports `GenealogyArchiveScene` instead of `GenealogyArchive`), `src/components/genealogy/index.ts` (adds `GenealogyArchiveScene` export).
- All 220 tests pass, `tsc -b` clean, `pnpm lint` clean, `pnpm build` clean (49 precached entries).

##### Done (this session: Family Trees complete visual rebuild — R3F archival manuscript)

- **Complete rewrite from scratch**: Replaced the previous two-page CSS layout and the interim R3F desk scene with a focused 3D archival manuscript experience. New architecture follows the same philosophy as BookCanvas/BookScene: `GenealogyCanvas` (Canvas wrapper) → `GenealogyScene` (R3F scene) → `LecternModel3D` + `ParchmentModel3D` + `GenealogyOverlay` (Html transform).
- **No generic 3D room or environment**: Only two objects exist — the wooden study lectern and the open parchment manuscript. Dark void background, no Stormlight effects, no particles.
- **LecternModel3D.tsx**: Dark polished wood (`#4a3020`–`#2d1a0e`) using `wood-pattern.png` texture with `RepeatWrapping`. Slanted top surface (0.22 rad), front lip to hold pages, central support column, base platform.
- **ParchmentModel3D.tsx**: Two-page `BoxGeometry` (0.7×0.003×0.5 each) with procedural canvas textures (fibre noise, age stains, edge vignette, subtle speckling). `DoubleSide` rendering, center fold shadow strip. Pages offset with 0.038-unit gutter.
- **GenealogyOverlay.tsx**: HTML content rendered via drei `<Html transform>` (scale 0.001) positioned on the parchment surface. Left page = manuscript-style archive index (roman numerals, ink flourish on active, thin sepia separators, page number). Right page = family heading + `GenealogyTree` SVG + ink-writing `CharacterAnnotation`.
- **CharacterPortrait.tsx**: Rewrote from circular medallion to rectangular antique portrait frame. Gold gradient outer border (`#c4a04a`–`#907020`), inner band, `feDropShadow`, rectangular clip path for character images, grayscale for deceased.
- **TreeConnections.tsx**: New SVG component replacing `GenealogyConnections`. Three-layer ink stroke (bleed + main + hairline) with `genea-draw` stroke-dashoffset animation, bezier curves for parent→child, straight lines for spouses.
- **Camera animation**: Starts at (0, 1.5, 5), moves to (0, 0.9, 1.8) over 2.5s using `easeOutCubic`. Looks down at parchment center. Subtle group settle at 60% progress.
- **Annotation writing effect**: `ink-reveal` CSS keyframe (`clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`) with staggered delays on name (0ms), description (150ms), relations (300ms), cross-tree buttons (450ms+).
- **Family change**: Right page uses `key={family.id}` for remount-triggered entrance animations; connections redraw with stroke animation.
- **Files deleted**: `ArchiveStudy3D.tsx`, `GenealogyArchiveScene.tsx`, `GenealogyArchive.tsx`, `FamilyIndex.tsx`, `FamilyHeader.tsx` (all dead code from previous iterations).
- All 220 tests pass, `tsc -b` clean, `pnpm lint` clean, `pnpm build` clean (49 precached entries).

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

- `src/components/library/BookAnimator.ts`: deterministic state machine (7 states: extracting→stabilizing→opened, pure-function transitions, timing constants in ANIM_TIMING)
- `src/components/library/BookModel3D.tsx`: 3D book mesh (back cover, spine, left/right page stacks, page surfaces, front cover hinged at left edge, page edge material variants)
- `src/components/library/BookScene.tsx`: R3F scene with camera fov 35 at (0,0.15,3), 3-point lighting, useFrame animation loop, extraction from shelf (screenRectToWorld), glow sprite during extraction, dust particles, bidirectional turned page geo, stabilization overshoot
- `src/components/library/BookCanvas.tsx`: R3F Canvas wrapper, dispatch-based state machine with `Direction` type, backdrop blur/dim, invisible click zones, CornerFold, keyboard navigation, onPointerMissed close
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
- `src/types/aharietiam.ts`: HonorbladeData type (id, name, title, order, surges, quote, description, books, status, connections, assetPath, positionIndex, color)
- `src/data/static/aharietiam.ts`: HONORBLADES array — 10 honorblades with full data (replaces old heralds.ts)
- `src/components/aharietiam/`: scene components — Sky, Camera, Terrain, Altar, Debris, Atmosphere, Particles, Lighting, Scene, CircleOfBlades, Honorblade
- `src/pages/AharietiamPage.tsx`: new page container with SEO metadata
- `public/aharietiam/`: PNG honorblade assets (jezrien.png, nale.png, etc.)

### Routing

- `/aharietiam` — new immersive Aharietiam page (Alt+5)
- `/heralds` — redirects to `/aharietiam`

##### Done (this session: Single-page lectern, font/layout fixes, viewBox double-scale fix)

- **ParchmentModel3D → single page**: Removed two-page spread. Single page at `PAGE_W=0.88`, `PAGE_H=0.52`, HTML container `960×650px`. `distanceFactor = 400 * PAGE_W / HTML_W`.
- **Lectern surface enlarged**: `SURFACE_W 0.72→0.90`, `SURFACE_D 0.56→0.62`.
- **Font sizes increased ~30-40%**: body 11→15, name 14→17, heading 30→36, annotation 12→15, labels 11→14, family title 22→26.
- **First-name-only labels**: `firstName(name) = name.split(' ')[0]!` used in node labels, annotation header.
- **Annotation panel → HTML float**: Moved from SVG to absolutely-positioned overlay (`left:340px`) so it no longer extends SVG height (which caused rescaling issues).
- **Layout constants synced**: `NODE_D 56→68`, `SPOUSE_GAP 24→30`, `GEN_GAP 130→150`, `SIB_GAP 56→64` matching SVG `NODE_R=34`.
- **Portrait fallback fixed**: Initial letter renders BEFORE the `<image>` in SVG document order (underneath). When `onError` hides the image, the letter shows through. Annotation panel uses same pattern with `z-index`.
- **InteractiveGenealogyViewer viewBox removed**: The SVG had BOTH `viewBox` (auto-scales content to fit viewport) AND inner `<g>` transform (translate+scale). For wide trees like Kholin (1730px), this double-scaling crushed text to ~5px — invisible. Fix: removed `viewBox`, letting the `<g>` transform be the single scaling source. Text now renders at ~9px for Kholin, ~16px for Survivor.
- All 220 tests pass, `tsc -b` clean, `pnpm lint` clean.

##### Done (this session: Family Trees camera / scale / atrium correction)

- **Replaced Html overlay with CanvasTexture**: `ParchmentModel3D.tsx` now renders genealogy content via `<canvas>` → `CanvasTexture` on `PlaneGeometry` (rotation `[-PI/2, 0, 0]` to match XZ page surface). Click handling via UV raycasting → `findClickRegion()` that filters by page and region type. Three.js textures cleaned up on unmount.
- **Fixed canvas aspect ratio matching 3D plane**: Canvas changed from 1024×1280 (0.8) to 1024×1317 (0.778) matching `PAGE_W=0.35 / PAGE_H=0.45`. Texture pixels are now square on the 3D surface.
- **Character portrait images preloaded and rendered**: `ParchmentModel3D` preloads all character images via `getCharacterPortrait()` into an `imageCache` Map keyed by `charId`. `renderGenealogyTexture`'s `drawPortrait()` draws loaded images clipped to circular regions with gold borders. Falls back to initial letter on error/missing.
- **Archive index left page**: Roman numerals, active family flourish (gold curve + dot separator), family name/description/member count, ink-color-coded entries (active = dark ink, inactive = muted).
- **Genealogy tree right page**: Heading ornament, family name, italic description, computed tree layout with bezier parent→child connections, gold-ringed portrait nodes, deceased cross markers, selected-character highlight ring.
- **Annotation panel**: Character portrait + name + deceased marker, wrapped description, relations line (progenitors/bonded), "Also in {Family}" switch buttons with stroke borders.
- **Connection drawing**: Main stroke (opacity 0.7, width 2), spouse lines (0.4 opacity, 1.2 width). Nodes positioned by computed layout with dynamic sibling gaps.
- **All 220 tests pass**, `tsc -b` clean, `pnpm lint` clean

##### Done (this session: Interactive SVG Genealogy Viewer — replaces CanvasTexture)

- **Complete rewrite from scratch**: Replaced the CanvasTexture approach (canvas -> PlaneGeometry -> UV raycasting) with a true interactive SVG viewer embedded inside the 3D parchment via drei <Html transform>. Genealogy is now a real SVG document the reader can zoom, pan, and inspect like a museum manuscript.
- **Layout extracted**: computeGenealogyLayout() into src/utils/genealogy-layout.ts (positions, connections, bounding box) — reused from former canvas renderer without modification.
- **InteractiveGenealogyViewer**: ref-based CSS transform: translate(x,y) scale(s) on <svg>, RAF smooth interpolation (~200ms), clamp bounds (min 30% visible), museum toolbar (fade-in/out with 300ms delay, brass gradient style), drag-vs-click detection (4px threshold), keyboard support (arrows, +/-, 0).
- **GenealogySvgContent**: full SVG document — archive index (left column), family heading + tree (right), bezier connections, portrait nodes (gold circle + image + clipPath + label + deceased cross), annotation panel (portrait, wrapped description, relations, "Also in X" buttons). Click-vs-drag via module-level pointer tracker.
- **ParchmentModel3D rewritten**: uses <Html transform> overlay (740x500px, scale 0.001) across both page surfaces. Physical box/plane meshes retained with solid parchment color. CanvasTexture import removed.
- **Files created**: src/utils/genealogy-layout.ts, src/components/genealogy/InteractiveGenealogyViewer.tsx, src/components/genealogy/GenealogySvgContent.tsx.
- **Files deleted**: src/utils/render-genealogy-texture.ts (dead code, no remaining imports).
- **Files modified**: ParchmentModel3D.tsx (Html overlay), InteractiveGenealogyViewer.tsx (restructured tickRef to useEffect for eslint react-hooks/refs compliance, fixed TS spread args).
- All 220 tests pass, tsc -b clean, pnpm lint clean.

##### Done (this session: Diagram room navigation — boundary clamping, scattered docs)

- **DiagramCanvas.tsx rewritten**: Added `clampView()` boundary clamping to prevent panning outside 0–5000 wall edges. Initial scale 0.5, stone-matching dark background. Momentum-based inertia on release. Overview button when zoomed out below 0.25. Wall always fills viewport (no empty void).
- **DiagramScene.tsx rewritten**: Removed branch system entirely — no `BRANCHES`, `BranchNode`, `DiagramConnections`, `FLOATING_NOTES`. Replaced with flat `WALL_DOCS` array — 9 docs at absolute positions (400–3600 x, 800–4100 y), chaotic rotations (−18° to +22°), varying z-indexes. 3 chaotic SVG connector lines between related docs (catalogue↔connections, worlds↔connections, volumes↔chronology).
- **DiagramConnections.tsx deleted**: Dead code, no remaining imports.
- **ESLint fixes**: Changed `let`→`const` for 6 non-reassigned variables in `DiagramCanvas.tsx`.
- All 219 tests pass, `tsc -b` clean, `pnpm lint` clean.

##### Done (this session: Aharietiam immersive redesign)

- **Complete replacement**: Deleted `HeraldsPage.tsx`, `HonorbladeSVG.tsx`, `heralds.ts`, `herald.ts`, `HeraldsPage.test.tsx`. Created new Aharietiam page: ceremonial stone circle with 9 Honorblade PNGs mathematically positioned on a circle pointing inward, Taln's slot (index 8) as an empty glowing placeholder.
- **New architecture**: `AharietiamScene.tsx` orchestrates all subcomponents. `Ground.tsx` renders a dark stone floor with circular ceremonial area, crack lines, center glow. `HonorbladeImage.tsx` renders a PNG honorblade with rotation toward center, breathing animation, vibration, Stormlight sweep, hover brighten, click shockwave ring. `HonorbladePlaceholder.tsx` renders Taln's empty slot (dashed silhouette, stormlight outline). `StormlightParticles.tsx` renders 24 floating motes with drift animation. `InformationPanel.tsx` is a fixed right-side panel with document-typography (serif, hierarchy, no cards/boxes), showing name, title, order, surges, quote, description, books, connections.
- **CSS keyframes**: Added `aharietiam-breathe`, `aharietiam-vibrate`, `aharietiam-stormlight`, `aharietiam-float`, `aharietiam-shockwave`, `aharietiam-fade-in`, `aharietiam-pulse-glow` to `index.css`.
- **Route**: `/heralds` redirects to `/aharietiam`; all navigation (Layout keyboard shortcut, Breadcrumbs, ParchmentMenu, Manuscript, CommandPalette, useSearch, keyboard-shortcuts help) updated.
- **Data replaced**: `HONORBLADES` from `@/data/static/aharietiam` replaces `HERALDS` from `heralds.ts`. Data-integrity tests updated to test `HONORBLADES`. StatsPage, DiagramScene, useSearch all import `HONORBLADES`.
- **Refs of Heralds name**: Updated in `Breadcrumbs.tsx`, `Manuscript.tsx` (AHARIETIAM chapter with new description), `CommandPalette.tsx`, `static-data.ts`, `DiagramScene.tsx` (section label, link, annotation), `StatsPage.test.tsx`, `data-integrity.test.ts`.
- **Files created**: `src/types/aharietiam.ts`, `src/data/static/aharietiam.ts`, `src/components/aharietiam/` (7 files: index, AharietiamScene, Ground, HonorbladeImage, HonorbladePlaceholder, StormlightParticles, InformationPanel), `src/pages/AharietiamPage.tsx`.
- All 206 tests pass, `tsc -b` clean, `pnpm lint` clean, `pnpm build` clean (47 precached entries).

##### Done (this session: Aharietiam v2 — cinematic 2.5D rewrite)

- **Complete architecture rewrite**: Deleted all v1 files (Scene.tsx, Ground.tsx, HonorbladeImage, HonorbladePlaceholder, StormlightParticles, InformationPanel). Created v2 with 12 files: `SceneController`, `Camera`, `Ground`, `GroundRunes`, `SceneLighting`, `Stormlight`, `AmbientParticles`, `Honorblade`, `HonorbladePlaceholder`, `HoverEffects`, `InformationMonolith`, `Scene`.
- **New tech stack**: Added `framer-motion@12.42.2`, `gsap@3.15.0`. CSS 3D transforms (`perspective`, `preserve-3d`, `translateZ`). No Three.js, no modals, no sidebars.
- **SceneController.tsx**: Context provider with state machine (`idle`/`hovering`/`selected`), hovered/selected ID, monolith visibility. Framer Motion spring animations throughout.
- **Camera.tsx**: Spring-animated `translateX/Y/Z` + `rotateX/Y` on scene container via `useMotionValue`/`useSpring`. Idle→hover (2-4% offset, 1.5° tilt, 60px zoom)→select (8% offset, 3° tilt, 180px zoom). Clears selection on container click.
- **Ground.tsx**: 11 CSS layers — base stone, wear, cracks, ceremonial circle, outer/inner ring, shadow accumulation, vignette, noise texture, ambient fog.
- **GroundRunes.tsx**: 10 glowing rune SVGs positioned around circle edge with `ground-rune-pulse` keyframe.
- **SceneLighting.tsx**: 4 gradient overlays — key light (top-right), fill (bottom-left), center ambient, rim light.
- **Stormlight.tsx**: CSS-masked animated gradient sweep (`stormlight-sweep` keyframe) with per-blade pseudo-random duration/delay (3-6s) derived from seed.
- **AmbientParticles.tsx**: Canvas 2D with ~40 particles, `requestAnimationFrame` spawn/tick/draw loop, throttled on `document.hidden`.
- **Honorblade.tsx**: Composed blade — drop shadow → highlight → Stormlight sweep → PNG image → hover ring → contact shadow → name label. `tabIndex`, `aria-label`, keyboard activation.
- **HonorbladePlaceholder.tsx**: Taln's slot — ground-crack silhouette + cyan glow, no image. Same interaction pattern as Honorblade.
- **HoverEffects.tsx**: Sets `--aharietiam-dim-level` CSS variable (0-0.6) as `rgba(0,0,0, ...)` on scene backdrop when blade hovered/selected.
- **InformationMonolith.tsx**: Emerges from floor via `AnimatePresence` — spring opacity/y/rotateX/blur. Typographic hierarchy (serif only, no boxes): status→name→title→order→divider→quote→description→surges→books→connections→❧.
- **CSS keyframes**: `stormlight-sweep`, `ground-rune-pulse`. `:root { --aharietiam-dim-level: 0 }` custom property.
- All 206 tests pass, `tsc -b` clean, `pnpm lint` clean, `pnpm build` clean (48 entries, AharietiamPage 147 kB / 47 kB gzip).

##### Done (this session: Aharietiam v4 — environment-only scene from scratch)

- **Complete from-scratch rewrite** (4th iteration): deleted all previous v3 files. Built a pure environment scene with no blades, no UI, no interactions — just the landscape.
- **10 components**: `Sky.tsx`, `Camera.tsx`, `Terrain.tsx`, `Altar.tsx`, `Debris.tsx`, `Atmosphere.tsx`, `Particles.tsx`, `Lighting.tsx`, `Scene.tsx`, `index.ts`.
- **Sky**: 5 atmospheric layers with `translateZ` depth parallax — cosmic sky → huge mountains → mid mountains → near rocks → fog. Each layer has distinct blur (25px → 4px). Mountain silhouettes via `clip-path` polygons + `filter: blur()`.
- **Camera**: `perspective: 2400px`, `rotateX(40deg) translateY(6vh)` for isometric/overlook view. Compensates for rotateX centering shift.
- **Terrain**: extends `-100%` to `+100%`. 8 platform sub-layers (stone base, border ring, 3 inner rings, texture, wear, AO, edge shadow, light map). Extended terrain has base gradients, noise overlay, SVG cracks, 18 scattered rocks, dust highlights. `translateZ(2px)` for platform thickness.
- **Altar**: 5 concentric engraved rings, 16 rune marks, 24 radial relief lines, 5 center fractures, center depression. TranslatesZ(3px) above platform.
- **Debris**: 10 column fragments + 6 stone blocks around platform edge (40–46% from center), extremely low opacity (0.01–0.016), `translateZ(4px)`.
- **Lighting**: no dark circle — ambient cool fill, directional warmth, subtle center bloom, extreme-edge vignette, top dark falloff. Mix-blend-modes throughout.
- **Atmosphere**: bottom fog, distant haze, upper atmosphere glow.
- **Particles**: Canvas 2D ~50 floating motes, upward drift, life-cycle respawn.
- All CSS: gradients, `conic-gradient`, SVG inline noise, `mix-blend-mode`, `backdrop-filter`, `filter: blur()`, `clip-path`. No images used.
- **Fixed 6 ESLint react-hooks/purity errors** (`Math.random` → `pRand()` deterministic function).
- All 206 tests pass, `tsc -b` clean, `pnpm lint` clean, `pnpm build` clean (47 entries, AharietiamPage 11 kB / 3.1 kB gzip).

##### Done (this session: CircleOfBlades — 10 Honorblade objects in perfect circle)

- **New components**: `Honorblade.tsx` (multi-layer blade object), `CircleOfBlades.tsx` (positions all 10 blades).
- **Not an `<img>` tag**: Each Honorblade is a composite object with 9 layers: GroundShadow, GroundCrack, ContactShadow, StormlightGlow, BladeImage (or TalnPlaceholder), BladeReflection, StormlightSweep, BladeParticles, Hitbox.
- **Mathematical positioning**: Each blade positioned at `(x, y)` where `x = 50 + R * cos(θ)`, `y = 50 + R * sin(θ)`, `θ = (index / 10 * 2π) - π/2`. All blades rotated to face center via `rotate(facingAngle)` where `facingAngle = (θ + π) * 180/π`.
- **Perfect circle**: All at exactly `RADIUS_PCT = 36%` from center, equal angular spacing, `positionIndex` sort order.
- **Penetrates ground**: `mask-image: linear-gradient(to bottom, black 85%, transparent 100%)` hides bottom ~15px. Dust puff at insertion point.
- **GroundCrack**: SVG paths with deterministic pseudo-random segments at each blade's base.
- **ContactShadow**: Dark radial ellipse at base with blur.
- **GroundShadow**: Cast shadow on ground, stretched, `rotateX(60deg)` for projection.
- **StormlightGlow**: Radial gradient with `glow-pulse` animation per blade color.
- **StormlightSweep**: Animated linear gradient sweep with per-blade duration/delay from `pRand()`.
- **BladeReflection**: Subtle white gradient highlight on blade surface.
- **BladeParticles**: 4 floating dust motes at blade base, animated via `blade-particle` keyframe.
- **BladeImage**: Loads PNG from `public/aharietiam/{id}.png` via `import.meta.env.BASE_URL`. Falls back to `CSSBlade` SVG on error (all blades currently use CSS fallback since no PNGs exist).
- **CSSBlade**: SVG blade shape with grip, crossguard, central ridge, edge highlight, per-blade color accent.
- **TalnPlaceholder**: No PNG — only silhouette outline (faint stroke) + center crack glow.
- **Hitbox**: Invisible interaction zone for future click/hover.
- **New keyframe**: `blade-particle` in `index.css`.
- Files modified: `Scene.tsx` (adds `<CircleOfBlades />` inside Camera), `index.ts` (adds exports), `index.css` (adds keyframe).
- All 206 tests pass, `tsc -b` clean, `pnpm lint` clean, `pnpm build` clean (47 entries, AharietiamPage 23.8 kB / 5.7 kB gzip).

##### Done (this session: The Ocean of Minds — full bead rewrite from scratch)

- **Complete from-scratch rewrite**: Deleted all Phase 1 files (Ocean, CameraController, Cursor, Atmosphere, WorldGenerator, ocean-globals, ShadesmarScene, all hooks). Replaced with 10 new components + audio architecture + entity system.
- **Entity system** (`entities.ts`): Every bead is a persistent entity with `entityId`, `type`, `state` (`dormant`|`stirring`|`awake`), `discovered` flag, and fixed world position. `entityMap` preserves metadata across chunk load/unload, enabling future "bead as wiki node" continuity.
- **WorldStreamer.tsx**: Chunk-based streaming (8-unit chunks, 4-chunk view radius). Deterministic noise placement (no `Math.random()` ever) — 2D simplex noise (`noise.ts`) drives density clustering: areas with high noise yield dense bead clusters, low noise yields sparse voids. Scale follows distribution (35% tiny 0.02–0.04, 25% small 0.04–0.07, 20% medium 0.07–0.11, 13% large 0.11–0.18, 7% gigantic 0.18–0.30). Height varies ±20cm via noise. 1200 max beads, ring buffer allocation.
- **BeadField.tsx**: `InstancedMesh` with `ShaderMaterial` inlined (no separate file). Custom `aGlow` instance attribute for per-bead glow. `SphereGeometry(1, 12, 12)` with per-instance scale via `instanceMatrix`. Glow lerps from `beadGlow[]` into GPU attribute each frame.
- **BeadMaterial (custom ShaderMaterial)** — obsidian glass: base color `#05050A`, fresnel rim (`pow(1-dot(N,V), 3)` × blue `#08141E`), moonlight specular (`pow(reflect ...), 12)` × `#8899cc` × 0.06), internal scattering (sin of N×frequencies + time for organic sub-surface sparkle). No hard specular, no transmission. Glow from `aGlow` attribute drives `#264D80` contribution.
- **FloatingMotion.tsx**: 3-frequency per-bead breathing (freq ranges 0.15–0.40, 0.05–0.20, 0.4–1.0 Hz, amp ranges 5–15mm, 2–10mm, 1–5mm) with phase derived from entity hash. Wind: `sin(t×0.03 + windPhase)×1.5cm` on X, `cos(t×0.025 + windPhase×1.3)×1.2cm` on Z. Never synchronized — no two beads breathe alike.
- **InteractionSystem.tsx**: Cursor ray projects to ground plane, finds nearest bead within 0.4u, sets `beadGlowTarget[nearest]=1.0`, propagates to neighbors within 1.2u with linear falloff. `PointLight` at cursor position traces the interaction point. `lastHovered` tracking decays previous target.
- **CameraRig.tsx**: Pointer-lock WASD with inertia (`lerp` velocity, drag 0.90), max speed 3.2 u/s. Mouse sensitivity 0.0018. Camera roll proportional to lateral velocity (`euler.z += targetRoll`). Sinusoidal drift offset (±0.3cm on all axes, 0.15 Hz). Head bob on movement (±0.1cm, 2 Hz × speed). No FPS feel — camera floats.
- **Lighting.tsx**: Cold moonlight (`directionalLight #8899cc`, intensity 0.06 from `(2,3,1)`), ambient (`#111122`, 0.015), hemisphere (`#223355`→`#050510`, 0.03).
- **Atmosphere.tsx**: `ShaderMaterial` volumetric fog on BackSide sphere (radius 40). Height-based density gradient, compresses distant space to `0.005, 0.003, 0.02` color at 60% opacity.
- **Audio architecture** (`audio/`): `AmbientManager` (layer registry + play/stop/volume), `FutureWhispers` (proximity state machine: silent→distant→near), `FutureSphereAudio` (event queue: awaken/connect/resonate/fade). No playback — architecture only.
- **Noise utility** (`noise.ts`): Deterministic 2D simplex noise with seeded permutation table (no `Math.random()`). Used by WorldStreamer for density, height, scale, and per-bead parameter generation.
- **Deleted old files**: Ocean.tsx, CameraController.tsx, Cursor.tsx, Atmosphere.tsx (old), WorldGenerator.tsx, ocean-globals.ts, ShadesmarScene.tsx, hooks/ (all 5 files), BeadMaterial.tsx (inlined).
- **New files**: World.tsx, InfiniteOcean.tsx, BeadField.tsx, WorldStreamer.tsx, FloatingMotion.tsx, InteractionSystem.tsx, CameraRig.tsx, Lighting.tsx, Atmosphere.tsx, entities.ts, noise.ts, index.ts, audio/{AmbientManager,FutureWhispers,FutureSphereAudio,index}.ts.
- All 206 tests pass, `tsc -b` clean, `pnpm lint` clean.

##### Done (this session: Constellation-based interaction rewrite — sacred layout, direct expansion, no particle physics)

- **Complete philosophical rewrite**: Removed all particle-simulation concepts (radial expansion forces, separation push, physics scaling, cursor attraction, repulsion). Replaced with constellation-based model: beads are anchored to permanent home positions, clusters preserve their silhouette at all times.
- **Direct position scaling for expansion**: `InteractionModel.applyClusterExpansion()` directly computes `s.x = cx + (restX - cx) × (1 + amp × factor)` for every soul in the active cluster. No velocity, no forces, no integration — just deterministic uniform scaling around the cluster center. Preserves every relative position perfectly.
- **Three clear interaction stages**: Stage 1 (Observation) — compact layout, tiny ambient noise only. Stage 2 (Focus) — cursor enters `CLUSTER_EXPANSION_RADIUS=0.18`, cluster smoothly expands to 160% (`CLUSTER_EXPANSION_AMPLITUDE=0.6`). Stage 3 (Inspection) — after 300ms over cluster, expansion reaches 180% (`CLUSTER_INSPECTION_AMPLITUDE=0.8`), physics frozen for that cluster.
- **Cluster-level freeze**: When expansion factor exceeds `CLUSTER_FREEZE_THRESHOLD=0.3`, the entire cluster's souls are added to `frozenClusters`. `PhysicsSystem` skips all physics (damping, spring, noise, integration) for souls in frozen clusters. Hovered bead also has vx/vy zeroed explicitly.
- **Planet focus dimming**: `updatePlanetFocus()` reduces non-active cluster souls to 35% opacity when a cluster is active, enhancing attention on the current constellation. Restores to 70% when no cluster active.
- **Physics reduced to minimum**: `SPRING_K=6.0`, `DAMPING_PER_FRAME=0.94`, `NOISE_AMP=0.0003`, `MAX_VELOCITY=0.00005`. No cursor force. No repulsion. Removed `REPULSION_STRENGTH`, `CURSOR_FORCE`, `EXPANSION_FORCE`, `SEPARATION_*`, `INSPECTION_PHYSICS_SCALE` constants.
- **Larger beads + hitboxes**: ENTITY_VISUALS sizes increased ~30% (character 8-12px, important 14-20px, herald 18-26px). `CLICK_RADIUS_WORLD=0.08` (4.4× previous). `SMART_HOVER_RADIUS=0.08` (2.7× previous). Selection feels predictive, not pixel-perfect.
- **Smart hover preserved**: Best-candidate scoring (distance 100×, size 15×, stability 20×, mass 5×) + flicker prevention within `HOVER_STABILITY_THRESHOLD=0.006`.
- **Old fields removed**: `frozen` from Soul type, `justClicked` from InteractionSystem, all unused constants. InteractionSystem simplified to minimal mouse tracker.
- All 206 tests pass, `tsc -b` clean, `pnpm lint` clean.
