import type { ReactNode } from 'react'

interface Props {
  error: Error | null
  onRetry: () => void
  fallback?: ReactNode
}

export default function ErrorFallback({ error, onRetry, fallback }: Props) {
  if (fallback) return fallback

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-bold text-red-400">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-500">{error?.message ?? 'An unexpected error occurred.'}</p>
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={onRetry}
            className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-300"
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  )
}
