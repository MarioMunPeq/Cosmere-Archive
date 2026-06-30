import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { SAGAS, SAGA_BY_ID } from '@/data/static'
import { TIMELINE_EVENTS } from '@/data/static/timeline'
import { FALLBACK_COLOR, TAILWIND_TO_HEX, EVENT_TYPE_BADGE_COLORS } from '@/data/static'
import { MAX_FORK_SAGAS } from '@/constants'
import { yearToX, MAIN_LINE_Y, FORK_START_Y, FORK_SPACING, TOTAL_WIDTH } from '@/utils/timeline-layout'
import Timeline from '@/components/timeline/Timeline'
import TooltipOverlay from '@/components/timeline/TooltipOverlay'
import CardOverlay from '@/components/timeline/CardOverlay'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import type { TimelineEvent } from '@/data/static/timeline'

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

export default function TimelinePage() {
  useSEOMeta({
    title: 'Timeline — Cosmere Archive',
    description: 'Interactive timeline of events across the Cosmere universe',
  })

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
  const timelineHeight = useMemo(() => 8 + MAIN_LINE_Y + 8 + forkCount * FORK_SPACING + 16, [forkCount])

  useEffect(() => {
    if (!expandedEvent) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedEvent(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [expandedEvent])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Saga selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 px-4 py-3">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Forks</span>
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
