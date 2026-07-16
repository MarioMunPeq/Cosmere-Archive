import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/common/Layout'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import RouteFallback from '@/components/ui/RouteFallback'
import { MapPageSkeleton, BooksPageSkeleton } from '@/components/ui/Skeleton'

const LandingPage = lazy(() => import('@/pages/LandingPage'))
const MapPage = lazy(() => import('@/pages/MapPage'))
const About = lazy(() => import('@/pages/About'))

const MagicSystemsPage = lazy(() => import('@/pages/MagicSystemsPage'))
const AharietiamPage = lazy(() => import('@/pages/AharietiamPage'))
const BookPage = lazy(() => import('@/pages/BookPage'))
const StandaloneBooksPage = lazy(() => import('@/pages/StandaloneBooksPage'))
const BiographicalArchivesPage = lazy(() => import('@/pages/BiographicalArchivesPage'))
const LocationsPage = lazy(() => import('@/pages/LocationsPage'))
const StandaloneChronologyPage = lazy(() => import('@/pages/StandaloneChronologyPage'))
const LibraryPage = lazy(() => import('@/pages/LibraryPage'))
const StatsPage = lazy(() => import('@/pages/StatsPage'))
const ComparePage = lazy(() => import('@/pages/ComparePage'))
const MindMapPage = lazy(() => import('@/pages/MindMapPage'))
const ShadesmarPage = lazy(() => import('@/pages/ShadesmarPage'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={
              <RouteFallback>
                <LandingPage />
              </RouteFallback>
            }
          />
          <Route
            path="map"
            element={
              <RouteFallback fallback={<MapPageSkeleton />}>
                <MapPage />
              </RouteFallback>
            }
          />
          <Route
            path="about"
            element={
              <RouteFallback>
                <About />
              </RouteFallback>
            }
          />

          <Route
            path="magic"
            element={
              <RouteFallback>
                <MagicSystemsPage />
              </RouteFallback>
            }
          />
          <Route path="family-tree" element={<Navigate to="/characters?tab=bloodlines" replace />} />
          <Route path="heralds" element={<Navigate to="/aharietiam" replace />} />
          <Route
            path="aharietiam"
            element={
              <RouteFallback>
                <AharietiamPage />
              </RouteFallback>
            }
          />
          <Route
            path="books/:id"
            element={
              <RouteFallback>
                <BookPage />
              </RouteFallback>
            }
          />
          <Route
            path="books"
            element={
              <RouteFallback fallback={<BooksPageSkeleton />}>
                <StandaloneBooksPage />
              </RouteFallback>
            }
          />
          <Route
            path="characters"
            element={
              <RouteFallback>
                <BiographicalArchivesPage />
              </RouteFallback>
            }
          />
          <Route path="shards" element={<Navigate to="/locations?tab=shards" replace />} />
          <Route
            path="stats"
            element={
              <RouteFallback>
                <StatsPage />
              </RouteFallback>
            }
          />
          <Route
            path="chronology"
            element={
              <RouteFallback>
                <StandaloneChronologyPage />
              </RouteFallback>
            }
          />
          <Route path="timeline" element={<Navigate to="/chronology" replace />} />
          <Route
            path="library"
            element={
              <RouteFallback>
                <LibraryPage />
              </RouteFallback>
            }
          />
          <Route
            path="locations"
            element={
              <RouteFallback>
                <LocationsPage />
              </RouteFallback>
            }
          />
          <Route path="glossary" element={<Navigate to="/magic" replace />} />
          <Route
            path="shadesmar"
            element={
              <RouteFallback>
                <ShadesmarPage />
              </RouteFallback>
            }
          />
          <Route
            path="compare"
            element={
              <RouteFallback>
                <ComparePage />
              </RouteFallback>
            }
          />
          <Route
            path="mind-map"
            element={
              <RouteFallback>
                <MindMapPage />
              </RouteFallback>
            }
          />
          <Route
            path="*"
            element={
              <RouteFallback>
                <NotFound />
              </RouteFallback>
            }
          />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
