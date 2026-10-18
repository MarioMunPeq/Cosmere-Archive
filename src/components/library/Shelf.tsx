/**
 * Shelf — one series on one or more boards.
 *
 * M3 · block 3. The whole overflow fix lives here: the row is laid out against
 * a width **measured on the real element with a ResizeObserver**, not against a
 * constant that was 100px short of the truth and 192px out of place.
 *
 * Keyboard (§5.3.5): left and right walk the run, up and down change shelf,
 * Home and End jump to the ends. Every spine is a real <button> with a label
 * that names the volume, its series and its position.
 *
 * The side column is the one §5.3.3 budgets: 72px on desktop carrying the
 * series name vertically, which is how a real library shelf is labelled and
 * which is also the only place on screen where the series name can be set at
 * 18px without competing with the books. Below 1024px the column goes away and
 * the name becomes a horizontal heading, per the same table.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BookSpine from './BookSpine'
import ShelfPlank from './ShelfPlank'
import { fitShelf } from '@/utils/shelf-layout'
import type { Book } from '@/types'

interface Props {
  id: string
  label: string
  /** One line under the label on wide screens. */
  note: string
  books: Book[]
  /** Base spine height before the width scales it down. */
  baseHeight: number
  shadowed: boolean
  onOpen: (book: Book) => void
  onActiveChange: (book: Book | null) => void
  /** Index of this shelf, for up/down navigation. */
  shelfIndex: number
  registerShelf: (shelfIndex: number, api: ShelfApi | null) => void
}

export interface ShelfApi {
  focusSpine: (index: number) => void
  handleKey: (e: React.KeyboardEvent, index: number) => void
}

export default function Shelf({
  id,
  label,
  note,
  books,
  baseHeight,
  shadowed,
  onOpen,
  onActiveChange,
  shelfIndex,
  registerShelf,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const spineRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [available, setAvailable] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)

  /**
   * Measure the element the spines actually go into.
   *
   * This is the fix. The old code computed `containerWidth - 100` from a
   * measured parent, then laid the row out inside a container that was padded
   * 96px on each side and flanked by two 84px columns. The row had 100px more
   * to fill than it did, and Dawnshard, last in its run, went off the edge.
   */
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

  // Split into rows. A row is a flex line; the wrapper height follows.
  const rows: Book[][] = []
  for (let i = 0; i < books.length; i += layout.perRow) {
    rows.push(books.slice(i, i + layout.perRow))
  }

  return (
    <section
      aria-labelledby={`shelf-${id}`}
      data-shelf={id}
      data-rows={rows.length}
      data-per-row={layout.perRow}
      className="relative min-[1024px]:pl-[72px]"
    >
      {/* The side column: the series name, set on the shelf like a library.
          Absolutely positioned on purpose. In flow it sized the whole shelf —
          a vertical label is as tall as its text, so "The Stormlight Archive"
          plus a descriptive line made an 816px column beside a 380px row of
          books, and the books were pushed to the bottom of 300px of empty wood. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[72px] flex-col items-center justify-center gap-5 overflow-hidden min-[1024px]:flex"
        aria-hidden
      >
        <span
          className="font-[var(--font-display)] whitespace-nowrap uppercase"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: 22,
            letterSpacing: '0.16em',
            color: 'rgb(206 182 138 / .74)',
            textShadow: '0 1px 0 rgb(0 0 0 / .7)',
          }}
        >
          {label}
        </span>
        <span
          className="font-[var(--font-ui)] max-h-[45%] whitespace-nowrap uppercase"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: 13,
            letterSpacing: '0.1em',
            color: 'rgb(180 158 120 / .46)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {note}
        </span>
      </div>

      {/* The 3px inset lives here, not on the row. `clientWidth` includes an
          element's own padding, so a padded row measured 6px wider than the
          space its spines actually had and the last one hung off the edge —
          the same class of bug as the original 192px overflow, 6px smaller. */}
      <div className="min-w-0 px-[3px]">
        {/* Below 1024px there is no side column, so the name comes here. */}
        <h2
          id={`shelf-${id}`}
          className="mb-[6px] font-[var(--font-display)] text-[var(--text-h4)] text-[var(--text-secondary)] min-[1024px]:sr-only"
        >
          {label}
        </h2>

        <div ref={containerRef} className="w-full min-w-0">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative">
              <div className="flex items-end" style={{ gap: 2, minHeight: layout.height + 10 }}>
                {row.map((book) => {
                  const globalIndex = books.indexOf(book)
                  const isHovered = hovered === globalIndex
                  const neighbour = hovered !== null && globalIndex === hovered - 1 ? 'left' : 'none'
                  return (
                    <span
                      key={book.id}
                      className="transition-transform duration-[var(--dur-fast)] ease-[var(--ease-standard)]"
                      style={{
                        transform: neighbour === 'left' ? 'translateX(-5px)' : 'none',
                        zIndex: isHovered ? 5 : 1,
                      }}
                    >
                      <BookSpine
                        book={book}
                        seriesLabel={label}
                        index={globalIndex}
                        total={books.length}
                        width={layout.spineWidth}
                        height={layout.height}
                        active={isHovered}
                        onOpen={onOpen}
                        onFocusBook={(b) => {
                          setHovered(globalIndex)
                          onActiveChange(b)
                        }}
                        onBlurBook={() => {
                          setHovered((h) => (h === globalIndex ? null : h))
                          onActiveChange(null)
                        }}
                        registerRef={(el) => {
                          spineRefs.current[globalIndex] = el
                        }}
                        onKeyDown={(e) => handleKey(e, globalIndex)}
                      />
                    </span>
                  )
                })}
              </div>

              <ShelfPlank index={shelfIndex} height={16} shadowed={shadowed || rowIndex === 0} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
