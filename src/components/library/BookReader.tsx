/**
 * BookReader — opening a volume, in 2D. M3 · block 4.
 *
 * Replaces a 1 000-line React Three Fiber reader (BookCanvas, BookScene,
 * BookModel3D, BookAnimator, CornerFold, screen-to-world, page-texture) whose
 * output was: a text overlay floating over an angled grey box, with a page curl
 * that mutated 36×4 vertices every frame. For reading a paragraph.
 *
 * The decision in §5.3 was 2D with a page flip, and this is that, done with CSS
 * only:
 *
 *   opening   the book rises and settles — a spring, not a slide
 *   turning   a leaf rotates on the spine with `rotateY`, front face to back,
 *             landing exactly over the left page
 *   closing   the reverse
 *
 * Why not WebGL. The old reader loaded ~243 KB of `three` + `@react-three/*` to
 * draw a box and rotate a quad. It also put real text inside a 3D transform,
 * where the browser rasterises it at the projected angle, blurs it, and makes
 * selection unreliable. Both problems disappear by not leaving 2D. (The Awwwards
 * argument for keeping it was the *page curl*; the flip below keeps the motion
 * and drops the runtime, which is the better trade for a reading experience.)
 *
 * Accessibility, because a reading surface that cannot be operated is not a
 * reading surface: `role="dialog"`, Escape to close, arrows to turn, focus moved
 * in on open and restored to the exact spine on close, and every page in the
 * book is in the DOM order rather than being a canvas.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PageSurface from './PageSurface'
import { generatePages } from './BookContent'
import { spineMaterial } from '@/navigation'
import type { Book } from '@/types'

interface Props {
  book: Book
  onClose: () => void
}

/** How long the leaf takes to cross. Matches the CSS below. */
const FLIP_MS = 700

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
  const [closed, setClosed] = useState(false)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const turnTimer = useRef<number | null>(null)

  const material = spineMaterial(book.saga)
  const spreadCount = spreads.length
  const canPrev = spread > 0
  const canNext = spread < spreadCount - 1

  /**
   * The leaf in flight.
   *
   * Forward: the current right page rotates away, and its back is the next
   * spread's left page. When it lands it covers the old left page exactly, so
   * the commit below is invisible.
   */
  const leaf = useMemo(() => {
    if (turn === 'none') return null
    const current = spreads[spread]!
    if (turn === 'forward') {
      const next = spreads[spread + 1]
      if (!next) return null
      return {
        front: current.right!,
        back: next.left,
        targetSpread: spread + 1,
        key: `f-${spread}`,
      }
    }
    const prev = spreads[spread - 1]
    if (!prev) return null
    return {
      front: current.left,
      back: prev.right ?? prev.left,
      targetSpread: spread - 1,
      key: `b-${spread}`,
    }
  }, [turn, spreads, spread])

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, spreadCount - 1))
      if (clamped === spread || turn !== 'none') return
      setTurn(clamped > spread ? 'forward' : 'back')
      turnTimer.current = window.setTimeout(() => {
        setSpread(clamped)
        setTurn('none')
      }, FLIP_MS)
    },
    [spread, spreadCount, turn],
  )

  const next = useCallback(() => goTo(spread + 1), [goTo, spread])
  const prev = useCallback(() => goTo(spread - 1), [goTo, spread])

  const close = useCallback(() => {
    setClosed(true)
    window.setTimeout(onClose, 380)
  }, [onClose])

  // Move focus in on open, and put it back on the spine we came from.
  useEffect(() => {
    dialogRef.current?.focus()
    return () => {
      const el = document.querySelector<HTMLElement>(`[data-book-id="${book.id}"]`)
      el?.focus()
    }
  }, [book.id])

  useEffect(
    () => () => {
      if (turnTimer.current) window.clearTimeout(turnTimer.current)
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
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, next, prev])

  const current = spreads[spread]!
  const folioLeft = spread * 2 + 1
  const folioRight = spread * 2 + 2

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        // The room goes quiet and dark so the paper is the only lit thing.
        background: 'rgb(4 5 8 / .82)',
        backdropFilter: 'blur(6px)',
        animation: 'reader-fade 380ms var(--ease-standard) both',
      }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${book.title}, open book`}
        tabIndex={-1}
        className="relative flex min-h-0 flex-1 flex-col outline-none"
        style={{
          animation: `book-open 520ms var(--ease-spring) both${closed ? ' book-close 380ms var(--ease-exit) both' : ''}`,
        }}
      >
        {/* ---- header ---- */}
        <header className="flex shrink-0 items-center gap-4 px-5 py-4 sm:px-8">
          <h2
            className="truncate text-[var(--text-ui)] text-[var(--text-primary)] sm:text-[var(--text-body)]"
            style={{ color: material.foil }}
          >
            {book.title}
          </h2>
          <span className="hidden text-[var(--text-meta)] text-[var(--text-tertiary)] sm:inline">
            {spreads[spread]?.left.title ?? ''}
          </span>

          <button
            type="button"
            onClick={close}
            aria-label="Close book"
            className="ml-auto grid size-11 cursor-pointer place-items-center rounded-full border border-[var(--border-interactive)] text-[var(--text-secondary)] transition-colors duration-[var(--dur-fast)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* ---- the book ---- */}
        <div className="flex min-h-0 flex-1 items-center justify-center px-3 pb-2 sm:px-8">
          <div
            data-book-spread
            className="relative grid w-full max-w-[min(1180px,100%)] overflow-hidden"
            style={{
              // The cover board, seen edge-on around the paper block.
              background: `linear-gradient(180deg, ${material.ink} 0%, color-mix(in srgb, ${material.ink} 82%, #000) 100%)`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 40px 90px -30px rgb(0 0 0 / .85), 0 2px 0 rgb(255 255 255 / .05)',
              aspectRatio: '16 / 10',
              maxHeight: '100%',
              // Perspective on the parent is what makes the leaf read as turning
              // in space rather than as a scaling div.
              perspective: '2400px',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* left page.
                Absolutely positioned rather than a grid item: with a grid, the
                row was sized by the page's content, so a long character entry
                pushed the page to 807px inside a 738px book and the folio fell
                off the bottom edge. `inset-y-0` gives it a definite height. */}
            <div className="absolute inset-y-0 left-0 w-1/2 min-w-0 [transform:translateZ(0.5px)]">
              <PageSurface
                page={current.left}
                folio={folioLeft}
                runningHead={book.title}
                series={book.saga}
                side="left"
              />
            </div>

            {/* right page */}
            <div className="absolute inset-y-0 right-0 w-1/2 min-w-0 [transform:translateZ(0.5px)]">
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
                  <span className="text-[var(--text-on-page-tertiary)] text-[var(--text-meta)] uppercase tracking-[0.2em]">
                    End of record
                  </span>
                </div>
              )}
            </div>

            {/* the spine, a hairline down the middle */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-1/2 w-[6px] -translate-x-1/2"
              style={{
                background: `linear-gradient(90deg, rgb(0 0 0 / .18), ${material.ink} 45%, rgb(0 0 0 / .18))`,
                opacity: 0.55,
              }}
            />

            {/* the leaf in flight */}
            {leaf && (
              <div
                key={leaf.key}
                data-leaf
                data-direction={turn}
                className="absolute inset-y-0 w-1/2 overflow-hidden"
                style={{
                  // Both turns hinge on the spine. A forward turn lifts the right
                  // page and swings it left; a backward turn lifts the left page
                  // and swings it right. Getting this wrong puts the hinge on
                  // the fore-edge, which reads as a door rather than a page.
                  [turn === 'forward' ? 'left' : 'right']: '50%',
                  transformOrigin: 'left center',
                  animation: `${turn === 'forward' ? 'leaf-flip-forward' : 'leaf-flip-back'} ${FLIP_MS} var(--ease-standard) both`,
                  backfaceVisibility: 'hidden',
                  zIndex: 2,
                }}
              >
                <div className="absolute inset-0 [backface-visibility:hidden]">
                  <PageSurface
                    page={leaf.front}
                    folio={turn === 'forward' ? folioRight : folioLeft}
                    runningHead={book.title}
                    series={book.saga}
                    side={turn === 'forward' ? 'right' : 'left'}
                  />
                </div>
                <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <PageSurface
                    page={leaf.back}
                    folio={turn === 'forward' ? folioLeft : folioRight}
                    runningHead={book.title}
                    series={book.saga}
                    side={turn === 'forward' ? 'left' : 'right'}
                  />
                </div>
                {/* the shadow that travels across a turning leaf */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    animation: `leaf-shade ${FLIP_MS} var(--ease-standard) both`,
                    background:
                      turn === 'forward'
                        ? 'linear-gradient(90deg, rgb(0 0 0 / .38), rgb(0 0 0 / 0) 55%)'
                        : 'linear-gradient(270deg, rgb(0 0 0 / .38), rgb(0 0 0 / 0) 55%)',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ---- click zones + controls ---- */}
        <div className="flex shrink-0 items-center justify-center gap-1 pb-5 pt-3 sm:gap-3">
          <button
            type="button"
            onClick={prev}
            disabled={!canPrev}
            aria-label="Previous page"
            className="grid size-11 cursor-pointer place-items-center rounded-full border border-[var(--border-interactive)] text-[var(--text-secondary)] transition-colors duration-[var(--dur-fast)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <p className="min-w-[7.5rem] text-center text-[var(--text-ui)] text-[var(--text-tertiary)] tabular-nums">
            {folioLeft}
            <span className="px-2 text-[var(--text-disabled)]">/</span>
            {pages.length}
          </p>

          <button
            type="button"
            onClick={next}
            disabled={!canNext}
            aria-label="Next page"
            className="grid size-11 cursor-pointer place-items-center rounded-full border border-[var(--border-interactive)] text-[var(--text-secondary)] transition-colors duration-[var(--dur-fast)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes reader-fade {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        /* the book rises off the shelf and settles, rather than sliding in */
        @keyframes book-open {
          from { opacity: 0; transform: translateY(28px) rotateX(9deg) scale(.9) }
          to   { opacity: 1; transform: translateY(0)    rotateX(0)   scale(1) }
        }
        @keyframes book-close {
          from { opacity: 1; transform: translateY(0)    rotateX(0)   scale(1) }
          to   { opacity: 0; transform: translateY(20px) rotateX(6deg) scale(.93) }
        }
        @keyframes leaf-flip-forward {
          from { transform: rotateY(0deg) }
          to   { transform: rotateY(-180deg) }
        }
        @keyframes leaf-flip-back {
          from { transform: rotateY(0deg) }
          to   { transform: rotateY(180deg) }
        }
        /* the light falls off the leaf as it passes vertical, then returns */
        @keyframes leaf-shade {
          0%   { opacity: 0 }
          30%  { opacity: .85 }
          50%  { opacity: 1 }
          70%  { opacity: .7 }
          100% { opacity: 0 }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-book-spread], [data-leaf] { animation-duration: 1ms !important }
        }
      `}</style>
    </div>
  )
}
