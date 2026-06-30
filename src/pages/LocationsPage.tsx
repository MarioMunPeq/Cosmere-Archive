import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import BackToMapButton from '@/components/ui/BackToMapButton'
import { PLANETS, SAGA_BY_ID, BOOKS, SHARD_COLORS } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import PageLayout from '@/components/ui/PageLayout'
import ColorDot from '@/components/ui/ColorDot'
import ShardCard from '@/components/ui/ShardCard'
import { useSEOMeta } from '@/hooks/useSEOMeta'

interface ShardInfo {
  name: string
  color: string
  description: string
  planets: string[]
  investiture: { name: string; description: string }[]
  magicSystems: string[]
}

export default function LocationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'shards' ? 'shards' : 'planets'

  useSEOMeta({
    title: tab === 'shards' ? 'Shards — Cosmere Archive' : 'Locations — Cosmere Archive',
    description:
      tab === 'shards'
        ? 'Learn about the sixteen Shards of Adonalsium and their Vessels in the Cosmere'
        : 'Discover the planets and locations of the Cosmere universe, from Roshar to Scadrial',
  })

  const setTab = (t: 'planets' | 'shards') => {
    setSearchParams(t === 'shards' ? { tab: 'shards' } : {}, { replace: true })
  }

  const planetsWithMeta = useMemo(() => {
    return PLANETS.map((p) => {
      const sagaNames = (p.sagas ?? [])
        .map((sid) => SAGA_BY_ID.get(sid))
        .filter(Boolean)
        .map((s) => s!.name)
      const bookCount = (p.books ?? []).filter((bid) => BOOKS.some((b) => b.id === bid)).length
      return { ...p, sagaNames, bookCount }
    })
  }, [])

  const shards = useMemo(() => {
    const map = new Map<string, ShardInfo>()

    for (const planet of PLANETS) {
      if (!planet.shard) continue
      const names = planet.shard
        .replace(/\s*\(.*?\)\s*/g, '')
        .split(/[&,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      for (const sName of names) {
        if (sName === 'Adonalsium' || sName === '') continue
        if (!map.has(sName)) {
          map.set(sName, {
            name: sName,
            color: SHARD_COLORS[sName] ?? '#6b7280',
            description: '',
            planets: [],
            investiture: [],
            magicSystems: [],
          })
        }
        const entry = map.get(sName)!
        entry.planets.push(planet.name)
        if (planet.investiture) {
          for (const inv of planet.investiture) {
            if (inv.shard === sName) {
              entry.investiture.push({ name: inv.name, description: inv.description })
            }
          }
        }
      }
    }

    for (const ms of MAGIC_SYSTEMS) {
      if (map.has(ms.shard)) {
        map.get(ms.shard)!.magicSystems.push(ms.name)
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  return (
    <PageLayout variant="none">
      <div className="flex gap-1 border-b border-gray-700 px-4 sm:px-6">
        <button
          onClick={() => setTab('planets')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'planets' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Planets
        </button>
        <button
          onClick={() => setTab('shards')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'shards' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Shards
        </button>
      </div>

      {tab === 'planets' ? (
        <div className="flex flex-1 flex-col items-center overflow-y-auto p-6">
          <div className="w-full max-w-4xl animate-fade-in-up">
            <BackToMapButton className="mb-6" />

            <h1 className="text-3xl font-bold text-gray-100">Locations</h1>
            <p className="mt-1 text-sm text-gray-500">Notable planets and celestial bodies across the Cosmere</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {planetsWithMeta.map((planet) => (
                <div key={planet.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
                  <div className="flex items-center gap-3">
                    <ColorDot color={planet.color} size="lg" />
                    <h2 className="text-lg font-semibold text-gray-100">{planet.name}</h2>
                    {planet.shard && (
                      <span className="rounded bg-gray-800/60 px-2 py-0.5 text-xs text-gray-500">{planet.shard}</span>
                    )}
                  </div>

                  {planet.description && (
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">{planet.description}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    {planet.sagaNames.length > 0 && (
                      <span>
                        Sagas: <span className="text-gray-400">{planet.sagaNames.join(', ')}</span>
                      </span>
                    )}
                    {planet.bookCount > 0 && (
                      <span>
                        Books: <span className="text-gray-400">{planet.bookCount}</span>
                      </span>
                    )}
                    {planet.investiture && planet.investiture.length > 0 && (
                      <span>
                        Magic:{' '}
                        <span className="text-gray-400">
                          {planet.investiture.length} system{planet.investiture.length !== 1 ? 's' : ''}
                        </span>
                      </span>
                    )}
                  </div>

                  {planet.magicSystem && (
                    <p className="mt-2 text-xs leading-relaxed text-gray-500 italic line-clamp-2">
                      {planet.magicSystem}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center overflow-y-auto p-6">
          <div className="w-full max-w-4xl animate-fade-in-up">
            <BackToMapButton className="mb-6" />

            <h1 className="text-3xl font-bold text-gray-100">Shards of Adonalsium</h1>
            <p className="mt-1 text-sm text-gray-500">The sixteen pieces of Adonalsium, scattered across the Cosmere</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {shards.map((shard) => (
                <ShardCard
                  key={shard.name}
                  shard={shard}
                  investiture={shard.investiture}
                  magicSystems={shard.magicSystems}
                >
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-600">Planets</span>
                    <p className="mt-0.5 text-gray-400">{shard.planets.join(', ')}</p>
                  </div>
                </ShardCard>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
