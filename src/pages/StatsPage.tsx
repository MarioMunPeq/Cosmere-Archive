import { useMemo, useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BOOKS, PLANETS, SAGAS, ALL_CHARACTERS, SHARD_COLORS, SAGA_NAME_COLORS } from '@/data/static'
import { TIMELINE_EVENTS } from '@/data/static/timeline'
import { HERALDS } from '@/data/static/heralds'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { getStoneTexture } from '@/utils/textures'
import { WallDocument } from '@/components/stats/WallDocument'

// ─── Constants ───
const WALL_W = 3600
const WALL_H = 2400
const SHARD_COUNT = Object.keys(SHARD_COLORS).length
const SHARD_NAMES = Object.keys(SHARD_COLORS)
const SAGA_LIST = (SAGAS as { id: string; name: string; color: string; order: number; description?: string }[]).filter(
  (s) => s.id !== 'pre-cosmere',
)

// ─── Data Processing ───
function useStatsData() {
  const bookCountBySaga = useMemo(() => {
    const map = new Map<string, number>()
    const sagaOrder = new Map(SAGA_LIST.map((s, i) => [s.id, i]))
    for (const saga of SAGA_LIST) map.set(saga.id, 0)
    for (const book of BOOKS) map.set(book.saga, (map.get(book.saga) ?? 0) + 1)
    return Array.from(map.entries())
      .filter(([, c]) => c > 0)
      .sort(([a], [b]) => (sagaOrder.get(a) ?? 0) - (sagaOrder.get(b) ?? 0))
  }, [])

  const charCountByPlanet = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of ALL_CHARACTERS) map.set(c.planet, (map.get(c.planet) ?? 0) + 1)
    const pnames = new Map(PLANETS.map((p) => [p.id, p.name]))
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([id, count]) => ({ name: pnames.get(id) ?? id, count, id }))
  }, [])

  const totalWords = useMemo(() => BOOKS.reduce((sum, b) => sum + (b.wordCount ?? 0), 0), [])

  const bookCount = BOOKS.length
  const charCount = ALL_CHARACTERS.length
  const planetCount = PLANETS.length
  const sagaCount = SAGA_LIST.length
  const eventCount = TIMELINE_EVENTS.length
  const heraldCount = HERALDS.length

  const pubYears = useMemo(() => [...new Set(BOOKS.map((b) => b.year).filter((y): y is number => !!y))].sort(), [])
  const pubMin = pubYears[0] ?? 2005
  const pubMax = pubYears[pubYears.length - 1] ?? 2024

  const maxSagaCount = Math.max(...bookCountBySaga.map(([, c]) => c), 1)

  return {
    bookCountBySaga,
    charCountByPlanet,
    totalWords,
    bookCount,
    charCount,
    planetCount,
    sagaCount,
    eventCount,
    heraldCount,
    pubYears,
    pubMin,
    pubMax,
    maxSagaCount,
  }
}

// ─── Ink-style SVG Charts ───

function InkBarChart({ data, maxCount }: { data: [string, number][]; maxCount: number }) {
  const barW = 44
  const gap = 8
  const chartH = 200
  const padL = 28
  const padB = 36
  const totalW = data.length * (barW + gap) + padL
  return (
    <svg viewBox={`0 0 ${totalW} ${chartH + padB}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const yy = padB + chartH * (1 - frac)
        return (
          <g key={frac}>
            <line x1={padL} y1={yy} x2={totalW} y2={yy} stroke="#5a4a3a" strokeWidth="0.3" opacity="0.10" />
            {frac > 0 && (
              <text
                x={padL - 4}
                y={yy + 3}
                textAnchor="end"
                fill="#5a4a3a"
                fontSize="7"
                opacity="0.35"
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
        const saga = SAGA_LIST.find((s) => s.id === sagaId)
        const inkColor = SAGA_NAME_COLORS[sagaId as keyof typeof SAGA_NAME_COLORS] ?? '#8b7355'
        return (
          <g key={sagaId}>
            <rect x={x + 2} y={y + 2} width={barW - 4} height={barH - 2} fill={inkColor} opacity="0.25" rx="1" />
            <path
              d={`M ${x + 2} ${y + barH} L ${x + 2} ${y + 4} Q ${x + 1} ${y} ${x + 4} ${y} L ${x + barW - 4} ${y} Q ${x + barW - 2} ${y} ${x + barW - 2} ${y + 4} L ${x + barW - 2} ${y + barH}`}
              fill="none"
              stroke="#2a1a0a"
              strokeWidth="0.6"
              opacity="0.30"
            />
            <line x1={x + 4} y1={y + 8} x2={x + 10} y2={y + 12} stroke="#2a1a0a" strokeWidth="0.3" opacity="0.10" />
            <text
              x={x + barW / 2}
              y={padB + chartH + 14}
              textAnchor="middle"
              fill="#2a1a0a"
              fontSize="7"
              fontFamily="Cormorant Garamond,serif"
              opacity="0.55"
            >
              {saga?.name?.split(' ').slice(0, 2).join(' ') ?? sagaId}
            </text>
            <text
              x={x + barW / 2}
              y={y - 4}
              textAnchor="middle"
              fill="#2a1a0a"
              fontSize="8"
              fontFamily="Cormorant Garamond,serif"
              fontStyle="italic"
              opacity="0.45"
            >
              {count}
            </text>
          </g>
        )
      })}
      <text
        x={totalW - 4}
        y={chartH + padB - 2}
        textAnchor="end"
        fill="#5a4a3a"
        fontSize="6"
        fontStyle="italic"
        opacity="0.25"
        fontFamily="Cormorant Garamond,serif"
      >
        n = {data.reduce((s, [, c]) => s + c, 0)}
      </text>
    </svg>
  )
}

function InkPieChart({ data }: { data: { name: string; count: number; id: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  const r = 100
  const cx = 130
  const cy = 130
  const segs: { name: string; count: number; start: number; end: number }[] = []
  let angle = -90
  for (const item of data) {
    const pct = item.count / total
    const deg = pct * 360
    segs.push({ name: item.name, count: item.count, start: angle, end: angle + deg })
    angle += deg
  }
  return (
    <svg viewBox="0 0 260 260" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {segs.map((seg, i) => {
        const sr = ((seg.start - 90) * Math.PI) / 180
        const er = ((seg.end - 90) * Math.PI) / 180
        const x1 = cx + r * Math.cos(sr)
        const y1 = cy + r * Math.sin(sr)
        const x2 = cx + r * Math.cos(er)
        const y2 = cy + r * Math.sin(er)
        const large = seg.end - seg.start > 180 ? 1 : 0
        const mid = ((seg.start + seg.end) / 2 - 90) * (Math.PI / 180)
        const lx = cx + (r + 26) * Math.cos(mid)
        const ly = cy + (r + 26) * Math.sin(mid)
        const pct = Math.round((seg.count / total) * 100)
        const planet = PLANETS.find((p) => p.id === data[i]?.id)
        const col = planet?.color ?? '#8a7a6a'
        return (
          <g key={i}>
            <path
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
              fill={col}
              opacity="0.20"
              stroke="#2a1a0a"
              strokeWidth="0.4"
            />
            <line
              x1={cx + r * 1.04 * Math.cos(mid)}
              y1={cy + r * 1.04 * Math.sin(mid)}
              x2={lx}
              y2={ly}
              stroke="#2a1a0a"
              strokeWidth="0.3"
              opacity="0.15"
            />
            <text
              x={lx}
              y={ly - 3}
              textAnchor={mid > Math.PI / 2 || mid < -Math.PI / 2 ? 'end' : 'start'}
              fill="#2a1a0a"
              fontSize="6"
              fontFamily="Cormorant Garamond,serif"
              opacity="0.50"
            >
              {seg.name}
            </text>
            <text
              x={lx}
              y={ly + 6}
              textAnchor={mid > Math.PI / 2 || mid < -Math.PI / 2 ? 'end' : 'start'}
              fill="#5a4a3a"
              fontSize="5"
              fontFamily="Cormorant Garamond,serif"
              fontStyle="italic"
              opacity="0.35"
            >
              {pct}% ({seg.count})
            </text>
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r={40} fill="rgba(220,210,196,0.6)" stroke="#2a1a0a" strokeWidth="0.3" opacity="0.20" />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fill="#2a1a0a"
        fontSize="18"
        fontFamily="Playfair Display,serif"
        opacity="0.6"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fill="#5a4a3a"
        fontSize="6"
        fontFamily="Cormorant Garamond,serif"
        fontStyle="italic"
        opacity="0.4"
      >
        known
      </text>
    </svg>
  )
}

function InkTimeline({ years, minY, maxY }: { years: number[]; minY: number; maxY: number }) {
  const padL = 40
  const padR = 20
  const chartW = 600
  const chartH = 120
  const lineY = chartH / 2
  return (
    <svg
      viewBox={`0 0 ${chartW + padL + padR} ${chartH + 20}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d={`M ${padL} ${lineY} Q ${padL + chartW / 4} ${lineY + 2} ${padL + chartW / 2} ${lineY} Q ${padL + (3 * chartW) / 4} ${lineY - 2} ${padL + chartW} ${lineY}`}
        fill="none"
        stroke="#2a1a0a"
        strokeWidth="0.4"
        opacity="0.15"
      />
      {years.map((year) => {
        const x = padL + ((year - minY) / (maxY - minY)) * chartW
        const booksThisYear = BOOKS.filter((b) => b.year === year)
        const firstBook = booksThisYear[0]
        return (
          <g key={year}>
            <line x1={x} y1={lineY - 4} x2={x} y2={lineY + 4} stroke="#2a1a0a" strokeWidth="0.3" opacity="0.12" />
            <circle cx={x} cy={lineY} r={2.5} fill="#2a1a0a" opacity="0.20" />
            <text
              x={x}
              y={lineY - 8}
              textAnchor="middle"
              fill="#2a1a0a"
              fontSize="6"
              fontFamily="Cormorant Garamond,serif"
              opacity="0.40"
            >
              {year}
            </text>
            {firstBook && booksThisYear.length === 1 && (
              <text
                x={x}
                y={lineY + 14}
                textAnchor="middle"
                fill="#5a4a3a"
                fontSize="5"
                fontFamily="Cormorant Garamond,serif"
                fontStyle="italic"
                opacity="0.30"
              >
                {firstBook.title.length > 16 ? firstBook.title.slice(0, 14) + '…' : firstBook.title}
              </text>
            )}
            {booksThisYear.length > 1 && (
              <text
                x={x}
                y={lineY + 14}
                textAnchor="middle"
                fill="#5a4a3a"
                fontSize="5"
                fontFamily="Cormorant Garamond,serif"
                fontStyle="italic"
                opacity="0.30"
              >
                {booksThisYear.length} vol.
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function ShardMatrix() {
  const planetsWithShards = PLANETS.filter((p) => p.shard)
  const cellW = 30
  const cellH = 18
  const padL = 100
  const padT = 18
  return (
    <svg
      viewBox={`0 0 ${padL + SHARD_NAMES.length * cellW + 20} ${padT + planetsWithShards.length * cellH + 30}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {SHARD_NAMES.map((s, i) => (
        <text
          key={s}
          x={padL + i * cellW + cellW / 2}
          y={padT - 4}
          textAnchor="middle"
          fill="#2a1a0a"
          fontSize="5"
          fontFamily="Cormorant Garamond,serif"
          opacity="0.35"
          transform={`rotate(-45, ${padL + i * cellW + cellW / 2}, ${padT - 4})`}
        >
          {s.length > 7 ? s.slice(0, 5) : s}
        </text>
      ))}
      {planetsWithShards.map((planet, row) => {
        const pShards = planet.shard!.split(/[,&]|\s+and\s+/).map((s) => s.trim())
        return (
          <g key={planet.id}>
            <text
              x={padL - 6}
              y={padT + row * cellH + cellH / 2 + 1}
              textAnchor="end"
              fill="#2a1a0a"
              fontSize="6"
              fontFamily="Cormorant Garamond,serif"
              opacity="0.45"
            >
              {planet.name}
            </text>
            {SHARD_NAMES.map((s, col) => {
              const present = pShards.includes(s)
              const cx2 = padL + col * cellW + cellW / 2
              const cy2 = padT + row * cellH + cellH / 2
              return (
                <text
                  key={s}
                  x={cx2}
                  y={cy2 + 2}
                  textAnchor="middle"
                  fill={present ? '#2a1a0a' : '#5a4a3a'}
                  fontSize={present ? '7' : '4'}
                  opacity={present ? '0.35' : '0.12'}
                >
                  {present ? '◆' : '·'}
                </text>
              )
            })}
          </g>
        )
      })}
      <text
        x={padL + SHARD_NAMES.length * cellW - 10}
        y={padT + planetsWithShards.length * cellH + 16}
        textAnchor="end"
        fill="#5a4a3a"
        fontSize="5"
        fontStyle="italic"
        opacity="0.20"
        fontFamily="Cormorant Garamond,serif"
      >
        {SHARD_COUNT} shards · {planetsWithShards.length} worlds
      </text>
    </svg>
  )
}

function HeraldsInkGallery() {
  const r = 28
  const gap = 12
  const totalW = HERALDS.length * (r * 2 + gap) + gap
  const cy = 50
  return (
    <svg viewBox={`0 0 ${totalW} 120`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {HERALDS.map((herald, i) => {
        const cx2 = gap + i * (r * 2 + gap) + r
        return (
          <g key={herald.id}>
            <circle
              cx={cx2}
              cy={cy}
              r={r}
              fill={herald.color.replace(/\d+(\.\d+)?\)/, '0.15)')}
              stroke="#2a1a0a"
              strokeWidth="0.3"
              opacity="0.20"
            />
            <text
              x={cx2}
              y={cy + 4}
              textAnchor="middle"
              fill="#2a1a0a"
              fontSize="11"
              fontFamily="Playfair Display,serif"
              opacity="0.45"
            >
              {herald.name[0]}
            </text>
            <text
              x={cx2}
              y={cy + r + 12}
              textAnchor="middle"
              fill="#2a1a0a"
              fontSize="5"
              fontFamily="Cormorant Garamond,serif"
              opacity="0.40"
            >
              {herald.name}
            </text>
            <text
              x={cx2}
              y={cy + r + 20}
              textAnchor="middle"
              fill="#5a4a3a"
              fontSize="4"
              fontFamily="Cormorant Garamond,serif"
              fontStyle="italic"
              opacity="0.25"
            >
              {herald.title.length > 14 ? herald.title.slice(0, 12) + '…' : herald.title}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Taravangian-style Investigation Diagram ───
function TaravangianDiagram() {
  return (
    <svg viewBox="0 0 520 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Hand-drawn circles */}
      <circle
        cx="260"
        cy="200"
        r="120"
        fill="none"
        stroke="#2a1a0a"
        strokeWidth="0.4"
        opacity="0.10"
        strokeDasharray="2 4"
      />
      <circle cx="260" cy="200" r="90" fill="none" stroke="#2a1a0a" strokeWidth="0.3" opacity="0.08" />
      {/* Central Cosmere node */}
      <circle cx="260" cy="200" r="36" fill="rgba(42,26,10,0.03)" stroke="#2a1a0a" strokeWidth="0.5" opacity="0.20" />
      <text
        x="260"
        y="196"
        textAnchor="middle"
        fill="#2a1a0a"
        fontSize="7"
        fontFamily="Playfair Display,serif"
        opacity="0.35"
      >
        Cosmere
      </text>
      <text
        x="260"
        y="208"
        textAnchor="middle"
        fill="#2a1a0a"
        fontSize="5"
        fontFamily="Cormorant Garamond,serif"
        fontStyle="italic"
        opacity="0.20"
      >
        Adonalsium
      </text>

      {/* Orbiting concept nodes — hand-drawn positions */}
      {[
        { x: 120, y: 120, label: 'Shards', note: '16' },
        { x: 400, y: 130, label: 'Investiture', note: '3 realms' },
        { x: 100, y: 310, label: 'Worldhopping', note: 'Connection' },
        { x: 420, y: 310, label: 'Realms', note: 'Physical\nCognitive\nSpiritual' },
      ].map((node, i) => (
        <g key={i}>
          {/* Hand-drawn connection line with slight wobble */}
          <path
            d={`M 260 200 Q ${(260 + node.x) / 2 - 10 + i * 5} ${(200 + node.y) / 2 + (i % 2 === 0 ? -15 : 15)} ${node.x} ${node.y}`}
            fill="none"
            stroke="#2a1a0a"
            strokeWidth="0.3"
            opacity="0.12"
          />
          <circle
            cx={node.x}
            cy={node.y}
            r={22}
            fill="rgba(42,26,10,0.03)"
            stroke="#2a1a0a"
            strokeWidth="0.4"
            opacity="0.15"
          />
          <text
            x={node.x}
            y={node.y + 2}
            textAnchor="middle"
            fill="#2a1a0a"
            fontSize="6"
            fontFamily="Cormorant Garamond,serif"
            opacity="0.40"
          >
            {node.label}
          </text>
          {/* Annotation floating near node */}
          <text
            x={node.x + 26}
            y={node.y - 8}
            textAnchor="start"
            fill="#5a4a3a"
            fontSize="4"
            fontFamily="Cormorant Garamond,serif"
            fontStyle="italic"
            opacity="0.25"
          >
            {node.note}
          </text>
        </g>
      ))}

      {/* Crossed-out note — like a scholar's correction */}
      <text
        x="50"
        y="80"
        fill="#2a1a0a"
        fontSize="4"
        fontFamily="Cormorant Garamond,serif"
        fontStyle="italic"
        opacity="0.15"
        textDecoration="line-through"
      >
        origin: Yolen (unconfirmed)
      </text>
      <text
        x="50"
        y="80"
        fill="#2a1a0a"
        fontSize="4"
        fontFamily="Cormorant Garamond,serif"
        fontStyle="italic"
        opacity="0.20"
      >
        origin: unknown
      </text>
      <line x1="48" y1="76" x2="130" y2="76" stroke="#2a1a0a" strokeWidth="0.3" opacity="0.10" />

      {/* Margin annotations */}
      <text
        x="440"
        y="60"
        fill="#5a4a3a"
        fontSize="4"
        fontFamily="Cormorant Garamond,serif"
        fontStyle="italic"
        opacity="0.20"
        transform="rotate(12, 440, 60)"
      >
        see also: Dragonsteel
      </text>
      <text
        x="20"
        y="350"
        fill="#5a4a3a"
        fontSize="4"
        fontFamily="Cormorant Garamond,serif"
        fontStyle="italic"
        opacity="0.18"
        transform="rotate(-8, 20, 350)"
      >
        connected via Spiritual Realm
      </text>

      {/* Small hand-drawn arrow */}
      <path d="M 155 155 L 162 148 L 158 153 L 165 150" fill="none" stroke="#2a1a0a" strokeWidth="0.4" opacity="0.10" />

      {/* Investigative question */}
      <text
        x="260"
        y="380"
        textAnchor="middle"
        fill="#5a4a3a"
        fontSize="5"
        fontFamily="Cormorant Garamond,serif"
        fontStyle="italic"
        opacity="0.15"
      >
        How do the shards maintain Separation?
      </text>
    </svg>
  )
}

// ─── Dust Particles ───
function DustParticles() {
  const seeds = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: (i * 137.5 + 42) % 100,
        top: (i * 89.3 + 13) % 100,
        delay: (i * 1.7) % 6,
        dur: 18 + ((i * 2.3) % 12),
        size: 1.5 + (i % 3) * 0.8,
        opacity: 0.08 + (i % 4) * 0.03,
      })),
    [],
  )
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 50 }}>
      {seeds.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: 'rgba(200,190,176,0.5)',
            animation: `dust-float ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Wall Layout Definition ───
interface WallItem {
  id: string
  x: number
  y: number
  w: number
  h: number
  rot: number
  connections: string[]
}

const WALL_ITEMS: WallItem[] = [
  { id: 'catalogue', x: 620, y: 18, w: 680, h: 200, rot: 0.8, connections: ['volumes', 'census', 'worlds'] },
  { id: 'note', x: 1420, y: 22, w: 460, h: 170, rot: -1.2, connections: ['catalogue'] },
  { id: 'stamp', x: 2060, y: 30, w: 340, h: 150, rot: 2.2, connections: [] },
  { id: 'worlds', x: 30, y: 310, w: 640, h: 540, rot: 0.5, connections: ['volumes', 'shards', 'catalogue'] },
  {
    id: 'volumes',
    x: 760,
    y: 290,
    w: 760,
    h: 540,
    rot: -0.4,
    connections: ['catalogue', 'census', 'worlds', 'wordcount', 'chronology'],
  },
  { id: 'census', x: 1640, y: 330, w: 620, h: 530, rot: 1.2, connections: ['catalogue', 'volumes', 'connections'] },
  { id: 'connections', x: 2400, y: 310, w: 580, h: 560, rot: -0.8, connections: ['census', 'heralds'] },
  { id: 'chronology', x: 30, y: 1010, w: 720, h: 470, rot: -0.6, connections: ['volumes', 'shards', 'wordcount'] },
  { id: 'wordcount', x: 860, y: 980, w: 620, h: 420, rot: 0.9, connections: ['volumes', 'chronology', 'catalogue'] },
  { id: 'shards', x: 1600, y: 1030, w: 660, h: 440, rot: -1.1, connections: ['worlds', 'chronology', 'heralds'] },
  { id: 'heralds', x: 2400, y: 1000, w: 700, h: 500, rot: 0.3, connections: ['shards', 'connections'] },
]

function getItemCenter(item: WallItem) {
  return { x: item.x + item.w / 2, y: item.y + item.h / 2 }
}

// ─── Main Component ───
export default function StatsPage() {
  useSEOMeta({
    title: 'Stats — Cosmere Archive',
    description: 'Statistics and data visualizations about the Cosmere universe',
  })

  const {
    bookCountBySaga,
    charCountByPlanet,
    totalWords,
    bookCount,
    charCount,
    planetCount,
    sagaCount,
    eventCount,
    heraldCount,
    pubYears,
    pubMin,
    pubMax,
    maxSagaCount,
  } = useStatsData()

  const stoneUrl = useMemo(() => {
    if (typeof document === 'undefined') return ''
    return getStoneTexture()
  }, [])

  // ─── Inertial Camera ───
  const [targetX, setTargetX] = useState(WALL_W / 2)
  const [targetY, setTargetY] = useState(WALL_H / 2)
  const [targetZoom, setTargetZoom] = useState(0.42)
  const [dispX, setDispX] = useState(WALL_W / 2)
  const [dispY, setDispY] = useState(WALL_H / 2)
  const [dispZoom, setDispZoom] = useState(0.42)
  const [isFocused, setIsFocused] = useState<string | null>(null)

  // Cinematic entrance: start slightly wider, drift to default
  const entRef = useRef(true)
  useEffect(() => {
    if (!entRef.current) return
    entRef.current = false
    setTargetZoom(0.38)
    setTimeout(() => setTargetZoom(0.42), 800)
  }, [])

  // RAF lerp loop
  const xRef = useRef(WALL_W / 2)
  const yRef = useRef(WALL_H / 2)
  const zRef = useRef(0.42)
  useEffect(() => {
    let raf: number
    const loop = () => {
      xRef.current += (targetX - xRef.current) * 0.045
      yRef.current += (targetY - yRef.current) * 0.045
      zRef.current += (targetZoom - zRef.current) * 0.045
      setDispX(xRef.current)
      setDispY(yRef.current)
      setDispZoom(zRef.current)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [targetX, targetY, targetZoom])

  const dragRef = useRef<{ active: boolean; sx: number; sy: number; stx: number; sty: number; moved: boolean }>({
    active: false,
    sx: 0,
    sy: 0,
    stx: 0,
    sty: 0,
    moved: false,
  })
  const dragMovedRef = useRef(false)

  const focusDoc = (docId: string | null, docX?: number, docY?: number) => {
    if (docId && docX !== undefined && docY !== undefined) {
      setTargetX(docX)
      setTargetY(docY)
      setTargetZoom(0.75)
      setIsFocused(docId)
    } else {
      setTargetX(WALL_W / 2)
      setTargetY(WALL_H / 2)
      setTargetZoom(0.42)
      setIsFocused(null)
    }
  }

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const handleDocClick = (item: WallItem) => {
    const c = getItemCenter(item)
    if (isFocused === item.id) {
      focusDoc(null)
    } else {
      focusDoc(item.id, c.x, c.y)
    }
  }

  const handleWallClick = () => {
    if (dragMovedRef.current) return
    focusDoc(null)
  }

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080

  const transform = useMemo(() => {
    const tx = vw / 2 - dispX * dispZoom
    const ty = vh / 2 - dispY * dispZoom
    return `translate(${tx}px, ${ty}px) scale(${dispZoom})`
  }, [dispX, dispY, dispZoom, vw, vh])

  const [interacting, setInteracting] = useState(false)

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#1a1612] select-none">
      {/* Stone wall surface with 3D block depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            /* Block top-edge highlight */
            repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, transparent 2px, transparent 200px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 2px, transparent 140px),
            /* Block bottom-edge shadow */
            repeating-linear-gradient(0deg, transparent 0px, transparent 136px, rgba(0,0,0,0.04) 137px, transparent 140px),
            repeating-linear-gradient(90deg, transparent 0px, transparent 196px, rgba(0,0,0,0.03) 197px, transparent 200px),
            /* Mortar lines */
            repeating-linear-gradient(90deg, transparent 0px, transparent 198px, rgba(60,50,40,0.12) 198px, rgba(60,50,40,0.10) 200px),
            repeating-linear-gradient(0deg, transparent 0px, transparent 138px, rgba(60,50,40,0.12) 138px, rgba(60,50,40,0.10) 140px),
            /* Base stone texture */
            url(${stoneUrl})
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '1024px 1024px',
        }}
      />
      {/* Room ambience — darker edges with depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 65% 55% at 50% 40%, transparent 0%, rgba(0,0,0,0.18) 100%),
            linear-gradient(180deg, rgba(0,0,0,0.12) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.08) 100%),
            linear-gradient(90deg, rgba(0,0,0,0.06) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.06) 100%)
          `,
        }}
      />
      {/* Stormlight ambient glow from upper right — very subtle, room-filling */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 55% 45% at 70% 12%, rgba(168,216,234,0.025) 0%, transparent 55%)',
        }}
      />

      {/* Wall interaction layer */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => {
          setInteracting(true)
          dragRef.current = { active: true, sx: e.clientX, sy: e.clientY, stx: targetX, sty: targetY, moved: false }
          dragMovedRef.current = false
        }}
        onMouseMove={(e) => {
          const d = dragRef.current
          if (!d.active) return
          const dx = e.clientX - d.sx
          const dy = e.clientY - d.sy
          if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
            d.moved = true
            dragMovedRef.current = true
          }
          if (d.moved) {
            setTargetX(d.stx - dx / targetZoom)
            setTargetY(d.sty - dy / targetZoom)
          }
        }}
        onMouseUp={() => {
          dragRef.current.active = false
          setInteracting(false)
        }}
        onMouseLeave={() => {
          dragRef.current.active = false
          setInteracting(false)
        }}
        onWheel={(e) => {
          e.preventDefault()
          setTargetZoom((z) => Math.max(0.18, Math.min(2.5, z * (e.deltaY > 0 ? 0.92 : 1.08))))
        }}
        onClick={handleWallClick}
      >
        {/* Camera container — physical transform with inertia */}
        <div
          className="absolute top-0 left-0"
          style={{
            width: WALL_W,
            height: WALL_H,
            transform,
            transformOrigin: '0 0',
            transition: interacting ? 'none' : 'none',
          }}
        >
          {/* ── Connecting Threads SVG ── */}
          <svg className="absolute inset-0 pointer-events-none" width={WALL_W} height={WALL_H} style={{ zIndex: 0 }}>
            {WALL_ITEMS.flatMap((item) =>
              item.connections.map((targetId) => {
                const target = WALL_ITEMS.find((i) => i.id === targetId)
                if (!target) return null
                const from = getItemCenter(item)
                const to = getItemCenter(target)
                const mx = (from.x + to.x) / 2
                const my = (from.y + to.y) / 2 - 40
                return (
                  <path
                    key={`${item.id}-${targetId}`}
                    d={`M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`}
                    fill="none"
                    stroke="#5a4a3a"
                    strokeWidth="0.4"
                    opacity="0.10"
                    strokeDasharray="2 3"
                  />
                )
              }),
            )}
          </svg>

          {/* ── Carved Main Title (on wall) ── */}
          <div className="absolute pointer-events-none" style={{ left: 40, top: 40, width: 520, zIndex: 1 }}>
            <div
              className="text-[#3a2a1a]"
              style={{ textShadow: '0 1px 0 rgba(255,255,255,0.06), 0 -1px 1px rgba(0,0,0,0.08)' }}
            >
              <div
                className="text-[9px] font-[Cormorant_Garamond,serif] italic tracking-[0.15em]"
                style={{ opacity: 0.35 }}
              >
                ARCHIVE CHAMBER · URITHIRU
              </div>
              <h2 className="mt-2 text-[28px] font-[Playfair_Display,serif] tracking-[0.04em] leading-tight">
                The Cosmere Archive
              </h2>
              <div
                className="mt-3 w-24 h-px"
                style={{ background: 'linear-gradient(90deg, rgba(58,42,26,0.3), transparent)' }}
              />
              <div
                className="mt-2 text-[10px] font-[Cormorant_Garamond,serif] italic leading-relaxed"
                style={{ opacity: 0.45 }}
              >
                A collation of known worlds, their peoples, and the forces that shape them.
              </div>
              <div className="mt-1 text-[8px] font-[Cormorant_Garamond,serif]" style={{ opacity: 0.3 }}>
                {bookCount} volumes · {charCount} individuals · {SHARD_COUNT} divine forces
              </div>
            </div>
          </div>

          {/* ── Back to map ── */}
          <div className="absolute pointer-events-auto" style={{ left: 3000, top: 18, zIndex: 50 }}>
            <Link
              to="/"
              className="text-[9px] font-[Cormorant_Garamond,serif] italic text-[#5a4a3a] tracking-wider hover:text-[#3a2a1a] transition-colors"
              style={{ opacity: 0.35 }}
            >
              ← Back to map
            </Link>
          </div>

          {/* ── Documents ── */}
          <WallDocument
            id="catalogue"
            x={620}
            y={18}
            w={680}
            h={200}
            rotation={0.8}
            isFocused={isFocused === 'catalogue'}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              handleDocClick(WALL_ITEMS[0]!)
            }}
          >
            <div className="text-[#2a1a0a]">
              <div className="text-[14px] font-[Playfair_Display,serif] tracking-[0.08em]" style={{ opacity: 0.8 }}>
                CATALOGUE SUMMARY
              </div>
              <div className="mt-1 text-[8px] font-[Cormorant_Garamond,serif] italic" style={{ opacity: 0.4 }}>
                Materials catalogued within the archive to date.
              </div>
              <div className="mt-2.5 flex gap-1.5 flex-wrap">
                {(
                  [
                    { label: 'Books', value: bookCount },
                    { label: 'Characters', value: charCount },
                    { label: 'Planets', value: planetCount },
                    { label: 'Shards', value: SHARD_COUNT },
                    { label: 'Sagas', value: sagaCount },
                    { label: 'Events', value: eventCount },
                    { label: 'Heralds', value: heraldCount },
                  ] as const
                ).map((card) => (
                  <div
                    key={card.label}
                    className="text-center px-2.5 py-1.5"
                    style={{ border: '1px solid rgba(42,26,10,0.08)', minWidth: 50 }}
                  >
                    <div className="text-[18px] font-[Playfair_Display,serif] leading-none text-[#2a1a0a]">
                      {card.value}
                    </div>
                    <div className="text-[7px] font-[Cormorant_Garamond,serif] italic mt-0.5" style={{ opacity: 0.45 }}>
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="mt-2 pt-1.5 text-[7px] font-[Cormorant_Garamond,serif] italic"
                style={{ opacity: 0.3, borderTop: '1px solid rgba(42,26,10,0.06)' }}
              >
                NB: Records incomplete. Many worlds remain uncharted.
              </div>
            </div>
          </WallDocument>

          <WallDocument
            id="note"
            x={1420}
            y={22}
            w={460}
            h={170}
            rotation={-1.2}
            pinAt="topleft"
            isFocused={isFocused === 'note'}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              handleDocClick(WALL_ITEMS[1]!)
            }}
          >
            <div className="text-[#2a1a0a]">
              <div className="text-[10px] font-[Cormorant_Garamond,serif] italic" style={{ opacity: 0.4 }}>
                Archivist's Note
              </div>
              <div
                className="mt-2 text-[8px] font-[Cormorant_Garamond,serif] italic leading-relaxed"
                style={{ opacity: 0.55 }}
              >
                "This chamber holds the collected knowledge of the Cosmere — worlds known and unknown, powers measured
                and surmised."
              </div>
              <div className="mt-2 text-[7px] text-right font-[Cormorant_Garamond,serif]" style={{ opacity: 0.3 }}>
                — Khriss, 2024
              </div>
            </div>
          </WallDocument>

          <WallDocument
            id="stamp"
            x={2060}
            y={30}
            w={340}
            h={150}
            rotation={2.2}
            taped
            isFocused={isFocused === 'stamp'}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              handleDocClick(WALL_ITEMS[2]!)
            }}
          >
            <div className="flex items-center justify-center h-full text-center text-[#2a1a0a]">
              <div>
                <div className="text-[20px] font-[Playfair_Display,serif] tracking-[0.12em]" style={{ opacity: 0.25 }}>
                  URITHIRU
                </div>
                <div
                  className="text-[7px] font-[Cormorant_Garamond,serif] italic tracking-[0.25em] uppercase mt-1"
                  style={{ opacity: 0.2 }}
                >
                  Archive Chamber
                </div>
                <div
                  className="mt-2 mx-auto w-16 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(42,26,10,0.15), transparent)' }}
                />
                <div className="mt-1.5 text-[6px] font-[Cormorant_Garamond,serif]" style={{ opacity: 0.15 }}>
                  Authorised Record
                </div>
              </div>
            </div>
          </WallDocument>

          <WallDocument
            id="worlds"
            x={30}
            y={310}
            w={640}
            h={540}
            rotation={0.5}
            isFocused={isFocused === 'worlds'}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              handleDocClick(WALL_ITEMS[3]!)
            }}
          >
            <div className="text-[#2a1a0a]">
              <div className="text-[14px] font-[Playfair_Display,serif] tracking-[0.08em]" style={{ opacity: 0.8 }}>
                WORLD RECORDS
              </div>
              <div className="mt-1 text-[8px] font-[Cormorant_Garamond,serif] italic" style={{ opacity: 0.4 }}>
                Known planets and their divine associations.
              </div>
              <div className="mt-2.5 space-y-2 overflow-y-auto" style={{ maxHeight: 420 }}>
                {PLANETS.filter((p) => p.shard).map((planet) => {
                  const pShards = planet.shard!.split(/[,&]|\s+and\s+/).map((s) => s.trim())
                  return (
                    <div
                      key={planet.id}
                      className="flex items-start gap-2 pb-2"
                      style={{ borderBottom: '1px solid rgba(42,26,10,0.05)' }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0"
                        style={{ backgroundColor: planet.color, opacity: 0.3 }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-[Cormorant_Garamond,serif] font-semibold">{planet.name}</div>
                        <div className="text-[7px] font-[Cormorant_Garamond,serif] italic" style={{ opacity: 0.35 }}>
                          {pShards.length === 1 ? 'Shard: ' : 'Shards: '}
                          {pShards.join(', ')}
                        </div>
                      </div>
                      <div className="text-[12px] font-[Playfair_Display,serif]" style={{ opacity: 0.18 }}>
                        {charCountByPlanet.find((c) => c.id === planet.id)?.count ?? '-'}
                      </div>
                    </div>
                  )
                })}
                {PLANETS.filter((p) => !p.shard).length > 0 && (
                  <div className="text-[8px] font-[Cormorant_Garamond,serif] italic pt-1" style={{ opacity: 0.3 }}>
                    Unaffiliated worlds:
                  </div>
                )}
                {PLANETS.filter((p) => !p.shard).map((planet) => (
                  <div
                    key={planet.id}
                    className="flex items-center gap-2 pb-1"
                    style={{ borderBottom: '1px solid rgba(42,26,10,0.03)' }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-0 shrink-0"
                      style={{ backgroundColor: planet.color, opacity: 0.18 }}
                    />
                    <span className="text-[8px] font-[Cormorant_Garamond,serif]" style={{ opacity: 0.35 }}>
                      {planet.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </WallDocument>

          <WallDocument
            id="volumes"
            x={760}
            y={290}
            w={760}
            h={540}
            rotation={-0.4}
            isFocused={isFocused === 'volumes'}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              handleDocClick(WALL_ITEMS[4]!)
            }}
          >
            <div className="text-[#2a1a0a] flex flex-col h-full">
              <div className="text-[14px] font-[Playfair_Display,serif] tracking-[0.08em]" style={{ opacity: 0.8 }}>
                VOLUMES BY CYCLE
              </div>
              <div className="mt-1 text-[8px] font-[Cormorant_Garamond,serif] italic" style={{ opacity: 0.4 }}>
                Recorded volumes grouped by narrative cycle.
              </div>
              <div className="flex-1 mt-2 min-h-0">
                <InkBarChart data={bookCountBySaga} maxCount={maxSagaCount} />
              </div>
              <div
                className="mt-1.5 pt-1.5 text-[7px] font-[Cormorant_Garamond,serif] italic text-right"
                style={{ opacity: 0.25, borderTop: '1px solid rgba(42,26,10,0.05)' }}
              >
                →{' '}
                <Link to="/books" className="underline underline-offset-1 hover:opacity-80">
                  Browse full catalogue
                </Link>
              </div>
            </div>
          </WallDocument>

          <WallDocument
            id="census"
            x={1640}
            y={330}
            w={620}
            h={530}
            rotation={1.2}
            isFocused={isFocused === 'census'}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              handleDocClick(WALL_ITEMS[5]!)
            }}
          >
            <div className="text-[#2a1a0a] flex flex-col h-full">
              <div className="text-[14px] font-[Playfair_Display,serif] tracking-[0.08em]" style={{ opacity: 0.8 }}>
                POPULATION CENSUS
              </div>
              <div className="mt-1 text-[8px] font-[Cormorant_Garamond,serif] italic" style={{ opacity: 0.4 }}>
                Known individuals by world.
              </div>
              <div className="flex-1 mt-1 min-h-0 flex items-center justify-center">
                <InkPieChart data={charCountByPlanet.slice(0, 8)} />
              </div>
              <div
                className="mt-1 pt-1.5 text-[7px] font-[Cormorant_Garamond,serif] italic text-right"
                style={{ opacity: 0.25, borderTop: '1px solid rgba(42,26,10,0.05)' }}
              >
                →{' '}
                <Link to="/characters" className="underline underline-offset-1 hover:opacity-80">
                  Individual Records
                </Link>{' '}
                ·{' '}
                <Link to="/locations" className="underline underline-offset-1 hover:opacity-80">
                  World Atlas
                </Link>
              </div>
            </div>
          </WallDocument>

          {/* Taravangian investigation diagram — the centerpiece */}
          <WallDocument
            id="connections"
            x={2400}
            y={310}
            w={580}
            h={560}
            rotation={-0.8}
            isFocused={isFocused === 'connections'}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              handleDocClick(WALL_ITEMS[6]!)
            }}
          >
            <div className="text-[#2a1a0a] flex flex-col h-full">
              <div className="text-[14px] font-[Playfair_Display,serif] tracking-[0.08em]" style={{ opacity: 0.8 }}>
                COSMERE CONNECTIONS
              </div>
              <div className="mt-1 text-[8px] font-[Cormorant_Garamond,serif] italic" style={{ opacity: 0.4 }}>
                The scholar's diagram — relationships between fundamental forces.
              </div>
              <div className="flex-1 mt-2 min-h-0">
                <TaravangianDiagram />
              </div>
            </div>
          </WallDocument>

          <WallDocument
            id="chronology"
            x={30}
            y={1010}
            w={720}
            h={470}
            rotation={-0.6}
            pinAt="topleft"
            isFocused={isFocused === 'chronology'}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              handleDocClick(WALL_ITEMS[7]!)
            }}
          >
            <div className="text-[#2a1a0a] flex flex-col h-full">
              <div className="text-[14px] font-[Playfair_Display,serif] tracking-[0.08em]" style={{ opacity: 0.8 }}>
                PUBLICATION CHRONOLOGY
              </div>
              <div className="mt-1 text-[8px] font-[Cormorant_Garamond,serif] italic" style={{ opacity: 0.4 }}>
                {pubMin}–{pubMax} · {pubYears.length} years
              </div>
              <div className="flex-1 mt-2 min-h-0">
                <InkTimeline years={pubYears} minY={pubMin} maxY={pubMax} />
              </div>
              <div
                className="mt-1 pt-1.5 text-[7px] font-[Cormorant_Garamond,serif] italic text-right"
                style={{ opacity: 0.25, borderTop: '1px solid rgba(42,26,10,0.05)' }}
              >
                →{' '}
                <Link to="/timeline" className="underline underline-offset-1 hover:opacity-80">
                  Complete Cosmere Timeline
                </Link>
              </div>
            </div>
          </WallDocument>

          <WallDocument
            id="wordcount"
            x={860}
            y={980}
            w={620}
            h={420}
            rotation={0.9}
            taped
            isFocused={isFocused === 'wordcount'}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              handleDocClick(WALL_ITEMS[8]!)
            }}
          >
            <div className="text-[#2a1a0a] flex flex-col h-full">
              <div className="text-[14px] font-[Playfair_Display,serif] tracking-[0.08em]" style={{ opacity: 0.8 }}>
                LEXICON VOLUMES
              </div>
              <div className="mt-1 text-[8px] font-[Cormorant_Garamond,serif] italic" style={{ opacity: 0.4 }}>
                Total words recorded across {bookCount} catalogued volumes.
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[36px] font-[Playfair_Display,serif] text-[#2a1a0a]" style={{ opacity: 0.65 }}>
                    {totalWords.toLocaleString()}
                  </div>
                  <div className="text-[8px] font-[Cormorant_Garamond,serif] italic -mt-1" style={{ opacity: 0.3 }}>
                    total words
                  </div>
                  <div
                    className="mt-3 mx-auto w-32 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(42,26,10,0.12), transparent)' }}
                  />
                  <div className="mt-2 text-[7px] font-[Cormorant_Garamond,serif]" style={{ opacity: 0.25 }}>
                    Avg. {Math.round(totalWords / bookCount).toLocaleString()} per volume
                  </div>
                </div>
              </div>
              <div
                className="mt-1 pt-1.5 text-[7px] font-[Cormorant_Garamond,serif] italic text-right"
                style={{ opacity: 0.25, borderTop: '1px solid rgba(42,26,10,0.05)' }}
              >
                →{' '}
                <Link to="/library" className="underline underline-offset-1 hover:opacity-80">
                  Full collection
                </Link>
              </div>
            </div>
          </WallDocument>

          <WallDocument
            id="shards"
            x={1600}
            y={1030}
            w={660}
            h={440}
            rotation={-1.1}
            isFocused={isFocused === 'shards'}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              handleDocClick(WALL_ITEMS[9]!)
            }}
          >
            <div className="text-[#2a1a0a] flex flex-col h-full">
              <div className="text-[14px] font-[Playfair_Display,serif] tracking-[0.08em]" style={{ opacity: 0.8 }}>
                SHARDIC DISTRIBUTION
              </div>
              <div className="mt-1 text-[8px] font-[Cormorant_Garamond,serif] italic" style={{ opacity: 0.4 }}>
                {SHARD_COUNT} shards across {PLANETS.filter((p) => p.shard).length} worlds
              </div>
              <div className="flex-1 mt-2 min-h-0">
                <ShardMatrix />
              </div>
              <div
                className="mt-1 pt-1.5 text-[7px] font-[Cormorant_Garamond,serif] italic text-right"
                style={{ opacity: 0.25, borderTop: '1px solid rgba(42,26,10,0.05)' }}
              >
                →{' '}
                <Link to="/locations" className="underline underline-offset-1 hover:opacity-80">
                  World Index
                </Link>
              </div>
            </div>
          </WallDocument>

          <WallDocument
            id="heralds"
            x={2400}
            y={1000}
            w={700}
            h={500}
            rotation={0.3}
            isFocused={isFocused === 'heralds'}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              handleDocClick(WALL_ITEMS[10]!)
            }}
          >
            <div className="text-[#2a1a0a] flex flex-col h-full">
              <div className="text-[14px] font-[Playfair_Display,serif] tracking-[0.08em]" style={{ opacity: 0.8 }}>
                THE HERALDS OF THE ALMIGHTY
              </div>
              <div className="mt-1 text-[8px] font-[Cormorant_Garamond,serif] italic" style={{ opacity: 0.4 }}>
                The Oathpact — Roshar
              </div>
              <div className="flex-1 mt-2 min-h-0 flex items-center justify-center">
                <HeraldsInkGallery />
              </div>
              <div
                className="mt-1 pt-1.5 text-[7px] font-[Cormorant_Garamond,serif] italic text-right"
                style={{ opacity: 0.25, borderTop: '1px solid rgba(42,26,10,0.05)' }}
              >
                →{' '}
                <Link to="/heralds" className="underline underline-offset-1 hover:opacity-80">
                  Full Archive
                </Link>
              </div>
            </div>
          </WallDocument>

          {/* ── Colophon — carved into wall ── */}
          <div className="absolute pointer-events-none" style={{ left: 1300, top: 1690, width: 400, zIndex: 1 }}>
            <div className="text-center">
              <div
                className="w-32 mx-auto h-px mb-2"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(58,42,26,0.10), transparent)' }}
              />
              <div
                className="text-[7px] font-[Cormorant_Garamond,serif] italic tracking-[0.2em] uppercase"
                style={{ opacity: 0.18 }}
              >
                End of Record
              </div>
              <div className="text-[6px] font-[Cormorant_Garamond,serif] mt-1" style={{ opacity: 0.12 }}>
                Compiled in the Archive Chamber, Urithiru
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dust motes floating in the room */}
      <DustParticles />

      {/* ── Minimap ── */}
      <div className="absolute bottom-4 right-4 z-30 pointer-events-none" style={{ opacity: 0.18 }}>
        <svg
          width="120"
          height="80"
          viewBox={`0 0 ${WALL_W} ${WALL_H}`}
          className="rounded-sm"
          style={{ border: '1px solid rgba(90,74,58,0.25)' }}
        >
          <rect x="0" y="0" width={WALL_W} height={WALL_H} fill="rgba(180,170,160,0.06)" />
          {WALL_ITEMS.map((item) => (
            <rect
              key={item.id}
              x={item.x}
              y={item.y}
              width={item.w}
              height={item.h}
              fill="rgba(42,26,10,0.06)"
              rx="1"
            />
          ))}
          <rect
            x={targetX - vw / 2 / targetZoom}
            y={targetY - vh / 2 / targetZoom}
            width={vw / targetZoom}
            height={vh / targetZoom}
            fill="none"
            stroke="rgba(168,216,234,0.25)"
            strokeWidth="4"
          />
        </svg>
      </div>

      {/* Hint */}
      <div className="absolute bottom-4 left-4 z-30 pointer-events-none">
        <div className="text-[7px] font-[Cormorant_Garamond,serif] italic" style={{ opacity: 0.15 }}>
          Click a document · Drag to explore · Scroll to zoom
        </div>
      </div>
    </div>
  )
}
