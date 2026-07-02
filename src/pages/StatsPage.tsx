import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import BackToMapButton from '@/components/ui/BackToMapButton'
import { BOOKS, PLANETS, SAGAS, ALL_CHARACTERS, SHARD_COLORS, SAGA_NAME_COLORS } from '@/data/static'
import { TIMELINE_EVENTS, ERAS } from '@/data/static/timeline'
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

  const maxWords = useMemo(() => Math.max(...booksByWordCount.map((b) => b.wordCount ?? 0), 1), [booksByWordCount])

  const totalWords = useMemo(() => BOOKS.reduce((sum, b) => sum + (b.wordCount ?? 0), 0), [])

  const eventCountByEra = useMemo(() => {
    return ERAS.map((era) => {
      const count = TIMELINE_EVENTS.filter((e) => e.year >= era.startYear && e.year <= era.endYear).length
      return { ...era, count }
    })
  }, [])

  const maxEvents = useMemo(() => Math.max(...eventCountByEra.map((e) => e.count), 1), [eventCountByEra])

  const erasLayout = useMemo(() => {
    const totalSpan = (ERAS[ERAS.length - 1]?.endYear ?? 2000) - (ERAS[0]?.startYear ?? -20000)
    const result: {
      id: string
      name: string
      w: number
      x: number
      color: string
      startYear: number
      endYear: number
    }[] = []
    let x = 30
    for (const era of ERAS) {
      const span = era.endYear - era.startYear
      const w = (span / totalSpan) * 840
      result.push({
        id: era.id,
        name: era.name,
        w,
        x,
        color: era.color,
        startYear: era.startYear,
        endYear: era.endYear,
      })
      x += w
    }
    return result
  }, [])

  const pubYears = useMemo(() => [...new Set(BOOKS.map((b) => b.year).filter((y): y is number => !!y))].sort(), [])
  const pubMin = pubYears[0] ?? 2005
  const pubMax = pubYears[pubYears.length - 1] ?? 2024
  const pubSpan = pubMax - pubMin || 1

  const statCards = useMemo(
    () => [
      { label: 'Books', value: BOOKS.length, color: '#a78bfa' },
      { label: 'Characters', value: ALL_CHARACTERS.length, color: '#06b6d4' },
      { label: 'Planets', value: PLANETS.length, color: '#22c55e' },
      { label: 'Shards', value: SHARD_COUNT, color: '#f59e0b' },
      { label: 'Sagas', value: SAGA_LIST.length, color: '#ef4444' },
      { label: 'Magic Systems', value: MAGIC_SYSTEMS.length, color: '#d946ef' },
      { label: 'Timeline Events', value: TIMELINE_EVENTS.length, color: '#14b8a6' },
      { label: 'Heralds', value: HERALDS.length, color: '#f97316' },
    ],
    [],
  )

  const maxSagaCount = Math.max(...bookCountBySaga.map(([, c]) => c), 1)
  const maxMagicCount = Math.max(...magicByCategory.map((m) => m.count), 1)

  const [activeStep, setActiveStep] = useState(0)
  const totalSteps = 9
  const stepLabels = [
    'Overview',
    'Books by Saga',
    'Characters by Planet',
    'Word Count',
    'Publication Timeline',
    'Shards',
    'Magic Systems',
    'Event Density',
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
          onClick={() => setActiveStep((s) => Math.max(s - 1, 0))}
          disabled={activeStep === 0}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
        >
          ‹
        </button>
        {stepLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
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
          onClick={() => setActiveStep((s) => Math.min(s + 1, totalSteps - 1))}
          disabled={activeStep === totalSteps - 1}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
        >
          ›
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 p-4 sm:p-6">
        <div key={activeStep} className="h-full w-full animate-fade-in-up">
          {/* Step 0: Overview */}
          {activeStep === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-6">
              <h2 className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent sm:text-5xl">
                Cosmere in Numbers
              </h2>
              <p className="text-base text-gray-500 sm:text-lg">
                {BOOKS.length} books · {ALL_CHARACTERS.length} characters · {SHARD_COUNT} shards · One universe
              </p>
              <div className="grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
                {statCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl border border-white/5 bg-white/[0.03] p-6 text-center backdrop-blur-sm sm:p-8"
                  >
                    <div className="text-3xl font-bold sm:text-5xl" style={{ color: card.color }}>
                      <AnimatedCounter end={card.value} />
                    </div>
                    <div className="mt-2 text-sm text-gray-500 sm:text-base">{card.label}</div>
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

          {/* Step 3: Word Count — Cosmic Bar Chart */}
          {activeStep === 3 && (
            <div className="flex h-full w-full flex-col">
              <style>{`
                @keyframes wc-pulse {
                  0%, 100% { text-shadow: 0 0 4px rgba(255,255,255,0.2), 0 0 12px rgba(6,182,212,0.1); }
                  50% { text-shadow: 0 0 12px rgba(255,255,255,0.7), 0 0 24px rgba(6,182,212,0.4), 0 0 40px rgba(6,182,212,0.2); }
                }
                .wc-pulse { animation: wc-pulse 3s ease-in-out infinite; }
              `}</style>
              <div className="flex shrink-0 items-center justify-between px-2 pb-2 sm:px-4">
                <h2 className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                  Word Count by Book
                </h2>
                <span className="text-xs text-gray-500 sm:text-sm">
                  {totalWords.toLocaleString()} total · Avg{' '}
                  {Math.round(totalWords / booksByWordCount.length).toLocaleString()}
                </span>
              </div>
              <div className="relative flex-1 min-h-0 overflow-hidden rounded-xl">
                {/* Subtle star field background */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(6,182,212,0.5) 1px, transparent 0)',
                    backgroundSize: '20px 20px',
                  }}
                />
                <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-gray-950 to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-gray-950 to-transparent" />
                {/* Bars */}
                <div className="relative z-[5] h-full overflow-x-auto pb-4">
                  <div
                    className="flex h-full items-end gap-3 px-8"
                    style={{ minWidth: `${booksByWordCount.length * 136}px` }}
                  >
                    {booksByWordCount.map((book) => {
                      const wc = book.wordCount ?? 0
                      const sqrtWc = Math.sqrt(wc)
                      const sqrtMax = Math.sqrt(maxWords)
                      const pct = sqrtWc / sqrtMax
                      const barH = `${Math.max(14, Math.round(pct * 84))}%`
                      const color = SAGA_NAME_COLORS[book.saga as keyof typeof SAGA_NAME_COLORS] ?? '#a78bfa'
                      const badge = wc >= 1000000 ? `${(wc / 1000000).toFixed(1)}M` : `${Math.round(wc / 1000)}K`
                      const coverUrl = `${import.meta.env.BASE_URL}${book.cover}`
                      return (
                        <Link
                          key={book.id}
                          to={`/book/${book.id}`}
                          className="group flex shrink-0 flex-col items-center justify-end transition-all duration-500 hover:-translate-y-2"
                          style={{ width: '130px' }}
                        >
                          {/* Word count label */}
                          <div className="mb-1 text-center">
                            <span className="wc-pulse text-2xl font-extrabold text-white drop-shadow-xl sm:text-4xl">
                              {badge}
                            </span>
                          </div>
                          {/* Cover as capstone at top of bar */}
                          <div
                            className="mb-0.5 overflow-hidden rounded-md bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg shadow-black/50 ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-cyan-500/30"
                            style={{ width: '64px', height: '96px' }}
                          >
                            <img
                              src={coverUrl}
                              alt={book.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          </div>
                          {/* Bar */}
                          <div
                            className="w-14 rounded-t-lg sm:w-20"
                            style={{
                              height: barH,
                              background: `linear-gradient(180deg, ${color} 0%, ${color}dd 25%, ${color}77 55%, ${color}22 85%, transparent 100%)`,
                              boxShadow: `0 -4px 30px ${color}44, 0 0 60px ${color}22`,
                            }}
                          />
                          {/* Glow base */}
                          <div
                            className="h-4 w-20 rounded-full blur-md sm:w-24"
                            style={{ backgroundColor: color, opacity: 0.12 }}
                          />
                          {/* Title on hover */}
                          <div className="mt-1 h-6 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <span className="block max-w-[122px] truncate text-sm font-medium text-gray-400">
                              {book.title}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Publication Timeline */}
          {activeStep === 4 && (
            <div className="flex h-full flex-col items-center justify-center px-4">
              <h2 className="mb-6 bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent sm:mb-8 sm:text-3xl">
                Publication Timeline
              </h2>
              <p className="mb-4 text-sm text-gray-500 sm:text-base">
                From {pubMin} to {pubMax} — {pubYears.length} release years
              </p>
              <div className="w-full max-w-5xl">
                <svg viewBox="0 0 900 360" className="w-full" style={{ maxHeight: '65vh' }}>
                  <line x1={30} y1={160} x2={870} y2={160} stroke="#374151" strokeWidth={4} />
                  {pubYears.map((year, yi) => {
                    const yearBooks = BOOKS.filter((b) => b.year === year)
                    const x = 30 + ((year - pubMin) / pubSpan) * 840
                    const first = yearBooks[0]
                    if (!first) return null
                    const color = SAGA_NAME_COLORS[first.saga as keyof typeof SAGA_NAME_COLORS] ?? '#a78bfa'
                    const isEven = yi % 2 === 0
                    return (
                      <g key={year}>
                        <line x1={x} y1={140} x2={x} y2={180} stroke={color} strokeWidth={4} opacity={0.5} />
                        <circle
                          cx={x}
                          cy={160}
                          r={12}
                          fill={color}
                          stroke="#030712"
                          strokeWidth={3}
                          className="transition-all duration-300 hover:brightness-125"
                        >
                          <title>{yearBooks.map((b) => b.title).join(', ')}</title>
                        </circle>
                        {/* Year labels — alternate above/below every other year */}
                        <text
                          x={x}
                          y={isEven ? 128 : 215}
                          textAnchor="middle"
                          fill="#9ca3af"
                          fontSize="16"
                          fontWeight="bold"
                        >
                          {year}
                        </text>
                        {/* Book labels — same side as year */}
                        {yearBooks.map((b, bi) => {
                          if (isEven) {
                            const yo = 232 + bi * 22
                            return (
                              <text key={b.id} x={x} y={yo} textAnchor="middle" fill="#6b7280" fontSize="14">
                                {b.title.length > 24 ? b.title.slice(0, 23) + '…' : b.title}
                              </text>
                            )
                          } else {
                            const yo = 112 - (yearBooks.length - bi) * 22
                            return (
                              <text key={b.id} x={x} y={yo} textAnchor="middle" fill="#6b7280" fontSize="14">
                                {b.title.length > 24 ? b.title.slice(0, 23) + '…' : b.title}
                              </text>
                            )
                          }
                        })}
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          )}

          {/* Step 5: Shards Across the Cosmere */}
          {activeStep === 5 && (
            <div className="flex h-full flex-col items-center justify-center px-4">
              <h2 className="mb-6 bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent sm:mb-8 sm:text-3xl">
                Shards Across the Cosmere
              </h2>
              <p className="mb-4 text-sm text-gray-500 sm:text-base">
                {SHARD_COUNT} shards manifest across the Cosmere
              </p>
              <div className="w-full max-w-4xl overflow-x-auto">
                <div style={{ minWidth: 700 }}>
                  <div
                    className="mb-4 grid items-center gap-3"
                    style={{ gridTemplateColumns: `160px repeat(${SHARD_NAMES.length}, 1fr)` }}
                  >
                    <div />
                    {SHARD_NAMES.map((s) => (
                      <div key={s} className="text-center text-sm font-medium text-gray-500 sm:text-base" title={s}>
                        {s.length > 10 ? s.slice(0, 9) + '…' : s}
                      </div>
                    ))}
                  </div>
                  {PLANETS.filter((p) => p.shard).map((planet) => {
                    const pShards = planet.shard!.split(/[,&]|\s+and\s+/).map((s) => s.trim())
                    return (
                      <div
                        key={planet.id}
                        className="mb-4 grid items-center gap-3"
                        style={{ gridTemplateColumns: `160px repeat(${SHARD_NAMES.length}, 1fr)` }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="inline-block h-4 w-4 shrink-0 rounded-full"
                            style={{ backgroundColor: planet.color }}
                          />
                          <span className="text-lg text-gray-300 sm:text-xl">{planet.name}</span>
                        </div>
                        {SHARD_NAMES.map((s) => {
                          const present = pShards.includes(s)
                          return (
                            <div key={s} className="flex justify-center">
                              <span
                                className={`inline-block h-8 w-8 rounded-md transition-all sm:h-10 sm:w-10 ${present ? 'shadow-md' : 'opacity-10'}`}
                                style={{
                                  backgroundColor: present ? (SHARD_COLORS[s] ?? '#6366f1') : '#1f2937',
                                }}
                              />
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

          {/* Step 6: Magic Systems by Category */}
          {activeStep === 6 && (
            <div className="flex h-full flex-col items-center justify-center px-4 sm:px-12">
              <h2 className="mb-6 bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent sm:mb-8 sm:text-3xl">
                Magic Systems by Category
              </h2>
              <p className="mb-4 text-sm text-gray-500 sm:text-base">
                {MAGIC_SYSTEMS.length} magic systems in {magicByCategory.length} categories
              </p>
              <div className="w-full max-w-3xl space-y-6 sm:space-y-8">
                {magicByCategory.map((item, i) => {
                  const pct = (item.count / maxMagicCount) * 100
                  const colors = [
                    '#06b6d4',
                    '#a78bfa',
                    '#d946ef',
                    '#f59e0b',
                    '#22c55e',
                    '#f97316',
                    '#ef4444',
                    '#14b8a6',
                    '#3b82f6',
                    '#ec4899',
                  ]
                  return (
                    <div key={item.cat}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-lg text-gray-300 sm:text-xl">{item.name}</span>
                        <span className="text-base text-gray-500 sm:text-lg">{item.count}</span>
                      </div>
                      <div className="h-8 overflow-hidden rounded-full bg-gray-800 sm:h-12">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${colors[i % colors.length]}, ${colors[(i + 2) % colors.length]})`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 7: Timeline Event Density */}
          {activeStep === 7 && (
            <div className="flex h-full flex-col items-center justify-center px-4">
              <h2 className="mb-6 bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent sm:mb-8 sm:text-3xl">
                Timeline Event Density
              </h2>
              <p className="mb-4 text-sm text-gray-500 sm:text-base">
                {TIMELINE_EVENTS.length} events across {ERAS.length} cosmic eras
              </p>
              <div className="w-full max-w-5xl">
                <svg viewBox="0 0 900 360" className="w-full" style={{ maxHeight: '65vh' }}>
                  {(() => {
                    const barHeight = 280
                    return (
                      <>
                        {erasLayout.map((era, i) => {
                          const h = ((eventCountByEra[i]?.count ?? 0) / maxEvents) * barHeight
                          return (
                            <g key={era.id}>
                              <rect
                                x={era.x}
                                y={barHeight + 30 - h}
                                width={Math.max(era.w - 1, 1)}
                                height={Math.max(h, 2)}
                                fill={era.color}
                                opacity={0.6}
                                rx={3}
                                className="transition-opacity hover:opacity-100"
                              >
                                <title>{`${era.name}: ${eventCountByEra[i]?.count ?? 0} events (${era.startYear}–${era.endYear})`}</title>
                              </rect>
                            </g>
                          )
                        })}
                        <line
                          x1={30}
                          y1={barHeight + 30}
                          x2={870}
                          y2={barHeight + 30}
                          stroke="#374151"
                          strokeWidth={2}
                        />
                        {erasLayout
                          .filter((e) => e.w > 50)
                          .map((era) => (
                            <text
                              key={era.id}
                              x={era.x + era.w / 2}
                              y={barHeight + 52}
                              textAnchor="middle"
                              fill="#6b7280"
                              fontSize="12"
                            >
                              {era.name.length > 16 ? era.name.slice(0, 15) + '…' : era.name}
                            </text>
                          ))}
                      </>
                    )
                  })()}
                </svg>
              </div>
            </div>
          )}

          {/* Step 8: The Heralds */}
          {activeStep === 8 && (
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
