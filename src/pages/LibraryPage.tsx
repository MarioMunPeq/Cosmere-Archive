/**
 * LibraryPage — the Library of Jasnah.
 *
 * The list view is gone. A library is shelves, not a table.
 */
import { useState } from 'react'
import CosmereLibrary from '@/components/library/CosmereLibrary'
import BookReader from '@/components/library/BookReader'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { BOOKS } from '@/data/static'
import type { Book } from '@/types'

export default function LibraryPage() {
  useSEOMeta({
    title: 'Library — Cosmere Archive',
    description: 'Browse the complete Cosmere book collection in a virtual library',
  })

  const [open, setOpen] = useState<Book | null>(null)

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[var(--surface-void)]">
      {/* ---- the sign on the wall ---- */}
      <div
        className="relative z-20 flex shrink-0 flex-col items-center gap-2 px-5 pt-5 pb-3 sm:px-8"
        style={{
          background: 'linear-gradient(180deg, rgb(8 10 14 / .9) 0%, rgb(8 10 14 / 0) 100%)',
        }}
      >
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

        <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[#8a6840]">
          {BOOKS.length} volumes
        </span>
      </div>

      {/* ---- body ---- */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <CosmereLibrary onOpen={(book) => setOpen(book)} />
      </div>

      {open && <BookReader book={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
