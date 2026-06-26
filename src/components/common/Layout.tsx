import { useEffect } from 'react'
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import SearchBar from './SearchBar'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Cosmere Archive',
  '/about': 'About — Cosmere Archive',
  '/relationships': 'Relationships — Cosmere Archive',
  '/glossary': 'Glossary — Cosmere Archive',
  '/family-tree': 'Family Tree — Cosmere Archive',
  '/heralds': 'Heralds — Cosmere Archive',
  '/reading-order': 'Reading Order — Cosmere Archive',
  '/magic': 'Magic Systems — Cosmere Archive',
}

function navClass(base: string) {
  return ({ isActive }: { isActive: boolean }) => `${base} ${isActive ? 'text-purple-400' : 'text-gray-500'}`
}

export default function Layout() {
  const location = useLocation()
  useScrollToTop()

  useEffect(() => {
    document.title = ROUTE_TITLES[location.pathname] ?? 'Cosmere Archive'
  }, [location.pathname])

  useKeyboardShortcut([{ key: '/' }, { key: 'k', meta: true }, { key: 'k', ctrl: true }], (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    e.preventDefault()
    document.getElementById('cosmere-search')?.focus()
  })

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-gray-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-purple-700 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <nav className="sticky top-0 z-10 shrink-0 border-b border-purple-900/50 bg-gray-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="shrink-0 text-sm font-bold tracking-wider text-purple-400 sm:text-base sm:tracking-wider lg:text-xl"
          >
            COSMERE ARCHIVE
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <NavLink to="/about" className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}>
              About
            </NavLink>
            <NavLink
              to="/relationships"
              className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
            >
              Relationships
            </NavLink>
            <NavLink
              to="/glossary"
              className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
            >
              Glossary
            </NavLink>
            <NavLink
              to="/family-tree"
              className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
            >
              Family Tree
            </NavLink>
            <NavLink
              to="/heralds"
              className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
            >
              Heralds
            </NavLink>
            <NavLink
              to="/reading-order"
              className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}
            >
              Reading Order
            </NavLink>
            <NavLink to="/magic" className={navClass('hidden text-sm transition-colors hover:text-gray-300 sm:inline')}>
              Magic
            </NavLink>
            <div className="w-48 sm:w-64">
              <SearchBar />
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex min-h-0 flex-1 flex-col">
        <div key={location.pathname} className="contents animate-page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
