import { useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { DiagramCanvas } from './DiagramCanvas'
import { DiagramBackground } from './DiagramBackground'
import { DiagramWritings } from './DiagramWritings'
import { BOOKS, PLANETS, SHARD_COLORS, SAGA_NAME_COLORS } from '@/data/static'
import { HONORBLADES } from '@/data/static/aharietiam'
import type { ReactNode } from 'react'

const SHARD_COUNT = Object.keys(SHARD_COLORS).length
const CX = 2500
const CY = 2500

interface WallDoc {
  id: string
  x: number
  y: number
  w: number
  h: number
  rot: number
  z: number
}

const WALL_DOCS: WallDoc[] = [
  { id: 'catalogue', x: 400, y: 900, w: 440, h: 280, rot: -8, z: 3 },
  { id: 'volumes', x: 3400, y: 800, w: 480, h: 330, rot: 6, z: 4 },
  { id: 'wordcount', x: 1200, y: 2200, w: 400, h: 280, rot: 11, z: 2 },
  { id: 'population', x: 3600, y: 2200, w: 440, h: 320, rot: -14, z: 5 },
  { id: 'worlds', x: 600, y: 3400, w: 480, h: 360, rot: 5, z: 3 },
  { id: 'shards', x: 3000, y: 3500, w: 420, h: 300, rot: -18, z: 4 },
  { id: 'connections', x: 1800, y: 1300, w: 560, h: 400, rot: -4, z: 1 },
  { id: 'chronology', x: 1800, y: 3900, w: 500, h: 320, rot: 22, z: 6 },
  { id: 'heralds', x: 3600, y: 4100, w: 440, h: 290, rot: -7, z: 2 },
]

const CONNECTOR_LINES: { x1: number; y1: number; x2: number; y2: number }[] = [
  { x1: 2060, y1: 1500, x2: 620, y2: 900 },
  { x1: 2060, y1: 1500, x2: 840, y2: 3400 },
  { x1: 3640, y1: 965, x2: 2050, y2: 3900 },
]

function CosmereSymbol() {
  return (
    <svg viewBox="0 0 120 120" width={120} height={120} className="mx-auto" style={{ opacity: 0.3 }}>
      <circle cx="60" cy="60" r="56" fill="none" stroke="#b8a898" strokeWidth="0.5" />
      <circle cx="60" cy="60" r="48" fill="none" stroke="#b8a898" strokeWidth="0.3" opacity="0.6" />
      <circle cx="60" cy="60" r="8" fill="#b8a898" opacity="0.4" />
      {Array.from({ length: 16 }, (_, i) => {
        const a = i * 22.5 * (Math.PI / 180)
        const r1 = 20
        const r2 = 44
        const x1 = 60 + r1 * Math.cos(a)
        const y1 = 60 + r1 * Math.sin(a)
        const x2 = 60 + r2 * Math.cos(a)
        const y2 = 60 + r2 * Math.sin(a)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b8a898" strokeWidth="0.4" opacity="0.25" />
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 + 11.25) * (Math.PI / 180)
        const r = 30
        const x = 60 + r * Math.cos(a)
        const y = 60 + r * Math.sin(a)
        return <circle key={i} cx={x} cy={y} r="1.5" fill="#b8a898" opacity="0.2" />
      })}
    </svg>
  )
}

function PaperDoc({
  id,
  w,
  h,
  rotation,
  children,
  onClick,
}: {
  id: string
  w: number
  h: number
  rotation?: number
  children: ReactNode
  onClick?: () => void
}) {
  const borderColor = useMemo(() => {
    const colors = ['rgba(120,100,80,0.08)', 'rgba(100,80,60,0.06)', 'rgba(140,120,100,0.07)']
    return colors[id.length % 3]
  }, [id])

  return (
    <div
      onClick={onClick}
      className="absolute overflow-hidden"
      style={{
        left: 0,
        top: 0,
        width: w,
        height: h,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        background: `linear-gradient(135deg, #ece4d4 0%, #e4dcc8 40%, #dcd0bc 100%)`,
        borderRadius: 2,
        border: `1px solid ${borderColor}`,
        boxShadow: `${((id.charCodeAt(0) % 5) - 2) * 2}px ${((id.charCodeAt(1) % 5) - 2) * 2}px ${6 + (id.charCodeAt(2) % 8)}px rgba(0,0,0,0.4)`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
      }}
    >
      <div className="w-full h-full">{children}</div>
    </div>
  )
}

function InkBarChart({ data, maxCount }: { data: [string, number][]; maxCount: number }) {
  const barW = 28
  const gap = 5
  const chartH = 120
  const padL = 20
  const padB = 28
  const totalW = data.length * (barW + gap) + padL
  return (
    <svg viewBox={`0 0 ${totalW} ${chartH + padB}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {[0, 0.5, 1].map((frac) => {
        const yy = padB + chartH * (1 - frac)
        return (
          <g key={frac}>
            <line x1={padL} y1={yy} x2={totalW} y2={yy} stroke="#5a4a3a" strokeWidth="0.3" opacity="0.08" />
            {frac > 0 && (
              <text
                x={padL - 3}
                y={yy + 2}
                textAnchor="end"
                fill="#5a4a3a"
                fontSize="5"
                opacity="0.3"
                fontFamily="Cormorant Garamond,serif"
              >
                {Math.round(frac * maxCount)}
              </text>
            )}
          </g>
        )
      })}
      {data.map(([sagaId, count], i) => {
        const x = padL + i * (barW + gap)
        const barH = (count / maxCount) * chartH
        const y = padB + chartH - barH
        const inkColor = (SAGA_NAME_COLORS as Record<string, string>)[sagaId] ?? '#8b7355'
        return (
          <g key={sagaId}>
            <rect x={x + 1} y={y + 1} width={barW - 2} height={barH - 1} fill={inkColor} opacity="0.15" rx="1" />
            <path
              d={`M ${x + 1} ${y + barH} L ${x + 1} ${y + 3} Q ${x} ${y} ${x + 3} ${y} L ${x + barW - 3} ${y} Q ${x + barW - 1} ${y} ${x + barW - 1} ${y + 3} L ${x + barW - 1} ${y + barH}`}
              fill="none"
              stroke="#2a1a0a"
              strokeWidth="0.4"
              opacity="0.2"
            />
            <text
              x={x + barW / 2}
              y={padB + chartH + 10}
              textAnchor="middle"
              fill="#2a1a0a"
              fontSize="5"
              fontFamily="Cormorant Garamond,serif"
              opacity="0.4"
            >
              {(sagaId.length > 5 ? sagaId.slice(0, 4) + '.' : sagaId).toUpperCase()}
            </text>
            <text
              x={x + barW / 2}
              y={y - 3}
              textAnchor="middle"
              fill="#2a1a0a"
              fontSize="6"
              fontFamily="Cormorant Garamond,serif"
              fontStyle="italic"
              opacity="0.35"
            >
              {count}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function InkPieChartSmall({ data }: { data: { name: string; count: number; id: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  const r = 65
  const cx = 80
  const cy = 85
  const segments = useMemo(() => {
    const segs: { name: string; id: string; start: number; end: number; color: string }[] = []
    let angle = -90
    for (const item of data.slice(0, 6)) {
      const deg = (item.count / total) * 360
      const planet = PLANETS.find((p) => p.id === item.id)
      segs.push({ name: item.name, id: item.id, start: angle, end: angle + deg, color: planet?.color ?? '#8a7a6a' })
      angle += deg
    }
    return segs
  }, [data, total])
  return (
    <svg viewBox="0 0 160 160" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {segments.map((seg) => {
        const sr = ((seg.start - 90) * Math.PI) / 180
        const er = ((seg.end - 90) * Math.PI) / 180
        const x1 = cx + r * Math.cos(sr)
        const y1 = cy + r * Math.sin(sr)
        const x2 = cx + r * Math.cos(er)
        const y2 = cy + r * Math.sin(er)
        const large = seg.end - seg.start > 180 ? 1 : 0
        const mid = ((seg.start + seg.end) / 2 - 90) * (Math.PI / 180)
        const lx = cx + (r + 14) * Math.cos(mid)
        const ly = cy + (r + 14) * Math.sin(mid)
        return (
          <g key={seg.id}>
            <path
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
              fill={seg.color}
              opacity="0.12"
              stroke="#2a1a0a"
              strokeWidth="0.3"
            />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              fill="#2a1a0a"
              fontSize="4"
              fontFamily="Cormorant Garamond,serif"
              opacity="0.3"
            >
              {seg.name}
            </text>
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r={24} fill="rgba(220,210,196,0.4)" stroke="#2a1a0a" strokeWidth="0.3" opacity="0.15" />
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        fill="#2a1a0a"
        fontSize="10"
        fontFamily="Playfair Display,serif"
        opacity="0.5"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 7}
        textAnchor="middle"
        fill="#5a4a3a"
        fontSize="4"
        fontFamily="Cormorant Garamond,serif"
        fontStyle="italic"
        opacity="0.3"
      >
        known
      </text>
    </svg>
  )
}

function InkTimelineSmall({ years, minY, maxY }: { years: number[]; minY: number; maxY: number }) {
  const padL = 24
  const chartW = 280
  const chartH = 60
  const lineY = chartH / 2
  return (
    <svg
      viewBox={`0 0 ${chartW + padL + 10} ${chartH + 10}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d={`M ${padL} ${lineY} Q ${padL + chartW / 4} ${lineY + 1} ${padL + chartW / 2} ${lineY} Q ${padL + (3 * chartW) / 4} ${lineY - 1} ${padL + chartW} ${lineY}`}
        fill="none"
        stroke="#2a1a0a"
        strokeWidth="0.3"
        opacity="0.12"
      />
      {years.map((year) => {
        const x = padL + ((year - minY) / (maxY - minY)) * chartW
        const booksThisYear = BOOKS.filter((b) => b.year === year)
        return (
          <g key={year}>
            <line x1={x} y1={lineY - 2} x2={x} y2={lineY + 2} stroke="#2a1a0a" strokeWidth="0.2" opacity="0.1" />
            <circle cx={x} cy={lineY} r={1.5} fill="#2a1a0a" opacity="0.15" />
            <text
              x={x}
              y={lineY - 5}
              textAnchor="middle"
              fill="#2a1a0a"
              fontSize="4"
              fontFamily="Cormorant Garamond,serif"
              opacity="0.3"
            >
              {year}
            </text>
            {booksThisYear.length > 0 && (
              <text
                x={x}
                y={lineY + 8}
                textAnchor="middle"
                fill="#5a4a3a"
                fontSize="3.5"
                fontFamily="Cormorant Garamond,serif"
                fontStyle="italic"
                opacity="0.2"
              >
                {booksThisYear.length > 1
                  ? `${booksThisYear.length}v`
                  : booksThisYear[0]!.title.length > 8
                    ? booksThisYear[0]!.title.slice(0, 6) + '\u2026'
                    : booksThisYear[0]!.title}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function ShardMatrixSmall() {
  const planetsWithShards = PLANETS.filter((p) => p.shard)
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {planetsWithShards.slice(0, 8).map((planet, row) => {
        const pShards = planet.shard!.split(/[,&]|\s+and\s+/).map((s) => s.trim())
        return (
          <g key={planet.id}>
            <text
              x={6}
              y={18 + row * 22}
              fill="#2a1a0a"
              fontSize="5"
              fontFamily="Cormorant Garamond,serif"
              opacity="0.35"
            >
              {planet.name.length > 8 ? planet.name.slice(0, 7) + '\u2026' : planet.name}
            </text>
            {pShards.map((s, ci) => (
              <text
                key={s}
                x={110 + ci * 35}
                y={18 + row * 22}
                fill="#2a1a0a"
                fontSize="5"
                opacity="0.2"
                fontFamily="Cormorant Garamond,serif"
              >
                {s.length > 6 ? s.slice(0, 5) + '\u2026' : s}
              </text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

function HeraldsRowSmall() {
  return (
    <svg viewBox="0 0 360 60" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {HONORBLADES.map((herald, i) => {
        const cx = 18 + i * 38
        return (
          <g key={herald.id}>
            <circle
              cx={cx}
              cy={30}
              r={12}
              fill={herald.color.replace(/\d+(\.\d+)?\)/, '0.1)')}
              stroke="#2a1a0a"
              strokeWidth="0.2"
              opacity="0.15"
            />
            <text
              x={cx}
              y={34}
              textAnchor="middle"
              fill="#2a1a0a"
              fontSize="6"
              fontFamily="Playfair Display,serif"
              opacity="0.3"
            >
              {herald.name[0]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function DiagramScene(props: {
  bookCountBySaga: [string, number][]
  charCountByPlanet: { name: string; count: number; id: string }[]
  totalWords: number
  bookCount: number
  charCount: number
  planetCount: number
  sagaCount: number
  eventCount: number
  heraldCount: number
  pubYears: number[]
  pubMin: number
  pubMax: number
  maxSagaCount: number
}) {
  const {
    bookCount,
    charCount,
    planetCount,
    sagaCount,
    eventCount,
    heraldCount,
    bookCountBySaga,
    charCountByPlanet,
    totalWords,
    pubYears,
    pubMin,
    pubMax,
    maxSagaCount,
  } = props
  const [focusedDoc, setFocusedDoc] = useState<string | null>(null)
  const [focusAnchor, setFocusAnchor] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  const handleDocClick = useCallback((id: string) => {
    setFocusedDoc((prev) => {
      const doc = prev === id ? null : id
      if (doc) {
        const d = WALL_DOCS.find((wd) => wd.id === doc)
        if (d) {
          setFocusAnchor({ x: d.x, y: d.y, w: d.w, h: d.h })
        }
      } else {
        setFocusAnchor(null)
      }
      return doc
    })
  }, [])

  const handleBackgroundClick = useCallback(() => {
    setFocusedDoc(null)
    setFocusAnchor(null)
  }, [])

  const ctx = {
    bookCount,
    charCount,
    planetCount,
    sagaCount,
    eventCount,
    heraldCount,
    bookCountBySaga,
    charCountByPlanet,
    totalWords,
    pubYears,
    pubMin,
    pubMax,
    maxSagaCount,
  }

  return (
    <DiagramCanvas
      focusAnchor={focusAnchor}
      onFocusChange={(a) => {
        setFocusAnchor(a)
        if (!a) setFocusedDoc(null)
      }}
    >
      <DiagramBackground />
      <DiagramWritings />

      <div onClick={handleBackgroundClick}>
        {/* Connector lines between docs */}
        <svg width={5000} height={5000} className="absolute inset-0 pointer-events-none" style={{ left: 0, top: 0 }}>
          {CONNECTOR_LINES.map((l, i) => (
            <g key={i}>
              <path
                d={`M ${l.x1} ${l.y1} Q ${(l.x1 + l.x2) / 2 + (i % 2 === 0 ? 120 : -100)} ${(l.y1 + l.y2) / 2 + (i === 1 ? 180 : -60)} ${l.x2} ${l.y2}`}
                fill="none"
                stroke="rgba(120,100,80,0.08)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d={`M ${l.x1} ${l.y1} Q ${(l.x1 + l.x2) / 2 + (i % 2 === 0 ? 120 : -100)} ${(l.y1 + l.y2) / 2 + (i === 1 ? 180 : -60)} ${l.x2} ${l.y2}`}
                fill="none"
                stroke="rgba(180,160,140,0.05)"
                strokeWidth="0.6"
                strokeLinecap="round"
                strokeDasharray="2 6"
              />
            </g>
          ))}
        </svg>

        {/* Central node */}
        <div
          className="absolute flex flex-col items-center pointer-events-none select-none"
          style={{ left: CX, top: CY, transform: 'translate(-50%, -50%)' }}
        >
          <CosmereSymbol />
          <div
            style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: 28,
              color: 'rgba(200,180,160,0.5)',
              letterSpacing: '0.25em',
              marginTop: 12,
              textShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}
          >
            THE DIAGRAM
          </div>
          <div
            style={{
              width: 160,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(160,140,120,0.15), transparent)',
              marginTop: 10,
            }}
          />
          <div
            style={{
              fontFamily: "'Cormorant Garamond', 'Georgia', serif",
              fontStyle: 'italic',
              fontSize: 12,
              color: 'rgba(140,120,100,0.25)',
              marginTop: 8,
            }}
          >
            An attempt to understand the Cosmere
          </div>
        </div>

        {/* Scattered documents */}
        {WALL_DOCS.map((d) => {
          const isFocused = focusedDoc === d.id
          return (
            <div
              key={d.id}
              style={{
                position: 'absolute',
                left: d.x,
                top: d.y,
                zIndex: isFocused ? 20 : d.z,
                transition: 'all 0.4s ease',
                filter: focusedDoc && !isFocused ? 'grayscale(0.7) opacity(0.4)' : undefined,
                transform: isFocused ? 'scale(1.05)' : undefined,
              }}
            >
              <PaperDoc id={d.id} w={d.w} h={d.h} rotation={d.rot} onClick={() => handleDocClick(d.id)}>
                {getContent(d.id, ctx)}
              </PaperDoc>
            </div>
          )
        })}

        {/* Focus annotation */}
        {focusedDoc && (
          <div
            className="absolute pointer-events-none"
            style={{
              fontFamily: "'Cormorant Garamond', 'Georgia', serif",
              fontStyle: 'italic',
              fontSize: 12,
              color: 'rgba(160,140,120,0.4)',
              left: 800,
              top: 300,
              transform: 'rotate(-1.5deg)',
            }}
          >
            {getFocusAnnotation(focusedDoc)}
          </div>
        )}

        {/* Footer */}
        <div
          className="absolute pointer-events-none select-none"
          style={{
            left: 2500,
            bottom: 40,
            transform: 'translateX(-50%)',
            fontFamily: "'Cormorant Garamond', 'Georgia', serif",
            fontSize: 9,
            color: 'rgba(100,80,60,0.12)',
            letterSpacing: '0.2em',
          }}
        >
          THE COSMERE ARCHIVE · KHRISS
        </div>
      </div>
    </DiagramCanvas>
  )
}

function getContent(
  id: string,
  ctx: {
    bookCount: number
    charCount: number
    planetCount: number
    sagaCount: number
    eventCount: number
    heraldCount: number
    bookCountBySaga: [string, number][]
    charCountByPlanet: { name: string; count: number; id: string }[]
    totalWords: number
    pubYears: number[]
    pubMin: number
    pubMax: number
    maxSagaCount: number
  },
) {
  const h = '100%'
  const p = 8
  switch (id) {
    case 'catalogue':
      return (
        <div style={{ padding: p, height: h, color: '#2a1a0a', fontSize: 7, fontFamily: 'Cormorant Garamond,serif' }}>
          <div style={{ fontSize: 11, fontFamily: 'Playfair Display,serif', letterSpacing: '0.08em', opacity: 0.7 }}>
            CATALOGUE
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
            {[
              { label: 'Books', value: ctx.bookCount },
              { label: 'Characters', value: ctx.charCount },
              { label: 'Planets', value: ctx.planetCount },
              { label: 'Sagas', value: ctx.sagaCount },
              { label: 'Events', value: ctx.eventCount },
              { label: 'Heralds', value: ctx.heraldCount },
            ].map((c) => (
              <div
                key={c.label}
                style={{
                  textAlign: 'center',
                  padding: '3px 6px',
                  border: '1px solid rgba(42,26,10,0.06)',
                  minWidth: 36,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontFamily: 'Playfair Display,serif',
                    lineHeight: 1,
                    color: '#2a1a0a',
                    opacity: 0.6,
                  }}
                >
                  {c.value}
                </div>
                <div style={{ fontSize: 5, opacity: 0.35 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      )
    case 'volumes':
      return (
        <div style={{ padding: p, height: h, display: 'flex', flexDirection: 'column', color: '#2a1a0a' }}>
          <div style={{ fontSize: 11, fontFamily: 'Playfair Display,serif', letterSpacing: '0.08em', opacity: 0.7 }}>
            VOLUMES BY CYCLE
          </div>
          <div
            style={{
              fontSize: 6,
              fontFamily: 'Cormorant Garamond,serif',
              fontStyle: 'italic',
              opacity: 0.3,
              marginTop: 2,
            }}
          >
            Per narrative cycle
          </div>
          <div style={{ flex: 1, marginTop: 4, minHeight: 0 }}>
            <InkBarChart data={ctx.bookCountBySaga} maxCount={ctx.maxSagaCount} />
          </div>
          <div style={{ fontSize: 5, textAlign: 'right', opacity: 0.2, marginTop: 3 }}>
            →{' '}
            <Link to="/books" style={{ textDecoration: 'underline', textUnderlineOffset: 1, color: 'inherit' }}>
              Browse
            </Link>
          </div>
        </div>
      )
    case 'wordcount':
      return (
        <div style={{ padding: p, height: h, display: 'flex', flexDirection: 'column', color: '#2a1a0a' }}>
          <div style={{ fontSize: 10, fontFamily: 'Playfair Display,serif', letterSpacing: '0.08em', opacity: 0.6 }}>
            LEXICON
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontFamily: 'Playfair Display,serif', opacity: 0.5 }}>
                {ctx.totalWords.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: 6,
                  fontFamily: 'Cormorant Garamond,serif',
                  fontStyle: 'italic',
                  marginTop: -2,
                  opacity: 0.25,
                }}
              >
                total words
              </div>
              <div
                style={{
                  width: 60,
                  height: 1,
                  margin: '4px auto 0',
                  background: 'linear-gradient(90deg, transparent, rgba(42,26,10,0.1), transparent)',
                }}
              />
              <div style={{ fontSize: 5, marginTop: 2, opacity: 0.2 }}>
                Avg. {Math.round(ctx.totalWords / ctx.bookCount).toLocaleString()} per vol.
              </div>
            </div>
          </div>
          <div style={{ fontSize: 5, textAlign: 'right', opacity: 0.2 }}>
            →{' '}
            <Link to="/library" style={{ textDecoration: 'underline', textUnderlineOffset: 1, color: 'inherit' }}>
              Collection
            </Link>
          </div>
        </div>
      )
    case 'population':
      return (
        <div style={{ padding: p, height: h, display: 'flex', flexDirection: 'column', color: '#2a1a0a' }}>
          <div style={{ fontSize: 11, fontFamily: 'Playfair Display,serif', letterSpacing: '0.08em', opacity: 0.7 }}>
            CENSUS
          </div>
          <div
            style={{
              fontSize: 6,
              fontFamily: 'Cormorant Garamond,serif',
              fontStyle: 'italic',
              opacity: 0.3,
              marginTop: 2,
            }}
          >
            Individuals by world
          </div>
          <div style={{ flex: 1, marginTop: 2, minHeight: 0 }}>
            <InkPieChartSmall data={ctx.charCountByPlanet.slice(0, 6)} />
          </div>
          <div style={{ fontSize: 5, textAlign: 'right', opacity: 0.2, marginTop: 2 }}>
            →{' '}
            <Link to="/characters" style={{ textDecoration: 'underline', textUnderlineOffset: 1, color: 'inherit' }}>
              Records
            </Link>
          </div>
        </div>
      )
    case 'worlds':
      return (
        <div style={{ padding: p, height: h, color: '#2a1a0a', fontSize: 6 }}>
          <div style={{ fontSize: 11, fontFamily: 'Playfair Display,serif', letterSpacing: '0.08em', opacity: 0.7 }}>
            WORLD RECORDS
          </div>
          <div style={{ marginTop: 4, overflowY: 'auto', maxHeight: 200 }}>
            {PLANETS.filter((p) => p.shard).map((planet) => {
              const pShards = planet.shard!.split(/[,&]|\s+and\s+/)
              return (
                <div
                  key={planet.id}
                  style={{ display: 'flex', gap: 4, paddingBottom: 3, borderBottom: '1px solid rgba(42,26,10,0.04)' }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      marginTop: 1,
                      flexShrink: 0,
                      backgroundColor: planet.color,
                      opacity: 0.25,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 7, fontWeight: 600 }}>{planet.name}</span>
                    <span style={{ fontSize: 5, fontStyle: 'italic', opacity: 0.3 }}> — {pShards.join(', ')}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    case 'shards':
      return (
        <div style={{ padding: p, height: h, display: 'flex', flexDirection: 'column', color: '#2a1a0a' }}>
          <div style={{ fontSize: 11, fontFamily: 'Playfair Display,serif', letterSpacing: '0.08em', opacity: 0.7 }}>
            SHARDS
          </div>
          <div
            style={{
              fontSize: 6,
              fontFamily: 'Cormorant Garamond,serif',
              fontStyle: 'italic',
              opacity: 0.3,
              marginTop: 2,
            }}
          >
            {SHARD_COUNT} shards · {PLANETS.filter((p) => p.shard).length} worlds
          </div>
          <div style={{ flex: 1, marginTop: 4, minHeight: 0 }}>
            <ShardMatrixSmall />
          </div>
          <div style={{ fontSize: 5, textAlign: 'right', opacity: 0.2 }}>
            →{' '}
            <Link to="/locations" style={{ textDecoration: 'underline', textUnderlineOffset: 1, color: 'inherit' }}>
              Atlas
            </Link>
          </div>
        </div>
      )
    case 'connections':
      return (
        <div style={{ padding: p, height: h, display: 'flex', flexDirection: 'column', color: '#2a1a0a' }}>
          <div style={{ fontSize: 11, fontFamily: 'Playfair Display,serif', letterSpacing: '0.08em', opacity: 0.7 }}>
            CONNECTIONS
          </div>
          <div
            style={{
              fontSize: 6,
              fontFamily: 'Cormorant Garamond,serif',
              fontStyle: 'italic',
              opacity: 0.3,
              marginTop: 2,
            }}
          >
            The scholar's understanding
          </div>
          <div style={{ flex: 1, marginTop: 4, minHeight: 0 }}>
            <svg viewBox="0 0 360 260" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              <circle
                cx="180"
                cy="130"
                r="78"
                fill="none"
                stroke="#2a1a0a"
                strokeWidth="0.3"
                opacity="0.08"
                strokeDasharray="2 4"
              />
              <circle cx="180" cy="130" r="56" fill="none" stroke="#2a1a0a" strokeWidth="0.2" opacity="0.06" />
              <circle
                cx="180"
                cy="130"
                r="24"
                fill="rgba(42,26,10,0.02)"
                stroke="#2a1a0a"
                strokeWidth="0.3"
                opacity="0.15"
              />
              <text
                x="180"
                y="128"
                textAnchor="middle"
                fill="#2a1a0a"
                fontSize="5"
                fontFamily="Playfair Display,serif"
                opacity="0.3"
              >
                Cosmere
              </text>
              <text
                x="180"
                y="137"
                textAnchor="middle"
                fill="#2a1a0a"
                fontSize="4"
                fontFamily="Cormorant Garamond,serif"
                fontStyle="italic"
                opacity="0.15"
              >
                Adonalsium
              </text>
              {[
                { x: 90, y: 80, label: 'Shards', note: '16' },
                { x: 280, y: 85, label: 'Investiture', note: '3 realms' },
                { x: 75, y: 200, label: 'Worldhopping', note: 'Connection' },
                { x: 290, y: 200, label: 'Realms', note: 'Physical\nCognitive\nSpiritual' },
              ].map((node, i) => (
                <g key={i}>
                  <path
                    d={`M 180 130 Q ${(180 + node.x) / 2 - 5 + i * 3} ${(130 + node.y) / 2 + (i % 2 === 0 ? -10 : 10)} ${node.x} ${node.y}`}
                    fill="none"
                    stroke="#2a1a0a"
                    strokeWidth="0.2"
                    opacity="0.1"
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={14}
                    fill="rgba(42,26,10,0.02)"
                    stroke="#2a1a0a"
                    strokeWidth="0.3"
                    opacity="0.12"
                  />
                  <text
                    x={node.x}
                    y={node.y + 1}
                    textAnchor="middle"
                    fill="#2a1a0a"
                    fontSize="4.5"
                    fontFamily="Cormorant Garamond,serif"
                    opacity="0.35"
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.x + 18}
                    y={node.y - 5}
                    textAnchor="start"
                    fill="#5a4a3a"
                    fontSize="3.5"
                    fontFamily="Cormorant Garamond,serif"
                    fontStyle="italic"
                    opacity="0.2"
                  >
                    {node.note}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )
    case 'chronology':
      return (
        <div style={{ padding: p, height: h, display: 'flex', flexDirection: 'column', color: '#2a1a0a' }}>
          <div style={{ fontSize: 11, fontFamily: 'Playfair Display,serif', letterSpacing: '0.08em', opacity: 0.7 }}>
            CHRONOLOGY
          </div>
          <div
            style={{
              fontSize: 6,
              fontFamily: 'Cormorant Garamond,serif',
              fontStyle: 'italic',
              opacity: 0.3,
              marginTop: 2,
            }}
          >
            {ctx.pubMin}\u2013{ctx.pubMax} · {ctx.pubYears.length} years
          </div>
          <div style={{ flex: 1, marginTop: 4, minHeight: 0 }}>
            <InkTimelineSmall years={ctx.pubYears} minY={ctx.pubMin} maxY={ctx.pubMax} />
          </div>
          <div style={{ fontSize: 5, textAlign: 'right', opacity: 0.2, marginTop: 3 }}>
            →{' '}
            <Link to="/timeline" style={{ textDecoration: 'underline', textUnderlineOffset: 1, color: 'inherit' }}>
              Full Timeline
            </Link>
          </div>
        </div>
      )
    case 'heralds':
      return (
        <div style={{ padding: p, height: h, display: 'flex', flexDirection: 'column', color: '#2a1a0a' }}>
          <div style={{ fontSize: 11, fontFamily: 'Playfair Display,serif', letterSpacing: '0.08em', opacity: 0.7 }}>
            AHARIETIAM
          </div>
          <div
            style={{
              fontSize: 6,
              fontFamily: 'Cormorant Garamond,serif',
              fontStyle: 'italic',
              opacity: 0.3,
              marginTop: 2,
            }}
          >
            The Oathpact · Roshar
          </div>
          <div style={{ flex: 1, marginTop: 4, minHeight: 0, display: 'flex', alignItems: 'center' }}>
            <HeraldsRowSmall />
          </div>
          <div style={{ fontSize: 5, textAlign: 'right', opacity: 0.2, marginTop: 2 }}>
            →{' '}
            <Link to="/aharietiam" style={{ textDecoration: 'underline', textUnderlineOffset: 1, color: 'inherit' }}>
              Archive
            </Link>
          </div>
        </div>
      )
    default:
      return null
  }
}

function getFocusAnnotation(id: string): string {
  const map: Record<string, string> = {
    catalogue: 'Initial catalogue count — records grow with each expedition into the Cosmere.',
    volumes: 'Distribution of volumes across narrative cycles. The Stormlight Archive dominates.',
    wordcount: 'Lexicon magnitude — total words catalogued across all known volumes.',
    population: 'Character distribution by planetary origin. Scadrial and Roshar show highest density.',
    worlds: 'Known worlds and their associated Shards. Each world bears the influence of its divine patron.',
    shards: 'Matrix of Shardic influence across worlds. Sixteen Shards, many worlds.',
    connections: 'Fundamental forces and their relationships. The scholar continues to refine this model.',
    chronology: 'Publication history — from Elantris (2005) to the present. The timeline expands.',
    heralds: 'The nine Honorblades of Aharietiam. Talenel\'s stands empty.',
  }
  return map[id] ?? 'Further investigation required.'
}
