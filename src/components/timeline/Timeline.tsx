import { memo, useMemo } from 'react'
import type { TimelineEvent } from '@/data/static/timeline'
import { ERAS } from '@/data/static/timeline'
import { yearToX, TOTAL_WIDTH, MAIN_LINE_Y, FORK_START_Y, FORK_SPACING } from '@/utils/timeline-layout'
import { FALLBACK_COLOR } from '@/data/static'

function getImportanceColor(imp: number): string {
  if (imp >= 5) return '#a78bfa'
  if (imp >= 4) return '#67e8f9'
  return FALLBACK_COLOR
}

function getImportanceStroke(imp: number): string {
  if (imp >= 5) return '#7c3aed'
  if (imp >= 4) return '#22d3ee'
  return '#4b5563'
}

interface TimelineProps {
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

function formatYear(year: number): string {
  if (year < 0) return `${-year} BC`
  return `${year} AD`
}

function Timeline({
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
}: TimelineProps) {
  const forkCount = selectedSagas.length
  const totalHeight = useMemo(() => {
    return MAIN_HEIGHT + FORK_HEIGHT + forkCount * FORK_SPACING + 16
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

  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.year - b.year), [events])

  const yearIndex = useMemo(() => {
    const map = new Map<string, number>()
    let idx = 0
    let lastYear: number | null = null
    for (const e of sortedEvents) {
      if (e.year !== lastYear) {
        idx++
        lastYear = e.year
      }
      map.set(e.id, idx)
    }
    return map
  }, [sortedEvents])

  return (
    <svg
      width={TOTAL_WIDTH}
      height={totalHeight}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', minWidth: TOTAL_WIDTH }}
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-heavy" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="blur-mid">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="era-blur">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Background */}
      <rect x={0} y={0} width={TOTAL_WIDTH} height={totalHeight} fill="#030712" rx={8} />

      {/* Era bands */}
      {ERAS.map((era) => {
        const x1 = yearToX(Math.max(era.startYear, -20000))
        const x2 = yearToX(era.endYear)
        const w = Math.max(x2 - x1, 2)
        const isSelected = selectedEra === era.id
        const opacity = isSelected ? 0.15 : 0.07
        return (
          <g
            key={era.id}
            role="button"
            tabIndex={0}
            aria-label={`${era.name} era: ${formatYear(era.startYear)} — ${formatYear(era.endYear)}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectEra(isSelected ? null : era.id)
              }
            }}
            onClick={() => onSelectEra(isSelected ? null : era.id)}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={x1}
              y={2}
              width={w}
              height={MAIN_HEIGHT - 4}
              fill={era.color}
              opacity={opacity}
              rx={4}
              className={isSelected ? 'animate-era-glow' : undefined}
              style={{ ['--era-opacity' as string]: 0.15, transition: 'opacity 0.3s ease' }}
            />
            {w > 60 && (
              <>
                <text
                  x={(x1 + x2) / 2}
                  y={MAIN_LINE_Y + 18}
                  textAnchor="middle"
                  fill={era.color}
                  fontSize={11}
                  fontFamily="ui-monospace, monospace"
                  fontWeight={600}
                  opacity={0.5}
                >
                  {era.name}
                </text>
                {isSelected && (
                  <rect
                    x={x1}
                    y={MAIN_HEIGHT - 6}
                    width={w}
                    height={2}
                    fill={era.color}
                    opacity={0.5}
                    rx={1}
                    filter="url(#glow)"
                  />
                )}
              </>
            )}
          </g>
        )
      })}

      {/* Fork connection lines — dashed, straight, behind main line */}
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
                y1={MAIN_LINE_Y + 2}
                x2={ex}
                y2={y - 2}
                stroke={color}
                strokeWidth={0.75}
                strokeDasharray="3 4"
                opacity={0.25}
              />
            )
          })
      })}

      {/* Main timeline line — glow behind */}
      <line
        x1={0}
        y1={MAIN_LINE_Y}
        x2={TOTAL_WIDTH}
        y2={MAIN_LINE_Y}
        stroke="#22d3ee"
        strokeWidth={8}
        opacity={0.08}
        filter="url(#glow-heavy)"
      />
      {/* Main timeline line — crisp */}
      <line x1={0} y1={MAIN_LINE_Y} x2={TOTAL_WIDTH} y2={MAIN_LINE_Y} stroke="#67e8f9" strokeWidth={2} opacity={0.8} />

      {/* Main line events */}
      {sortedEvents.map((event) => {
        const x = yearToX(event.year)
        const isImportant = event.importance >= 4
        const r = isImportant ? 6 : 4
        const fill = getImportanceColor(event.importance)
        const isActive = hoveredEvent === event.id || expandedEvent === event.id
        const idx = yearIndex.get(event.id) ?? 0
        const entDelay = `${idx * 25}ms`

        return (
          <g
            key={event.id}
            role={isImportant ? 'button' : undefined}
            tabIndex={isImportant ? 0 : -1}
            aria-label={isImportant ? `${event.title} — ${formatYear(event.year)}` : undefined}
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
            {isImportant && <circle cx={x} cy={MAIN_LINE_Y} r={14} fill="transparent" />}
            <circle
              cx={x}
              cy={MAIN_LINE_Y}
              r={r}
              fill={fill}
              stroke={isActive ? '#67e8f9' : isImportant ? getImportanceStroke(event.importance) : 'none'}
              strokeWidth={isActive ? 2.5 : isImportant ? 1.5 : 0}
              filter={isActive ? 'url(#glow-heavy)' : isImportant ? 'url(#glow)' : undefined}
              className={isImportant && !isActive ? 'animate-dot-enter' : undefined}
              style={{ animationDelay: entDelay }}
            />
          </g>
        )
      })}

      {/* Fork lines */}
      {selectedSagas.map((saga, i) => {
        const y = FORK_START_Y + i * FORK_SPACING
        const color = sagaColors[saga] || FALLBACK_COLOR
        const label = sagaLabels[saga] || saga
        const forked = forkEventsBySaga.get(saga) || []
        const nowYear = sagaNowYears[saga]
        const nowX = nowYear != null ? yearToX(nowYear) : null

        return (
          <g key={saga}>
            {/* Fork line */}
            <line x1={0} y1={y} x2={TOTAL_WIDTH} y2={y} stroke={color} strokeWidth={1.5} opacity={0.35} />

            {/* Saga label */}
            <text
              x={8}
              y={y - 12}
              fill={color}
              fontSize={13}
              fontFamily="ui-monospace, monospace"
              fontWeight={700}
              opacity={0.7}
            >
              {label}
            </text>

            {/* NOW marker */}
            {nowX != null && (
              <>
                <line
                  x1={nowX}
                  y1={y - 14}
                  x2={nowX}
                  y2={y + 14}
                  stroke={color}
                  strokeWidth={2}
                  opacity={0.5}
                  filter="url(#glow)"
                />
                <rect x={nowX + 5} y={y - 13} width={30} height={12} rx={3} fill={color} opacity={0.7} />
                <text
                  x={nowX + 8}
                  y={y - 5}
                  fill="#030712"
                  fontSize={11}
                  fontFamily="ui-monospace, monospace"
                  fontWeight={800}
                >
                  NOW
                </text>
              </>
            )}

            {/* Fork events */}
            {forked.map((event) => {
              const ex = yearToX(event.year)
              const isImportant = event.importance >= 4
              const r = isImportant ? 5 : 3.5
              const isActive = hoveredEvent === event.id || expandedEvent === event.id
              const idx = yearIndex.get(event.id) ?? 0

              return (
                <g
                  key={event.id}
                  role={isImportant ? 'button' : undefined}
                  tabIndex={isImportant ? 0 : -1}
                  aria-label={
                    isImportant ? `${event.title} — ${formatYear(event.year)} (${sagaLabels[saga] || saga})` : undefined
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
                  {isImportant && <circle cx={ex} cy={y} r={12} fill="transparent" />}
                  <circle
                    cx={ex}
                    cy={y}
                    r={r}
                    fill={color}
                    opacity={isImportant ? 0.9 : 0.4}
                    stroke={isActive ? '#67e8f9' : 'none'}
                    strokeWidth={isActive ? 2 : 0}
                    filter={isActive ? 'url(#glow)' : undefined}
                    className={isImportant && !isActive ? 'animate-dot-enter' : undefined}
                    style={{ animationDelay: `${idx * 25}ms` }}
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

export default memo(Timeline)
