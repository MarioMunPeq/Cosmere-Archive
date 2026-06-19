import { useState, useCallback, useEffect, useRef } from 'react'
import { SAGAS, SAGA_BY_ID } from '@/data/static'
import { TIMELINE_EVENTS } from '@/data/static/timeline'
import { formatJourneyYear } from '@/utils/journey'
import { yearToX, MAIN_LINE_Y, FORK_START_Y, FORK_SPACING, TOTAL_WIDTH } from '@/utils/timeline-layout'
import Timeline from '@/components/timeline/Timeline'
import type { TimelineEvent } from '@/data/static/timeline'

const TAILWIND_TO_HEX: Record<string, string> = {
  red: '#ef4444',
  amber: '#f59e0b',
  teal: '#14b8a6',
  fuchsia: '#d946ef',
  cyan: '#06b6d4',
  yellow: '#eab308',
  violet: '#8b5cf6',
  sky: '#0ea5e9',
}

const SAGA_LABELS: Record<string, string> = {}
const SAGA_COLORS: Record<string, string> = {}
for (const saga of SAGAS) {
  SAGA_LABELS[saga.id] = saga.name
  SAGA_COLORS[saga.id] = TAILWIND_TO_HEX[saga.color] || '#6b7280'
}

const SAGA_ORDER = SAGAS.map(s => s.id)

const SAGA_NOW_YEARS: Record<string, number> = {}
for (const event of TIMELINE_EVENTS) {
  const current = SAGA_NOW_YEARS[event.saga] ?? -Infinity
  const max = event.endYear ? Math.max(event.year, event.endYear) : event.year
  if (max > current) SAGA_NOW_YEARS[event.saga] = max
}

const TYPE_LABELS: Record<string, string> = {
  book: 'Book',
  cataclysm: 'Cataclysm',
  birth: 'Birth',
  death: 'Death',
  arrival: 'Arrival',
  departure: 'Departure',
  discovery: 'Discovery',
  historical: 'Historical',
}

export default function TimelinePage() {
  const [selectedSagas, setSelectedSagas] = useState<string[]>([])
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
    setSelectedSagas(prev => {
      if (prev.includes(sagaId)) {
        return prev.filter(id => id !== sagaId)
      }
      if (prev.length >= 5) return prev
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

  const getViewportPosition = useCallback((svgX: number, svgY: number) => {
    const el = scrollRef.current
    if (!el) return { left: 0, top: 0 }
    const rect = el.getBoundingClientRect()
    return {
      left: rect.left + svgX - scrollLeft,
      top: rect.top + svgY,
    }
  }, [scrollLeft])

  const forkCount = selectedSagas.length
  const timelineHeight = 8 + MAIN_LINE_Y + 8 + forkCount * FORK_SPACING + 16

  const eventTypeBadgeClass = (type: string) => {
    const colors: Record<string, string> = {
      book: 'bg-blue-900/60 text-blue-300',
      cataclysm: 'bg-red-900/60 text-red-300',
      birth: 'bg-green-900/60 text-green-300',
      death: 'bg-gray-800/80 text-gray-400',
      arrival: 'bg-purple-900/60 text-purple-300',
      departure: 'bg-yellow-900/60 text-yellow-300',
      discovery: 'bg-cyan-900/60 text-cyan-300',
      historical: 'bg-gray-800/60 text-gray-400',
    }
    return colors[type] || 'bg-gray-800/60 text-gray-400'
  }

  useEffect(() => {
    if (!expandedEvent) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpandedEvent(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [expandedEvent])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Saga selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 px-4 py-3">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Forks
        </span>
        {SAGA_ORDER.map(sagaId => {
          const saga = SAGA_BY_ID.get(sagaId)
          if (!saga) return null
          const isActive = selectedSagas.includes(sagaId)
          const color = TAILWIND_TO_HEX[saga.color] || '#6b7280'
          const maxed = !isActive && selectedSagas.length >= 5
          return (
            <button
              key={sagaId}
              onClick={() => toggleSaga(sagaId)}
              disabled={maxed}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'border border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300'
              } ${maxed ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
              style={{
                backgroundColor: isActive ? `${color}22` : 'transparent',
                borderColor: isActive ? color : undefined,
              }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: isActive ? color : '#4b5563' }}
              />
              {saga.name}
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
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
              onHoverEvent={handleHover}
              onClickEvent={handleClick}
            />
          </div>
        </div>

        {/* Tooltip overlay — fixed to viewport, no scroll */}
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

        {/* Expanded card overlay — fixed to viewport, no scroll */}
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

function TooltipOverlay({
  event,
  x,
  y,
  line,
  eventTypeBadgeClass,
  toViewport,
}: {
  event: TimelineEvent
  x: number
  y: number
  line: 'main' | 'fork'
  eventTypeBadgeClass: (t: string) => string
  toViewport: (svgX: number, svgY: number) => { left: number; top: number }
}) {
  const vp = toViewport(x + 10, line === 'main' ? y - 52 : y - 48)
  let left = vp.left
  const top = vp.top
  const maxW = Math.min(240, window.innerWidth - 16)
  if (left + maxW > window.innerWidth - 8) left = window.innerWidth - maxW - 8
  if (left < 8) left = 8

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-md border border-gray-700 bg-gray-900/95 px-3 py-2 shadow-lg backdrop-blur-sm"
      style={{ left, top, maxWidth: maxW }}
    >
      <div className="flex items-center gap-1.5">
        <span className={eventTypeBadgeClass(event.type)}>{TYPE_LABELS[event.type]}</span>
        <span className="text-[10px] text-gray-500">{formatJourneyYear(event.year)}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-purple-300">{event.title}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-gray-400 line-clamp-2">
        {event.description}
      </p>
      {event.importance >= 4 && (
        <p className="mt-0.5 text-[10px] text-purple-600/80">Click to expand</p>
      )}
    </div>
  )
}

function CardOverlay({
  event,
  x,
  y,
  eventTypeBadgeClass,
  onClose,
  toViewport,
}: {
  event: TimelineEvent
  x: number
  y: number
  eventTypeBadgeClass: (t: string) => string
  onClose: () => void
  toViewport: (svgX: number, svgY: number) => { left: number; top: number }
}) {
  const vp = toViewport(x, y)
  const cardW = 280
  let cardLeft = vp.left - cardW / 2
  const cardTop = vp.top + 14
  if (cardLeft + cardW > window.innerWidth - 8) cardLeft = window.innerWidth - cardW - 8
  if (cardLeft < 8) cardLeft = 8

  return (
    <div
      className="fixed z-50 w-[280px] rounded-lg border border-gray-700 bg-gray-900/95 shadow-xl backdrop-blur-sm"
      style={{ left: cardLeft, top: cardTop }}
    >
      <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className={eventTypeBadgeClass(event.type)}>{TYPE_LABELS[event.type]}</span>
          <span className="text-[11px] text-gray-500">{formatJourneyYear(event.year)}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose() }}
          className="flex h-5 w-5 items-center justify-center rounded text-xs text-gray-600 hover:bg-gray-800 hover:text-gray-300"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="px-3 py-2">
        <h3 className="text-sm font-bold text-purple-300">{event.title}</h3>
        <p className="mt-1 text-[12px] leading-relaxed text-gray-300">
          {event.description}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500">
          {event.saga && (
            <span>
              Saga: <span className="text-gray-400">{SAGA_LABELS[event.saga] || event.saga}</span>
            </span>
          )}
          {event.planets.length > 0 && (
            <span>
              Planets: <span className="text-gray-400">{event.planets.join(', ')}</span>
            </span>
          )}
          {event.characters && event.characters.length > 0 && (
            <span>
              Characters: <span className="text-gray-400">{event.characters.join(', ')}</span>
            </span>
          )}
          {event.worldhoppers && event.worldhoppers.length > 0 && (
            <span>
              Worldhoppers: <span className="text-gray-400">{event.worldhoppers.join(', ')}</span>
            </span>
          )}
          {event.importance && (
            <span>
              Importance: <span className="text-gray-400">{'★'.repeat(event.importance)}{'☆'.repeat(5 - event.importance)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export { TYPE_LABELS }
