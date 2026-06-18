import { useState, useMemo } from 'react'
import { TIMELINE_EVENTS } from '@/data/static/timeline/events'
import { CHARACTER_SPANS, CHARACTER_GROUPS } from '@/data/static/timeline/character-lifespans'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline/worldhopper-journeys'
import { ERAS } from '@/data/static/timeline/eras'
import { PLANETS } from '@/data/static'

const SAGA_ORDER = [
  "pre-cosmere", "elantris", "white-sand", "warbreaker",
  "mistborn-era-1", "mistborn-era-2", "stormlight", "secret-projects",
  "arcanum-unbounded",
]

interface Props {
  onEventSelect?: (eventId: string | null) => void
}

const typeColors: Record<string, string> = {
  book: '#a78bfa', historical: '#f59e0b', cataclysm: '#ef4444',
  discovery: '#22c55e', birth: '#06b6d4', death: '#6b7280',
  arrival: '#22d3ee', departure: '#f472b6',
}

const sagaColors: Record<string, string> = {
  "pre-cosmere": "#6b7280", "elantris": "#14b8a6", "white-sand": "#eab308",
  "warbreaker": "#d946ef", "mistborn-era-1": "#ef4444", "mistborn-era-2": "#f59e0b",
  "stormlight": "#06b6d4", "secret-projects": "#0ea5e9", "arcanum-unbounded": "#8b5cf6",
}

const sagaNames: Record<string, string> = {
  "pre-cosmere": "Pre-Cosmere", "elantris": "Elantris", "white-sand": "Arena Blanca",
  "warbreaker": "Warbreaker", "mistborn-era-1": "Mistborn Era 1", "mistborn-era-2": "Mistborn Era 2",
  "stormlight": "Archivo Tormentas", "secret-projects": "Secret Projects", "arcanum-unbounded": "Arcanum Ilimitado",
}

export default function VerticalTimeline({ onEventSelect }: Props) {
  const [filterSaga, setFilterSaga] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  const filteredEvents = useMemo(() => {
    return TIMELINE_EVENTS
      .filter((e) => filterSaga === "all" || e.saga === filterSaga)
      .filter((e) => filterType === "all" || e.type === filterType)
      .sort((a, b) => a.year - b.year)
  }, [filterSaga, filterType])

  const sagas = useMemo(() => {
    const set = new Set(TIMELINE_EVENTS.map((e) => e.saga))
    return SAGA_ORDER.filter((s) => set.has(s))
  }, [])

  const types = useMemo(() => {
    const set = new Set(TIMELINE_EVENTS.map((e) => e.type))
    return Array.from(set)
  }, [])

  const handleClick = (eventId: string) => {
    const next = selectedEvent === eventId ? null : eventId
    setSelectedEvent(next)
    onEventSelect?.(next)
  }

  const planetName = (id: string) => {
    const p = PLANETS.find((pl) => pl.id === id)
    return p ? p.name : id
  }

  // ── CHARACTER LIFESPANS SECTION ────────────────
  const LIFESPAN_MIN = -2000
  const LIFESPAN_MAX = 1700
  const LIFESPAN_RANGE = LIFESPAN_MAX - LIFESPAN_MIN

  return (
    <div className="space-y-6">
      {/* ── FILTERS ──────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Saga:</label>
          <select
            value={filterSaga}
            onChange={(e) => setFilterSaga(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs text-gray-300"
          >
            <option value="all">Todas</option>
            {sagas.map((s) => (
              <option key={s} value={s}>{sagaNames[s] ?? s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Tipo:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs text-gray-300"
          >
            <option value="all">Todos</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-gray-600">
          {filteredEvents.length} de {TIMELINE_EVENTS.length} eventos
        </span>
      </div>

      {/* ── EVENT LIST ───────────────────────────── */}
      <div className="space-y-0">
        {filteredEvents.map((ev, idx) => {
          const isSel = selectedEvent === ev.id
          const prevYear = idx > 0 ? filteredEvents[idx - 1].year : null
          const showYearMarker = prevYear === null || ev.year !== prevYear

          // Determine era for this event
          const era = ERAS.find((e) => ev.year >= e.startYear && ev.year <= e.endYear)

          return (
            <div key={ev.id} className="group">
              {/* Era header */}
              {showYearMarker && era && (prevYear === null || !ERAS.find((e) => filteredEvents[idx - 1]?.year >= e.startYear && filteredEvents[idx - 1]?.year <= e.endYear) || ERAS.find((e) => filteredEvents[idx - 1]?.year >= e.startYear && filteredEvents[idx - 1]?.year <= e.endYear)?.id !== era.id) && (
                <div
                  className="mt-3 mb-1 rounded px-2 py-1 text-xs font-bold tracking-wider"
                  style={{ backgroundColor: era.color + '30', color: era.color }}
                >
                  {era.name} ({era.startYear < 0 ? `${Math.abs(era.startYear)} AC` : `${era.startYear} DC`} – {era.endYear < 0 ? `${Math.abs(era.endYear)} AC` : `${era.endYear} DC`})
                </div>
              )}

              {/* Event row */}
              <div
                onClick={() => handleClick(ev.id)}
                className={`flex cursor-pointer items-stretch rounded-lg border-l-4 transition-all ${
                  isSel
                    ? 'border-amber-400 bg-gray-800/60'
                    : 'border-transparent hover:border-gray-600 hover:bg-gray-800/30'
                }`}
              >
                {/* Year column */}
                <div className="flex w-20 shrink-0 items-start pt-3 text-right">
                  {showYearMarker ? (
                    <span className="w-full pr-3 text-sm font-bold text-gray-400">
                      {ev.year < 0 ? `${Math.abs(ev.year)} AC` : `${ev.year} DC`}
                    </span>
                  ) : (
                    <span className="w-full pr-3 text-xs text-gray-700">·</span>
                  )}
                </div>

                {/* Event content */}
                <div className="min-w-0 flex-1 border-l border-gray-700/50 py-2.5 pl-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-semibold leading-snug ${isSel ? 'text-amber-300' : 'text-gray-200'}`}>
                      {ev.title}
                    </h3>
                    <span className="shrink-0 text-xs text-gray-600">★{ev.importance}</span>
                  </div>

                  {isSel && (
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      {ev.description}
                    </p>
                  )}

                  {/* Badges row */}
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {/* Type badge */}
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: (typeColors[ev.type] ?? '#6b7280') + '25', color: typeColors[ev.type] ?? '#6b7280' }}
                    >
                      {ev.type}
                    </span>

                    {/* Saga badge */}
                    {ev.saga && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: (sagaColors[ev.saga] ?? '#6b7280') + '25', color: sagaColors[ev.saga] ?? '#6b7280' }}
                      >
                        {sagaNames[ev.saga] ?? ev.saga}
                      </span>
                    )}

                    {/* Planet badges */}
                    {ev.planets.map((pid) => {
                      const p = PLANETS.find((pl) => pl.id === pid)
                      return p ? (
                        <span
                          key={pid}
                          className="rounded px-1.5 py-0.5 text-[10px]"
                          style={{ backgroundColor: p.color + '20', color: p.color }}
                        >
                          {p.name}
                        </span>
                      ) : null
                    })}

                    {/* Character badges */}
                    {ev.characters && ev.characters.length > 0 && (
                      <>
                        {ev.characters.slice(0, 5).map((cid) => {
                          const ch = CHARACTER_SPANS.find((c) => c.id === cid)
                          return ch ? (
                            <span
                              key={cid}
                              className="rounded px-1.5 py-0.5 text-[10px]"
                              style={{ backgroundColor: ch.color + '25', color: ch.color }}
                            >
                              {ch.name}
                            </span>
                          ) : (
                            <span key={cid} className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-500">
                              {cid}
                            </span>
                          )
                        })}
                        {ev.characters.length > 5 && (
                          <span className="text-[10px] text-gray-600">+{ev.characters.length - 5}</span>
                        )}
                      </>
                    )}

                    {/* Worldhopper badges */}
                    {ev.worldhoppers && ev.worldhoppers.length > 0 && (
                      <>
                        {ev.worldhoppers.map((wid) => {
                          const wh = WORLDHOPPER_MOVEMENTS.find((w) => w.id === wid)
                          return wh ? (
                            <span
                              key={wid}
                              className="rounded px-1.5 py-0.5 text-[10px] italic"
                              style={{ backgroundColor: wh.color + '20', color: wh.color }}
                            >
                              {wh.name}
                            </span>
                          ) : null
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── CHARACTER LIFESPANS ──────────────────── */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">
          Líneas de Vida — Personajes
        </h3>

        <div className="space-y-5">
          {CHARACTER_GROUPS.map((group) => {
            const chars = CHARACTER_SPANS.filter((c) => c.group === group.id)
            if (chars.length === 0) return null
            return (
              <div key={group.id}>
                <h4 className="mb-2 text-xs font-semibold" style={{ color: group.color }}>
                  {group.label}
                </h4>
                <div className="relative space-y-1">
                  {/* Year axis */}
                  <div className="relative h-4">
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-700" />
                    {[LIFESPAN_MIN, -1000, 0, 1000, LIFESPAN_MAX].map((y) => {
                      const left = ((y - LIFESPAN_MIN) / LIFESPAN_RANGE) * 100
                      return (
                        <span
                          key={y}
                          className="absolute -bottom-1 -translate-x-1/2 text-[9px] text-gray-600"
                          style={{ left: `${left}%` }}
                        >
                          {y < 0 ? `${Math.abs(y)} AC` : `${y} DC`}
                        </span>
                      )
                    })}
                  </div>

                  {/* Character bars */}
                  {chars.map((ch) => {
                    const birth = ch.birthYear ?? LIFESPAN_MIN
                    const death = ch.deathYear ?? LIFESPAN_MAX
                    const left = Math.max(0, ((birth - LIFESPAN_MIN) / LIFESPAN_RANGE) * 100)
                    const width = Math.min(100 - left, ((death - birth) / LIFESPAN_RANGE) * 100)
                    if (width < 0.5) return null
                    return (
                      <div key={ch.id} className="relative flex h-6 items-center">
                        <span className="w-28 shrink-0 text-right text-[11px] text-gray-400">
                          {ch.name}
                        </span>
                        <div className="relative ml-2 flex-1">
                          <div className="relative h-full w-full">
                            {/* Background track */}
                            <div className="absolute inset-y-0 left-0 right-0 rounded bg-gray-800" />
                            {/* Life bar */}
                            <div
                              className="absolute inset-y-0 rounded transition-all"
                              style={{
                                left: `${left}%`,
                                width: `${Math.max(width, 0.5)}%`,
                                backgroundColor: ch.color + '50',
                                borderLeft: `2px solid ${ch.color}`,
                              }}
                            >
                              <span className="ml-1 text-[9px] font-medium leading-6 text-white/80">
                                {width > 15 ? (ch.deathYear ? `${ch.birthYear ?? '?'}–${ch.deathYear}` : `${ch.birthYear ?? '?'}–`) : ''}
                              </span>
                            </div>
                            {/* Death marker */}
                            {ch.deathYear && (
                              <div
                                className="absolute top-0 h-full w-0.5 bg-red-500/50"
                                style={{ left: `${Math.min(100, ((ch.deathYear - LIFESPAN_MIN) / LIFESPAN_RANGE) * 100)}%` }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── WORLDHOPPER JOURNEYS ─────────────────── */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">
          Viajes de Worldhoppers
        </h3>
        <div className="space-y-3">
          {WORLDHOPPER_MOVEMENTS.map((wh) => (
            <div key={wh.id} className="flex items-start gap-3">
              <span className="w-20 shrink-0 pt-1 text-right text-sm font-bold" style={{ color: wh.color }}>
                {wh.name}
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {wh.movements.map((m, mi) => (
                    <div key={mi} className="flex items-center gap-0">
                      {/* Dot */}
                      <span
                        className="inline-flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: wh.color }}
                        title={`${m.year}: ${m.description}`}
                      />
                      {/* Planet label */}
                      <span className="mx-1 whitespace-nowrap text-[10px] text-gray-500">
                        {planetName(m.planet)}
                      </span>
                      {/* Year */}
                      <span className="text-[9px] text-gray-600">{m.year}</span>
                      {/* Connector */}
                      {mi < wh.movements.length - 1 && (
                        <span className="mx-1 text-gray-700">→</span>
                      )}
                    </div>
                  ))}
                </div>
                {/* Description tooltip on hover for each dot is handled by title attribute */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
