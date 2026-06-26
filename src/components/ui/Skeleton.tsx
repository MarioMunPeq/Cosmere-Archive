export function SkeletonBar({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-800 ${className}`} />
}

export function MapPageSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <SkeletonBar className="h-10 w-48" />
        <SkeletonBar className="h-10 w-32" />
      </div>
      <SkeletonBar className="flex-1 rounded-lg" />
    </div>
  )
}

export function GlossaryPageSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
      <SkeletonBar className="h-8 w-64" />
      <SkeletonBar className="h-10 w-full max-w-md" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }, (_, i) => (
          <SkeletonBar key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
