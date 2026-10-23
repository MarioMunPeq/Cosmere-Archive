# The Diegetic Kit

**Status:** documentation only. No code was changed for this pass.
**Audited:** 2026-10-23, against the working tree.
**Authority:** `REBUILD_PLAN.md` §0.2 (D-DIEG), which outranks the other decisions.
**Scope:** the Historical Archive (`/chronology`, `/mind-map`, `/about`), the promoted core room `/aharietiam`, and the reusable material already built for the Codex, Records, the Diagram, the Library and the Celestial Charts.

This is not a moodboard. Every token, class and prop named here exists in the repository today. Where the code does not yet meet the standard, that is recorded in §9, not hidden.

---

## 0. The rule in one sentence

> If the thing you are building would still make sense on a website about a different subject, it is not diegetic.

D-DIEG is a construction rule, not a copy layer. The visitor is not "using a site about the Cosmere"; they are standing in an archive inside it. That means:

| Allowed                                 | Prohibited                                      |
| --------------------------------------- | ----------------------------------------------- |
| A search box that is a **register**     | A search bar with a placeholder and a magnifier |
| An index that is a **page of a book**   | A sidebar of `<Link>`s                          |
| A count that is a **fact of the world** | A KPI card with a trend arrow                   |
| "Open record"                           | "View profile"                                  |
| "Put it back"                           | "Back to library"                               |
| An error that is a **scraped page**     | A 404 with the site logo                        |

The test is deliberately harsh. The Diagram wall could be a researcher's pinboard in another discipline; it survives because the _content and the hand_ are Taravangian's. A force-directed graph with a dark background could belong to any SaaS analytics product; that is why the Mind Map is the weakest room in the archive.

---

## 1. Audit — the Historical Archive and the promoted room

`src/navigation.ts` now defines only three historical destinations. Aharietiam was promoted into `CORE_DESTINATIONS`, so it is audited here as a fourth row rather than quietly left out.

| Route                                | What it shows                                                                                                                                                                                     | Current style (verified)                                                                                                                                                                                                                                                                                                      | Recommendation                     | Why                                                                                                                                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/aharietiam` — **promoted to core** | A React Three Fiber stone circle: nine honorblade meshes around a platform, Taln's empty spot, camera walk-to-blade, carved-stone inspection slab, right-side quote, herald glyph, bronze Return. | **The room is diegetic; the interface is not.** Stone, `#030205` sky, carved `InfoMonolith`, `ReturnButton`, focus dimmer. But the quote, legend and panel use `'Times New Roman'`, 9–12px labels, `borderRadius: 10` book pills, GSAP timelines with no reduced-motion branch, and `Math.random()` in stone/particle detail. | **RESTYLE in place**               | The scene already passes the one-sentence test. Replace the type, the pills and the motion contract; do not rebuild the circle.                                                                                      |
| `/chronology`                        | Eleven eras of history, 120+ events, a horizontal SVG main line, up to five saga forks, era bands, hover folio and expanded document overlay.                                                     | **A dark dashboard under archival names.** Page ground `#0b0a0a`, `text-white` / `gray-600`, slate `#374151` main line, `#64748b` dots, `font-serif` and `font-mono` used as skin. `ChapterNav`, `SagaIndex`, `ArchivalFolio` and `DocumentOverlay` all read as panels.                                                       | **RESTYLE in place**               | The data model and the horizontal chronicle interaction are worth keeping. The material is a chart widget. Turn it into one long fold-out leaf: ink rules, era bands as paper tabs, folios as slips.                 |
| `/mind-map`                          | A Canvas 2D force graph of planets, shards, characters and books, with 800 random stars, auto-rotation after four seconds and 8–11px labels.                                                      | **A generic force graph.** `d3-force`, dark void, random star field, rounded-rectangle book nodes, timeline of camera rotation. None of it is made of paper, leather, brass, thread or ink.                                                                                                                                   | **MERGE into Records (Volume II)** | It duplicates the Connections chapter with the most transferable component in the site. Replace it with an engraved "chart of correspondences" on a fold-out plate, using `LineagePlate` as the technical precedent. |
| `/about`                             | The archivist's note: opening essay, four facts, three sources, rights, thanks, contact links, signature.                                                                                         | **Warm paper, modern article.** Brass plaque header and a paper-coloured `<article>`, but a `text-nano` small-caps section stack, default paragraph flow, no `PageSurface`, and a `Signature` that is a plain uppercase line rather than a hand.                                                                              | **RESTYLE in place**               | `REBUILD_PLAN.md` G.6 explicitly permits `/about` as a diegetic place: the archivist's note. Keep every word; put it on the same leaf stock as the codex and let the signature be written.                           |

**Container note — `/historical`.** The index itself (`src/pages/HistoricalPage.tsx`) is a hybrid: folder-shaped cards with paper gradients, but the heading plaque is built from inline styles instead of `.library-sign__plate`, and the status labels are 9–10px. It is not a fourth destination, but it will look wrong until it is folded into the same pass.

**What survives the audit:** Aharietiam's room, Chronology's data and horizontal scroll, the Mind Map's graph data, and About's words. Nothing is deleted by this document.

---

## 2. Palette

The kit has two climates, and they are not interchangeable:

- **Paper** is where text is read.
- **The dark room** is what surrounds the object. It is never the page.

### 2.1 Paper and ink

Defined in `src/design/tokens.css`; consumed by the codex, Records, the Diagram reader, the Library sign and About.

| Token                          | Value     | Use                                          |
| ------------------------------ | --------- | -------------------------------------------- |
| `--surface-page`               | `#f4efe4` | The leaf. Never pure white.                  |
| `--surface-page-raised`        | `#ede6d8` | Portrait mounts, inset paper.                |
| `--surface-page-inset`         | `#e4dccb` | Wells, pressed areas, sheet gradients.       |
| `--surface-page-edge`          | `#cfc4ae` | Page edges, deckle shadow.                   |
| `--text-on-page-primary`       | `#241a12` | Ink. 14.87:1 on the page.                    |
| `--text-on-page-secondary`     | `#4a382a` | Field labels, body secondary. 9.69:1.        |
| `--text-on-page-tertiary`      | `#6b5744` | Folios, running heads, metadata. 5.96:1.     |
| `--text-on-page-disabled`      | `#877760` | Non-informational only. 3.79:1.              |
| `--text-on-page-link`          | `#1f5e86` | Cross-references. 6.10:1.                    |
| `--text-on-page-accent`        | `#7e601c` | Seals, accent ink, stamped emphasis. 5.12:1. |
| `--border-subtle-on-page`      | `#c9bca4` | Decorative rules only.                       |
| `--border-interactive-on-page` | `#8c7a5c` | State-bearing borders. 3.62:1.               |

### 2.2 Leather, brass, wax, thread, candle

Defined in the codex block of `src/index.css` (starting at the `:root` that follows the `.record-enter` rule).

| Token                     | Value                   | Use                                                       |
| ------------------------- | ----------------------- | --------------------------------------------------------- |
| `--codex-leather-light`   | `#5a3a22`               | Cover highlight.                                          |
| `--codex-leather`         | `#432a17`               | Cover body.                                               |
| `--codex-leather-deep`    | `#2e1c0e`               | Cover shadow.                                             |
| `--codex-leather-shadow`  | `#1d1108`               | Spine well.                                               |
| `--codex-brass`           | `#a8854e`               | Plates, bosses, edges.                                    |
| `--codex-brass-highlight` | `#d9bd82`               | Top bevel, tack highlight.                                |
| `--codex-brass-ink`       | `#ecd9ad`               | Stamped type on leather. 11.1:1.                          |
| `--codex-wax`             | `#6d2a1c`               | The bookmark ribbon only. There is no wax-seal component. |
| `--codex-thread`          | `#241811`               | Binding threads, lineage ink, wall string.                |
| `--codex-candle`          | `#ffcf94`               | The single warm light.                                    |
| `--codex-foxing`          | `rgb(139 92 45 / 0.16)` | Age stains on paper.                                      |
| `--codex-desk`            | `#170f07`               | Desk mid-tone.                                            |
| `--codex-desk-deep`       | `#0b0703`               | Desk edge.                                                |
| `--codex-page-block`      | `#efe7d6`               | The block of leaves seen from the fore-edge.              |
| `--codex-page-edge`       | `#cdc1a8`               | Individual leaf edges.                                    |

### 2.3 Dark room and data

`--surface-void` `#07090f`, `--surface-base` `#0d1119`, `--surface-raised` `#141a24` are the existing dark UI climate. Use them for the **room around** the object (Aharietiam sky, Shadesmar water, the Atlas darkness) and for chrome that has not yet been rebuilt. Do not use them as the surface of a page that is supposed to be read.

Shard accents (`--shard-honor`, `--shard-cultivation`, `--shard-odium`, and the rest) are data colours for nodes, marks and legends. They are never page backgrounds, never text colours on paper, and never the only carrier of meaning.

### 2.4 Palette prohibitions

- No `#ffffff` and no `#000000` on a diegetic surface. The nearest legal values are already in the tokens.
- No Tailwind `gray-*`, `slate-*` or `cyan-*` as the material of a room. They are a tell that the surface is a dashboard.
- No glassmorphism, no `backdrop-filter` "frost", no translucent white cards.
- No pill shapes (`rounded-full`) as controls or tags. A paper slip has a 1–3px corner, not a 999px radius.
- No purple/cyan gradient glows. Warm light comes from the candle; cold light belongs to Stormlight and is content, not decoration.

---

## 3. Type

### 3.1 Families

All four are self-hosted in `src/design/fonts.css`; no request leaves the visitor's machine.

| Family                      | Token            | Role                                                                                     | Never                                                    |
| --------------------------- | ---------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **EB Garamond Variable**    | `--font-display` | Titles, long-form body on paper, epigraphs, italic quotes, ledger labels, stamped names. | Tiny UI chrome where Inter is clearer.                   |
| **Inter Variable**          | `--font-ui`      | Interface labels, running heads, metadata, small caps, buttons made of type.             | Long body copy; it makes a leaf look like a web article. |
| **JetBrains Mono Variable** | `--font-mono`    | Years, catalogue numbers (`CA-ADO-0001`), identifiers, formulas, folios.                 | Paragraphs.                                              |
| **Caveat Variable**         | `--font-hand`    | Khriss/Nazh marginalia, tally notes, source lines, corrections.                          | Body text; anything below 16px in practice.              |

### 3.2 Scale and limits

The theme scale runs from `--text-display` 48px to `--text-nano` 11px in `src/design/tokens.css`.

**For new work, the floor is 12px.** The 11px `--text-nano` and the 11px codex chrome are existing debt (§9), not a licence. 12px is the smallest size that still reads as print rather than as a UI caption at arm's length.

| Purpose                  | Size                       | Family  |
| ------------------------ | -------------------------- | ------- |
| Room title / cover title | `clamp(28px, 3.4vw, 54px)` | display |
| Chapter title            | `clamp(22px, 2.4vw, 34px)` | display |
| Reading body             | 16–19px                    | display |
| Lead paragraph           | `--text-lead` 19px         | display |
| Metadata / running head  | 12–14px                    | ui      |
| Years / catalogue number | 12–14px                    | mono    |
| Marginalia               | 16–19px                    | hand    |

Other rules:

- Measure: `--measure` 68ch maximum; 52–62ch for a single leaf. `SheetReader` uses `max-w-[62ch]` for this reason.
- Caps need tracking: `0.04em` minimum, `0.12–0.22em` for small labels.
- Italic is a voice, not a hover state. Use it for quotes, subtitles and in-world asides.
- Reading text must live in a flat, untransformed layer. The only rotated full-page surfaces in the kit are the cover leaf and the single turning leaf, and both are unmounted when they come to rest (`Codex.tsx`, `PageSurface.tsx`). A stamp may be rotated by a few degrees; a paragraph may not.
- Do not put a heading inside a button. The Diagram sheet uses a whole-sheet overlay button with an `aria-label` precisely to avoid this (`Sheet.tsx`).

---

## 4. Materials

### 4.1 The desk and the single candle

**Source:** `src/components/codex/CodexObject.tsx` plus `.codex-object*` in `src/index.css`.

`CodexObject` renders, bottom to top:

1. `.codex-object__wood` — three repeating-linear-gradients at 89–92°, i.e. walnut grain drawn, not photographed.
2. `.codex-object__grain` — the shared `--codex-grain` SVG turbulence tile at 35% overlay.
3. `.codex-object__cone` — a blurred beam from the upper right.
4. `.codex-object__candle` — the pool. `--candle-x` / `--candle-y` default to `62% 22%`; `--candle-radius` defaults to `clamp(140px, 12vw, 180px)`. The pointer writes the first two straight to the node inside a rAF, never through React state.
5. `.codex-dust` / `.codex-mote` — sparse motes, deterministic from `codex-dust.ts`.
6. `.codex-object__vignette` — edge falloff.

**The candle is the only light in the kit.** Do not add a second glow, a coloured rim light, or a page-local bloom to a paper surface. `diagram.css` is allowed to narrow the pool (`150px` on the wall, `170px` in the reader) because the wall is a larger room, not because it has a second lamp.

Under `prefers-reduced-motion`, `CodexObject` removes the pointer-written custom properties, so the pool returns to its CSS default. The flicker is opacity-only and is also collapsed by the global gate.

### 4.2 Paper

**Sources:** `src/components/codex/PageSurface.tsx`, `src/components/diagram/Sheet.tsx`, `.codex-page*`, `.codex-block*`, `.record-*`, `.library-page`.

A leaf is built from layers, never from a border radius:

| Layer  | Class                                                                                                              | What it does                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Stock  | `.codex-page__paper`                                                                                               | `--surface-page` + `--codex-grain` at 180px, plus three radial foxing stains in `::after`.           |
| Gutter | `.codex-page__gutter-shade`                                                                                        | The curve into the spine. Left and right variants mirror it.                                         |
| Header | `.codex-page__header`, `.codex-page__running`, `.codex-page__rule`                                                 | Running head on the outer edge, thin rule inward. 11px today (debt).                                 |
| Body   | `.codex-page__body`                                                                                                | The scrolling column. `role="region"`, `tabIndex={0}` unless `noScroll`.                             |
| Folio  | `.codex-page__folio`                                                                                               | `— 14 —`, outer edge. 11px today (debt).                                                             |
| Block  | `.codex-block__side`, `.codex-block__leaf`, `.codex-block__gutter`, `.codex-block__crease`, `.codex-block__thread` | Twelve real leaves per side, four thread stations, a crease. Depth shrinks 6px across a read volume. |

**Loose sheets** (`Sheet.tsx`) are a different object from a bound leaf. They add:

- a torn deckle per side, generated deterministically from the sheet id (`deckle(seed)`), not a rectangle with a wobble;
- ruled lines and a red margin rule;
- a foxing stain and a turned corner, derived from the same hash;
- tape on one sheet in three;
- one brass tack at top centre, with its own shadow on the paper;
- a cast shadow to the right, away from the candle at the low left.

Paper rules:

- Corners are 1–3px, never 8px or pills. `.codex-spread` uses `1px 3px 3px 1px`; `.codex-thumb` uses `0 3px 3px 0`.
- Paper is warm. A cream rectangle on a dark wall is already a card; it needs an edge, a fastener, a shadow and uneven tone to become a page.
- The same stock must be used across the codex, the Diagram reader, Records and the Library. `Sheet.tsx` draws from `--surface-page`, `--codex-page-block`, `--codex-foxing` and the brass tokens for exactly this reason.
- A page that is read is flat. A page that is turning may be transformed, once.

### 4.3 Leather

**Source:** `src/components/codex/CodexCover.tsx`, `.codex-cover*`, `.codex-book`, `.codex-ribbon`.

The cover is umber leather, blind-tooled, with brass bosses:

- base: `linear-gradient(155deg, var(--codex-leather-light), var(--codex-leather) 38%, var(--codex-leather-deep))`;
- grain: a `repeating-radial-gradient` at `24% 32%` in 1px/3px steps;
- frame: `.codex-cover__frame`, a 1px brass-ink border at 20% with an inset 4/5px double rule;
- bosses: `.codex-cover__boss` at the four corners;
- plate: `.codex-cover__plate` with kicker, title, subtitle, byline;
- spine: `.codex-cover__spine` and `.codex-cover__band`;
- bookmark: `.codex-ribbon`, the only consumer of `--codex-wax`.

Library spines are a separate material system: `SPINE_MATERIAL` in `src/navigation.ts` veils a real cover crop with ink and foil so the title clears 4.5:1 over the photograph. Use `spineMaterial(seriesId)`; do not hand-write a new veil.

### 4.4 Brass

**Sources:** `.library-sign__plate`, `.library-plate`, `.codex-cover__plate`, `.codex-edge`, `.lineage-plate__control`, `.record-stamp`.

There is **no reusable brass-plaque React component** in the tree. The pattern is CSS and should be copied by class, not re-invented:

- three-stop vertical gradient: `#7a5728 → #4a3116 → #2f1d0b` (plate) or `rgb(92 65 35 / .9) → rgb(48 32 17 / .92) → rgb(31 20 10 / .94)` (sign);
- one 1px light border (`rgb(212 179 112 / .72)` or `rgb(185 154 94 / .62)`);
- inset top highlight (`inset 0 1px 0 rgb(255 238 196 / .3)`);
- one small, tight drop shadow, not a Material elevation;
- type in small caps or uppercase with tracking, in `--codex-brass-ink` / `#f7e6c2`.

Brass is used for **labels and edges**, not for buttons with rounded corners. The brass page-edge control is a paper tab with a brass hairline, not a metal button (`.codex-edge::before`).

### 4.5 Wax, thread and ink

- **Wax:** `--codex-wax` appears only in `.codex-ribbon`. It is a ribbon, not a seal. There is no wax-seal component; if one is needed it must be built and added to §5.
- **Thread:** `.codex-block__thread` draws the four binding stations with `--codex-thread`. `LineagePlate` draws branches with an ink bleed + main stroke + hairline, and `.diagram-wall` strings use the same token. Thread is always a physical connection: it ties a sheet to a tack, a child to a parent, or a signature to a spine.
- **Ink:** `.record-stamp` is a rotated (`-3deg`) bordered stamp with a 2px paper inset, used for `Living`, `Deceased`, `Unrecorded` and `Sealed`. `.record-link` is an underlined cross-reference. `PlanetSigil` is a deterministic SVG seal derived from the planet id. None of these are chips. The Diagram adds one literal red ink, `#8c2b1f`, for tallies and source notes (`SheetReader.tsx`); it is a mark, never a surface.

### 4.6 The dark room

The dark climate is allowed only where the visitor is **outside** the book:

- Aharietiam's sky (`Atmosphere.tsx`, `#050308 → #030205`);
- Shadesmar's ocean;
- the Atlas's night;
- the vignette around the desk.

It is not allowed as the ground of a reading page, an index, a timeline or an about page. Those are paper.

---

## 5. Reusable components

Everything below exists and is imported today. Props are the public surface; internal helpers are marked as such.

### 5.1 The book chassis

| Component               | Path                                   | Props that matter                                                                                                                                                                                                          | What it gives you                                                                                                                                                                |
| ----------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Codex` (default)       | `src/components/codex/Codex.tsx`       | `spreads`, `index`, `onTurn`, `progress`, `label`, `part`, `edition`, `thumbs`, `startOpen`, `cover`, `aside`; single-spread shorthand `left`/`right`/`leftFolio`/`rightFolio`/`leftHeader`/`rightHeader`/`rightNoScroll`. | The desk, cover ceremony (420ms rest + 920ms turn, once per session), drag/edge/key page turns (640ms forward, 560ms back), ribbon, fore-edge buttons, live spread announcement. |
| `CodexObject` (default) | `src/components/codex/CodexObject.tsx` | `children`.                                                                                                                                                                                                                | Walnut desk, pointer candle, dust, vignette. Use it as the ground for any room that should feel like the same building.                                                          |
| `PageSurface` (default) | `src/components/codex/PageSurface.tsx` | `side: 'left' \| 'right'`, `header?`, `folio?`, `noScroll?`, `children`.                                                                                                                                                   | One leaf: paper, grain, foxing, deckle edge, gutter shade, running head, scrollable body region, folio.                                                                          |
| `Spread` (default)      | `src/components/codex/Spread.tsx`      | `left`, `right`, `leftFolio?`, `rightFolio?`, `leftHeader?`, `rightHeader?`, `rightNoScroll?`.                                                                                                                             | Two flat leaves with no transform between the reader and the type.                                                                                                               |
| `PageBlock` (default)   | `src/components/codex/PageBlock.tsx`   | `progress?`, `label?`, `children?`.                                                                                                                                                                                        | The physical block: twelve leaves per side, gutter crease, four thread stations, depth that shrinks as the volume is read.                                                       |
| `CodexCover` (default)  | `src/components/codex/CodexCover.tsx`  | `phase: 'closed' \| 'opening'`, `onSkip`, `details?: CodexCoverDetails`.                                                                                                                                                   | Umber leather, blind-tooled glyph, brass bosses, title plate, skip control. Normally reached through `Codex`'s `cover` prop.                                                     |
| `ThumbTabs` (default)   | `src/components/codex/ThumbTabs.tsx`   | `tabs: readonly ThumbTab[]`, `label`; each tab `{ id, label, ariaLabel, active?, onSelect }`.                                                                                                                              | The fore-edge index as paper slips, not floating buttons. Marks itself `data-codex-interactive` so arrow keys do not turn the page while a tab is focused.                       |

`CodexSpreadView` is the data shape the engine consumes: `{ id, title, left, right, leftFolio?, rightFolio?, leftHeader?, rightHeader?, rightNoScroll?, recordId? }`. Build it rather than passing loose nodes when a page has more than one spread.

### 5.2 Records and the fold-out plate

| Component                | Path                                      | Props that matter                                                    | What it gives you                                                                                                                                                          |
| ------------------------ | ----------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RecordLeftPage`         | `src/components/records/RecordSpread.tsx` | `character: Character`, `locked?`.                                   | The plate: `PlanetSigil`, the private `PortraitPlate`, name, epithet, status stamp, identity ledger.                                                                       |
| `RecordRightPage`        | `src/components/records/RecordSpread.tsx` | `character`, `locked?`, `onUnlock?`.                                 | Biography with a drop cap, book references, relationship miniatures. Locked state is a restricted-copy panel, not a modal.                                                 |
| `buildRecordSpread`      | `src/components/records/RecordSpread.tsx` | `RecordSpreadProps`                                                  | Returns a `CodexSpreadView` with `recordId`, so the codex can deep-link a person.                                                                                          |
| `LineagePlate` (default) | `src/components/records/LineagePlate.tsx` | `family: FamilyDefinition`, `onOpenCharacter: (id: string) => void`. | The engraved fold-out: portrait medallions, printed names, inked branches, gold-leaf marriage line, pan/zoom, keyboard nodes. Marks its viewport `data-codex-interactive`. |

**`PortraitPlate` is not exported.** It is a private function inside `RecordSpread.tsx`. Reuse the `.record-portrait` CSS (4:5 frame, brass hairline, corner ticks, sepia image, deceased treatment) or use `Monogram` when there is no image. Do not import a component that does not exist.

`RecordsCodex` (`src/components/records/RecordsCodex.tsx`) is the page-level composition: three volumes, contents, title page, volume tabs, spoiler control. Treat it as the reference implementation, not as a generic shell.

### 5.3 Loose paper, the wall and the reader

| Component                                  | Path                                       | Props that matter                                                                                                                           | What it gives you                                                                                                                                                          |
| ------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Sheet` (named)                            | `src/components/diagram/Sheet.tsx`         | `id`, `w`, `h`, `rotation?`, `large?`, `label`, `onClick?`, `onMouseEnter?`, `onMouseLeave?`, `onFocus?`, `onBlur?`, `raised?`, `children`. | A torn, stained, taped sheet with a brass tack, a ruled margin, a cast shadow and a whole-sheet button. Deterministic from `id`.                                           |
| `SheetReader` (named)                      | `src/components/diagram/SheetReader.tsx`   | `note: DiagramNote`, `origin: DOMRect \| null`, `onClose`, `onPrev`, `onNext`.                                                              | A single leaf lifted from its pin onto the desk: `PageSurface`, focus trap, `role="dialog"`, Esc, arrow navigation, arrow-scroll inside the body, return-to-pin animation. |
| `Ledger` (named)                           | `src/components/diagram/Ledger.tsx`        | `rows: LedgerRow[]`, `unit`, `total`, `totalLabel`, `compact?`, `note?`.                                                                    | A hand-ruled table with ink-stroke bars, Garamond labels, mono numerals and a real `<caption>`. Not a chart widget.                                                        |
| `DiagramCanvas` (default)                  | `src/components/diagram/DiagramCanvas.tsx` | Pan/zoom surface; see the component.                                                                                                        | The 5000-unit wall with boundary clamping, inertia and an overview control.                                                                                                |
| `WallSurface`, `WallMarks`, `DiagramIndex` | `src/components/diagram/`                  | Internal to the wall.                                                                                                                       | Plaster, chalk, strings clippings, index.                                                                                                                                  |

The wall is the technical precedent for a "chart of correspondences": paper sheets pinned to plaster, connected by thread, with the full document in a lifted leaf. If the Mind Map is merged into Records, this is the pattern to adapt, not `d3-force`.

### 5.4 Library

| Component                  | Path                                        | Props that matter                                                                                  | What it gives you                                                                                                  |
| -------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `CosmereLibrary` (default) | `src/components/library/CosmereLibrary.tsx` | `onOpen: (book: Book, source: DOMRect) => void`.                                                   | The reading-room wall: `CodexObject`, brass sign, measured shelves, up/down keyboard movement between shelves.     |
| `Shelf` (default)          | `src/components/library/Shelf.tsx`          | `id`, `label`, `note`, `books`, `baseHeight`, `shadowed`, `onOpen`, `shelfIndex`, `registerShelf`. | One collection on one or more boards; centred row, brass plate on the front edge, horizontal snap on phones.       |
| `LibraryReader` (default)  | `src/components/library/LibraryReader.tsx`  | `book`, `origin: DOMRect \| null`, `onClose`.                                                      | A spine leaving its slot, growing into the Codex chassis, and returning. No dark veil; the room is the transition. |
| `BookSpine`                | `src/components/library/BookSpine.tsx`      | Internal spine renderer using `SPINE_MATERIAL`.                                                    | The ink/foil/crop veil that keeps titles legible over real covers.                                                 |

### 5.5 Figures, marks and marginalia

| Component                  | Path                                                 | Props that matter                                        | What it gives you                                                                                                                                                     |
| -------------------------- | ---------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Monogram` (default)       | `src/components/common/Monogram.tsx`                 | `name`, `planet?`, `size?`, `isDeceased?`, `className?`. | An antique rectangular portrait frame with initials, a shard-tinted well, three hairlines and corner ornament. 0 KB, 0 404s. Accessible name is the character's name. |
| `PlanetSigil` (named)      | `src/components/records/RecordSpread.tsx`            | `planet?: Planet`.                                       | A deterministic ring-and-spoke seal tinted by the planet colour.                                                                                                      |
| `FieldNoteLayer` (default) | `src/components/celestial-charts/FieldNoteLayer.tsx` | `planetId: string`.                                      | Khriss/Nazh marginalia: 1–3 notes per visit, progressive reveal, `--font-hand`, sketches, crossed-out editions.                                                       |
| `Signature` (default)      | `src/components/about/Signature.tsx`                 | none.                                                    | Today: a plain uppercase attribution line. **Not yet diegetic**; see §9.                                                                                              |

### 5.6 Chronology components — names only

`ChapterNav`, `SagaIndex`, `ArchivalFolio` and `DocumentOverlay` exist in `src/components/chronology/`, but they are currently styled as a dark dashboard. They are listed for orientation, **not** as exemplars. A restyle may keep their APIs, but should not copy their material.

### 5.7 Things that do not exist

Do not cite or import these; they are not in the tree:

- `MonogramMedallion`
- an exported `PortraitPlate`
- a `Marginalia` component (use `FieldNoteLayer`)
- a brass-plaque React component (use `.library-sign__plate` / `.library-plate`)
- a paper-note React component (use `Sheet`)
- a wax-seal component (the only wax is `.codex-ribbon`)
- a generic `Panel`, `Card` or `Chip` in the diegetic kit

---

## 6. Motion

### 6.1 The clocks

All durations and easings live in `src/design/tokens.css`.

| Token                | Value                               | Use                                       |
| -------------------- | ----------------------------------- | ----------------------------------------- |
| `--dur-instant`      | 80ms                                | Pressed state, immediate acknowledgement. |
| `--dur-fast`         | 120ms                               | Hover, focus, a slip lifting.             |
| `--dur-base`         | 220ms                               | A panel or tooltip arriving.              |
| `--dur-slow`         | 400ms                               | A chapter or zone change.                 |
| `--dur-ambient`      | 900ms                               | Background cycles only, linear.           |
| `--dur-page-forward` | 640ms                               | A leaf turning forward.                   |
| `--dur-page-back`    | 560ms                               | A leaf returning.                         |
| `--ease-standard`    | `cubic-bezier(0.2, 0, 0, 1)`        | Most state.                               |
| `--ease-decelerate`  | `cubic-bezier(0, 0, 0, 1)`          | Entry.                                    |
| `--ease-spring`      | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Physical settle only.                     |
| `--ease-exit`        | `cubic-bezier(0.4, 0, 1, 1)`        | Exit.                                     |
| `--ease-page`        | `cubic-bezier(0.33, 0.8, 0.2, 1)`   | The page turn.                            |
| `--stagger-step`     | 40ms                                | Up to `--stagger-max` 8 items.            |

### 6.2 Hard rules

1. **Animate `transform` and `opacity` only.** WebGL/Canvas is the exception, because it does not animate CSS. Do not animate `width`, `height`, `top`, `left`, `filter`, `box-shadow` or `background-position` as a transition.
2. **The page turn is the heaviest motion in the kit.** 640ms forward, 560ms back, one leaf, 180°, and the leaf is unmounted at rest. `Codex` mirrors the token values in `PAGE_MS`; keep them in sync.
3. **Ambient motion is slow and sparse.** The candle flickers on a 4s opacity cycle; dust drifts on 26–52s cycles. If an ambient loop is visible as a loop, it is too fast.
4. **Stagger is a reading aid, not a fireworks display.** 40ms per item, eight items maximum, then stop.
5. **No auto-rotation, no idle camera drift, no scroll-jacking on a reading surface.** The Mind Map's four-second auto-rotate is the anti-pattern.
6. **No motion on text inside a transformed box.** If a heading turns, the text blurs; the kit avoids this by keeping reading layers flat.
7. **A drag that falls short settles back with a small paper overshoot** (`easeSettle` in `Codex.tsx`); a committed turn uses `--ease-page`. Do not use spring for a committed page.
8. **A turn can be interrupted.** A new turn commits the in-flight destination and starts from there; never queue turns behind stale motion.

### 6.3 Reduced motion

The global gate in `src/design/tokens.css` collapses every animation and transition to `0.01ms`, removes delays, forces one iteration and disables smooth scrolling. On top of that:

- `Codex` skips the cover and the leaf entirely, going straight to the destination spread.
- `CodexObject` cancels the pointer candle and removes `--candle-x/y`, returning the pool to `62% 22%`.
- `SheetReader` closes immediately instead of running the 280ms return.
- `LineagePlate` stops the branch draw and the medallion transitions.
- `.record-enter`, `.codex-mote`, `.codex-ribbon` and the reduced-motion CSS blocks in `index.css` opt out explicitly.

Any new component with a non-CSS animation (GSAP, rAF, Canvas) must call `usePrefersReducedMotion()` and jump to the end state. The global CSS gate cannot save a JavaScript timeline.

### 6.4 The one non-transform exception

The candle pool's centre is written as a CSS custom property and repaints a radial gradient as the pointer moves. It is not an animation and not a layout change, and it is disabled under reduced motion. Treat it as the only exception; do not generalize it into "animating paint is fine".

---

## 7. Accessibility

D-DIEG does not authorize an inaccessible archive. `REBUILD_PLAN.md` says it explicitly: a screen-reader user is entitled to a semantic tree and clear names. The form tells a story; the text does not become unintelligible.

### 7.1 Contrast

Every ratio in `tokens.css` was measured, not estimated. The paper set:

| Pair                                               | Ratio   | Requirement       |
| -------------------------------------------------- | ------- | ----------------- |
| `--text-on-page-primary` on `--surface-page`       | 14.87:1 | AA / AAA body     |
| `--text-on-page-secondary` on `--surface-page`     | 9.69:1  | AA / AAA body     |
| `--text-on-page-tertiary` on `--surface-page`      | 5.96:1  | AA body           |
| `--text-on-page-link` on `--surface-page`          | 6.10:1  | AA body           |
| `--text-on-page-accent` on `--surface-page`        | 5.12:1  | AA body           |
| `--border-interactive-on-page` on `--surface-page` | 3.62:1  | AA non-text (3:1) |
| `--codex-brass-ink` on `--codex-leather`           | 11.1:1  | AA body           |

Do not "age" the ink by lowering these values. Old paper is legible because the tokens were measured.

### 7.2 Focus

- Dark surfaces: `var(--focus-ring)` — 2px surface gap + 2px `#7cc4e8`, 9.82:1.
- Paper: `var(--focus-ring-on-page)` — 2px page gap + 2px `#1f5e86`, 6.10:1.
- Brass edges: `.codex-edge:focus-visible` uses `2px solid var(--codex-brass-ink)`.
- Never `outline: none` without a replacement. Never rely on hover alone.

### 7.3 Targets

`--target-min: 44px` is the WCAG 2.2 SC 2.5.8 floor. New work must meet it. Existing exceptions are in §9: `.codex-thumb` 38px, `.lineage-plate__control` 24px.

### 7.4 Keyboard

| Surface      | Keys                                                                                                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Codex        | `←` / `→` turn; `Home` / `End` first/last; `Esc` skips the cover; `Tab` reaches the fore-edge buttons and thumbs. `data-codex-interactive` opts a child out of page-turn arrows. |
| Page body    | `Tab` focuses the scroll region; arrows scroll it.                                                                                                                               |
| Sheet        | The whole sheet is one button; `Enter` / `Space` lifts it.                                                                                                                       |
| SheetReader  | `Esc` puts it back; `←` / `→` move between sheets; arrows scroll the body when it has overflow; focus is trapped inside; heading receives focus on arrival.                      |
| LineagePlate | Nodes are `role="button"`; `←` / `→` move within a generation, `Home` / `End` jump to its ends, `Enter` / `Space` open a record. The viewport is `data-codex-interactive`.       |
| Library      | `↑` / `↓` move between shelves; spines are buttons.                                                                                                                              |
| ThumbTabs    | Standard buttons with `aria-current="page"` on the active slip.                                                                                                                  |

### 7.5 Semantics and reading order

- Real headings, real lists, real `dl` for ledgers, real `<table>` with `<caption>` for the Diagram tally.
- `PageSurface` body is `role="region"` with an `aria-label` naming the side and header, and `tabIndex={0}` only when it scrolls.
- `Codex` announces `Spread N of M — Title` in a polite live region.
- Portraits beside a name are decorative (`alt=""`); `Monogram` carries the name as `role="img"`.
- Do not put headings or tables inside a button. Use the whole-sheet overlay button with an `aria-label`.
- Page turns must not steal focus from a control the reader is using.

---

## 8. Is this diegetic? Checklist

Run this before shipping any new screen or component. A "no" needs an argument, not a shrug.

**The object**

- [ ] Would this component still make sense on a site about another subject? If yes, stop.
- [ ] Is it made of one of the five materials: paper, leather, brass, wax/thread, ink?
- [ ] Does it have an edge (deckle, torn, worn), a fastener (tack, thread, ribbon, binding) and a shadow cast by the one candle?
- [ ] Does it sit on something (desk, wall, lectern, shelf) rather than float in a viewport?
- [ ] Is the dark only the room around it, not the surface of the page?

**The surface**

- [ ] Is the reading surface `--surface-page` or `--codex-page-block`, not `--surface-base`?
- [ ] Are corners 1–3px, not 8px and never `rounded-full`?
- [ ] Is there any glass, blur, frosted panel, pill, icon grid or KPI card? Remove it.
- [ ] Is there any pure white or pure black? Replace it with a token.
- [ ] Is there one candle, and only one?

**The type**

- [ ] Is long-form text EB Garamond, with Inter only for labels and JetBrains Mono only for numbers?
- [ ] Is marginalia in `--font-hand` at 16px or larger?
- [ ] Is anything below 12px? If it is new work, raise it.
- [ ] Is the measure at or below 68ch (52–62ch on a single leaf)?
- [ ] Is any reading text inside a transformed box? If yes, flatten it.

**The language**

- [ ] Does the label describe an action in the world ("Open record", "Put it back", "Lift the sheet") rather than a web action ("View profile", "Back", "Close modal")?
- [ ] Does an empty state read as a fact of the archive ("No record has been found") rather than "No results"?
- [ ] Does an error read as a damaged page rather than a 404?

**The contract**

- [ ] Does it meet AA contrast on its actual surface (4.5:1 text, 3:1 non-text)?
- [ ] Is focus visible with the correct ring for paper or dark?
- [ ] Are targets at least 44px, or is the exception documented?
- [ ] Is the whole path keyboard-operable, with `Esc` returning?
- [ ] Does it respect `prefers-reduced-motion`, including any JS/Canvas animation?
- [ ] Does it animate only `transform` and `opacity` (WebGL excepted)?
- [ ] Is every random-looking detail deterministic from an id (no `Math.random()` in render), so a place is the same place on return?

If the checklist passes but the thing still feels like a themed dashboard, trust the one-sentence test and start again.

---

## 9. Debt register — what not to copy

These are verified in the current tree. They are recorded so the next pass does not mistake an existing mistake for a pattern.

| Where                                                                           | Problem                                                                                                                                     | What to do                                                                                                                 |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/components/aharietiam/Scene.tsx`, `InfoMonolith.tsx`, `ControlsLegend.tsx` | `'Times New Roman'` instead of `--font-display`; 9–10px labels; `borderRadius: 10` book pills; GSAP timeline with no reduced-motion branch. | Restyle in place: EB Garamond, 12px floor, slips/stamps instead of pills, `usePrefersReducedMotion()` around the timeline. |
| `src/components/aharietiam/*`                                                   | `Math.random()` in stone texture, particles, Taln cracks and atmosphere.                                                                    | Deterministic hash per element, as `Sheet` and `PlanetForceGraph` already do.                                              |
| `src/pages/ChronologyPage.tsx`, `src/components/chronology/*`                   | `#0b0a0a` ground, `text-white`, `gray-*`, slate line, dark overlays.                                                                        | Replace with paper/ink; keep the horizontal structure.                                                                     |
| `src/components/mindmap/CosmereMindMap3D.tsx`                                   | `d3-force`, 800 random stars, auto-rotate, 8–11px labels, rounded-rect nodes.                                                               | Merge into Records as an engraved chart; do not port the force graph.                                                      |
| `src/components/about/Signature.tsx`                                            | 11px uppercase attribution, not a hand.                                                                                                     | Make it a written signature (hand font, ink) when About is restyled.                                                       |
| `src/pages/About.tsx`                                                           | Paper article without `PageSurface`; `text-nano` section labels.                                                                            | Put it on a leaf; raise labels to 12px.                                                                                    |
| `src/pages/HistoricalPage.tsx`                                                  | Heading plaque built from inline styles, not `.library-sign__plate`; 9–10px status.                                                         | Use the library plate class; raise status to 12px.                                                                         |
| `src/index.css` codex chrome                                                    | `.codex-page__running`, `.codex-page__folio`, `.codex-thumb`, `.record-stamp`, `.record-ledger dt` at 11px.                                 | Raise to 12px in a dedicated pass; do not add more 11px.                                                                   |
| `src/components/library/library.css`                                            | `.library-sign__author` at 10px.                                                                                                            | Raise to 12px.                                                                                                             |
| `src/components/celestial-charts/FieldNoteLayer.tsx`                            | 10–13px notes, `font-serif`, `Math.random()` shuffle and count.                                                                             | Use `--font-hand` at 16px+; deterministic pick per planet/visit.                                                           |
| `src/components/diagram/Sheet.tsx`                                              | `transition: filter` on the raised state.                                                                                                   | Move the shadow change to a pseudo-element opacity, or accept it as a documented exception.                                |
| `.codex-thumb`                                                                  | 38px targets.                                                                                                                               | Raise to 44px without widening the fore-edge rail beyond the page.                                                         |
| `.lineage-plate__control`                                                       | 24px targets.                                                                                                                               | Raise to 44px hit area with a visually smaller glyph.                                                                      |
| Aharietiam, Shadesmar, Chronology                                               | Unresolved reduced-motion behavior in Canvas/GSAP/animated SVG.                                                                             | Audit each and jump to the end state.                                                                                      |

No code in this document changes these. They are the work queue, not the kit.

---

## 10. Reference map

**Tokens and type**

- `src/design/tokens.css` — colour, type, spacing, layout, elevation, motion, focus, reduced-motion gate.
- `src/design/fonts.css` — EB Garamond, Inter, JetBrains Mono, Caveat.
- `src/index.css` — codex block (`.codex-*`), Records (`.record-*`), lineage (`.lineage-*`).

**Book and room**

- `src/components/codex/Codex.tsx` — engine.
- `src/components/codex/CodexObject.tsx` — desk, candle, dust.
- `src/components/codex/PageSurface.tsx` — leaf.
- `src/components/codex/Spread.tsx` — two leaves.
- `src/components/codex/PageBlock.tsx` — block, threads, depth.
- `src/components/codex/CodexCover.tsx` — leather, brass, glyph.
- `src/components/codex/ThumbTabs.tsx` — fore-edge index.

**Records**

- `src/components/records/RecordSpread.tsx` — plate, biography, `buildRecordSpread`.
- `src/components/records/LineagePlate.tsx` — fold-out chart.
- `src/components/records/RecordsCodex.tsx` — three-volume composition.

**Diagram**

- `src/components/diagram/Sheet.tsx` — pinned paper.
- `src/components/diagram/SheetReader.tsx` — lifted leaf.
- `src/components/diagram/Ledger.tsx` — ruled tally.
- `src/components/diagram/DiagramCanvas.tsx` — the wall.

**Library and charts**

- `src/components/library/CosmereLibrary.tsx` — the room.
- `src/components/library/Shelf.tsx` — one collection.
- `src/components/library/LibraryReader.tsx` — spine-to-codex journey.
- `src/components/celestial-charts/FieldNoteLayer.tsx` — Khriss/Nazh marginalia.

**Marks**

- `src/components/common/Monogram.tsx` — portrait fallback.
- `src/components/records/RecordSpread.tsx` — `PlanetSigil`, private `PortraitPlate`.
- `src/components/about/Signature.tsx` — attribution (not yet diegetic).

**Audit targets**

- `src/pages/ChronologyPage.tsx`
- `src/pages/MindMapPage.tsx`
- `src/pages/About.tsx`
- `src/pages/HistoricalPage.tsx`
- `src/components/aharietiam/Scene.tsx`
- `src/components/aharietiam/InfoMonolith.tsx`
- `src/components/aharietiam/ControlsLegend.tsx`

---

_End of kit. The next block is not started._
