import { useState, useMemo } from 'react'
import { ALL_CHARACTERS, getPlanetById } from '@/data/static'
import { CHARACTER_RELATIONSHIPS } from '@/data/static'
import CharacterRelationships from '@/components/detail/CharacterRelationships'
import ForceGraph from '@/components/detail/ForceGraph'
import ColorDot from '@/components/ui/ColorDot'
import PageLayout from '@/components/ui/PageLayout'
import EmptyState from '@/components/ui/EmptyState'
import { FALLBACK_COLOR } from '@/data/static'
import { useTextFilter } from '@/hooks/useTextFilter'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import type { Character } from '@/types'

function CharacterCard({
  char,
  selected,
  onSelect,
}: {
  char: Character
  selected: boolean
  onSelect: (id: string) => void
}) {
  const planet = getPlanetById(char.planet.toLowerCase())
  const relCount = CHARACTER_RELATIONSHIPS.filter(
    (r) => r.characters[0] === char.id || r.characters[1] === char.id,
  ).length

  return (
    <button
      onClick={() => onSelect(char.id)}
      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
        selected
          ? 'border-purple-500 bg-purple-900/30 text-gray-100'
          : 'border-gray-700/50 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-gray-300'
      }`}
    >
      <ColorDot color={planet?.color ?? FALLBACK_COLOR} size="md" />
      <span className="truncate font-medium">{char.name}</span>
      {relCount > 0 && (
        <span className="ml-auto shrink-0 rounded bg-gray-700/50 px-1.5 py-0.5 text-xxs text-gray-500">{relCount}</span>
      )}
    </button>
  )
}

function GroupedCharacters({
  label,
  chars,
  selectedId,
  onSelect,
}: {
  label: string
  chars: Character[]
  selectedId: string | undefined
  onSelect: (id: string) => void
}) {
  if (chars.length === 0) return null
  return (
    <div>
      <h3 className="mb-1.5 text-xxs font-semibold uppercase tracking-wider text-gray-600">{label}</h3>
      <div className="flex flex-wrap gap-1.5">
        {chars.map((c) => (
          <CharacterCard key={c.id} char={c} selected={c.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

export default function RelationshipsPage() {
  useSEOMeta({
    title: 'Character Relationships — Cosmere Archive',
    description: 'Explore character relationships and connections across the Cosmere universe',
  })

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [graphView, setGraphView] = useState(false)

  const selected = selectedId ? (ALL_CHARACTERS.find((c) => c.id === selectedId) ?? null) : null

  const textFiltered = useTextFilter(ALL_CHARACTERS, search, ['name', 'planet'])
  const grouped = useMemo(() => {
    const groups = new Map<string, Character[]>()
    for (const char of textFiltered) {
      const planetName = getPlanetById(char.planet.toLowerCase())?.name ?? char.planet
      const arr = groups.get(planetName)
      if (arr) arr.push(char)
      else groups.set(planetName, [char])
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [textFiltered])

  return (
    <PageLayout>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-bold text-gray-100 sm:text-xl">Character Relationships</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setGraphView(false)
              setSelectedId(undefined)
            }}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              !graphView
                ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                : 'border-gray-700/60 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            Single View
          </button>
          <button
            onClick={() => {
              setGraphView(true)
              setSelectedId(undefined)
            }}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              graphView
                ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                : 'border-gray-700/60 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            Graph View
          </button>
          {!graphView && (
            <input
              type="search"
              placeholder="Search characters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 outline-none transition-colors focus:border-purple-500/50 sm:w-56"
            />
          )}
        </div>
      </div>

      {graphView ? (
        <div className="flex min-h-0 flex-1 rounded-lg border border-gray-700/30 bg-gray-900/50">
          <ForceGraph
            characters={ALL_CHARACTERS}
            relationships={CHARACTER_RELATIONSHIPS}
            selectedId={selectedId}
            onSelectCharacter={setSelectedId}
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          <div className="w-56 shrink-0 space-y-3 overflow-y-auto pr-2">
            {grouped.length === 0 ? (
              <EmptyState message="No characters match your search." />
            ) : (
              grouped.map(([planet, chars]) => (
                <GroupedCharacters
                  key={planet}
                  label={planet}
                  chars={chars}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              ))
            )}
          </div>

          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-gray-700/30 bg-gray-900/50 p-4">
            {selected ? (
              <>
                <div className="mb-2 text-center">
                  <h2 className="text-sm font-semibold text-gray-200">{selected.name}</h2>
                  <p className="mt-0.5 text-xs text-gray-500">{selected.description}</p>
                </div>
                <CharacterRelationships
                  character={selected}
                  allCharacters={ALL_CHARACTERS}
                  relationships={CHARACTER_RELATIONSHIPS}
                  onSelectCharacter={setSelectedId}
                />
              </>
            ) : (
              <p className="text-sm text-gray-500">Select a character from the left to see their relationships.</p>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  )
}
