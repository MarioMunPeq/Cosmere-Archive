import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ALL_CHARACTERS, PLANETS, SAGAS, BOOKS } from '@/data/static'
import PageLayout from '@/components/ui/PageLayout'
import CharacterAvatar from '@/components/ui/CharacterAvatar'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { useSpoilerMode } from '@/hooks/useSpoilerMode'

export default function CharactersPage() {
  const [query, setQuery] = useState('')
  const [planetFilter, setPlanetFilter] = useState<string | null>(null)
  const [sagaFilter, setSagaFilter] = useState<string | null>(null)
  const { enabled: spoilerEnabled, isCharacterVisible, spoilerCount } = useSpoilerMode()

  useSEOMeta({
    title: 'Characters — Cosmere Archive',
    description: 'Explore all notable characters in the Cosmere universe, filter by planet, saga, or search by name',
  })

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

  return (
    <PageLayout variant="center">
      <div className="w-full max-w-4xl animate-fade-in-up">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-purple-400 transition-colors hover:text-purple-300"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to the map
        </Link>

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
        </div>

        <p className="mt-3 text-xs text-gray-600">
          {filtered.length} of {ALL_CHARACTERS.length} characters
          {spoilerEnabled && spoilerCount > 0 && (
            <span className="ml-1 text-purple-500">({spoilerCount} hidden by spoiler mode)</span>
          )}
        </p>

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-sm text-gray-500">No characters match your search.</p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const planet = PLANETS.find((p) => p.id === c.planet)
            return (
              <div key={c.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                <div className="flex items-center gap-3">
                  <CharacterAvatar character={c} color={planet?.color} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-200">
                      {c.name}
                      {c.pronunciation && (
                        <span className="ml-1.5 text-xxs italic text-gray-600">/{c.pronunciation}/</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{planet?.name ?? c.planet}</div>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2">{c.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </PageLayout>
  )
}
