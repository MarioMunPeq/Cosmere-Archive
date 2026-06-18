export default function MapSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 animate-pulse items-center justify-center rounded-2xl border border-gray-800 bg-gray-950">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        <p className="text-sm text-gray-600">Loading Cosmere...</p>
      </div>
    </div>
  )
}
