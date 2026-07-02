import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { SAGAS, SAGA_BY_ID } from '@/data/static'
import { TIMELINE_EVENTS, ERAS } from '@/data/static/timeline'
import { FALLBACK_COLOR, TAILWIND_TO_HEX, EVENT_TYPE_BADGE_COLORS } from '@/data/static'
import { MAX_FORK_SAGAS } from '@/constants'
import { yearToX, MAIN_LINE_Y, FORK_START_Y, FORK_SPACING, TOTAL_WIDTH } from '@/utils/timeline-layout'
import Timeline from '@/components/timeline/Timeline'
import TooltipOverlay from '@/components/timeline/TooltipOverlay'
import CardOverlay from '@/components/timeline/CardOverlay'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import type { TimelineEvent } from '@/data/static/timeline'

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return (h >>> 0) / 0xffffffff
}

function formatYear(year: number): string {
  if (year < 0) return `${-year} BC`
  return `${year} AD`
}

const SAGA_LABELS: Record<string, string> = {}
const SAGA_COLORS: Record<string, string> = {}
for (const saga of SAGAS) {
  SAGA_LABELS[saga.id] = saga.name
  SAGA_COLORS[saga.id] = TAILWIND_TO_HEX[saga.color] || FALLBACK_COLOR
}

const SAGA_ORDER = SAGAS.map((s) => s.id)

const SAGA_NOW_YEARS: Record<string, number> = {}
for (const event of TIMELINE_EVENTS) {
  const current = SAGA_NOW_YEARS[event.saga] ?? -Infinity
  const max = event.endYear ? Math.max(event.year, event.endYear) : event.year
  if (max > current) SAGA_NOW_YEARS[event.saga] = max
}

function eventTypeBadgeClass(type: string): string {
  return EVENT_TYPE_BADGE_COLORS[type] || 'bg-gray-800/60 text-gray-400'
}

const STAR_COUNT = 80

const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  left: hashSeed(`sx${i}`) * 100,
  top: hashSeed(`sy${i}`) * 100,
  size: hashSeed(`sr${i}`) * 1.5 + 0.3,
  delay: hashSeed(`sd${i}`) * 8,
  opacity: hashSeed(`so${i}`) * 0.4 + 0.05,
}))

function eraEventCount(eraId: string): number {
  const era = ERAS.find((e) => e.id === eraId)
  if (!era) return 0
  return TIMELINE_EVENTS.filter((e) => e.year >= era.startYear && e.year <= era.endYear).length
}

export default function TimelinePage() {
  useSEOMeta({
    title: 'Timeline — Cosmere Archive',
    description: 'Interactive timeline of events across the Cosmere universe',
  })

  const [selectedSagas, setSelectedSagas] = useState<string[]>([])
  const [selectedEra, setSelectedEra] = useState<string | null>(null)
  const [hoveredEvent, setHoveredEvent] = useState<{
    event: TimelineEvent
    line: 'main' | 'fork'
    forkSaga?: string
  } | null>(null)
  const [expandedEvent, setExpandedEvent] = useState<{
    event: TimelineEvent
    line: 'main' | 'fork'
    forkSaga?: string
  } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => setScrollLeft(el.scrollLeft)
    handler()
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  const toggleSaga = useCallback((sagaId: string) => {
    setSelectedSagas((prev) => {
      if (prev.includes(sagaId)) {
        return prev.filter((id) => id !== sagaId)
      }
      if (prev.length >= MAX_FORK_SAGAS) return prev
      return [...prev, sagaId]
    })
  }, [])

  const handleHover = useCallback(
    (eventId: string | null, event?: TimelineEvent, line?: 'main' | 'fork', forkSaga?: string) => {
      if (expandedEvent) {
        setHoveredEvent(null)
        return
      }
      if (!eventId || !event) {
        setHoveredEvent(null)
        return
      }
      setHoveredEvent({ event, line: line ?? 'main', forkSaga })
    },
    [expandedEvent],
  )

  const handleClick = useCallback(
    (eventId: string | null, event?: TimelineEvent, line?: 'main' | 'fork', forkSaga?: string) => {
      if (!eventId || !event) {
        setExpandedEvent(null)
        setHoveredEvent(null)
        return
      }
      setExpandedEvent({ event, line: line ?? 'main', forkSaga })
      setHoveredEvent(null)
    },
    [],
  )

  const getEventPosition = useCallback(
    (ev: { event: TimelineEvent; line: 'main' | 'fork'; forkSaga?: string }) => {
      const x = yearToX(ev.event.year)
      let y: number
      if (ev.line === 'main') {
        y = MAIN_LINE_Y
      } else if (ev.forkSaga) {
        const idx = selectedSagas.indexOf(ev.forkSaga)
        y = idx >= 0 ? FORK_START_Y + idx * FORK_SPACING : FORK_START_Y
      } else {
        y = FORK_START_Y
      }
      return { x, y }
    },
    [selectedSagas],
  )

  const getViewportPosition = useCallback(
    (svgX: number, svgY: number) => {
      const el = scrollRef.current
      if (!el) return { left: 0, top: 0 }
      const rect = el.getBoundingClientRect()
      return {
        left: rect.left + svgX - scrollLeft,
        top: rect.top + svgY,
      }
    },
    [scrollLeft],
  )

  const forkCount = selectedSagas.length
  const timelineHeight = useMemo(() => {
    const mainH = MAIN_LINE_Y + 28
    const forkH = 16
    return mainH + forkH + forkCount * FORK_SPACING + 16
  }, [forkCount])

  useEffect(() => {
    if (!expandedEvent) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedEvent(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [expandedEvent])

  const selectedEraData = selectedEra ? (ERAS.find((e) => e.id === selectedEra) ?? null) : null

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Star field */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {STARS.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Eras bar */}
      <div className="relative z-10 shrink-0 flex flex-wrap items-center gap-1.5 border-b border-gray-800/50 px-4 py-2.5">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Eras</span>
        {ERAS.map((era) => {
          const isActive = selectedEra === era.id
          return (
            <button
              key={era.id}
              onClick={() => setSelectedEra(isActive ? null : era.id)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all duration-300 ${
                isActive
                  ? 'text-white shadow-sm ring-1'
                  : 'text-gray-500 hover:text-gray-300 ring-1 ring-gray-700/30 hover:ring-gray-600/50'
              }`}
              style={{
                backgroundColor: isActive ? `${era.color}30` : 'transparent',
                borderColor: isActive ? era.color : 'transparent',
                ['--tw-ring-color' as string]: isActive ? era.color : undefined,
              }}
            >
              {era.name}
            </button>
          )
        })}
      </div>

      {/* Selected era info */}
      {selectedEraData && (
        <div className="relative z-10 shrink-0 border-b border-gray-800/30 bg-gray-950/60 px-4 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full animate-glow-pulse shrink-0"
              style={{ backgroundColor: selectedEraData.color, ['--glow-color' as string]: selectedEraData.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-semibold text-gray-100">{selectedEraData.name}</span>
                <span className="text-[11px] text-gray-500 font-mono">
                  {formatYear(selectedEraData.startYear)} — {formatYear(selectedEraData.endYear)}
                </span>
                <span className="text-[10px] text-gray-600">{eraEventCount(selectedEraData.id)} events</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{selectedEraData.description}</p>
            </div>
            <button
              onClick={() => setSelectedEra(null)}
              className="shrink-0 flex h-5 w-5 items-center justify-center rounded text-xs text-gray-600 hover:bg-gray-800 hover:text-cyan-300 transition-colors"
              aria-label="Close era info"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Saga selector */}
      <div className="relative z-10 shrink-0 flex flex-wrap items-center gap-1.5 border-b border-gray-800/50 px-4 py-2.5">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Forks</span>
        {SAGA_ORDER.map((sagaId) => {
          const saga = SAGA_BY_ID.get(sagaId)
          if (!saga) return null
          const isActive = selectedSagas.includes(sagaId)
          const color = TAILWIND_TO_HEX[saga.color] || FALLBACK_COLOR
          const maxed = !isActive && selectedSagas.length >= MAX_FORK_SAGAS
          return (
            <button
              key={sagaId}
              onClick={() => toggleSaga(sagaId)}
              disabled={maxed}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 ${
                isActive
                  ? 'text-white shadow-sm ring-1'
                  : 'text-gray-500 hover:text-gray-300 ring-1 ring-gray-700/30 hover:ring-gray-600/50'
              } ${maxed ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
              style={{
                backgroundColor: isActive ? `${color}25` : 'transparent',
                ['--tw-ring-color' as string]: isActive ? color : undefined,
              }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: isActive ? color : '#4b5563',
                  boxShadow: isActive ? `0 0 6px ${color}` : 'none',
                }}
              />
              {saga.name}
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <div ref={scrollRef} className="absolute inset-0 overflow-x-auto overflow-y-hidden">
          <div style={{ width: TOTAL_WIDTH, height: timelineHeight }}>
            <Timeline
              events={TIMELINE_EVENTS}
              selectedSagas={selectedSagas}
              sagaColors={SAGA_COLORS}
              sagaNowYears={SAGA_NOW_YEARS}
              sagaLabels={SAGA_LABELS}
              hoveredEvent={hoveredEvent?.event.id ?? null}
              expandedEvent={expandedEvent?.event.id ?? null}
              selectedEra={selectedEra}
              onHoverEvent={handleHover}
              onClickEvent={handleClick}
              onSelectEra={setSelectedEra}
            />
          </div>
        </div>

        {/* Tooltip overlay */}
        {hoveredEvent && !expandedEvent && (
          <TooltipOverlay
            event={hoveredEvent.event}
            x={getEventPosition(hoveredEvent).x}
            y={getEventPosition(hoveredEvent).y}
            line={hoveredEvent.line}
            eventTypeBadgeClass={eventTypeBadgeClass}
            toViewport={getViewportPosition}
          />
        )}

        {/* Expanded card overlay */}
        {expandedEvent && (
          <CardOverlay
            event={expandedEvent.event}
            x={getEventPosition(expandedEvent).x}
            y={getEventPosition(expandedEvent).y}
            eventTypeBadgeClass={eventTypeBadgeClass}
            onClose={() => setExpandedEvent(null)}
            toViewport={getViewportPosition}
          />
        )}
      </div>
    </div>
  )
}
