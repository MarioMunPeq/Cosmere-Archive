import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import CommandPalette from '@/components/ui/CommandPalette'
import KeyboardShortcutsHelp from '@/components/ui/KeyboardShortcutsHelp'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackToTop from '@/components/ui/BackToTop'
import TransitionLink from '@/components/ui/TransitionLink'
import ParchmentMenu from '@/components/common/ParchmentMenu'

import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'

const NAV_SHORTCUTS: [string, string][] = [
  ['1', '/about'],
  ['2', '/characters?tab=connections'],
  ['3', '/magic'],
  ['4', '/characters?tab=bloodlines'],
  ['5', '/aharietiam'],
  ['6', '/celestial-charts'],
  ['7', '/books'],
  ['8', '/characters'],
  ['9', '/celestial-charts?tab=shards'],
  ['0', '/stats'],
  ['s', '/shadesmar'],
]

export default function Layout() {
  const location = useLocation()
  const navigate = useViewTransitionNavigate()
  const [cmdOpen, setCmdOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)
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
      <div className="flex h-screen flex-col" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-main)' }}>
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-amber-800 focus:px-3 focus:py-2 focus:text-sm focus:text-amber-100"
        >
          Skip to content
        </a>
        <a
          href="#nav-bar"
          className="skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-12 focus:z-50 focus:rounded focus:bg-amber-800 focus:px-3 focus:py-2 focus:text-sm focus:text-amber-100"
        >
          Skip to navigation
        </a>

        <nav
          id="nav-bar"
          ref={navRef}
          className="sticky top-0 z-10 shrink-0"
          style={{ backgroundColor: 'transparent' }}
        >
          <div className="pt-0">
            {/* ── Book cover bar ── */}
            <div
              className="flex h-8 items-center gap-3 px-4 sm:px-5"
              style={{
                background: 'linear-gradient(180deg, #d4c4b2 0%, #c8b8a4 100%)',
                boxShadow:
                  '0 1px 3px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(120,110,100,0.15), inset 0 0 0 0.5px rgba(255,255,255,0.3)',
                borderRadius: '0 0 2px 2px',
              }}
            >
              <button
                onClick={() => setDrawerOpen((o) => !o)}
                className="group flex h-6 w-6 items-center justify-center rounded-sm transition-colors hover:bg-[rgba(120,110,100,0.08)]"
                aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                <div className="flex flex-col items-center gap-[3px]">
                  <span
                    className="block h-[2px] w-[2px] rounded-full transition-all duration-300"
                    style={{ backgroundColor: '#8a7a6a' }}
                  />
                  <span
                    className="block h-[2px] w-[2px] rounded-full transition-all duration-300"
                    style={{ backgroundColor: '#8a7a6a' }}
                  />
                  <span
                    className="block h-[2px] w-[2px] rounded-full transition-all duration-300"
                    style={{ backgroundColor: '#8a7a6a' }}
                  />
                </div>
              </button>

              <TransitionLink
                to="/"
                className="font-serif text-sm tracking-[0.2em] transition-opacity hover:opacity-70 sm:text-base"
                style={{ color: '#3a2a1a' }}
              >
                COSMERE ARCHIVE
              </TransitionLink>

              <TransitionLink
                to="/about"
                className="ml-auto hidden font-serif text-[10px] tracking-[0.06em] transition-opacity hover:opacity-70 sm:inline"
                style={{ color: '#8a7a6a' }}
              >
                About
              </TransitionLink>
            </div>
          </div>
        </nav>

        {/* ── Parchment menu (portal to body, above everything) ── */}
        <ParchmentMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} navRef={navRef} />

        {/* ── Backdrop (renders above page, below nav) ── */}
        <div
          className={`fixed inset-0 transition-opacity duration-500 ${
            drawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 5 }}
          onClick={() => setDrawerOpen(false)}
        />

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
