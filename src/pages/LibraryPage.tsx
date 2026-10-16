/**
 * LibraryPage — the Library of Jasnah. M3 · the whole milestone, assembled.
 *
 * Header with the Shelves/List switch (§5.3.5), the hall, and the reader.
 *
 * The view is in the URL, not in component state, for two reasons: the list is
 * linkable, and the browser Back button does something sensible after opening a
 * book. `?view=list` is read on mount and written on change.
 */

import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CosmereLibrary from '@/components/library/CosmereLibrary'
import ListView from '@/components/library/ListView'
import BookReader from '@/components/library/BookReader'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { BOOKS } from '@/data/static'
import type { Book } from '@/types'

type View = 'shelves' | 'list'

export default function LibraryPage() {
  useSEOMeta({
    title: 'Library — Cosmere Archive',
    description: 'Browse the complete Cosmere book collection in a virtual library',
  })

  // The view lives in the router's query string, not in component state.
  //
  // The obvious `window.location.search` does not work here: this is a
  // HashRouter, so a real page URL is `/?foo=1#/library` and anything after the
  // `#` belongs to the route. Reading the query through the router is also what
  // makes `/#/library?view=list` a link worth pasting, and what puts the switch
  // in history so Back does the obvious thing.
  const [params, setParams] = useSearchParams()
  const view: View = params.get('view') === 'list' ? 'list' : 'shelves'
  const [open, setOpen] = useState<Book | null>(null)

  const setView = useCallback(
    (next: View) => {
      setParams(
        next === 'list' ? { view: 'list' } : {},
        // Replacing, not pushing: toggling a display mode is not navigation.
        { replace: true },
      )
    },
    [setParams],
  )

  const openBook = useCallback((book: Book) => setOpen(book), [])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[var(--surface-void)]">
      {/* ---- header ---- */}
      <div className="relative z-20 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--border-subtle)] px-5 py-3 sm:px-8">
        <h1 className="font-[var(--font-display)] text-[var(--text-h4)] text-[var(--text-primary)] sm:text-[var(--text-h3)]">
          The Library of Jasnah
        </h1>

        <span className="hidden text-[var(--text-meta)] text-[var(--text-tertiary)] sm:inline">
          {BOOKS.length} volumes
        </span>

        {/* Shelves / List — a real segmented control, arrow-key navigable. */}
        <div
          role="tablist"
          aria-label="Library view"
          className="ml-auto flex items-center gap-0.5 rounded-[var(--radius-pill)] border border-[var(--border-interactive)] p-0.5"
        >
          {(['shelves', 'list'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              type="button"
              aria-selected={view === v}
              data-view-toggle={v}
              onClick={() => setView(v)}
              className={[
                'cursor-pointer rounded-[var(--radius-pill)] px-4 py-1.5 text-[var(--text-meta)] capitalize',
                'transition-colors duration-[var(--dur-fast)]',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                view === v
                  ? 'bg-[var(--surface-raised)] text-[var(--text-primary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]',
              ].join(' ')}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ---- body ---- */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {view === 'shelves' ? <CosmereLibrary onOpen={openBook} /> : <ListView onOpen={openBook} />}
      </div>

      {open && <BookReader book={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
