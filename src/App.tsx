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
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Layout from '@/components/common/Layout'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import RouteFallback from '@/components/ui/RouteFallback'

const LandingPage = lazy(() => import('@/pages/LandingPage'))
const KhrissAtlas = lazy(() => import('@/pages/KhrissAtlas'))
const About = lazy(() => import('@/pages/About'))
const ArcanumRedirect = lazy(() => import('@/pages/ArcanumRedirect'))
const AharietiamPage = lazy(() => import('@/pages/AharietiamPage'))
const BiographicalArchivesPage = lazy(() => import('@/pages/BiographicalArchivesPage'))
const StandaloneChronologyPage = lazy(() => import('@/pages/StandaloneChronologyPage'))
const LibraryPage = lazy(() => import('@/pages/LibraryPage'))
const TaravangianPage = lazy(() => import('@/pages/TaravangianPage'))
const ComparePage = lazy(() => import('@/pages/ComparePage'))
const ShadesmarPage = lazy(() => import('@/pages/ShadesmarPage'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const HistoricalPage = lazy(() => import('@/pages/HistoricalPage'))
const ShardPage = lazy(() => import('@/pages/ShardPage'))

/** Wraps a page element in its loading and error boundaries. */
const page = (element: ReactElement): ReactElement => <RouteFallback>{element}</RouteFallback>

/**
 * The search index has always published character results as `/records/:id`.
 * Part II now owns the record spreads, so the old address resolves into the
 * canonical `?character=` deep link before the codex rewrites it to `?spread=`.
 */
function CharacterRecordRedirect() {
  const { id } = useParams()
  return <Navigate to={`/characters?character=${encodeURIComponent(id ?? '')}`} replace />
}

/**
 * The old volume address. `/books` was retired once the Library absorbed it, so
 * a published link still lands on the volume itself: the Library opens whatever
 * `?book=` names.
 */
function BookVolumeRedirect() {
  const { id } = useParams()
  return <Navigate to={`/library?book=${encodeURIComponent(id ?? '')}`} replace />
}

const ROUTES = [
  { path: '/', element: page(<LandingPage />) },
  { path: '/celestial-charts', element: page(<KhrissAtlas />) },
  { path: '/about', element: page(<About />) },
  { path: '/magic', element: page(<ArcanumRedirect />) },
  { path: '/aharietiam', element: page(<AharietiamPage />) },
  { path: '/books/:id', element: page(<BookVolumeRedirect />) },
  { path: '/books', element: <Navigate to={'/library'} replace /> },
  { path: '/characters', element: page(<BiographicalArchivesPage />) },
  { path: '/records/:id', element: page(<CharacterRecordRedirect />) },
  { path: '/taravangian', element: page(<TaravangianPage />) },
  /* The Diagram had no route of its own; the nav called it " and pointed at
     /stats. The old address keeps working rather than 404-ing, because it has
     been published. */
  { path: '/stats', element: <Navigate to={'/taravangian'} replace /> },
  { path: '/chronology', element: page(<StandaloneChronologyPage />) },
  { path: '/library', element: page(<LibraryPage />) },
  { path: '/shadesmar', element: page(<ShadesmarPage />) },
  { path: '/compare', element: page(<ComparePage />) },
  { path: '/mind-map', element: <Navigate to="/compare" replace /> },
  // D-HIST: one index route for the archived sections, not a route per section.
  { path: '/records/shards/:shardId', element: page(<ShardPage />) },
  { path: '/historical', element: page(<HistoricalPage />) },
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
