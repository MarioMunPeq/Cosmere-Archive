import { useState, useMemo } from 'react'
import { PLANETS, SAGAS } from '@/data/static'
import type { Saga } from '@/data/static'
import BackToMapButton from '@/components/ui/BackToMapButton'
import EmptyState from '@/components/ui/EmptyState'
import PlanetForceGraph from '@/components/detail/PlanetForceGraph'
import PlanetDetailPanel from '@/components/detail/PlanetDetailPanel'
import { useTextFilter } from '@/hooks/useTextFilter'

const sagaList = (SAGAS as Saga[]).filter((s) => s.id !== 'pre-cosmere')

export default function PlanetsTabContent() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sagaFilter, setSagaFilter] = useState<string>('')
  const [graphView, setGraphView] = useState(false)

  const selected = selectedId ? (PLANETS.find((p) => p.id === selectedId) ?? null) : null

  const textFiltered = useTextFilter(PLANETS, search, ['name', 'description'])

  const filtered = useMemo(() => {
    if (!sagaFilter) return textFiltered
    return textFiltered.filter((p) => (p.sagas ?? []).includes(sagaFilter))
  }, [textFiltered, sagaFilter])

  return (
    <div className="relative flex min-h-0 flex-1">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col px-4 py-6 sm:px-6">
          <BackToMapButton className="mb-6 shrink-0" />

          <div className="shrink-0 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-gray-100 sm:text-2xl tracking-tight">Locations</h1>
              <p className="mt-1 text-sm text-gray-500">
                {filtered.length} known planet{filtered.length !== 1 ? 's' : ''} across the cosmere
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGraphView(false)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-all duration-300 ${
                  !graphView
                    ? 'border-cyan-500/60 bg-cyan-900/20 text-cyan-300 shadow-lg shadow-cyan-900/20'
                    : 'border-gray-700/40 bg-gray-800/30 text-gray-500 hover:border-gray-600 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setGraphView(true)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-all duration-300 ${
                  graphView
                    ? 'border-cyan-500/60 bg-cyan-900/20 text-cyan-300 shadow-lg shadow-cyan-900/20'
                    : 'border-gray-700/40 bg-gray-800/30 text-gray-500 hover:border-gray-600 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                Network
              </button>
              <input
                type="search"
                placeholder="Search planets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-44 rounded-lg border border-gray-700/40 bg-gray-900/60 px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 outline-none transition-all focus:border-cyan-500/50 focus:shadow-lg focus:shadow-cyan-900/10 sm:w-48"
              />
            </div>
          </div>

          <div className="shrink-0 mt-5 flex flex-wrap gap-1.5">
            <button
              onClick={() => setSagaFilter('')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${
                !sagaFilter
                  ? 'bg-gradient-to-r from-cyan-700/40 to-purple-700/40 text-cyan-200 shadow-lg shadow-cyan-900/20 ring-1 ring-cyan-500/30'
                  : 'bg-gray-800/40 text-gray-500 hover:text-gray-300 hover:bg-gray-800/60 ring-1 ring-gray-700/30'
              }`}
            >
              All
            </button>
            {sagaList.map((s) => (
              <button
                key={s.id}
                onClick={() => setSagaFilter(s.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${
                  sagaFilter === s.id
                    ? 'bg-gradient-to-r from-cyan-700/40 to-purple-700/40 text-cyan-200 shadow-lg shadow-cyan-900/20 ring-1 ring-cyan-500/30'
                    : 'bg-gray-800/40 text-gray-500 hover:text-gray-300 hover:bg-gray-800/60 ring-1 ring-gray-700/30'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="mt-4 min-h-0 flex-1">
            {graphView ? (
              <div className="h-full rounded-xl border border-gray-700/20 bg-gray-900/30 backdrop-blur-sm overflow-hidden">
                <PlanetForceGraph
                  planets={filtered}
                  selectedId={selectedId ?? undefined}
                  onSelectPlanet={setSelectedId}
                />
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <EmptyState message="No planets match your search." />
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 pb-4">
                    {filtered.map((planet, idx) => (
                      <button
                        key={planet.id}
                        onClick={() => setSelectedId(planet.id)}
                        className={`group relative rounded-xl border p-5 text-left transition-all duration-500 animate-fade-in-up ${
                          selectedId === planet.id
                            ? 'border-cyan-500/60 bg-gradient-to-br from-cyan-900/25 via-gray-900/60 to-purple-900/25 shadow-xl shadow-cyan-900/20'
                            : 'border-gray-800/60 bg-gradient-to-br from-gray-900/70 via-gray-900/50 to-gray-950/70 hover:border-gray-700/50 hover:bg-gray-800/50 hover:shadow-lg hover:shadow-gray-900/30'
                        }`}
                        style={{
                          animationDelay: `${idx * 50}ms`,
                          animationFillMode: 'backwards',
                        }}
                      >
                        <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                          <div
                            className="absolute -inset-1 opacity-[0.03]"
                            style={{
                              background: `radial-gradient(ellipse at top right, ${planet.color}, transparent 70%)`,
                            }}
                          />
                        </div>

                        <div className="flex items-center gap-3 relative">
                          <span
                            className="flex h-6 w-6 shrink-0 rounded-full transition-all duration-500"
                            style={{
                              backgroundColor: planet.color,
                              boxShadow:
                                selectedId === planet.id
                                  ? `0 0 16px ${planet.color}80, 0 0 32px ${planet.color}40`
                                  : `0 0 8px ${planet.color}30`,
                            }}
                          />
                          <h2 className="text-base font-semibold text-gray-100">{planet.name}</h2>
                          {planet.shard && (
                            <span className="rounded-md bg-gray-800/50 px-1.5 py-0.5 text-xxs text-gray-500 line-clamp-1 border border-gray-700/30">
                              {planet.shard}
                            </span>
                          )}
                        </div>

                        {planet.description && (
                          <p className="mt-3 text-sm leading-relaxed text-gray-500 line-clamp-2 relative">
                            {planet.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 relative">
                          {(planet.sagas ?? []).length > 0 && (
                            <span>
                              Sagas: <span className="text-gray-400 font-medium">{(planet.sagas ?? []).length}</span>
                            </span>
                          )}
                          {(planet.books ?? []).length > 0 && (
                            <span>
                              Books: <span className="text-gray-400 font-medium">{(planet.books ?? []).length}</span>
                            </span>
                          )}
                          {planet.investiture && planet.investiture.length > 0 && (
                            <span>
                              Magic: <span className="text-gray-400 font-medium">{planet.investiture.length}</span>
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1 relative">
                          {(planet.sagas ?? []).slice(0, 2).map((sid) => {
                            const saga = (SAGAS as Saga[]).find((s) => s.id === sid)
                            return saga ? (
                              <span
                                key={sid}
                                className="rounded-full bg-gray-800/50 px-2.5 py-0.5 text-xxs text-gray-500 border border-gray-700/30"
                              >
                                {saga.name}
                              </span>
                            ) : null
                          })}
                          {(planet.sagas ?? []).length > 2 && (
                            <span className="text-xxs text-gray-700 self-center">
                              +{(planet.sagas ?? []).length - 2}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div className="w-96 shrink-0 overflow-y-auto border-l border-gray-800/40 bg-gray-950/90 backdrop-blur-xl animate-slide-in-right relative z-20 shadow-2xl shadow-cyan-900/10">
          <PlanetDetailPanel planet={selected} onSelectPlanet={setSelectedId} onClose={() => setSelectedId(null)} />
        </div>
      )}
    </div>
  )
}
