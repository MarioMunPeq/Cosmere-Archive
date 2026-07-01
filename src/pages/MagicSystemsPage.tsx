import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '@/components/ui/EmptyState'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { PLANETS, BOOKS, ALL_CHARACTERS, getPlanetById } from '@/data/static'
import type { Character } from '@/types'
import { MAGIC_SYSTEMS, type MagicSystem } from '@/data/static/magic-systems'
import MagicSystemDetail from '@/components/magic/MagicSystemDetail'
import MagicSystemCard from '@/components/magic/MagicSystemCard'
import CharacterDetailModal from '@/components/detail/CharacterDetailModal'
import PageLayout from '@/components/ui/PageLayout'

function planetById(id: string) {
  return getPlanetById(id)
}

export default function MagicSystemsPage() {
  const [searchParams] = useSearchParams()

  useSEOMeta({
    title: 'Magic Systems — Cosmere Archive',
    description: 'Explore all magic systems in the Cosmere — Allomancy, Surgebinding, AonDor, and more',
  })

  const [planetFilter, setPlanetFilter] = useState<string>(() => {
    const param = searchParams.get('system')
    const found = MAGIC_SYSTEMS.find((ms) => ms.id === param)
    return found?.planetId ?? ''
  })
  const [selectedSystem, setSelectedSystem] = useState<MagicSystem | null>(() => {
    const param = searchParams.get('system')
    return MAGIC_SYSTEMS.find((ms) => ms.id === param) ?? null
  })
  const [magicSearch, setMagicSearch] = useState('')
  const [magicCharDetail, setMagicCharDetail] = useState<Character | null>(null)

  const magicFiltered = useMemo(() => {
    if (!planetFilter) return MAGIC_SYSTEMS
    return MAGIC_SYSTEMS.filter((s) => s.planetId === planetFilter)
  }, [planetFilter])

  const magicTextFiltered = useMemo(() => {
    if (!magicSearch.trim()) return magicFiltered
    const q = magicSearch.toLowerCase().trim()
    return magicFiltered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shard.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    )
  }, [magicFiltered, magicSearch])

  const groupedByPlanet = useMemo(() => {
    const groups = new Map<string, MagicSystem[]>()
    for (const system of magicTextFiltered) {
      const existing = groups.get(system.planetId) ?? []
      existing.push(system)
      groups.set(system.planetId, existing)
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [magicTextFiltered])

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
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-gray-800/60 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-100 sm:text-2xl">Magic Systems</h1>
              <p className="mt-0.5 text-xs text-gray-500">The investiture-based magic systems of the Cosmere</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="search"
                placeholder="Search systems..."
                value={magicSearch}
                onChange={(e) => {
                  setMagicSearch(e.target.value)
                  setSelectedSystem(null)
                }}
                className="w-44 rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 outline-none transition-colors focus:border-purple-500/50 sm:w-48"
              />
              <select
                value={planetFilter}
                onChange={(e) => {
                  setPlanetFilter(e.target.value)
                  setSelectedSystem(null)
                }}
                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs text-gray-300 outline-none transition-colors focus:border-purple-500/60"
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
        </div>

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-6xl">
              {groupedByPlanet.length === 0 ? (
                <EmptyState message="No magic systems match your search." />
              ) : (
                groupedByPlanet.map(([planetId, systems]) => {
                  const planet = planetById(planetId)
                  if (!planet) return null
                  return (
                    <div key={planetId} className="mb-8">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: planet.color }} />
                        <h2 className="text-sm font-semibold text-gray-200">{planet.name}</h2>
                        <span className="text-xs text-gray-600">{systems.length}</span>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {systems.map((s) => {
                          const chars = ALL_CHARACTERS.filter((c) => c.planet === s.planetId)
                          const books = s.bookIds
                            .map((bid) => BOOKS.find((b) => b.id === bid))
                            .filter((b): b is (typeof BOOKS)[number] => !!b)
                          return (
                            <button key={s.id} onClick={() => setSelectedSystem(s)} className="text-left">
                              <MagicSystemCard
                                system={s}
                                planet={planet}
                                characters={chars}
                                booksCount={books.length}
                              />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {selectedSystem && selectedDetail && (
            <div className="w-96 shrink-0 overflow-y-auto border-l border-gray-800/60 bg-gray-950/95 backdrop-blur-xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-800/60 bg-gray-950/90 px-5 py-3 backdrop-blur-sm">
                <span className="text-xs font-medium text-gray-500">Detail</span>
                <button
                  onClick={() => setSelectedSystem(null)}
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
                <MagicSystemDetail
                  system={selectedDetail.system}
                  planet={selectedDetail.planet}
                  characters={selectedDetail.characters}
                  books={selectedDetail.books}
                  onSelectCharacter={(id) => {
                    const found = ALL_CHARACTERS.find((c) => c.id === id)
                    if (found) setMagicCharDetail(found)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {magicCharDetail && <CharacterDetailModal character={magicCharDetail} onClose={() => setMagicCharDetail(null)} />}
    </PageLayout>
  )
}
