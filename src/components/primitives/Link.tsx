/**
 * Link — the only internal link in the archive.
 *
 * Wraps react-router's `NavLink` so that three things are always true:
 *
 *  1. It is a real `<a href>`, so it can be middle-clicked, opened in a new
 *     tab and crawled. The drawer used to render `<button onClick>` for every
 *     destination, which broke all three.
 *  2. It marks the current destination with `aria-current="page"`, not only
 *     with a colour, so the active item is announced.
 *  3. It focuses its target after navigation, so keyboard users do not get
 *     dumped back at the top of the document.
 *
 * `end` matters for index routes: without it `/` would be permanently
 * "current" and highlight on every page.
 */

import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'

export type LinkTone = 'default' | 'muted' | 'accent'
export type LinkToneMode = 'dark' | 'paper'

interface Props {
  to: string
  children: ReactNode
  tone?: LinkTone
  toneMode?: LinkToneMode
  className?: string
  /** Match only the exact path. Defaults to true for `/`. */
  end?: boolean
  /** Focus the <h1> of the destination page after navigating. */
  restoreFocus?: boolean
  /** Draw the hover rule beneath the label. */
  underline?: boolean
}

const TONE: Record<LinkToneMode, Record<LinkTone, string>> = {
  dark: {
    default: 'text-[var(--text-primary)] hover:text-[var(--text-link)]',
    muted: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    accent: 'text-[var(--text-accent)] hover:text-[var(--shard-harmony)]',
  },
  paper: {
    default: 'text-[var(--text-on-page-primary)] hover:text-[var(--text-on-page-link)]',
    muted: 'text-[var(--text-on-page-secondary)] hover:text-[var(--text-on-page-primary)]',
    accent: 'text-[var(--text-on-page-accent)] hover:text-[var(--text-on-page-link)]',
  },
}

export default function Link({
  to,
  children,
  tone = 'default',
  toneMode = 'dark',
  className = '',
  end,
  restoreFocus = false,
  underline = false,
}: Props) {
  const location = useLocation()
  const ref = useRef<HTMLAnchorElement | null>(null)
  const prevPath = useRef(location.pathname)

  // Only move focus on a real navigation, never on the first render.
  useEffect(() => {
    if (restoreFocus && prevPath.current !== location.pathname) {
      prevPath.current = location.pathname
      const h1 = document.querySelector<HTMLElement>('main h1, main [data-page-title]')
      h1?.focus({ preventScroll: true })
    }
  }, [location.pathname, restoreFocus])

  const isEnd = end ?? (to === '/' || !to.includes('?'))

  return (
    <NavLink
      ref={ref}
      to={to}
      end={isEnd}
      className={[
        'rounded-[var(--radius-sm)] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
        'focus-visible:outline-none',
        toneMode === 'paper'
          ? 'focus-visible:[box-shadow:var(--focus-ring-on-page)]'
          : 'focus-visible:[box-shadow:var(--focus-ring)]',
        underline
          ? 'underline decoration-[var(--border-interactive)] decoration-1 underline-offset-[6px] hover:decoration-current'
          : '',
        TONE[toneMode][tone],
        className,
      ].join(' ')}
    >
      {({ isActive }) => (
        <span aria-current={isActive ? 'page' : undefined} className="inline-flex items-center gap-[var(--space-2xs)]">
          {children}
        </span>
      )}
    </NavLink>
  )
}
