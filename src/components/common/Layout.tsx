import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import CommandPalette from '@/components/ui/CommandPalette'
import KeyboardShortcutsHelp from '@/components/ui/KeyboardShortcutsHelp'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackToTop from '@/components/ui/BackToTop'
import TransitionLink from '@/components/ui/TransitionLink'
import SideDrawer from '@/components/common/SideDrawer'

import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'

const NAV_SHORTCUTS: [string, string][] = [
  ['1', '/about'],
  ['2', '/characters?tab=relationships'],
  ['3', '/magic'],
  ['4', '/characters?tab=family'],
  ['5', '/heralds'],
  ['6', '/locations'],
  ['7', '/books'],
  ['8', '/characters'],
  ['9', '/locations?tab=shards'],
  ['0', '/stats'],
]

export default function Layout() {
  const location = useLocation()
  const navigate = useViewTransitionNavigate()
  const [cmdOpen, setCmdOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useKeyboardShortcut(
    [
      { key: 'k', meta: true },
      { key: 'k', ctrl: true },
    ],
    (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      e.preventDefault()
      setCmdOpen((o) => !o)
    },
  )

  useKeyboardShortcut([{ key: '/' }], (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    e.preventDefault()
    document.getElementById('cosmere-search')?.focus()
  })

  useKeyboardShortcut([{ key: '?' }], (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    e.preventDefault()
    setShortcutsOpen((o) => !o)
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (!e.altKey) return
      for (const [num, path] of NAV_SHORTCUTS) {
        if (e.key === num) {
          e.preventDefault()
          navigate(path)
          return
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  return (
    <>
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
      {shortcutsOpen && <KeyboardShortcutsHelp onClose={() => setShortcutsOpen(false)} />}
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="flex h-screen flex-col" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-main)' }}>
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-purple-700 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        <a
          href="#nav-bar"
          className="skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-12 focus:z-50 focus:rounded focus:bg-purple-700 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to navigation
        </a>

        <nav
          id="nav-bar"
          className="sticky top-0 z-10 shrink-0 border-b border-purple-900/50 backdrop-blur-sm"
          style={{ backgroundColor: 'var(--bg-nav)' }}
        >
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-200"
              aria-label="Open navigation menu"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 4h14M2 9h14M2 14h14" strokeLinecap="round" />
              </svg>
            </button>
            <TransitionLink
              to="/"
              className="shrink-0 text-sm font-bold tracking-wider text-purple-400 sm:text-base sm:tracking-wider lg:text-xl"
            >
              COSMERE ARCHIVE
            </TransitionLink>
            <TransitionLink
              to="/about"
              className="ml-auto hidden shrink-0 text-sm text-gray-500 transition-colors hover:text-gray-300 sm:inline"
            >
              About
            </TransitionLink>
          </div>
        </nav>

        <main id="main-content" className="flex min-h-0 flex-1 flex-col">
          <Breadcrumbs />
          <div
            key={location.pathname}
            className="contents animate-page-enter"
            style={{ viewTransitionName: 'page-content' }}
          >
            <Outlet />
          </div>
        </main>
        <BackToTop />
      </div>
    </>
  )
}
