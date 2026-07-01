import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/common/Layout'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import RouteFallback from '@/components/ui/RouteFallback'
import { MapPageSkeleton, BooksPageSkeleton, CharactersPageSkeleton } from '@/components/ui/Skeleton'

const LandingPage = lazy(() => import('@/pages/LandingPage'))
const MapPage = lazy(() => import('@/pages/MapPage'))
const About = lazy(() => import('@/pages/About'))

const MagicSystemsPage = lazy(() => import('@/pages/MagicSystemsPage'))
const HeraldsPage = lazy(() => import('@/pages/HeraldsPage'))
const BookPage = lazy(() => import('@/pages/BookPage'))
const BooksPage = lazy(() => import('@/pages/BooksPage'))
const CharactersPage = lazy(() => import('@/pages/CharactersPage'))
const LocationsPage = lazy(() => import('@/pages/LocationsPage'))
const StandaloneTimelinePage = lazy(() => import('@/pages/StandaloneTimelinePage'))
const StatsPage = lazy(() => import('@/pages/StatsPage'))
const ComparePage = lazy(() => import('@/pages/ComparePage'))
const MindMapPage = lazy(() => import('@/pages/MindMapPage'))
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
          <Route path="family-tree" element={<Navigate to="/characters?tab=family" replace />} />
          <Route
            path="heralds"
            element={
              <RouteFallback>
                <HeraldsPage />
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
                <BooksPage />
              </RouteFallback>
            }
          />
          <Route
            path="characters"
            element={
              <RouteFallback fallback={<CharactersPageSkeleton />}>
                <CharactersPage />
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
            path="timeline"
            element={
              <RouteFallback>
                <StandaloneTimelinePage />
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
