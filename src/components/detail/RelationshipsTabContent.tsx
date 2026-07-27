import { useState, useMemo, useRef, useEffect } from 'react'
import { ALL_CHARACTERS, CHARACTER_RELATIONSHIPS, getPlanetById, FALLBACK_COLOR } from '@/data/static'
import CharacterRelationships from '@/components/detail/CharacterRelationships'
import ForceGraph from '@/components/detail/ForceGraph'
import EmptyState from '@/components/ui/EmptyState'
import BackToMapButton from '@/components/ui/BackToMapButton'
import { useTextFilter } from '@/hooks/useTextFilter'
import type { Character } from '@/types'

const PLANETS = [...new Set(ALL_CHARACTERS.map((c) => c.planet.toLowerCase()))]
  .map((id) => ({ id, name: getPlanetById(id)?.name ?? id }))
  .sort((a, b) => a.name.localeCompare(b.name))

const REL_COUNTS = new Map<string, number>()
for (const r of CHARACTER_RELATIONSHIPS) {
  REL_COUNTS.set(r.characters[0], (REL_COUNTS.get(r.characters[0]) ?? 0) + 1)
  REL_COUNTS.set(r.characters[1], (REL_COUNTS.get(r.characters[1]) ?? 0) + 1)
}

function CharacterChip({
  char,
  selected,
  onSelect,
}: {
  char: Character
  selected: boolean
  onSelect: (id: string) => void
}) {
  const planet = getPlanetById(char.planet.toLowerCase())
  const relCount = REL_COUNTS.get(char.id) ?? 0

  return (
    <button
      onClick={() => onSelect(char.id)}
      className={`group relative flex shrink-0 snap-start flex-col items-center gap-1 rounded-xl border px-3 py-2.5 transition-all duration-300 ${
        selected ? 'scale-105' : 'hover:scale-105'
      }`}
      style={{
        borderColor: selected ? 'rgba(138,112,80,0.5)' : 'rgba(80,60,40,0.2)',
        background: selected ? 'rgba(138,112,80,0.12)' : 'rgba(80,60,40,0.06)',
        boxShadow: selected ? '0 4px 16px rgba(80,60,40,0.15)' : 'none',
      }}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
        style={{
          backgroundColor: selected ? `${planet?.color ?? FALLBACK_COLOR}30` : `${planet?.color ?? FALLBACK_COLOR}20`,
          color: planet?.color ?? FALLBACK_COLOR,
          boxShadow: selected ? `0 0 12px ${planet?.color ?? FALLBACK_COLOR}40` : 'none',
        }}
      >
        {char.name.charAt(0)}
      </span>
      <span
        className="max-w-14 truncate text-xs font-medium transition-all duration-300 hover:opacity-80"
        style={{ color: selected ? '#f2ece0' : '#8a7050' }}
      >
        {char.name}
      </span>
      {relCount > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-xxs font-semibold transition-colors duration-300"
          style={{
            background: selected ? '#8a7050' : 'rgba(80,60,40,0.3)',
            color: selected ? '#f2ece0' : '#8a7050',
          }}
        >
          {relCount}
        </span>
      )}
    </button>
  )
}

export default function RelationshipsTabContent() {
  const [selectedId, setSelectedId] = useState<string>('hoid')
  const [search, setSearch] = useState('')
  const [planetFilter, setPlanetFilter] = useState<string>('')
  const [graphView, setGraphView] = useState(false)
  const chipsRef = useRef<HTMLDivElement>(null)

  const selected = selectedId ? (ALL_CHARACTERS.find((c) => c.id === selectedId) ?? null) : null

  const textFiltered = useTextFilter(ALL_CHARACTERS, search, ['name', 'planet'])
  const filtered = useMemo(() => {
    if (!planetFilter) return textFiltered
    return textFiltered.filter((c) => c.planet.toLowerCase() === planetFilter)
  }, [textFiltered, planetFilter])

  useEffect(() => {
    if (!selectedId || !chipsRef.current) return
    const btn = chipsRef.current.querySelector(`[data-id="${selectedId}"]`)
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selectedId])

  const relatedLinks = useMemo(() => {
    if (!selected) return []
    return CHARACTER_RELATIONSHIPS.filter((r) => r.characters[0] === selected.id || r.characters[1] === selected.id)
      .map((r) => {
        const otherId = r.characters[0] === selected.id ? r.characters[1] : r.characters[0]
        const other = ALL_CHARACTERS.find((c) => c.id === otherId)
        if (!other) return null
        return { character: other, type: r.type, label: r.label ?? '' }
      })
      .filter(Boolean) as { character: Character; type: string; label: string }[]
  }, [selected])

  return (
    <>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
        <BackToMapButton className="mb-6" />

        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-bold sm:text-xl" style={{ color: '#f2ece0' }}>
            Character Relationships
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGraphView(false)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors hover:opacity-80 ${
                !graphView ? 'border-purple-500 bg-purple-900/30 text-purple-300' : ''
              }`}
              style={
                !graphView
                  ? undefined
                  : { borderColor: 'rgba(80,60,40,0.25)', background: 'rgba(80,60,40,0.08)', color: '#8a7050' }
              }
            >
              Single View
            </button>
            <button
              onClick={() => setGraphView(true)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors hover:opacity-80 ${
                graphView ? 'border-purple-500 bg-purple-900/30 text-purple-300' : ''
              }`}
              style={
                graphView
                  ? undefined
                  : { borderColor: 'rgba(80,60,40,0.25)', background: 'rgba(80,60,40,0.08)', color: '#8a7050' }
              }
            >
              Graph View
            </button>
            <input
              type="search"
              placeholder="Search characters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 rounded-lg border px-3 py-1.5 text-xs outline-none transition-colors placeholder:text-[#a09070]/50 focus:border-purple-500/50 sm:w-56"
              style={{ borderColor: 'rgba(80,60,40,0.25)', background: 'rgba(80,60,40,0.08)', color: '#5a4a3a' }}
            />
          </div>
        </div>

        {!graphView && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setPlanetFilter('')}
                className={`rounded-full px-3 py-1 text-xxs font-medium transition-colors hover:opacity-80 ${
                  !planetFilter ? 'bg-purple-700/30 text-purple-300' : ''
                }`}
                style={!planetFilter ? undefined : { background: 'rgba(80,60,40,0.08)', color: '#8a7050' }}
              >
                All
              </button>
              {PLANETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlanetFilter(p.id)}
                  className={`rounded-full px-3 py-1 text-xxs font-medium transition-colors hover:opacity-80 ${
                    planetFilter === p.id ? 'bg-purple-700/30 text-purple-300' : ''
                  }`}
                  style={planetFilter === p.id ? undefined : { background: 'rgba(80,60,40,0.08)', color: '#8a7050' }}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div ref={chipsRef} className="flex gap-2 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory' }}>
              {filtered.length === 0 ? (
                <div className="flex w-full items-center justify-center py-6">
                  <EmptyState message="No characters match your search." />
                </div>
              ) : (
                filtered.map((c) => (
                  <div key={c.id} data-id={c.id}>
                    <CharacterChip char={c} selected={c.id === selectedId} onSelect={setSelectedId} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
          {graphView ? (
            <div
              className="flex flex-1 rounded-lg border"
              style={{ borderColor: 'rgba(80,60,40,0.15)', background: 'rgba(80,60,40,0.06)' }}
            >
              <ForceGraph
                characters={ALL_CHARACTERS}
                relationships={CHARACTER_RELATIONSHIPS}
                selectedId={selectedId}
                onSelectCharacter={setSelectedId}
              />
            </div>
          ) : (
            <>
              <div
                className="flex flex-1 flex-col rounded-lg border p-4"
                style={{ borderColor: 'rgba(80,60,40,0.15)', background: 'rgba(80,60,40,0.06)' }}
              >
                {selected ? (
                  <div
                    key={`graph-${selected.id}`}
                    className="flex flex-1 flex-col animate-fade-in-up"
                    style={{ animationDuration: '400ms' }}
                  >
                    <CharacterRelationships
                      character={selected}
                      allCharacters={ALL_CHARACTERS}
                      relationships={CHARACTER_RELATIONSHIPS}
                      onSelectCharacter={(id) => {
                        setSelectedId(id)
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-sm" style={{ color: '#8a7050' }}>
                      Select a character above to see their relationships.
                    </p>
                  </div>
                )}
              </div>

              {selected && relatedLinks.length > 0 && (
                <div
                  className="flex items-center gap-3 rounded-lg border px-4 py-3"
                  style={{ borderColor: 'rgba(80,60,40,0.2)', background: 'rgba(80,60,40,0.06)' }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: `${getPlanetById(selected.planet.toLowerCase())?.color ?? FALLBACK_COLOR}20`,
                        color: getPlanetById(selected.planet.toLowerCase())?.color ?? FALLBACK_COLOR,
                      }}
                    >
                      {selected.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold" style={{ color: '#3a2a1a' }}>
                        {selected.name}
                      </span>
                      <span className="ml-2 text-xs" style={{ color: '#8a7050' }}>
                        {getPlanetById(selected.planet.toLowerCase())?.name ?? selected.planet}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-wrap gap-1.5 justify-end">
                    {relatedLinks.slice(0, 8).map((link) => (
                      <button
                        key={link.character.id}
                        onClick={() => setSelectedId(link.character.id)}
                        className="group inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xxs transition-all hover:opacity-80"
                        style={{ borderColor: 'rgba(80,60,40,0.2)', background: 'rgba(80,60,40,0.08)' }}
                      >
                        <span className="transition-colors" style={{ color: '#8a7050' }}>
                          {link.character.name}
                        </span>
                        <span style={{ color: '#a09070' }}>·</span>
                        <span className="transition-colors" style={{ color: '#8a7050' }}>
                          {link.label}
                        </span>
                      </button>
                    ))}
                    {relatedLinks.length > 8 && (
                      <span className="text-xxs" style={{ color: '#a09070' }}>
                        +{relatedLinks.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
