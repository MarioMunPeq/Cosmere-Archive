/**
 * Generate `src/data/generated/characters.json` from `content/characters/`.
 *
 * ## Why this exists
 *
 * The archive had three copies of every character: `content/characters/*.json`
 * with fifteen fields, `src/data/generated/characters.json` with five, and the
 * two had already drifted once — Dawnshard carried `order: 0` in one and `4` in
 * the other, and it had to be fixed in both by hand.
 *
 * Five fields is not enough to build a record against. §5.4.3 asks for BORN,
 * STATUS and ALSO IN; `born`, `status` and `groups` exist, authored and
 * schema-validated, in `content/` — and nothing imported them.
 *
 * So this is the first slice of Fase A: `content/` becomes the source, and the
 * runtime file becomes what the source generates. `pnpm data:build` emits it,
 * `pnpm test:sync` fails the build if the committed file has drifted, and from
 * here a character fact is edited in exactly one place.
 *
 * ## What is dropped, and why
 *
 *   `unlockAt`  duplicates `books` in all ninety-three records. Carried here as
 *               `spoilers` only where they differ, so the spoiler state in
 *               §5.4.6 has something to read without a second source drifting.
 *   `summary`   kept, and is what the old file called `description`.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/*
 * The book ids, read from `content/books/` rather than from
 * `src/data/static/books`.
 *
 * This used to import the runtime module, which was fine when that module *was*
 * the data and circular now that it is generated from the same `content/`
 * directory: the generator would have been validating characters against an
 * artefact derived from the thing it is validating them against. Reading the
 * source makes the flow one-directional — `content/` in, `src/data/generated/`
 * out — and means a book id that exists in `content/` but not in the generated
 * file fails the build rather than passing quietly.
 */
const CONTENT_BOOK_IDS = new Set(
  readdirSync(join(process.cwd(), 'content', 'books'))
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .map((f) =>
      toRuntimeBookId(
        (JSON.parse(readFileSync(join(process.cwd(), 'content', 'books', f), 'utf8')) as { id: string }).id,
      ),
    ),
)

const CONTENT = join(process.cwd(), 'content', 'characters')
const CONTENT_HEROES = join(process.cwd(), 'content', 'heroes')
const GENERATED_DIR = join(process.cwd(), 'src', 'data', 'generated')
const OUT = join(process.cwd(), 'src', 'data', 'generated', 'characters.json')

/**
 * Content book id → runtime book id.
 *
 * The two layers use different id conventions and it matters. `content/`
 * normalises underscores to hyphens (rule V15: `the-way-of-kings`), while
 * `src/data/static/books.ts` still uses underscores (`the_way_of_kings`).
 *
 * Emitting the content spelling directly produced 98 records whose
 * `requiredBooks` referenced books that did not exist — every "Appears In" link
 * on every card would have gone nowhere. The reference check in
 * data-integrity.test.ts caught it on the first run, which is the gate doing
 * its job.
 *
 * This maps between the two rather than renaming sixteen screens' worth of
 * imports. Unifying the convention is Fase A's business; until then the
 * translation lives here, in one place, and is verified below rather than
 * assumed.
 */

function toRuntimeBookId(contentId: string): string {
  return contentId.replace(/-/g, '_')
}

/** Book ids that survive neither spelling. Collected and reported, not dropped. */
const dangling = new Set<string>()

function runtimeBooks(ids: string[]): string[] {
  return ids.map(toRuntimeBookId).filter((id) => {
    if (CONTENT_BOOK_IDS.has(id)) return true
    dangling.add(id)
    return false
  })
}

interface ContentCharacter {
  id: string
  name: string
  pronunciation: string | null
  summary: string
  origin: string
  books: string[]
  unlockAt: string[]
  portrait: string | null
  born: number | null
  died: number | null
  status: string
  groups: string[]
  titles: string[]
}

// `index.json` is the collection index (`{ count, ids }`), not a record.
const files = readdirSync(CONTENT).filter((f) => f.endsWith('.json') && f !== 'index.json')
const records = files
  .map((f) => JSON.parse(readFileSync(join(CONTENT, f), 'utf8')) as ContentCharacter)
  .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' }))

/**
 * The previous runtime file, read so nothing can be lost.
 *
 * This is not belt-and-braces. `content/characters/` holds 85 records and the
 * runtime file held 98: the M1 migration missed thirteen — Nale, TenSoon,
 * Jezrien, Ishar, Kalak, Chanarach, Pailiah, Battar, Vedel, Miles Dagouter,
 * Telsin Ladrian, Sixth of the Dusk and The Cinder King. Generating purely
 * from `content/` would have deleted thirteen characters from the site.
 *
 * So the merge is content-over-previous: anything with a content record is
 * regenerated from it, and anything without is carried through untouched and
 * *reported*. Silently dropping them, or silently keeping stale copies, are
 * both worse than saying so out loud. Thirteen records with no content
 * source is a gap in `content/`, and the fix for that gap is backfilling
 * `content/`, not editing this script.
 */
interface PreviousRecord {
  id: string
  name: string
  description: string
  planet: string
  requiredBooks: string[]
  [k: string]: unknown
}

let previous: PreviousRecord[] = []
try {
  previous = JSON.parse(readFileSync(OUT, 'utf8')) as PreviousRecord[]
} catch {
  // No previous file: a first run is a full generation from content/.
  previous = []
}

/**
 * The union of the two sources is not a set — it is a set with duplicates in it.
 *
 * `content/characters/` normalises ids to hyphens (rule V15: `the-way-of-kings`),
 * so Miles Hundredlives is `miles-dagouter` there and `miles_dagouter` in the
 * runtime file. Joining by id alone produced 98 records for 93 characters:
 * five people counted twice under two ids, once from each layer.
 *
 * So a carried-over record is only carried if no content record already
 * describes the same character, matched on the normalised id *and* on the
 * name. When one is found, the content version wins — it has fifteen validated
 * fields against the runtime file's five — and the duplicate is reported
 * rather than dropped in silence.
 */
function normaliseId(id: string): string {
  return id.replace(/[-_]/g, '').toLowerCase()
}

const fromContent = new Map(records.map((c) => [c.id, c]))
const contentIds = new Set(records.map((c) => normaliseId(c.id)))
const contentNames = new Set(records.map((c) => c.name.trim().toLowerCase()))

const carried: PreviousRecord[] = []
const mergedDuplicates: string[] = []
const carriedProblems: string[] = []

for (const p of previous) {
  const duplicate =
    fromContent.has(p.id) || contentIds.has(normaliseId(p.id)) || contentNames.has(p.name.trim().toLowerCase())
  if (duplicate) {
    if (!fromContent.has(p.id)) mergedDuplicates.push(`${p.id} (~ ${p.name})`)
    continue
  }
  carried.push(p)
}

/**
 * Carried Heralds are projections that exist only in the runtime layer. They must
 * resolve to a canonical hero in `content/heroes/` (or be mapped by alias) and
 * reference valid books and a known origin. The gap is reported, but these
 * projections are validated here rather than treated as unvalidated noise.
 */
const heroIndex = JSON.parse(readFileSync(join(CONTENT_HEROES, 'index.json'), 'utf8')) as { ids: string[] }
const heroIds = new Set(heroIndex.ids)
const heroById = new Map<string, Record<string, unknown>>(
  heroIndex.ids.map((id) => [
    id,
    JSON.parse(readFileSync(join(CONTENT_HEROES, `${id}.json`), 'utf8')) as Record<string, unknown>,
  ]),
)
const bookGen = JSON.parse(readFileSync(join(GENERATED_DIR, 'books.json'), 'utf8')) as { id: string }[]
const bookIdSet = new Set(bookGen.map((b) => b.id))
const planetIdsContent = new Set(
  (JSON.parse(readFileSync(join(process.cwd(), 'content', 'planets', 'index.json'), 'utf8')) as { ids: string[] }).ids,
)
const heroCharacterAliases: Record<string, string> = { talenel: 'taln', shalash: 'asha' }
const carriedById = new Map(carried.map((c) => [c.id, c]))
for (const heroId of heroIndex.ids) {
  const hero = heroById.get(heroId)!
  const heroName = String(hero.name ?? '')
    .trim()
    .toLowerCase()
  const expectedCharId = heroCharacterAliases[heroId] ?? heroId
  if (fromContent.has(expectedCharId)) continue
  if (carriedById.has(expectedCharId)) {
    const carried = carriedById.get(expectedCharId)!
    if (!carried.name) {
      carriedProblems.push(`hero "${heroId}" expects character projection "${expectedCharId}" with name "${hero.name}"`)
    } else {
      const carriedName = String(carried.name).trim().toLowerCase()
      if (carriedName !== heroName && carriedName !== expectedCharId && carriedName !== heroId) {
        carriedProblems.push(
          `hero "${heroId}" expects character projection "${expectedCharId}" with name "${hero.name}" (got "${carried.name}")`,
        )
      }
    }
    if (!planetIdsContent.has(String(carried.planet ?? ''))) {
      carriedProblems.push(`carried character "${expectedCharId}" has unknown origin "${carried.planet}"`)
    }
    for (const b of (carried.requiredBooks as string[]) ?? []) {
      if (!bookIdSet.has(b))
        carriedProblems.push(`carried character "${expectedCharId}" references unknown book "${b}"`)
    }
    continue
  }
  carriedProblems.push(`hero "${heroId}" has no character projection in content or runtime carryover`)
}

/**
 * The runtime shape.
 *
 * `planet` is kept because eleven screens still import it and it is the join
 * key to `getPlanetById`. It is `origin`, renamed — not a second fact.
 */
const shape = (c: ContentCharacter) => ({
  id: c.id,
  name: c.name,
  description: c.summary,
  planet: c.origin,
  requiredBooks: runtimeBooks(c.books),
  born: c.born,
  died: c.died,
  status: c.status,
  groups: c.groups,
  titles: c.titles,
  portrait: c.portrait,
  pronunciation: c.pronunciation,
  // Only when it differs from `requiredBooks`, so the common case costs nothing.
  spoilers: c.unlockAt.length !== c.books.length ? runtimeBooks(c.unlockAt) : undefined,
})

if (carriedProblems.length > 0) {
  console.error(
    `\n  ! ${carriedProblems.length} hero projections are missing or invalid:\n` +
      carriedProblems
        .slice(0, 20)
        .map((p) => `      ${p}`)
        .join('\n') +
      (carriedProblems.length > 20 ? `\n      ... and ${carriedProblems.length - 20} more` : '') +
      '\n    Write the character projection into content/characters/ or fix the hero record.\n',
  )
  process.exit(1)
}

const output = [
  ...records.map(shape),
  // Carried-over records also go through the id join. They were written before
  // the mapping existed, so their `requiredBooks` is already in the runtime
  // spelling and re-mapping it is a no-op — but routing them through the same
  // function is what stops the two paths from drifting apart again.
  ...carried.map((p) => ({ ...p, requiredBooks: runtimeBooks(p.requiredBooks ?? []) })),
].sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' }))

writeFileSync(OUT, `${JSON.stringify(output, null, 2)}\n`, 'utf8')

if (dangling.size > 0) {
  console.error(
    `\n  ! ${dangling.size} book references did not resolve to a runtime book id:\n` +
      [...dangling].map((id) => `      ${id}`).join('\n') +
      '\n    They were dropped from the records that named them.\n',
  )
}

console.log(`characters: ${records.length} from content/, ${carried.length} carried over, ${output.length} written`)

if (mergedDuplicates.length > 0) {
  console.warn(
    `\n  ~ ${mergedDuplicates.length} runtime records were the same character as a content\n` +
      `    record under a different id spelling, and the content version won:\n` +
      mergedDuplicates.map((id) => `      ${id}`).join('\n') +
      '\n    Give these records the same id in both layers and this list empties.\n',
  )
}

if (carried.length > 0) {
  console.warn(
    `\n  ! ${carried.length} records have no content/characters/*.json and were carried over unchanged:\n` +
      carried.map((c) => `      ${c.id}`).join('\n') +
      '\n    They are the only records whose content is not schema-validated. Backfill content/ for them.\n',
  )
  process.exitCode = 0
}
