/**
 * ListView — the library as a table. M3 · block 5 (criterion B.7, §5.3.5).
 *
 * Not a lesser view. It is the one that works on a phone in portrait, that a
 * screen reader can actually traverse, and that a visitor who wants "every
 * Sanderson novel with its word count, sortable" came for. The shelf is the
 * showpiece; this is the reference.
 *
 * Every field is in the DOM as text, every row is a real link, and the sort is
 * real sorting rather than a visual shuffle.
 */

import { useMemo, useState } from 'react'
import { BOOKS, SAGAS } from '@/data/static'
import { SHELF_GROUPS } from './shelf-groups'
import { spineMaterial } from '@/navigation'
import type { Book } from '@/types'

interface Props {
  onOpen: (book: Book) => void
}

type SortKey = 'saga' | 'title' | 'year' | 'wordCount'

/** `saga` is an id; readers need the name. */
const SAGA_NAMES = new Map(SAGAS.map((s) => [s.id, s.name]))

/**
 * Series in shelf order, so the list and the shelves read the same way.
 *
 * The previous version sorted by `indexOf` within the saga's own array, which
 * compares a position in one series against a position in another and produces
 * an arbitrary interleaving — Elantris landed between two Mistborn books. A
 * series has to be ranked, and then a book ranked inside it.
 */
const SERIES_RANK = new Map(SHELF_GROUPS.flatMap((g, gi) => g.sagas.map((saga, si) => [saga, gi * 1000 + si] as const)))

function seriesPosition(book: Book): number {
  return (SERIES_RANK.get(book.saga) ?? 9000) + book.order
}

export default function ListView({ onOpen }: Props) {
  const [sort, setSort] = useState<SortKey>('saga')
  const [asc, setAsc] = useState(true)

  const rows = useMemo(() => {
    const list = [...BOOKS]
    list.sort((a, b) => {
      let d: number
      switch (sort) {
        case 'title':
          d = a.title.localeCompare(b.title)
          break
        case 'year':
          d = (a.year ?? 9999) - (b.year ?? 9999)
          break
        case 'wordCount':
          d = (a.wordCount ?? 0) - (b.wordCount ?? 0)
          break
        default:
          d = seriesPosition(a) - seriesPosition(b)
      }
      return asc ? d : -d
    })
    return list
  }, [sort, asc])

  const header = (key: SortKey, label: string, className?: string) => (
    <th
      scope="col"
      aria-sort={sort === key ? (asc ? 'ascending' : 'descending') : 'none'}
      className={`px-3 py-2 text-left ${className ?? ''}`}
    >
      <button
        type="button"
        onClick={() => {
          if (sort === key) setAsc((v) => !v)
          else {
            setSort(key)
            setAsc(true)
          }
        }}
        className="cursor-pointer uppercase tracking-[var(--ls-caps)] text-[var(--text-micro)] text-[var(--text-tertiary)] transition-colors duration-[var(--dur-fast)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        {label}
        {sort === key && (
          <span aria-hidden className="ml-1.5">
            {asc ? '▲' : '▼'}
          </span>
        )}
      </button>
    </th>
  )

  return (
    <div className="mx-auto w-full max-w-page px-5 pb-24">
      <table className="w-full border-collapse text-[var(--text-body-s)]">
        <caption className="sr-only">All {BOOKS.length} volumes in the Cosmere Archive, as a sortable table</caption>
        <thead className="border-b border-[var(--border-subtle)]">
          <tr>
            {header('title', 'Title')}
            {header('saga', 'Series')}
            {header('year', 'Published', 'max-sm:hidden')}
            {header('wordCount', 'Words', 'text-right max-md:hidden')}
            <th
              scope="col"
              className="w-14 px-3 py-2 text-right text-[var(--text-micro)] uppercase tracking-[var(--ls-caps)] text-[var(--text-tertiary)]"
            >
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((book) => {
            const m = spineMaterial(book.saga)
            return (
              <tr
                key={book.id}
                data-list-row={book.id}
                className="border-b border-[var(--border-subtle)] transition-colors duration-[var(--dur-fast)] hover:bg-[var(--surface-raised)]"
              >
                <th scope="row" className="px-3 py-2 text-left font-normal">
                  <button
                    type="button"
                    onClick={() => onOpen(book)}
                    className="cursor-pointer text-left text-[var(--text-primary)] hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                  >
                    {book.title}
                  </button>
                </th>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-[var(--text-secondary)]">
                    <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: m.foil }} />
                    {SAGA_NAMES.get(book.saga) ?? book.saga}
                  </span>
                </td>
                <td className="max-sm:hidden px-3 py-2 text-[var(--text-secondary)] tabular-nums">
                  {book.year ?? '—'}
                </td>
                <td className="max-md:hidden px-3 py-2 text-right text-[var(--text-secondary)] tabular-nums">
                  {book.wordCount ? book.wordCount.toLocaleString('en') : '—'}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onOpen(book)}
                    aria-label={`Open ${book.title}`}
                    className="inline-grid size-9 cursor-pointer place-items-center rounded-[var(--radius-md)] border border-[var(--border-interactive)] text-[var(--text-secondary)] transition-colors duration-[var(--dur-fast)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4"
                      aria-hidden
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
