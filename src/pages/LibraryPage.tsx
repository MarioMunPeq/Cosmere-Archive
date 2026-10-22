/**
 * LibraryPage — the Library of Jasnah.
 *
 * The shelf and the reader are one room. A click is a deep link
 * (`?book=the_way_of_kings`), so a volume can be sent to another reader; the
 * URL is the source of truth for what is open.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CosmereLibrary from '@/components/library/CosmereLibrary'
import LibraryReader from '@/components/library/LibraryReader'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { BOOKS } from '@/data/static'
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
  const [opening, setOpening] = useState<Opening | null>(null)

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

      {activeOpening && <LibraryReader book={activeOpening.book} origin={activeOpening.origin} onClose={closeBook} />}
    </div>
  )
}
