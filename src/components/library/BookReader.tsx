/**
 * BookReader — taking a volume off the shelf and opening it. M3 · block 4.
 *
 * Replaces a 1 000-line React Three Fiber reader (BookCanvas, BookScene,
 * BookModel3D, BookAnimator, CornerFold, screen-to-world, page-texture) whose
 * output was a text overlay floating over an angled grey box, with a page curl
 * that mutated 36×4 vertices every frame — for reading a paragraph.
 *
 * The decision in §5.3 was 2D with a page flip, and this is that, in CSS.
 *
 * ## The opening
 *
 * The first version faded the book up and called it open. The gesture everybody
 * recognises is not a fade: the front board swings away from you on the spine
 * and lands flat on the left. So the cover is a real element, hinged at the
 * spine, that rotates 180° — showing the jacket on the way out and the
 * endpaper on the way back — and the pages underneath are simply uncovered.
 * Underneath that, the whole book rises off the shelf, tilts back towards the
 * reader and settles flat on the desk, while the shadow it throws tightens.
 *
 * ## The room
 *
 * There is a room, not a scrim: a warm pool of light from above and to the
 * left, a desk for the book to lie on, and the hall falling off into the dark
 * behind. The earlier version put the spread on `rgb(4 5 8 / .82)`, which is a
 * screenshot of a website; a book on a desk in a dark library is not.
 *
 * ## Why not WebGL
 *
 * The old reader loaded ~243 KB of three.js and @react-three/* to draw a box
 * and rotate a quad. It also put real text inside a 3D transform, where the
 * browser rasterises it at the projected angle, blurs it, and makes selection
 * unreliable. Both problems disappear by not leaving 2D. The argument for
 * keeping WebGL was the page curl; the flip keeps the motion and drops the
 * runtime.
 *
 * ## Operating it
 *
 * A reading surface that cannot be operated is not a reading surface.
 * `role="dialog"`, Escape closes, arrows turn, Home and End jump to the ends,
 * focus moves in on open and returns to the exact spine on close, and every
 * page is real text in DOM order rather than a canvas.
 *
 * One deliberate absence: there is no "click anywhere to turn" zone. It was in
 * the first version and it made the text unselectable, which on a reference
 * site is a real loss. The affordances are the corner curls on the pages, the
 * strip in the foot, and the keyboard.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import PageSurface from './PageSurface'
import { generatePages } from './BookContent'
import { spineMaterial } from '@/navigation'
import type { Book } from '@/types'
import './reader.css'
import './page.css'

interface Props {
  book: Book
  onClose: () => void
}

/** The leaf's crossing time. Matches `.leaf` in reader.css. */
const FLIP_MS = 720
/** The cover's swing, plus the delay before it starts. */
const COVER_MS = 940
const SHUT_MS = 620

/** The curl in the corner of a page: the oldest page-turn affordance there is. */
function CornerCurl({ side }: { side: 'left' | 'right' }) {
  return (
    <svg aria-hidden className={`page-curl page-curl--${side}`} viewBox="0 0 100 100" fill="none">
      {/* the sheet lifting off the block */}
      <path d="M100 100 C 62 100 34 74 30 30 L 30 100 Z" fill="currentColor" opacity="0.14" />
      <path d="M100 100 C 62 100 34 74 30 30" stroke="currentColor" strokeWidth="1.1" />
      {/* the lines of paper in the curl */}
      <path d="M94 100 C 60 99 38 76 34 36" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
      <path d="M86 100 C 57 98 41 78 38 44" stroke="currentColor" strokeWidth="0.7" opacity="0.35" />
    </svg>
  )
}

export default function BookReader({ book, onClose }: Props) {
  const pages = useMemo(() => generatePages(book), [book])
  const spreads = useMemo(
    () =>
      Array.from({ length: Math.ceil(pages.length / 2) }, (_, i) => ({
        left: pages[i * 2]!,
        right: pages[i * 2 + 1] ?? null,
      })),
    [pages],
  )

  const [spread, setSpread] = useState(0)
  const [turn, setTurn] = useState<'none' | 'forward' | 'back'>('none')
  /** 'opening' keeps the cover on screen for the length of its swing. */
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>('opening')
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const turnTimer = useRef<number | null>(null)
  const closeTimer = useRef<number | null>(null)
  const openTimer = useRef<number | null>(null)

  const material = spineMaterial(book.saga)
  const spreadCount = spreads.length
  const canPrev = spread > 0
  const canNext = spread < spreadCount - 1

  const current = spreads[spread]!
  const folioLeft = spread * 2 + 1
  const folioRight = spread * 2 + 2

  const { avif, webp } = useMemo(() => {
    const base = import.meta.env.BASE_URL
    return { avif: `${base}images/covers/${book.id}.avif`, webp: `${base}images/covers/${book.id}.webp` }
  }, [book.id])

  /**
   * The leaf in flight.
   *
   * Forward: the current right page rotates away and its back is the next
   * spread's left page. It lands exactly over the old left page, so committing
   * the index afterwards is invisible.
   */
  const leaf = useMemo(() => {
    if (turn === 'none') return null
    if (turn === 'forward') {
      const next = spreads[spread + 1]
      if (!next) return null
      return { front: current.right!, back: next.left, key: `f-${spread}` }
    }
    const prev = spreads[spread - 1]
    if (!prev) return null
    return { front: current.left, back: prev.right ?? prev.left, key: `b-${spread}` }
  }, [turn, spreads, spread, current])

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, spreadCount - 1))
      if (clamped === spread || turn !== 'none' || phase !== 'open') return
      setTurn(clamped > spread ? 'forward' : 'back')
      turnTimer.current = window.setTimeout(() => {
        setSpread(clamped)
        setTurn('none')
      }, FLIP_MS)
    },
    [spread, spreadCount, turn, phase],
  )

  const next = useCallback(() => goTo(spread + 1), [goTo, spread])
  const prev = useCallback(() => goTo(spread - 1), [goTo, spread])

  const close = useCallback(() => {
    if (phase === 'closing') return
    setPhase('closing')
    closeTimer.current = window.setTimeout(onClose, SHUT_MS)
  }, [onClose, phase])

  // The cover lifts once, then gets out of the way for good.
  useEffect(() => {
    openTimer.current = window.setTimeout(() => setPhase('open'), COVER_MS)
    return () => {
      if (openTimer.current) window.clearTimeout(openTimer.current)
    }
  }, [])

  // Move focus in on open, and put it back on the spine we came from.
  useEffect(() => {
    dialogRef.current?.focus()
    return () => {
      document.querySelector<HTMLElement>(`[data-book-id="${book.id}"]`)?.focus()
    }
  }, [book.id])

  useEffect(
    () => () => {
      if (turnTimer.current) window.clearTimeout(turnTimer.current)
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
    },
    [],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.key === 'Home') {
        e.preventDefault()
        goTo(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        goTo(spreadCount - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, next, prev, goTo, spreadCount])

  const showCover = phase === 'opening'

  return (
    <div className="reader-root">
      <div className="reader-veil" onPointerDown={close} />
      <div className="reader-desk" aria-hidden />

      {/*
        The dialog wraps the head, the book and the foot. It used to sit on the
        book element itself, which meant the turn buttons and the close button
        were outside the only element a screen reader was told about: the
        dialog contained two pages of text and nothing you could operate.
      */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${book.title}, open book`}
        tabIndex={-1}
        className="reader-dialog outline-none"
      >
        {/* ---- head ---- */}
        <header className="reader-head">
          <span className="reader-head__title">{book.title}</span>
          <span className="reader-head__where">{current.left.title}</span>
          <button type="button" onClick={close} aria-label="Close book" className="reader-close">
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* ---- the book ---- */}
        <div className="reader-stage">
          <div
            data-book-spread
            className={`book${phase === 'closing' ? ' book--closing' : ''}`}
            style={
              {
                '--book-ink': material.ink,
                '--book-ink-hi': `color-mix(in srgb, ${material.ink} 72%, #6b543a)`,
                '--book-ink-lo': `color-mix(in srgb, ${material.ink} 70%, #000)`,
                '--book-foil': material.foil,
                '--book-paper': '#f4efe4',
              } as CSSProperties
            }
          >
            <span className="book-cast" aria-hidden />

            {/* left page */}
            <div className="page page--left">
              <PageSurface
                page={current.left}
                folio={folioLeft}
                runningHead={book.title}
                series={book.saga}
                side="left"
              />
              <CornerCurl side="left" />
            </div>

            {/* right page */}
            <div className="page page--right">
              {current.right ? (
                <PageSurface
                  page={current.right}
                  folio={folioRight}
                  runningHead={book.title}
                  series={book.saga}
                  side="right"
                />
              ) : (
                <div className="grid h-full place-items-center bg-[var(--surface-page-raised)]">
                  <span className="font-[var(--font-display)] text-[var(--text-on-page-tertiary)] text-[0.7rem] uppercase tracking-[0.24em]">
                    End of record
                  </span>
                </div>
              )}
              <CornerCurl side="right" />
            </div>

            <span className="book-gutter" aria-hidden />
            <span className="book-block" aria-hidden />
            <span className="book-ribbon" aria-hidden />

            {/* the leaf in flight */}
            {leaf && (
              <div key={leaf.key} data-leaf data-direction={turn} className={`leaf leaf--${turn}`}>
                <div className="leaf__face">
                  <PageSurface
                    page={leaf.front}
                    folio={turn === 'forward' ? folioRight : folioLeft}
                    runningHead={book.title}
                    series={book.saga}
                    side={turn === 'forward' ? 'right' : 'left'}
                  />
                </div>
                <div className="leaf__face leaf__face--back">
                  <PageSurface
                    page={leaf.back}
                    folio={turn === 'forward' ? folioLeft : folioRight}
                    runningHead={book.title}
                    series={book.saga}
                    side={turn === 'forward' ? 'left' : 'right'}
                  />
                </div>
                <span className="leaf__shade" aria-hidden />
              </div>
            )}

            {/*
            The front board, hinged on the spine. Present only while it is
            swinging: once the book is open it is lying on the left page, and
            keeping it there would cover the title page forever.
          */}
            {showCover && (
              <div className="book-cover" data-book-cover>
                <div className="book-cover__face">
                  <picture>
                    <source srcSet={avif} type="image/avif" />
                    <img src={webp} alt="" aria-hidden className="book-cover__jacket" draggable={false} />
                  </picture>
                  <span className="book-cover__spine" aria-hidden />
                  <span className="book-cover__lift" aria-hidden />
                </div>
                <div className="book-cover__face book-cover__face--back" aria-hidden />
              </div>
            )}
          </div>
        </div>

        {/* ---- foot ---- */}
        <footer className="reader-foot">
          <div className="reader-foot__rule">
            <button
              type="button"
              onClick={prev}
              disabled={!canPrev || phase !== 'open'}
              aria-label="Previous page"
              className="reader-turn"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                aria-hidden
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <p className="reader-folio">
              {folioLeft}
              <em>/</em>
              {pages.length}
            </p>

            <button
              type="button"
              onClick={next}
              disabled={!canNext || phase !== 'open'}
              aria-label="Next page"
              className="reader-turn"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                aria-hidden
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {phase === 'opening' && (
            <p className="reader-hint" aria-hidden>
              <kbd>←</kbd> <kbd>→</kbd> turn · <kbd>Esc</kbd> back to the shelf
            </p>
          )}
        </footer>
      </div>
    </div>
  )
}
