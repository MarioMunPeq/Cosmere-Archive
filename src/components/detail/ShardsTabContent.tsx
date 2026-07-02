import { useState, useMemo } from 'react'
import { PLANETS, SHARD_COLORS } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import BackToMapButton from '@/components/ui/BackToMapButton'
import EmptyState from '@/components/ui/EmptyState'

interface ShardInfo {
  name: string
  color: string
  description: string
  planets: string[]
  investiture: { name: string; description: string }[]
  magicSystems: string[]
}

export default function ShardsTabContent() {
  const [search, setSearch] = useState('')
  const [selectedShard, setSelectedShard] = useState<ShardInfo | null>(null)

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

  const filtered = useMemo(() => {
    if (!search.trim()) return shards
    const q = search.toLowerCase().trim()
    return shards.filter((s) => s.name.toLowerCase().includes(q) || s.planets.some((p) => p.toLowerCase().includes(q)))
  }, [shards, search])

  return (
    <div className="relative flex min-h-0 flex-1">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col px-4 py-6 sm:px-6">
          <BackToMapButton className="mb-6 shrink-0" />

          <div className="shrink-0 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-gray-100 sm:text-2xl tracking-tight">Shards of Adonalsium</h1>
              <p className="mt-1 text-sm text-gray-500">
                {filtered.length} shard{filtered.length !== 1 ? 's' : ''} across {PLANETS.filter((p) => p.shard).length}{' '}
                planets
              </p>
            </div>
            <input
              type="search"
              placeholder="Search shards..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedShard(null)
              }}
              className="w-44 rounded-lg border border-gray-700/40 bg-gray-900/60 px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 outline-none transition-all focus:border-cyan-500/50 focus:shadow-lg focus:shadow-cyan-900/10 sm:w-48"
            />
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <EmptyState message="No shards match your search." />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 pb-4">
                {filtered.map((shard, idx) => (
                  <button
                    key={shard.name}
                    onClick={() => setSelectedShard(shard)}
                    className={`group relative rounded-xl border p-5 text-left transition-all duration-500 animate-fade-in-up ${
                      selectedShard?.name === shard.name
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
                          background: `radial-gradient(ellipse at top right, ${shard.color}, transparent 70%)`,
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-3 relative">
                      <span
                        className="flex h-5 w-5 shrink-0 rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: shard.color,
                          boxShadow:
                            selectedShard?.name === shard.name
                              ? `0 0 12px ${shard.color}80`
                              : `0 0 6px ${shard.color}30`,
                        }}
                      />
                      <h2 className="text-base font-semibold" style={{ color: shard.color }}>
                        {shard.name}
                      </h2>
                    </div>

                    <div className="mt-3 space-y-2 text-sm relative">
                      <p className="text-gray-500 line-clamp-2">{shard.planets.join(', ')}</p>
                      {shard.investiture.length > 0 && (
                        <div>
                          <span className="text-xs font-medium uppercase tracking-wider text-gray-600">
                            Investiture ({shard.investiture.length})
                          </span>
                          <ul className="mt-1 space-y-1">
                            {shard.investiture.slice(0, 3).map((inv) => (
                              <li key={inv.name}>
                                <span className="text-xs text-gray-400">{inv.name}</span>
                                <p className="text-xxs text-gray-600 line-clamp-1">{inv.description}</p>
                              </li>
                            ))}
                            {shard.investiture.length > 3 && (
                              <li className="text-xxs text-gray-700">+{shard.investiture.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {shard.magicSystems.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {shard.magicSystems.slice(0, 3).map((ms) => (
                            <span
                              key={ms}
                              className="rounded-full bg-gray-800/50 px-2 py-0.5 text-xxs text-gray-500 border border-gray-700/30"
                            >
                              {ms}
                            </span>
                          ))}
                          {shard.magicSystems.length > 3 && (
                            <span className="text-xxs text-gray-700 self-center">+{shard.magicSystems.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1 relative">
                      {shard.planets.slice(0, 3).map((p) => (
                        <span
                          key={p}
                          className="rounded-full bg-gray-800/50 px-2 py-0.5 text-xxs text-gray-500 border border-gray-700/30"
                        >
                          {p}
                        </span>
                      ))}
                      {shard.planets.length > 3 && (
                        <span className="text-xxs text-gray-700 self-center">+{shard.planets.length - 3}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedShard && (
        <div className="w-96 shrink-0 overflow-y-auto border-l border-gray-800/40 bg-gray-950/90 backdrop-blur-xl animate-slide-in-right relative z-20 shadow-2xl shadow-cyan-900/10">
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-800/40 bg-gray-950/80 px-5 py-3 backdrop-blur-sm">
            <span className="text-xs font-medium text-gray-500">Detail</span>
            <button
              onClick={() => setSelectedShard(null)}
              className="text-gray-600 transition-colors hover:text-gray-300"
              aria-label="Close detail"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <span
                className="flex h-5 w-5 shrink-0 rounded-full"
                style={{
                  backgroundColor: selectedShard.color,
                  boxShadow: `0 0 12px ${selectedShard.color}60`,
                }}
              />
              <h2 className="text-lg font-bold" style={{ color: selectedShard.color }}>
                {selectedShard.name}
              </h2>
            </div>

            {selectedShard.investiture.length > 0 && (
              <div className="mt-5">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-600">
                  Investiture Systems ({selectedShard.investiture.length})
                </span>
                <div className="mt-2 space-y-3">
                  {selectedShard.investiture.map((inv) => (
                    <div
                      key={inv.name}
                      className="rounded-lg border border-gray-800/40 bg-gray-900/40 p-3 hover:bg-gray-900/60 transition-colors"
                    >
                      <span className="text-sm font-medium" style={{ color: selectedShard.color }}>
                        {inv.name}
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{inv.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedShard.magicSystems.length > 0 && (
              <div className="mt-5">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-600">
                  Magic Systems ({selectedShard.magicSystems.length})
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {selectedShard.magicSystems.map((ms) => (
                    <span
                      key={ms}
                      className="rounded-full bg-gray-800/50 px-2.5 py-1 text-xs text-gray-400 border border-gray-700/30"
                    >
                      {ms}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-600">
                Planets ({selectedShard.planets.length})
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {selectedShard.planets.map((p) => (
                  <span
                    key={p}
                    className="rounded-md bg-gray-800/40 px-2.5 py-1 text-xs text-gray-400 border border-gray-700/30"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
