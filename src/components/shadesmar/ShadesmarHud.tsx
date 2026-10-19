/**
 * The canvas HUD — §5.5.2's "for whoever does not use gestures".
 *
 * Three buttons, bottom right, always visible: zoom in, zoom out, and back to
 * the overview. On touch they are the only way to leave a focused realm, since
 * §5.5.2 gives touch no `Esc`.
 *
 * Criterion S.9 requires them to measure exactly 44x44. That is not a rounding
 * of a design preference: 44px is the smallest target that clears WCAG 2.2
 * SC 2.5.8 (Target Size Minimum, 24px) with room to spare for the three of them
 * to sit in a corner of a phone without being hit by accident on the way to
 * wherever else the thumb was going.
 *
 * The whole control is a `<nav>` of real `<button>`s with names, because on a
 * page whose canvas draws no text at all, an unlabelled icon cluster is three
 * unlabelled dots to a screen reader.
 */

import { useCallback } from 'react'
import { HUD_BUTTON_SIZE, WHEEL_ZOOM_IN, WHEEL_ZOOM_OUT } from './types'

export interface HudProps {
  /** Zoom about the centre of the canvas. */
  onZoom: (factor: number) => void
  /** Return to the fitted overview. */
  onOverview: () => void
  /** Leave the focused realm; only shown while one is focused. */
  onBack?: () => void
  focusedRealm?: string | null
}

const BUTTON =
  'inline-flex items-center justify-center rounded-[var(--radius-md)] ' +
  'border border-[var(--border-interactive)] bg-[var(--surface-raised)] ' +
  'text-[var(--text-primary)] shadow-[var(--shadow-2)] ' +
  'transition-colors duration-[var(--dur-fast)] ' +
  'hover:border-[var(--text-link)] hover:text-[var(--text-link)] ' +
  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ' +
  'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--border-interactive)] disabled:hover:text-[var(--text-primary)]'

export default function ShadesmarHud({ onZoom, onOverview, onBack, focusedRealm = null }: HudProps) {
  const zoomIn = useCallback(() => onZoom(WHEEL_ZOOM_IN), [onZoom])
  const zoomOut = useCallback(() => onZoom(WHEEL_ZOOM_OUT), [onZoom])

  const size = { width: `${HUD_BUTTON_SIZE}px`, height: `${HUD_BUTTON_SIZE}px` }

  return (
    <nav
      aria-label="Shadesmar view controls"
      data-shadesmar-hud
      /*
       * Cleared above the mobile bottom navigation.
       *
       * `BottomNav` is `fixed inset-x-0 bottom-0` below `md`, so a HUD pinned to
       * `bottom-md` sits *underneath* it on a phone and its Back button cannot
       * be pressed — the tap lands on the nav's last item instead. This was
       * found by S.5, which is the only criterion that runs at 375px.
       *
       * The same `--bottom-nav-h` the nav measures itself with, plus the safe
       * area it also reserves, so the two cannot drift apart.
       */
      className={[
        'pointer-events-none absolute right-md z-20 flex flex-col gap-sm',
        'bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+var(--spacing-md))]',
        'md:bottom-[var(--spacing-md)]',
      ].join(' ')}
    >
      <div className="pointer-events-auto flex flex-col gap-sm">
        <button type="button" onClick={zoomIn} aria-label="Zoom in" className={BUTTON} style={size}>
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            aria-hidden
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button type="button" onClick={zoomOut} aria-label="Zoom out" className={BUTTON} style={size}>
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            aria-hidden
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M5 12h14" />
          </svg>
        </button>
        <button type="button" onClick={onOverview} aria-label="Back to the whole ocean" className={BUTTON} style={size}>
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            aria-hidden
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="7" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>
      </div>

      {focusedRealm && onBack ? (
        <button
          type="button"
          onClick={onBack}
          data-shadesmar-back
          className={`${BUTTON} pointer-events-auto flex h-auto w-full items-center gap-sm px-md py-sm text-[var(--text-body-s)]`}
          style={{ minHeight: `${HUD_BUTTON_SIZE}px` }}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4 shrink-0"
            aria-hidden
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 5l-7 7 7 7" />
          </svg>
          <span className="truncate">Back</span>
        </button>
      ) : null}
    </nav>
  )
}
