/**
 * The three tallies, derived from the archive rather than written down.
 *
 * A ledger is only a ledger if the sum is the sum of its lines. These rows are
 * computed from the same generated data `/stats` and `/library` read, so a book
 * added to the shelf changes sheet VII without anyone editing a number here.
 */
import { BOOKS } from '@/data/static/books'
import { SAGAS } from '@/data/static/sagas'
import { PLANETS } from '@/data/static/planets'
import { ALL_CHARACTERS } from '@/data/static'

export interface LedgerRow {
  label: string
  value: number
  /** What the ledger writes in the value column. Numbers stay numerals. */
  display: string
}

const SAGA_NAME = new Map(SAGAS.map((s) => [s.id, s.name]))
const PLANET_NAME = new Map(PLANETS.map((p) => [p.id, p.name]))

function words(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace('.', ',')} M`
  return n.toLocaleString('es-ES')
}

/** VII — volumes, by series, in the order the archive shelves them. */
export const VOLUME_ROWS: LedgerRow[] = SAGAS.map((saga) => {
  const count = BOOKS.filter((book) => book.saga === saga.id).length
  return { label: SAGA_NAME.get(saga.id) ?? saga.id, value: count, display: String(count) }
}).filter((row) => row.value > 0)

export const VOLUME_TOTAL = VOLUME_ROWS.reduce((a, row) => a + row.value, 0)

/** VIII — words, by series. */
export const WORD_ROWS: LedgerRow[] = SAGAS.map((saga) => {
  const total = BOOKS.filter((book) => book.saga === saga.id).reduce((a, book) => a + (book.wordCount ?? 0), 0)
  return { label: SAGA_NAME.get(saga.id) ?? saga.id, value: total, display: words(total) }
}).filter((row) => row.value > 0)

export const WORD_TOTAL = WORD_ROWS.reduce((a, row) => a + row.value, 0)

/** IX — named persons, by world. Yolen keeps its line and its zero. */
export const POPULATION_ROWS: LedgerRow[] = PLANETS.map((planet) => {
  const count = ALL_CHARACTERS.filter((character) => character.planet === planet.id).length
  return { label: PLANET_NAME.get(planet.id) ?? planet.name, value: count, display: String(count) }
})

export const POPULATION_TOTAL = POPULATION_ROWS.reduce((a, row) => a + row.value, 0)

export function ledgerFor(id: string): { rows: LedgerRow[]; total: number; unit: string; totalLabel: string } | null {
  if (id === 'volumes') return { rows: VOLUME_ROWS, total: VOLUME_TOTAL, unit: 'vols', totalLabel: 'volumes' }
  if (id === 'wordcount') return { rows: WORD_ROWS, total: WORD_TOTAL, unit: 'words', totalLabel: 'words' }
  if (id === 'population') {
    return { rows: POPULATION_ROWS, total: POPULATION_TOTAL, unit: 'names', totalLabel: 'names' }
  }
  return null
}
