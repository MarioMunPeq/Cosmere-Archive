import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import { useCodexCover } from '@/hooks/useCodexSession'
import type { CodexEdition, CodexPartId } from '@/utils/codex-pages'
import CodexObject from './CodexObject'
import CodexCover, { type CodexCoverDetails, type CoverPhase } from './CodexCover'
import CodexFlip from './CodexFlip'
import PageBlock from './PageBlock'
import Spread from './Spread'

/**
 * Codex — the physical book used by the Ars Arcanum and the Biographical
 * Archives. The desk, the cover ceremony and the page-turn mechanism live here;
 * the pages themselves are supplied as a list of spreads.
 *
 * Opening sequence (once per session):
 *   420 ms  closed cover resting on the desk
 *   900 ms  leaf turns on rotateY, backface hidden
 *   920 ms  leaf unmounted, leaving a flat, crisp spread
 *
 * Turning sequence:
 *   one leaf leaves the block, 640 ms forward or 560 ms back. Only that leaf is
 *   transformed; the settled spread is always flat. The turn can be started by
 *   a drag, a page edge, a key, or a change of `index` (Back/Forward, a deep
 *   link). A new turn interrupts the old one instead of queueing behind it.
 *
 * Reduced motion cuts straight to the destination: no cover, no leaf, no drag.
 */

type Phase = 'closed' | 'opening' | 'open'
type Direction = 'next' | 'prev'

const REST_MS = 420
const TURN_MS = 920

/** Forward and back durations mirror --dur-page-forward / --dur-page-back. */
const PAGE_MS: Record<Direction, number> = { next: 640, prev: 560 }
const DRAG_LIMIT_DEG = 72
const DRAG_COMMIT_DEG = 36
const DRAG_START_PX = 10

export interface CodexSpreadView {
  id: string
  title: string
  left: ReactNode
  right: ReactNode
  leftFolio?: string
  rightFolio?: string
  leftHeader?: string
  rightHeader?: string
  rightNoScroll?: boolean
  /** Present when the spread is a single person's record. */
  recordId?: string
}

interface Props {
  /** The ordered spreads of the open book. */
  spreads?: readonly CodexSpreadView[]
  /** Controlled position. Changes animate (unless reduced motion). */
  index?: number
  /** Called with an absolute spread index for every turn request. */
  onTurn?: (index: number) => void

  /** Single-spread shorthand, kept for the chassis tests and one-offs. */
  left?: ReactNode
  right?: ReactNode
  leftFolio?: string
  rightFolio?: string
  leftHeader?: string
  rightHeader?: string
  rightNoScroll?: boolean

  /** 0 → 1, fraction of the volume already read. Multi-spread books derive it. */
  progress?: number
  label?: string
  /** The archive part this volume belongs to. */
  part?: CodexPartId
  edition?: CodexEdition
  /** Fore-edge thumb index, owned by the page so it can point at real spreads. */
  thumbs?: ReactNode
  /** The reader already chose a closed volume on the desk; skip the cover. */
  startOpen?: boolean
  /** Cover text for the opening ceremony. Ignored when `startOpen`. */
  cover?: CodexCoverDetails
  /** Desk furniture beside the book, such as the volume tabs. */
  aside?: ReactNode
}

interface FlipState {
  from: number
  to: number
  direction: Direction
  mode: 'run' | 'drag' | 'settle'
  fromAngle: number
  toAngle: number
}

interface DragState {
  pointerId: number
  startX: number
  startY: number
  from: number
  pageWidth: number
  active: boolean
  direction: Direction | null
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
  const derivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx

  return (x: number) => {
    let t = Math.min(1, Math.max(0, x))
    for (let i = 0; i < 8; i++) {
      const error = sampleX(t) - x
      if (Math.abs(error) < 1e-6) break
      const slope = derivativeX(t)
      if (Math.abs(slope) < 1e-6) break
      t -= error / slope
    }
    return sampleY(Math.min(1, Math.max(0, t)))
  }
}

/** Mirrors --ease-page: cubic-bezier(0.33, 0.8, 0.2, 1). */
const easePage = cubicBezier(0.33, 0.8, 0.2, 1)

/** A small paper overshoot for a drag that falls back to its page. */
function easeSettle(t: number): number {
  const c1 = 1.2
  const c3 = c1 + 1
  const p = t - 1
  return 1 + c3 * p * p * p + c1 * p * p
}

function isEditable(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

function isInteractive(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest('a, button, input, textarea, select, [contenteditable="true"], [data-codex-interactive]'))
  )
}

export default function Codex({
  spreads,
  index = 0,
  onTurn,
  left,
  right,
  leftFolio,
  rightFolio,
  leftHeader,
  rightHeader,
  rightNoScroll = false,
  progress = 0,
  label = 'Ars Arcanum',
  part,
  edition = 'working',
  thumbs,
  startOpen = false,
  cover,
  aside,
}: Props) {
  const reduced = usePrefersReducedMotion()
  const { coverSeen, markCoverSeen } = useCodexCover()
  const [phase, setPhase] = useState<Phase>(() => (reduced || startOpen || coverSeen ? 'open' : 'closed'))

  const fallback: CodexSpreadView = {
    id: 'single',
    title: label,
    left: left ?? null,
    right: right ?? null,
    leftFolio,
    rightFolio,
    leftHeader,
    rightHeader,
    rightNoScroll,
  }
  const views = spreads && spreads.length > 0 ? spreads : [fallback]
  const total = views.length
  const safeIndex = Math.min(Math.max(index, 0), total - 1)
  const target = views[safeIndex] ?? fallback

  const [displayed, setDisplayed] = useState(safeIndex)
  const [flip, setFlip] = useState<FlipState | null>(null)
  const displayedRef = useRef(safeIndex)
  const indexRef = useRef(safeIndex)
  const totalRef = useRef(total)
  const flipRef = useRef<FlipState | null>(null)
  const angleRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const leafRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const suppressClickRef = useRef(false)
  const onTurnRef = useRef(onTurn)
  const pendingRef = useRef<number | null>(null)
  const hasOnTurn = Boolean(onTurn)

  useEffect(() => {
    onTurnRef.current = onTurn
  }, [onTurn])

  useEffect(() => {
    indexRef.current = safeIndex
  }, [safeIndex])

  useEffect(() => {
    totalRef.current = total
  }, [total])

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  /**
   * Opening is a callback, not an effect: it is an event (the cover finished,
   * or the reader skipped it). Resetting the settled leaf here keeps the
   * controlled index and the visible spread in step without a sync effect.
   */
  const openBook = useCallback(() => {
    markCoverSeen()
    const current = indexRef.current
    stopAnimation()
    flipRef.current = null
    pendingRef.current = null
    displayedRef.current = current
    setFlip(null)
    setDisplayed(current)
    setPhase('open')
  }, [markCoverSeen, stopAnimation])

  const skip = openBook

  useEffect(() => {
    if (phase !== 'closed') return
    const id = window.setTimeout(() => {
      markCoverSeen()
      setPhase('opening')
    }, REST_MS)
    return () => window.clearTimeout(id)
  }, [markCoverSeen, phase])

  useEffect(() => {
    if (phase !== 'opening') return
    const id = window.setTimeout(openBook, TURN_MS)
    return () => window.clearTimeout(id)
  }, [openBook, phase])

  useEffect(() => {
    if (phase === 'open') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') skip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, skip])

  const paint = useCallback((direction: Direction, angle: number) => {
    const leaf = leafRef.current
    if (!leaf) return
    const signed = direction === 'next' ? -angle : angle
    leaf.style.transform = `rotateY(${signed.toFixed(2)}deg)`
    leaf.style.setProperty('--flip-progress', (angle / 180).toFixed(4))
  }, [])

  // The controlled index is the source of truth. A change starts a turn; a
  // change in the middle of a turn commits the in-flight destination first and
  // turns again from there, so rapid keys never queue up behind stale motion.
  useEffect(() => {
    if (pendingRef.current === safeIndex) pendingRef.current = null

    if (phase !== 'open' || reduced) {
      stopAnimation()
      return
    }

    const running = flipRef.current
    if (running) {
      if (running.to === safeIndex) return
      stopAnimation()
      const landed = running.to
      flipRef.current = null
      setFlip(null)
      displayedRef.current = landed
      setDisplayed(landed)
      if (landed === safeIndex) return
    }

    if (displayedRef.current === safeIndex) return

    const direction: Direction = safeIndex > displayedRef.current ? 'next' : 'prev'
    const next: FlipState = {
      from: displayedRef.current,
      to: safeIndex,
      direction,
      mode: 'run',
      fromAngle: 0,
      toAngle: 180,
    }
    flipRef.current = next
    setFlip(next)
  }, [phase, reduced, safeIndex, stopAnimation])

  // One driver for taps, keys and the release half of a drag. The animation
  // writes straight to the leaf; React state only changes when it lands.
  useEffect(() => {
    if (!flip) return

    if (flip.mode === 'drag') {
      angleRef.current = 0
      paint(flip.direction, 0)
      return
    }

    const startAngle = flip.mode === 'settle' ? flip.fromAngle : 0
    const distance = Math.abs(flip.toAngle - startAngle) / 180
    const duration = Math.max(120, PAGE_MS[flip.direction] * distance)
    const started = performance.now()

    // A drag that falls short springs the page back with a little paper
    // overshoot; committed turns and every other gesture keep the house easing.
    const ease = flip.mode === 'settle' && flip.toAngle === 0 ? easeSettle : easePage

    const tick = () => {
      const now = performance.now()
      const elapsed = Math.min(1, (now - started) / duration)
      const angle = startAngle + (flip.toAngle - startAngle) * ease(elapsed)
      angleRef.current = angle
      paint(flip.direction, angle)
      if (elapsed < 1) {
        rafRef.current = window.requestAnimationFrame(tick)
        return
      }

      rafRef.current = null
      flipRef.current = null
      setFlip(null)
      if (flip.toAngle >= 180) {
        displayedRef.current = flip.to
        setDisplayed(flip.to)
      }
    }

    rafRef.current = window.requestAnimationFrame(tick)
    return () => stopAnimation()
  }, [flip, paint, stopAnimation])

  useEffect(
    () => () => {
      stopAnimation()
    },
    [stopAnimation],
  )

  const currentIndex = phase === 'open' && !reduced && flip ? flip.to : safeIndex
  const canPrev = Boolean(onTurn) && currentIndex > 0
  const canNext = Boolean(onTurn) && currentIndex < total - 1

  const goTo = useCallback(
    (nextIndex: number) => {
      if (!onTurn) return
      if (nextIndex < 0 || nextIndex >= totalRef.current) return
      const base = pendingRef.current ?? flipRef.current?.to ?? indexRef.current
      if (nextIndex === base) return
      pendingRef.current = nextIndex
      onTurn(nextIndex)
    },
    [onTurn],
  )

  useEffect(() => {
    if (phase !== 'open' || !hasOnTurn) return

    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
      if (isEditable(event.target)) return
      // Fold-out charts own their arrow keys; without this, scrolling the
      // Kholin tree would turn the page instead of revealing the next branch.
      if (event.target instanceof Element && event.target.closest('[data-codex-interactive]')) return
      if (dragRef.current?.active) return

      const base = pendingRef.current ?? flipRef.current?.to ?? indexRef.current
      let next: number | null = null
      if (event.key === 'ArrowLeft') next = base - 1
      else if (event.key === 'ArrowRight') next = base + 1
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = totalRef.current - 1
      if (next === null) return
      if (next < 0 || next >= totalRef.current || next === base) return
      event.preventDefault()
      pendingRef.current = next
      onTurnRef.current?.(next)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hasOnTurn, phase])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== 'open' || reduced || !onTurn) return
    if (event.button !== 0 || event.isPrimary === false) return
    if (isInteractive(event.target)) return
    if (flipRef.current) return

    const book = stageRef.current?.querySelector<HTMLElement>('.codex-book')
    const rect = book?.getBoundingClientRect()
    if (!rect || rect.width < 1 || rect.height < 1) return
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      return
    }
    if (totalRef.current < 2) return

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      from: displayedRef.current,
      pageWidth: rect.width / 2,
      active: false,
      direction: null,
    }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY

    if (!drag.active) {
      if (Math.abs(dx) < DRAG_START_PX || Math.abs(dx) <= Math.abs(dy) * 1.2) return
      if (flipRef.current) return

      const direction: Direction = dx < 0 ? 'next' : 'prev'
      const to = direction === 'next' ? drag.from + 1 : drag.from - 1
      if (to < 0 || to >= totalRef.current) return

      drag.active = true
      drag.direction = direction
      suppressClickRef.current = true
      stageRef.current?.setAttribute('data-dragging', 'true')
      window.getSelection()?.removeAllRanges()
      try {
        stageRef.current?.setPointerCapture(event.pointerId)
      } catch {
        // Capture is a convenience; the turn still works without it.
      }

      const preview: FlipState = {
        from: drag.from,
        to,
        direction,
        mode: 'drag',
        fromAngle: 0,
        toAngle: 180,
      }
      flipRef.current = preview
      setFlip(preview)
    }

    if (!drag.active || !drag.direction) return
    event.preventDefault()

    const angle = Math.min(DRAG_LIMIT_DEG, (Math.abs(dx) / Math.max(1, drag.pageWidth)) * 180)
    angleRef.current = angle
    paint(drag.direction, angle)
  }

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    stageRef.current?.removeAttribute('data-dragging')

    try {
      stageRef.current?.releasePointerCapture(event.pointerId)
    } catch {
      // Nothing captured.
    }

    if (drag.active && drag.direction) {
      const to = drag.direction === 'next' ? drag.from + 1 : drag.from - 1
      const complete = !cancelled && angleRef.current >= DRAG_COMMIT_DEG && to >= 0 && to < totalRef.current
      const settle: FlipState = {
        from: drag.from,
        to,
        direction: drag.direction,
        mode: 'settle',
        fromAngle: angleRef.current,
        toAngle: complete ? 180 : 0,
      }
      flipRef.current = settle
      setFlip(settle)
      if (complete) {
        pendingRef.current = to
        onTurn?.(to)
      }
    }

    window.setTimeout(() => {
      suppressClickRef.current = false
    }, 0)
  }

  const onClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return
    suppressClickRef.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  const renderPages = () => {
    if (flip && phase === 'open' && !reduced) {
      const from = views[flip.from]
      const to = views[flip.to]
      if (from && to) {
        return (
          <CodexFlip key={`${from.id}->${to.id}`} from={from} to={to} direction={flip.direction} leafRef={leafRef} />
        )
      }
    }

    const view = views[phase === 'open' && !reduced ? displayed : safeIndex] ?? target
    return (
      <Spread
        left={view.left}
        right={view.right}
        leftFolio={view.leftFolio}
        rightFolio={view.rightFolio}
        leftHeader={view.leftHeader}
        rightHeader={view.rightHeader}
        rightNoScroll={view.rightNoScroll}
      />
    )
  }

  const coverPhase: CoverPhase = phase === 'opening' ? 'opening' : 'closed'
  const progressValue = total > 1 ? safeIndex / (total - 1) : progress
  const shown = views[phase === 'open' && !reduced ? displayed : safeIndex] ?? target

  return (
    <div
      className="codex"
      data-phase={phase}
      data-edition={edition}
      data-part={part}
      data-codex-spread={target.id}
      data-character-card={target.recordId}
      data-aside={aside ? 'true' : undefined}
    >
      <CodexObject>
        <div
          ref={stageRef}
          className="codex-stage"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(event) => finishDrag(event, false)}
          onPointerCancel={(event) => finishDrag(event, true)}
          onClickCapture={onClickCapture}
        >
          <PageBlock progress={progressValue} label={label}>
            {renderPages()}

            {phase === 'open' && <span key={shown.id} className="codex-ribbon" aria-hidden="true" />}
            {phase === 'open' && thumbs}

            {phase === 'open' && canPrev && (
              <button
                type="button"
                className="codex-edge codex-edge--prev"
                aria-label="Previous spread"
                onClick={() => goTo(currentIndex - 1)}
              />
            )}
            {phase === 'open' && canNext && (
              <button
                type="button"
                className="codex-edge codex-edge--next"
                aria-label="Next spread"
                onClick={() => goTo(currentIndex + 1)}
              />
            )}

            {phase !== 'open' && <CodexCover phase={coverPhase} onSkip={skip} details={cover} />}
          </PageBlock>
        </div>
        {aside}
      </CodexObject>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Spread {safeIndex + 1} of {total} — {target.title}
      </p>
    </div>
  )
}
