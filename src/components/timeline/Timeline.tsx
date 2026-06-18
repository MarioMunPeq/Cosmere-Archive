import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { EVENTS } from '@/data/static'
import TimelineFilters from './TimelineFilters'
import type { CosmereEvent } from '@/types'

const TYPE_COLORS: Record<string, string> = {
  book:       '#a78bfa',
  historical: '#f59e0b',
  cataclysm:  '#ef4444',
  discovery:  '#22c55e',
}

const SAGA_COLORS: Record<string, string> = {
  "pre-cosmere":    "#6b7280",
  "elantris":       "#14b8a6",
  "white-sand":     "#eab308",
  "warbreaker":     "#d946ef",
  "mistborn-era-1": "#ef4444",
  "mistborn-era-2": "#f59e0b",
  "stormlight":     "#06b6d4",
  "secret-projects":"#0ea5e9",
}

const YEAR_MARKER_STEP = 500

interface TimelineProps {
  onEventSelect?: (eventId: string | null) => void
}

export default function Timeline({ onEventSelect }: TimelineProps) {
  const [selectedType, setSelectedType] = useState("all")
  const [selectedSaga, setSelectedSaga] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState<CosmereEvent | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const minYear = useMemo(() => Math.min(...EVENTS.map((e) => e.year)), [])
  const maxYear = useMemo(() => Math.max(...EVENTS.map((e) => e.year)), [])

  const filtered = useMemo(() => {
    return EVENTS.filter((e) => {
      if (selectedType !== "all" && e.type !== selectedType) return false
      if (selectedSaga !== "all" && e.saga !== selectedSaga) return false
      return true
    }).sort((a, b) => a.year - b.year)
  }, [selectedType, selectedSaga])

  const yearMarkers = useMemo(() => {
    const markers: number[] = []
    const start = Math.floor(minYear / YEAR_MARKER_STEP) * YEAR_MARKER_STEP
    const end = Math.ceil(maxYear / YEAR_MARKER_STEP) * YEAR_MARKER_STEP
    for (let y = start; y <= end; y += YEAR_MARKER_STEP) {
      markers.push(y)
    }
    return markers
  }, [minYear, maxYear])

  // Position calculations
  const PADDING = 200
  const EVENT_SPACING = 180
  const timelineWidth = Math.max(
    (filtered.length + 1) * EVENT_SPACING + PADDING * 2,
    1200,
  )

  const getX = useCallback(
    (year: number) => {
      const range = maxYear - minYear || 1
      return PADDING + ((year - minYear) / range) * (timelineWidth - PADDING * 2)
    },
    [minYear, maxYear, timelineWidth],
  )

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
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
  }, [])

  // Touch handlers
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let touchStartX = 0
    let touchScrollLeft = 0

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].pageX - el.offsetLeft
      touchScrollLeft = el.scrollLeft
    }

    const onTouchMove = (e: TouchEvent) => {
      const x = e.touches[0].pageX - el.offsetLeft
      const walk = (x - touchStartX) * 1.5
      el.scrollLeft = touchScrollLeft - walk
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return (
    <section>
      <TimelineFilters
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedSaga={selectedSaga}
        onSagaChange={setSelectedSaga}
        yearRange={[minYear, maxYear]}
        onYearRangeChange={() => {}}
        minYear={minYear}
        maxYear={maxYear}
      />

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-700 p-8 text-center text-sm text-gray-500">
          No hay eventos con esos filtros.
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="timeline-scroll rounded-xl border border-gray-800 bg-gray-900/40"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg width={timelineWidth} height="500" className="block">
            {/* ── Central timeline axis ──────────────── */}
            <line
              x1={PADDING}
              y1={250}
              x2={timelineWidth - PADDING}
              y2={250}
              stroke="#374151"
              strokeWidth="2"
            />

            {/* ── Year markers ──────────────────────── */}
            {yearMarkers.map((year) => {
              const x = getX(year)
              const label = year < 0 ? `${Math.abs(year)} AC` : `${year} DC`
              return (
                <g key={year}>
                  <line x1={x} y1="245" x2={x} y2="255" stroke="#4b5563" strokeWidth="1" />
                  <text
                    x={x}
                    y="235"
                    textAnchor="middle"
                    fill="#6b7280"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {label}
                  </text>
                </g>
              )
            })}

            {/* ── Event nodes ────────────────────────── */}
            {filtered.map((event, i) => {
              const x = getX(event.year)
              const isAbove = i % 2 === 0
              const y = isAbove ? 180 : 320
              const lineEndY = isAbove ? 230 : 270
              const isSelected = selectedEvent?.id === event.id

              return (
                <g
                  key={event.id}
                  onClick={() => {
                    const next = isSelected ? null : event
                    setSelectedEvent(next)
                    onEventSelect?.(next?.id ?? null)
                  }}
                  className="cursor-pointer"
                >
                  {/* Connecting line */}
                  <line
                    x1={x}
                    y1={lineEndY}
                    x2={x}
                    y2={y}
                    stroke={TYPE_COLORS[event.type] ?? '#6b7280'}
                    strokeWidth="1.5"
                    opacity={isSelected ? 0.8 : 0.3}
                  />

                  {/* Timeline dot */}
                  <circle
                    cx={x}
                    cy={250}
                    r={isSelected ? 6 : 4}
                    fill={TYPE_COLORS[event.type] ?? '#6b7280'}
                    stroke={isSelected ? 'white' : 'none'}
                    strokeWidth="1.5"
                    className="transition-all duration-300"
                  />

                  {/* Event card */}
                  <g>
                    <rect
                      x={x - 75}
                      y={isAbove ? y - 60 : y + 10}
                      width="150"
                      height="50"
                      rx="8"
                      fill={isSelected ? '#1e1b4b' : '#111827'}
                      stroke={isSelected ? '#a78bfa' : '#1f2937'}
                      strokeWidth={isSelected ? 1.5 : 1}
                      className="transition-all duration-300"
                    />
                    <text
                      x={x}
                      y={isAbove ? y - 35 : y + 35}
                      textAnchor="middle"
                      fill="#e5e7eb"
                      fontSize="12"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {event.title.length > 22
                        ? event.title.slice(0, 21) + '…'
                        : event.title}
                    </text>
                    <text
                      x={x}
                      y={isAbove ? y - 22 : y + 48}
                      textAnchor="middle"
                      fill="#6b7280"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {event.year}
                    </text>

                    {/* Saga color bar */}
                    <rect
                      x={x - 75}
                      y={isAbove ? y - 60 : y + 10}
                      width="4"
                      height="50"
                      rx="2"
                      fill={SAGA_COLORS[event.saga] ?? '#6b7280'}
                      opacity={0.7}
                    />
                  </g>
                </g>
              )
            })}
          </svg>
        </div>
      )}

      {/* ── Event detail panel ────────────────────────── */}
      {selectedEvent && (
        <div
          key={selectedEvent.id}
          className="mt-6 animate-fade-in-up rounded-xl border border-gray-700/50 bg-gray-900/80 p-6 backdrop-blur-sm"
        >
          <div className="mb-3 flex items-center gap-3">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: TYPE_COLORS[selectedEvent.type] ?? '#6b7280' }}
            />
            <span className="rounded bg-gray-800 px-2 py-0.5 text-xs font-mono text-gray-400">
              {selectedEvent.year < 0
                ? `${Math.abs(selectedEvent.year)} AC`
                : `${selectedEvent.year} DC`}
            </span>
            <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
              {selectedEvent.type}
            </span>
          </div>

          <h3 className="text-xl font-bold text-purple-300">{selectedEvent.title}</h3>
          <p className="mt-3 leading-relaxed text-gray-400">{selectedEvent.description}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
            <span>
              <span className="font-semibold text-gray-400">Planetas:</span>{' '}
              {selectedEvent.planets.join(', ')}
            </span>
            {selectedEvent.endYear && (
              <span>
                <span className="font-semibold text-gray-400">Duración:</span>{' '}
                {selectedEvent.year} — {selectedEvent.endYear}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
