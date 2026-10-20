/**
 * LibraryPage — the Library of Jasnah.
 *
 * ## Chrome
 *
 * The old header was a top bar: an h1, a volume count, and a segmented
 * control with a pill shape and a blur backdrop. That is a website's header
 * in a library's costume. The library is a room; the room does not have a
 * header. What it has is a sign on the wall and a way to choose how you look
 * at the shelves.
 *
 * The sign is mounted above the cabinet. The volume count is a small brass
 * plate beside it. The view switch is two physical markers — "shelves" and
 * "list" — that sit on the rail beneath the sign, the way a bookend or a
 * bookmark does. They are still tabs, because a keyboard user still needs to
 * move between them; they are just not a segmented control anymore.
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

  const [params, setParams] = useSearchParams()
  const view: View = params.get('view') === 'list' ? 'list' : 'shelves'
  const [open, setOpen] = useState<Book | null>(null)

  const setView = useCallback(
    (next: View) => {
      setParams(next === 'list' ? { view: 'list' } : {}, { replace: true })
    },
    [setParams],
  )

  const openBook = useCallback((book: Book) => setOpen(book), [])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[var(--surface-void)]">
      {/* ---- the sign on the wall ---- */}
      <div
        className="relative z-20 flex shrink-0 flex-col items-center gap-2 px-5 pt-5 pb-3 sm:px-8"
        style={{
          background: 'linear-gradient(180deg, rgb(8 10 14 / .9) 0%, rgb(8 10 14 / 0) 100%)',
        }}
      >
        {/* Brass plate: the name. */}
        <div
          className="relative px-6 py-2"
          style={{
            background: 'linear-gradient(180deg, #3a2a14 0%, #24180a 100%)',
            border: '1px solid #5a3e1e',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(190,150,100,0.12)',
          }}
        >
          <h1 className="font-[var(--font-display)] text-[var(--text-h3)] tracking-[0.04em] text-[#d8b878] sm:text-[var(--text-h2)]">
            The Library of Jasnah
          </h1>
        </div>

        {/* A small plate beneath it: the count. */}
        <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[#8a6840]">
          {BOOKS.length} volumes
        </span>

        {/* The two markers: shelves / list. Physical tokens, not a segmented control. */}
        <div role="tablist" aria-label="Library view" className="mt-1 flex items-center gap-3">
          {(['shelves', 'list'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              type="button"
              aria-selected={view === v}
              data-view-toggle={v}
              onClick={() => setView(v)}
              className="cursor-pointer px-5 py-1.5 font-[var(--font-display)] text-[13px] capitalize transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              style={{
                background: view === v ? 'linear-gradient(180deg, #3a2a14 0%, #24180a 100%)' : 'transparent',
                border: view === v ? '1px solid #5a3e1e' : '1px solid transparent',
                color: view === v ? '#d8b878' : '#8a6840',
                boxShadow: view === v ? '0 2px 6px rgba(0,0,0,0.4)' : 'none',
              }}
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
