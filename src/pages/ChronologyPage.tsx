import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { SAGAS, TAILWIND_TO_HEX, FALLBACK_COLOR } from '@/data/static'
import { TIMELINE_EVENTS, ERAS } from '@/data/static/timeline'
import { MAX_FORK_SAGAS } from '@/constants'
import { yearToX, MAIN_LINE_Y, FORK_START_Y, FORK_SPACING, TOTAL_WIDTH } from '@/utils/timeline-layout'
import { Chronology, ChapterNav, SagaIndex, ArchivalFolio, DocumentOverlay } from '@/components/chronology'
import type { TimelineEvent } from '@/data/static/timeline'

const SAGA_LABELS: Record<string, string> = {}
const SAGA_COLORS: Record<string, string> = {}
for (const saga of SAGAS) {
  SAGA_LABELS[saga.id] = saga.name
  SAGA_COLORS[saga.id] = TAILWIND_TO_HEX[saga.color] || FALLBACK_COLOR
}

const SAGA_NOW_YEARS: Record<string, number> = {}
for (const event of TIMELINE_EVENTS) {
  const current = SAGA_NOW_YEARS[event.saga] ?? -Infinity
  const max = event.endYear ? Math.max(event.year, event.endYear) : event.year
  if (max > current) SAGA_NOW_YEARS[event.saga] = max
}

export default function ChronologyPage() {
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

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Reading table background */}
      <div className="pointer-events-none absolute inset-0 bg-[#0b0a0a]" />

      {/* Chapter navigation — Era headings */}
      <div className="relative z-10 shrink-0 border-b border-gray-800/30">
        <ChapterNav eras={ERAS} selectedEra={selectedEra} onSelect={setSelectedEra} />
      </div>

      {/* Era info panel */}
      {selectedEra &&
        (() => {
          const era = ERAS.find((e) => e.id === selectedEra)
          if (!era) return null
          const count = TIMELINE_EVENTS.filter((e) => e.year >= era.startYear && e.year <= era.endYear).length
          return (
            <div className="relative z-10 shrink-0 border-b border-gray-800/20 px-6 py-3">
              <div className="flex items-center gap-4">
                <span className="font-serif text-[11px] uppercase tracking-[0.15em] text-gray-500">{era.name}</span>
                <span className="font-mono text-[11px] text-gray-600">
                  {era.startYear <= -20000
                    ? 'c. \u221E'
                    : era.startYear < 0
                      ? `${-era.startYear} BC`
                      : `${era.startYear} AD`}
                  {' \u2014 '}
                  {era.endYear >= 2000 ? 'c. \u221E' : era.endYear < 0 ? `${-era.endYear} BC` : `${era.endYear} AD`}
                </span>
                <span className="font-serif text-[11px] italic text-gray-700">
                  {count} record{count !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="mt-1 font-serif text-[12px] leading-relaxed text-gray-600">{era.description}</p>
            </div>
          )
        })()}

      {/* Saga index — manuscript tabs */}
      <div className="relative z-10 shrink-0 border-b border-gray-800/20">
        <SagaIndex selectedSagas={selectedSagas} onToggle={toggleSaga} />
      </div>

      {/* Chronology */}
      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <div ref={scrollRef} className="absolute inset-0 overflow-x-auto overflow-y-hidden">
          <div style={{ width: TOTAL_WIDTH, height: timelineHeight }}>
            <Chronology
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

        {/* Archival folio — hover */}
        {hoveredEvent && !expandedEvent && (
          <ArchivalFolio
            event={hoveredEvent.event}
            x={getEventPosition(hoveredEvent).x}
            y={getEventPosition(hoveredEvent).y}
            line={hoveredEvent.line}
            toViewport={getViewportPosition}
          />
        )}

        {/* Document overlay — expanded */}
        {expandedEvent && (
          <DocumentOverlay
            event={expandedEvent.event}
            x={getEventPosition(expandedEvent).x}
            y={getEventPosition(expandedEvent).y}
            onClose={() => setExpandedEvent(null)}
            toViewport={getViewportPosition}
          />
        )}
      </div>
    </div>
  )
}
