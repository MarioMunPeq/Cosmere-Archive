import { Outlet, NavLink } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
      <nav className="sticky top-0 z-10 border-b border-purple-900/50 bg-gray-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="text-xl font-bold tracking-wider text-purple-400">
            COSMERE ARCHIVE
          </NavLink>

          <div className="text-sm font-medium">
            <span className="text-gray-500">Mapa y Cronología</span>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-purple-900/30 py-4 text-center text-xs text-gray-600">
        Cosmere Archive — Explorador visual del Cosmere de Brandon Sanderson
      </footer>
    </div>
  )
}
