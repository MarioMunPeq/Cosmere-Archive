import { memo, useMemo } from 'react'
import type { TimelineEvent } from '@/data/static/timeline'
import { ERAS } from '@/data/static/timeline'
import { yearToX, TOTAL_WIDTH, MAIN_LINE_Y, FORK_START_Y, FORK_SPACING } from '@/utils/timeline-layout'
import { FALLBACK_COLOR } from '@/data/static'

function formatYear(year: number): string {
  if (year < 0) return `${-year} BC`
  return `${year} AD`
}

interface ChronologyProps {
  events: TimelineEvent[]
  selectedSagas: string[]
  sagaColors: Record<string, string>
  sagaNowYears: Record<string, number>
  sagaLabels: Record<string, string>
  hoveredEvent: string | null
  expandedEvent: string | null
  selectedEra: string | null
  onHoverEvent: (eventId: string | null, event?: TimelineEvent, line?: 'main' | 'fork', forkSaga?: string) => void
  onClickEvent: (eventId: string | null, event?: TimelineEvent, line?: 'main' | 'fork', forkSaga?: string) => void
  onSelectEra: (eraId: string | null) => void
}

const MAIN_HEIGHT = MAIN_LINE_Y + 28
const FORK_HEIGHT = 16

function Chronology({
  events,
  selectedSagas,
  sagaColors,
  sagaNowYears,
  sagaLabels,
  hoveredEvent,
  expandedEvent,
  selectedEra,
  onHoverEvent,
  onClickEvent,
  onSelectEra,
}: ChronologyProps) {
  const forkCount = selectedSagas.length
  const totalHeight = useMemo(() => MAIN_HEIGHT + FORK_HEIGHT + forkCount * FORK_SPACING + 16, [forkCount])

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

  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.year - b.year), [events])

  return (
    <svg
      width={TOTAL_WIDTH}
      height={totalHeight}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', minWidth: TOTAL_WIDTH }}
    >
      {/* Archival background */}
      <rect x={0} y={0} width={TOTAL_WIDTH} height={totalHeight} fill="transparent" />

      {/* Era bands as subtle column markers */}
      {ERAS.map((era) => {
        const x1 = yearToX(Math.max(era.startYear, -20000))
        const x2 = yearToX(era.endYear)
        const w = Math.max(x2 - x1, 2)
        const isSelected = selectedEra === era.id
        return (
          <g
            key={era.id}
            role="button"
            tabIndex={0}
            aria-label={`${era.name}: ${formatYear(era.startYear)} \u2014 ${formatYear(era.endYear)}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectEra(isSelected ? null : era.id)
              }
            }}
            onClick={() => onSelectEra(isSelected ? null : era.id)}
            style={{ cursor: 'pointer' }}
          >
            <rect x={x1} y={0} width={w} height={MAIN_HEIGHT} fill={era.color} opacity={isSelected ? 0.06 : 0.025} />
            {isSelected && (
              <line
                x1={x1}
                y1={MAIN_HEIGHT - 1}
                x2={x2}
                y2={MAIN_HEIGHT - 1}
                stroke={era.color}
                strokeWidth={1}
                opacity={0.3}
              />
            )}
          </g>
        )
      })}

      {/* Fork connection lines */}
      {selectedSagas.map((saga, i) => {
        const y = FORK_START_Y + i * FORK_SPACING
        const color = sagaColors[saga] || FALLBACK_COLOR
        const forked = forkEventsBySaga.get(saga) || []
        return forked
          .filter((e) => e.importance >= 4)
          .map((event) => {
            const ex = yearToX(event.year)
            return (
              <line
                key={`conn-${event.id}`}
                x1={ex}
                y1={MAIN_LINE_Y + 1}
                x2={ex}
                y2={y - 1}
                stroke={color}
                strokeWidth={0.5}
                strokeDasharray="2 4"
                opacity={0.15}
              />
            )
          })
      })}

      {/* Main chronology line */}
      <line x1={0} y1={MAIN_LINE_Y} x2={TOTAL_WIDTH} y2={MAIN_LINE_Y} stroke="#374151" strokeWidth={1} opacity={0.5} />

      {/* Main line events */}
      {sortedEvents.map((event) => {
        const x = yearToX(event.year)
        const imp = event.importance
        const fill = imp >= 5 ? '#cbd5e1' : imp >= 4 ? '#64748b' : imp >= 3 ? '#4b5563' : '#374151'
        const r = imp >= 5 ? 8 : imp >= 4 ? 6 : imp >= 3 ? 4.5 : 3
        const isActive = hoveredEvent === event.id || expandedEvent === event.id
        const isClickable = imp >= 4

        return (
          <g
            key={event.id}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : -1}
            aria-label={isClickable ? `${event.title} \u2014 ${formatYear(event.year)}` : undefined}
            onKeyDown={
              isClickable
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
              onClickEvent(isClickable ? (expandedEvent === event.id ? null : event.id) : null, event, 'main')
            }
            style={{ cursor: isClickable ? 'pointer' : 'default' }}
          >
            {imp >= 5 && (
              <>
                <circle
                  cx={x}
                  cy={MAIN_LINE_Y}
                  r={r + 3}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth={0.5}
                  opacity={0.3}
                />
                <circle cx={x} cy={MAIN_LINE_Y} r={r} fill={fill} opacity={0.6} />
                <circle cx={x} cy={MAIN_LINE_Y} r={3} fill={fill} opacity={0.9} />
              </>
            )}
            {imp === 4 && (
              <g transform={`translate(${x}, ${MAIN_LINE_Y}) rotate(45)`}>
                <rect x={-4} y={-4} width={8} height={8} rx={1} fill={fill} opacity={0.6} />
              </g>
            )}
            {imp === 3 && (
              <>
                <circle cx={x} cy={MAIN_LINE_Y} r={r} fill="none" stroke={fill} strokeWidth={0.5} opacity={0.5} />
                <circle cx={x} cy={MAIN_LINE_Y} r={2} fill={fill} opacity={0.5} />
              </>
            )}
            {imp < 3 && <circle cx={x} cy={MAIN_LINE_Y} r={r} fill={fill} opacity={0.3} />}

            {isActive && imp >= 4 && (
              <circle cx={x} cy={MAIN_LINE_Y} r={r + 5} fill="none" stroke="#94a3b8" strokeWidth={0.5} opacity={0.5} />
            )}
          </g>
        )
      })}

      {/* Fork lanes */}
      {selectedSagas.map((saga, i) => {
        const y = FORK_START_Y + i * FORK_SPACING
        const color = sagaColors[saga] || FALLBACK_COLOR
        const label = sagaLabels[saga] || saga
        const forked = forkEventsBySaga.get(saga) || []
        const nowYear = sagaNowYears[saga]
        const nowX = nowYear != null ? yearToX(nowYear) : null

        return (
          <g key={saga}>
            {/* Fork lane line */}
            <line x1={0} y1={y} x2={TOTAL_WIDTH} y2={y} stroke={color} strokeWidth={0.5} opacity={0.15} />

            {/* Saga label */}
            <text
              x={8}
              y={y - 10}
              fill={color}
              fontSize={11}
              fontFamily="Georgia, 'EB Garamond', serif"
              fontWeight={400}
              opacity={0.5}
              letterSpacing="0.1em"
            >
              {label}
            </text>

            {/* NOW marker */}
            {nowX != null && (
              <>
                <line x1={nowX} y1={y - 8} x2={nowX} y2={y + 8} stroke={color} strokeWidth={1} opacity={0.4} />
                <text x={nowX + 4} y={y - 2} fill={color} fontSize={9} fontFamily="Georgia, serif" opacity={0.5}>
                  NOW
                </text>
              </>
            )}

            {/* Fork events */}
            {forked.map((event) => {
              const ex = yearToX(event.year)
              const imp = event.importance
              const isActive = hoveredEvent === event.id || expandedEvent === event.id
              const isClickable = imp >= 4
              const fill = imp >= 5 ? color : imp >= 4 ? color : '#4b5563'
              const r = imp >= 5 ? 6 : imp >= 4 ? 4.5 : 3
              const opacity = imp >= 4 ? 0.7 : 0.25

              return (
                <g
                  key={event.id}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : -1}
                  aria-label={isClickable ? `${event.title} (${label})` : undefined}
                  onKeyDown={
                    isClickable
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
                      isClickable ? (expandedEvent === event.id ? null : event.id) : null,
                      event,
                      'fork',
                      saga,
                    )
                  }
                  style={{ cursor: isClickable ? 'pointer' : 'default' }}
                >
                  {imp >= 5 && (
                    <>
                      <circle cx={ex} cy={y} r={r + 2} fill="none" stroke={fill} strokeWidth={0.5} opacity={0.3} />
                      <circle cx={ex} cy={y} r={r} fill={fill} opacity={opacity} />
                      <circle cx={ex} cy={y} r={2.5} fill={fill} opacity={0.9} />
                    </>
                  )}
                  {imp === 4 && (
                    <g transform={`translate(${ex}, ${y}) rotate(45)`}>
                      <rect x={-3.5} y={-3.5} width={7} height={7} rx={1} fill={fill} opacity={opacity} />
                    </g>
                  )}
                  {imp === 3 && (
                    <>
                      <circle cx={ex} cy={y} r={r} fill="none" stroke={fill} strokeWidth={0.5} opacity={0.4} />
                      <circle cx={ex} cy={y} r={1.5} fill={fill} opacity={0.4} />
                    </>
                  )}
                  {imp < 3 && <circle cx={ex} cy={y} r={2.5} fill={fill} opacity={0.2} />}

                  {isActive && imp >= 4 && (
                    <circle cx={ex} cy={y} r={r + 4} fill="none" stroke="#94a3b8" strokeWidth={0.5} opacity={0.4} />
                  )}
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

export default memo(Chronology)
