/**
 * Shelf — one collection on one or more boards.
 *
 * The row is measured on the element the spines actually occupy. It is then
 * centred, not stretched: a shelf with six books should look like a shelf with
 * six books, not like a wall with a small pile at one end. The board follows the
 * row, and the brass plate that names the collection sits on the front edge of
 * the bottom board where a library would actually put it.
 *
 * Phones get one horizontal run per shelf with snap points. The page itself
 * never scrolls sideways; the shelf does, which is the interaction a shelf
 * affords anyway.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BookSpine, { spineHash } from './BookSpine'
import ShelfPlank from './ShelfPlank'
import useMediaQuery from '@/hooks/useMediaQuery'
import { fitShelf, GAP } from '@/utils/shelf-layout'
import type { Book } from '@/data/static/books'

interface Props {
  id: string
  label: string
  /** One line under the label, on wide screens. */
  note: string
  books: Book[]
  /** Base spine height before the width scales it down. */
  baseHeight: number
  shadowed: boolean
  onOpen: (book: Book, source: DOMRect) => void
  /** Index of this shelf, for up/down navigation. */
  shelfIndex: number
  registerShelf: (shelfIndex: number, api: ShelfApi | null) => void
}

export interface ShelfApi {
  focusSpine: (index: number) => void
  handleKey: (e: React.KeyboardEvent, index: number) => void
}

const MOBILE_SPINE = 88
const MOBILE_HEIGHT = 330
const BOOKEND_SPACE = 44

interface RowBook {
  book: Book
  width: number
  height: number
}

export default function Shelf({
  id,
  label,
  note,
  books,
  baseHeight,
  shadowed,
  onOpen,
  shelfIndex,
  registerShelf,
}: Props) {
  const containerRef = useRef<HTMLElement | null>(null)
  const spineRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [available, setAvailable] = useState(0)
  const [active, setActive] = useState<number | null>(null)
  const mobile = useMediaQuery('(max-width: 767px)')

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setAvailable(el.clientWidth)
    measure()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const layout = useMemo(
    () => fitShelf({ availableWidth: available, count: books.length, baseHeight }),
    [available, books.length, baseHeight],
  )

  const rows = useMemo<RowBook[][]>(() => {
    const baseWidth = mobile ? MOBILE_SPINE : layout.spineWidth
    const baseRowHeight = mobile ? MOBILE_HEIGHT : layout.height

    let widths = books.map((book) => {
      const variation = (spineHash(`${book.id}:width`) - 0.5) * 8
      return Math.round((baseWidth + variation) * 10) / 10
    })

    // The variation must never make the row overflow the space it was measured
    // against. If it would, the shelf keeps the exact fitted width and the
    // variation survives only in height and tone.
    if (!mobile && available > 0) {
      const total = widths.reduce((sum, width) => sum + width, GAP * Math.max(0, widths.length - 1))
      if (total > available - 4) widths = books.map(() => layout.spineWidth)
    }

    const all = books.map((book, index) => ({
      book,
      width: widths[index]!,
      height: Math.round(baseRowHeight * (0.94 + spineHash(`${book.id}:height`) * 0.12)),
    }))

    if (mobile) return [all]

    const out: RowBook[][] = []
    for (let index = 0; index < all.length; index += layout.perRow) {
      out.push(all.slice(index, index + layout.perRow))
    }
    return out
  }, [available, books, layout.height, layout.perRow, layout.spineWidth, mobile])

  const rowWidths = rows.map(
    (row) => row.reduce((sum, item) => sum + item.width, 0) + GAP * Math.max(0, row.length - 1),
  )
  const widestRow = rowWidths.length > 0 ? Math.max(...rowWidths) : 0
  const hasRoomForBookends = !mobile && widestRow > 0 && available - widestRow > 72
  const bayWidth = widestRow + (hasRoomForBookends ? BOOKEND_SPACE : 0)
  const flatBooks = rows.flat()
  const bookendHeight =
    flatBooks.length > 0 ? Math.max(...flatBooks.map((item) => item.height), baseHeight) : baseHeight

  const focusSpine = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, spineRefs.current.length - 1))
    spineRefs.current[clamped]?.focus()
  }, [])

  const handleKey = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          focusSpine(index + 1)
          break
        case 'ArrowLeft':
          e.preventDefault()
          focusSpine(index - 1)
          break
        case 'Home':
          e.preventDefault()
          focusSpine(0)
          break
        case 'End':
          e.preventDefault()
          focusSpine(books.length - 1)
          break
        default:
          break
      }
    },
    [focusSpine, books.length],
  )

  useEffect(() => {
    registerShelf(shelfIndex, { focusSpine, handleKey })
    return () => registerShelf(shelfIndex, null)
  }, [registerShelf, shelfIndex, focusSpine, handleKey])

  return (
    <section
      ref={containerRef}
      aria-labelledby={`shelf-${id}`}
      data-shelf={id}
      data-rows={rows.length}
      data-per-row={layout.perRow}
      data-mobile={mobile ? 'true' : 'false'}
      data-ready={available > 0 ? 'true' : 'false'}
      className="library-shelf"
    >
      <h2 id={`shelf-${id}`} className="sr-only">
        {label} — {note}
      </h2>

      <div className="library-shelf__bay" style={{ width: mobile ? '100%' : `${bayWidth}px` }}>
        <div className="library-shelf__scroll">
          <div className="library-shelf__row-wrap" style={{ width: mobile ? 'max-content' : `${bayWidth}px` }}>
            {rows.map((row, rowIndex) => {
              const lastRow = rowIndex === rows.length - 1
              return (
                <div key={rowIndex} className="library-shelf__line">
                  <div className="library-shelf__row" style={{ minHeight: bookendHeight + 10 }} data-shelf-row>
                    {hasRoomForBookends && (
                      <span className="library-bookend" aria-hidden="true" style={{ height: bookendHeight }} />
                    )}

                    {row.map((item) => {
                      const globalIndex = books.indexOf(item.book)
                      return (
                        <BookSpine
                          key={item.book.id}
                          book={item.book}
                          seriesLabel={label}
                          index={globalIndex}
                          total={books.length}
                          width={item.width}
                          height={item.height}
                          active={active === globalIndex}
                          onOpen={onOpen}
                          onFocusBook={() => setActive(globalIndex)}
                          onBlurBook={() => setActive((current) => (current === globalIndex ? null : current))}
                          registerRef={(el) => {
                            spineRefs.current[globalIndex] = el
                          }}
                          onKeyDown={(e) => handleKey(e, globalIndex)}
                        />
                      )
                    })}

                    {hasRoomForBookends && (
                      <span
                        className="library-bookend library-bookend--right"
                        aria-hidden="true"
                        style={{ height: bookendHeight }}
                      />
                    )}
                  </div>

                  <ShelfPlank
                    index={shelfIndex}
                    height={22}
                    shadowed={shadowed || rowIndex > 0}
                    label={lastRow && !mobile ? label : undefined}
                    note={lastRow && !mobile ? note : undefined}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {mobile && (
          <span className="library-plate library-plate--fixed" aria-hidden="true">
            <span className="library-plate__name">{label}</span>
            <span className="library-plate__note">{note}</span>
          </span>
        )}
      </div>
    </section>
  )
}
