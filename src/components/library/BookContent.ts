import type { Book } from '@/types'
import { BOOKS } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import ALL_CHARACTERS from '@/data/generated/characters.json'
import { PLANETS } from '@/data/static/planets'
import { TIMELINE_EVENTS } from '@/data/static/timeline'

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
  type: 'heading' | 'text' | 'list' | 'entry' | 'separator' | 'small-heading'
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

export function generatePages(book: Book): PageData[] {
  const wordCountStr = book.wordCount ? `${book.wordCount.toLocaleString()} words` : 'Unknown'
  const sagaLabel = getSagaLabel(book.saga)
  const ordinal = getOrdinal(book.order)

  const allChars = ALL_CHARACTERS as CharEntry[]
  const bookCharacters = allChars.filter((c) => c.requiredBooks?.includes(book.id)).slice(0, 12)

  const bookMagic = MAGIC_SYSTEMS.filter((m) => m.bookIds.includes(book.id))

  const allPlanets = PLANETS as PlanetEntry[]
  const bookPlanets = allPlanets.filter((p) => p.books?.includes(book.id))

  const bookEvents = book.year
    ? TIMELINE_EVENTS.filter(
        (e) => e.year === book.year || (e.endYear && e.year <= (book.year ?? 0) && e.endYear >= (book.year ?? 0)),
      ).slice(0, 4)
    : []

  const relatedBooks = BOOKS.filter((b) => b.saga === book.saga && b.id !== book.id).slice(0, 6)

  const h = (v: string): PageContent => ({ type: 'heading', value: v })
  const sh = (v: string): PageContent => ({ type: 'small-heading', value: v })
  const sep = (): PageContent => ({ type: 'separator' }) as PageContent
  const tx = (v: string): PageContent => ({ type: 'text', value: v })
  const en = (entries: { label: string; value: string }[]): PageContent => ({ type: 'entry', entries })

  const pages: PageData[] = []

  // Page 1: Title & Metadata
  pages.push({
    title: 'Title',
    content: [
      h(book.title),
      tx('Brandon Sanderson'),
      sep(),
      en([
        { label: 'Saga', value: sagaLabel },
        { label: 'Book', value: ordinal },
      ]),
      en([
        { label: 'Published', value: book.year ? String(book.year) : '—' },
        { label: 'Length', value: wordCountStr },
      ]),
      en([{ label: 'Universe', value: 'Cosmere' }]),
    ],
  })

  // Page 2: Synopsis
  pages.push({
    title: 'Synopsis',
    content: [h('Synopsis'), sep(), tx(book.description ?? 'No synopsis available.')],
  })

  // Page 3: Characters
  pages.push({
    title: 'Characters',
    content:
      bookCharacters.length > 0
        ? [
            h('Characters'),
            sep(),
            ...bookCharacters.map(
              (c): PageContent =>
                en([
                  {
                    label: c.name,
                    value: c.description.length > 120 ? c.description.slice(0, 120) + '…' : c.description,
                  },
                ]),
            ),
          ]
        : [h('Characters'), sep(), tx('No character data available for this book.')],
  })

  // Page 4: Magic & World
  pages.push({
    title: 'Magic & World',
    content: [
      h('Magic & World'),
      sep(),
      ...(bookPlanets.length > 0
        ? [sh('Worlds'), ...bookPlanets.map((p): PageContent => en([{ label: p.name, value: p.shard ?? '—' }]))]
        : []),
      ...(bookMagic.length > 0
        ? [
            sh('Magic Systems'),
            ...bookMagic.map(
              (m): PageContent =>
                en([
                  {
                    label: m.name,
                    value: m.description.length > 150 ? m.description.slice(0, 150) + '…' : m.description,
                  },
                ]),
            ),
          ]
        : [tx('No magic system data available for this book.')]),
    ],
  })

  // Page 5: Connections
  pages.push({
    title: 'Connections',
    content: [
      h('Connections'),
      sep(),
      ...(book.order ? [en([{ label: 'Reading Order', value: `${ordinal} book of ${sagaLabel}` }])] : []),
      ...(book.year ? [en([{ label: 'Cosmere Timeline', value: `Approximately ${book.year} AR` }])] : []),
      ...(relatedBooks.length > 0
        ? [sh('Other books in this saga'), en(relatedBooks.map((b) => ({ label: b.title, value: '' })))]
        : []),
      ...(bookEvents.length > 0
        ? [
            sh('Related Events'),
            ...bookEvents.map(
              (e): PageContent =>
                en([
                  {
                    label: `${e.title} (${e.year})`,
                    value: e.description.length > 100 ? e.description.slice(0, 100) + '…' : e.description,
                  },
                ]),
            ),
          ]
        : []),
    ],
  })

  return pages
}
