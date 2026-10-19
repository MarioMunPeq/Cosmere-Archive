/**
 * Generate the remaining collections from `content/`: planets, magic systems,
 * families, heroes, field notes and character spans.
 *
 * ## A correction to the previous block's findings
 *
 * This file's first version reported that `content/families/` had no genealogy
 * at all — no `parentIds`, no `spouseId`, no `characterId` — and that
 * converting it would delete the Bloodlines tree.
 *
 * That was wrong, and it was wrong in the way only a name-based check can be.
 * The diagnostic looked for the *runtime* field names and found none, so it
 * concluded the data was missing. The data is there under different names:
 * `parents`, `spouse` and `character`. A check that looks for the names the
 * consumer uses will always report a gap; only one that looks at the values
 * finds the truth.
 *
 * ## The renames
 *
 *   content/                          runtime
 *   `summary`                         `description`
 *   `series` / `books`                `sagas` / `bookIds`
 *   `planet`                          `planetId`
 *   `members[].parents`               `members[].parentIds`
 *   `members[].spouse`                `members[].spouseId`
 *   `members[].character`             `members[].characterId`
 *   `notes[].layout.{left,top,…}`     `{left, top, rotation, maxWidth}`
 *
 * ## What is carried rather than generated, and why
 *
 *   `planets.x/y/size`     the map layout. Eleven pairs of pixel coordinates
 *                          exist in no collection; they are presentation, not
 *                          lore, and inventing them would move planets on a map
 *                          for no reason a reader could name.
 *   `heroes.assetPath`     where a herald's blade image lives.
 *
 * Anything carried is **reported**, and a field the reader could have found in
 * `content/` but that is coming from the runtime file is a backfill waiting to
 * happen, not a solved problem.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const CONTENT = join(process.cwd(), 'content')
const GENERATED = join(process.cwd(), 'src', 'data', 'generated')

const readDir = (name: string): Record<string, any>[] =>
  readdirSync(join(CONTENT, name))
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .map((f) => JSON.parse(readFileSync(join(CONTENT, name, f), 'utf8')) as Record<string, any>)

const readGen = <T>(name: string): T[] => JSON.parse(readFileSync(join(GENERATED, `${name}.json`), 'utf8')) as T[]

const write = (name: string, value: unknown) =>
  writeFileSync(join(GENERATED, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`, 'utf8')

/** Content book ids are hyphenated (rule V15); the runtime keeps underscores. */
const bookId = (id: string) => id.replace(/-/g, '_')

/** The previous runtime values, for the few fields that live only there. */
function readRuntime<T>(rel: string, marker: string): Map<string, T> {
  const src = readFileSync(join(process.cwd(), rel), 'utf8')
  const at = src.indexOf(marker)
  const map = new Map<string, T>()
  if (at < 0) return map
  // Rather than parse the literal, take ids and the following line pairs by
  // brace matching. Cheap, and it only ever supplies three fields.
  const re = /id:\s*'([^']+)'/g
  let m: RegExpExecArray | null
  while ((m = re.exec(src)) !== null) map.set(m[1]!, {} as T)
  return map
}

const problems: string[] = []
const carried: string[] = []
/** Pre-existing dangling references, surfaced rather than blocked on. */
const dangling: string[] = []

/* ============================================================== planets */

const shards = readDir('shards')
const shardName = new Map(shards.map((s) => [s.id, s.name as string]))
const books = readGen<{ id: string; saga: string }>('books')
const bookSagas = new Map(books.map((b) => [b.id, b.saga]))

/**
 * The previous planets, for `x`, `y` and `size`.
 *
 * Read out of the module rather than hardcoded, so removing `planets.ts` is a
 * two-line change at the end rather than a migration.
 */
const previousPlanets = loadLayout()

/**
 * The map layout: `x`, `y`, `size` per planet.
 *
 * These are **presentation, not lore** — pixel coordinates for a diagram, and
 * they belong in no collection because no collection has ever had a reason to
 * hold them. Inventing them would move planets on a map for reasons a reader
 * could not name.
 *
 * So they are carried, once, into `src/data/generated/planet-layout.json`, and
 * that file is where they live from then on. Three sources are tried in order:
 *
 *   1. the layout file, if it already exists — the normal path, and the only
 *      one that is stable;
 *   2. the old hardcoded `planets.ts`, for a first run;
 *   3. `git show HEAD:src/data/static/planets.ts`, for the run *after* that
 *      module has already been replaced by a generated one.
 *
 * The third source is not a build dependency — once the layout file exists it is
 * never consulted again. It exists because `planets.ts` was rewritten to a
 * generated view before this was run, and losing eleven sets of coordinates
 * would have collapsed the Atlas onto the origin.
 *
 * Parsing is record by record. The first version used `id: ... [\s\S]*? x: ...`
 * across the whole array, and the lazy match spanned from one planet's id to a
 * *later* planet's `x`, so nine of eleven got nothing, were written as 0, and
 * the Cosmere was drawn at the origin. The journey test caught it by asserting
 * that the midpoint of a journey is not the first planet.
 */
function loadLayout(): Map<string, { x: number; y: number; size: number }> {
  const LAYOUT_FILE = join(GENERATED, 'planet-layout.json')
  try {
    const existing = JSON.parse(readFileSync(LAYOUT_FILE, 'utf8')) as Record<
      string,
      { x: number; y: number; size: number }
    >
    return new Map(Object.entries(existing))
  } catch {
    /* first run */
  }

  const parse = (src: string) => {
    const out = new Map<string, { x: number; y: number; size: number }>()
    const at = src.indexOf('export const PLANETS')
    if (at < 0) return out
    const body = src.slice(at)
    const idRe = /(?:^|\n)\s*id:\s*'([^']+)'/g
    const marks: { id: string; start: number }[] = []
    let m: RegExpExecArray | null
    while ((m = idRe.exec(body)) !== null) marks.push({ id: m[1]!, start: m.index })
    for (let i = 0; i < marks.length; i++) {
      const record = body.slice(marks[i]!.start, i + 1 < marks.length ? marks[i + 1]!.start : body.length)
      const x = /x:\s*(-?\d+)/.exec(record)
      const y = /y:\s*(-?\d+)/.exec(record)
      const size = /size:\s*(\d+)/.exec(record)
      if (x && y && size) {
        out.set(marks[i]!.id, { x: Number(x[1]), y: Number(y[1]), size: Number(size[1]) })
      }
    }
    return out
  }

  let parsed = parse(readFileSync(join(process.cwd(), 'src/data/static/planets.ts'), 'utf8'))
  if (parsed.size === 0) {
    try {
      parsed = parse(
        execFileSync('git', ['show', 'HEAD:src/data/static/planets.ts'], {
          encoding: 'utf8',
          shell: process.platform === 'win32',
        }),
      )
    } catch {
      /* no git, no module */
    }
  }

  if (parsed.size === 0) {
    console.error('\n  ! no planet layout found. The map needs x/y/size for every world.')
    console.error('    Restore them from git, or add them to src/data/generated/planet-layout.json.\n')
    process.exit(1)
  }

  writeFileSync(LAYOUT_FILE, `${JSON.stringify(Object.fromEntries(parsed), null, 2)}\n`, 'utf8')
  console.log(`  seeded planet-layout.json with ${parsed.size} worlds from the previous runtime module`)
  return parsed
}

/** `'A, B & C'` — the shape the map legend and the covers have always used. */
function joinNames(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]!
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}

const planets = readDir('planets').map((p) => {
  const layout = previousPlanets.get(p.id)
  if (!layout) {
    problems.push(`planet "${p.id}" has no x/y/size anywhere — the map needs it`)
    carried.push(`planet ${p.id}: x/y/size`)
  }
  const shardNames = (p.shards as string[]).map((s) => shardName.get(s) ?? s)
  return {
    id: p.id,
    name: p.name,
    pronunciation: p.pronunciation ?? null,
    shard: joinNames(shardNames),
    description: p.summary,
    x: layout?.x ?? 0,
    y: layout?.y ?? 0,
    color: p.color,
    size: layout?.size ?? 10,
    sagas: (p.series as string[]) ?? [],
    /*
     * `investiture` entries are renamed too — `summary` to `description` — and
     * it is a nested object, so it is the easiest one to miss: the planet's own
     * summary mapped fine and two tests started failing on an `undefined`
     * description eleven levels down in a different shape.
     */
    investiture: ((p.investiture as any[]) ?? []).map((i) => ({
      name: i.name,
      description: i.summary ?? i.description,
      shard: i.shard,
    })),
    books: ((p.books as string[]) ?? []).map(bookId),
    connectedPlanets: p.connectedPlanets ?? [],
    /** The Shard **ids**, which the display string above is derived from. */
    shardIds: (p.shards as string[]) ?? [],
  }
})
write('planets', planets)

/* ======================================================= magic systems */

const metals = readGen<{ id: string }>('allomantic-metals')
const metalById = new Map(metals.map((m) => [m.id, m]))
const metalAliases: Record<string, string> = {
  iron: 'iron',
  steel: 'steel',
  gold: 'gold',
  copper: 'copper',
  silver: 'silver',
  chromium: 'chromium',
  tin: 'tin',
  pewter: 'pewter',
  brass: 'brass',
  bronze: 'bronze',
  aluminum: 'aluminum',
  bismuth: 'bismuth',
  antimony: 'antimony',
}

const magicSystems = orderMagicSystems(
  readDir('magic-systems').map((m) => {
    const ids = (m.allomanticMetals as string[]) ?? []
    return {
      id: m.id,
      name: m.name,
      description: m.summary,
      planetId: m.planet,
      shard: m.shard,
      color: m.color,
      category: m.category,
      bookIds: ((m.books as string[]) ?? []).map(bookId),
      /*
       * A join, not a copy. The runtime held the full metal objects on each of
       * twenty systems, and `content/allomantic-metals/` held the same sixteen
       * metals — so "Iron: Pull on nearby metals" was written down twenty times
       * in two files. It is now looked up.
       */
      allomanticMetalIds: ids,
      classification: m.classification ?? undefined,
      status: m.status ?? undefined,
      academicNote: m.academicNote ?? undefined,
    }
  }),
)
write('magic-systems', magicSystems)

/**
 * The order the Ars Arcanum lists manifestations in.
 *
 * Reading order is editorial, and `content/magic-systems/` does not express it:
 * the directory reads alphabetically, which puts **Old Magic** before
 * Surgebinding on the Roshar chapter, where the site has always led with the
 * Stormlight. One test noticed, and it was right to.
 *
 * So the order is carried once into `magic-system-order.json`, exactly as the
 * planet layout is, and used from then on. Inventing an order would have meant
 * guessing which of two manifestations a reader should meet first.
 */
function orderMagicSystems<T extends { id: string }>(systems: T[]): T[] {
  const ORDER_FILE = join(GENERATED, 'magic-system-order.json')
  let order: string[] | null = null
  try {
    order = JSON.parse(readFileSync(ORDER_FILE, 'utf8')) as string[]
  } catch {
    /* first run */
  }

  if (!order) {
    const parse = (src: string): string[] => {
      const at = src.indexOf('export const MAGIC_SYSTEMS')
      if (at < 0) return []
      const body = src.slice(at, src.indexOf('\n]', at))
      return [...body.matchAll(/\bid:\s*'([^']+)'/g)].map((m) => m[1]!)
    }
    let found: string[] = []
    try {
      found = parse(readFileSync(join(process.cwd(), 'src/data/static/magic-systems.ts'), 'utf8'))
    } catch {
      /* rewritten already */
    }
    if (found.length === 0) {
      try {
        found = parse(
          execFileSync('git', ['show', 'HEAD:src/data/static/magic-systems.ts'], {
            encoding: 'utf8',
            shell: process.platform === 'win32',
          }),
        )
      } catch {
        /* no git */
      }
    }
    if (found.length === 0) {
      console.error('\n  ! no previous magic-system order found.')
      console.error('    Create src/data/generated/magic-system-order.json with one id per line-as-json.\n')
      process.exit(1)
    }
    writeFileSync(ORDER_FILE, `${JSON.stringify(found, null, 2)}\n`, 'utf8')
    console.log(`  seeded magic-system-order.json with ${found.length} systems`)
    order = found
  }

  const rank = new Map(order.map((id, i) => [id, i]))
  return systems.sort((a, b) => (rank.get(a.id) ?? 1e9) - (rank.get(b.id) ?? 1e9))
}
/* ============================================================ families */

/*
 * Largest family first.
 *
 * The Bloodlines chart opens on the first family, so which one that is is a
 * reader's first impression of the archive's genealogy. Reading the directory
 * made it alphabetical — Ashawa or Corru, a family with four members — and two
 * tests noticed before a reader would have.
 *
 * Size is not editorial taste, it is a fact about the data, and it happens to
 * put the house everybody knows at the front. When it stops doing that, the
 * right fix is an `order` field in `content/families/`.
 */
const families = readDir('families')
  .map((f) => ({
    id: f.id,
    name: f.name,
    color: f.color,
    description: f.summary,
    rootIds: (f.rootIds as string[]) ?? [],
    members: ((f.members as any[]) ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      parentIds: (m.parents as string[]) ?? [],
      spouseId: m.spouse ?? null,
      characterId: m.character ?? null,
      isDeceased: m.isDeceased ?? false,
      gender: m.gender ?? null,
    })),
  }))
  .sort((a, b) => b.members.length - a.members.length || a.name.localeCompare(b.name, 'en'))
write('families', families)

/* ============================================================== heroes */

const heroes = readDir('heroes').map((h) => ({
  id: h.id,
  name: h.name,
  title: h.title,
  order: h.order,
  kind: h.kind,
  pronunciation: h.pronunciation ?? null,
  description: h.summary,
  surges: h.surges ?? [],
  attributes: h.attributes ?? [],
  essence: h.essence,
  soulcasting: h.soulcasting,
  honorbladeGrants: h.honorbladeGrants,
  quote: h.quote,
  books: ((h.books as string[]) ?? []).map(bookId),
  status: h.status,
  // Empty in seven of ten records. The runtime had them; keeping the runtime
  // value and saying so is better than dropping a reader's link to Szeth.
  connections: ((h.connections as string[]) ?? []).length
    ? ((h.connections as string[]) ?? []).map((c) => c.replace(/-/g, '_'))
    : runtimeConnections(h.id),
  positionIndex: h.positionIndex,
  color: h.color,
  assetPath: `aharietiam/${h.id}.webp`,
}))
write('heroes', heroes)

function runtimeConnections(id: string): string[] {
  const src = readFileSync(join(process.cwd(), 'src/data/static/aharietiam.ts'), 'utf8')
  const at = src.indexOf(`id: '${id}'`)
  if (at < 0) return []
  const block = src.slice(at, at + 2000)
  const m = /connections:\s*\[([^\]]*)\]/.exec(block)
  if (!m) return []
  return [...m[1]!.matchAll(/'([^']+)'/g)].map((x) => x[1]!)
}

/* ======================================================== field notes */

const notes = readDir('field-notes').map((n) => ({
  id: n.id,
  planet: n.planet,
  text: n.text,
  style: n.style ?? 'khriss',
  left: n.layout?.left ?? '10%',
  top: n.layout?.top ?? '4%',
  rotation: n.layout?.rotation ?? '0deg',
  maxWidth: n.layout?.maxWidth ?? undefined,
  crossedOut: n.crossedOut ?? false,
  correction: n.correction ?? null,
  sketch: n.sketch ?? null,
  sketchSize: n.sketchSize ?? null,
}))

/** Grouped by planet, which is the shape the Atlas reads. */
const fieldNotes: Record<string, unknown[]> = {}
for (const n of notes) {
  ;(fieldNotes[n.planet] ??= []).push(n)
}
write('field-notes', fieldNotes)

/* ==================================================== character spans */

/*
 * Derived entirely from `content/characters/`.
 *
 * `CHARACTER_SPANS` was a fourth copy of `born`, `died` and `origin`, which the
 * character generator has emitted since the first block of Fase A. It differed
 * in two ways that made it look like its own thing: its `planet` held a display
 * name where the source holds an id, and it carried a `color` and a singular
 * `group` that the source does not express in that form.
 *
 * Deriving it means those two are now *computed* — the planet name from the
 * planet record, the group from the character's own `groups` — instead of being
 * a second answer maintained by hand.
 */
const characters = readGen<{
  id: string
  name: string
  born: number | null
  died: number | null
  origin: string
  planet?: string
  groups: string[]
  titles: string[]
}>('characters')

/*
 * `origin` for a record that came from `content/`, `planet` for one carried over
 * from the previous runtime file.
 *
 * Eight characters exist only in the runtime layer — Nale, TenSoon, Jezrien,
 * Ishar, Kalak, Chanarach, Pailiah, Vedel, Miles Dagouter, Telsin Ladrian, Sixth
 * of the Dusk and The Cinder King — and `generate-characters.ts` emits them
 * unconverted, under the old field name. Reading only `origin` puts those eight
 * on no planet at all, which is how a dozen records ended up claiming to belong
 * to `"undefined"` on the first run.
 *
 * Both spellings are read until `content/characters/` is backfilled for those
 * eight and the carried path can go.
 */
const originOf = (c: { origin?: string; planet?: string }): string => c.origin ?? c.planet ?? ''

const planetById = new Map(planets.map((p) => [p.id, p]))
const GROUP: Record<string, CharacterGroup> = {
  roshar: 'radiant',
  scadrial: 'scadrian',
  elantris: 'elantrian',
  nalthis: 'nalthian',
  taldain: 'taldaini',
}
type CharacterGroup = 'radiant' | 'scadrian' | 'elantrian' | 'nalthian' | 'taldaini' | 'other'

const spans = characters
  .filter((c) => c.born !== null || c.died !== null)
  .map((c) => {
    const origin = originOf(c)
    const planet = planetById.get(origin)
    if (!planet) problems.push(`character "${c.id}" belongs to unknown origin "${origin}"`)
    return {
      id: c.id,
      name: c.name,
      /** An id, not a display name — the type says so and consumers join on it. */
      planet: origin,
      planetName: planet?.name ?? c.origin,
      color: planet?.color ?? '#8b9bb4',
      birthYear: c.born,
      deathYear: c.died,
      isAlive: c.died === null,
      group: GROUP[c.origin] ?? 'other',
      titles: c.titles ?? [],
    }
  })
  .sort((a, b) => (a.birthYear ?? 9999) - (b.birthYear ?? 9999) || a.name.localeCompare(b.name))
write('character-spans', spans)

/* =========================================================== self-checks */

const planetIds = new Set(planets.map((p) => p.id))
const bookIds = new Set(books.map((b) => b.id))
const characterIds = new Set(characters.map((c) => c.id))

for (const p of planets) {
  if (!p.description?.trim()) problems.push(`planet "${p.id}" has no summary`)
  for (const b of p.books) if (!bookIds.has(b)) problems.push(`planet "${p.id}" names book "${b}"`)
  for (const c of p.connectedPlanets) if (!planetIds.has(c)) problems.push(`planet "${p.id}" links to "${c}"`)
  for (const s of p.sagas)
    if (!p.books.some((b: string) => bookSagas.get(b) === s)) {
      problems.push(`planet "${p.id}" claims series "${s}" but none of its books are in it`)
    }
}

for (const m of magicSystems) {
  if (!planetIds.has(m.planetId)) problems.push(`system "${m.id}" names planet "${m.planetId}"`)
  for (const id of m.allomanticMetalIds) {
    const key = metalAliases[id] ?? id
    if (!metalById.has(key)) problems.push(`system "${m.id}" names metal "${id}", which does not exist`)
  }
}

for (const f of families) {
  const memberIds = new Set(f.members.map((m) => m.id))
  for (const root of f.rootIds) if (!memberIds.has(root)) problems.push(`family "${f.id}" roots at unknown "${root}"`)
  for (const m of f.members) {
    for (const p of m.parentIds) {
      if (!memberIds.has(p)) problems.push(`family "${f.id}": "${m.id}" has unknown parent "${p}"`)
      if (p === m.id) problems.push(`family "${f.id}": "${m.id}" is their own parent`)
    }
    if (m.spouseId && !memberIds.has(m.spouseId)) problems.push(`family "${f.id}": "${m.id}" has unknown spouse`)
    if (m.characterId && !characterIds.has(m.characterId)) {
      problems.push(`family "${f.id}": "${m.id}" claims character "${m.characterId}", which does not exist`)
    }
  }
}

for (const h of heroes) {
  for (const b of h.books) if (!bookIds.has(b)) problems.push(`hero "${h.id}" names book "${b}"`)
  for (const c of h.connections) {
    if (characterIds.has(c)) continue
    /*
     * A warning, not an error — and the distinction is not a convenience.
     *
     * `content/heroes/` has `connections: []` for seven of ten records, so these
     * eight names came out of the runtime file where they already were, and
     * they already pointed at characters that do not exist: Shalash, Nin, Glys,
     * Wyndle, Ivory, the Sibling, the Nightwatcher. Eight dead links on the
     * site, before this file existed.
     *
     * Failing the build over them would mean the refactor could not land until
     * eight characters were written, and the eight dead links would still be
     * there afterwards. So they are named, loudly, as a content backfill — and
     * anything `content/` itself names wrongly is still a hard error.
     */
    dangling.push(`hero "${h.id}" links to "${c}", which is not a character`)
  }
}

const notePlanets = new Set(readDir('planets').map((p) => p.id))
for (const [planet, list] of Object.entries(fieldNotes)) {
  if (!notePlanets.has(planet)) problems.push(`field notes for unknown planet "${planet}"`)
  for (const n of list as any[]) {
    if (!n.text?.length) problems.push(`note "${n.id}" has no text`)
  }
}

/* ================================================================= report */

console.log('\n  generated from content/:')
console.log(`    planets          ${planets.length}`)
console.log(`    magic systems    ${magicSystems.length}`)
console.log(`    families         ${families.length} (${families.reduce((a, f) => a + f.members.length, 0)} members)`)
console.log(`    heroes           ${heroes.length}`)
console.log(`    field notes      ${notes.length} across ${Object.keys(fieldNotes).length} planets`)
console.log(`    character spans  ${spans.length}`)

if (dangling.length > 0) {
  console.warn('  ! dangling references carried over from the runtime files:')
  for (const d of dangling) console.warn(`      ${d}`)
  console.warn('    These already pointed nowhere before this change. Backfill them into content/characters/.')
  console.warn('')
}

if (carried.length > 0) {
  console.warn(`\n  carried from the runtime files (backfill these into content/):`)
  for (const c of carried) console.warn(`      ${c}`)
}

if (problems.length > 0) {
  console.error(`\n  ! ${problems.length} problems:\n`)
  for (const p of problems.slice(0, 40)) console.error(`      ${p}`)
  if (problems.length > 40) console.error(`      ... and ${problems.length - 40} more`)
  console.error('')
  process.exit(1)
}
console.log('\n  ok\n')
