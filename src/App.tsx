/**
 * Routing.
 *
 * M2 · Block 2. This was fourteen near-identical `<Route>` blocks, each wrapping
 * its element in `<RouteFallback>`. The repetition was why the 404 sat last in
 * the file rather than where the router expects it, and why adding a page meant
 * remembering two things instead of one.
 *
 * The table below is the whole router. `RouteFallback` supplies the Suspense
 * boundary and a nested error boundary per route, so a page that throws while
 * loading shows the archive error rather than blanking the shell.
 */

import { lazy } from 'react'
import type { ReactElement } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/common/Layout'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import RouteFallback from '@/components/ui/RouteFallback'

const LandingPage = lazy(() => import('@/pages/LandingPage'))
const KhrissAtlas = lazy(() => import('@/pages/KhrissAtlas'))
const About = lazy(() => import('@/pages/About'))
const MagicSystemsPage = lazy(() => import('@/pages/MagicSystemsPage'))
const AharietiamPage = lazy(() => import('@/pages/AharietiamPage'))
const BookPage = lazy(() => import('@/pages/BookPage'))
const StandaloneBooksPage = lazy(() => import('@/pages/StandaloneBooksPage'))
const BiographicalArchivesPage = lazy(() => import('@/pages/BiographicalArchivesPage'))
const StandaloneChronologyPage = lazy(() => import('@/pages/StandaloneChronologyPage'))
const LibraryPage = lazy(() => import('@/pages/LibraryPage'))
const StatsPage = lazy(() => import('@/pages/StatsPage'))
const ComparePage = lazy(() => import('@/pages/ComparePage'))
const MindMapPage = lazy(() => import('@/pages/MindMapPage'))
const ShadesmarPage = lazy(() => import('@/pages/ShadesmarPage'))
const NotFound = lazy(() => import('@/pages/NotFound'))

/** Wraps a page element in its loading and error boundaries. */
const page = (element: ReactElement): ReactElement => <RouteFallback>{element}</RouteFallback>

const ROUTES = [
  { path: '/', element: page(<LandingPage />) },
  { path: '/celestial-charts', element: page(<KhrissAtlas />) },
  { path: '/about', element: page(<About />) },
  { path: '/magic', element: page(<MagicSystemsPage />) },
  { path: '/aharietiam', element: page(<AharietiamPage />) },
  { path: '/books/:id', element: page(<BookPage />) },
  { path: '/books', element: page(<StandaloneBooksPage />) },
  { path: '/characters', element: page(<BiographicalArchivesPage />) },
  { path: '/stats', element: page(<StatsPage />) },
  { path: '/chronology', element: page(<StandaloneChronologyPage />) },
  { path: '/library', element: page(<LibraryPage />) },
  { path: '/shadesmar', element: page(<ShadesmarPage />) },
  { path: '/compare', element: page(<ComparePage />) },
  { path: '/mind-map', element: page(<MindMapPage />) },
] as const

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          {ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          {/* Declared last so it only matches what nothing above claimed. */}
          <Route path="*" element={page(<NotFound />)} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
