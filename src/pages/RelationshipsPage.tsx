import { useState, useMemo } from 'react'
import { ALL_CHARACTERS } from '@/data/static'
import { CHARACTER_RELATIONSHIPS } from '@/data/static/character-relationships'
import CharacterRelationships from '@/components/detail/CharacterRelationships'
import { PLANETS } from '@/data/static'
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
  const planet = PLANETS.find((p) => p.id === char.planet.toLowerCase())
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
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: planet?.color ?? '#6b7280' }} />
      <span className="truncate font-medium">{char.name}</span>
      {relCount > 0 && (
        <span className="ml-auto shrink-0 rounded bg-gray-700/50 px-1.5 py-0.5 text-[10px] text-gray-500">
          {relCount}
        </span>
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
      <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">{label}</h3>
      <div className="flex flex-wrap gap-1.5">
        {chars.map((c) => (
          <CharacterCard key={c.id} char={c} selected={c.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

export default function RelationshipsPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')

  const selected = selectedId ? (ALL_CHARACTERS.find((c) => c.id === selectedId) ?? null) : null

  const grouped = useMemo(() => {
    const query = search.toLowerCase()
    const filtered = query
      ? ALL_CHARACTERS.filter((c) => c.name.toLowerCase().includes(query) || c.planet.toLowerCase().includes(query))
      : ALL_CHARACTERS

    const groups = new Map<string, Character[]>()
    for (const char of filtered) {
      const planetName = PLANETS.find((p) => p.id === char.planet.toLowerCase())?.name ?? char.planet
      const arr = groups.get(planetName)
      if (arr) arr.push(char)
      else groups.set(planetName, [char])
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [search])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-100 sm:text-xl">Character Relationships</h1>
        <input
          type="search"
          placeholder="Search characters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-44 rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 outline-none transition-colors focus:border-purple-500/50 sm:w-56"
        />
      </div>

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
        <div className="w-56 shrink-0 space-y-3 overflow-y-auto pr-2">
          {grouped.map(([planet, chars]) => (
            <GroupedCharacters
              key={planet}
              label={planet}
              chars={chars}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ))}
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
    </div>
  )
}
