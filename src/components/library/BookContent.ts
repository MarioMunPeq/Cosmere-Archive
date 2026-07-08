import type { Book } from '@/types'
import { BOOKS } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import ALL_CHARACTERS from '@/data/generated/characters.json'
import { PLANETS } from '@/data/static/planets'
import { TIMELINE_EVENTS } from '@/data/static/timeline'
import { getBookArchiveEntry } from '@/data/static/book-archive-entries'

interface CharEntry {
  id: string
  name: string
  description: string
  planet: string
  requiredBooks?: string[]
}

interface PlanetEntry {
  id: string
  name: string
  shard?: string
  books?: string[]
}

export interface PageData {
  title: string
  content: PageContent[]
}

export interface PageContent {
  type:
    | 'heading'
    | 'text'
    | 'list'
    | 'entry'
    | 'grid'
    | 'separator'
    | 'small-heading'
    | 'dropcap-text'
    | 'hero'
    | 'subtitle'
    | 'divider'
    | 'archive-header'
  value?: string
  entries?: { label: string; value: string }[]
  items?: string[]
}

function getSagaLabel(saga: string): string {
  const labels: Record<string, string> = {
    stormlight: 'The Stormlight Archive',
    'mistborn-era-1': 'Mistborn Era One',
    'mistborn-era-2': 'Mistborn Era Two',
    elantris: 'Elantris',
    warbreaker: 'Warbreaker',
    'white-sand': 'White Sand',
    'secret-projects': 'Secret Projects',
    'arcanum-unbounded': 'Arcanum Unbounded',
  }
  return labels[saga] ?? saga
}

function getOrdinal(n: number): string {
  if (n === 1) return 'First'
  if (n === 2) return 'Second'
  if (n === 3) return 'Third'
  if (n === 4) return 'Fourth'
  if (n === 5) return 'Fifth'
  return `${n}th`
}

const CHARS_PER_PAGE = 5
const MAGIC_PER_PAGE = 3

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

export function generatePages(book: Book): PageData[] {
  const wordCountStr = book.wordCount ? `${book.wordCount.toLocaleString()} words` : 'Unknown'
  const sagaLabel = getSagaLabel(book.saga)
  const ordinal = getOrdinal(book.order)

  const allChars = ALL_CHARACTERS as CharEntry[]
  const bookCharacters = allChars.filter((c) => c.requiredBooks?.includes(book.id))

  const bookMagic = MAGIC_SYSTEMS.filter((m) => m.bookIds.includes(book.id))

  const allPlanets = PLANETS as PlanetEntry[]
  const bookPlanets = allPlanets.filter((p) => p.books?.includes(book.id))

  const bookEvents = book.year
    ? TIMELINE_EVENTS.filter(
        (e) => e.year === book.year || (e.endYear && e.year <= (book.year ?? 0) && e.endYear >= (book.year ?? 0)),
      ).slice(0, 6)
    : []

  const relatedBooks = BOOKS.filter((b) => b.saga === book.saga && b.id !== book.id).slice(0, 8)

  const h = (v: string): PageContent => ({ type: 'heading', value: v })
  const sh = (v: string): PageContent => ({ type: 'small-heading', value: v })
  const sep = (): PageContent => ({ type: 'separator' }) as PageContent
  const tx = (v: string): PageContent => ({ type: 'text', value: v })
  const dt = (v: string): PageContent => ({ type: 'dropcap-text', value: v })
  const en = (entries: { label: string; value: string }[]): PageContent => ({ type: 'entry', entries })
  const gr = (entries: { label: string; value: string }[]): PageContent => ({ type: 'grid', entries })
  const hero = (v: string): PageContent => ({ type: 'hero', value: v })
  const subtitle = (v: string): PageContent => ({ type: 'subtitle', value: v })
  const divider = (): PageContent => ({ type: 'divider' }) as PageContent
  const ah = (v: string): PageContent => ({ type: 'archive-header', value: v })

  const pages: PageData[] = []

  // Page 1: Archive Record (cosmic archive entry)
  const archiveEntry = getBookArchiveEntry(book.id)
  const bookPlanet = bookPlanets.length > 0 ? bookPlanets[0]! : undefined

  const metaEntries: { label: string; value: string }[] = [
    { label: 'World', value: bookPlanet?.name ?? 'Uncatalogued' },
    ...(bookPlanet?.shard ? [{ label: 'Shard', value: bookPlanet.shard }] : []),
    { label: 'Published', value: book.year ? String(book.year) : '—' },
    { label: 'Words', value: wordCountStr },
    { label: 'Author', value: 'Brandon Sanderson' },
    { label: 'Saga', value: sagaLabel },
  ]

  pages.push({
    title: 'Volume Record',
    content: [
      ah(archiveEntry ? 'COSMERE ARCHIVE · VOLUME RECORD' : 'VOLUME RECORD'),
      ah(
        archiveEntry
          ? `ACCESSION: ${archiveEntry.volumeNumber} · ${archiveEntry.classification}`
          : `ACCESSION: UNC · CLASSIFICATION: UNCATALOGUED`,
      ),
      hero(book.title),
      subtitle(`${sagaLabel} · Book ${getOrdinal(book.order)}`),
      ...(archiveEntry ? [tx(archiveEntry.archiveDescription)] : []),
      divider(),
      gr(metaEntries),
    ],
  })

  // Page 2: Synopsis (with drop cap)
  pages.push({
    title: 'Synopsis',
    content: [h('Synopsis'), sep(), dt(book.description ?? 'No synopsis available.')],
  })

  // Characters pages — two-column grid, internal scroll
  if (bookCharacters.length > 0) {
    const charChunks = chunk(bookCharacters, CHARS_PER_PAGE)
    charChunks.forEach((chunk, ci) => {
      const pageTitle = ci === 0 ? 'Characters' : 'Characters (cont.)'
      pages.push({
        title: pageTitle,
        content: [h(pageTitle), sep(), gr(chunk.map((c) => ({ label: c.name, value: c.description })))],
      })
    })
  } else {
    pages.push({
      title: 'Characters',
      content: [h('Characters'), sep(), tx('No character data available for this book.')],
    })
  }

  // Magic & World page(s)
  if (bookPlanets.length > 0 || bookMagic.length > 0) {
    const worldsSection =
      bookPlanets.length > 0
        ? [sh('Worlds'), ...bookPlanets.map((p): PageContent => en([{ label: p.name, value: p.shard ?? '—' }]))]
        : []

    if (bookMagic.length <= MAGIC_PER_PAGE) {
      pages.push({
        title: 'Magic & World',
        content: [
          h('Magic & World'),
          sep(),
          ...worldsSection,
          ...(bookMagic.length > 0
            ? [sh('Magic Systems'), ...bookMagic.map((m): PageContent => en([{ label: m.name, value: m.description }]))]
            : []),
        ],
      })
    } else {
      const magicChunks = chunk(bookMagic, MAGIC_PER_PAGE)
      magicChunks.forEach((chunk, ci) => {
        const pageTitle = ci === 0 ? 'Magic & World' : 'Magic (cont.)'
        pages.push({
          title: pageTitle,
          content: [
            h(pageTitle),
            sep(),
            ...(ci === 0 ? worldsSection : []),
            sh(ci === 0 ? 'Magic Systems' : 'Magic Systems (cont.)'),
            ...chunk.map((m): PageContent => en([{ label: m.name, value: m.description }])),
          ],
        })
      })
    }
  } else {
    pages.push({
      title: 'Magic & World',
      content: [h('Magic & World'), sep(), tx('No magic or world data available for this book.')],
    })
  }

  // Connections page
  const connContent: PageContent[] = [h('Connections'), sep()]
  if (book.order) {
    connContent.push(en([{ label: 'Reading Order', value: `${ordinal} book of ${sagaLabel}` }]))
  }
  if (book.year) {
    connContent.push(en([{ label: 'Cosmere Timeline', value: `Approximately ${book.year} AR` }]))
  }
  if (relatedBooks.length > 0) {
    connContent.push(sh('Other books in this saga'))
    connContent.push(...relatedBooks.map((b): PageContent => en([{ label: b.title, value: '' }])))
  }
  if (bookEvents.length > 0) {
    connContent.push(sh('Related Events'))
    connContent.push(
      ...bookEvents.map(
        (e): PageContent =>
          en([
            {
              label: `${e.title} (${e.year})`,
              value: e.description,
            },
          ]),
      ),
    )
  }
  pages.push({ title: 'Connections', content: connContent })

  return pages
}
