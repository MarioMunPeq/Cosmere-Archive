/**
 * Generate the timeline collections from `content/`.
 *
 * Events and worldhoppers are the two largest collections in the archive and
 * both are pure renames, which the field-by-field comparison established before
 * anything was written: 118 events on each side with identical values, and five
 * worldhoppers with identical movements.
 *
 * ## The renames
 *
 *   content/            runtime
 *   `summary`           `description`   — events, worldhoppers, movements
 *   `series` (string)   `saga`          — events
 *   `series` (string[]) `sagas`         — worldhoppers
 *
 * ## The two things that are not renames
 *
 *   **The worldhopper id.** `content/` prefixes them `wh-hoid`; the runtime
 *   has always used `hoid`. Nothing outside this module reads the id —
 *   `AtlasPageContent.tsx` filters on `movements[].planet` — but the runtime
 *   spelling is what any DOM key or link has always used, so the prefix is
 *   stripped rather than propagated. The function below is the one place that
 *   decision is written down.
 *
 *   **`character`.** Present in `content/` and absent from the runtime type. It
 *   is the join back to `content/characters/`, so it is carried through rather
 *   than dropped: it is the field that makes a worldhopper record resolvable to
 *   a person, and losing it would mean the id was the only link.
 *
 * ## `null` versus absent
 *
 * `content/` writes `null` for "no value"; the runtime types say `undefined`.
 * Optional fields are therefore **omitted** rather than emitted as null, because
 * `endYear: null` sorts differently from `endYear: undefined` and a timeline
 * that groups nulls with absent years is a timeline with a phantom group.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CONTENT = join(process.cwd(), 'content')
const OUT = join(process.cwd(), 'src', 'data', 'generated')

function readDir(name: string): Record<string, any>[] {
  return readdirSync(join(CONTENT, name))
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .map((f) => JSON.parse(readFileSync(join(CONTENT, name, f), 'utf8')) as Record<string, any>)
}

function write(name: string, value: unknown) {
  writeFileSync(join(OUT, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

/** Omit rather than emit null: see the note at the top of this file. */
function optional<T>(value: T | null | undefined): T | undefined {
  return value === null || value === undefined || (Array.isArray(value) && value.length === 0) ? undefined : value
}

const problems: string[] = []

/* ----------------------------------------------------------------- events */

const events = readDir('events')
  .map((e) => ({
    id: e.id,
    title: e.title,
    description: e.summary,
    year: e.year,
    endYear: optional(e.endYear),
    type: e.type,
    saga: e.series,
    planets: e.planets,
    characters: optional(e.characters),
    worldhoppers: optional(e.worldhoppers),
    importance: e.importance,
    archivistNote: optional(e.archivistNote),
  }))
  // Chronological, then by id: two events in the same year must not swap places
  // between a rebuild and the next one.
  .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id))
write('events', events)

/* ------------------------------------------------------------ worldhoppers */

/** `wh-hoid` is the content id; `hoid` is the one the site has always used. */
function toRuntimeWorldhopperId(id: string): string {
  return id.startsWith('wh-') ? id.slice(3) : id
}

const worldhoppers = readDir('worldhoppers')
  .map((w) => ({
    id: toRuntimeWorldhopperId(w.id),
    name: w.name,
    color: w.color,
    description: w.summary,
    character: w.character ?? null,
    planets: w.planets,
    sagas: w.series,
    movements: (w.movements ?? []).map((m: Record<string, any>) => ({
      year: m.year,
      planet: m.planet,
      description: m.summary,
    })),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en'))
write('worldhoppers', worldhoppers)

/* ------------------------------------------------------------- self-checks */

/*
 * `eraIds` and `seriesIds` are both loaded, and only one of them is checked
 * against `event.saga` — because `saga` holds a **series**.
 *
 * That is not a typo in the check, it is the naming problem this whole exercise
 * exists to unwind: `content/series/*.json` is the collection, the runtime field
 * is called `saga`, and `content/eras/*.json` is a *different* taxonomy of
 * eleven periods. The first version of this check validated events against eras
 * and reported a hundred broken references, which is what a reader would see if
 * the two were ever confused in earnest.
 *
 * Eras are not referenced by events at all, so they are loaded for the report
 * and checked for their own sake.
 */
const eraIds = new Set((JSON.parse(readFileSync(join(OUT, 'eras.json'), 'utf8')) as { id: string }[]).map((e) => e.id))
const seriesIds = new Set(
  (JSON.parse(readFileSync(join(OUT, 'series.json'), 'utf8')) as { id: string }[]).map((s) => s.id),
)
if (eraIds.size === 0) problems.push('no eras were generated')
const planetIds = new Set(readDir('planets').map((p) => p.id))
const characterIds = new Set(
  (JSON.parse(readFileSync(join(process.cwd(), 'src/data/generated/characters.json'), 'utf8')) as { id: string }[]).map(
    (c) => c.id,
  ),
)

const duplicateEventIds = events.map((e) => e.id).filter((id, i, all) => all.indexOf(id) !== i)
for (const id of duplicateEventIds) problems.push(`duplicate event id "${id}"`)

for (const e of events) {
  if (!e.title.trim()) problems.push(`event "${e.id}" has no title`)
  if (!e.description?.trim()) problems.push(`event "${e.id}" has no summary`)
  if (e.endYear !== undefined && e.endYear < e.year) problems.push(`event "${e.id}" ends before it starts`)
  if (!seriesIds.has(e.saga)) problems.push(`event "${e.id}" is in series "${e.saga}", which does not exist`)
  if (e.importance < 1 || e.importance > 5) problems.push(`event "${e.id}" has importance ${e.importance}`)
  for (const p of e.planets) if (!planetIds.has(p)) problems.push(`event "${e.id}" names planet "${p}"`)
  for (const c of e.characters ?? []) if (!characterIds.has(c)) problems.push(`event "${e.id}" names character "${c}"`)
}

const whIds = new Set(worldhoppers.map((w) => w.id))
if (whIds.size !== worldhoppers.length) problems.push('duplicate worldhopper ids')

for (const w of worldhoppers) {
  if (!w.description?.trim()) problems.push(`worldhopper "${w.id}" has no summary`)
  for (const p of w.planets) if (!planetIds.has(p)) problems.push(`worldhopper "${w.id}" names planet "${p}"`)
  for (const s of w.sagas) if (!seriesIds.has(s)) problems.push(`worldhopper "${w.id}" names series "${s}"`)
  for (const m of w.movements) {
    if (!planetIds.has(m.planet)) problems.push(`worldhopper "${w.id}" moves to "${m.planet}"`)
  }
  // Chronology is the whole point of a journey.
  const years = w.movements.map((m) => m.year)
  const sorted = [...years].sort((a, b) => a - b)
  if (years.join(',') !== sorted.join(',')) problems.push(`worldhopper "${w.id}" movements are out of order`)
}

/* -------------------------------------------------------------------- write */

if (problems.length > 0) {
  console.error(`\n  ! ${problems.length} problems in the generated timeline:\n`)
  for (const p of problems.slice(0, 40)) console.error(`      ${p}`)
  if (problems.length > 40) console.error(`      ... and ${problems.length - 40} more`)
  console.error('')
  process.exit(1)
}

const movements = worldhoppers.reduce((a, w) => a + w.movements.length, 0)
console.log(
  `\n  events ${events.length} (${events.filter((e) => e.characters?.length).length} name characters) · ` +
    `worldhoppers ${worldhoppers.length} with ${movements} movements\n`,
)
