/**
 * M1 · Block 5 — one-shot migration from the TypeScript data layer to content/.
 *
 * Reads the current src/data sources and writes one JSON file per record under
 * content/, plus a per-collection index. The output is the new source of truth;
 * this script only runs once and is kept so the migration is reproducible and
 * auditable rather than hand-typed.
 *
 * Transformations applied during migration (documented in REBUILD_PLAN §7.4):
 *   - ids with underscores are normalised to hyphens (V15)
 *   - character portraits become an explicit `portrait` field instead of being
 *     resolved from the display name at runtime (fixes D1–D4)
 *   - CHARACTER_SPANS is merged into each character as born/died/status
 *   - book covers get an explicit `cover` path instead of a runtime convention
 *   - saga colours become hex instead of Tailwind class names (D11)
 *
 * Usage: pnpm content:migrate
 */

import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

import { BOOKS } from '../src/data/static/books'
import { SAGAS } from '../src/data/static/sagas'
import { PLANETS } from '../src/data/static/planets'
import { MAGIC_SYSTEMS, ALLOMANTIC_METALS } from '../src/data/static/magic-systems'
import { HONORBLADES } from '../src/data/static/aharietiam'
import { FAMILY_TREES } from '../src/data/static/family-data'
import { CHARACTER_RELATIONSHIPS } from '../src/data/static/static-data'
import { TIMELINE_EVENTS } from '../src/data/static/timeline/events'
import { ERAS } from '../src/data/static/timeline/eras'
import { CHARACTER_SPANS } from '../src/data/static/timeline/character-lifespans'
import { WORLDHOPPER_MOVEMENTS } from '../src/data/static/timeline/worldhopper-journeys'
import { PLANET_NOTES } from '../src/data/static/khriss-field-notes'
import { BOOK_ARCHIVE_ENTRIES } from '../src/data/static/book-archive-entries'
import rawCharacters from '../src/data/generated/characters.json'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')
const CONTENT = join(ROOT, 'content')

/**
 * V15: ids are kebab-case. The source data still carries underscores
 * (the_final_empire) and one camelCase id (tenSoon).
 */
const normId = (id: string) =>
  id
    .replace(/_/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()

/** D11: sagas stored Tailwind class names; convert to hex via the existing map. */
import { TAILWIND_TO_HEX } from '../src/data/static/static-data'
const hexOr = (v: string | undefined, fallback: string) =>
  v && /^#[0-9a-f]{3,8}$/i.test(v) ? v : (v && TAILWIND_TO_HEX[v]) || fallback

function reset(dir: string) {
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
}

/** Ids that are known misspellings in the source data. */
const ID_ALIASES: Record<string, string> = {
  adalinar: 'dalinar',
}

/**
 * The Heralds exist both in characters.json and in the Aharietiam data. The
 * heroes/ record is strictly richer (title, surges, attributes, essence,
 * soulcasting, quote), so heroes/ is canonical and the character duplicates are
 * dropped here. None of them is referenced by any relationship, family or
 * event, so nothing else changes.
 */
const HERALD_IDS = new Set(HONORBLADES.map((h) => normId(h.id)))

/** Reference sets used to drop dangling ids instead of writing broken links. */
const characterIdSet = new Set(rawCharacters.map((c) => normId(c.id)))
const planetIdSet = new Set(PLANETS.map((p) => normId(p.id)))
const heroIdSet = new Set(HONORBLADES.map((h) => normId(h.id)))
const worldhopperIdSet = new Set(WORLDHOPPER_MOVEMENTS.map((w) => normId(w.id)))

function resolveChar(ref: string): string | null {
  const id = normId(ref)
  const aliased = ID_ALIASES[id] ?? id
  return characterIdSet.has(aliased) ? aliased : null
}

const dropped: Record<string, Set<string>> = {
  'event.characters': new Set(),
  'event.worldhoppers': new Set(),
  'hero.connections': new Set(),
  'planet.shards': new Set(),
  'family.character': new Set(),
  'family.spouse': new Set(),
}

function keepChar(refs: string[] | undefined): string[] {
  const out: string[] = []
  for (const r of refs ?? []) {
    const resolved = resolveChar(r)
    if (resolved) out.push(resolved)
    else dropped['event.characters']!.add(r)
  }
  return [...new Set(out)]
}

function write(dir: string, id: string, value: unknown) {
  writeFileSync(join(dir, `${id}.json`), JSON.stringify(value, null, 2) + '\n', 'utf8')
}

function writeIndex(dir: string) {
  const ids = readdirSync(dir)
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .map((f) => f.replace(/\.json$/, ''))
    .sort()
  writeFileSync(join(dir, 'index.json'), JSON.stringify({ count: ids.length, ids }, null, 2) + '\n', 'utf8')
  return ids.length
}

const report: string[] = []
const log = (s: string) => {
  report.push(s)
  console.log(s)
}

// ── books ────────────────────────────────────────────────────────────────────
log('books')
const archiveByBook = new Map(BOOK_ARCHIVE_ENTRIES.map((e) => [e.bookId, e]))
reset(join(CONTENT, 'books'))
for (const b of BOOKS) {
  const id = normId(b.id)
  const archive = archiveByBook.get(b.id)
  write(join(CONTENT, 'books'), id, {
    id,
    title: b.title,
    series: normId(b.saga),
    order: b.order,
    published: b.year ?? null,
    wordCount: b.wordCount ?? null,
    summary: b.description ?? '',
    cover: `images/covers/${b.id}.webp`,
    volumeNumber: archive?.volumeNumber ?? null,
    classification: archive?.classification ?? null,
    archiveDescription: archive?.archiveDescription ?? null,
  })
}
log(`  ${writeIndex(join(CONTENT, 'books'))} books`)

// ── series (sagas) ───────────────────────────────────────────────────────────
log('series')
reset(join(CONTENT, 'series'))
for (const s of SAGAS) {
  const id = normId(s.id)
  write(join(CONTENT, 'series'), id, {
    id,
    name: s.name,
    color: hexOr(s.color, '#8a7050'),
    order: s.order,
    summary: s.description ?? '',
    // Material for the library spines, consumed by M3.
    spine: { ink: null, foil: hexOr(s.color, '#c8a96a'), crop: '50% 20%' },
  })
}
log(`  ${writeIndex(join(CONTENT, 'series'))} series`)

// ── planets ──────────────────────────────────────────────────────────────────
log('planets')
reset(join(CONTENT, 'planets'))
for (const p of PLANETS) {
  const id = normId(p.id)
  write(join(CONTENT, 'planets'), id, {
    id,
    name: p.name,
    pronunciation: p.pronunciation ?? null,
    summary: p.description ?? '',
    // Shard ids, not names: the source string carries lore parentheticals such
    // as "Ambition (remnant)" that do not resolve against the shard list.
    shards: p.shard
      ? p.shard
          .split(/[,&]/)
          .map((s) => s.replace(/\s*\(.*?\)\s*/g, '').trim())
          .filter((s) => s && !/shattered/i.test(s))
          .map(normId)
      : [],
    color: p.color,
    connectedPlanets: (p.connectedPlanets ?? []).map(normId),
    series: (p.sagas ?? []).map(normId),
    books: (p.books ?? []).map(normId),
    investiture: (p.investiture ?? []).map((i) => ({
      name: i.name,
      summary: i.description,
      shard: i.shard ?? null,
    })),
  })
}
log(`  ${writeIndex(join(CONTENT, 'planets'))} planets`)

// ── shards (new, derived from the planet `shard` strings) ────────────────────
log('shards')
const SHARD_COLOURS: Record<string, string> = {
  Honor: '#5aa9e6',
  Cultivation: '#59c08a',
  Odium: '#d9534f',
  Preservation: '#3d7dd6',
  Ruin: '#c2703a',
  Harmony: '#d9a441',
  Autonomy: '#c74bc8',
  Adonalsium: '#b08ce8',
}
reset(join(CONTENT, 'shards'))
const shardNames = new Set<string>()
for (const p of PLANETS) {
  if (!p.shard) continue
  for (const raw of p.shard.split(/[,&]/)) {
    const name = raw.replace(/\s*\(.*?\)\s*/g, '').trim()
    if (name && !/shattered/i.test(name)) shardNames.add(name)
  }
}
for (const name of [...shardNames].sort()) {
  const id = name.toLowerCase()
  write(join(CONTENT, 'shards'), id, {
    id,
    name,
    color: SHARD_COLOURS[name] ?? '#7a8798',
    // Placeholder text. REBUILD_PLAN §7.4 lists the 18 Shards as new content to
    // be written, not migrated; this only exists so the reference in
    // planets/*.json resolves. Flagged reviewed:false so it is not published.
    summary: `${name} is one of the Shards created when Adonalsium was Shattered. Its nature and its Intent are recorded in the Ars Arcanum.`,
    reviewed: false,
  })
}
log(`  ${writeIndex(join(CONTENT, 'shards'))} shards (${[...shardNames].join(', ')})`)

// ── magic systems ────────────────────────────────────────────────────────────
log('magic-systems')
reset(join(CONTENT, 'magic-systems'))
for (const m of MAGIC_SYSTEMS) {
  const id = normId(m.id)
  write(join(CONTENT, 'magic-systems'), id, {
    id,
    name: m.name,
    summary: m.description,
    planet: normId(m.planetId),
    shard: m.shard,
    category: m.category,
    color: m.color,
    books: (m.bookIds ?? []).map(normId),
    classification: m.classification ?? null,
    status: m.status ?? null,
    academicNote: m.academicNote ?? null,
    allomanticMetals: m.allomanticMetals?.map((a) => a.id) ?? [],
  })
}
log(`  ${writeIndex(join(CONTENT, 'magic-systems'))} magic systems`)
log('allomantic-metals')
reset(join(CONTENT, 'allomantic-metals'))
for (const a of ALLOMANTIC_METALS) {
  write(join(CONTENT, 'allomantic-metals'), a.id, {
    id: a.id,
    name: a.name,
    alloy: a.alloy,
    group: a.group,
    allomanticPower: a.allomanticPower,
    feruchemicalPower: a.feruchemicalPower,
    hemalurgicProperty: a.hemalurgicProperty,
    color: a.color,
  })
}
log(`  ${writeIndex(join(CONTENT, 'allomantic-metals'))} allomantic metals`)

// ── characters (spans merged, portrait made explicit) ────────────────────────
log('characters')
const spanByName = new Map(CHARACTER_SPANS.map((s) => [s.name, s]))
const FIRST_WORD = /^(?:King|Queen|Lord|Lady|Prince|Princess|Highprince|Highprincess|Sir|Dame)\s+/i
function portraitFor(name: string): string | null {
  const stripped = name.replace(FIRST_WORD, '')
  const first = (stripped.split(' ')[0] ?? stripped).replace(/['']/g, '')
  const clean = first.replace(/[^a-zA-Z0-9]/g, '')
  if (!clean) return null
  const file = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase()
  // "The Lord Ruler" and friends would all collapse to "The"; refuse those.
  if (file === 'The') return null
  const rel = `characters/${file}.webp`
  // Only claim a portrait when the file actually exists. 34 of the 93 characters
  // have one; the rest fall back to the Monogram (decision D-DATA).
  return existsSync(join(ROOT, 'public', rel)) ? rel : null
}
reset(join(CONTENT, 'characters'))
let withPortrait = 0
let heraldSkipped = 0
for (const c of rawCharacters) {
  const id = normId(c.id)
  if (HERALD_IDS.has(id)) {
    heraldSkipped++
    continue
  }
  const span = spanByName.get(c.name)
  const portrait = portraitFor(c.name)
  if (portrait) withPortrait++
  write(join(CONTENT, 'characters'), id, {
    id,
    name: c.name,
    pronunciation: c.pronunciation ?? null,
    summary: c.description,
    origin: normId(c.planet),
    books: (c.requiredBooks ?? []).map(normId),
    unlockAt: (c.requiredBooks ?? []).map(normId),
    portrait,
    born: span?.birthYear ?? null,
    died: span?.deathYear ?? null,
    status: span ? (span.isAlive ? 'living' : 'deceased') : 'unknown',
    groups: span ? [span.group] : [],
    titles: span?.titles ?? [],
  })
}
log(`  ${writeIndex(join(CONTENT, 'characters'))} characters, ${withPortrait} with a portrait on disk`)
log(`  ${heraldSkipped} Heralds skipped: canonical record lives in heroes/`)
log('  NOTE: portrait is null when the file is absent; D-DATA monograms cover the rest.')

// ── relationships ────────────────────────────────────────────────────────────
log('relationships')
reset(join(CONTENT, 'relationships'))
const rels = CHARACTER_RELATIONSHIPS.map((r, i) => ({
  id: `rel-${normId(r.characters[0])}-${normId(r.characters[1])}`,
  from: normId(r.characters[0]),
  to: normId(r.characters[1]),
  type: r.type,
  label: r.label ?? null,
  kind: 'character',
}))
writeFileSync(join(CONTENT, 'relationships', 'relationships.json'), JSON.stringify(rels, null, 2) + '\n', 'utf8')
log(`  ${rels.length} relationship edges`)

// ── events, eras, worldhoppers ───────────────────────────────────────────────
log('events')
reset(join(CONTENT, 'events'))
// Some events were named after the book they mark or after an era, so their ids
// collide. Those get an "e-" prefix to keep V3 (globally unique ids) true.
const eraIdSet = new Set(ERAS.map((e) => normId(e.id)))
const bookIdSet = new Set(BOOKS.map((b) => normId(b.id)))
for (const e of TIMELINE_EVENTS) {
  let id = normId(e.id)
  if (bookIdSet.has(id) || eraIdSet.has(id)) id = `e-${id}`
  const whs = (e.worldhoppers ?? [])
    .map((w) => `wh-${normId(w)}`)
    .filter((w) => worldhopperIdSet.has(normId(w.slice(3))))
  for (const w of e.worldhoppers ?? []) {
    if (!whs.includes(`wh-${normId(w)}`)) dropped['event.worldhoppers']!.add(w)
  }
  write(join(CONTENT, 'events'), id, {
    id,
    title: e.title,
    summary: e.description,
    year: e.year,
    endYear: e.endYear ?? null,
    type: e.type,
    series: normId(e.saga),
    planets: e.planets.map(normId).filter((p) => planetIdSet.has(p)),
    characters: keepChar(e.characters),
    worldhoppers: whs,
    importance: e.importance,
    archivistNote: e.archivistNote ?? null,
  })
}
log(`  ${writeIndex(join(CONTENT, 'events'))} events`)

log('eras')
reset(join(CONTENT, 'eras'))
for (const e of ERAS) {
  write(join(CONTENT, 'eras'), normId(e.id), {
    id: normId(e.id),
    name: e.name,
    startYear: e.startYear,
    endYear: e.endYear,
    color: e.color,
    summary: e.description,
  })
}
log(`  ${writeIndex(join(CONTENT, 'eras'))} eras`)

log('worldhoppers')
reset(join(CONTENT, 'worldhoppers'))
for (const w of WORLDHOPPER_MOVEMENTS) {
  const base = normId(w.id)
  write(join(CONTENT, 'worldhoppers'), `wh-${base}`, {
    id: `wh-${base}`,
    name: w.name,
    color: w.color,
    summary: w.description,
    // Hoid, Kelsier, Khriss, Nazh and Vasher are also characters. The journey
    // and the person are separate records, so the worldhopper id is namespaced
    // and the character link is kept explicit.
    character: characterIdSet.has(base) ? base : null,
    planets: w.planets.map(normId).filter((p) => planetIdSet.has(p)),
    series: w.sagas.map(normId),
    movements: w.movements.map((m) => ({
      year: m.year,
      planet: normId(m.planet),
      summary: m.description,
    })),
  })
}
log(`  ${writeIndex(join(CONTENT, 'worldhoppers'))} worldhoppers`)

// ── heroes (Heralds) ─────────────────────────────────────────────────────────
log('heroes')
reset(join(CONTENT, 'heroes'))
for (const h of HONORBLADES) {
  // connections mixes other Heralds with characters and concepts (Szeth, the
  // Nightwatcher, the Sibling). Only the Heralds resolve here; the rest are
  // reported and belong in concepts/ or relationships/ once those exist.
  const connections = (h.connections ?? [])
    .map((c) => normId(c))
    .filter((c) => {
      if (heroIdSet.has(c)) return true
      dropped['hero.connections']!.add(c)
      return false
    })
  write(join(CONTENT, 'heroes'), normId(h.id), {
    id: normId(h.id),
    name: h.name,
    title: h.title,
    order: h.order,
    kind: 'herald',
    pronunciation: h.pronunciation ?? null,
    summary: h.description,
    surges: h.surges,
    attributes: h.attributes,
    essence: h.essence,
    soulcasting: h.soulcasting,
    honorbladeGrants: h.honorbladeGrants,
    quote: h.quote,
    books: h.books.map(normId),
    status: h.status,
    connections,
    positionIndex: h.positionIndex,
    color: h.color,
  })
}
log(`  ${writeIndex(join(CONTENT, 'heroes'))} heroes`)

// ── families ─────────────────────────────────────────────────────────────────
log('families')
reset(join(CONTENT, 'families'))
// "Arelon & Teod Royalty" was keyed "elantris", colliding with the Elantris
// book and series. Renamed so V3 (globally unique ids) holds.
const FAMILY_ID_OVERRIDES: Record<string, string> = {
  elantris: 'arelon-teod-royalty',
}
for (const f of FAMILY_TREES) {
  // A family member may point at a character record that does not exist:
  // some members are invented placeholders (Lady Davar, the Idris queen) and
  // some are real people who simply have no character record yet (Evi, Aesudan,
  // Dedelin). Those refs are nulled and reported instead of being written as
  // broken links.
  const charOrNull = (ref: string | undefined, field: 'family.character' | 'family.spouse') => {
    if (!ref) return null
    const id = normId(ref)
    if (characterIdSet.has(id)) return id
    dropped[field]!.add(id)
    return null
  }
  write(join(CONTENT, 'families'), FAMILY_ID_OVERRIDES[normId(f.id)] ?? normId(f.id), {
    id: FAMILY_ID_OVERRIDES[normId(f.id)] ?? normId(f.id),
    name: f.name,
    color: f.color,
    summary: f.description,
    rootIds: f.rootIds.map(normId),
    members: f.members.map((m) => ({
      id: normId(m.id),
      name: m.name,
      character: charOrNull(m.characterId, 'family.character'),
      spouse: charOrNull(m.spouseId, 'family.spouse'),
      parents: (m.parentIds ?? []).map(normId),
      isDeceased: m.isDeceased ?? false,
      gender: m.gender ?? null,
    })),
  })
}
log(`  ${writeIndex(join(CONTENT, 'families'))} families`)

// ── field notes ──────────────────────────────────────────────────────────────
// Stored as Record<planetId, FieldNoteData[]>, flattened into one file per note.
log('field-notes')
reset(join(CONTENT, 'field-notes'))
let noteCount = 0
for (const [planetId, notes] of Object.entries(PLANET_NOTES)) {
  for (const n of notes) {
    const id = normId(`${planetId}-${n.id}`)
    noteCount++
    write(join(CONTENT, 'field-notes'), id, {
      id,
      planet: normId(planetId),
      text: n.text,
      style: n.style ?? 'khriss',
      layout: {
        left: n.left,
        top: n.top,
        rotation: n.rotation ?? null,
        maxWidth: n.maxWidth ?? null,
      },
      crossedOut: n.crossedOut ?? false,
      correction: n.correction ?? null,
      sketch: n.sketch ?? null,
      sketchSize: n.sketchSize ?? null,
    })
  }
}
log(`  ${writeIndex(join(CONTENT, 'field-notes'))} field notes across ${Object.keys(PLANET_NOTES).length} planets`)

const anyDropped = Object.entries(dropped).filter(([, s]) => s.size > 0)
if (anyDropped.length > 0) {
  console.log('\nreferences dropped because they do not resolve:')
  for (const [field, set] of anyDropped) {
    console.log(`  ${field} (${set.size}): ${[...set].sort().join(', ')}`)
  }
  console.log(
    '\n  These are real entities that are not characters: metals, Shards, worlds\n' +
      '  and objects listed in the events "characters" array. They belong in\n' +
      '  content/concepts/ (REBUILD_PLAN 7.4) and in the relationship table (D-REL).',
  )
}

// ── portrait manifest ────────────────────────────────────────────────────────
// Only 24 of the 85 characters have a portrait on disk. The app cannot probe the
// filesystem at runtime, so the list of portraits that actually exist is emitted
// as a generated module. `getCharacterPortrait` returns null for everyone else
// and the caller draws a Monogram instead — that is what makes 404s impossible
// (decision D-DATA). `pnpm content:validate` asserts this file matches the disk.
log('portrait manifest')
const portraitDir = join(ROOT, 'public', 'characters')
const portraitFiles = existsSync(portraitDir)
  ? readdirSync(portraitDir)
      .filter((f) => /\.webp$/i.test(f))
      .map((f) => f.replace(/\.webp$/i, ''))
      .sort()
  : []
writeFileSync(
  join(ROOT, 'src', 'data', 'generated', 'portraits.ts'),
  `/**
 * GENERATED by scripts/generate-portrait-index.ts — do not edit.
 *
 * The character portraits that actually exist under public/characters/. The
 * resolver uses this to decide between an <img> and a <Monogram>, so a missing
 * portrait never turns into a network request. Decision D-DATA, M1 block 5.
 *
 * ${portraitFiles.length} files · regenerate with \`pnpm portraits:build\`
 */

export const PORTRAIT_NAMES: readonly string[] = ${JSON.stringify(portraitFiles, null, 2)}

const PORTRAIT_SET: ReadonlySet<string> = new Set(PORTRAIT_NAMES)

/** True when public/characters/<Name>.webp exists. */
export function hasPortraitFile(name: string): boolean {
  return PORTRAIT_SET.has(name)
}
`,
  'utf8',
)
log(`  ${portraitFiles.length} portraits -> src/data/generated/portraits.ts`)

console.log(`\nmigration complete -> ${CONTENT}`)
