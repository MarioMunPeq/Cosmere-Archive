import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { ERAS } from '@/data/static/timeline/eras'
import { TIMELINE_EVENTS } from '@/data/static/timeline/events'
import { CHARACTER_SPANS, CHARACTER_GROUPS } from '@/data/static/timeline/character-lifespans'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline/worldhopper-journeys'
import { PLANETS } from '@/data/static'

const MIN_YEAR = -11000
const MAX_YEAR = 1700
const YEAR_RANGE = MAX_YEAR - MIN_YEAR
const PADDING = 60
const ZOOM_LEVELS = [0.15, 0.3, 0.6, 1.2, 2.4, 4.8] as const
const HEIGHT = {
  eras: 24,
  axis: 22,
  events: 54,
  charHeader: 18,
  charBar: 18,
  charGap: 4,
  groupGap: 8,
  whHeader: 18,
  whTrack: 24,
}

interface Props {
  onEventSelect?: (eventId: string | null) => void
  highlightedEvent?: string | null
}

function getX(year: number, pxPerYear: number): number {
  return PADDING + (year - MIN_YEAR) * pxPerYear
}

export default function CosmereTimeline({ onEventSelect, highlightedEvent }: Props) {
  const [zoomIdx, setZoomIdx] = useState(2) // default 0.6px/yr
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  const pxPerYear = ZOOM_LEVELS[zoomIdx]
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const svgWidth = useMemo(() => YEAR_RANGE * pxPerYear + PADDING * 2, [pxPerYear])

  // Filter events by zoom level
  const visibleEvents = useMemo(() => {
    const minImportance = zoomIdx <= 1 ? 4 : zoomIdx <= 2 ? 3 : 1
    return TIMELINE_EVENTS.filter((e) => e.importance >= minImportance)
  }, [zoomIdx])

  // Character sections
  const characterSections = useMemo(() => {
    return CHARACTER_GROUPS.map((g) => ({
      ...g,
      chars: CHARACTER_SPANS.filter((c) => c.group === g.id),
    }))
  }, [])

  // Height calculations
  const charTotalHeight = useMemo(() => {
    let h = HEIGHT.charHeader
    for (const section of characterSections) {
      if (section.chars.length === 0) continue
      h += HEIGHT.groupGap + HEIGHT.charHeader
      h += section.chars.length * (HEIGHT.charBar + HEIGHT.charGap)
    }
    return h
  }, [characterSections])

  const whTotalHeight = useMemo(() => {
    if (WORLDHOPPER_MOVEMENTS.length === 0) return 0
    return HEIGHT.whHeader + WORLDHOPPER_MOVEMENTS.length * (HEIGHT.whTrack + 4) + 8
  }, [])

  let currentY = 8
  const erasY = currentY
  currentY += HEIGHT.eras + 2

  const axisY = currentY
  currentY += HEIGHT.axis + 4

  const eventsY = currentY
  currentY += HEIGHT.events + 8

  const charsY = currentY
  currentY += charTotalHeight + 12

  const whsY = currentY
  currentY += whTotalHeight + 8

  const svgHeight = currentY + 16

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
    scrollRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.5
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
  }, [])

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
      el.scrollLeft = touchScrollLeft - (x - touchStartX) * 1.5
    }
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  // Planet name lookup
  const planetName = (id: string) => {
    const p = PLANETS.find((pl) => pl.id === id)
    return p ? p.name : id
  }

  // Generate year tick marks
  const yearStep = pxPerYear < 0.3 ? 2000 : pxPerYear < 0.6 ? 1000 : pxPerYear < 1.2 ? 500 : pxPerYear < 2.4 ? 200 : 100
  const yearMarkers: number[] = []
  for (let y = Math.ceil(MIN_YEAR / yearStep) * yearStep; y <= MAX_YEAR; y += yearStep) {
    yearMarkers.push(y)
  }

  const handleEventClick = useCallback((eventId: string) => {
    setSelectedEvent((prev) => {
      const next = prev === eventId ? null : eventId
      onEventSelect?.(next)
      return next
    })
  }, [onEventSelect])

  return (
    <div className="space-y-2">
      {/* ── Zoom controls ─────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setZoomIdx(Math.max(0, zoomIdx - 1))}
          disabled={zoomIdx === 0}
          className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-400 hover:bg-gray-700 disabled:opacity-30"
        >
          − Alejar
        </button>
        <span className="text-xs text-gray-500">
          {pxPerYear.toFixed(2)} px/año
        </span>
        <button
          onClick={() => setZoomIdx(Math.min(ZOOM_LEVELS.length - 1, zoomIdx + 1))}
          disabled={zoomIdx === ZOOM_LEVELS.length - 1}
          className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-400 hover:bg-gray-700 disabled:opacity-30"
        >
          + Acercar
        </button>
        {visibleEvents.length < TIMELINE_EVENTS.length && (
          <span className="text-xs text-gray-600">
            ({TIMELINE_EVENTS.length - visibleEvents.length} eventos ocultos por zoom)
          </span>
        )}
      </div>

      {/* ── Scrollable SVG ────────────────────── */}
      <div
        ref={scrollRef}
        className="timeline-scroll rounded-xl border border-gray-800 bg-gray-900/40"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg width={svgWidth} height={svgHeight} className="block select-none">
          <defs>
            {PLANETS.map((p) => (
              <clipPath key={p.id} id={`char-clip-${p.id}`}>
                <rect x={0} y={0} width={svgWidth} height={svgHeight} />
              </clipPath>
            ))}
          </defs>

          {/* ══════ ERA BANDS ═══════════════════════ */}
          <g>
            {ERAS.map((era) => {
              const x1 = getX(Math.max(era.startYear, MIN_YEAR), pxPerYear)
              const x2 = getX(Math.min(era.endYear, MAX_YEAR), pxPerYear)
              if (x2 <= x1) return null
              return (
                <g key={era.id}>
                  <rect
                    x={x1}
                    y={erasY}
                    width={x2 - x1}
                    height={HEIGHT.eras}
                    fill={era.color}
                    opacity={0.35}
                    rx={2}
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={erasY + HEIGHT.eras / 2 + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
                    opacity={0.7}
                    className="pointer-events-none"
                  >
                    {era.name}
                  </text>
                </g>
              )
            })}
          </g>

          {/* ══════ YEAR AXIS ═══════════════════════ */}
          <g>
            <line
              x1={PADDING}
              y1={axisY + HEIGHT.axis - 2}
              x2={svgWidth - PADDING}
              y2={axisY + HEIGHT.axis - 2}
              stroke="#374151"
              strokeWidth="1"
            />
            {yearMarkers.map((year) => {
              const x = getX(year, pxPerYear)
              if (x < PADDING || x > svgWidth - PADDING) return null
              const label = year < 0 ? `${Math.abs(year)} AC` : `${year} DC`
              const isMajor = year % (yearStep * 5) === 0
              return (
                <g key={year}>
                  <line
                    x1={x} y1={axisY} x2={x} y2={axisY + HEIGHT.axis - 4}
                    stroke={isMajor ? '#6b7280' : '#4b5563'}
                    strokeWidth={isMajor ? 1.5 : 0.8}
                  />
                  <text
                    x={x}
                    y={axisY + HEIGHT.axis - 6}
                    textAnchor="middle"
                    fill={isMajor ? '#9ca3af' : '#6b7280'}
                    fontSize={isMajor ? '9' : '7'}
                  >
                    {label}
                  </text>
                </g>
              )
            })}
          </g>

          {/* ══════ EVENTS ════════════════════════ */}
          <g>
            {visibleEvents.map((ev) => {
              const x = getX(ev.year, pxPerYear)
              if (x < PADDING - 20 || x > svgWidth - PADDING + 20) return null
              const isSel = selectedEvent === ev.id || highlightedEvent === ev.id
              const typeColor: Record<string, string> = {
                book: '#a78bfa', historical: '#f59e0b', cataclysm: '#ef4444',
                discovery: '#22c55e', birth: '#06b6d4', death: '#6b7280',
                arrival: '#22d3ee', departure: '#f472b6',
              }
              const color = typeColor[ev.type] ?? '#6b7280'

              // Determine whether to show label based on zoom and proximity
              const showLabel = pxPerYear >= 0.6 || ev.importance >= 4

              return (
                <g
                  key={ev.id}
                  onClick={() => handleEventClick(ev.id)}
                  className="cursor-pointer"
                >
                  {/* Connecting line */}
                  <line
                    x1={x} y1={eventsY + 8} x2={x} y2={eventsY + HEIGHT.events - 8}
                    stroke={color}
                    strokeWidth={isSel ? 2 : 1}
                    opacity={isSel ? 0.8 : 0.25}
                  />
                  {/* Dot */}
                  <circle
                    cx={x}
                    cy={eventsY + HEIGHT.events - 8}
                    r={isSel ? 6 : 3}
                    fill={color}
                    stroke={isSel ? 'white' : 'none'}
                    strokeWidth="1.5"
                  />
                  {/* Label */}
                  {showLabel && (
                    <g>
                      <rect
                        x={x - 55}
                        y={eventsY + 2}
                        width="110"
                        height="18"
                        rx="4"
                        fill={isSel ? '#1e1b4b' : '#111827'}
                        stroke={isSel ? color : '#1f2937'}
                        strokeWidth={isSel ? 1 : 0.5}
                        opacity={isSel ? 1 : 0.7}
                      />
                      <text
                        x={x}
                        y={eventsY + 14}
                        textAnchor="middle"
                        fill={isSel ? 'white' : '#d1d5db'}
                        fontSize="8"
                        fontWeight={isSel ? 'bold' : 'normal'}
                      >
                        {ev.title.length > 16 ? ev.title.slice(0, 15) + '…' : ev.title}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </g>

          {/* ══════ CHARACTERS ═══════════════════════ */}
          <g>
            <text
              x={PADDING}
              y={charsY + 12}
              fill="#9ca3af"
              fontSize="10"
              fontWeight="bold"
            >
              ── Personajes ──
            </text>
            {(() => {
              let y = charsY + HEIGHT.charHeader + 6
              return characterSections.map((section) => {
                if (section.chars.length === 0) return null
                y += HEIGHT.groupGap + HEIGHT.charHeader
                const sectionY = y - HEIGHT.charHeader
                const groupLabel = `  ${section.label}`
                return (
                  <g key={section.id}>
                    <text
                      x={PADDING}
                      y={sectionY + 12}
                      fill={section.color}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {groupLabel}
                    </text>
                    {section.chars.map((char) => {
                      const barY = y
                      y += HEIGHT.charBar + HEIGHT.charGap
                      const birth = char.birthYear ?? MIN_YEAR
                      const death = char.deathYear ?? MAX_YEAR
                      const x1 = getX(Math.max(birth, MIN_YEAR), pxPerYear)
                      const x2 = getX(Math.min(death, MAX_YEAR), pxPerYear)
                      if (x2 <= x1) return null
                      const width = x2 - x1
                      if (width < 2) return null
                      return (
                        <g key={char.id} opacity={0.85}>
                          {/* Life bar */}
                          <rect
                            x={x1}
                            y={barY + 2}
                            width={width}
                            height={HEIGHT.charBar - 4}
                            rx={3}
                            fill={char.color}
                            opacity={0.3}
                          />
                          <rect
                            x={x1}
                            y={barY + 2}
                            width={Math.max(width, 4)}
                            height={HEIGHT.charBar - 4}
                            rx={3}
                            fill={char.color}
                            opacity={0.15}
                            stroke={char.color}
                            strokeWidth={0.5}
                          />
                          {/* Name label */}
                          {width > 40 && (
                            <text
                              x={x1 + 6}
                              y={barY + HEIGHT.charBar - 4}
                              fill="white"
                              fontSize="8"
                              className="pointer-events-none"
                            >
                              {char.name}
                            </text>
                          )}
                          {/* Title tooltip on hover (just render dot for short bars) */}
                          {width <= 40 && (
                            <circle cx={x1 + 2} cy={barY + HEIGHT.charBar / 2} r={3} fill={char.color} opacity={0.6} />
                          )}
                        </g>
                      )
                    })}
                  </g>
                )
              })
            })()}
          </g>

          {/* ══════ WORLDHOPPERS ═══════════════════════ */}
          {WORLDHOPPER_MOVEMENTS.length > 0 && (
            <g>
              <text
                x={PADDING}
                y={whsY + 12}
                fill="#9ca3af"
                fontSize="10"
                fontWeight="bold"
              >
                ── Viajes de Worldhoppers ──
              </text>
              {WORLDHOPPER_MOVEMENTS.map((wh, idx) => {
                const trackY = whsY + HEIGHT.whHeader + 6 + idx * (HEIGHT.whTrack + 4)
                return (
                  <g key={wh.id}>
                    {/* Name */}
                    <text
                      x={PADDING - 4}
                      y={trackY + HEIGHT.whTrack / 2 + 3}
                      textAnchor="end"
                      fill={wh.color}
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {wh.name}
                    </text>
                    {/* Movement dots + lines */}
                    {wh.movements.map((m, mi) => {
                      const x = getX(m.year, pxPerYear)
                      const prevX = mi > 0 ? getX(wh.movements[mi - 1].year, pxPerYear) : null
                      return (
                        <g key={mi}>
                          {/* Connection line from previous */}
                          {prevX !== null && (
                            <line
                              x1={prevX}
                              y1={trackY + HEIGHT.whTrack / 2}
                              x2={x}
                              y2={trackY + HEIGHT.whTrack / 2}
                              stroke={wh.color}
                              strokeWidth={1}
                              opacity={0.3}
                              strokeDasharray="3 3"
                            />
                          )}
                          {/* Planet dot */}
                          <circle
                            cx={x}
                            cy={trackY + HEIGHT.whTrack / 2}
                            r={4}
                            fill={wh.color}
                            opacity={0.7}
                          />
                          {/* Planet label (if zoomed in enough) */}
                          {pxPerYear >= 0.6 && (
                            <text
                              x={x}
                              y={trackY + HEIGHT.whTrack - 2}
                              textAnchor="middle"
                              fill="#9ca3af"
                              fontSize="6"
                            >
                              {planetName(m.planet)}
                            </text>
                          )}
                          {/* Tooltip on hover - year label */}
                          {pxPerYear >= 1.2 && (
                            <text
                              x={x}
                              y={trackY + 4}
                              textAnchor="middle"
                              fill="#6b7280"
                              fontSize="6"
                            >
                              {m.year}
                            </text>
                          )}
                        </g>
                      )
                    })}
                  </g>
                )
              })}
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}
