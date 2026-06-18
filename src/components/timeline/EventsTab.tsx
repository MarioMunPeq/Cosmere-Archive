import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { TIMELINE_EVENTS } from '@/data/static/timeline'
import { PLANETS } from '@/data/static'

const SAGA_ORDER = [
  "pre-cosmere", "elantris", "white-sand", "warbreaker",
  "mistborn-era-1", "mistborn-era-2", "stormlight", "secret-projects",
  "arcanum-unbounded",
]

const sagaNames: Record<string, string> = {
  "pre-cosmere": "Pre-Cosmere", "elantris": "Elantris", "white-sand": "Arena Blanca",
  "warbreaker": "Warbreaker", "mistborn-era-1": "Mistborn Era 1", "mistborn-era-2": "Mistborn Era 2",
  "stormlight": "Archivo Tormentas", "secret-projects": "Secret Projects", "arcanum-unbounded": "Arcanum Ilimitado",
}

const sagaColors: Record<string, string> = {
  "pre-cosmere": "#6b7280", "elantris": "#14b8a6", "white-sand": "#eab308",
  "warbreaker": "#d946ef", "mistborn-era-1": "#ef4444", "mistborn-era-2": "#f59e0b",
  "stormlight": "#06b6d4", "secret-projects": "#0ea5e9", "arcanum-unbounded": "#8b5cf6",
}

const typeColors: Record<string, string> = {
  book: '#a78bfa', historical: '#f59e0b', cataclysm: '#ef4444',
  discovery: '#22c55e', birth: '#06b6d4', death: '#6b7280',
  arrival: '#22d3ee', departure: '#f472b6',
}

const MIN_YEAR = -11000
const MAX_YEAR = 1700
const PADDING = 80
const AXIS_Y = 180
const MIN_SPACING = 20
const PX_PER_YEAR = 0.5

interface Props {
  onEventSelect?: (eventId: string | null) => void
}

export default function EventsTab({ onEventSelect }: Props) {
  const [filterSaga, setFilterSaga] = useState("all")
  const [filterPlanet, setFilterPlanet] = useState("all")
  const [bubbleEvent, setBubbleEvent] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const sagas = useMemo(() => {
    const set = new Set(TIMELINE_EVENTS.map((e) => e.saga))
    return SAGA_ORDER.filter((s) => set.has(s))
  }, [])

  const planets = useMemo(() => {
    const set = new Set(TIMELINE_EVENTS.flatMap((e) => e.planets))
    return PLANETS.filter((p) => set.has(p.id))
  }, [])

  const filtered = useMemo(() => {
    return TIMELINE_EVENTS
      .filter((e) => filterSaga === "all" || e.saga === filterSaga)
      .filter((e) => filterPlanet === "all" || e.planets.includes(filterPlanet))
      .sort((a, b) => a.year - b.year)
  }, [filterSaga, filterPlanet])

  // Position events on the timeline
  const layout = useMemo(() => {
    const result: { event: (typeof filtered)[0]; x: number }[] = []
    let lastX = -Infinity
    for (const ev of filtered) {
      const linearX = PADDING + (ev.year - MIN_YEAR) * PX_PER_YEAR
      const x = Math.max(linearX, lastX + MIN_SPACING)
      result.push({ event: ev, x })
      lastX = x
    }
    return result
  }, [filtered])

  const svgWidth = useMemo(() => {
    if (layout.length === 0) return 600
    return Math.max(layout[layout.length - 1].x + PADDING, 1200)
  }, [layout])

  // Year markers
  const yearMarkers = useMemo(() => {
    const markers: { year: number; x: number }[] = []
    for (let y = Math.ceil(MIN_YEAR / 1000) * 1000; y <= MAX_YEAR; y += 1000) {
      const x = PADDING + (y - MIN_YEAR) * PX_PER_YEAR
      markers.push({ year: y, x })
    }
    return markers
  }, [])

  // Era positions
  const eras = useMemo(() => {
    const eraDefs = [
      { id: "pre-shattering", name: "Pre-Fragmentación", start: -20000, end: -10001, color: "#1e1b4b" },
      { id: "shattering", name: "Fragmentación", start: -10000, end: -8001, color: "#4c1d95" },
      { id: "settlement", name: "Asentamiento", start: -8000, end: -5001, color: "#1e3a5f" },
      { id: "first-civilizations", name: "Primeras Civilizaciones", start: -5000, end: -2001, color: "#0f4c3a" },
      { id: "age-of-legends", name: "Era de Leyendas", start: -2000, end: -501, color: "#4a2c17" },
      { id: "classical", name: "Era Clásica", start: -500, end: 999, color: "#2d3748" },
      { id: "modern", name: "Era Moderna", start: 1000, end: 1700, color: "#234e52" },
    ]
    return eraDefs.map((era) => ({
      ...era,
      x1: PADDING + (Math.max(era.start, MIN_YEAR) - MIN_YEAR) * PX_PER_YEAR,
      x2: PADDING + (Math.min(era.end, MAX_YEAR) - MIN_YEAR) * PX_PER_YEAR,
    }))
  }, [])

  const handleDotClick = (eventId: string) => {
    const next = bubbleEvent === eventId ? null : eventId
    setBubbleEvent(next)
    onEventSelect?.(next)
  }

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return
    isDragging.current = true
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeft.current = scrollRef.current.scrollLeft
    scrollRef.current.style.cursor = 'grabbing'
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return
    const x = e.pageX - scrollRef.current.offsetLeft
    scrollRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.5
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let touchStartX = 0, touchScrollLeft = 0
    const onTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0].pageX - el.offsetLeft; touchScrollLeft = el.scrollLeft }
    const onTouchMove = (e: TouchEvent) => { el.scrollLeft = touchScrollLeft - (e.touches[0].pageX - el.offsetLeft - touchStartX) * 1.5 }
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => { el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchmove', onTouchMove) }
  }, [])

  // Find the selected layout item for bubble positioning
  const selectedLayout = bubbleEvent ? layout.find((l) => l.event.id === bubbleEvent) : null

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select value={filterSaga} onChange={(e) => setFilterSaga(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-300">
          <option value="all">Todas las sagas</option>
          {sagas.map((s) => (<option key={s} value={s}>{sagaNames[s] ?? s}</option>))}
        </select>
        <select value={filterPlanet} onChange={(e) => setFilterPlanet(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-300">
          <option value="all">Todos los planetas</option>
          {planets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
        <span className="text-sm text-gray-500">{filtered.length} eventos</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="timeline-scroll rounded-xl border border-gray-800 bg-gray-900/40"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg width={svgWidth} height="400" className="block">
            {/* Era bands */}
            {eras.map((era) => (
              era.x2 > era.x1 && (
                <g key={era.id}>
                  <rect x={era.x1} y={10} width={era.x2 - era.x1} height={26} fill={era.color} opacity={0.35} rx={3} />
                  <text x={(era.x1 + era.x2) / 2} y={27} textAnchor="middle" fill="white" fontSize="10" opacity={0.8} className="pointer-events-none select-none">
                    {era.name}
                  </text>
                </g>
              )
            ))}

            {/* Axis line */}
            <line x1={PADDING - 10} y1={AXIS_Y} x2={svgWidth - PADDING + 10} y2={AXIS_Y} stroke="#374151" strokeWidth="2" />

            {/* Year markers */}
            {yearMarkers.map((m) => (
              <g key={m.year}>
                <line x1={m.x} y1={AXIS_Y - 6} x2={m.x} y2={AXIS_Y + 6} stroke="#4b5563" strokeWidth="1" />
                <text x={m.x} y={AXIS_Y + 24} textAnchor="middle" fill="#6b7280" fontSize="11" fontFamily="monospace">
                  {m.year < 0 ? `${Math.abs(m.year)} AC` : `${m.year} DC`}
                </text>
              </g>
            ))}

            {/* Event dots */}
            {layout.map((l) => {
              const sagaColor = sagaColors[l.event.saga] ?? '#6b7280'
              const isSel = bubbleEvent === l.event.id
              return (
                <g
                  key={l.event.id}
                  onClick={() => handleDotClick(l.event.id)}
                  className="cursor-pointer"
                >
                  {/* Connector line */}
                  <line x1={l.x} y1={AXIS_Y} x2={l.x} y2={AXIS_Y - 20} stroke={sagaColor} strokeWidth={isSel ? 2 : 1} opacity={isSel ? 0.8 : 0.3} />

                  {/* Dot */}
                  <circle
                    cx={l.x}
                    cy={AXIS_Y}
                    r={isSel ? 8 : 5}
                    fill={sagaColor}
                    stroke={isSel ? 'white' : 'none'}
                    strokeWidth={2}
                  />
                  {/* Dot inner ring */}
                  {isSel && (
                    <circle cx={l.x} cy={AXIS_Y} r={12} fill="none" stroke={sagaColor} strokeWidth="1.5" opacity={0.5} />
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Speech bubble */}
        {selectedLayout && (
          <div
            className="absolute z-20 w-80 animate-scale-in rounded-xl border border-gray-700/60 bg-gray-900 px-5 py-4 shadow-2xl backdrop-blur-xl"
            style={{
              left: Math.min(selectedLayout.x - 160, scrollRef.current ? scrollRef.current.clientWidth - 340 : 500),
              top: AXIS_Y - 200,
            }}
          >
            {/* Close */}
            <button
              onClick={() => { setBubbleEvent(null); onEventSelect?.(null) }}
              className="absolute right-3 top-3 text-gray-600 transition-colors hover:text-gray-300"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>

            {/* Year */}
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {selectedLayout.event.year < 0 ? `${Math.abs(selectedLayout.event.year)} AC` : `${selectedLayout.event.year} DC`}
            </span>

            {/* Title */}
            <h3 className="mt-1 text-lg font-bold text-gray-100">
              {selectedLayout.event.title}
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              {selectedLayout.event.description}
            </p>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span
                className="rounded px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: (typeColors[selectedLayout.event.type] ?? '#6b7280') + '25', color: typeColors[selectedLayout.event.type] ?? '#6b7280' }}
              >
                {selectedLayout.event.type}
              </span>
              {selectedLayout.event.saga && (
                <span
                  className="rounded px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: (sagaColors[selectedLayout.event.saga] ?? '#6b7280') + '25', color: sagaColors[selectedLayout.event.saga] ?? '#6b7280' }}
                >
                  {sagaNames[selectedLayout.event.saga] ?? selectedLayout.event.saga}
                </span>
              )}
              {selectedLayout.event.planets.map((pid) => {
                const p = PLANETS.find((pl) => pl.id === pid)
                return p ? (
                  <span key={pid} className="rounded px-2 py-0.5 text-xs" style={{ backgroundColor: p.color + '20', color: p.color }}>
                    {p.name}
                  </span>
                ) : null
              })}
            </div>

            {/* Importance */}
            <div className="mt-2 flex items-center gap-1">
              <span className="text-xs text-gray-600">Importancia:</span>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`text-xs ${i < selectedLayout.event.importance ? 'text-amber-400' : 'text-gray-700'}`}>★</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
