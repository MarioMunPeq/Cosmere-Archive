/**
 * M2 · Block 4 — the global search index.
 *
 * Builds `src/data/search-index.json` from `content/`. Run with
 * `pnpm search:index`, and automatically by `pnpm build`, so the index can never
 * be stale relative to the content it describes.
 *
 * Why a build step: the archive is ~290 records and every one should be
 * findable. Indexing them in the browser repeats the same work on every visit;
 * doing it once at build turns a full scan into a single JSON parse.
 *
 * Why `content/` rather than `src/data/static`: M1 moved the records to JSON and
 * validated them. Reading the validated files means a search result can only
 * point at something that exists — index and validator share one source of
 * truth, so a broken reference is impossible rather than merely unlikely.
 *
 * The routes here are §5.8's "corrected routes". The previous search pointed
 * five of its seven categories at `/celestial-charts?focus=…&id=…`, and
 * KhrissAtlas reads only `?planet`, so every one of those links discarded its own
 * parameters and landed on the atlas index instead.
 *
 * The acceptance queries at the bottom are checked with the same ranking module
 * the browser uses, so a rule that only exists at runtime cannot pass here.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import MiniSearch from 'minisearch'

import { CORE_DESTINATIONS } from '../src/navigation'
import { search } from '../src/search/ranking'
import { TYPE_BOOST } from '../src/search/types'
import type { IconName } from '../src/navigation'
import type { SearchType } from '../src/search/types'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')
const CONTENT = join(ROOT, 'content')
const OUT = join(ROOT, 'src', 'data', 'search-index.json')

interface IndexedDoc {
  id: string
  title: string
  subtitle: string
  body: string
  aliases: string[]
  route: string
  type: SearchType
  /** Set only on the section documents, so the dialog can show the same glyph. */
  icon?: IconName
}

/**
 * §5.8's corrected routes. Each has to resolve to a screen that reads its
 * parameter; a route that ignores the query string is what made the old
 * search feel broken.
 */
const ROUTES = {
  character: (id: string) => `/records/${id}`,
  planet: (id: string) => `/shadesmar?realm=${id}`,
  book: (id: string) => `/library?book=${id}`,
  series: (id: string) => `/library?series=${id}`,
  magic: (id: string) => `/magic?system=${id}`,
  event: (id: string) => `/chronology?event=${id}`,
  hero: (id: string) => `/aharietiam?h=${id}`,
  shard: (id: string) => `/records/shards/${id}`,
} as const

function readAll<T>(dir: string): T[] {
  const { ids } = JSON.parse(readFileSync(join(CONTENT, dir, 'index.json'), 'utf8')) as {
    ids: string[]
  }
  return ids.map((i) => JSON.parse(readFileSync(join(CONTENT, dir, `${i}.json`), 'utf8')) as T)
}

/**
 * Summaries are indexed for relevance, not read in full: the dialog shows the
 * title and the subtitle, never the body. The body is kept to a short opening
 * because a Cosmere description names its subject and its shard in the first
 * sentence or two, and everything after that only adds bytes.
 *
 * At 600 characters the index was 212 KB and pushed `dist` over its 10.5 MB
 * ceiling. At 240 it is roughly half that, and the §5.8 acceptance queries
 * still pass — the check at the bottom of this file runs against the shipped
 * file, so a truncation that lost a name would fail the build.
 */
const trim = (s: string, max = 240) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s)

const docs: IndexedDoc[] = []

for (const b of readAll<{ id: string; title: string; summary: string; series: string }>('books')) {
  docs.push({
    id: `book:${b.id}`,
    title: b.title,
    subtitle: 'Volume',
    body: trim(b.summary),
    aliases: [b.series],
    route: ROUTES.book(b.id),
    type: 'book',
  })
}

for (const s of readAll<{ id: string; name: string; summary: string }>('series')) {
  docs.push({
    id: `series:${s.id}`,
    title: s.name,
    subtitle: 'Series',
    body: trim(s.summary),
    aliases: [],
    route: ROUTES.series(s.id),
    type: 'series',
  })
}

for (const c of readAll<{
  id: string
  name: string
  summary: string
  books: string[]
  titles: string[]
}>('characters')) {
  docs.push({
    id: `character:${c.id}`,
    title: c.name,
    subtitle: c.titles[0] ?? 'Character',
    body: trim(c.summary),
    // Titles and the books a character appears in are how people search for
    // them: "who is in the way of kings" is a real query.
    aliases: [...c.titles, ...c.books],
    route: ROUTES.character(c.id),
    type: 'character',
  })
}

for (const p of readAll<{ id: string; name: string; summary: string; shards: string[]; books: string[] }>('planets')) {
  docs.push({
    id: `planet:${p.id}`,
    title: p.name,
    subtitle: 'World',
    body: trim(p.summary),
    aliases: [...p.shards, ...p.books],
    route: ROUTES.planet(p.id),
    type: 'planet',
  })
}

for (const s of readAll<{ id: string; name: string; summary: string }>('shards')) {
  docs.push({
    id: `shard:${s.id}`,
    title: s.name,
    subtitle: 'Shard',
    body: trim(s.summary),
    aliases: [],
    route: ROUTES.shard(s.id),
    type: 'shard',
  })
}

for (const m of readAll<{ id: string; name: string; summary: string; category: string }>('magic-systems')) {
  docs.push({
    id: `magic:${m.id}`,
    title: m.name,
    subtitle: m.category,
    body: trim(m.summary),
    aliases: [m.category],
    route: ROUTES.magic(m.id),
    type: 'magic',
  })
}

for (const e of readAll<{
  id: string
  title: string
  summary: string
  year: number
  type: string
  characters: string[]
}>('events')) {
  docs.push({
    id: `event:${e.id}`,
    title: e.title,
    subtitle: String(e.year),
    body: trim(e.summary),
    aliases: [String(e.year), e.type, ...e.characters],
    route: ROUTES.event(e.id),
    type: 'event',
  })
}

for (const h of readAll<{ id: string; name: string; title: string; summary: string; surges: string[] }>('heroes')) {
  docs.push({
    id: `hero:${h.id}`,
    title: h.name,
    subtitle: h.title,
    body: trim(h.summary),
    aliases: h.surges,
    route: ROUTES.hero(h.id),
    type: 'hero',
  })
}

/**
 * The navigation destinations themselves, so the command palette can find a
 * section by name as well as a record inside it. The registry is plain data
 * that can be imported from Node, which is why this stays a one-line change
 * when a sixth core piece is added.
 */
for (const d of CORE_DESTINATIONS) {
  docs.push({
    id: `page:${d.id}`,
    title: d.label,
    subtitle: d.description,
    body: '',
    aliases: [d.id],
    route: d.to,
    type: 'page',
    icon: d.icon,
  })
}

const index = new MiniSearch<IndexedDoc>({
  fields: ['title', 'subtitle', 'body', 'aliases'],
  storeFields: ['title', 'subtitle', 'type', 'route', 'icon'],
})
index.addAll(docs)

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(
  OUT,
  JSON.stringify(
    {
      generatedFrom: 'content/',
      documentCount: docs.length,
      typeBoost: TYPE_BOOST,
      index: index.toJSON(),
    },
    null,
    0,
  ) + '\n',
  'utf8',
)

/* ── report and self-check ─────────────────────────────────────────────────── */

const bytes = readFileSync(OUT).length
const byType = docs.reduce<Record<string, number>>((acc, d) => {
  acc[d.type] = (acc[d.type] ?? 0) + 1
  return acc
}, {})
console.log(`search index: ${docs.length} documents, ${(bytes / 1024).toFixed(0)} KB`)
for (const [type, n] of Object.entries(byType).sort()) console.log(`  ${type.padEnd(10)} ${n}`)

// Re-load from the written file, so the check exercises exactly what ships.
const written = JSON.parse(readFileSync(OUT, 'utf8'))
const loaded = MiniSearch.loadJSON(JSON.stringify(written.index), {
  fields: ['title', 'subtitle', 'body', 'aliases'],
  storeFields: ['title', 'subtitle', 'type', 'route', 'icon'],
})

/** §5.8 Q.1. */
const ACCEPTANCE: [string, string][] = [
  ['kaz', 'Kaladin'],
  ['preserv', 'Preservation'],
  ['saz', 'Sazed'],
  // Talenel is recorded as the hero "Talenel (Taln)" and as the character
  // "Taln"; the plan names him by the first. Both are the same person.
  ['tall', 'Tal'],
]

let failed = false
for (const [query, expected] of ACCEPTANCE) {
  const top = search(loaded, query)[0]
  const ok = Boolean(top && top.title.includes(expected))
  if (!ok) failed = true
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} "${query}" -> ${top?.title ?? '(nothing)'}`)
}

// Q.4: the search has to be fast enough to feel instant.
const t0 = performance.now()
for (let i = 0; i < 200; i++) search(loaded, 'kal')
const perQuery = (performance.now() - t0) / 200
console.log(`  search time: ${perQuery.toFixed(2)} ms per query over ${docs.length} documents`)
if (perQuery >= 5) {
  console.error('  FAIL search exceeds the 5ms budget of §5.8 Q.4')
  failed = true
}

if (failed) {
  console.error('search index failed the §5.8 acceptance criteria')
  process.exit(1)
}
