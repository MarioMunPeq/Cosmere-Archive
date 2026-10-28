/**
 * BookSpine — a cover-art panel with the title set like a bound volume.
 *
 * The cover art runs edge to edge, cropped to the narrow face of the book.
 * A small title plate, raised bands and gilt volume number keep the treatment
 * close to a physical spine without repeating the cover's author line.
 *
 * Variation is deterministic. A book must lean, sit and catch the light the
 * same way on every render and every reload, so the per-volume numbers come
 * from a hash of the id rather than from `Math.random()`.
 */

import { memo, useCallback, useRef, useState } from 'react'
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

/** Focal height for each jacket, chosen to keep its illustration on the spine. */
const SPINE_ART_ORIGIN: Record<string, number> = {
  arcanum_unbounded: 40,
  dawnshard: 75,
  elantris: 55,
  oathbringer: 65,
  rhythm_of_war: 72,
  shadows_of_self: 0,
  the_alloy_of_law: 0,
  the_bands_of_mourning: 0,
  the_final_empire: 0,
  the_hero_of_ages: 0,
  the_lost_metal: 0,
  the_sunlit_man: 38,
  the_way_of_kings: 100,
  the_well_of_ascension: 0,
  tress_of_the_emerald_sea: 60,
  warbreaker: 0,
  white_sand_vol_1: 20,
  white_sand_vol_2: 20,
  white_sand_vol_3: 20,
  wind_and_truth: 76,
  words_of_radiance: 100,
  yumi_and_the_nightmare_painter: 44,
}

const SPINE_ART_ZOOM: Record<string, number> = {
  arcanum_unbounded: 1.45,
  tress_of_the_emerald_sea: 1.5,
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

  // Keep the hand-set spine title restrained and legible at shelf scale.
  const labelSize = Math.max(13, Math.min(15, width * 0.145))
  const label = `${book.title} — ${seriesLabel}, volume ${index + 1} of ${total}`
  const coverSrc = `${import.meta.env.BASE_URL}${book.cover}`

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
    '--spine-art-origin-y': `${SPINE_ART_ORIGIN[book.id] ?? 50}%`,
    '--spine-art-zoom': SPINE_ART_ZOOM[book.id] ?? 1.35,
  } as CSSProperties

  const slipRef = useRef<HTMLSpanElement | null>(null)
  const [slipStyle, setSlipStyle] = useState<CSSProperties>({})

  const updateSlipPosition = useCallback(() => {
    const el = slipRef.current?.parentElement?.querySelector('.shelf-book__button')
    if (!el) return
    const rect = el.getBoundingClientRect()
    setSlipStyle({
      position: 'fixed',
      left: `${rect.left + rect.width / 2}px`,
      top: `${rect.top - 8}px`,
      transform: 'translate(-50%, -100%)',
      zIndex: 9999,
    })
  }, [])

  const handleEnter = useCallback(() => {
    onFocusBook(book)
    updateSlipPosition()
    window.addEventListener('scroll', updateSlipPosition, true)
    window.addEventListener('resize', updateSlipPosition)
  }, [book, onFocusBook, updateSlipPosition])

  const handleLeave = useCallback(() => {
    onBlurBook()
    window.removeEventListener('scroll', updateSlipPosition, true)
    window.removeEventListener('resize', updateSlipPosition)
  }, [onBlurBook, updateSlipPosition])

  return (
    <span className="shelf-book" data-active={active} style={style}>
      <button
        ref={registerRef}
        type="button"
        onClick={(event) => onOpen(book, event.currentTarget.getBoundingClientRect())}
        onFocus={() => onFocusBook(book)}
        onBlur={onBlurBook}
        onKeyDown={onKeyDown}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        aria-label={label}
        title={label}
        data-book-id={book.id}
        data-series={book.saga}
        data-active={active}
        className="shelf-book__button"
      >
        <span className="shelf-spine__leather" aria-hidden="true" />
        <span className="shelf-spine__grain" aria-hidden="true" />
        <span className="shelf-spine__cover" aria-hidden="true">
          <img src={coverSrc} alt="" loading="lazy" draggable={false} />
        </span>
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

      <span ref={slipRef} className="shelf-slip" aria-hidden="true" style={active ? slipStyle : {}}>
        <strong>{book.title}</strong>
        <span>
          {book.year ?? 'Year unrecorded'} · {seriesLabel}
        </span>
      </span>
    </span>
  )
}

export default memo(BookSpineImpl)
