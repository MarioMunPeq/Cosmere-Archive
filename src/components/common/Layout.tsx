/**
 * Layout — the route frame.
 *
 * M2 · Block 2. This used to own the parchment cover bar, the hamburger drawer
 * and the whole of global navigation. Navigation now lives in
 * `src/navigation.ts` (data) and `components/layout/` (the frame), so this file
 * is only the glue between the router and the shell.
 *
 * Search is still the ⌘K palette here; M2 block 4 replaces it with the
 * minisearch dialog. It is kept wired so the ⌘K affordance in NavBar is not a
 * dead button in the meantime.
 */

import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SearchDialog from '@/components/search/SearchDialog'
import KeyboardShortcutsHelp from '@/components/ui/KeyboardShortcutsHelp'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import AppShell from '@/components/layout/AppShell'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import VisuallyHidden from '@/components/primitives/VisuallyHidden'
import { ALL_DESTINATIONS } from '@/navigation'

export default function Layout() {
  const { pathname } = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  // Each route starts at the top. Without this, scrolling a long record and
  // then opening the next one lands you halfway down it.
  useEffect(() => {
    document.getElementById('main-content')?.scrollTo({ top: 0 })
  }, [pathname])

  useKeyboardShortcut(
    [
      { key: 'k', meta: true },
      { key: 'k', ctrl: true },
    ],
    (e) => {
      if (isTextEntry(e.target)) return
      e.preventDefault()
      setSearchOpen((o) => !o)
    },
  )

  // "/" opens the search, as long as the reader is not already typing.
  useKeyboardShortcut([{ key: '/' }], (e) => {
    if (isTextEntry(e.target)) return
    e.preventDefault()
    setSearchOpen(true)
  })

  useKeyboardShortcut([{ key: '?' }], (e) => {
    if (isTextEntry(e.target)) return
    e.preventDefault()
    setShortcutsOpen((o) => !o)
  })

  return (
    <>
      {/* Bypass blocks (WCAG 2.4.1). Hidden until focused, then pinned to the
          viewport corner so the reader can actually see where focus went. */}
      <a
        href="#main-content"
        className={[
          'sr-only focus:not-sr-only focus:fixed focus:left-md focus:top-md',
          'focus:z-[var(--z-skip-link)] focus:rounded-[var(--radius-md)]',
          'focus:bg-[var(--surface-raised)] focus:px-3 focus:py-2',
          'focus:text-ui focus:text-[var(--text-primary)]',
          'focus:shadow-[var(--shadow-3)] focus:outline-none',
          'focus:[box-shadow:var(--focus-ring)]',
        ].join(' ')}
      >
        Skip to content
      </a>
      <a
        href="#nav-bar"
        className={[
          'sr-only focus:not-sr-only focus:fixed focus:left-md focus:top-[calc(var(--spacing-md)+48px)]',
          'focus:z-[var(--z-skip-link)] focus:rounded-[var(--radius-md)]',
          'focus:bg-[var(--surface-raised)] focus:px-3 focus:py-2',
          'focus:text-ui focus:text-[var(--text-primary)]',
          'focus:shadow-[var(--shadow-3)] focus:outline-none',
          'focus:[box-shadow:var(--focus-ring)]',
        ].join(' ')}
      >
        Skip to navigation
      </a>

      {searchOpen && <SearchDialog open onClose={() => setSearchOpen(false)} />}
      {shortcutsOpen && <KeyboardShortcutsHelp onClose={() => setShortcutsOpen(false)} />}

      <AppShell onSearch={() => setSearchOpen(true)} header={<Breadcrumbs />} hideTopNav={pathname === '/'}>
        <Outlet />
        {/* Inside `main` so the archive summary has a landmark (axe: region). */}
        <VisuallyHidden as="p">{ALL_DESTINATIONS.length} destinations in this archive.</VisuallyHidden>
      </AppShell>
    </>
  )
}

/** Shortcuts must not fire while someone is typing a search query. */
function isTextEntry(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}
