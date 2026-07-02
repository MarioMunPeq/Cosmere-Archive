import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BackToMapButton from '@/components/ui/BackToMapButton'
import { ALL_CHARACTERS, PLANETS, SAGAS, getCharacterSagas, TAILWIND_TO_HEX } from '@/data/static'
import type { Saga } from '@/data/static/sagas'
import { FAMILY_TREES } from '@/data/static/family-data'
import { CHARACTER_SPANS } from '@/data/static/timeline/character-lifespans'
import PageLayout from '@/components/ui/PageLayout'
import CharacterAvatar from '@/components/ui/CharacterAvatar'
import ColorDot from '@/components/ui/ColorDot'
import EmptyState from '@/components/ui/EmptyState'
import CharacterDetailModal from '@/components/detail/CharacterDetailModal'
import FamilyTreeView from '@/components/detail/FamilyTreeView'
import RelationshipsTabContent from '@/components/detail/RelationshipsTabContent'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { useSpoilerMode } from '@/hooks/useSpoilerMode'

function getSagaColor(saga: Saga): string {
  return TAILWIND_TO_HEX[saga.color] ?? '#6b7280'
}

function crossTreeFamilies(characterId: string): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = []
  for (const f of FAMILY_TREES) {
    if (f.members.some((m) => m.characterId === characterId)) {
      result.push({ id: f.id, name: f.name })
    }
  }
  return result
}

const FAMILY_ICONS: Record<string, string> = {
  kholin: '\uD83D\uDC51',
  davar: '\uD83C\uDF38',
  venture: '\u2694\uFE0F',
  survivor: '\u26A1',
  idris: '\uD83D\uDD4A\uFE0F',
  elantris: '\u2728',
  era2_scadrial: '\uD83C\uDFA9',
}

const FEATURED = new Set([
  'kaladin',
  'shallan',
  'dalinar',
  'szeth',
  'navani',
  'adolin',
  'jasnah',
  'lift',
  'venli',
  'kelsier',
  'vin',
  'elend',
  'sazed',
  'spook',
  'wax',
  'wayne',
  'marasi',
  'steris',
  'raoden',
  'sarene',
  'vasher',
  'vivenna',
  'nightblood',
  'kenton',
  'tress',
  'yumi',
  'hoid',
])

const STARS = Array.from({ length: 30 }, (_, i) => ({
  left: `${((i * 17.3 + 7.1) % 100).toFixed(1)}%`,
  top: `${((i * 23.9 + 3.7) % 100).toFixed(1)}%`,
  delay: `${((i * 0.7) % 5).toFixed(1)}s`,
  duration: `${(3 + (i % 4)).toFixed(1)}s`,
  size: i % 5 === 0 ? 'h-0.5 w-0.5' : 'h-px w-px',
  opacity: 0.08 + ((i * 0.3) % 0.25),
}))

function useActiveSection(sectionIds: string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (sectionIds.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        let bestId: string | null = null
        let bestRatio = 0
        for (const entry of entries) {
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio
            bestId = entry.target.id
          }
        }
        if (bestId) setActive(bestId)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-80px 0px -40% 0px' },
    )

    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [sectionIds])

  return active
}

export default function CharactersPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab =
    searchParams.get('tab') === 'family'
      ? 'family'
      : searchParams.get('tab') === 'relationships'
        ? 'relationships'
        : 'characters'

  const [query, setQuery] = useState('')
  const [planetFilter, setPlanetFilter] = useState<string | null>(null)
  const [sagaFilter, setSagaFilter] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareSelection, setCompareSelection] = useState<string[]>([])
  const { enabled: spoilerEnabled, isCharacterVisible, spoilerCount } = useSpoilerMode()

  const [selectedFamily, setSelectedFamily] = useState(FAMILY_TREES[0]!.id)
  const [detailId, setDetailId] = useState<string | undefined>(() => {
    const param = searchParams.get('character')
    return param ?? undefined
  })
  const [detailChar, setDetailChar] = useState<(typeof ALL_CHARACTERS)[number] | null>(() => {
    const param = searchParams.get('character')
    return ALL_CHARACTERS.find((c) => c.id === param) ?? null
  })
  const [detailOrigin, setDetailOrigin] = useState<DOMRect | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  useSEOMeta({
    title:
      tab === 'family'
        ? 'Family Trees — Cosmere Archive'
        : tab === 'relationships'
          ? 'Character Relationships — Cosmere Archive'
          : 'Characters — Cosmere Archive',
    description:
      tab === 'family'
        ? 'Family trees and dynastic connections of major Cosmere characters'
        : tab === 'relationships'
          ? 'Explore character relationships and connections across the Cosmere universe'
          : 'Explore all notable characters in the Cosmere universe, filter by planet, saga, or search by name',
  })

  const setTab = useCallback(
    (t: 'characters' | 'family' | 'relationships') => {
      const params: Record<string, string> = {}
      if (t === 'family') params.tab = 'family'
      else if (t === 'relationships') params.tab = 'relationships'
      setSearchParams(params, { replace: true })
    },
    [setSearchParams],
  )

  const sagaOptions = useMemo(
    () =>
      SAGAS.filter((s) => ALL_CHARACTERS.some((c) => getCharacterSagas(c.requiredBooks).includes(s.id))).sort(
        (a, b) => a.order - b.order,
      ),
    [],
  )

  const filtered = useMemo(() => {
    const visible = spoilerEnabled ? ALL_CHARACTERS.filter(isCharacterVisible) : ALL_CHARACTERS
    let result = visible
    const q = query.toLowerCase().trim()
    if (q) result = result.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    if (planetFilter) result = result.filter((c) => c.planet === planetFilter)
    if (sagaFilter) result = result.filter((c) => getCharacterSagas(c.requiredBooks).includes(sagaFilter))
    return result
  }, [query, planetFilter, sagaFilter, spoilerEnabled, isCharacterVisible])

  const grouped = useMemo(() => {
    const sagaIds = new Set<string>()
    for (const c of filtered) {
      for (const sid of getCharacterSagas(c.requiredBooks)) {
        sagaIds.add(sid)
      }
    }

    let activeSagas = SAGAS.filter((s) => sagaIds.has(s.id))
    if (sagaFilter) {
      activeSagas = activeSagas.filter((s) => s.id === sagaFilter)
    }
    activeSagas.sort((a, b) => a.order - b.order)

    return activeSagas.map((saga) => ({
      saga,
      characters: filtered.filter((c) => getCharacterSagas(c.requiredBooks).includes(saga.id)),
    }))
  }, [filtered, sagaFilter])

  const activeSection = useActiveSection(useMemo(() => grouped.map((g) => g.saga.id), [grouped]))

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const handleCompareSelect = useCallback((id: string) => {
    setCompareSelection((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id)
      if (prev.length >= 2) return [prev[1]!, id]
      return [...prev, id]
    })
  }, [])

  const family = FAMILY_TREES.find((f) => f.id === selectedFamily) ?? FAMILY_TREES[0]!
  const treeDetailChar = detailId ? (ALL_CHARACTERS.find((c) => c.id === detailId) ?? null) : null
  const treeDetailMember = detailId ? (family.members.find((m) => m.characterId === detailId) ?? null) : null
  const crossTrees = useMemo(() => (detailId ? crossTreeFamilies(detailId) : []), [detailId])

  return (
    <PageLayout variant="none">
      {tab === 'characters' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          {STARS.map((s, i) => (
            <div
              key={i}
              className={`absolute rounded-full bg-white ${s.size}`}
              style={{
                left: s.left,
                top: s.top,
                opacity: s.opacity,
                animation: `twinkle ${s.duration} ease-in-out ${s.delay} infinite`,
              }}
            />
          ))}
        </div>
      )}

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
        <button
          onClick={() => setTab('relationships')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'relationships'
              ? 'border-b-2 border-purple-500 text-purple-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Relationships
        </button>
      </div>

      {tab === 'characters' ? (
        <div className="flex flex-1 overflow-hidden">
          <aside className="hidden w-52 shrink-0 overflow-y-auto border-r border-gray-800/50 lg:block">
            <div className="sticky top-0 p-4">
              <h3 className="text-xxs font-semibold uppercase tracking-widest text-gray-600">Sagas</h3>
              <nav className="mt-3 space-y-0.5">
                {grouped.map(({ saga, characters }) => {
                  const isActive = activeSection === saga.id
                  return (
                    <button
                      key={saga.id}
                      onClick={() => scrollToSection(saga.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-all duration-200 ${
                        isActive
                          ? 'bg-gray-800/60 text-gray-200'
                          : 'text-gray-500 hover:bg-gray-800/30 hover:text-gray-400'
                      }`}
                    >
                      <span
                        className={`shrink-0 rounded-full transition-all duration-200 ${
                          isActive ? 'h-2.5 w-2.5' : 'h-2 w-2'
                        }`}
                        style={{ backgroundColor: getSagaColor(saga) }}
                      />
                      <span className="truncate text-left">{saga.name}</span>
                      <span className="ml-auto text-xxs text-gray-600">{characters.length}</span>
                    </button>
                  )
                })}
              </nav>
              <div className="mt-4 h-px bg-gradient-to-r from-gray-800/60 to-transparent" />
            </div>
          </aside>

          <main ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
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
                  className="w-full rounded-xl border border-gray-800/60 bg-gray-900/70 px-3.5 py-2 text-sm text-gray-200 placeholder-gray-600 shadow-inner backdrop-blur-sm focus:border-purple-500 focus:outline-none sm:w-64"
                />
                <select
                  value={planetFilter ?? ''}
                  onChange={(e) => setPlanetFilter(e.target.value || null)}
                  aria-label="Filter by planet"
                  className="rounded-xl border border-gray-800/60 bg-gray-900/70 px-3.5 py-2 text-sm text-gray-300 shadow-inner backdrop-blur-sm focus:border-purple-500 focus:outline-none"
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
                  className="rounded-xl border border-gray-800/60 bg-gray-900/70 px-3.5 py-2 text-sm text-gray-300 shadow-inner backdrop-blur-sm focus:border-purple-500 focus:outline-none"
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
                  className={`rounded-xl border px-3.5 py-2 text-sm transition-colors ${
                    compareMode
                      ? 'border-purple-500 bg-purple-900/40 text-purple-300'
                      : 'border-gray-800/60 bg-gray-900/70 text-gray-400 shadow-inner backdrop-blur-sm hover:border-gray-600/60 hover:text-gray-300'
                  }`}
                >
                  {compareMode ? 'Exit compare' : 'Compare'}
                </button>
              </div>

              {compareMode && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-purple-800/60 bg-purple-950/30 px-4 py-3 shadow-inner backdrop-blur-sm">
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
                {filtered.length} character{filtered.length !== 1 ? 's' : ''}
                {spoilerEnabled && spoilerCount > 0 && (
                  <span className="ml-1 text-purple-500">({spoilerCount} hidden by spoiler mode)</span>
                )}
              </p>

              {filtered.length === 0 && <EmptyState message="No characters match your search." />}

              <div className="mt-6">
                {grouped.map(({ saga, characters }, idx) => {
                  const sagaColor = getSagaColor(saga)
                  return (
                    <section key={saga.id} id={saga.id} className="scroll-mt-16">
                      {idx > 0 && (
                        <div className="relative my-10 overflow-hidden">
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700/30 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-gray-950 px-3 text-xxs text-gray-700">✦</span>
                          </div>
                        </div>
                      )}

                      <div
                        className="-mx-4 rounded-2xl px-4 py-6 sm:-mx-6 sm:px-6"
                        style={{
                          background: `linear-gradient(to bottom, ${sagaColor}08, transparent 70%)`,
                        }}
                      >
                        <div className="mb-5 flex items-center gap-3">
                          <span className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: sagaColor }} />
                          <div>
                            <h2 className="text-xl font-bold text-gray-100 sm:text-2xl">{saga.name}</h2>
                            {saga.description && <p className="mt-0.5 text-sm text-gray-500">{saga.description}</p>}
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {characters.map((c) => {
                            const planet = PLANETS.find((p) => p.id === c.planet)
                            const isFeatured = FEATURED.has(c.id)
                            return (
                              <div
                                key={c.id}
                                className={`group relative cursor-pointer rounded-xl border bg-gray-900/70 p-4 shadow-inner backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
                                  compareMode && compareSelection.includes(c.id)
                                    ? 'border-purple-500 ring-1 ring-purple-500/50'
                                    : 'border-gray-800/60 hover:border-gray-700/70 hover:shadow-gray-900/30'
                                }`}
                                style={
                                  isFeatured && planet?.color
                                    ? {
                                        background: `linear-gradient(135deg, ${planet.color}10, ${planet.color}05 40%, rgba(15,23,42,0.7) 80%)`,
                                      }
                                    : undefined
                                }
                                onClick={(e) => {
                                  if (compareMode) {
                                    handleCompareSelect(c.id)
                                  } else {
                                    setDetailOrigin(e.currentTarget.getBoundingClientRect())
                                    setDetailChar(c)
                                  }
                                }}
                              >
                                <div
                                  className="absolute left-0 top-2 w-[3px] rounded-r-sm transition-all duration-300 group-hover:w-[5px] group-hover:opacity-80"
                                  style={{
                                    bottom: c.description ? undefined : '0.5rem',
                                    top: '0.5rem',
                                    backgroundColor: planet?.color ?? '#6b7280',
                                    opacity: isFeatured ? 0.7 : 0.4,
                                  }}
                                />

                                <div className="flex items-start gap-3 pl-2.5">
                                  <CharacterAvatar
                                    character={c}
                                    color={planet?.color ?? '#6b7280'}
                                    size={52}
                                    className="shrink-0 ring-1 ring-gray-700/50 transition-all duration-300 group-hover:ring-2"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`truncate text-gray-200 ${
                                          isFeatured ? 'text-base font-semibold' : 'text-sm font-medium'
                                        }`}
                                      >
                                        {c.name}
                                      </span>
                                      {c.pronunciation && (
                                        <span className="shrink-0 text-xxs italic text-gray-600">
                                          /{c.pronunciation}/
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(`/map?focus=planet&id=${c.planet}`)
                                      }}
                                      className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-cyan-400"
                                    >
                                      <ColorDot color={planet?.color ?? '#6b7280'} size="xs" />
                                      {planet?.name ?? c.planet.replace(/_/g, ' ')}
                                    </button>
                                  </div>
                                </div>

                                <p className="mt-2.5 pl-2.5 text-xs leading-relaxed text-gray-500 line-clamp-2">
                                  {c.description}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </section>
                  )
                })}
              </div>
            </div>
          </main>
        </div>
      ) : tab === 'relationships' ? (
        <RelationshipsTabContent />
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
            <BackToMapButton />

            <h1 className="mt-4 text-2xl font-bold text-gray-100 sm:text-3xl">Family Trees</h1>
            <p className="mt-1 text-sm text-gray-500">Dynastic connections across the Cosmere</p>

            <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
              {FAMILY_TREES.map((f) => {
                const isActive = selectedFamily === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setSelectedFamily(f.id)
                      setDetailId(undefined)
                    }}
                    className={`relative shrink-0 rounded-xl border px-4 py-3.5 text-left backdrop-blur-sm transition-all duration-300 ${
                      isActive
                        ? 'border-gray-700/70 bg-gray-800/70 shadow-lg shadow-black/30'
                        : 'border-gray-800/50 bg-gray-900/50 hover:border-gray-700/50 hover:bg-gray-800/50'
                    }`}
                    style={{ minWidth: 180 }}
                  >
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-xl opacity-10"
                        style={{ background: `linear-gradient(135deg, ${f.color}, transparent 70%)` }}
                      />
                    )}
                    <div className="relative flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border text-base transition-all duration-300 ${
                          isActive
                            ? 'border-gray-700/60 bg-gray-800/80 shadow-inner'
                            : 'border-gray-800/50 bg-gray-900/60'
                        }`}
                      >
                        {FAMILY_ICONS[f.id] ?? '\uD83C\uDF31'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold transition-colors duration-300 ${
                              isActive ? 'text-gray-100' : 'text-gray-400'
                            }`}
                          >
                            {f.name}
                          </span>
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300 ${
                              isActive ? 'opacity-100' : 'opacity-30'
                            }`}
                            style={{ backgroundColor: f.color }}
                          />
                        </div>
                        <p className="mt-0.5 text-xxs text-gray-600">{f.members.length} members</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <p className="mt-4 text-xs leading-relaxed text-gray-500">{family.description}</p>

            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
              <div
                className="min-h-80 flex-1 overflow-auto rounded-xl border border-gray-800/60 p-4 shadow-inner backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${family.color}10, ${family.color}05 40%, rgba(3,7,18,0.8) 80%)`,
                }}
              >
                <FamilyTreeView family={family} onSelectCharacter={setDetailId} />
              </div>

              {treeDetailChar && treeDetailMember && (
                <div
                  className="w-full shrink-0 rounded-xl border border-gray-800/60 p-5 shadow-inner backdrop-blur-sm lg:w-80"
                  style={{
                    background: `linear-gradient(135deg, ${family.color}08, ${family.color}03 50%, rgba(17,24,39,0.7) 80%)`,
                  }}
                >
                  <button
                    onClick={() => setDetailId(undefined)}
                    className="float-right text-xs text-gray-600 transition-colors hover:text-gray-400"
                    aria-label="Close detail"
                  >
                    {'\u2715'}
                  </button>

                  <div className="flex items-center gap-3">
                    <CharacterAvatar
                      character={treeDetailChar}
                      color={
                        (treeDetailChar.planet
                          ? PLANETS.find((p) => p.id === treeDetailChar.planet)?.color
                          : undefined) ?? family.color
                      }
                      size={52}
                      className="shrink-0 ring-1 ring-gray-700/40 shadow-md"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-200">{treeDetailMember.name}</h3>
                      {(() => {
                        const span = CHARACTER_SPANS.find((s) => s.id === detailId)
                        if (!span || span.titles.length === 0) return null
                        return (
                          <p className="mt-0.5 text-xxs text-gray-500 truncate">
                            {span.titles.slice(0, 2).join(' \u00B7 ')}
                          </p>
                        )
                      })()}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span
                      className="rounded-md border px-2 py-0.5 text-xxs font-medium"
                      style={{
                        borderColor: `${family.color}40`,
                        backgroundColor: `${family.color}15`,
                        color: family.color,
                      }}
                    >
                      {family.name}
                    </span>
                    {treeDetailMember.isDeceased && (
                      <span className="rounded-md border border-red-900/40 bg-red-900/15 px-2 py-0.5 text-xxs font-medium text-red-400">
                        Deceased
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-gray-500">{treeDetailChar.description}</p>

                  <div className="mt-3 flex items-center gap-2 text-xxs text-gray-600">
                    <ColorDot
                      color={
                        (treeDetailChar.planet
                          ? PLANETS.find((p) => p.id === treeDetailChar.planet)?.color
                          : undefined) ?? '#6b7280'
                      }
                      size="xs"
                    />
                    <span className="capitalize">{treeDetailChar.planet.replace(/_/g, ' ')}</span>
                  </div>

                  <p className="mt-2 text-xxs text-gray-600">
                    {(() => {
                      const label = treeDetailMember.parentIds
                        ? treeDetailMember.gender === 'female'
                          ? 'Daughter of'
                          : 'Son of'
                        : treeDetailMember.spouseId
                          ? 'Spouse of'
                          : null
                      if (!label) return null
                      const names = treeDetailMember.parentIds
                        ? treeDetailMember.parentIds
                            .map((pid) => {
                              const p = family.members.find((m) => m.id === pid)
                              return p?.name ?? pid
                            })
                            .join(' & ')
                        : treeDetailMember.spouseId
                          ? (() => {
                              const sp = family.members.find((m) => m.id === treeDetailMember.spouseId)
                              return sp?.name ?? treeDetailMember.spouseId
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
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {crossTrees
                        .filter((t) => t.id !== selectedFamily)
                        .map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setSelectedFamily(t.id)
                              setDetailId(detailId)
                            }}
                            className="rounded-md border border-purple-800/30 bg-purple-900/20 px-2 py-0.5 text-xxs text-purple-400 transition-all hover:border-purple-700/50 hover:bg-purple-900/40"
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
        </div>
      )}

      {detailChar && (
        <CharacterDetailModal
          character={detailChar}
          originRect={detailOrigin}
          onClose={() => {
            setDetailChar(null)
            setDetailOrigin(null)
          }}
          onSelectCharacter={(id) => {
            const next = ALL_CHARACTERS.find((c) => c.id === id)
            if (next) setDetailChar(next)
          }}
        />
      )}
    </PageLayout>
  )
}
