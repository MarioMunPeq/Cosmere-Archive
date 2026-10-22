/**
 * BookSpine — a volume as a made object, not a crop of its cover.
 *
 * The shelf is the first thing a visitor reads, and a row of cover crops reads
 * as a row of thumbnails. A spine is a piece of bookbinding: cloth or leather,
 * raised bands, a paper label, a gilt rule and the volume number stamped at the
 * foot. Everything below is made from those parts, in CSS, so nothing is
 * fetched and nothing is cut off.
 *
 * Variation is deterministic. A book must lean, sit and catch the light the
 * same way on every render and every reload, so the per-volume numbers come
 * from a hash of the id rather than from `Math.random()`.
 */

import { memo } from 'react'
import type { CSSProperties } from 'react'
import { SAGA_BY_ID } from '@/data/static'
import { spineMaterial } from '@/navigation'
import type { Book } from '@/data/static/books'

interface Props {
  book: Book
  seriesLabel: string
  /** Position within its series, for the accessible name. */
  index: number
  total: number
  width: number
  height: number
  /** Set when this book is pointed at or has keyboard focus. */
  active: boolean
  onOpen: (book: Book, source: DOMRect) => void
  onFocusBook: (book: Book) => void
  onBlurBook: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  registerRef: (el: HTMLButtonElement | null) => void
}

/** A stable 0–1 from the book id. */
export function spineHash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

function BookSpineImpl({
  book,
  seriesLabel,
  index,
  total,
  width,
  height,
  active,
  onOpen,
  onFocusBook,
  onBlurBook,
  onKeyDown,
  registerRef,
}: Props) {
  const material = spineMaterial(book.saga)
  const accent = SAGA_BY_ID.get(book.saga)?.color ?? '#a8854e'
  const tone = spineHash(`${book.id}:tone`)
  const lean = (spineHash(`${book.id}:lean`) - 0.5) * 1.15
  const settle = (spineHash(`${book.id}:settle`) - 0.5) * 5

  // A cloth, not a neon block: the series colour is a tint in the dark ink.
  const leather = `color-mix(in srgb, color-mix(in srgb, ${accent} 20%, ${material.ink}) ${Math.round(
    82 + tone * 14,
  )}%, #050403)`
  const leatherLow = `color-mix(in srgb, ${leather} 76%, #000)`
  const leatherHigh = `color-mix(in srgb, ${leather} 86%, #d8c6a8)`
  const gilt = `color-mix(in srgb, ${accent} 42%, #d9bd82)`

  // The spine is a shelf object, not a poster: the label stays at 13px even
  // when the title is long, and never breaks a word that can fit on one line.
  const labelSize = Math.max(13, Math.min(15, width * 0.145))
  const label = `${book.title} — ${seriesLabel}, volume ${index + 1} of ${total}`

  const style = {
    width,
    height,
    '--spine-leather': leather,
    '--spine-leather-low': leatherLow,
    '--spine-leather-high': leatherHigh,
    '--spine-gilt': gilt,
    '--spine-foil': material.foil,
    '--spine-lean': `${lean.toFixed(3)}deg`,
    '--spine-settle': `${settle.toFixed(1)}px`,
    '--spine-label-size': `${labelSize.toFixed(1)}px`,
  } as CSSProperties

  return (
    <span className="shelf-book" data-active={active} style={style}>
      <button
        ref={registerRef}
        type="button"
        onClick={(event) => onOpen(book, event.currentTarget.getBoundingClientRect())}
        onFocus={() => onFocusBook(book)}
        onBlur={onBlurBook}
        onKeyDown={onKeyDown}
        onMouseEnter={() => onFocusBook(book)}
        onMouseLeave={onBlurBook}
        aria-label={label}
        title={label}
        data-book-id={book.id}
        data-series={book.saga}
        data-active={active}
        className="shelf-book__button"
      >
        <span className="shelf-spine__leather" aria-hidden="true" />
        <span className="shelf-spine__grain" aria-hidden="true" />
        <span className="shelf-spine__band shelf-spine__band--one" aria-hidden="true" />
        <span className="shelf-spine__band shelf-spine__band--two" aria-hidden="true" />
        <span className="shelf-spine__band shelf-spine__band--three" aria-hidden="true" />
        <span className="shelf-spine__band shelf-spine__band--four" aria-hidden="true" />

        <span className="shelf-spine__label" data-spine-title>
          {book.title}
        </span>

        <span className="shelf-spine__volume" data-volume={String(index + 1).padStart(2, '0')} aria-hidden="true" />

        <span className="shelf-spine__glow" aria-hidden="true" />
      </button>

      <span className="shelf-slip" aria-hidden="true">
        <strong>{book.title}</strong>
        <span>
          {book.year ?? 'Year unrecorded'} · {seriesLabel}
        </span>
      </span>
    </span>
  )
}

export default memo(BookSpineImpl)
