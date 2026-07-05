import BackToMapButton from '@/components/ui/BackToMapButton'
import CosmereLibrary from '@/components/library/CosmereLibrary'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { BOOKS } from '@/data/static'

export default function LibraryPage() {
  useSEOMeta({
    title: 'Library — Cosmere Archive',
    description: 'Browse the complete Cosmere book collection in a virtual library',
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-950">
      {/* Header bar */}
      <div className="flex shrink-0 items-center gap-4 border-b border-white/5 px-4 py-2 sm:px-6 sm:py-3">
        <BackToMapButton />
        <h1 className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-lg font-bold text-transparent sm:text-xl">
          The Cosmere Collection
        </h1>
        <span className="ml-auto text-xs text-gray-500 sm:text-sm">{BOOKS.length} volumes</span>
      </div>

      {/* Library */}
      <div className="flex-1 min-h-0">
        <CosmereLibrary />
      </div>
    </div>
  )
}
