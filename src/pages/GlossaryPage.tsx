import { useState, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import EmptyState from '@/components/ui/EmptyState'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { GlossaryCategory } from '@/types/glossary'
import { GLOSSARY_ENTRIES } from '@/data/static/glossary'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/glossary'
import { useElementWidth } from '@/hooks/useResizeObserver'
import { useTextFilter } from '@/hooks/useTextFilter'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { PLANETS, BOOKS, ALL_CHARACTERS, getPlanetById } from '@/data/static'
import { MAGIC_SYSTEMS, type MagicSystem } from '@/data/static/magic-systems'
import SplitPane from '@/components/common/SplitPane'
import { IconChevronRight } from '@/components/common/icons'
import MagicSystemDetail from '@/components/magic/MagicSystemDetail'
import ColorDot from '@/components/ui/ColorDot'
import PageLayout from '@/components/ui/PageLayout'

const CATEGORIES: GlossaryCategory[] = ['shard', 'magic', 'concept', 'group', 'event', 'phenomenon']

const PLANET_X = 60
const SYSTEM_X = 200
const SHARD_X = 370
const ROW_H = 64

function TermCard({
  entry,
  expanded,
  onToggle,
  onSearch,
}: {
  entry: (typeof GLOSSARY_ENTRIES)[number]
  expanded: boolean
  onToggle: () => void
  onSearch: (term: string) => void
}) {
  const navigate = useNavigate()
  return (
    <div
      className={`cursor-pointer rounded-lg border px-3.5 py-2.5 transition-colors ${
        expanded
          ? 'border-purple-500/40 bg-purple-900/15'
          : 'border-gray-700/40 bg-gray-800/40 hover:border-gray-600/60'
      }`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onToggle()
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-200">{entry.term}</span>
        {entry.pronunciation && <span className="text-xxs italic text-gray-500">/{entry.pronunciation}/</span>}
        <span
          className="rounded px-1.5 py-0.5 text-xxs font-medium"
          style={{ backgroundColor: CATEGORY_COLORS[entry.category] + '20', color: CATEGORY_COLORS[entry.category] }}
        >
          {CATEGORY_LABELS[entry.category]}
        </span>
      </div>
      <p className={`mt-1 text-xs leading-relaxed text-gray-500 ${expanded ? '' : 'line-clamp-2'}`}>
        {entry.definition}
      </p>
      {expanded && entry.relatedTerms && entry.relatedTerms.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {entry.relatedTerms.map((rel) => {
            const related = GLOSSARY_ENTRIES.find((e) => e.id === rel)
            if (!related) return null
            return (
              <button
                key={rel}
                onClick={(e) => {
                  e.stopPropagation()
                  onSearch(related.term)
                }}
                className="rounded bg-gray-700/40 px-2 py-0.5 text-xxs text-purple-400 transition-colors hover:bg-gray-700/80"
              >
                {related.term}
              </button>
            )
          })}
        </div>
      )}
      {expanded && entry.planet && (
        <p className="mt-1.5 text-xxs text-gray-600">
          Planet:{' '}
          <span
            role="link"
            tabIndex={0}
            className="cursor-pointer capitalize text-cyan-400 hover:text-cyan-300"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/?focus=planet&id=${entry.planet}`)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation()
                navigate(`/?focus=planet&id=${entry.planet}`)
              }
            }}
          >
            {entry.planet.replace(/_/g, ' ')}
          </span>
        </p>
      )}
    </div>
  )
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
      <IconChevronRight size={12} className="shrink-0 text-gray-600" />
    </button>
  )
}

function planetById(id: string) {
  return getPlanetById(id)
}

export default function GlossaryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'magic' ? 'magic' : 'glossary'

  const setTab = (t: 'glossary' | 'magic') => {
    setSearchParams(t === 'magic' ? { tab: 'magic' } : {}, { replace: true })
  }

  useSEOMeta({
    title: tab === 'magic' ? 'Magic Systems — Cosmere Archive' : 'Glossary — Cosmere Archive',
    description:
      tab === 'magic'
        ? 'Explore all magic systems in the Cosmere — Allomancy, Surgebinding, AonDor, and more'
        : 'Comprehensive glossary of Cosmere terms, magic systems, and concepts',
  })

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<GlossaryCategory | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const gridWidth = useElementWidth(gridRef)
  const columns = gridWidth < 640 ? 1 : gridWidth < 1024 ? 2 : 3

  const textFiltered = useTextFilter(GLOSSARY_ENTRIES, search, ['term', 'definition', 'category'])
  const filtered = useMemo(() => {
    if (activeCategory === 'all') return textFiltered
    return textFiltered.filter((e) => e.category === activeCategory)
  }, [textFiltered, activeCategory])

  const rows = useMemo(() => {
    const r: (typeof GLOSSARY_ENTRIES)[number][][] = []
    for (let i = 0; i < filtered.length; i += columns) {
      r.push(filtered.slice(i, i + columns))
    }
    return r
  }, [filtered, columns])

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 100,
    overscan: 3,
  })

  function handleSearch(term: string) {
    setSearch(term)
    setExpandedId(null)
  }

  const [planetFilter, setPlanetFilter] = useState<string>('')
  const [selectedSystem, setSelectedSystem] = useState<MagicSystem | null>(null)
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null)

  const magicFiltered = useMemo(() => {
    if (!planetFilter) return MAGIC_SYSTEMS
    return MAGIC_SYSTEMS.filter((s) => s.planetId === planetFilter)
  }, [planetFilter])

  const groupedByPlanet = useMemo(() => {
    const groups = new Map<string, MagicSystem[]>()
    for (const system of magicFiltered) {
      const existing = groups.get(system.planetId) ?? []
      existing.push(system)
      groups.set(system.planetId, existing)
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [magicFiltered])

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
      <div className="flex gap-1 border-b border-gray-700 px-4 sm:px-6 shrink-0">
        <button
          onClick={() => setTab('glossary')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'glossary' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Glossary
        </button>
        <button
          onClick={() => setTab('magic')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'magic' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Magic Systems
        </button>
      </div>

      {tab === 'glossary' ? (
        <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-lg font-bold text-gray-100 sm:text-xl">Glossary</h1>
            <input
              type="search"
              placeholder="Search terms..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-44 rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 outline-none transition-colors focus:border-purple-500/50 sm:w-56"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveCategory('all')}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-purple-700/40 text-purple-300'
                  : 'bg-gray-800/50 text-gray-500 hover:text-gray-400'
              }`}
            >
              All ({GLOSSARY_ENTRIES.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = GLOSSARY_ENTRIES.filter((e) => e.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                    activeCategory === cat ? 'text-gray-100' : 'bg-gray-800/50 text-gray-500 hover:text-gray-400'
                  }`}
                  style={{
                    backgroundColor: activeCategory === cat ? CATEGORY_COLORS[cat] + '30' : undefined,
                    color: activeCategory === cat ? CATEGORY_COLORS[cat] : undefined,
                  }}
                >
                  {CATEGORY_LABELS[cat]} ({count})
                </button>
              )
            })}
          </div>

          <div ref={gridRef} className="relative flex-1" style={{ height: `${virtualizer.getTotalSize()}px` }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const rowItems = rows[virtualRow.index]!
              return (
                <div
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute left-0 right-0 flex gap-2"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  {Array.from({ length: columns }).map((_, col) => {
                    const entry = rowItems[col]
                    if (!entry) return <div key={`spacer-${col}`} className="flex-1" />
                    return (
                      <div key={entry.id} className="flex-1" style={{ minWidth: 0 }}>
                        <TermCard
                          entry={entry}
                          expanded={expandedId === entry.id}
                          onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                          onSearch={handleSearch}
                        />
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && <EmptyState message="No glossary terms match your search." />}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
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
                        const systems = magicFiltered
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
                      {magicFiltered.length === 0 ? (
                        <EmptyState message="No magic systems for this planet." />
                      ) : (
                        magicFiltered.map((s) => (
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
                  <MagicSystemDetail
                    system={selectedDetail.system}
                    planet={selectedDetail.planet}
                    characters={selectedDetail.characters}
                    books={selectedDetail.books}
                  />
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
        </div>
      )}
    </PageLayout>
  )
}
