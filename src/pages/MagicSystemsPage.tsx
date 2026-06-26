import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PLANETS, BOOKS, ALL_CHARACTERS, getPlanetById } from '@/data/static'
import { MAGIC_SYSTEMS, type MagicSystem } from '@/data/static/magic-systems'
import SplitPane from '@/components/common/SplitPane'
import AllomanticTable from '@/components/magic/AllomanticTable'
import ColorDot from '@/components/ui/ColorDot'
import PageLayout from '@/components/ui/PageLayout'
import type { Planet } from '@/types/planet'

const PLANET_X = 60
const SYSTEM_X = 200
const SHARD_X = 370
const ROW_H = 64

function planetById(id: string): Planet | undefined {
  return getPlanetById(id)
}

function MagicDiagram({
  system,
  onSelect,
  selectedId,
  hoveredId,
  onHover,
}: {
  system: MagicSystem
  onSelect: (s: MagicSystem) => void
  selectedId: string | null
  hoveredId: string | null
  onHover: (id: string | null) => void
}) {
  const isSelected = selectedId === system.id
  const isHovered = hoveredId === system.id

  return (
    <button
      onClick={() => onSelect(system)}
      onMouseEnter={() => onHover(system.id)}
      onMouseLeave={() => onHover(null)}
      className={`group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
        isSelected
          ? 'border-purple-500 bg-purple-900/15'
          : isHovered
            ? 'border-gray-600 bg-gray-800/40'
            : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
      }`}
    >
      <ColorDot color={system.color} size="lg" />
      <div className="min-w-0 flex-1">
        <div className={`text-sm font-medium ${isSelected ? 'text-purple-300' : 'text-gray-200'}`}>{system.name}</div>
        <div className="mt-0.5 text-xs text-purple-400/70">{system.shard}</div>
      </div>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="shrink-0 text-gray-600"
      >
        <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export default function MagicSystemsPage() {
  const navigate = useNavigate()
  const [planetFilter, setPlanetFilter] = useState<string>('')
  const [selectedSystem, setSelectedSystem] = useState<MagicSystem | null>(null)
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!planetFilter) return MAGIC_SYSTEMS
    return MAGIC_SYSTEMS.filter((s) => s.planetId === planetFilter)
  }, [planetFilter])

  const groupedByPlanet = useMemo(() => {
    const groups = new Map<string, MagicSystem[]>()
    for (const system of filtered) {
      const existing = groups.get(system.planetId) ?? []
      existing.push(system)
      groups.set(system.planetId, existing)
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  const selectedDetail = useMemo(() => {
    if (!selectedSystem) return null
    const planet = planetById(selectedSystem.planetId)
    const chars = ALL_CHARACTERS.filter((c) => c.planet === selectedSystem.planetId)
    const books = selectedSystem.bookIds
      .map((bid) => BOOKS.find((b) => b.id === bid))
      .filter((b): b is (typeof BOOKS)[number] => !!b)

    return { system: selectedSystem, planet, characters: chars, books }
  }, [selectedSystem])

  return (
    <PageLayout variant="none">
      <div className="shrink-0 border-b border-gray-800 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-100 sm:text-xl">Magic Systems</h1>
            <p className="mt-0.5 text-xs text-gray-500">The investiture-based magic systems of the Cosmere</p>
          </div>
          <select
            value={planetFilter}
            onChange={(e) => {
              setPlanetFilter(e.target.value)
              setSelectedSystem(null)
            }}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-gray-300 outline-none transition-colors focus:border-purple-500/60"
          >
            <option value="">All Planets</option>
            {PLANETS.filter((p) => MAGIC_SYSTEMS.some((s) => s.planetId === p.id)).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <SplitPane
        left={
          <div className="h-full overflow-y-auto p-4 sm:p-5">
            {planetFilter ? (
              <div className="relative">
                <svg
                  viewBox="0 0 450 200"
                  className="mb-6 w-full max-w-md"
                  role="img"
                  aria-label={`${planetById(planetFilter)?.name ?? planetFilter} magic system connections`}
                >
                  {(() => {
                    const planet = planetById(planetFilter)
                    const systems = filtered
                    if (!planet || systems.length === 0) return null

                    const shards = new Set(systems.map((s) => s.shard))
                    const Y_BASE = 100
                    const systemYs = systems.map((_, i) => Y_BASE + (i - (systems.length - 1) / 2) * ROW_H)

                    return (
                      <>
                        {systems.map((s, i) => (
                          <line
                            key={`line-sys-${s.id}`}
                            x1={PLANET_X + 40}
                            y1={Y_BASE}
                            x2={SYSTEM_X - 40}
                            y2={systemYs[i]!}
                            stroke={s.color}
                            strokeWidth="1"
                            strokeOpacity="0.3"
                            strokeDasharray="4 3"
                          />
                        ))}
                        {systems.map((s, i) => (
                          <line
                            key={`line-shard-${s.id}`}
                            x1={SYSTEM_X + 40}
                            y1={systemYs[i]}
                            x2={SHARD_X - 40}
                            y2={Y_BASE}
                            stroke={s.color}
                            strokeWidth="1"
                            strokeOpacity="0.3"
                            strokeDasharray="4 3"
                          />
                        ))}
                        <circle cx={PLANET_X} cy={Y_BASE} r="30" fill={planet.color} opacity="0.8" />
                        <text
                          x={PLANET_X}
                          y={Y_BASE + 5}
                          textAnchor="middle"
                          fill="white"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          {planet.name}
                        </text>
                        {systems.map((s, i) => {
                          const isSel = selectedSystem?.id === s.id
                          const isHov = hoveredSystem === s.id
                          return (
                            <g
                              key={s.id}
                              role="button"
                              tabIndex={0}
                              aria-label={`${s.name} — ${s.shard}`}
                              onClick={() => setSelectedSystem(s)}
                              onMouseEnter={() => setHoveredSystem(s.id)}
                              onMouseLeave={() => setHoveredSystem(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setSelectedSystem(s)
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <circle
                                cx={SYSTEM_X}
                                cy={systemYs[i]!}
                                r={isHov || isSel ? 22 : 18}
                                fill={isSel ? '#2e1065' : '#1f2937'}
                                stroke={s.color}
                                strokeWidth={isSel ? 3 : 2}
                                opacity={isHov ? 1 : 0.9}
                              />
                              <text
                                x={SYSTEM_X}
                                y={systemYs[i]! + 4}
                                textAnchor="middle"
                                fill="#e5e7eb"
                                fontSize="9"
                                fontWeight="bold"
                                style={{ pointerEvents: 'none' }}
                              >
                                {s.name.length > 12 ? s.name.slice(0, 10) + '…' : s.name}
                              </text>
                            </g>
                          )
                        })}
                        <circle cx={SHARD_X} cy={Y_BASE} r="24" fill="#1f2937" stroke="#a78bfa" strokeWidth="1.5" />
                        <text
                          x={SHARD_X}
                          y={Y_BASE + 4}
                          textAnchor="middle"
                          fill="#a78bfa"
                          fontSize="8"
                          fontWeight="bold"
                          style={{ pointerEvents: 'none' }}
                        >
                          {Array.from(shards).join('/').length > 14
                            ? Array.from(shards).join('/').slice(0, 12) + '…'
                            : Array.from(shards).join('/')}
                        </text>
                      </>
                    )
                  })()}
                </svg>

                <div className="space-y-2">
                  {filtered.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-500">No magic systems for this planet.</p>
                  ) : (
                    filtered.map((s) => (
                      <MagicDiagram
                        key={s.id}
                        system={s}
                        onSelect={setSelectedSystem}
                        selectedId={selectedSystem?.id ?? null}
                        hoveredId={hoveredSystem}
                        onHover={setHoveredSystem}
                      />
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedByPlanet.map(([planetId, systems]) => {
                  const planet = planetById(planetId)
                  if (!planet) return null
                  return (
                    <div key={planetId}>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: planet.color }} />
                        <span className="text-sm font-semibold text-gray-200">{planet.name}</span>
                        <span className="text-xs text-gray-600">
                          {systems.length} system{systems.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="ml-4 space-y-1.5">
                        {systems.map((s) => (
                          <MagicDiagram
                            key={s.id}
                            system={s}
                            onSelect={setSelectedSystem}
                            selectedId={selectedSystem?.id ?? null}
                            hoveredId={hoveredSystem}
                            onHover={setHoveredSystem}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        }
        right={
          <div className="overflow-y-auto p-4 sm:p-5">
            {selectedDetail ? (
              <div className="animate-fade-in-up space-y-4">
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: selectedDetail.system.color }}
                  />
                  <div>
                    <h2 className="text-lg font-bold text-gray-100">{selectedDetail.system.name}</h2>
                    <p className="text-xs text-purple-400">{selectedDetail.system.shard}</p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-gray-400">{selectedDetail.system.description}</p>

                {selectedDetail.planet && (
                  <div>
                    <h4 className="text-xxs font-semibold uppercase tracking-wider text-gray-500">Planet</h4>
                    <p className="mt-0.5 text-sm text-gray-300">{selectedDetail.planet.name}</p>
                  </div>
                )}

                {selectedDetail.books.length > 0 && (
                  <div>
                    <h4 className="text-xxs font-semibold uppercase tracking-wider text-gray-500">
                      Appears in ({selectedDetail.books.length})
                    </h4>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {selectedDetail.books.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => navigate(`/books/${b.id}`)}
                          className="rounded bg-gray-800 px-2 py-0.5 text-xs text-cyan-400 transition-colors hover:bg-gray-700 hover:text-cyan-300"
                        >
                          {b.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDetail.characters.length > 0 && (
                  <div>
                    <h4 className="text-xxs font-semibold uppercase tracking-wider text-gray-500">
                      Known users ({selectedDetail.characters.length})
                    </h4>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {selectedDetail.characters.map((c) => (
                        <span key={c.id} className="rounded bg-gray-800/50 px-2 py-0.5 text-xs text-gray-400">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-xxs font-semibold uppercase tracking-wider text-gray-500">Category</h4>
                  <span className="mt-1 inline-block rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                    {selectedDetail.system.category}
                  </span>
                </div>

                {selectedDetail.system.id === 'allomancy' && (
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <AllomanticTable />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Select a magic system</p>
                  <p className="mt-1 text-xs text-gray-600">Click any system to see details</p>
                </div>
              </div>
            )}
          </div>
        }
      />
    </PageLayout>
  )
}
