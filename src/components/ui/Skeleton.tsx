interface SkeletonBarProps {
  className?: string
}

function SkeletonBar({ className = '' }: SkeletonBarProps) {
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

export function BooksPageSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-6">
      <SkeletonBar className="h-4 w-32" />
      <SkeletonBar className="h-8 w-48" />
      <SkeletonBar className="h-4 w-72" />
      <div className="flex gap-2">
        <SkeletonBar className="h-7 w-12 rounded-full" />
        <SkeletonBar className="h-7 w-24 rounded-full" />
        <SkeletonBar className="h-7 w-20 rounded-full" />
        <SkeletonBar className="h-7 w-28 rounded-full" />
      </div>
      <SkeletonBar className="h-10 w-full max-w-lg rounded-lg" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="space-y-3">
          <SkeletonBar className="h-5 w-40" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, j) => (
              <div key={j} className="flex gap-3 rounded-lg border border-gray-800 p-3">
                <SkeletonBar className="h-[120px] w-20 shrink-0 rounded-md" />
                <div className="flex flex-1 flex-col gap-2">
                  <SkeletonBar className="h-4 w-3/4" />
                  <SkeletonBar className="h-3 w-1/4" />
                  <SkeletonBar className="h-3 w-1/3" />
                  <SkeletonBar className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function CharactersPageSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-6">
      <SkeletonBar className="h-4 w-32" />
      <SkeletonBar className="h-8 w-48" />
      <SkeletonBar className="h-4 w-72" />
      <div className="flex flex-wrap gap-2">
        <SkeletonBar className="h-10 w-full max-w-xs rounded-lg" />
        <SkeletonBar className="h-10 w-36 rounded-lg" />
        <SkeletonBar className="h-10 w-44 rounded-lg" />
      </div>
      <SkeletonBar className="h-4 w-56" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="rounded-lg border border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <SkeletonBar className="h-4 w-3/4" />
                <SkeletonBar className="h-3 w-1/2" />
              </div>
            </div>
            <SkeletonBar className="mt-2 h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
