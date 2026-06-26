import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/common/Layout'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import RouteFallback from '@/components/ui/RouteFallback'
import { MapPageSkeleton, GlossaryPageSkeleton } from '@/components/ui/Skeleton'

const MapPage = lazy(() => import('@/pages/MapPage'))
const About = lazy(() => import('@/pages/About'))
const RelationshipsPage = lazy(() => import('@/pages/RelationshipsPage'))
const GlossaryPage = lazy(() => import('@/pages/GlossaryPage'))
const FamilyTreePage = lazy(() => import('@/pages/FamilyTreePage'))
const HeraldsPage = lazy(() => import('@/pages/HeraldsPage'))
const BookPage = lazy(() => import('@/pages/BookPage'))
const ReadingOrderPage = lazy(() => import('@/pages/ReadingOrderPage'))
const MagicSystemsPage = lazy(() => import('@/pages/MagicSystemsPage'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
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
            path="relationships"
            element={
              <RouteFallback>
                <RelationshipsPage />
              </RouteFallback>
            }
          />
          <Route
            path="glossary"
            element={
              <RouteFallback fallback={<GlossaryPageSkeleton />}>
                <GlossaryPage />
              </RouteFallback>
            }
          />
          <Route
            path="family-tree"
            element={
              <RouteFallback>
                <FamilyTreePage />
              </RouteFallback>
            }
          />
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
            path="reading-order"
            element={
              <RouteFallback>
                <ReadingOrderPage />
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
