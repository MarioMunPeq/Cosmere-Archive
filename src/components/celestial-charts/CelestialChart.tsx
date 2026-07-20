import { useMemo, useRef, useState, useEffect } from 'react'
import { PLANETS } from '@/data/static'
import PlanetMarble from './PlanetMarble'

interface Props {
  selectedPlanetId: string | null
  onSelectPlanet: (id: string) => void
  activeRoute: { id: string; planets: string[]; color: string } | null
}

interface PlanetLayout {
  id: string
  name: string
  x: number
  y: number
  orbitR: number
  angle: number
}

const PLANET_NOTES: Record<string, string> = {
  roshar: 'Observed by Khriss',
  scadrial: 'Dual shardic influence',
  sel: 'Dor manifestation',
  nalthis: 'Endowment confirmed',
  taldain: 'Dual sun system',
  lumar: 'Aether study site',
  canticle: 'SUNHEART active',
  komashi: "Virtuosity's gift",
  'first-of-the-sun': "Patji's domain",
  threnody: "Ambition's fall",
  yolen: 'Original world',
}

const INK = {
  title: '#2a1810',
  body: '#3d2818',
  label: '#4a3020',
  meta: '#5a3d28',
  subtle: '#7a6040',
  muted: '#9a8060',
  faint: 'rgba(60,45,30,0.08)',
}

function computeLayout(): PlanetLayout[] {
  const count = PLANETS.length
  const centerX = 400
  const centerY = 340
  return PLANETS.map((planet, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2
    const orbitR = 120 + (i % 5) * 40 + Math.sin(i * 1.7) * 15
    const x = centerX + orbitR * Math.cos(angle)
    const y = centerY + orbitR * Math.sin(angle) * 0.82
    return { id: planet.id, name: planet.name, x, y, orbitR, angle }
  })
}

function orbitPath(cx: number, cy: number, r: number, seed: number): string {
  const pts: string[] = []
  const segs = 48
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2
    const irr = 1 + Math.sin(a * 3 + seed) * 0.006 + Math.cos(a * 5 + seed * 1.3) * 0.004
    const rr = r * irr
    pts.push(`${i === 0 ? 'M' : 'L'}${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a) * 0.86).toFixed(1)}`)
  }
  return pts.join(' ')
}

function armillaryRing(
  cx: number,
  cy: number,
  r: number,
  rotX: number,
  rotY: number,
): { path: string; opacity: number } {
  const pts: string[] = []
  const segs = 40
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2
    const z = r * Math.sin(a) * Math.sin((rotX * Math.PI) / 180)
    const px =
      cx + r * Math.cos(a) * Math.cos((rotY * Math.PI) / 180) - r * Math.sin(a) * Math.sin((rotY * Math.PI) / 180)
    const py =
      cy +
      r * Math.cos(a) * Math.sin((rotY * Math.PI) / 180) +
      r * Math.sin(a) * Math.cos((rotY * Math.PI) / 180) +
      z * 0.3
    pts.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`)
  }
  return { path: pts.join(' '), opacity: 0.5 }
}

const CONSTELLATIONS: { stars: [number, number][]; label: string }[] = [
  {
    stars: [
      [80, 60],
      [120, 40],
      [160, 70],
      [140, 110],
      [90, 100],
    ],
    label: 'Draconis',
  },
  {
    stars: [
      [600, 80],
      [640, 120],
      [680, 90],
      [660, 50],
      [610, 60],
    ],
    label: 'Cetus',
  },
  {
    stars: [
      [100, 540],
      [150, 520],
      [180, 560],
      [140, 590],
      [90, 570],
    ],
    label: 'Argo Navis',
  },
  {
    stars: [
      [620, 530],
      [660, 560],
      [700, 520],
      [650, 490],
      [610, 510],
    ],
    label: 'Phoenicopterus',
  },
  {
    stars: [
      [350, 30],
      [380, 50],
      [420, 35],
      [400, 70],
      [360, 65],
    ],
    label: 'Corona',
  },
  {
    stars: [
      [200, 480],
      [240, 460],
      [270, 500],
      [230, 520],
      [190, 500],
    ],
    label: 'Scorpio',
  },
]

const CALCULATIONS = [
  { text: 'Σ r³/T² = const.', x: 72, y: 380, rot: '1deg' },
  { text: 'ε = 0.0167', x: 640, y: 460, rot: '-1.5deg' },
  { text: 'sin δ = sin φ · sin ε', x: 660, y: 180, rot: '2deg' },
  { text: 'mv = 3.12 ∓ 0.08', x: 50, y: 200, rot: '-0.5deg' },
]

export default function CelestialChart({ selectedPlanetId, onSelectPlanet, activeRoute }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [inkProgress, setInkProgress] = useState(0)
  const layout = useMemo(() => computeLayout(), [])
  const armillaryRings = useMemo(
    () => [
      armillaryRing(400, 340, 320, 15, 0),
      armillaryRing(400, 340, 320, 0, 15),
      armillaryRing(400, 340, 300, 30, 30),
    ],
    [],
  )
  const starField = useMemo(() => {
    const stars: { x: number; y: number; r: number }[] = []
    for (let i = 0; i < 80; i++) {
      const h = (i * 137.5) % 800
      const v = (i * 89.3) % 650
      stars.push({ x: 10 + (h % 780), y: 10 + (v % 630), r: 0.3 + (i % 3) * 0.3 })
    }
    return stars
  }, [])

  useEffect(() => {
    if (!activeRoute) return
    let start: number | null = null
    let rafId: number
    const dur = 3000
    function frame(t: number) {
      if (!start) {
        start = t
        setInkProgress(0)
      }
      const p = Math.min((t - start) / dur, 1)
      setInkProgress(p)
      if (p < 1) rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafId)
  }, [activeRoute])

  const routeSegments = useMemo(() => {
    if (!activeRoute) return []
    return activeRoute.planets
      .slice(0, -1)
      .map((_, i) => {
        const from = layout.find((l) => l.id === activeRoute.planets[i])
        const to = layout.find((l) => l.id === activeRoute.planets[i + 1])
        if (!from || !to) return null
        return { x1: from.x, y1: from.y, x2: to.x, y2: to.y }
      })
      .filter(Boolean) as { x1: number; y1: number; x2: number; y2: number }[]
  }, [activeRoute, layout])

  return (
    <div className="w-full h-full min-h-0 flex items-center justify-center">
      <svg
        ref={svgRef}
        viewBox="0 0 800 680"
        className="w-full h-full"
        style={{ maxWidth: '760px', maxHeight: '640px' }}
      >
        {/* Background stars */}
        {starField.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={INK.faint} opacity={0.3 + (i % 5) * 0.04} />
        ))}

        {/* Constellation lines */}
        {CONSTELLATIONS.map((c, ci) => (
          <g key={`const-${ci}`} opacity="0.025">
            {c.stars.map((s, j) => (
              <circle key={`cs-${j}`} cx={s[0]} cy={s[1]} r="1.5" fill={INK.subtle} />
            ))}
            {c.stars.map((s, j) => {
              if (j === 0) return null
              const prev = c.stars[j - 1]!
              return (
                <line
                  key={`cl-${j}`}
                  x1={prev[0]}
                  y1={prev[1]}
                  x2={s[0]}
                  y2={s[1]}
                  stroke={INK.subtle}
                  strokeWidth="0.3"
                  strokeDasharray="2 3"
                />
              )
            })}
            <text
              x={c.stars.reduce((s, p) => s + p[0], 0) / c.stars.length}
              y={c.stars.reduce((s, p) => s + p[1], 0) / c.stars.length + 10}
              textAnchor="middle"
              fontSize="5"
              fill={INK.subtle}
              fontFamily="Georgia, serif"
              fontStyle="italic"
            >
              {c.label}
            </text>
          </g>
        ))}

        {/* Faint grid */}
        <g opacity="0.02">
          {Array.from({ length: 16 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 45} x2={800} y2={i * 45} stroke={INK.faint} strokeWidth="0.2" />
          ))}
          {Array.from({ length: 18 }, (_, i) => (
            <line key={`v${i}`} x1={i * 48} y1={0} x2={i * 48} y2={680} stroke={INK.faint} strokeWidth="0.2" />
          ))}
        </g>

        {/* Center sun marker */}
        <g>
          <circle cx={400} cy={340} r={8} fill="none" stroke="rgba(180,160,100,0.08)" strokeWidth="0.3" />
          <circle
            cx={400}
            cy={340}
            r={4}
            fill="none"
            stroke="rgba(180,160,100,0.12)"
            strokeWidth="0.3"
            strokeDasharray="2 2"
          />
          <circle cx={400} cy={340} r={2} fill="rgba(180,160,100,0.1)" />
          <circle cx={400} cy={340} r={0.8} fill="rgba(180,160,100,0.2)" />
        </g>

        {/* Armillary sphere rings */}
        {armillaryRings.map((ring, i) => (
          <path
            key={`arm-${i}`}
            d={ring.path}
            fill="none"
            stroke={INK.muted}
            strokeWidth="0.3"
            opacity={ring.opacity * 0.06}
          />
        ))}

        {/* Orbits */}
        {layout.map((pl, i) => {
          const path = orbitPath(400, 340, pl.orbitR, i * 7.3)
          const isSelected = pl.id === selectedPlanetId
          const isRoute = activeRoute?.planets.includes(pl.id)
          return (
            <g key={`orbit-${pl.id}`}>
              <path
                d={path}
                fill="none"
                stroke={isSelected ? INK.subtle : isRoute ? INK.muted : 'rgba(80,60,40,0.04)'}
                strokeWidth={isSelected ? '0.5' : '0.3'}
              />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                const a = (deg * Math.PI) / 180
                return (
                  <line
                    key={`tick-${pl.id}-${deg}`}
                    x1={400 + (pl.orbitR - 2) * Math.cos(a)}
                    y1={340 + (pl.orbitR - 2) * Math.sin(a) * 0.86}
                    x2={400 + (pl.orbitR + 2) * Math.cos(a)}
                    y2={340 + (pl.orbitR + 2) * Math.sin(a) * 0.86}
                    stroke={isSelected ? INK.muted : 'rgba(80,60,40,0.03)'}
                    strokeWidth="0.2"
                  />
                )
              })}
            </g>
          )
        })}

        {/* Calculation annotations */}
        {CALCULATIONS.map((calc, i) => (
          <text
            key={`calc-${i}`}
            x={calc.x}
            y={calc.y}
            fontSize="6"
            fill={INK.subtle}
            fontFamily="Georgia, serif"
            fontStyle="italic"
            transform={`rotate(${calc.rot}, ${calc.x}, ${calc.y})`}
          >
            {calc.text}
          </text>
        ))}

        {/* Planet annotations */}
        {layout.map((pl) => {
          const note = PLANET_NOTES[pl.id]
          if (!note) return null
          const isSelected = pl.id === selectedPlanetId
          return (
            <text
              key={`note-${pl.id}`}
              x={pl.x}
              y={pl.y - (isSelected ? 34 : 28)}
              textAnchor="middle"
              fontSize={isSelected ? '6.5' : '5.5'}
              fill={isSelected ? INK.subtle : INK.muted}
              fontFamily="Georgia, serif"
              fontStyle="italic"
            >
              {note}
            </text>
          )
        })}

        {/* Worldhopper ink route */}
        {activeRoute && routeSegments.length > 0 && (
          <g>
            {routeSegments.map((seg, i) => (
              <line
                key={`ghost-${i}`}
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
                stroke={activeRoute.color.replace('0.3', '0.08')}
                strokeWidth="0.4"
                strokeDasharray="3 4"
              />
            ))}
            {(() => {
              const totalLen = routeSegments.reduce(
                (sum, s) => sum + Math.sqrt((s.x2 - s.x1) ** 2 + (s.y2 - s.y1) ** 2),
                0,
              )
              let drawn = inkProgress * totalLen
              return routeSegments.map((seg, i) => {
                const len = Math.sqrt((seg.x2 - seg.x1) ** 2 + (seg.y2 - seg.y1) ** 2)
                if (drawn <= 0) return null
                const frac = Math.min(drawn / len, 1)
                drawn -= len
                return (
                  <line
                    key={`ink-${i}`}
                    x1={seg.x1}
                    y1={seg.y1}
                    x2={seg.x1 + (seg.x2 - seg.x1) * frac}
                    y2={seg.y1 + (seg.y2 - seg.y1) * frac}
                    stroke={activeRoute.color.replace('0.3', '0.6')}
                    strokeWidth="0.7"
                    strokeLinecap="round"
                  />
                )
              })
            })()}
          </g>
        )}

        {/* Planets */}
        {layout.map((pl) => {
          const isSelected = pl.id === selectedPlanetId
          const isRoute = activeRoute?.planets.includes(pl.id)
          const marbleSize = isSelected ? 56 : 40
          return (
            <g
              key={pl.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectPlanet(pl.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectPlanet(pl.id)
                }
              }}
              className="cursor-pointer"
            >
              <foreignObject
                x={pl.x - marbleSize / 2}
                y={pl.y - marbleSize / 2}
                width={marbleSize}
                height={marbleSize}
                style={{ pointerEvents: 'none', transition: 'width 0.4s ease, height 0.4s ease' }}
              >
                <div style={{ transform: isSelected ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.4s ease' }}>
                  <PlanetMarble planetId={pl.id} size={marbleSize} />
                </div>
              </foreignObject>

              {isSelected && (
                <>
                  <circle
                    cx={pl.x}
                    cy={pl.y}
                    r={marbleSize / 2 + 6}
                    fill="none"
                    stroke={INK.subtle}
                    strokeWidth="0.4"
                    strokeDasharray="2 3"
                  />
                  <circle
                    cx={pl.x}
                    cy={pl.y}
                    r={marbleSize / 2 + 10}
                    fill="none"
                    stroke={INK.muted}
                    strokeWidth="0.2"
                  />
                  <line
                    x1={400}
                    y1={340}
                    x2={pl.x}
                    y2={pl.y}
                    stroke={INK.muted}
                    strokeWidth="0.2"
                    strokeDasharray="2 4"
                  />
                </>
              )}

              {isRoute && !isSelected && (
                <circle
                  cx={pl.x}
                  cy={pl.y}
                  r={marbleSize / 2 + 4}
                  fill="none"
                  stroke={activeRoute?.color.replace('0.3', '0.2') ?? INK.subtle}
                  strokeWidth="0.3"
                />
              )}

              <text
                x={pl.x}
                y={pl.y + marbleSize / 2 + 14}
                textAnchor="middle"
                fontSize={isSelected ? '11' : '9'}
                fontFamily="Georgia, serif"
                fill={isSelected ? INK.title : INK.body}
                style={{ transition: 'fill 0.3s ease, font-size 0.3s ease' }}
              >
                {pl.name}
              </text>

              {isSelected && (
                <text
                  x={pl.x}
                  y={pl.y + marbleSize / 2 + 26}
                  textAnchor="middle"
                  fontSize="6"
                  fill={INK.subtle}
                  fontFamily="Georgia, serif"
                  fontStyle="italic"
                >
                  d ≈ {(pl.orbitR * 0.12).toFixed(1)} AU
                </text>
              )}
            </g>
          )
        })}

        {/* Chart title */}
        <text
          x={400}
          y={22}
          textAnchor="middle"
          fontSize="8"
          fontFamily="Georgia, serif"
          fill={INK.subtle}
          letterSpacing="3"
        >
          CELESTIAL CHART — KNOWN SYSTEMS
        </text>

        {/* Plate label */}
        <g transform="translate(30, 620)">
          <text x="0" y="0" fontSize="5" fill={INK.muted} fontFamily="serif">
            Plate I.
          </text>
          <text x="40" y="0" fontSize="5" fill={INK.subtle} fontFamily="serif" fontStyle="italic">
            Orbital configuration of the known Cosmere
          </text>
        </g>

        {/* Scale bar */}
        <g transform="translate(620, 640)">
          <line x1="0" y1="0" x2="80" y2="0" stroke={INK.muted} strokeWidth="0.3" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke={INK.muted} strokeWidth="0.3" />
          <line x1="40" y1="-2" x2="40" y2="2" stroke={INK.muted} strokeWidth="0.3" />
          <line x1="80" y1="-3" x2="80" y2="3" stroke={INK.muted} strokeWidth="0.3" />
          <text x="40" y="9" fontSize="5" fill={INK.subtle} fontFamily="serif" textAnchor="middle">
            0.5 AU
          </text>
        </g>

        {/* Compass rose */}
        <g transform="translate(50, 50)">
          <line x1="0" y1="-16" x2="0" y2="16" stroke={INK.muted} strokeWidth="0.3" opacity={0.05} />
          <line x1="-16" y1="0" x2="16" y2="0" stroke={INK.muted} strokeWidth="0.3" opacity={0.05} />
          <line x1="-8" y1="-8" x2="8" y2="8" stroke={INK.muted} strokeWidth="0.2" opacity={0.03} />
          <line x1="8" y1="-8" x2="-8" y2="8" stroke={INK.muted} strokeWidth="0.2" opacity={0.03} />
          <text x="0" y="-18" fontSize="5" fill={INK.subtle} fontFamily="serif" textAnchor="middle" opacity={0.06}>
            N
          </text>
          <text x="18" y="1" fontSize="4" fill={INK.subtle} fontFamily="serif" textAnchor="start" opacity={0.04}>
            E
          </text>
          <text x="0" y="20" fontSize="4" fill={INK.subtle} fontFamily="serif" textAnchor="middle" opacity={0.04}>
            S
          </text>
          <text x="-18" y="1" fontSize="4" fill={INK.subtle} fontFamily="serif" textAnchor="end" opacity={0.04}>
            W
          </text>
        </g>
      </svg>
    </div>
  )
}
