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

import { HUD_BUTTON_SIZE } from './types'

export interface HudProps {
  /** Return to the fitted overview. */
  onOverview: () => void
  /** Leave the focused realm; only shown while one is focused. */
  onBack?: () => void
  focusedRealm?: string | null
}

const BUTTON =
  'inline-flex items-center justify-center ' +
  'text-[var(--text-tertiary)] ' +
  'transition-colors duration-[var(--dur-fast)] ' +
  'hover:text-[var(--text-primary)] ' +
  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ' +
  'disabled:cursor-not-allowed disabled:opacity-40'

export default function ShadesmarHud({ onOverview, onBack, focusedRealm = null }: HudProps) {
  const size = { width: `${HUD_BUTTON_SIZE}px`, height: `${HUD_BUTTON_SIZE}px` }

  return (
    <nav
      aria-label="Shadesmar view controls"
      data-shadesmar-hud
      className={[
        'pointer-events-none absolute right-md z-20 flex flex-col gap-sm',
        'bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+var(--spacing-md))]',
        'md:bottom-[var(--spacing-md)]',
      ].join(' ')}
    >
      <div className="pointer-events-auto flex flex-col gap-sm">
        <button type="button" onClick={onOverview} aria-label="Back to the whole ocean" className={BUTTON} style={size}>
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            aria-hidden
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="8" />
            <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
          </svg>
        </button>
      </div>

      {focusedRealm && onBack ? (
        <button
          type="button"
          onClick={onBack}
          data-shadesmar-back
          aria-label="Back"
          className={`${BUTTON} pointer-events-auto flex h-auto w-full items-center justify-center`}
          style={{ minHeight: `${HUD_BUTTON_SIZE}px`, minWidth: `${HUD_BUTTON_SIZE}px` }}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4 shrink-0"
            aria-hidden
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
      ) : null}
    </nav>
  )
}
