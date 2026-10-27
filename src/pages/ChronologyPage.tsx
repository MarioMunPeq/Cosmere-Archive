import { useState, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SAGAS, TAILWIND_TO_HEX, FALLBACK_COLOR, TYPE_LABELS } from '@/data/static'
import { TIMELINE_EVENTS, ERAS } from '@/data/static/timeline'
import { yearToX, TOTAL_WIDTH } from '@/utils/timeline-layout'
import { Chronology, ChapterNav, ArchivalFolio } from '@/components/chronology'
import type { TimelineMetrics } from '@/components/chronology'
import type { CosmicEra, TimelineEvent } from '@/data/static/timeline'

const SAGA_LABELS: Record<string, string> = {}
const SAGA_COLORS: Record<string, string> = {}
for (const saga of SAGAS) {
  SAGA_LABELS[saga.id] = saga.name
  SAGA_COLORS[saga.id] = TAILWIND_TO_HEX[saga.color] || FALLBACK_COLOR
}

function formatYear(year: number): string {
  if (year < 0) return `${-year} BC`
  return `${year} AD`
}

function formatEraRange(era: CosmicEra): string {
  const start = era.startYear <= -20000 ? 'c. \u221E' : formatYear(era.startYear)
  const end = era.endYear >= 2000 ? 'c. \u221E' : formatYear(era.endYear)
  return `${start} \u2014 ${end}`
}

const ZOOM_BUTTON_STYLE = {
  background: 'rgba(246,240,227,0.92)',
  border: '1px solid rgba(110,80,50,0.4)',
  color: '#2a1f14',
} as const

export default function ChronologyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const eventParam = searchParams.get('event')
  const [selectedEra, setSelectedEra] = useState<string | null>(null)
  const [sagaFilter, setSagaFilter] = useState<string[]>([])
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  /*
   * A deep link (`?event=`) renders its record without an extra effect. Closing
   * the panel records which parameter was dismissed so the selection does not
   * come straight back; a new parameter still opens the new record.
   */
  const [dismissedParam, setDismissedParam] = useState<string | null>(null)
  const paramEvent = useMemo(
    () => (eventParam ? (TIMELINE_EVENTS.find((candidate) => candidate.id === eventParam) ?? null) : null),
    [eventParam],
  )
  const expandedEvent =
    paramEvent && paramEvent.id !== dismissedParam ? paramEvent : selectedEvent
  const [timelineMetrics, setTimelineMetrics] = useState<TimelineMetrics>({ height: 420, lineY: 190 })
  const [areaHeight, setAreaHeight] = useState(420)
  const scrollRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [zoom, setZoom] = useState(1)

  /* The line is centred in whatever vertical space the page leaves it. */
  useLayoutEffect(() => {
    const el = areaRef.current
    if (!el) return
    const measure = () => {
      const height = el.clientHeight
      if (height > 0) setAreaHeight(height)
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => setScrollLeft(el.scrollLeft)
    handler()
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  /*
   * Selecting an era moves the chronicle so its first event sits in the
   * middle of the reading window.
   */
  useEffect(() => {
    if (!selectedEra) return
    const era = ERAS.find((candidate) => candidate.id === selectedEra)
    if (!era) return
    const firstEvent = TIMELINE_EVENTS.filter(
      (event) => event.year >= era.startYear && event.year <= era.endYear,
    ).sort((a, b) => a.year - b.year)[0]
    const el = scrollRef.current
    if (!el) return
    const x = yearToX(firstEvent?.year ?? era.startYear)
    el.scrollTo({ left: Math.max(0, x * zoom - el.clientWidth / 2), behavior: 'smooth' })
  }, [selectedEra, zoom])

  const handleHover = useCallback(
    (eventId: string | null, event?: TimelineEvent) => {
      if (expandedEvent || !eventId || !event) {
        setHoveredEvent(null)
        return
      }
      setHoveredEvent(event)
    },
    [expandedEvent],
  )

  const handleClick = useCallback(
    (eventId: string | null, event?: TimelineEvent) => {
      const next = eventId && event ? event : null
      setSelectedEvent(next)
      setDismissedParam(next ? null : eventParam)
      setHoveredEvent(null)
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)
          if (next) params.set('event', next.id)
          else params.delete('event')
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams, eventParam],
  )

  const toggleSagaFilter = useCallback((sagaId: string) => {
    setSagaFilter((prev) => (prev.includes(sagaId) ? prev.filter((id) => id !== sagaId) : [...prev, sagaId]))
  }, [])

  const handleSelectEra = useCallback(
    (eraId: string | null) => {
      setSelectedEra(eraId)
      setSelectedEvent(null)
      setDismissedParam(null)
      setHoveredEvent(null)
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)
          params.delete('event')
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const handleMetrics = useCallback((next: TimelineMetrics) => {
    setTimelineMetrics((prev) =>
      prev.height === next.height && prev.lineY === next.lineY ? prev : next,
    )
  }, [])

  /* Bring a selected record, deep-linked or clicked, into the reading window. */
  useEffect(() => {
    if (!expandedEvent) return
    const el = scrollRef.current
    if (!el) return
    const x = yearToX(expandedEvent.year)
    el.scrollTo({ left: Math.max(0, x * zoom - el.clientWidth / 2), behavior: 'smooth' })
  }, [expandedEvent, zoom])

  const getEventPosition = useCallback(
    (event: TimelineEvent) => ({
      x: yearToX(event.year),
      y: timelineMetrics.lineY,
    }),
    [timelineMetrics.lineY],
  )

  const getViewportPosition = useCallback(
    (svgX: number, svgY: number) => {
      const el = scrollRef.current
      if (!el) return { left: 0, top: 0 }
      const rect = el.getBoundingClientRect()
      return {
        left: rect.left + svgX * zoom - scrollLeft,
        top: rect.top + svgY * zoom - el.scrollTop,
      }
    },
    [scrollLeft, zoom],
  )

  const activeEra = useMemo(
    () => ERAS.find((era) => era.id === selectedEra) ?? ERAS[0] ?? null,
    [selectedEra],
  )
  const activeEraCount = useMemo(() => {
    if (!activeEra) return 0
    return TIMELINE_EVENTS.filter(
      (event) => event.year >= activeEra.startYear && event.year <= activeEra.endYear,
    ).length
  }, [activeEra])

  useEffect(() => {
    if (!expandedEvent) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClick(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [expandedEvent, handleClick])

  return (
    <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
      {/* Reading surface */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #f2ece0 0%, #e6dcc4 40%, #d9ccb0 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '160px 160px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          background: 'radial-gradient(ellipse at 50% 60%, transparent 0%, rgba(90,70,45,0.18) 100%)',
        }}
      />

      {/* Chapter navigation — Era headings */}
      <div
        data-chronology-bar="eras"
        className="relative z-10 shrink-0 border-b"
        style={{ borderColor: 'rgba(90,70,45,0.25)' }}
      >
        <ChapterNav eras={ERAS} selectedEra={selectedEra} onSelect={handleSelectEra} />
      </div>

      {/* Saga filters — the only saga bar on the page */}
      <div
        role="group"
        aria-label="Saga filters"
        data-chronology-bar="filters"
        className="relative z-10 flex shrink-0 flex-wrap items-center gap-2 border-b px-6 py-2"
        style={{ borderColor: 'rgba(90,70,45,0.16)' }}
      >
        <span
          className="mr-2 font-[var(--font-display)] text-[11px] uppercase tracking-[0.2em]"
          style={{ color: '#6b4a2a' }}
        >
          Filter by saga
        </span>
        {SAGAS.map((saga) => {
          const active = sagaFilter.includes(saga.id)
          const color = SAGA_COLORS[saga.id] || FALLBACK_COLOR
          return (
            <button
              key={saga.id}
              data-saga-filter={saga.id}
              data-active={active ? 'true' : 'false'}
              onClick={() => toggleSagaFilter(saga.id)}
              className="px-2.5 py-1 font-[var(--font-display)] text-[12px] uppercase tracking-[0.14em]"
              style={{
                border: '1px solid rgba(110,80,50,0.4)',
                color: active ? '#2a1f14' : '#6b4a2a',
                background: active ? 'rgba(246,240,227,0.7)' : 'transparent',
              }}
            >
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
              {saga.name}
            </button>
          )
        })}
        {sagaFilter.length > 0 && (
          <button
            onClick={() => setSagaFilter([])}
            className="px-2.5 py-1 font-[var(--font-display)] text-[12px] uppercase tracking-[0.14em]"
            style={{ color: '#6b4a2a' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Timeline area — the line fills the height and is vertically centred */}
      <div ref={areaRef} data-chronology-area className="relative z-10 flex min-h-0 flex-1">
        <div
          ref={scrollRef}
          data-chronology-scroll
          className="min-w-0 flex-1 overflow-auto"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div style={{ width: TOTAL_WIDTH * zoom, height: timelineMetrics.height * zoom }}>
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
              <Chronology
                events={TIMELINE_EVENTS}
                hoveredEvent={hoveredEvent?.id ?? null}
                expandedEvent={expandedEvent?.id ?? null}
                selectedEra={selectedEra}
                sagaFilter={sagaFilter}
                availableHeight={areaHeight}
                onMetrics={handleMetrics}
                onHoverEvent={handleHover}
                onClickEvent={handleClick}
                onSelectEra={handleSelectEra}
              />
            </div>
          </div>
        </div>

        {/* Zoom controls — bottom-right, outside the scrolling text so they never cover a label */}
        <div
          data-chronology-controls
          className="flex w-16 shrink-0 flex-col items-center justify-end gap-2 border-l px-2 pb-4"
          style={{ borderColor: 'rgba(90,70,45,0.16)' }}
        >
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((value) => Math.min(1.4, value + 0.1))}
            className="flex h-10 w-10 items-center justify-center font-[var(--font-display)] text-lg"
            style={ZOOM_BUTTON_STYLE}
          >
            +
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((value) => Math.max(0.7, value - 0.1))}
            className="flex h-10 w-10 items-center justify-center font-[var(--font-display)] text-lg"
            style={ZOOM_BUTTON_STYLE}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Fit"
            onClick={() => setZoom(1)}
            className="flex h-10 w-10 items-center justify-center font-[var(--font-display)] text-[10px] uppercase tracking-[0.08em]"
            style={ZOOM_BUTTON_STYLE}
          >
            Fit
          </button>
        </div>

        {/* Hover tooltip */}
        {hoveredEvent && !expandedEvent && (
          <ArchivalFolio
            event={hoveredEvent}
            x={getEventPosition(hoveredEvent).x}
            y={getEventPosition(hoveredEvent).y}
            line="main"
            toViewport={getViewportPosition}
          />
        )}
      </div>

      {/* Detail panel — in the page flow, so it never covers the line */}
      <div
        data-chronology-panel="detail"
        aria-label="Chronology details"
        className="relative z-20 shrink-0 border-t px-6 py-3"
        style={{
          borderColor: 'rgba(90,70,45,0.22)',
          background: 'linear-gradient(180deg, rgba(246,240,227,0.55) 0%, rgba(238,228,204,0.75) 100%)',
        }}
      >
        {expandedEvent ? (
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div
                className="flex flex-wrap items-center gap-x-4 gap-y-1 font-[var(--font-display)] text-[12px] uppercase tracking-[0.18em]"
                style={{ color: '#6b4a2a' }}
              >
                <span>{formatYear(expandedEvent.year)}</span>
                {expandedEvent.saga && <span>{SAGA_LABELS[expandedEvent.saga] ?? expandedEvent.saga}</span>}
                <span>{TYPE_LABELS[expandedEvent.type]}</span>
              </div>
              <h2 className="mt-1 font-[var(--font-display)] text-[18px] leading-snug" style={{ color: '#2a1f14' }}>
                {expandedEvent.title}
              </h2>
              <p className="mt-1 text-[13.5px] leading-snug" style={{ color: '#3a2a1a' }}>
                {expandedEvent.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleClick(null)}
              aria-label="Close event details"
              className="flex h-7 w-7 shrink-0 items-center justify-center font-[var(--font-display)] text-lg transition-colors"
              style={{ color: '#6b4a2a' }}
            >
              ×
            </button>
          </div>
        ) : (
          activeEra && (
            <div>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                <h2
                  className="font-[var(--font-display)] text-[13px] uppercase tracking-[0.24em]"
                  style={{ color: '#2a1f14' }}
                >
                  {activeEra.name}
                </h2>
                <span className="font-[var(--font-display)] text-[12px]" style={{ color: '#6b4a2a' }}>
                  {formatEraRange(activeEra)}
                </span>
                <span className="font-[var(--font-display)] text-[12px] italic" style={{ color: '#7a6040' }}>
                  {activeEraCount} records
                </span>
                <span
                  className="ml-auto font-[var(--font-display)] text-[11px] italic"
                  style={{ color: '#7a6040' }}
                >
                  Select a point for full details
                </span>
              </div>
              <p
                className="mt-1 truncate font-[var(--font-display)] text-[13.5px] leading-snug"
                title={activeEra.description}
                style={{ color: '#4a3524' }}
              >
                {activeEra.description}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
