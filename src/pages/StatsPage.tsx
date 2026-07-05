import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import BackToMapButton from '@/components/ui/BackToMapButton'
import { BOOKS, PLANETS, SAGAS, ALL_CHARACTERS, SHARD_COLORS, SAGA_NAME_COLORS } from '@/data/static'
import { TIMELINE_EVENTS } from '@/data/static/timeline'
import { HERALDS } from '@/data/static/heralds'
import { useSEOMeta } from '@/hooks/useSEOMeta'

const SHARD_COUNT = Object.keys(SHARD_COLORS).length
const SHARD_NAMES = Object.keys(SHARD_COLORS)
const SAGA_LIST = (SAGAS as { id: string; name: string; color: string; order: number; description?: string }[]).filter(
  (s) => s.id !== 'pre-cosmere',
)

function AnimatedCounter({ end, ...props }: { end: number } & React.HTMLAttributes<HTMLSpanElement>) {
  const [val, setVal] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    const duration = 1200
    const start = performance.now()
    const raf = () => {
      const elapsed = performance.now() - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - (1 - t) ** 3
      setVal(Math.round(eased * end))
      if (t < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [end])
  return <span {...props}>{val.toLocaleString()}</span>
}

function WordCountGrid({ books, colorMap }: { books: typeof BOOKS; colorMap: Record<string, string> }) {
  const [selectedSagas, setSelectedSagas] = useState<string[]>([])
  const [sortAsc, setSortAsc] = useState(false)

  const availableSagas = useMemo(() => {
    const sagaIds = new Set(books.map((b) => b.saga))
    return SAGA_LIST.filter((s) => sagaIds.has(s.id))
  }, [books])

  const displayBooks = useMemo(() => {
    let filtered = books
    if (selectedSagas.length > 0) {
      filtered = filtered.filter((b) => selectedSagas.includes(b.saga))
    }
    return [...filtered].sort((a, b) => {
      const diff = (a.wordCount ?? 0) - (b.wordCount ?? 0)
      return sortAsc ? diff : -diff
    })
  }, [books, selectedSagas, sortAsc])

  const toggleSaga = (id: string) => {
    setSelectedSagas((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const allSelected = selectedSagas.length === 0

  return (
    <div className="flex-1 min-h-0 overflow-y-auto rounded-xl">
      <div className="flex items-center gap-2 px-1 pb-3 sm:px-2">
        <button
          onClick={() => setSelectedSagas([])}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
            allSelected
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white ring-1 ring-cyan-500/30'
              : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
          }`}
        >
          All
        </button>
        {availableSagas.map((saga) => (
          <button
            key={saga.id}
            onClick={() => toggleSaga(saga.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
              selectedSagas.includes(saga.id)
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white ring-1 ring-cyan-500/30'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
            }`}
          >
            {saga.name}
          </button>
        ))}
        <div className="ml-auto" />
        <button
          onClick={() => setSortAsc((prev) => !prev)}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-white/5 px-2 py-1 text-xs text-gray-500 transition-all hover:border-white/20 hover:text-gray-300"
        >
          {sortAsc ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 p-1 sm:gap-5 sm:p-2">
        {displayBooks.map((book) => {
          const wc = book.wordCount ?? 0
          const color = colorMap[book.saga as keyof typeof colorMap] ?? '#a78bfa'
          const coverUrl = `${import.meta.env.BASE_URL}${book.cover}`
          const badge = wc >= 1_000_000 ? `${(wc / 1_000_000).toFixed(1)}M` : `${Math.round(wc / 1_000)}K`
          return (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              className="group relative flex flex-col items-center overflow-hidden rounded-xl bg-white/[0.02] transition-all duration-300 hover:bg-white/[0.05]"
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(ellipse at 50% 30%, ${color}25 0%, transparent 70%)`,
                }}
              />
              {/* Cover — top ⅔ */}
              <div className="relative px-4 pt-4">
                <img
                  src={coverUrl}
                  alt={book.title}
                  className="relative rounded object-cover shadow-lg transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl"
                  style={{ width: 200, height: 300 }}
                  loading="lazy"
                />
              </div>
              {/* Word count — hero */}
              <div className="relative z-10 mt-4 w-full px-4 text-center">
                <span
                  className="block text-4xl font-bold tracking-tight text-white transition-all duration-300 group-hover:scale-110"
                  style={{ textShadow: `0 0 30px ${color}60` }}
                >
                  {badge}
                </span>
              </div>
              {/* Title — secondary */}
              <div className="relative z-10 mb-4 w-full px-4 text-center">
                <span className="block truncate text-sm text-gray-400 transition-all duration-300 group-hover:text-gray-200">
                  {book.title}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function StatsPage() {
  useSEOMeta({
    title: 'Stats — Cosmere Archive',
    description: 'Statistics and data visualizations about the Cosmere universe',
  })

  const bookCountBySaga = useMemo(() => {
    const map = new Map<string, number>()
    const sagaOrder = new Map(SAGA_LIST.map((s, i) => [s.id, i]))
    for (const saga of SAGA_LIST) map.set(saga.id, 0)
    for (const book of BOOKS) map.set(book.saga, (map.get(book.saga) ?? 0) + 1)
    return Array.from(map.entries())
      .filter(([, c]) => c > 0)
      .sort(([a], [b]) => (sagaOrder.get(a) ?? 0) - (sagaOrder.get(b) ?? 0))
  }, [])

  const charCountByPlanet = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of ALL_CHARACTERS) map.set(c.planet, (map.get(c.planet) ?? 0) + 1)
    const pnames = new Map(PLANETS.map((p) => [p.id, p.name]))
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([id, count]) => ({ name: pnames.get(id) ?? id, count, id }))
  }, [])

  const booksByWordCount = useMemo(() => {
    return [...BOOKS].filter((b) => b.wordCount).sort((a, b) => (b.wordCount ?? 0) - (a.wordCount ?? 0))
  }, [])

  const totalWords = useMemo(() => BOOKS.reduce((sum, b) => sum + (b.wordCount ?? 0), 0), [])

  const pubYears = useMemo(() => [...new Set(BOOKS.map((b) => b.year).filter((y): y is number => !!y))].sort(), [])
  const pubMin = pubYears[0] ?? 2005
  const pubMax = pubYears[pubYears.length - 1] ?? 2024
  void pubMin
  void pubMax

  const statCards = useMemo(
    () => [
      { label: 'Books', value: BOOKS.length, color: '#a78bfa' },
      { label: 'Characters', value: ALL_CHARACTERS.length, color: '#06b6d4' },
      { label: 'Planets', value: PLANETS.length, color: '#22c55e' },
      { label: 'Shards', value: SHARD_COUNT, color: '#f59e0b' },
      { label: 'Sagas', value: SAGA_LIST.length, color: '#ef4444' },
      { label: 'Timeline Events', value: TIMELINE_EVENTS.length, color: '#14b8a6' },
      { label: 'Heralds', value: HERALDS.length, color: '#f97316' },
    ],
    [],
  )

  const maxSagaCount = Math.max(...bookCountBySaga.map(([, c]) => c), 1)

  const [activeStep, setActiveStep] = useState(0)
  const [animDir, setAnimDir] = useState<'left' | 'right'>('left')
  const totalSteps = 7
  const stepLabels = [
    'Overview',
    'Books by Saga',
    'Characters by Planet',
    'Word Count',
    'Publication Timeline',
    'Shards',
    'The Heralds',
  ]

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-4 border-b border-white/5 px-4 py-2 sm:px-6 sm:py-3">
        <BackToMapButton />
        <h1 className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-lg font-bold text-transparent sm:text-xl">
          Cosmere in Numbers
        </h1>
        <span className="ml-auto text-xs text-gray-500 sm:text-sm">
          {activeStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Stat cards row */}
      <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-white/5 px-4 py-2 sm:px-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-1.5 backdrop-blur-sm"
          >
            <span className="text-sm font-bold sm:text-base" style={{ color: card.color }}>
              <AnimatedCounter end={card.value} />
            </span>
            <span className="text-xs text-gray-500">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-white/5 px-4 py-2 sm:px-6">
        <button
          onClick={() => {
            setAnimDir('right')
            setActiveStep((s) => Math.max(s - 1, 0))
          }}
          disabled={activeStep === 0}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
        >
          ‹
        </button>
        {stepLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => {
              setAnimDir(i > activeStep ? 'left' : 'right')
              setActiveStep(i)
            }}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 sm:text-sm ${
              i === activeStep
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white ring-1 ring-cyan-500/30'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => {
            setAnimDir('left')
            setActiveStep((s) => Math.min(s + 1, totalSteps - 1))
          }}
          disabled={activeStep === totalSteps - 1}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
        >
          ›
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 p-4 sm:p-6">
        <div
          key={activeStep}
          className={`h-full w-full ${animDir === 'left' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
        >
          {/* Step 0: Overview — 2x */}
          {activeStep === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-8">
              <h2 className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-5xl font-bold text-transparent sm:text-7xl">
                Cosmere in Numbers
              </h2>
              <p className="text-lg text-gray-500 sm:text-2xl">
                {BOOKS.length} books · {ALL_CHARACTERS.length} characters · {SHARD_COUNT} shards · One universe
              </p>
              <div className="grid w-full max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
                {statCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl border border-white/5 bg-white/[0.03] p-10 text-center backdrop-blur-sm sm:p-12"
                  >
                    <div className="text-5xl font-bold sm:text-7xl" style={{ color: card.color }}>
                      <AnimatedCounter end={card.value} />
                    </div>
                    <div className="mt-3 text-lg text-gray-500 sm:text-xl">{card.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Books by Saga */}
          {activeStep === 1 && (
            <div className="flex h-full flex-col items-center justify-center px-4 sm:px-12">
              <h2 className="mb-6 bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent sm:mb-8 sm:text-3xl">
                Books by Saga
              </h2>
              <div className="w-full max-w-4xl space-y-6 sm:space-y-8">
                {bookCountBySaga.map(([sagaId, count]) => {
                  const saga = SAGA_LIST.find((s) => s.id === sagaId)
                  const pct = (count / maxSagaCount) * 100
                  const barColor = SAGA_NAME_COLORS[sagaId as keyof typeof SAGA_NAME_COLORS] ?? '#a78bfa'
                  return (
                    <div key={sagaId}>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-lg font-medium text-gray-200 sm:text-2xl">{saga?.name ?? sagaId}</span>
                        <span className="text-base text-gray-500 sm:text-lg">
                          {count} book{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="h-8 overflow-hidden rounded-full bg-gray-800 sm:h-12">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}88)` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Characters by Planet */}
          {activeStep === 2 && (
            <div className="flex h-full flex-col items-center justify-center">
              <h2 className="mb-6 bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent sm:mb-8 sm:text-3xl">
                Characters by Planet
              </h2>
              <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-16">
                <svg
                  viewBox="0 0 400 400"
                  className="h-[35vh] w-[35vh] max-h-[420px] max-w-[420px] sm:h-[50vh] sm:w-[50vh]"
                >
                  {(() => {
                    const total = charCountByPlanet.reduce((s, c) => s + c.count, 0)
                    let angle = -90
                    const r = 180
                    const cx = 200
                    const cy = 200
                    const segments: { name: string; count: number; start: number; end: number; color: string }[] = []
                    for (const item of charCountByPlanet) {
                      const pct = item.count / total
                      const deg = pct * 360
                      const planet = PLANETS.find((p) => p.id === item.id)
                      const color = planet?.color ?? '#6b7280'
                      segments.push({ name: item.name, count: item.count, start: angle, end: angle + deg, color })
                      angle += deg
                    }
                    return segments.map((seg, i) => {
                      const sr = ((seg.start - 90) * Math.PI) / 180
                      const er = ((seg.end - 90) * Math.PI) / 180
                      const x1 = cx + r * Math.cos(sr)
                      const y1 = cy + r * Math.sin(sr)
                      const x2 = cx + r * Math.cos(er)
                      const y2 = cy + r * Math.sin(er)
                      const large = seg.end - seg.start > 180 ? 1 : 0
                      return (
                        <path
                          key={i}
                          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
                          fill={seg.color}
                          opacity={0.7}
                          style={{ '--seg-color': seg.color } as React.CSSProperties}
                          className="transition-all duration-300 hover:cursor-pointer hover:opacity-100"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.filter = `drop-shadow(0 0 10px ${seg.color}) drop-shadow(0 0 20px ${seg.color})`
                            e.currentTarget.style.opacity = '1'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.filter = 'none'
                            e.currentTarget.style.opacity = '0.7'
                          }}
                        >
                          <title>{`${seg.name}: ${seg.count}`}</title>
                        </path>
                      )
                    })
                  })()}
                  <circle cx={200} cy={200} r={90} fill="#030712" />
                  <text x={200} y={190} textAnchor="middle" fill="#9ca3af" fontSize="30" fontWeight="bold">
                    {ALL_CHARACTERS.length}
                  </text>
                  <text x={200} y={220} textAnchor="middle" fill="#6b7280" fontSize="18">
                    characters
                  </text>
                </svg>
                <div className="flex flex-col gap-3">
                  {charCountByPlanet.map((item) => {
                    const planet = PLANETS.find((p) => p.id === item.id)
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <span
                          className="inline-block h-4 w-4 shrink-0 rounded-full"
                          style={{ backgroundColor: planet?.color ?? '#6b7280' }}
                        />
                        <span className="text-base text-gray-300 sm:text-lg">{item.name}</span>
                        <span className="ml-4 text-sm text-gray-500 sm:text-base">{item.count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          {/* Step 3: Word Count — Grid with horizontal ranking bars */}
          {activeStep === 3 && (
            <div className="flex h-full w-full flex-col">
              <div className="flex shrink-0 items-center justify-between px-1 pb-2 sm:px-2">
                <h2 className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                  Word Count by Book
                </h2>
                <span className="text-xs text-gray-500 sm:text-sm">
                  {totalWords.toLocaleString()} total · Avg{' '}
                  {Math.round(totalWords / booksByWordCount.length).toLocaleString()}
                </span>
              </div>
              <WordCountGrid books={booksByWordCount} colorMap={SAGA_NAME_COLORS} />
            </div>
          )}

          {/* Step 4: Publication Timeline — Vertical */}
          {activeStep === 4 && (
            <div className="flex h-full w-full flex-col">
              <div className="flex shrink-0 items-center justify-between px-2 pb-2 sm:px-4">
                <h2 className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                  Publication Timeline
                </h2>
                <span className="text-xs text-gray-500 sm:text-sm">
                  {pubMin}–{pubMax} · {pubYears.length} release years
                </span>
              </div>
              <div className="relative flex-1 min-h-0 overflow-y-auto px-4 sm:px-8">
                <div className="relative py-6">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-800 sm:left-12" />
                  {pubYears.map((year) => {
                    const yearBooks = BOOKS.filter((b) => b.year === year)
                    const first = yearBooks[0]
                    if (!first) return null
                    const color = SAGA_NAME_COLORS[first.saga as keyof typeof SAGA_NAME_COLORS] ?? '#a78bfa'
                    return (
                      <div key={year} className="group relative mb-6 flex items-start gap-4 sm:gap-6">
                        <div className="z-10 flex shrink-0 items-center justify-center">
                          <div
                            className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-950 sm:h-6 sm:w-6"
                            style={{ backgroundColor: color }}
                          />
                        </div>
                        <div className="z-10 mt-[-2px] shrink-0">
                          <span className="text-xl font-bold text-gray-200 sm:text-3xl">{year}</span>
                        </div>
                        <div className="z-10 flex flex-wrap gap-2 pt-1 sm:gap-3">
                          {yearBooks.map((b) => {
                            const bc = SAGA_NAME_COLORS[b.saga as keyof typeof SAGA_NAME_COLORS] ?? '#a78bfa'
                            return (
                              <Link
                                key={b.id}
                                to={`/book/${b.id}`}
                                className="inline-block rounded-lg border px-3 py-1.5 text-sm text-gray-400 transition-all duration-300 hover:border-white/20 hover:text-white sm:px-4 sm:py-2 sm:text-base"
                                style={{
                                  borderColor: `${bc}33`,
                                  backgroundColor: `${bc}08`,
                                  boxShadow: `0 0 12px ${bc}11`,
                                }}
                              >
                                {b.title}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Shards Across the Cosmere */}
          {activeStep === 5 && (
            <div className="flex h-full w-full flex-col">
              <div className="flex shrink-0 items-center justify-between px-2 pb-2 sm:px-4">
                <h2 className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                  Shards Across the Cosmere
                </h2>
                <span className="text-xs text-gray-500 sm:text-sm">
                  {SHARD_COUNT} shards · {PLANETS.filter((p) => p.shard).length} planets
                </span>
              </div>
              <div className="relative flex-1 min-h-0 overflow-x-auto px-4 sm:px-8">
                <div className="inline-block min-w-full py-4">
                  {/* Header row */}
                  <div
                    className="mb-4 grid items-center gap-4"
                    style={{ gridTemplateColumns: `180px repeat(${SHARD_NAMES.length}, 64px)` }}
                  >
                    <div />
                    {SHARD_NAMES.map((s) => (
                      <div key={s} className="text-center text-base font-semibold text-gray-400" title={s}>
                        {s.length > 6 ? s.slice(0, 5) : s}
                      </div>
                    ))}
                  </div>
                  {/* Planet rows */}
                  {PLANETS.filter((p) => p.shard).map((planet) => {
                    const pShards = planet.shard!.split(/[,&]|\s+and\s+/).map((s) => s.trim())
                    return (
                      <div
                        key={planet.id}
                        className="mb-5 grid items-center gap-4"
                        style={{ gridTemplateColumns: `180px repeat(${SHARD_NAMES.length}, 64px)` }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="inline-block h-5 w-5 shrink-0 rounded-full"
                            style={{ backgroundColor: planet.color }}
                          />
                          <span className="text-xl font-medium text-gray-200">{planet.name}</span>
                        </div>
                        {SHARD_NAMES.map((s) => {
                          const present = pShards.includes(s)
                          return (
                            <div key={s} className="flex justify-center">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all sm:h-12 sm:w-12 ${present ? 'shadow-lg' : 'opacity-8'}`}
                                style={{
                                  backgroundColor: present ? (SHARD_COLORS[s] ?? '#6366f1') : '#1f2937',
                                  boxShadow: present
                                    ? `0 0 20px ${SHARD_COLORS[s] ?? '#6366f1'}44, 0 0 60px ${SHARD_COLORS[s] ?? '#6366f1'}22`
                                    : 'none',
                                }}
                              >
                                {present && <span className="text-lg font-bold text-gray-950 sm:text-xl">✦</span>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: The Heralds */}
          {activeStep === 6 && (
            <div className="flex h-full flex-col items-center justify-center px-4">
              <h2 className="mb-6 bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent sm:mb-8 sm:text-3xl">
                The Heralds
              </h2>
              <div className="grid w-full max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {HERALDS.map((herald) => (
                  <div
                    key={herald.id}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-white/20"
                  >
                    <div
                      className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-gray-950 sm:h-24 sm:w-24 sm:text-3xl"
                      style={{ backgroundColor: herald.color }}
                    >
                      {herald.name[0]}
                    </div>
                    <div className="text-lg font-medium text-gray-200 sm:text-xl">{herald.name}</div>
                    <div className="mt-2 text-sm text-gray-500 sm:text-base">{herald.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
