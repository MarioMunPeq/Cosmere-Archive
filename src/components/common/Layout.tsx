import { useEffect } from 'react'
import { Outlet, Link } from 'react-router-dom'
import SearchBar from './SearchBar'

export default function Layout() {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault()
        document.getElementById('cosmere-search')?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

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
            <Link to="/about" className="hidden text-sm text-gray-500 transition-colors hover:text-gray-300 sm:inline">
              About
            </Link>
            <div className="w-48 sm:w-64">
              <SearchBar />
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
