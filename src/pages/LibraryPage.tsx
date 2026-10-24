/**
 * LibraryPage — the Library of Jasnah.
 *
 * The shelf and the reader are one room. A click is a deep link
 * (`?book=the_way_of_kings`), so a volume can be sent to another reader; the
 * URL is the source of truth for what is open.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import CosmereLibrary from '@/components/library/CosmereLibrary'
import LibraryReader from '@/components/library/LibraryReader'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { BOOKS, SAGAS } from '@/data/static'
import type { Book } from '@/data/static/books'

interface Opening {
  book: Book
  origin: DOMRect | null
}

export default function LibraryPage() {
  useSEOMeta({
    title: 'Library — Cosmere Archive',
    description: 'Browse the complete Cosmere book collection in a virtual library',
  })

  const [params, setParams] = useSearchParams()
  const bookParam = params.get('book')
  const seriesParam = params.get('series')
  const [opening, setOpening] = useState<Opening | null>(null)

  const series = useMemo(
    () => (seriesParam ? (SAGAS.find((candidate) => candidate.id === seriesParam) ?? null) : null),
    [seriesParam],
  )
  const seriesBooks = useMemo(
    () => (series ? BOOKS.filter((book) => book.saga === series.id).sort((a, b) => a.order - b.order) : []),
    [series],
  )

  const deepBook = useMemo(
    () => (bookParam ? (BOOKS.find((book) => book.id === bookParam) ?? null) : null),
    [bookParam],
  )

  // The URL wins on load, on Back/Forward and on a link from another page.
  // A click keeps the spine's box, so the volume can travel from its slot;
  // a deep link has no slot on screen and opens directly at the desk.
  const activeOpening = useMemo<Opening | null>(() => {
    if (!deepBook) return null
    if (opening?.book.id === deepBook.id) return opening
    return { book: deepBook, origin: null }
  }, [deepBook, opening])

  const activeId = activeOpening?.book.id ?? null
  const lastOpened = useRef<string | null>(null)

  // Focus returns to the slot only after the URL has actually released the
  // volume; before that the shelf is still inert and cannot take focus.
  useEffect(() => {
    if (activeId) {
      lastOpened.current = activeId
      return
    }

    const id = lastOpened.current
    if (!id) return
    lastOpened.current = null
    const frame = requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-book-id="${id}"]`)?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [activeId])

  const openBook = useCallback(
    (book: Book, source: DOMRect) => {
      setOpening({ book, origin: source })
      setParams((current) => {
        const next = new URLSearchParams(current)
        next.set('book', book.id)
        return next
      })
    },
    [setParams],
  )

  const closeBook = useCallback(() => {
    setOpening(null)
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('book')
        return next
      },
      { replace: true },
    )
  }, [setParams])

  const openSeriesBook = useCallback(
    (book: Book) => {
      setOpening({ book, origin: null })
      setParams((current) => {
        const next = new URLSearchParams(current)
        next.set('book', book.id)
        return next
      })
    },
    [setParams],
  )

  const clearSeries = useCallback(() => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('series')
        return next
      },
      { replace: true },
    )
  }, [setParams])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className="flex min-h-0 flex-1 flex-col"
        inert={activeOpening ? true : undefined}
        aria-hidden={activeOpening ? true : undefined}
        data-library-shelves
      >
        <CosmereLibrary onOpen={openBook} />
      </div>

      {series && !activeOpening && (
        <section
          aria-label={`Series: ${series.name}`}
          className="absolute inset-x-4 top-4 z-20 max-h-[42vh] overflow-y-auto border border-amber-900/40 bg-[#140f0c]/95 px-5 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:inset-x-6"
          style={{ borderLeft: `3px solid ${series.color}` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-serif text-[10px] uppercase tracking-[0.28em] text-amber-200/50">Series index</p>
              <h2 className="mt-1 font-serif text-2xl text-amber-50">{series.name}</h2>
              {series.description && (
                <p className="mt-2 max-w-2xl font-serif text-sm leading-relaxed text-amber-100/60">
                  {series.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={clearSeries}
              className="shrink-0 border border-amber-800/40 px-2.5 py-1 font-serif text-xs text-amber-200/60 transition-colors hover:border-amber-600/60 hover:text-amber-100"
              aria-label="Close series index"
            >
              Close
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {seriesBooks.map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() => openSeriesBook(book)}
                className="border border-amber-900/35 bg-amber-950/20 px-3 py-1.5 text-left font-serif text-sm text-amber-100/75 transition-colors hover:border-amber-700/60 hover:bg-amber-900/25 hover:text-amber-50"
              >
                {book.title}
                <span className="ml-2 font-mono text-[10px] text-amber-200/35">
                  {String(book.order + 1).padStart(2, '0')}
                </span>
              </button>
            ))}
            {seriesBooks.length === 0 && (
              <p className="font-serif text-sm italic text-amber-100/45">
                No volumes are catalogued for this series yet.
              </p>
            )}
          </div>
        </section>
      )}

      {activeOpening && <LibraryReader book={activeOpening.book} origin={activeOpening.origin} onClose={closeBook} />}
    </div>
  )
}
