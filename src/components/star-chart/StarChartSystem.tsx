import { useMemo } from 'react'
import type { Planet } from '@/types'
import AstronomicalPlanet from './AstronomicalPlanet'

function seed(n: number): number {
  return Math.abs((Math.sin(n * 12.9898 + 78.233) * 43758.5453) % 1)
}

/* Hand-drawn imperfect orbit path */
function inkOrbit(cx: number, cy: number, r: number): string {
  const pts: [number, number][] = []
  const steps = 48
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const w = 1 + 0.02 * seed(i * 13 + r * 7)
    pts.push([cx + r * w * Math.cos(a), cy + r * w * Math.sin(a)])
  }
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
}

/* Ink splatter dots */
function inkSplatters(): { x: number; y: number; r: number }[] {
  const dots: { x: number; y: number; r: number }[] = []
  for (let i = 0; i < 30; i++) {
    dots.push({
      x: 60 + seed(i * 7 + 1) * 880,
      y: 60 + seed(i * 7 + 2) * 880,
      r: 0.3 + seed(i * 7 + 3) * 1.2,
    })
  }
  return dots
}

const ORBITS = [
  { radius: 145, label: 'Inner Worlds' },
  { radius: 225, label: 'Mid Worlds' },
  { radius: 310, label: 'Outer Worlds' },
]

interface Props {
  planets: Planet[]
  selectedPlanet: string | null
  onPlanetClick: (id: string) => void
}

export default function StarChartSystem({ planets, selectedPlanet, onPlanetClick }: Props) {
  const cx = 500
  const cy = 500

  const planetPositions = useMemo(() => {
    const filtered = planets.filter((p) => p.id !== 'yolen')
    const sorted = [...filtered].sort(
      (a, b) => seed(b.id.charCodeAt(0) + b.id.length) - seed(a.id.charCodeAt(0) + a.id.length),
    )
    const positions: { planet: Planet; angle: number; orbitRadius: number; x: number; y: number }[] = []

    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i]!
      const se = seed(p.id.charCodeAt(0) + p.id.charCodeAt(p.id.length - 1) + p.id.length)
      const orbitIdx = se > 0.6 ? 2 : se > 0.25 ? 1 : 0
      const orbit = ORBITS[orbitIdx]!
      const offset = i * 1.7 + seed(p.id.charCodeAt(3) + 50) * 0.8
      const angle = offset % (Math.PI * 2)
      positions.push({
        planet: p,
        angle,
        orbitRadius: orbit.radius + (seed(p.id.charCodeAt(2) + 10) - 0.5) * 18,
        x: 0,
        y: 0,
      })
    }
    for (const pos of positions) {
      pos.x = cx + pos.orbitRadius * Math.cos(pos.angle)
      pos.y = cy + pos.orbitRadius * Math.sin(pos.angle)
    }
    return positions
  }, [planets])

  const splatters = useMemo(() => inkSplatters(), [])

  return (
    <svg viewBox="0 0 1000 1000" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* Paper grain texture */}
        <filter id="paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="4" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.88  0 0 0 0 0.84  0 0 0 0 0.78  0 0 0 0.04 0" />
        </filter>
        <filter id="ink-bleed">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" />
          <feDisplacementMap in="SourceGraphic" scale="1.2" />
        </filter>
      </defs>

      {/* Parchment background rectangle — fills SVG viewBox */}
      <rect x="0" y="0" width="1000" height="1000" fill="#e8dcc8" rx="2" />
      <rect x="0" y="0" width="1000" height="1000" fill="url(#paper-grain)" opacity="0.5" />

      {/* Very faint aging stains */}
      <circle cx="120" cy="140" r="100" fill="rgba(120,90,60,0.03)" />
      <circle cx="860" cy="820" r="130" fill="rgba(100,80,50,0.02)" />
      <circle cx="800" cy="200" r="80" fill="rgba(140,110,80,0.015)" />

      {/* Ink splatters */}
      {splatters.map((d, i) => (
        <circle key={`sp${i}`} cx={d.x} cy={d.y} r={d.r} fill="rgba(42,26,10,0.04)" />
      ))}

      {/* Tick marks around chart border */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const r1 = 370
        const r2 = 378
        return (
          <line
            key={`t${deg}`}
            x1={cx + r1 * Math.cos(rad)}
            y1={cy + r1 * Math.sin(rad)}
            x2={cx + r2 * Math.cos(rad)}
            y2={cy + r2 * Math.sin(rad)}
            stroke="rgba(42,26,10,0.06)"
            strokeWidth="0.3"
          />
        )
      })}

      {/* Orbital rings — hand-drawn ink */}
      {ORBITS.map((o) => (
        <g key={o.radius}>
          {/* Sibling second pass line (faint draft line) */}
          <path d={inkOrbit(cx, cy, o.radius - 5)} fill="none" stroke="rgba(42,26,10,0.02)" strokeWidth="0.15" />
          {/* Main orbit line */}
          <path
            d={inkOrbit(cx, cy, o.radius)}
            fill="none"
            stroke="rgba(42,26,10,0.06)"
            strokeWidth="0.35"
            filter="url(#ink-bleed)"
          />
          <text
            x={cx + o.radius + 10}
            y={cy - 6}
            fill="rgba(42,26,10,0.08)"
            fontSize="4.5"
            fontFamily="'Cormorant Garamond', serif"
            fontStyle="italic"
          >
            {o.label}
          </text>
        </g>
      ))}

      {/* Radial guide lines (faint ink) */}
      {[60, 120, 180, 240, 300, 360].map((deg) => {
        const rad = (deg * Math.PI) / 180
        return (
          <g key={`gl${deg}`}>
            <line
              x1={cx + 60 * Math.cos(rad)}
              y1={cy + 60 * Math.sin(rad)}
              x2={cx + 345 * Math.cos(rad)}
              y2={cy + 345 * Math.sin(rad)}
              stroke="rgba(42,26,10,0.02)"
              strokeWidth="0.2"
            />
            <circle cx={cx + 350 * Math.cos(rad)} cy={cy + 350 * Math.sin(rad)} r={1.2} fill="rgba(42,26,10,0.05)" />
          </g>
        )
      })}

      {/* The Sun — ink illustration style */}
      <g>
        {/* Sun glow on paper */}
        <circle cx={cx} cy={cy} r={55} fill="rgba(200,170,120,0.04)" />
        <circle cx={cx} cy={cy} r={44} fill="rgba(200,170,120,0.06)" />
        {/* Sun body */}
        <circle cx={cx} cy={cy} r={36} fill="rgba(200,170,120,0.12)" stroke="rgba(42,26,10,0.12)" strokeWidth="0.4" />
        <circle cx={cx} cy={cy} r={30} fill="rgba(220,190,140,0.08)" stroke="rgba(42,26,10,0.06)" strokeWidth="0.2" />
        {/* Hand-drawn sun rays */}
        {Array.from({ length: 16 }, (_, i) => {
          const a = i * 22.5 * (Math.PI / 180)
          const r1 = 37
          const r2 = 48 + seed(i * 11) * 5
          return (
            <line
              key={i}
              x1={cx + r1 * Math.cos(a)}
              y1={cy + r1 * Math.sin(a)}
              x2={cx + r2 * Math.cos(a)}
              y2={cy + r2 * Math.sin(a)}
              stroke="rgba(42,26,10,0.08)"
              strokeWidth="0.25"
            />
          )
        })}
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(42,26,10,0.12)"
          fontSize="5"
          fontFamily="'Playfair Display', serif"
          letterSpacing="0.1em"
        >
          COSMERE
        </text>
      </g>

      {/* Planets */}
      {planetPositions.map(({ planet: p, x, y, orbitRadius }) => {
        const planetRadius = 14 + (p.size / 60) * 16
        const angleToPlanet = Math.atan2(y - cy, x - cx)
        const labelDist = orbitRadius + 28 + planetRadius
        const lx = cx + labelDist * Math.cos(angleToPlanet)
        const ly = cy + labelDist * Math.sin(angleToPlanet)
        const shardLabel = p.shard?.split(/[,&]/)[0]?.trim() ?? ''
        const isSelected = selectedPlanet === p.id
        const flip = angleToPlanet > Math.PI / 2 || angleToPlanet < -Math.PI / 2

        return (
          <g key={p.id}>
            {/* Connecting ink line */}
            <line
              x1={x}
              y1={y}
              x2={lx}
              y2={ly}
              stroke="rgba(42,26,10,0.04)"
              strokeWidth="0.25"
              strokeDasharray="1.5 2"
            />

            {/* Label */}
            <g
              className="pointer-events-none select-none"
              transform={`translate(${lx}, ${ly}) rotate(${flip ? 180 : 0})`}
            >
              <text
                textAnchor={flip ? 'end' : 'start'}
                dominantBaseline="central"
                fill={isSelected ? 'rgba(42,26,10,0.7)' : 'rgba(42,26,10,0.3)'}
                fontSize={isSelected ? '7' : '5.5'}
                fontFamily="'Playfair Display', 'Georgia', serif"
                letterSpacing="0.06em"
                style={{ transition: 'fill 0.4s, font-size 0.4s' }}
              >
                {p.name.toUpperCase()}
              </text>
              {shardLabel && (
                <text
                  x={flip ? 0 : 0}
                  y={9}
                  textAnchor={flip ? 'end' : 'start'}
                  dominantBaseline="central"
                  fill="rgba(42,26,10,0.12)"
                  fontSize="4"
                  fontFamily="'Cormorant Garamond', serif"
                  fontStyle="italic"
                >
                  {shardLabel}
                </text>
              )}
            </g>

            <AstronomicalPlanet planet={p} r={planetRadius} selected={isSelected} onClick={() => onPlanetClick(p.id)} />
          </g>
        )
      })}

      {/* Handwritten annotations in ink */}
      <g fontFamily="'Cormorant Garamond', serif" fontStyle="italic" fill="rgba(42,26,10,0.06)" fontSize="6">
        <text x="140" y="140" transform="rotate(-4, 140, 140)">
          Orbits not to scale
        </text>
        <text x="780" y="160" transform="rotate(2.5, 780, 160)">
          Distances approximate
        </text>
        <text x="160" y="840" transform="rotate(-1.8, 160, 840)">
          cf. Arcanum Unbounded
        </text>
        <text x="770" y="830" transform="rotate(1, 770, 830)">
          16 Shards, many worlds
        </text>
        <text x="440" y="130" transform="rotate(-0.5, 440, 130)">
          System diagram — Khriss
        </text>
        <text x="420" y="870" transform="rotate(0.8, 420, 870)">
          Compiled from known records
        </text>
      </g>

      {/* Tiny decorative connecting lines from annotations */}
      <line x1="148" y1="142" x2="170" y2="170" stroke="rgba(42,26,10,0.03)" strokeWidth="0.2" />
      <line x1="780" y1="162" x2="760" y2="190" stroke="rgba(42,26,10,0.03)" strokeWidth="0.2" />
    </svg>
  )
}
