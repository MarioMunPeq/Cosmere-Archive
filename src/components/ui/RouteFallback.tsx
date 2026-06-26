import { Suspense, type ReactNode } from 'react'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function RouteFallback({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback ?? <LoadingSpinner />}>{children}</Suspense>
    </ErrorBoundary>
  )
}
