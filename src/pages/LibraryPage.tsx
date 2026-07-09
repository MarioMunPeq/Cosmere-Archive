import BackToMapButton from '@/components/ui/BackToMapButton'
import CosmereLibrary from '@/components/library/CosmereLibrary'
import DustMotes from '@/components/library/DustMotes'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { BOOKS } from '@/data/static'

export default function LibraryPage() {
  useSEOMeta({
    title: 'Library — Cosmere Archive',
    description: 'Browse the complete Cosmere book collection in a virtual library',
  })

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-gray-950">
      {/* Archive hall depth — cool distant space behind the shelves */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 130% 90% at 45% 10%, transparent 0%, rgba(100,120,160,0.008) 50%, rgba(80,100,140,0.015) 80%, rgba(60,80,120,0.025) 100%)',
        }}
      />

      {/* Floating dust motes in the archive air */}
      <DustMotes />

      {/* Ambient light pool + vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: [
            'radial-gradient(ellipse 120% 50% at 50% -5%, rgba(210,180,140,0.06) 0%, rgba(190,160,120,0.025) 30%, transparent 60%)',
            'radial-gradient(ellipse 80% 75% at 50% 50%, transparent 50%, rgba(0,0,0,0.12) 80%, rgba(0,0,0,0.22) 100%)',
          ].join(', '),
        }}
      />

      {/* Header bar */}
      <div className="relative z-10 flex shrink-0 items-center gap-4 border-b border-white/5 px-4 py-2 sm:px-6 sm:py-3">
        <BackToMapButton />
        <h1 className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-lg font-bold text-transparent sm:text-xl">
          The Cosmere Collection
        </h1>
        <span className="ml-auto text-xs text-gray-500 sm:text-sm">{BOOKS.length} volumes</span>
      </div>

      {/* Library */}
      <div className="relative z-10 flex-1 min-h-0">
        <CosmereLibrary />
      </div>
    </div>
  )
}
