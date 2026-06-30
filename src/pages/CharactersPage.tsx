import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BackToMapButton from '@/components/ui/BackToMapButton'
import { ALL_CHARACTERS, PLANETS, SAGAS, BOOKS } from '@/data/static'
import { FAMILY_TREES } from '@/data/static/family-data'
import PageLayout from '@/components/ui/PageLayout'
import CharacterAvatar from '@/components/ui/CharacterAvatar'
import EmptyState from '@/components/ui/EmptyState'
import FamilyTreeView from '@/components/detail/FamilyTreeView'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { useSpoilerMode } from '@/hooks/useSpoilerMode'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

function crossTreeFamilies(characterId: string): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = []
  for (const f of FAMILY_TREES) {
    if (f.members.some((m) => m.characterId === characterId)) {
      result.push({ id: f.id, name: f.name })
    }
  }
  return result
}

export default function CharactersPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'family' ? 'family' : 'characters'

  const [query, setQuery] = useState('')
  const [planetFilter, setPlanetFilter] = useState<string | null>(null)
  const [sagaFilter, setSagaFilter] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareSelection, setCompareSelection] = useState<string[]>([])
  const { enabled: spoilerEnabled, isCharacterVisible, spoilerCount } = useSpoilerMode()

  const [selectedFamily, setSelectedFamily] = useState(FAMILY_TREES[0]!.id)
  const [detailId, setDetailId] = useState<string | undefined>(undefined)

  useSEOMeta({
    title: tab === 'family' ? 'Family Trees — Cosmere Archive' : 'Characters — Cosmere Archive',
    description:
      tab === 'family'
        ? 'Family trees and dynastic connections of major Cosmere characters'
        : 'Explore all notable characters in the Cosmere universe, filter by planet, saga, or search by name',
  })

  const setTab = (t: 'characters' | 'family') => {
    setSearchParams(t === 'family' ? { tab: 'family' } : {}, { replace: true })
  }

  const sagaOptions = useMemo(
    () =>
      SAGAS.filter((s) =>
        ALL_CHARACTERS.some((c) => c.requiredBooks.some((bId) => BOOKS.find((b) => b.id === bId)?.saga === s.id)),
      ).sort((a, b) => a.order - b.order),
    [],
  )

  const filtered = useMemo(() => {
    const visible = spoilerEnabled ? ALL_CHARACTERS.filter(isCharacterVisible) : ALL_CHARACTERS
    let result = visible
    const q = query.toLowerCase().trim()
    if (q) result = result.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    if (planetFilter) result = result.filter((c) => c.planet === planetFilter)
    if (sagaFilter)
      result = result.filter((c) => c.requiredBooks.some((bId) => BOOKS.find((b) => b.id === bId)?.saga === sagaFilter))
    return result
  }, [query, planetFilter, sagaFilter, spoilerEnabled, isCharacterVisible])

  const { visibleCount, hasMore, sentinelRef } = useInfiniteScroll(filtered, 24)
  const displayed = filtered.slice(0, visibleCount)

  const family = FAMILY_TREES.find((f) => f.id === selectedFamily) ?? FAMILY_TREES[0]!
  const detailChar = detailId ? (ALL_CHARACTERS.find((c) => c.id === detailId) ?? null) : null
  const detailMember = detailId ? (family.members.find((m) => m.characterId === detailId) ?? null) : null
  const crossTrees = useMemo(() => (detailId ? crossTreeFamilies(detailId) : []), [detailId])

  return (
    <PageLayout variant="none">
      <div className="flex gap-1 border-b border-gray-700 px-4 sm:px-6">
        <button
          onClick={() => setTab('characters')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'characters' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Characters
        </button>
        <button
          onClick={() => setTab('family')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'family' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Family Trees
        </button>
      </div>

      {tab === 'characters' ? (
        <div className="flex flex-1 flex-col items-center overflow-y-auto p-6">
          <div className="w-full max-w-4xl animate-fade-in-up">
            <BackToMapButton className="mb-6" />

            <h1 className="text-3xl font-bold text-gray-100">Characters</h1>
            <p className="mt-1 text-sm text-gray-500">All notable Cosmere characters</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search characters..."
                aria-label="Search characters"
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 focus:outline-none sm:w-64"
              />
              <select
                value={planetFilter ?? ''}
                onChange={(e) => setPlanetFilter(e.target.value || null)}
                aria-label="Filter by planet"
                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-300 focus:border-purple-500 focus:outline-none"
              >
                <option value="">All planets</option>
                {PLANETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                value={sagaFilter ?? ''}
                onChange={(e) => setSagaFilter(e.target.value || null)}
                aria-label="Filter by saga"
                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-300 focus:border-purple-500 focus:outline-none"
              >
                <option value="">All sagas</option>
                {sagaOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setCompareMode(!compareMode)
                  setCompareSelection([])
                }}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  compareMode
                    ? 'border-purple-500 bg-purple-900/40 text-purple-300'
                    : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                {compareMode ? 'Exit compare' : 'Compare'}
              </button>
            </div>

            {compareMode && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-purple-800 bg-purple-950/30 px-4 py-3">
                <span className="text-sm text-purple-300">
                  {compareSelection.length === 0
                    ? 'Click two characters to compare'
                    : `${compareSelection.length} selected`}
                </span>
                {compareSelection.length === 2 && (
                  <button
                    onClick={() => {
                      const url = `/compare?a=${compareSelection[0]}&b=${compareSelection[1]}`
                      setCompareMode(false)
                      setCompareSelection([])
                      navigate(url)
                    }}
                    className="ml-auto rounded-md bg-purple-600 px-3 py-1 text-xs text-white transition-colors hover:bg-purple-500"
                  >
                    Compare!
                  </button>
                )}
                <button
                  onClick={() => setCompareSelection([])}
                  className="text-xs text-gray-500 transition-colors hover:text-gray-300"
                >
                  Clear
                </button>
              </div>
            )}

            <p className="mt-3 text-xs text-gray-600">
              {displayed.length} of {filtered.length} characters
              {spoilerEnabled && spoilerCount > 0 && (
                <span className="ml-1 text-purple-500">({spoilerCount} hidden by spoiler mode)</span>
              )}
            </p>

            {filtered.length === 0 && <EmptyState message="No characters match your search." />}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {displayed.map((c) => {
                const planet = PLANETS.find((p) => p.id === c.planet)
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (!compareMode) return
                      setCompareSelection((prev) => {
                        if (prev.includes(c.id)) return prev.filter((id) => id !== c.id)
                        if (prev.length >= 2) return [prev[1]!, c.id]
                        return [...prev, c.id]
                      })
                    }}
                    className={`rounded-lg border bg-gray-900/50 p-4 ${
                      compareMode && compareSelection.includes(c.id)
                        ? 'border-purple-500 ring-1 ring-purple-500/50'
                        : 'border-gray-800'
                    } ${compareMode ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <CharacterAvatar character={c} color={planet?.color} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-200">
                          {c.name}
                          {c.pronunciation && (
                            <span className="ml-1.5 text-xxs italic text-gray-600">/{c.pronunciation}/</span>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`/?focus=planet&id=${c.planet}`)}
                          className="text-xs text-gray-500 capitalize transition-colors hover:text-cyan-400"
                        >
                          {planet?.name ?? c.planet}
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2">{c.description}</p>
                  </div>
                )
              })}
            </div>

            {hasMore && (
              <div ref={sentinelRef} className="mt-6 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
          <BackToMapButton />

          <h1 className="text-lg font-bold text-gray-100 sm:text-xl">Family Trees</h1>

          <div className="flex flex-wrap gap-1.5">
            {FAMILY_TREES.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedFamily(f.id)
                  setDetailId(undefined)
                }}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                  selectedFamily === f.id ? 'text-gray-100' : 'bg-gray-800/50 text-gray-500 hover:text-gray-400'
                }`}
                style={{
                  backgroundColor: selectedFamily === f.id ? f.color + '30' : undefined,
                  color: selectedFamily === f.id ? f.color : undefined,
                }}
              >
                {f.name}
              </button>
            ))}
          </div>

          <p className="text-xs leading-relaxed text-gray-500">{family.description}</p>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
            <div className="flex-1 overflow-auto">
              <FamilyTreeView family={family} onSelectCharacter={setDetailId} />
            </div>

            {detailChar && detailMember && (
              <div className="w-64 shrink-0 rounded-lg border border-gray-700/40 bg-gray-800/60 p-4">
                <button
                  onClick={() => setDetailId(undefined)}
                  className="float-right text-xs text-gray-600 transition-colors hover:text-gray-400"
                  aria-label="Close detail"
                >
                  ✕
                </button>
                <h3 className="text-sm font-semibold text-gray-200">{detailMember.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">{detailChar.description}</p>
                <p className="mt-2 text-xxs text-gray-600">
                  Planet: <span className="capitalize text-gray-500">{detailChar.planet.replace(/_/g, ' ')}</span>
                </p>
                {detailMember.isDeceased && (
                  <span className="mt-2 inline-block rounded bg-red-900/20 px-2 py-0.5 text-xxs text-red-400">
                    Deceased
                  </span>
                )}
                <p className="mt-1 text-xxs text-gray-600">
                  {(() => {
                    const label = detailMember.parentIds
                      ? detailMember.gender === 'female'
                        ? 'Daughter of'
                        : 'Son of'
                      : detailMember.spouseId
                        ? 'Spouse of'
                        : null
                    if (!label) return null
                    const names = detailMember.parentIds
                      ? detailMember.parentIds
                          .map((pid) => {
                            const p = family.members.find((m) => m.id === pid)
                            return p?.name ?? pid
                          })
                          .join(' & ')
                      : detailMember.spouseId
                        ? (() => {
                            const sp = family.members.find((m) => m.id === detailMember.spouseId)
                            return sp?.name ?? detailMember.spouseId
                          })()
                        : null
                    if (!names) return null
                    return (
                      <>
                        {label} <span className="text-gray-500">{names}</span>
                      </>
                    )
                  })()}
                </p>
                {crossTrees.length > 1 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {crossTrees
                      .filter((t) => t.id !== selectedFamily)
                      .map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setSelectedFamily(t.id)
                            setDetailId(detailId)
                          }}
                          className="rounded bg-purple-900/30 px-2 py-0.5 text-xxs text-purple-400 transition-colors hover:bg-purple-900/50"
                        >
                          Also in {t.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  )
}
