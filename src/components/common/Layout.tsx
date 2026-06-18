import { Outlet, NavLink } from 'react-router-dom'

// Layout wraps every page with a shared structure:
// - A top navigation bar (visible on every page)
// - A main content area (<Outlet />) where the matched route renders
//
// Using NavLink instead of <a> tags prevents full page reloads
// and lets React Router handle navigation client-side.
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation bar */}
      <nav className="border-b border-purple-900/50 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Brand */}
          <NavLink to="/" className="text-xl font-bold tracking-wider text-purple-400">
            COSMERE ARCHIVE
          </NavLink>

          {/* Nav links */}
          <div className="flex gap-6 text-sm font-medium">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'text-amber-400' : 'text-gray-400 hover:text-gray-200'
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to="/books"
              className={({ isActive }) =>
                isActive ? 'text-amber-400' : 'text-gray-400 hover:text-gray-200'
              }
            >
              Libros
            </NavLink>
            <NavLink
              to="/characters"
              className={({ isActive }) =>
                isActive ? 'text-amber-400' : 'text-gray-400 hover:text-gray-200'
              }
            >
              Personajes
            </NavLink>
            <NavLink
              to="/worldhoppers"
              className={({ isActive }) =>
                isActive ? 'text-amber-400' : 'text-gray-400 hover:text-gray-200'
              }
            >
              Worldhoppers
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main content: each route renders here */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-900/30 py-4 text-center text-xs text-gray-600">
        Cosmere Archive &mdash; Una herramienta para lectores del Cosmere
      </footer>
    </div>
  )
}
