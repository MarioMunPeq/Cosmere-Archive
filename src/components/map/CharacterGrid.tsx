import { useMemo, useState, useEffect, useRef } from 'react'
import { PLANETS, SAGAS, getBookById, SAGA_BY_ID, ALL_CHARACTERS } from '@/data/static'
import CharacterComparison from './CharacterComparison'
import type { Planet } from '@/data/static'

function getCharacterSagas(requiredBooks: string[]): string[] {
  const sagaIds = new Set<string>()
  for (const bookId of requiredBooks) {
    const book = getBookById(bookId)
    if (book) sagaIds.add(book.saga)
  }
  return Array.from(sagaIds)
}

const PLANET_BY_ID = new Map<string, Planet>(PLANETS.map((p) => [p.id, p]))

export default function CharacterGrid({ highlightedCharacter }: { highlightedCharacter?: string | null }) {
  const [filterPlanets, setFilterPlanets] = useState<string[]>([])
  const [filterSagas, setFilterSagas] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [comparing, setComparing] = useState<[string, string] | null>(null)
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const highlightedPlanet = useMemo(() => {
    if (!highlightedCharacter) return null
    return ALL_CHARACTERS.find((c) => c.id === highlightedCharacter)?.planet ?? null
  }, [highlightedCharacter])

  useEffect(() => {
    if (!highlightedCharacter) return
    const timer = setTimeout(() => {
      const el = cardRefs.current.get(highlightedCharacter)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
    return () => clearTimeout(timer)
  }, [highlightedCharacter])

  const characterSagasMap = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const c of ALL_CHARACTERS) {
      map.set(c.id, getCharacterSagas(c.requiredBooks))
    }
    return map
  }, [])

  const filtered = useMemo(() => {
    const activePlanets = highlightedPlanet ? Array.from(new Set([...filterPlanets, highlightedPlanet])) : filterPlanets

    return ALL_CHARACTERS.filter((c) => {
      if (activePlanets.length > 0 && !activePlanets.includes(c.planet)) return false
      const cSagas = characterSagasMap.get(c.id) ?? []
      if (filterSagas.length > 0 && !filterSagas.some((s) => cSagas.includes(s))) return false
      return true
    })
  }, [filterPlanets, filterSagas, characterSagasMap, highlightedPlanet])

  function togglePlanet(id: string) {
    setFilterPlanets((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function toggleSaga(id: string) {
    setFilterSagas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  function clearFilters() {
    setFilterPlanets([])
    setFilterSagas([])
  }

  const hasFilters = filterPlanets.length > 0 || filterSagas.length > 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Planet</span>
          <div className="flex flex-wrap gap-1">
            {PLANETS.map((p) => {
              const active = filterPlanets.includes(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlanet(p.id)}
                  className={`rounded px-2 py-0.5 text-xs transition-colors ${
                    active
                      ? 'bg-gray-700 font-medium text-white'
                      : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                  }`}
                >
                  {p.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Saga</span>
          <div className="flex flex-wrap gap-1">
            {SAGAS.filter((s) => s.id !== 'pre-cosmere').map((s) => {
              const active = filterSagas.includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSaga(s.id)}
                  className={`rounded px-2 py-0.5 text-xs transition-colors ${
                    active
                      ? 'bg-gray-700 font-medium text-white'
                      : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                  }`}
                >
                  {s.name}
                </button>
              )
            })}
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto rounded px-2 py-0.5 text-xs text-gray-600 hover:text-gray-400"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-gray-600">No characters match the selected filters.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => {
              const planet = PLANET_BY_ID.get(c.planet)
              const cSagas = characterSagasMap.get(c.id) ?? []
              const isSelected = selected.includes(c.id)
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    if (el) cardRefs.current.set(c.id, el)
                  }}
                  onClick={() => toggleSelected(c.id)}
                  className={`group relative flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? 'border-purple-500/60 bg-purple-900/20'
                      : c.id === highlightedCharacter
                        ? 'border-yellow-500/40 bg-yellow-900/10'
                        : 'border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-800">
                    <span className="text-sm font-bold text-gray-600">{c.name.charAt(0)}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-200">{c.name}</span>
                      {planet && (
                        <span
                          className="inline-block h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: planet.color }}
                          title={planet.name}
                        />
                      )}
                    </div>

                    <div className="mt-0.5 flex flex-wrap gap-1.5">
                      {planet && <span className="text-xs text-gray-500">{planet.name}</span>}
                      {cSagas.map((sId) => {
                        const saga = SAGA_BY_ID.get(sId)
                        return saga ? (
                          <span key={sId} className="rounded bg-gray-800 px-1.5 py-0.5 text-xxs text-gray-500">
                            {saga.name}
                          </span>
                        ) : null
                      })}
                    </div>

                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{c.description}</p>
                  </div>

                  {isSelected && <span className="absolute right-2 top-2 text-xs text-purple-400">x</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selected.length === 2 && (
        <div className="sticky bottom-0 border-t border-gray-800 bg-gray-900/95 p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">2 characters selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected([])}
                className="rounded px-2.5 py-1 text-xs text-gray-500 hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => setComparing([selected[0]!, selected[1]!])}
                className="rounded bg-purple-700 px-3 py-1 text-xs font-medium text-white hover:bg-purple-600"
              >
                Compare
              </button>
            </div>
          </div>
        </div>
      )}

      {comparing && <CharacterComparison characterIds={comparing} onClose={() => setComparing(null)} />}
    </div>
  )
}
