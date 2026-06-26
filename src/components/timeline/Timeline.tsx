import { useMemo } from 'react'
import type { TimelineEvent } from '@/data/static/timeline'
import { yearToX, TOTAL_WIDTH, MAIN_LINE_Y, FORK_START_Y, FORK_SPACING } from '@/utils/timeline-layout'
import { FALLBACK_COLOR } from '@/utils/constants'

interface TimelineProps {
  events: TimelineEvent[]
  selectedSagas: string[]
  sagaColors: Record<string, string>
  sagaNowYears: Record<string, number>
  sagaLabels: Record<string, string>
  hoveredEvent: string | null
  expandedEvent: string | null
  onHoverEvent: (eventId: string | null, event?: TimelineEvent, line?: 'main' | 'fork', forkSaga?: string) => void
  onClickEvent: (eventId: string | null, event?: TimelineEvent, line?: 'main' | 'fork', forkSaga?: string) => void
}

export default function Timeline({
  events,
  selectedSagas,
  sagaColors,
  sagaNowYears,
  sagaLabels,
  hoveredEvent,
  expandedEvent,
  onHoverEvent,
  onClickEvent,
}: TimelineProps) {
  const forkCount = selectedSagas.length
  const totalHeight = useMemo(() => {
    return 8 + MAIN_LINE_Y + 8 + forkCount * FORK_SPACING + 16
  }, [forkCount])

  const forkEventsBySaga = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>()
    for (const saga of selectedSagas) {
      map.set(
        saga,
        events.filter((e) => e.saga === saga),
      )
    }
    return map
  }, [events, selectedSagas])

  const mainEvents = events

  function getImportanceColor(imp: number): string {
    if (imp >= 5) return '#a78bfa'
    if (imp >= 4) return '#c4b5fd'
    return FALLBACK_COLOR
  }

  function getImportanceStroke(imp: number): string {
    if (imp >= 5) return '#7c3aed'
    if (imp >= 4) return '#8b5cf6'
    return '#4b5563'
  }

  return (
    <svg
      width={TOTAL_WIDTH}
      height={totalHeight}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', minWidth: TOTAL_WIDTH }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <line x1={0} y1={MAIN_LINE_Y} x2={TOTAL_WIDTH} y2={MAIN_LINE_Y} stroke="#4b5563" strokeWidth={1.5} />

      {mainEvents.map((event) => {
        const x = yearToX(event.year)
        const isImportant = event.importance >= 4
        const r = isImportant ? 5 : 3.5
        const fill = getImportanceColor(event.importance)
        const isActive = hoveredEvent === event.id || expandedEvent === event.id

        return (
          <g
            key={event.id}
            role={isImportant ? 'button' : undefined}
            tabIndex={isImportant ? 0 : -1}
            aria-label={
              isImportant ? `${event.title} - ${event.year >= 0 ? `${event.year} AD` : `${-event.year} BC`}` : undefined
            }
            onKeyDown={
              isImportant
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onClickEvent(expandedEvent === event.id ? null : event.id, event, 'main')
                    }
                  }
                : undefined
            }
            onMouseEnter={() => onHoverEvent(event.id, event, 'main')}
            onMouseLeave={() => hoveredEvent === event.id && onHoverEvent(null)}
            onClick={() =>
              onClickEvent(isImportant ? (expandedEvent === event.id ? null : event.id) : null, event, 'main')
            }
            style={{ cursor: isImportant ? 'pointer' : 'default' }}
          >
            {isImportant && <circle cx={x} cy={MAIN_LINE_Y} r={10} fill="transparent" />}
            <circle
              cx={x}
              cy={MAIN_LINE_Y}
              r={r}
              fill={fill}
              stroke={isActive ? '#c4b5fd' : isImportant ? getImportanceStroke(event.importance) : 'none'}
              strokeWidth={isActive ? 2.5 : isImportant ? 1.5 : 0}
              filter={isActive ? 'url(#glow)' : undefined}
            />
          </g>
        )
      })}

      {selectedSagas.map((saga, i) => {
        const y = FORK_START_Y + i * FORK_SPACING
        const color = sagaColors[saga] || FALLBACK_COLOR
        const label = sagaLabels[saga] || saga
        const forked = forkEventsBySaga.get(saga) || []
        const nowYear = sagaNowYears[saga]
        const nowX = nowYear != null ? yearToX(nowYear) : null

        return (
          <g key={saga}>
            <text x={4} y={y - 8} fill={color} fontSize={13} fontFamily="ui-monospace, monospace" fontWeight={600}>
              {label}
            </text>

            <line x1={0} y1={y} x2={TOTAL_WIDTH} y2={y} stroke="#374151" strokeWidth={1} />

            {nowX != null && (
              <>
                <line x1={nowX} y1={y - 18} x2={nowX} y2={y + 14} stroke={color} strokeWidth={2} opacity={0.7} />
                <rect x={nowX + 4} y={y - 17} width={32} height={14} rx={4} fill={color} opacity={0.85} />
                <text
                  x={nowX + 7}
                  y={y - 7}
                  fill="#fff"
                  fontSize={11}
                  fontFamily="ui-monospace, monospace"
                  fontWeight={700}
                >
                  NOW
                </text>
              </>
            )}

            {forked
              .filter((e) => e.importance >= 4)
              .map((event) => {
                const ex = yearToX(event.year)
                return (
                  <line
                    key={`conn-${event.id}`}
                    x1={ex}
                    y1={y}
                    x2={ex}
                    y2={MAIN_LINE_Y}
                    stroke="#4b5563"
                    strokeWidth={0.75}
                    strokeDasharray="3 3"
                  />
                )
              })}

            {forked.map((event) => {
              const ex = yearToX(event.year)
              const isImportant = event.importance >= 4
              const r = isImportant ? 4.5 : 3
              const isActive = hoveredEvent === event.id || expandedEvent === event.id

              return (
                <g
                  key={event.id}
                  role={isImportant ? 'button' : undefined}
                  tabIndex={isImportant ? 0 : -1}
                  aria-label={
                    isImportant
                      ? `${event.title} - ${event.year >= 0 ? `${event.year} AD` : `${-event.year} BC`} (${sagaLabels[saga] || saga})`
                      : undefined
                  }
                  onKeyDown={
                    isImportant
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onClickEvent(expandedEvent === event.id ? null : event.id, event, 'fork', saga)
                          }
                        }
                      : undefined
                  }
                  onMouseEnter={() => onHoverEvent(event.id, event, 'fork', saga)}
                  onMouseLeave={() => hoveredEvent === event.id && onHoverEvent(null)}
                  onClick={() =>
                    onClickEvent(
                      isImportant ? (expandedEvent === event.id ? null : event.id) : null,
                      event,
                      'fork',
                      saga,
                    )
                  }
                  style={{ cursor: isImportant ? 'pointer' : 'default' }}
                >
                  {isImportant && <circle cx={ex} cy={y} r={9} fill="transparent" />}
                  <circle
                    cx={ex}
                    cy={y}
                    r={r}
                    fill={color}
                    opacity={isImportant ? 0.9 : 0.5}
                    stroke={isActive ? '#fff' : 'none'}
                    strokeWidth={isActive ? 2 : 0}
                  />
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}
