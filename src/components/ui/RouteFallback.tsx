import { Suspense, type ReactNode } from 'react'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

export default function RouteFallback({ children, fallback }: Props) {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback ?? <LoadingSpinner />}>{children}</Suspense>
    </ErrorBoundary>
  )
}
