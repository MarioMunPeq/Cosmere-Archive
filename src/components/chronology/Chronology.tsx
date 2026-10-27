import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { TimelineEvent } from '@/data/static/timeline'
import { ERAS } from '@/data/static/timeline'
import { yearToX, TOTAL_WIDTH, TIMELINE_JUMPS } from '@/utils/timeline-layout'

function formatYear(year: number): string {
  if (year < 0) return `${-year} BC`
  return `${year} AD`
}

export interface TimelineMetrics {
  height: number
  lineY: number
}

interface ChronologyProps {
  events: TimelineEvent[]
  hoveredEvent: string | null
  expandedEvent: string | null
  selectedEra: string | null
  sagaFilter: string[]
  availableHeight: number
  onMetrics: (metrics: TimelineMetrics) => void
  onHoverEvent: (eventId: string | null, event?: TimelineEvent) => void
  onClickEvent: (eventId: string | null, event?: TimelineEvent) => void
  onSelectEra: (eraId: string | null) => void
}

const LABEL_FONT_SIZE = 17
const LABEL_FONT_FAMILY = "'Caveat Variable', cursive"
/** Horizontal breathing room kept between two labels in the same lane. */
const LABEL_MARGIN_X = 14
/** Every extra lane is 30px farther from the chronology line. */
const LABEL_LANE_GAP = 30
/** Space kept above the topmost label and below the bottommost label. */
const VERTICAL_PADDING = 18
const MIN_CONTENT_HEIGHT = 280

const LABEL_ASCENT = Math.ceil(LABEL_FONT_SIZE * 0.82)
const LABEL_DESCENT = Math.ceil(LABEL_FONT_SIZE * 0.3)
const DIAMOND_HALF = 12 / Math.SQRT2 / 2

interface LabelCandidate {
  year: number
  x: number
  text: string
  eventId: string
  eraId: string
  radius: number
  estimatedWidth: number
}

interface LabelPlacement extends LabelCandidate {
  width: number
  lane: number
  /** Baseline offset from the timeline line. Negative = above the line. */
  offsetY: number
}

let measurementContext: CanvasRenderingContext2D | null | undefined

/**
 * First-pass width estimate. The real widths are taken from the rendered
 * `<text>` elements with `getBBox()` in the layout effect below; this only
 * gives the first paint a layout close enough that nothing jumps.
 */
function estimateLabelWidth(text: string): number {
  if (typeof document === 'undefined') return text.length * 9
  if (measurementContext === undefined) {
    const canvas = document.createElement('canvas')
    measurementContext = canvas.getContext('2d')
  }
  if (!measurementContext) return text.length * 9
  measurementContext.font = `${LABEL_FONT_SIZE}px ${LABEL_FONT_FAMILY}`
  return Math.ceil(measurementContext.measureText(text).width)
}

/**
 * Greedy lane placement in visual order. Lanes alternate above/below the line:
 * 0 = above-1, 1 = below-1, 2 = above-2, 3 = below-2, and so on. A label takes
 * the first lane whose occupied intervals do not overlap it after adding the
 * 14px margin to both sides.
 */
function placeLabels(candidates: LabelCandidate[], widths: Readonly<Record<number, number>>): LabelPlacement[] {
  const occupied = new Map<number, Array<{ left: number; right: number }>>()

  return candidates.map((candidate) => {
    const width = widths[candidate.year] ?? candidate.estimatedWidth
    const left = candidate.x - width / 2 - LABEL_MARGIN_X
    const right = candidate.x + width / 2 + LABEL_MARGIN_X

    let lane = 0
    for (;;) {
      const intervals = occupied.get(lane)
      const collides = intervals?.some((interval) => left < interval.right && right > interval.left) ?? false
      if (!collides) break
      lane++
    }

    const intervals = occupied.get(lane)
    if (intervals) intervals.push({ left, right })
    else occupied.set(lane, [{ left, right }])

    const level = Math.floor(lane / 2)
    const above = lane % 2 === 0
    const offsetY = above
      ? -(candidate.radius + 18 + level * LABEL_LANE_GAP)
      : candidate.radius + 24 + level * LABEL_LANE_GAP

    return { ...candidate, width, lane, offsetY }
  })
}

function getEventShape(imp: number): 'circle' | 'diamond' | 'hollow' {
  if (imp >= 5) return 'circle'
  if (imp >= 4) return 'diamond'
  return 'hollow'
}

function pointRadius(imp: number): number {
  if (imp >= 5) return 8
  if (imp >= 3) return 6
  return 4
}

function Chronology({
  events,
  hoveredEvent,
  expandedEvent,
  selectedEra,
  sagaFilter,
  availableHeight,
  onMetrics,
  onHoverEvent,
  onClickEvent,
  onSelectEra,
}: ChronologyProps) {
  const isDimmed = (ev: TimelineEvent) => {
    if (sagaFilter.length === 0) return false
    if (!ev.saga) return true
    return !sagaFilter.includes(ev.saga)
  }

  /*
   * Year labels are laid out independently of the points. One label is kept
   * per year (the most important event of that year), and its real width is
   * measured from the rendered text before the final lane assignment.
   */
  const [measuredWidths, setMeasuredWidths] = useState<Record<number, number>>({})
  const [fontEpoch, setFontEpoch] = useState(0)
  const [measuredEpoch, setMeasuredEpoch] = useState(-1)
  const labelRefs = useRef(new Map<number, SVGTextElement>())

  const registerLabel = useCallback((node: SVGTextElement | null) => {
    if (!node) return
    const year = Number(node.dataset.year)
    if (Number.isFinite(year)) labelRefs.current.set(year, node)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) return
    let cancelled = false
    const bump = () => {
      if (!cancelled) setFontEpoch((epoch) => epoch + 1)
    }
    void document.fonts.ready.then(bump)
    document.fonts.addEventListener('loadingdone', bump)
    return () => {
      cancelled = true
      document.fonts.removeEventListener('loadingdone', bump)
    }
  }, [])

  const labelCandidates = useMemo<LabelCandidate[]>(() => {
    const representative = new Map<number, TimelineEvent>()
    for (const event of events) {
      if (event.importance < 3) continue
      const current = representative.get(event.year)
      if (!current || event.importance > current.importance) representative.set(event.year, event)
    }

    return [...representative.values()]
      .sort((a, b) => a.year - b.year)
      .map((event) => {
        const era = ERAS.find((candidate) => event.year >= candidate.startYear && event.year <= candidate.endYear)
        const text = formatYear(event.year)
        return {
          year: event.year,
          x: yearToX(event.year),
          text,
          eventId: event.id,
          eraId: era?.id ?? 'unplaced',
          radius: pointRadius(event.importance),
          estimatedWidth: estimateLabelWidth(text),
        }
      })
  }, [events])

  const labelPlacements = useMemo(() => placeLabels(labelCandidates, measuredWidths), [labelCandidates, measuredWidths])
  const placementByEvent = useMemo(
    () => new Map(labelPlacements.map((placement) => [placement.eventId, placement])),
    [labelPlacements],
  )

  const selectedYear = useMemo(
    () => events.find((event) => event.id === expandedEvent)?.year ?? null,
    [events, expandedEvent],
  )

  useLayoutEffect(() => {
    const liveYears = new Set(labelCandidates.map((candidate) => candidate.year))
    for (const year of labelRefs.current.keys()) {
      if (!liveYears.has(year)) labelRefs.current.delete(year)
    }

    /*
     * `getBBox()` forces a layout read, so it runs in the next frame rather
     * than synchronously inside the effect. jsdom has no implementation at
     * all, and in that case `measured` stays at zero and no state is touched.
     */
    const frame = requestAnimationFrame(() => {
      const next: Record<number, number> = {}
      let changed = false
      let measured = 0
      for (const [year, node] of labelRefs.current) {
        if (typeof node.getBBox !== 'function') continue
        const width = node.getBBox().width
        if (!Number.isFinite(width) || width <= 0) continue
        measured++
        next[year] = width
        if (Math.abs((measuredWidths[year] ?? -1) - width) > 0.5) changed = true
      }

      if (measured === 0) return
      if (changed) setMeasuredWidths(next)
      setMeasuredEpoch(fontEpoch)
    })

    return () => cancelAnimationFrame(frame)
  }, [labelCandidates, measuredWidths, fontEpoch])

  const labelsReady =
    fontEpoch > 0 &&
    measuredEpoch === fontEpoch &&
    labelCandidates.length > 0 &&
    labelCandidates.every((candidate) => measuredWidths[candidate.year] != null)

  /*
   * The line is centred in the space the page gives it. If the measured lanes
   * need more room than the viewport, the SVG grows and the reader can scroll.
   */
  const { contentHeight, lineY } = useMemo(() => {
    let above = 0
    let below = 0
    for (const placement of labelPlacements) {
      if (placement.offsetY < 0) above = Math.max(above, -placement.offsetY)
      else below = Math.max(below, placement.offsetY)
    }

    const topPad = above + LABEL_ASCENT + VERTICAL_PADDING
    const bottomPad = below + LABEL_DESCENT + VERTICAL_PADDING
    const required = topPad + bottomPad
    const height = Math.max(availableHeight > 0 ? availableHeight : MIN_CONTENT_HEIGHT, required, MIN_CONTENT_HEIGHT)
    const centered = height / 2
    return {
      contentHeight: height,
      lineY: Math.min(Math.max(centered, topPad), height - bottomPad),
    }
  }, [labelPlacements, availableHeight])

  useEffect(() => {
    onMetrics({ height: contentHeight, lineY })
  }, [contentHeight, lineY, onMetrics])

  return (
    <svg
      width={TOTAL_WIDTH}
      height={contentHeight}
      xmlns="http://www.w3.org/2000/svg"
      data-label-layout={labelsReady ? 'ready' : 'measuring'}
      data-line-y={lineY}
      style={{ display: 'block', minWidth: TOTAL_WIDTH }}
    >
      {/* Archival background */}
      <rect x={0} y={0} width={TOTAL_WIDTH} height={contentHeight} fill="transparent" />

      {/* Era bands as subtle column markers */}
      {ERAS.map((era) => {
        const x1 = yearToX(Math.max(era.startYear, -20000))
        const x2 = yearToX(era.endYear)
        const w = Math.max(x2 - x1, 2)
        const isSelected = selectedEra === era.id
        return (
          <g
            key={era.id}
            data-era-band={era.id}
            data-era-name={era.name}
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
            <rect x={x1} y={0} width={w} height={contentHeight} fill={era.color} opacity={isSelected ? 0.06 : 0.02} />
            {isSelected && (
              <path
                d={`M ${x1} ${lineY + 74} C ${x1 + 12} ${lineY + 73}, ${x2 - 12} ${lineY + 73}, ${x2} ${lineY + 74}`}
                stroke={era.color}
                strokeWidth={1.2}
                fill="none"
                opacity={0.3}
                strokeLinecap="round"
              />
            )}
          </g>
        )
      })}

      {/* Jump indicators */}
      {TIMELINE_JUMPS.map((jx, i) => (
        <g key={`jump-${i}`}>
          <line
            x1={jx + 10}
            y1={lineY}
            x2={jx + 40}
            y2={lineY}
            stroke="#6b4a2a"
            strokeWidth={1.2}
            strokeDasharray="4 6"
            opacity={0.4}
          />
          <text
            x={jx + 25}
            y={lineY - 8}
            textAnchor="middle"
            fontFamily="'Caveat Variable', cursive"
            fontSize="12"
            fill="#6b4a2a"
            opacity={0.55}
          >
            ···
          </text>
        </g>
      ))}

      {/* Main chronology line */}
      <path
        d={`M 0 ${lineY} C ${TOTAL_WIDTH * 0.25} ${lineY + 0.8}, ${TOTAL_WIDTH * 0.5} ${lineY - 0.6}, ${TOTAL_WIDTH * 0.75} ${lineY + 0.6} L ${TOTAL_WIDTH} ${lineY}`}
        stroke="#4a3524"
        strokeWidth={3}
        opacity={0.8}
        fill="none"
        strokeLinecap="round"
      />

      {/* Main line events */}
      {events.map((event) => {
        const x = yearToX(event.year)
        const imp = event.importance
        const ink = imp >= 5 ? '#1f160d' : imp >= 4 ? '#2a1f14' : '#3a2a1a'
        const r = pointRadius(imp)
        const isActive = hoveredEvent === event.id || expandedEvent === event.id
        const isClickable = imp >= 3
        const dim = isDimmed(event)
        const shape = getEventShape(imp)
        const placement = placementByEvent.get(event.id)
        const labelIsSelected = placement != null && selectedYear === placement.year

        return (
          <g
            key={event.id}
            data-timeline-point={event.id}
            data-point-year={event.year}
            data-point-x={x}
            data-point-y={lineY}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : -1}
            aria-label={isClickable ? `${event.title} \u2014 ${formatYear(event.year)}` : undefined}
            onKeyDown={
              isClickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onClickEvent(expandedEvent === event.id ? null : event.id, event)
                    }
                  }
                : undefined
            }
            onMouseEnter={() => onHoverEvent(event.id, event)}
            onMouseLeave={() => hoveredEvent === event.id && onHoverEvent(null)}
            onClick={() => onClickEvent(isClickable && expandedEvent !== event.id ? event.id : null, event)}
            style={{ cursor: isClickable ? 'pointer' : 'default' }}
            opacity={dim ? 0.18 : 1}
          >
            <g
              style={{
                transformOrigin: `${x}px ${lineY}px`,
                transform: isActive ? 'scale(1.3)' : 'scale(1)',
                transition: 'transform 160ms ease, filter 160ms ease',
                filter: isActive ? 'drop-shadow(0 0 5px rgba(122, 92, 52, 0.9))' : undefined,
              }}
            >
              {shape === 'circle' && (
                <g>
                  <circle cx={x} cy={lineY} r={r + 3} fill="none" stroke={ink} strokeWidth={0.8} opacity={0.3} />
                  <circle cx={x} cy={lineY} r={r} fill={ink} opacity={0.94} />
                </g>
              )}
              {shape === 'diamond' && (
                <g transform={`translate(${x}, ${lineY}) rotate(45)`}>
                  <rect
                    x={-DIAMOND_HALF}
                    y={-DIAMOND_HALF}
                    width={DIAMOND_HALF * 2}
                    height={DIAMOND_HALF * 2}
                    rx={0.5}
                    fill={ink}
                    opacity={0.92}
                  />
                </g>
              )}
              {shape === 'hollow' && (
                <circle
                  cx={x}
                  cy={lineY}
                  r={r}
                  fill="none"
                  stroke={ink}
                  strokeWidth={1.3}
                  opacity={imp >= 3 ? 0.85 : 0.55}
                />
              )}
            </g>

            {isActive && (
              <circle cx={x} cy={lineY} r={r + 6} fill="none" stroke="#b99a5f" strokeWidth={1.1} opacity={0.45} />
            )}

            {placement && (
              <>
                <path
                  d={
                    placement.offsetY < 0
                      ? `M ${placement.x} ${lineY - placement.radius - 3} L ${placement.x} ${lineY + placement.offsetY + 4}`
                      : `M ${placement.x} ${lineY + placement.radius + 3} L ${placement.x} ${lineY + placement.offsetY - LABEL_ASCENT}`
                  }
                  stroke="#6b4a2a"
                  strokeWidth={0.9}
                  opacity={0.45}
                  fill="none"
                />
                <text
                  ref={registerLabel}
                  data-year-label={placement.year}
                  data-year={placement.year}
                  data-era={placement.eraId}
                  data-lane={placement.lane}
                  data-label-side={placement.offsetY < 0 ? 'above' : 'below'}
                  x={placement.x}
                  y={lineY + placement.offsetY}
                  textAnchor="middle"
                  fontFamily={LABEL_FONT_FAMILY}
                  fontSize={LABEL_FONT_SIZE}
                  fontWeight={labelIsSelected ? 600 : 500}
                  fill={labelIsSelected ? '#140d07' : '#241a10'}
                  opacity={1}
                >
                  {placement.text}
                </text>
              </>
            )}

            {/* Generous invisible hit target so a point is easy to select. */}
            <circle
              data-point-hit={event.id}
              data-point-hit-year={event.year}
              cx={x}
              cy={lineY}
              r={Math.max(r + 6, 14)}
              fill="rgba(0,0,0,0)"
              pointerEvents="all"
            />
          </g>
        )
      })}
    </svg>
  )
}

export default memo(Chronology)
