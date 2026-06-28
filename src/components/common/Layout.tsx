import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SearchBar from './SearchBar'
import ThemeToggle from '@/components/ui/ThemeToggle'
import CommandPalette from '@/components/ui/CommandPalette'
import KeyboardShortcutsHelp from '@/components/ui/KeyboardShortcutsHelp'
import SpoilerToggle from '@/components/ui/SpoilerToggle'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackToTop from '@/components/ui/BackToTop'
import TransitionLink from '@/components/ui/TransitionLink'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'

function navClass(base: string) {
  return ({ isActive }: { isActive: boolean }) => `${base} ${isActive ? 'text-purple-400' : 'text-gray-500'}`
}

const NAV_SHORTCUTS: [string, string][] = [
  ['1', '/about'],
  ['2', '/relationships'],
  ['3', '/glossary'],
  ['4', '/family-tree'],
  ['5', '/heralds'],
  ['6', '/locations'],
  ['7', '/books'],
  ['8', '/characters'],
  ['9', '/shards'],
  ['0', '/stats'],
]

export default function Layout() {
  const location = useLocation()
  const navigate = useViewTransitionNavigate()
  const [cmdOpen, setCmdOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  useScrollToTop()

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
            <TransitionLink
              to="/"
              className="shrink-0 text-sm font-bold tracking-wider text-purple-400 sm:text-base sm:tracking-wider lg:text-xl"
            >
              COSMERE ARCHIVE
            </TransitionLink>
            <TransitionLink
              to="/about"
              className={navClass('hidden shrink-0 text-sm transition-colors hover:text-gray-300 sm:inline')}
            >
              About
            </TransitionLink>

            <div className="ml-auto flex items-center gap-3">
              <TransitionLink
                to="/glossary"
                className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
              >
                Glossary
              </TransitionLink>
              <TransitionLink
                to="/family-tree"
                className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
              >
                Family Tree
              </TransitionLink>
              <TransitionLink
                to="/heralds"
                className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
              >
                Heralds
              </TransitionLink>
              <TransitionLink
                to="/locations"
                className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
              >
                Locations
              </TransitionLink>
              <TransitionLink
                to="/books"
                className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
              >
                Books
              </TransitionLink>
              <TransitionLink
                to="/characters"
                className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
              >
                Characters
              </TransitionLink>
              <TransitionLink
                to="/shards"
                className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
              >
                Shards
              </TransitionLink>
              <TransitionLink
                to="/stats"
                className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
              >
                Stats
              </TransitionLink>
              <TransitionLink
                to="/timeline"
                className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
              >
                Timeline
              </TransitionLink>
              <TransitionLink
                to="/reading-order"
                className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
              >
                Reading Order
              </TransitionLink>
              <TransitionLink
                to="/magic"
                className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
              >
                Magic
              </TransitionLink>
              <SpoilerToggle />
              <ThemeToggle />
              <div className="w-48 sm:w-64">
                <SearchBar />
              </div>
            </div>
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
