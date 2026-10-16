/**
 * AppShell — the frame every screen renders inside.
 *
 * Owns the vertical budget so no screen has to: 56px of navigation at the top,
 * `main` takes what is left, 64px of navigation at the bottom below 768px. The
 * old Layout put the page in a plain `flex-1` with no reserved bottom row and
 * no fixed heights, so every screen re-derived the padding and several got it
 * wrong at the fold.
 *
 * `main` is the scroll container. Keeping scroll ownership in one place is what
 * lets the bottom bar stay put instead of scrolling away.
 */

import type { ReactNode } from 'react'
import NavBar from './NavBar'
import BottomNav from './BottomNav'

interface Props {
  children: ReactNode
  /** Sticky bar above the page content, e.g. breadcrumbs or filters. */
  header?: ReactNode
  /** Opens the global search. Wired to ⌘K for now; M2 block 4 replaces it. */
  onSearch?: () => void
  /** Hide the bottom bar, for full-bleed pieces such as Shadesmar. */
  hideBottomNav?: boolean
}

export default function AppShell({ children, header, onSearch, hideBottomNav = false }: Props) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--surface-void)] text-[var(--text-primary)]">
      <NavBar onSearch={onSearch} />

      <main id="main-content" tabIndex={-1} className="relative flex min-h-0 flex-1 flex-col focus:outline-none">
        {header}
        {children}
      </main>

      {!hideBottomNav && <BottomNav />}
    </div>
  )
}
