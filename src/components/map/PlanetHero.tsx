import { memo, useMemo } from 'react'
import type { Planet } from '@/types/planet'
import { getPlanetVisual } from '@/data/static/planet-visuals'

interface Props {
  planet: Planet
  size?: number
}

function seeded(i: number, s: number): number {
  return Math.abs((Math.sin(i * 12.9898 + s * 78.233) * 43758.5453) % 1)
}

function HeroSurfacePattern({ pid, cx, cy, r }: { pid: string; cx: number; cy: number; r: number }) {
  const v = getPlanetVisual(pid)
  const c = v.surface
  const id = `hero-surf-${pid}`
  const seed = pid.charCodeAt(0) + pid.charCodeAt(pid.length - 1)

  const elements = useMemo(() => {
    const list: React.ReactNode[] = []
    switch (c.pattern) {
      case 'bands': {
        const bandCount = 8
        for (let i = 0; i < bandCount; i++) {
          const yOff = -r + (i / bandCount) * r * 2 + seeded(i, seed) * r * 0.15
          list.push(
            <ellipse
              key={i}
              cx={cx}
              cy={cy + yOff}
              rx={r * (1.1 + seeded(i, seed + 1) * 0.2)}
              ry={r * 0.2 + seeded(i, seed + 2) * r * 0.1}
              fill={c.colors[i % c.colors.length]}
              opacity={0.4 + seeded(i, seed + 3) * 0.3}
            />,
          )
        }
        break
      }
      case 'veins': {
        const veinCount = 8
        for (let i = 0; i < veinCount; i++) {
          const angle = seeded(i, seed) * 360
          const rad = (angle * Math.PI) / 180
          const len = r * (0.4 + seeded(i, seed + 1) * 0.6)
          const w = seeded(i, seed + 2) * 2.5 + 0.5
          list.push(
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + len * Math.cos(rad)}
              y2={cy + len * Math.sin(rad)}
              stroke={c.colors[i % c.colors.length]}
              strokeWidth={w}
              opacity={0.25 + seeded(i, seed + 3) * 0.25}
              strokeLinecap="round"
            />,
          )
          const branchAngle = rad + (seeded(i, seed + 4) - 0.5) * 1.5
          const branchLen = len * seeded(i, seed + 5) * 0.5
          list.push(
            <line
              key={`b${i}`}
              x1={cx + len * 0.7 * Math.cos(rad)}
              y1={cy + len * 0.7 * Math.sin(rad)}
              x2={cx + len * 0.7 * Math.cos(rad) + branchLen * Math.cos(branchAngle)}
              y2={cy + len * 0.7 * Math.sin(rad) + branchLen * Math.sin(branchAngle)}
              stroke={c.colors[i % c.colors.length]}
              strokeWidth={w * 0.5}
              opacity={0.15}
              strokeLinecap="round"
            />,
          )
        }
        break
      }
      case 'speckled': {
        const dotCount = 25
        for (let i = 0; i < dotCount; i++) {
          const angle = seeded(i, seed) * 360
          const dist = seeded(i, seed + 1) * r * 0.85
          const dotR = seeded(i, seed + 2) * 1.5 + 0.3
          list.push(
            <circle
              key={i}
              cx={cx + dist * Math.cos((angle * Math.PI) / 180)}
              cy={cy + dist * Math.sin((angle * Math.PI) / 180)}
              r={dotR}
              fill={c.colors[i % c.colors.length]}
              opacity={0.3 + seeded(i, seed + 3) * 0.3}
            />,
          )
        }
        break
      }
      case 'metallic': {
        for (let i = 0; i < 5; i++) {
          const angle = seeded(i, seed) * 360
          const rad = (angle * Math.PI) / 180
          list.push(
            <line
              key={i}
              x1={cx + r * 0.2 * Math.cos(rad)}
              y1={cy + r * 0.2 * Math.sin(rad)}
              x2={cx + r * 1.2 * Math.cos(rad)}
              y2={cy + r * 1.2 * Math.sin(rad)}
              stroke="white"
              strokeWidth={0.3 + seeded(i, seed + 1) * 0.5}
              opacity={0.03 + seeded(i, seed + 2) * 0.03}
            />,
          )
        }
        const crackCount = 3
        for (let i = 0; i < crackCount; i++) {
          const startAngle = seeded(i, seed + 10) * 360
          const sr = (startAngle * Math.PI) / 180
          const sx = cx + r * 0.3 * Math.cos(sr)
          const sy = cy + r * 0.3 * Math.sin(sr)
          const ex = cx + r * (0.5 + seeded(i, seed + 11) * 0.5) * Math.cos(sr + (seeded(i, seed + 12) - 0.5) * 0.5)
          const ey = cy + r * (0.5 + seeded(i, seed + 11) * 0.5) * Math.sin(sr + (seeded(i, seed + 12) - 0.5) * 0.5)
          list.push(
            <path
              key={`cr${i}`}
              d={`M${sx} ${sy} Q${(sx + ex) / 2 + seeded(i, seed + 13) * r * 0.1} ${(sy + ey) / 2 + seeded(i, seed + 14) * r * 0.1} ${ex} ${ey}`}
              fill="none"
              stroke={c.colors[4] ?? '#000'}
              strokeWidth="0.5"
              opacity={0.2}
            />,
          )
        }
        break
      }
      case 'scales': {
        const scaleCount = 15
        for (let i = 0; i < scaleCount; i++) {
          const angle = seeded(i, seed) * 360
          const rad = (angle * Math.PI) / 180
          const dist = seeded(i, seed + 1) * r * 0.7
          const sx = cx + dist * Math.cos(rad)
          const sy = cy + dist * Math.sin(rad)
          const sr = seeded(i, seed + 2) * r * 0.2 + r * 0.06
          list.push(
            <path
              key={i}
              d={`M${sx - sr} ${sy} Q${sx} ${sy - sr} ${sx + sr} ${sy} Q${sx} ${sy + sr} ${sx - sr} ${sy}`}
              fill="none"
              stroke={c.colors[i % c.colors.length]}
              strokeWidth="0.5"
              opacity={0.2 + seeded(i, seed + 3) * 0.2}
            />,
          )
        }
        break
      }
      case 'marble': {
        const swirlCount = 6
        for (let i = 0; i < swirlCount; i++) {
          const angle = seeded(i, seed) * 360
          const rad = (angle * Math.PI) / 180
          const len = r * (0.8 + seeded(i, seed + 1) * 0.7)
          const ox = r * 0.2 * Math.cos(rad + 0.3)
          const oy = r * 0.2 * Math.sin(rad + 0.3)
          list.push(
            <path
              key={i}
              d={`M${cx - len * 0.4 * Math.cos(rad)} ${cy - len * 0.4 * Math.sin(rad)} Q${cx + ox} ${cy + oy} ${cx + len * 0.4 * Math.cos(rad)} ${cy + len * 0.4 * Math.sin(rad)}`}
              fill="none"
              stroke={c.colors[i % c.colors.length]}
              strokeWidth={seeded(i, seed + 2) * 3 + 1}
              opacity={0.1 + seeded(i, seed + 3) * 0.15}
              strokeLinecap="round"
            />,
          )
        }
        break
      }
      case 'geometric': {
        const ringCount = 4
        for (let i = 0; i < ringCount; i++) {
          const rr = r * (0.2 + (i / ringCount) * 0.7)
          list.push(
            <circle
              key={`ring${i}`}
              cx={cx}
              cy={cy}
              r={rr}
              fill="none"
              stroke={c.colors[i % c.colors.length]}
              strokeWidth={0.5}
              opacity={0.15 + seeded(i, seed) * 0.1}
            />,
          )
        }
        const spokeCount = 12
        for (let i = 0; i < spokeCount; i++) {
          const angle = (i / spokeCount) * 360
          const rad = (angle * Math.PI) / 180
          list.push(
            <line
              key={`spoke${i}`}
              x1={cx}
              y1={cy}
              x2={cx + r * 0.9 * Math.cos(rad)}
              y2={cy + r * 0.9 * Math.sin(rad)}
              stroke={c.colors[0]}
              strokeWidth={0.3 + seeded(i, seed + 1) * 0.3}
              opacity={0.08}
            />,
          )
        }
        const aonCx = cx + (seeded(0, seed + 10) - 0.5) * r * 0.4
        const aonCy = cy + (seeded(1, seed + 10) - 0.5) * r * 0.4
        const aonR = r * 0.15
        list.push(
          <circle
            key="aon"
            cx={aonCx}
            cy={aonCy}
            r={aonR}
            fill="none"
            stroke={c.colors[1] ?? c.colors[0]}
            strokeWidth={1.5}
            opacity={0.6}
          />,
        )
        list.push(
          <circle key="aon-dot" cx={aonCx} cy={aonCy} r={1.5} fill={c.colors[1] ?? c.colors[0]} opacity={0.8} />,
        )
        for (let i = 0; i < 6; i++) {
          const aRad = (i / 6) * 2 * Math.PI
          const lx = aonCx + aonR * Math.cos(aRad)
          const ly = aonCy + aonR * Math.sin(aRad)
          list.push(
            <line
              key={`aon-line${i}`}
              x1={aonCx + aonR * 0.3 * Math.cos(aRad)}
              y1={aonCy + aonR * 0.3 * Math.sin(aRad)}
              x2={lx}
              y2={ly}
              stroke={c.colors[1] ?? c.colors[0]}
              strokeWidth={0.4}
              opacity={0.4}
            />,
          )
        }
        break
      }
      case 'horizontals': {
        const stripeCount = 10
        const stripeH = (r * 2) / stripeCount
        for (let i = 0; i < stripeCount; i++) {
          const yOff = -r + i * stripeH
          list.push(
            <rect
              key={i}
              x={cx - r}
              y={cy + yOff}
              width={r * 2}
              height={stripeH + 1}
              fill={c.colors[i % c.colors.length]}
              opacity={0.25 + seeded(i, seed) * 0.2}
            />,
          )
        }
        const accentW = r * 0.03 + 1
        for (let i = 0; i < 3; i++) {
          const yOff = -r * 0.6 + i * r * 0.6
          list.push(
            <rect
              key={`accent${i}`}
              x={cx - r}
              y={cy + yOff}
              width={r * 2}
              height={accentW}
              fill={c.colors[3] ?? c.colors[0]}
              opacity={0.4}
            />,
          )
        }
        break
      }
    }
    return list
  }, [c, cx, cy, r, seed])

  return (
    <g opacity={c.opacity ?? 0.85}>
      <clipPath id={id}>
        <circle cx={cx} cy={cy} r={r * 0.97} />
      </clipPath>
      <g clipPath={`url(#${id})`}>{elements}</g>
    </g>
  )
}

const PlanetHero = memo(function PlanetHero({ planet, size = 220 }: Props) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.3
  const v = getPlanetVisual(planet.id)
  const gradient = v.core.colors
  const gradId = `hero-grad-${planet.id}`
  const seed = planet.id.charCodeAt(0) + planet.id.charCodeAt(planet.id.length - 1)

  const particles = useMemo(() => {
    if (!v.particles) return []
    const pc = v.particles
    return Array.from({ length: pc.count }, (_, i) => ({
      angle: seeded(i, seed) * 360,
      dist: r * (0.8 + seeded(i, seed + 1) * (pc.spread - 0.8)),
      pr: pc.size[0] + seeded(i, seed + 2) * (pc.size[1] - pc.size[0]),
      delay: seeded(i, seed + 3) * pc.speed,
      opacity: seeded(i, seed + 4) * 0.12 + 0.04,
    }))
  }, [v.particles, r, seed])

  const atmosphereId = `hero-atmos-${planet.id}`
  const haloId = `hero-halo-${planet.id}`

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full select-none"
      style={{ maxWidth: size, maxHeight: size }}
      role="img"
      aria-label={planet.name}
    >
      <defs>
        <radialGradient id={gradId} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor={gradient[0]} stopOpacity="1" />
          <stop offset="50%" stopColor={gradient[1]} stopOpacity="1" />
          <stop offset="100%" stopColor={gradient[2]} stopOpacity="1" />
        </radialGradient>
        <radialGradient id={atmosphereId} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor={v.atmosphere.color} stopOpacity={v.atmosphere.opacity} />
          <stop offset="100%" stopColor={v.atmosphere.color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={v.halo.color} stopOpacity={v.halo.opacity} />
          <stop offset="70%" stopColor={v.halo.color} stopOpacity={v.halo.opacity * 0.3} />
          <stop offset="100%" stopColor={v.halo.color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={planet.color} stopOpacity="0.06" />
          <stop offset="60%" stopColor={planet.color} stopOpacity="0.015" />
          <stop offset="100%" stopColor={planet.color} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={r * 2.5} fill="url(#hero-bg)" />

      <circle
        cx={cx}
        cy={cy}
        r={r * v.halo.size}
        fill={`url(#${haloId})`}
        className={v.halo.animation === 'pulse' ? 'animate-breathe' : ''}
        style={v.halo.animation === 'pulse' ? { animationDuration: `${v.halo.speed}s` } : undefined}
      />

      <circle
        cx={cx}
        cy={cy}
        r={r * 1.5}
        fill={`url(#${atmosphereId})`}
        className={v.atmosphere.animation === 'breathe' ? 'animate-breathe' : ''}
        style={v.atmosphere.animation === 'breathe' ? { animationDuration: `${v.atmosphere.speed}s` } : undefined}
      />

      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={`url(#${gradId})`}
        style={{ animation: `breathe ${v.animation.breatheSpeed}s ease-in-out infinite` }}
      />

      <HeroSurfacePattern pid={planet.id} cx={cx} cy={cy} r={r} />

      {v.continents && (
        <g opacity={v.continents.opacity}>
          <clipPath id={`hero-cont-${planet.id}`}>
            <circle cx={cx} cy={cy} r={r * 0.97} />
          </clipPath>
          <g clipPath={`url(#hero-cont-${planet.id})`}>
            {Array.from({ length: v.continents.count }, (_, i) => {
              const angle = seeded(i, seed + 10) * 360
              const rad = (angle * Math.PI) / 180
              const dist = seeded(i, seed + 11) * r * 0.45
              const ccx = cx + dist * Math.cos(rad)
              const ccy = cy + dist * Math.sin(rad)
              const cw = seeded(i, seed + 12) * r * 0.5 + r * 0.15
              const ch = seeded(i, seed + 13) * r * 0.4 + r * 0.08
              return (
                <ellipse
                  key={i}
                  cx={ccx}
                  cy={ccy}
                  rx={cw}
                  ry={ch}
                  fill={v.continents!.color}
                  transform={`rotate(${seeded(i, seed + 14) * 360} ${ccx} ${ccy})`}
                />
              )
            })}
          </g>
        </g>
      )}

      {v.clouds && (
        <g opacity={v.clouds.opacity}>
          <clipPath id={`hero-cloud-${planet.id}`}>
            <circle cx={cx} cy={cy} r={r * 0.97} />
          </clipPath>
          <g clipPath={`url(#hero-cloud-${planet.id})`}>
            {Array.from({ length: v.clouds.count }, (_, i) => {
              const angle = seeded(i, seed + 20) * 360
              const rad = (angle * Math.PI) / 180
              const dist = seeded(i, seed + 21) * r * 0.55
              const ccx = cx + dist * Math.cos(rad)
              const ccy = cy + dist * Math.sin(rad)
              const cw = seeded(i, seed + 22) * r * 0.8 + r * 0.1
              const ch = seeded(i, seed + 23) * r * 0.2 + r * 0.03
              return (
                <ellipse
                  key={i}
                  cx={ccx}
                  cy={ccy}
                  rx={cw}
                  ry={ch}
                  fill={v.clouds!.color}
                  transform={`rotate(${seeded(i, seed + 24) * 360} ${ccx} ${ccy})`}
                />
              )
            })}
          </g>
        </g>
      )}

      {v.shadow.intensity > 0 && (
        <path
          d={`M${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`}
          fill={v.shadow.color}
          opacity={v.shadow.intensity * 0.5}
          transform={`rotate(${v.shadow.angle} ${cx} ${cy})`}
        />
      )}

      {v.particles && particles.length > 0 && (
        <g
          style={{
            animation: `planet-rotate ${v.particles.speed}s linear infinite`,
            transformOrigin: `${cx}px ${cy}px`,
          }}
        >
          {particles.map((p, i) => (
            <g
              key={i}
              style={{
                animation: `planet-rotate ${v.particles!.speed}s linear ${p.delay}s infinite`,
                transformOrigin: `${cx}px ${cy}px`,
              }}
            >
              <circle cx={cx + p.dist} cy={cy} r={p.pr} fill={v.particles!.color} opacity={p.opacity} />
            </g>
          ))}
        </g>
      )}

      <ellipse
        cx={cx - r * 0.2}
        cy={cy - r * 0.25}
        rx={r * 0.35}
        ry={r * 0.12}
        fill="rgba(255,255,255,0.04)"
        transform={`rotate(-20 ${cx} ${cy})`}
      />
    </svg>
  )
})

export default PlanetHero
