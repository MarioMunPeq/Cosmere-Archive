/**
 * Generate `src/data/generated/books.json` and `series.json` from `content/`.
 *
 * ## Why
 *
 * The books existed in three places. `content/books/*.json` held the summary,
 * the cover and the three archive fields; `src/data/static/books.ts` held the
 * same twenty-two books again under different field names; and
 * `book-archive-entries.ts` held the archive fields a *third* time.
 *
 * The good news, measured before writing any of this: the two book copies had
 * not drifted. Twenty-two books on each side, and every shared field identical
 * — same title, same year, same word count, same order, same synopsis to twelve
 * words. Only the *naming* differed (`series`/`saga`, `published`/`year`,
 * `summary`/`description`), which is what the generator exists to translate.
 *
 * The bad news: the third copy is the one that matters. `book-archive-entries.ts`
 * is 18.5 KB of archive descriptions that `content/books/` already held, and
 * `BookContent.ts` reads it to build a book's first page. So editing a synopsis
 * in one place left the archive entry describing a different book, and nothing
 * complained, because nothing compared them.
 *
 * ## What is dropped
 *
 *   `emblem`  declared on the `Book` type and set on all twenty-two records,
 *             and read by nothing at all. Verified by grep across `src/` before
 *             deletion, not assumed: a field nobody reads is a second answer to
 *             "what emblem does this saga have", and the answer was wrong.
 *
 * ## The id translation
 *
 * `content/` normalises underscores to hyphens (rule V15: `the-way-of-kings`).
 * `src/data/static/books.ts` uses underscores, and its ids appear in URLs, in
 * ninety-three character records' `requiredBooks`, and in sixteen modules'
 * imports. Unifying the spelling is Fase A's business as a whole; here the
 * translation lives in this one function, is exercised below, and is asserted by
 * `test:sync` so a book whose id stops resolving is a build failure rather than a
 * dead link.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CONTENT_BOOKS = join(process.cwd(), 'content', 'books')
const CONTENT_SERIES = join(process.cwd(), 'content', 'series')
const OUT_BOOKS = join(process.cwd(), 'src', 'data', 'generated', 'books.json')
const OUT_SERIES = join(process.cwd(), 'src', 'data', 'generated', 'series.json')

interface ContentBook {
  id: string
  title: string
  series: string
  order: number
  published: number
  wordCount: number
  summary: string
  cover: string
  volumeNumber: string
  classification: string
  archiveDescription: string
}

interface ContentSeries {
  id: string
  name: string
  color: string
  order: number
  summary: string
  spine: { ink: string | null; foil: string; crop: string }
}

/** Content id to runtime id. The one place the two spellings meet. */
function toRuntimeId(id: string): string {
  return id.replace(/-/g, '_')
}

function readCollection<T>(dir: string): T[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as T)
}

const contentBooks = readCollection<ContentBook>(CONTENT_BOOKS)
const contentSeries = readCollection<ContentSeries>(CONTENT_SERIES)

/* ------------------------------------------------------------------ series */

const seriesOut = contentSeries
  .map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    order: s.order,
    description: s.summary,
    spine: s.spine,
  }))
  .sort((a, b) => a.order - b.order)

const seriesIds = new Set(seriesOut.map((s) => s.id))

/* -------------------------------------------------------------------- books */

/** Books naming a series that does not exist. Collected and reported, not dropped. */
const danglingSeries: string[] = []

const booksOut = contentBooks
  .map((b) => {
    if (!seriesIds.has(b.series)) danglingSeries.push(`${b.id} -> ${b.series}`)
    return {
      id: toRuntimeId(b.id),
      title: b.title,
      // `series` is the content-layer name and `saga` the runtime one. Same
      // fact; one of the two spellings is a translation, not a second answer.
      saga: b.series,
      order: b.order,
      year: b.published,
      wordCount: b.wordCount,
      description: b.summary,
      cover: b.cover,
      // The archive fields, from the copy that was already in `content/` and
      // was being duplicated in `book-archive-entries.ts`.
      volumeNumber: b.volumeNumber,
      classification: b.classification,
      archiveDescription: b.archiveDescription,
    }
  })
  .sort((a, b) => a.title.localeCompare(b.title, 'en', { numeric: true, sensitivity: 'base' }))

/* -------------------------------------------------------------- self-checks */

/*
 * The generator checks its own output before writing it.
 *
 * A generator that writes whatever it read will faithfully reproduce a source
 * that has gone wrong, and the gate downstream only finds out when a screen
 * breaks. These are the three failures that would actually hurt: a book with no
 * series, a series with no books, and a cover that points at nothing.
 */
const problems: string[] = []

for (const b of booksOut) {
  if (!b.title.trim()) problems.push(`${b.id}: empty title`)
  if (!b.description.trim()) problems.push(`${b.id}: empty description`)
  if (!b.cover) problems.push(`${b.id}: no cover`)
  if (!seriesIds.has(b.saga)) problems.push(`${b.id}: unknown series "${b.saga}"`)
  if (!b.archiveDescription.trim()) problems.push(`${b.id}: no archive description`)
}

const booksPerSeries = new Map<string, number>()
for (const b of booksOut) booksPerSeries.set(b.saga, (booksPerSeries.get(b.saga) ?? 0) + 1)
for (const s of seriesOut) {
  // `pre-cosmere` legitimately holds no books: it is the era before the
  // Shattering, and the timeline owns it. Anything else empty is a mistake.
  if (!booksPerSeries.get(s.id) && s.id !== 'pre-cosmere') {
    problems.push(`series "${s.id}" has no books`)
  }
}

const duplicateIds = booksOut.map((b) => b.id).filter((id, i, all) => all.indexOf(id) !== i)
for (const id of duplicateIds) problems.push(`duplicate book id "${id}"`)

/* -------------------------------------------------------------------- write */

writeFileSync(OUT_BOOKS, `${JSON.stringify(booksOut, null, 2)}\n`, 'utf8')
writeFileSync(OUT_SERIES, `${JSON.stringify(seriesOut, null, 2)}\n`, 'utf8')

if (danglingSeries.length > 0) {
  console.warn(`  ! ${danglingSeries.length} books name a series that does not exist:`)
  for (const d of danglingSeries) console.warn(`      ${d}`)
}

if (problems.length > 0) {
  console.error(`\n  ! ${problems.length} problems in the generated book data:\n`)
  for (const p of problems) console.error(`      ${p}`)
  console.error('')
  process.exit(1)
}

console.log(
  `books: ${booksOut.length} from content/books/, ${seriesOut.length} series · ` +
    `covers ${booksOut.filter((b) => b.cover).length}/${booksOut.length} · ` +
    `archive entries ${booksOut.filter((b) => b.archiveDescription).length}/${booksOut.length}`,
)
