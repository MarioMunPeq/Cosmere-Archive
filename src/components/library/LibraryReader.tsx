/**
 * LibraryReader — a volume taken off the shelf and opened at the desk.
 *
 * The cover ceremony, the leaf turn and the page block are the Codex chassis,
 * not a second reader. What is new here is the journey: the clicked spine
 * leaves its slot, grows into the volume at the centre of the desk, and the
 * same volume goes back when the reader returns it. There is no dark veil; the
 * room itself is the transition.
 *
 * On a phone the same chassis is driven with one leaf per spread and the left
 * page hidden, so the page is legible without pinching or horizontal scrolling.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Codex, { type CodexSpreadView } from '@/components/codex/Codex'
import type { CodexCoverDetails } from '@/components/codex/CodexCover'
import useMediaQuery from '@/hooks/useMediaQuery'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import { SAGA_BY_ID } from '@/data/static'
import { getBookArchiveEntry } from '@/data/static/book-archive-entries'
import { spineMaterial } from '@/navigation'
import { buildLibraryMobileSpreads, buildLibrarySpreads } from './library-book'
import type { Book } from '@/data/static/books'
import './library.css'

interface Props {
  book: Book
  /** The spine's box at the moment of the click. Null for a deep link. */
  origin: DOMRect | null
  onClose: () => void
}

interface Box {
  left: number
  top: number
  width: number
  height: number
}

type Phase = 'entering' | 'reading' | 'closing'

function boxOf(rect: DOMRect): Box {
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
}

function centreBox(): Box {
  const width = Math.min(340, Math.max(190, window.innerWidth * 0.46))
  const height = Math.min(window.innerHeight * 0.72, width * 1.48)
  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
    width,
    height,
  }
}

function TravellingVolume({ book, from, to, mode }: { book: Book; from: Box; to: Box; mode: 'enter' | 'return' }) {
  const [moving, setMoving] = useState(false)
  const series = SAGA_BY_ID.get(book.saga)?.name ?? book.saga
  const material = spineMaterial(book.saga)
  const accent = SAGA_BY_ID.get(book.saga)?.color ?? '#a8854e'

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMoving(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)
  const scaleX = to.width / Math.max(1, from.width)
  const scaleY = to.height / Math.max(1, from.height)
  const coverSrc = `${import.meta.env.BASE_URL}${book.cover}`

  const style = {
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    '--traveller-leather': `color-mix(in srgb, color-mix(in srgb, ${accent} 20%, ${material.ink}) 86%, #050403)`,
    '--traveller-gilt': `color-mix(in srgb, ${accent} 42%, #d9bd82)`,
    '--traveller-foil': material.foil,
    transform: moving
      ? `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) perspective(1400px) rotateY(${mode === 'enter' ? '0deg' : '-68deg'}) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}) rotateZ(0deg)`
      : `translate3d(0, 0, 0) perspective(1400px) rotateY(${mode === 'enter' ? '-68deg' : '0deg'}) scale(1, 1) rotateZ(${mode === 'enter' ? '-2deg' : '0deg'})`,
    opacity: moving ? (mode === 'enter' ? 0 : 0.92) : 1,
    transition:
      mode === 'enter'
        ? 'transform 920ms cubic-bezier(0.18, 0.86, 0.24, 1), opacity 220ms 700ms ease'
        : 'transform 760ms cubic-bezier(0.55, 0.08, 0.68, 0.53), opacity 180ms 560ms ease',
  } as React.CSSProperties

  return (
    <span className="library-traveller" data-mode={mode} style={style} aria-hidden="true">
      <span className="library-traveller__pages" />
      <span className="library-traveller__cover">
        <img src={coverSrc} alt="" draggable={false} />
        <span className="library-traveller__foil">{series}</span>
      </span>
    </span>
  )
}

export default function LibraryReader({ book, origin, onClose }: Props) {
  const reduced = usePrefersReducedMotion()
  const mobile = useMediaQuery('(max-width: 700px)')
  const readerRef = useRef<HTMLDivElement | null>(null)
  const enterTimer = useRef<number | null>(null)
  const closeTimer = useRef<number | null>(null)

  const spreads = useMemo<CodexSpreadView[]>(
    () => (mobile ? buildLibraryMobileSpreads(book) : buildLibrarySpreads(book)),
    [book, mobile],
  )

  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>(() => (origin && !reduced ? 'entering' : 'reading'))
  const [travel, setTravel] = useState<{ from: Box; to: Box; mode: 'enter' | 'return' } | null>(() => {
    if (!origin || reduced) return null
    return { from: boxOf(origin), to: centreBox(), mode: 'enter' }
  })

  const archive = getBookArchiveEntry(book.id)
  const series = SAGA_BY_ID.get(book.saga)?.name ?? book.saga

  const clearEnterTimer = useCallback(() => {
    if (enterTimer.current !== null) {
      window.clearTimeout(enterTimer.current)
      enterTimer.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearEnterTimer()
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current)
        closeTimer.current = null
      }
    }
  }, [clearEnterTimer])

  useEffect(() => {
    const focus = requestAnimationFrame(() => readerRef.current?.focus())
    return () => cancelAnimationFrame(focus)
  }, [book.id])

  useEffect(() => {
    if (phase !== 'entering') return
    enterTimer.current = window.setTimeout(() => {
      setPhase('reading')
      setTravel(null)
      enterTimer.current = null
    }, 980)
    return clearEnterTimer
  }, [phase, clearEnterTimer])

  const requestClose = useCallback(() => {
    if (phase === 'closing') return
    if (reduced) {
      onClose()
      return
    }

    const spine = document.querySelector<HTMLElement>(`[data-book-id="${book.id}"]`)
    const target = spine ? boxOf(spine.getBoundingClientRect()) : origin ? boxOf(origin) : null

    setPhase('closing')
    if (target) setTravel({ from: centreBox(), to: target, mode: 'return' })

    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null
      onClose()
    }, 800)
  }, [book.id, onClose, origin, phase, reduced])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      requestClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [requestClose])

  const cover: CodexCoverDetails = {
    kicker: archive?.volumeNumber ?? 'Library of Jasnah',
    title: book.title.toUpperCase(),
    subtitle: series,
    byline: 'Cosmere Archive',
    openLabel: `Open ${book.title}`,
    testId: 'library-cover',
  }

  return (
    <div
      ref={readerRef}
      className="library-reader"
      role="dialog"
      aria-modal="true"
      aria-label={`Reading ${book.title}`}
      tabIndex={-1}
      data-library-reader={book.id}
      data-phase={phase}
    >
      <button type="button" className="library-return" onClick={requestClose} data-library-return>
        <span aria-hidden="true">←</span> Return to shelf
      </button>

      <div className="library-reader__book">
        <Codex spreads={spreads} index={index} onTurn={setIndex} label={book.title} cover={cover} edition="printed" />
      </div>

      {travel && <TravellingVolume book={book} from={travel.from} to={travel.to} mode={travel.mode} />}
    </div>
  )
}
