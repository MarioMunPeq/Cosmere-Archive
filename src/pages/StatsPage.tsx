import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import BackToMapButton from '@/components/ui/BackToMapButton'
import { BOOKS, PLANETS, SAGAS, ALL_CHARACTERS, SHARD_COLORS, SAGA_NAME_COLORS } from '@/data/static'
import { MAGIC_SYSTEMS, MAGIC_SYSTEM_CATEGORIES } from '@/data/static/magic-systems'
import { TIMELINE_EVENTS, ERAS } from '@/data/static/timeline'
import { HERALDS } from '@/data/static/heralds'
import { useSEOMeta } from '@/hooks/useSEOMeta'

const SHARD_COUNT = Object.keys(SHARD_COLORS).length
const SHARD_NAMES = Object.keys(SHARD_COLORS)
const SAGA_LIST = (SAGAS as { id: string; name: string; color: string; order: number; description?: string }[]).filter(
  (s) => s.id !== 'pre-cosmere',
)

function useOnScreen(ref: React.RefObject<Element | null>) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref])
  return visible
}

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

function SectionWrap({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useOnScreen(ref)
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
        {children}
      </h2>
      {subtitle && <p className="mt-1 text-gray-400 text-base">{subtitle}</p>}
    </div>
  )
}

function Divider() {
  return (
    <div className="mx-auto mt-24 mb-8 h-px max-w-lg bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
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

  const maxWords = useMemo(() => Math.max(...booksByWordCount.map((b) => b.wordCount ?? 0), 1), [booksByWordCount])

  const magicByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const ms of MAGIC_SYSTEMS) map.set(ms.category, (map.get(ms.category) ?? 0) + 1)
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([cat, count]) => ({ cat, count, name: MAGIC_SYSTEM_CATEGORIES.find((c) => c.id === cat)?.name ?? cat }))
  }, [])

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

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gray-950">
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6">
        <BackToMapButton className="mb-6" />

        {/* 1. Hero */}
        <SectionWrap>
          <div className="text-center">
            <h1 className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
              Cosmere in Numbers
            </h1>
            <p className="mt-3 text-lg text-gray-500">
              {BOOKS.length} books &middot; {ALL_CHARACTERS.length} characters &middot; {SHARD_COUNT} shards &middot;
              One universe
            </p>
          </div>
        </SectionWrap>

        {/* 2. Stat Cards */}
        <SectionWrap className="mt-12">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-cyan-500/5"
              >
                <div className="text-3xl font-bold" style={{ color: card.color }}>
                  <AnimatedCounter end={card.value} />
                </div>
                <div className="mt-1 text-base text-gray-500">{card.label}</div>
              </div>
            ))}
          </div>
        </SectionWrap>

        <Divider />

        {/* 3. Books by Saga */}
        <SectionWrap className="mt-10">
          <SectionTitle subtitle={`${BOOKS.length} books across ${bookCountBySaga.length} sagas`}>
            Books by Saga
          </SectionTitle>
          <div className="mx-auto max-w-2xl space-y-5">
            {bookCountBySaga.map(([sagaId, count]) => {
              const saga = SAGA_LIST.find((s) => s.id === sagaId)
              const pct = (count / maxSagaCount) * 100
              const barColor = SAGA_NAME_COLORS[sagaId as keyof typeof SAGA_NAME_COLORS] ?? '#a78bfa'
              return (
                <div key={sagaId}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-base font-medium text-gray-200">{saga?.name ?? sagaId}</span>
                    <span className="text-sm text-gray-500">
                      {count} book{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}88)` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </SectionWrap>

        <Divider />

        {/* 4. Characters by Planet */}
        <SectionWrap className="mt-10">
          <SectionTitle subtitle={`${ALL_CHARACTERS.length} characters across ${charCountByPlanet.length} worlds`}>
            Characters by Planet
          </SectionTitle>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 sm:flex-row sm:items-start">
            <svg viewBox="0 0 280 280" className="h-72 w-72 shrink-0">
              {(() => {
                const total = charCountByPlanet.reduce((s, c) => s + c.count, 0)
                let angle = -90
                const r = 120
                const cx = 140
                const cy = 140
                const segments: {
                  name: string
                  count: number
                  planetId: string
                  start: number
                  end: number
                  color: string
                }[] = []
                for (const item of charCountByPlanet) {
                  const pct = item.count / total
                  const deg = pct * 360
                  const planet = PLANETS.find((p) => p.id === item.id)
                  const color = planet?.color ?? '#6b7280'
                  segments.push({ ...item, planetId: item.id, start: angle, end: angle + deg, color })
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
                      className="transition-opacity hover:opacity-100"
                    >
                      <title>{`${seg.name}: ${seg.count}`}</title>
                    </path>
                  )
                })
              })()}
              <circle cx={140} cy={140} r={60} fill="#030712" />
              <text x={140} y={134} textAnchor="middle" fill="#9ca3af" fontSize="20" fontWeight="bold">
                {ALL_CHARACTERS.length}
              </text>
              <text x={140} y={155} textAnchor="middle" fill="#6b7280" fontSize="14">
                characters
              </text>
            </svg>
            <div className="flex shrink-0 flex-col gap-2 pt-2">
              {charCountByPlanet.map((item) => {
                const planet = PLANETS.find((p) => p.id === item.id)
                return (
                  <div key={item.id} className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: planet?.color ?? '#6b7280' }}
                    />
                    <span className="text-base text-gray-300">{item.name}</span>
                    <span className="ml-auto text-sm text-gray-500">{item.count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </SectionWrap>

        <Divider />

        {/* 5. Word Count — Cover Mountain Range */}
        <SectionWrap className="mt-10">
          <SectionTitle
            subtitle={`${totalWords.toLocaleString()} total words · ${booksByWordCount.length} books · Avg ${Math.round(totalWords / booksByWordCount.length).toLocaleString()} per book`}
          >
            Word Count by Book
          </SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {(() => {
              const minWc = Math.min(...booksByWordCount.map((b) => b.wordCount ?? 0))
              const range = maxWords - minWc || 1
              return booksByWordCount.map((book) => {
                const wc = book.wordCount ?? 0
                const pct = (wc - minWc) / range
                const hiddenPct = 8 + (1 - pct) * 75
                const color = SAGA_NAME_COLORS[book.saga as keyof typeof SAGA_NAME_COLORS] ?? '#a78bfa'
                const badge = wc >= 1000000 ? `${(wc / 1000000).toFixed(1)}M` : `${Math.round(wc / 1000)}K`
                const coverUrl = `${import.meta.env.BASE_URL}${book.cover}`
                return (
                  <Link
                    key={book.id}
                    to={`/book/${book.id}`}
                    className="group relative overflow-hidden rounded-xl bg-gray-800 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10"
                  >
                    <div className="relative aspect-[2/3]">
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, ${color}33, #030712)` }}
                      />
                      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                        <img
                          src={coverUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display = 'none'
                          }}
                          loading="lazy"
                        />
                        <img
                          src={coverUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{
                            filter: 'grayscale(100%) brightness(0.15) contrast(0.5)',
                            clipPath: `inset(0 0 ${100 - hiddenPct}% 0)`,
                          }}
                        />
                      </div>
                      <div
                        className="absolute left-0 right-0 top-0 z-20 overflow-hidden"
                        style={{ height: `${Math.max(hiddenPct, 18)}%` }}
                      >
                        <div className="flex flex-col items-center px-1 pt-2">
                          <span className="text-lg font-extrabold leading-tight text-white drop-shadow-xl sm:text-xl md:text-2xl">
                            {badge}
                          </span>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 z-10 pb-2 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="text-[11px] font-medium text-gray-400 drop-shadow-lg">{book.title}</span>
                      </div>
                    </div>
                  </Link>
                )
              })
            })()}
          </div>
        </SectionWrap>

        <Divider />

        {/* 6. Publication Timeline */}
        <SectionWrap className="mt-10">
          <SectionTitle subtitle={`From ${pubMin} to ${pubMax} — ${pubYears.length} release years`}>
            Publication Timeline
          </SectionTitle>
          <div className="mx-auto max-w-4xl">
            <svg viewBox="0 0 900 200" className="w-full">
              <line x1={30} y1={100} x2={870} y2={100} stroke="#374151" strokeWidth={3} />
              {pubYears.map((year) => {
                const yearBooks = BOOKS.filter((b) => b.year === year)
                const x = 30 + ((year - pubMin) / pubSpan) * 840
                const first = yearBooks[0]
                if (!first) return null
                const color = SAGA_NAME_COLORS[first.saga as keyof typeof SAGA_NAME_COLORS] ?? '#a78bfa'
                return (
                  <g key={year}>
                    <line x1={x} y1={85} x2={x} y2={115} stroke={color} strokeWidth={3} opacity={0.6} />
                    <circle cx={x} cy={100} r={7} fill={color}>
                      <title>{yearBooks.map((b) => b.title).join(', ')}</title>
                    </circle>
                    <text x={x} y={138} textAnchor="middle" fill="#9ca3af" fontSize="14">
                      {year}
                    </text>
                    {yearBooks.map((b, bi) => {
                      const yo = yearBooks.length > 1 ? 158 + bi * 18 : 158
                      return (
                        <text key={b.id} x={x} y={yo} textAnchor="middle" fill="#6b7280" fontSize="11">
                          {b.title.length > 20 ? b.title.slice(0, 19) + '…' : b.title}
                        </text>
                      )
                    })}
                  </g>
                )
              })}
            </svg>
          </div>
        </SectionWrap>

        <Divider />

        {/* 7. Shards Across the Cosmere */}
        <SectionWrap className="mt-10">
          <SectionTitle subtitle={`${SHARD_COUNT} shards manifest across the Cosmere`}>
            Shards Across the Cosmere
          </SectionTitle>
          <div className="overflow-x-auto">
            <div className="mx-auto" style={{ minWidth: 640 }}>
              <div
                className="mb-3 grid items-center"
                style={{ gridTemplateColumns: `140px repeat(${SHARD_NAMES.length}, 1fr)` }}
              >
                <div />
                {SHARD_NAMES.map((s) => (
                  <div key={s} className="text-center text-xs font-medium text-gray-500" title={s}>
                    {s.length > 8 ? s.slice(0, 7) + '…' : s}
                  </div>
                ))}
              </div>
              {PLANETS.filter((p) => p.shard).map((planet) => {
                const pShards = planet.shard!.split(/[,&]|\s+and\s+/).map((s) => s.trim())
                return (
                  <div
                    key={planet.id}
                    className="mb-2 grid items-center"
                    style={{ gridTemplateColumns: `140px repeat(${SHARD_NAMES.length}, 1fr)` }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: planet.color }}
                      />
                      <span className="text-base text-gray-300">{planet.name}</span>
                    </div>
                    {SHARD_NAMES.map((s) => {
                      const present = pShards.includes(s)
                      return (
                        <div key={s} className="flex justify-center">
                          <span
                            className={`inline-block h-6 w-6 rounded-sm transition-all ${present ? 'shadow-sm' : 'opacity-10'}`}
                            style={{ backgroundColor: present ? (SHARD_COLORS[s] ?? '#6366f1') : '#1f2937' }}
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </SectionWrap>

        <Divider />

        {/* 8. Magic Systems by Category */}
        <SectionWrap className="mt-10">
          <SectionTitle subtitle={`${MAGIC_SYSTEMS.length} magic systems in ${magicByCategory.length} categories`}>
            Magic Systems by Category
          </SectionTitle>
          <div className="mx-auto max-w-2xl space-y-5">
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
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-base text-gray-300">{item.name}</span>
                    <span className="text-sm text-gray-500">{item.count}</span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-gray-800">
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
        </SectionWrap>

        <Divider />

        {/* 9. Timeline Event Density */}
        <SectionWrap className="mt-10">
          <SectionTitle subtitle={`${TIMELINE_EVENTS.length} events across ${ERAS.length} cosmic eras`}>
            Timeline Event Density
          </SectionTitle>
          <div className="mx-auto max-w-4xl">
            <svg viewBox="0 0 900 260" className="w-full">
              {(() => {
                const barHeight = 180
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
                    <line x1={30} y1={barHeight + 30} x2={870} y2={barHeight + 30} stroke="#374151" strokeWidth={2} />
                    {erasLayout
                      .filter((e) => e.w > 50)
                      .map((era) => (
                        <text
                          key={era.id}
                          x={era.x + era.w / 2}
                          y={barHeight + 52}
                          textAnchor="middle"
                          fill="#6b7280"
                          fontSize="11"
                        >
                          {era.name.length > 16 ? era.name.slice(0, 15) + '…' : era.name}
                        </text>
                      ))}
                  </>
                )
              })()}
            </svg>
          </div>
        </SectionWrap>

        <Divider />

        {/* 10. The Heralds */}
        <SectionWrap className="mt-10">
          <SectionTitle subtitle={`${HERALDS.length} Heralds of the Almighty`}>The Heralds</SectionTitle>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {HERALDS.map((herald) => (
              <div
                key={herald.id}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-5 text-center backdrop-blur-sm transition-all duration-300 hover:border-white/20"
              >
                <div
                  className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-gray-950"
                  style={{ backgroundColor: herald.color }}
                >
                  {herald.name[0]}
                </div>
                <div className="text-base font-medium text-gray-200">{herald.name}</div>
                <div className="mt-1 text-sm text-gray-500">{herald.title}</div>
              </div>
            ))}
          </div>
        </SectionWrap>

        {/* Footer */}
        <p className="mt-24 text-center text-xs text-gray-800">
          Cosmere Archive &mdash; Data compiled from the works of Brandon Sanderson
        </p>
      </div>
    </div>
  )
}
