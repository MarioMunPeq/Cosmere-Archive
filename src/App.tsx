import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/common/Layout'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import MapPage from '@/pages/MapPage'
import NotFound from '@/pages/NotFound'

const About = lazy(() => import('@/pages/About'))
const PassportPage = lazy(() => import('@/pages/PassportPage'))
const RelationshipsPage = lazy(() => import('@/pages/RelationshipsPage'))
const GlossaryPage = lazy(() => import('@/pages/GlossaryPage'))
const FamilyTreePage = lazy(() => import('@/pages/FamilyTreePage'))

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<MapPage />} />
          <Route
            path="about"
            element={
              <Suspense
                fallback={
                  <div className="flex min-h-0 flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                      <p className="text-sm text-gray-500">Loading...</p>
                    </div>
                  </div>
                }
              >
                <About />
              </Suspense>
            }
          />
          <Route
            path="passport"
            element={
              <Suspense
                fallback={
                  <div className="flex min-h-0 flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                      <p className="text-sm text-gray-500">Loading...</p>
                    </div>
                  </div>
                }
              >
                <PassportPage />
              </Suspense>
            }
          />
          <Route
            path="relationships"
            element={
              <Suspense
                fallback={
                  <div className="flex min-h-0 flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                      <p className="text-sm text-gray-500">Loading...</p>
                    </div>
                  </div>
                }
              >
                <RelationshipsPage />
              </Suspense>
            }
          />
          <Route
            path="glossary"
            element={
              <Suspense
                fallback={
                  <div className="flex min-h-0 flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                      <p className="text-sm text-gray-500">Loading...</p>
                    </div>
                  </div>
                }
              >
                <GlossaryPage />
              </Suspense>
            }
          />
          <Route
            path="family-tree"
            element={
              <Suspense
                fallback={
                  <div className="flex min-h-0 flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                      <p className="text-sm text-gray-500">Loading...</p>
                    </div>
                  </div>
                }
              >
                <FamilyTreePage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
