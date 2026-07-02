import { useSearchParams } from 'react-router-dom'
import PageLayout from '@/components/ui/PageLayout'
import PlanetsTabContent from '@/components/detail/PlanetsTabContent'
import ShardsTabContent from '@/components/detail/ShardsTabContent'
import { useSEOMeta } from '@/hooks/useSEOMeta'

const BG_STARS = Array.from({ length: 20 }, (_, i) => ({
  left: `${((i * 11.3 + 2.7) % 100).toFixed(1)}%`,
  top: `${((i * 17.9 + 4.1) % 100).toFixed(1)}%`,
  delay: `${((i * 0.5) % 4).toFixed(1)}s`,
  size: i % 3 === 0 ? 'h-0.5 w-0.5' : 'h-px w-px',
  opacity: 0.04 + ((i * 0.2) % 0.15),
}))

export default function LocationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'shards' ? 'shards' : 'planets'

  useSEOMeta({
    title: tab === 'shards' ? 'Shards \u2014 Cosmere Archive' : 'Locations \u2014 Cosmere Archive',
    description:
      tab === 'shards'
        ? 'Learn about the sixteen Shards of Adonalsium and their Vessels in the Cosmere'
        : 'Discover the planets and locations of the Cosmere universe, from Roshar to Scadrial',
  })

  const setTab = (t: 'planets' | 'shards') => {
    setSearchParams(t === 'shards' ? { tab: 'shards' } : {}, { replace: true })
  }

  return (
    <PageLayout variant="none">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {BG_STARS.map((s, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-white animate-twinkle-slow ${s.size}`}
            style={{
              left: s.left,
              top: s.top,
              animationDelay: s.delay,
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-gray-700/40 px-4 sm:px-6 bg-gradient-to-r from-gray-950/80 via-gray-900/50 to-gray-950/80 backdrop-blur-sm">
          <div className="flex gap-1">
            <button
              onClick={() => setTab('planets')}
              className={`px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                tab === 'planets'
                  ? 'border-b-2 border-cyan-500 text-cyan-300'
                  : 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent'
              }`}
            >
              Planets
            </button>
            <button
              onClick={() => setTab('shards')}
              className={`px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                tab === 'shards'
                  ? 'border-b-2 border-cyan-500 text-cyan-300'
                  : 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent'
              }`}
            >
              Shards
            </button>
          </div>
        </div>
        {tab === 'planets' ? <PlanetsTabContent /> : <ShardsTabContent />}
      </div>
    </PageLayout>
  )
}
