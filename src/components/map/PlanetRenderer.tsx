import { memo, useState, useContext, useMemo } from 'react'
import type { Planet } from '@/types/planet'
import { ShardThemeContext } from '@/contexts/ShardThemeContext'
import { getPlanetVisual } from '@/data/static/planet-visuals'
import { HighstormDefs, HighstormBack, HighstormFront } from './HighstormLayer'

interface Props {
  planet: Planet
  isSelected: boolean
  isHighlighted: boolean
  size: number
  onPlanetClick: (id: string) => void
  onPlanetHover: (id: string | null) => void
}

function seeded(i: number, s: number): number {
  return Math.abs((Math.sin(i * 12.9898 + s * 78.233) * 43758.5453) % 1)
}

function SurfacePattern({ pid, cx, cy, r }: { pid: string; cx: number; cy: number; r: number }) {
  const v = getPlanetVisual(pid)
  const c = v.surface
  const id = `surf-${pid}`
  const seed = pid.charCodeAt(0) + pid.charCodeAt(pid.length - 1)

  const elements = useMemo(() => {
    const list: React.ReactNode[] = []
    switch (c.pattern) {
      case 'bands': {
        const bandCount = 7
        for (let i = 0; i < bandCount; i++) {
          const yOff = -r + (i / (bandCount - 1)) * r * 2
          const bandR = r * 0.28 + seeded(i, seed) * r * 0.1
          list.push(
            <ellipse
              key={i}
              cx={cx}
              cy={cy + yOff}
              rx={r * 1.3}
              ry={bandR}
              fill={c.colors[i % c.colors.length]}
              opacity={0.4 + seeded(i, seed) * 0.35}
            />,
          )
        }
        break
      }
      case 'veins': {
        const veinCount = 6
        for (let i = 0; i < veinCount; i++) {
          const angle = seeded(i, seed) * 360
          const rad = (angle * Math.PI) / 180
          const len = r * (0.4 + seeded(i, seed + 1) * 0.6)
          const w = seeded(i, seed + 2) * 2 + 0.5
          const x2 = cx + len * Math.cos(rad)
          const y2 = cy + len * Math.sin(rad)
          list.push(
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke={c.colors[i % c.colors.length]}
              strokeWidth={w}
              opacity={0.25 + seeded(i, seed + 3) * 0.3}
              strokeLinecap="round"
            />,
          )
          const branchAngle = rad + (seeded(i, seed + 4) - 0.5) * 1.2
          const branchLen = len * 0.4
          list.push(
            <line
              key={`b${i}`}
              x1={x2}
              y1={y2}
              x2={x2 + branchLen * Math.cos(branchAngle)}
              y2={y2 + branchLen * Math.sin(branchAngle)}
              stroke={c.colors[(i + 2) % c.colors.length]}
              strokeWidth={w * 0.5}
              opacity={0.15}
              strokeLinecap="round"
            />,
          )
        }
        break
      }
      case 'speckled': {
        const dotCount = 16
        for (let i = 0; i < dotCount; i++) {
          const angle = seeded(i, seed) * 360
          const dist = seeded(i, seed + 1) * r * 0.85
          const rad = (angle * Math.PI) / 180
          const dotR = seeded(i, seed + 2) * 1.2 + 0.3
          list.push(
            <circle
              key={i}
              cx={cx + dist * Math.cos(rad)}
              cy={cy + dist * Math.sin(rad)}
              r={dotR}
              fill={c.colors[i % c.colors.length]}
              opacity={0.35 + seeded(i, seed + 3) * 0.35}
            />,
          )
        }
        break
      }
      case 'metallic': {
        list.push(
          <linearGradient key="metal" id={`metal-${pid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c.colors[0]} />
            <stop offset="25%" stopColor={c.colors[1]} />
            <stop offset="50%" stopColor={c.colors[2]} />
            <stop offset="75%" stopColor={c.colors[1]} />
            <stop offset="100%" stopColor={c.colors[3]} />
          </linearGradient>,
        )
        list.push(
          <circle key="fill" cx={cx} cy={cy} r={r * 0.96} fill={`url(#metal-${pid})`} opacity={c.opacity ?? 0.9} />,
        )
        for (let i = 0; i < 5; i++) {
          const angle = seeded(i, seed) * 360
          const rad = (angle * Math.PI) / 180
          list.push(
            <line
              key={`hl-${i}`}
              x1={cx + r * 0.2 * Math.cos(rad)}
              y1={cy + r * 0.2 * Math.sin(rad)}
              x2={cx + r * 1.15 * Math.cos(rad)}
              y2={cy + r * 1.15 * Math.sin(rad)}
              stroke="white"
              strokeWidth={0.2 + seeded(i, seed + 1) * 0.3}
              opacity={0.03 + seeded(i, seed + 2) * 0.03}
            />,
          )
        }
        break
      }
      case 'scales': {
        const scaleCount = 10
        for (let i = 0; i < scaleCount; i++) {
          const angle = seeded(i, seed) * 360
          const rad = (angle * Math.PI) / 180
          const dist = seeded(i, seed + 1) * r * 0.65
          const sx = cx + dist * Math.cos(rad)
          const sy = cy + dist * Math.sin(rad)
          const sr = seeded(i, seed + 2) * r * 0.18 + r * 0.08
          list.push(
            <circle
              key={i}
              cx={sx}
              cy={sy}
              r={sr}
              fill="none"
              stroke={c.colors[i % c.colors.length]}
              strokeWidth={0.4 + seeded(i, seed + 3) * 0.4}
              opacity={0.12 + seeded(i, seed + 4) * 0.15}
            />,
          )
        }
        break
      }
      case 'marble': {
        const swirlCount = 5
        for (let i = 0; i < swirlCount; i++) {
          const angle = seeded(i, seed) * 360
          const rad = (angle * Math.PI) / 180
          const len = r * 1.4
          const offX = r * 0.25 * Math.cos(rad + 0.4)
          const offY = r * 0.25 * Math.sin(rad + 0.4)
          list.push(
            <path
              key={i}
              d={`M${cx - len * 0.4 * Math.cos(rad)} ${cy - len * 0.4 * Math.sin(rad)} Q${cx + offX} ${cy + offY} ${cx + len * 0.4 * Math.cos(rad)} ${cy + len * 0.4 * Math.sin(rad)}`}
              fill="none"
              stroke={c.colors[i % c.colors.length]}
              strokeWidth={seeded(i, seed + 1) * 3 + 1}
              opacity={0.1 + seeded(i, seed + 2) * 0.15}
              strokeLinecap="round"
            />,
          )
        }
        break
      }
      case 'horizontals': {
        const bandCount = 7
        for (let i = 0; i < bandCount; i++) {
          const yOff = -r + (i / (bandCount - 1)) * r * 2
          const bandH = (r * 2) / bandCount
          list.push(
            <rect
              key={i}
              x={cx - r * 1.1}
              y={cy + yOff - bandH / 2}
              width={r * 2.2}
              height={bandH * 0.85}
              fill={c.colors[i % c.colors.length]}
              opacity={0.5 + seeded(i, seed + i) * 0.3}
              rx={1}
            />,
          )
        }
        break
      }
      case 'geometric': {
        const lineCount = 8
        for (let i = 0; i < lineCount; i++) {
          const angle = (i / lineCount) * 360
          const rad = (angle * Math.PI) / 180
          list.push(
            <line
              key={`r${i}`}
              x1={cx}
              y1={cy}
              x2={cx + r * 0.9 * Math.cos(rad)}
              y2={cy + r * 0.9 * Math.sin(rad)}
              stroke={c.colors[i % c.colors.length]}
              strokeWidth={0.4 + seeded(i, seed) * 0.3}
              opacity={0.3 + seeded(i, seed + 1) * 0.25}
            />,
          )
        }
        const ringCount = 3
        for (let i = 0; i < ringCount; i++) {
          const ringR = r * (0.25 + i * 0.22)
          list.push(
            <circle
              key={`ring${i}`}
              cx={cx}
              cy={cy}
              r={ringR}
              fill="none"
              stroke={c.colors[(i + 1) % c.colors.length]}
              strokeWidth={0.3 + seeded(i, seed + 2) * 0.3}
              opacity={0.2 + seeded(i, seed + 3) * 0.15}
            />,
          )
        }
        list.push(<circle key="center" cx={cx} cy={cy} r={r * 0.06} fill={c.colors[2]} opacity={0.6} />)
        break
      }
      case 'smooth': {
        list.push(
          <radialGradient key="smooth" id={`smooth-${pid}`} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor={c.colors[0]} stopOpacity="0.6" />
            <stop offset="60%" stopColor={c.colors[1]} stopOpacity="0.9" />
            <stop offset="100%" stopColor={c.colors[3]} stopOpacity="1" />
          </radialGradient>,
        )
        list.push(
          <circle key="fill" cx={cx} cy={cy} r={r * 0.96} fill={`url(#smooth-${pid})`} opacity={c.opacity ?? 0.85} />,
        )
        break
      }
    }
    return list
  }, [c, cx, cy, r, pid, seed])

  if (c.pattern === 'metallic' || c.pattern === 'smooth') {
    return <>{elements}</>
  }

  return (
    <g opacity={c.opacity ?? 0.85}>
      <clipPath id={id}>
        <circle cx={cx} cy={cy} r={r * 0.96} />
      </clipPath>
      <g clipPath={`url(#${id})`}>{elements}</g>
    </g>
  )
}

function ThematicLayer({ pid, cx, cy, r }: { pid: string; cx: number; cy: number; r: number }) {
  const v = getPlanetVisual(pid)
  const t = v.thematic
  if (!t) return null

  const seed = pid.charCodeAt(0) + pid.charCodeAt(pid.length - 1)

  switch (t.type) {
    case 'storm-spiral': {
      const turns = 4
      const segments = 60
      let d = ''
      for (let i = 0; i <= segments; i++) {
        const progress = i / segments
        const angle = progress * turns * 360
        const rad = (angle * Math.PI) / 180
        const dist = r * 0.15 + progress * r * 0.85
        const x = cx + dist * Math.cos(rad)
        const y = cy + dist * Math.sin(rad)
        d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
      }
      const spiralPath = d

      return (
        <g
          style={{
            animation: 'storm-spin 30s linear infinite',
            transformOrigin: `${cx}px ${cy}px`,
          }}
        >
          <path
            d={spiralPath}
            fill="none"
            stroke={t.colors[1]}
            strokeWidth={r * 0.04}
            strokeLinecap="round"
            opacity={t.opacity ?? 0.35}
            filter="url(#glow)"
          />
          <path
            d={spiralPath}
            fill="none"
            stroke={t.colors[0]}
            strokeWidth={r * 0.015}
            strokeLinecap="round"
            opacity={(t.opacity ?? 0.35) + 0.15}
          />
          {Array.from({ length: 4 }, (_, i) => {
            const a = seeded(i, seed) * 360
            const rad = (a * Math.PI) / 180
            const dist = r * (0.4 + seeded(i, seed + 1) * 0.5)
            return (
              <circle
                key={i}
                cx={cx + dist * Math.cos(rad)}
                cy={cy + dist * Math.sin(rad)}
                r={r * 0.03 + seeded(i, seed + 2) * r * 0.02}
                fill={t.colors[0]}
                opacity={0.3 + seeded(i, seed + 3) * 0.2}
              />
            )
          })}
        </g>
      )
    }
    case 'aon-lines': {
      return (
        <g
          style={{
            animation: 'aon-pulse 3s ease-in-out infinite',
            transformOrigin: `${cx}px ${cy}px`,
          }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={r * 0.7}
            fill="none"
            stroke={t.colors[0]}
            strokeWidth={r * 0.025}
            opacity={t.opacity}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r * 0.5}
            fill="none"
            stroke={t.colors[1]}
            strokeWidth={r * 0.015}
            opacity={t.opacity ? t.opacity * 0.6 : 0.3}
          />
          <circle cx={cx} cy={cy} r={r * 0.06} fill={t.colors[2]} opacity={t.opacity} />
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * 360
            const rad = (angle * Math.PI) / 180
            return (
              <line
                key={i}
                x1={cx + r * 0.5 * Math.cos(rad)}
                y1={cy + r * 0.5 * Math.sin(rad)}
                x2={cx + r * 0.72 * Math.cos(rad)}
                y2={cy + r * 0.72 * Math.sin(rad)}
                stroke={t.colors[i % t.colors.length]}
                strokeWidth={r * 0.015}
                opacity={t.opacity ?? 0.5}
                strokeLinecap="round"
              />
            )
          })}
          {Array.from({ length: 4 }, (_, i) => {
            const angle = 15 + (i / 4) * 90
            const rad = (angle * Math.PI) / 180
            return (
              <line
                key={`c${i}`}
                x1={cx + r * 0.15 * Math.cos(rad)}
                y1={cy + r * 0.15 * Math.sin(rad)}
                x2={cx + r * 0.7 * Math.cos(rad)}
                y2={cy + r * 0.7 * Math.sin(rad)}
                stroke={t.colors[1]}
                strokeWidth={r * 0.01}
                opacity={(t.opacity ?? 0.5) * 0.5}
              />
            )
          })}
        </g>
      )
    }
    case 'day-night-split': {
      return (
        <g>
          <path
            d={`M${cx} ${cy - r * 1.02} L${cx} ${cy + r * 1.02} A ${r * 1.02} ${r * 1.02} 0 0 0 ${cx} ${cy - r * 1.02} Z`}
            fill={t.colors[1]}
            opacity={0.5}
          />
          <line
            x1={cx}
            y1={cy - r * 1.02}
            x2={cx}
            y2={cy + r * 1.02}
            stroke={t.colors[2]}
            strokeWidth={1}
            opacity={0.3}
          />
          {Array.from({ length: 6 }, (_, i) => {
            const a = seeded(i, seed) * 360
            const rad = (a * Math.PI) / 180
            const dist = seeded(i, seed + 1) * r * 0.4 + r * 0.1
            const px = cx - dist * Math.abs(Math.cos(rad))
            const py = cy + dist * Math.sin(rad) * 0.5
            if (px < cx) return null
            return (
              <circle
                key={i}
                cx={px}
                cy={py}
                r={0.4 + seeded(i, seed + 2) * 0.4}
                fill={t.colors[2]}
                opacity={0.3 + seeded(i, seed + 3) * 0.3}
              />
            )
          })}
        </g>
      )
    }
    case 'magma-cracks': {
      return (
        <g
          style={{
            animation: 'magma-glow 4s ease-in-out infinite',
            transformOrigin: `${cx}px ${cy}px`,
          }}
        >
          {Array.from({ length: 5 }, (_, i) => {
            const startAngle = seeded(i, seed) * 360
            const rad = (startAngle * Math.PI) / 180
            const sx = cx + r * 0.15 * Math.cos(rad)
            const sy = cy + r * 0.15 * Math.sin(rad)
            const ex = cx + r * (0.4 + seeded(i, seed + 1) * 0.5) * Math.cos(rad + (seeded(i, seed + 2) - 0.5) * 0.6)
            const ey = cy + r * (0.4 + seeded(i, seed + 1) * 0.5) * Math.sin(rad + (seeded(i, seed + 2) - 0.5) * 0.6)
            const midX = (sx + ex) / 2 + seeded(i, seed + 3) * r * 0.1
            const midY = (sy + ey) / 2 + seeded(i, seed + 4) * r * 0.1
            return (
              <path
                key={i}
                d={`M${sx} ${sy} Q${midX} ${midY} ${ex} ${ey}`}
                fill="none"
                stroke={t.colors[i % t.colors.length]}
                strokeWidth={0.8 + seeded(i, seed + 5) * 0.5}
                opacity={t.opacity ?? 0.25}
                strokeLinecap="round"
              />
            )
          })}
        </g>
      )
    }
    case 'mist': {
      return (
        <g
          style={{
            animation: 'mist-drift 12s ease-in-out infinite',
            transformOrigin: `${cx}px ${cy}px`,
          }}
        >
          {Array.from({ length: 3 }, (_, i) => (
            <ellipse
              key={i}
              cx={cx + seeded(i, seed) * r * 0.3}
              cy={cy + seeded(i, seed + 1) * r * 0.2}
              rx={r * (0.6 + seeded(i, seed + 2) * 0.3)}
              ry={r * (0.15 + seeded(i, seed + 3) * 0.1)}
              fill="none"
              stroke={t.colors[i % t.colors.length]}
              strokeWidth={0.3}
              opacity={t.opacity ?? 0.06}
              style={{ animationDelay: `${i * 2}s` }}
            />
          ))}
          <circle cx={cx} cy={cy} r={r * 0.7} fill={t.colors[2]} opacity={0.03} filter="url(#glow)" />
        </g>
      )
    }
    case 'ancient-glow': {
      return (
        <g
          style={{
            animation: 'ancient-float 6s ease-in-out infinite',
            transformOrigin: `${cx}px ${cy}px`,
          }}
        >
          <circle cx={cx} cy={cy} r={r * 0.8} fill={t.colors[0]} opacity={t.opacity ?? 0.08} filter="url(#glow)" />
          {Array.from({ length: 3 }, (_, i) => (
            <circle
              key={i}
              cx={cx + seeded(i, seed) * r * 0.4}
              cy={cy + seeded(i, seed + 1) * r * 0.35}
              r={r * (0.1 + seeded(i, seed + 2) * 0.15)}
              fill={t.colors[(i + 1) % t.colors.length]}
              opacity={0.03 + seeded(i, seed + 3) * 0.03}
              style={{ animationDelay: `${i * 1.5}s` }}
            />
          ))}
        </g>
      )
    }
    case 'color-waves': {
      return (
        <g
          style={{
            animation: 'color-shift 8s ease-in-out infinite',
            transformOrigin: `${cx}px ${cy}px`,
          }}
        >
          {Array.from({ length: 3 }, (_, i) => (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={r * (0.3 + i * 0.2)}
              ry={r * (0.2 + i * 0.15)}
              fill="none"
              stroke={t.colors[i % t.colors.length]}
              strokeWidth={r * 0.02}
              opacity={t.opacity ?? 0.12}
              transform={`rotate(${i * 30} ${cx} ${cy})`}
            />
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <ellipse
              key={`w${i}`}
              cx={cx}
              cy={cy}
              rx={r * (0.25 + i * 0.18)}
              ry={r * (0.25 + i * 0.18)}
              fill="none"
              stroke={t.colors[(i + 2) % t.colors.length]}
              strokeWidth={r * 0.01}
              opacity={(t.opacity ?? 0.12) * 0.5}
            />
          ))}
        </g>
      )
    }
    default:
      return null
  }
}

function BreakoutParticles({ pid, cx, cy, r }: { pid: string; cx: number; cy: number; r: number }) {
  const v = getPlanetVisual(pid)
  const seed = pid.charCodeAt(0) + pid.charCodeAt(pid.length - 1)

  const driftClass =
    pid === 'scadrial'
      ? 'ash-fall'
      : pid === 'lumar'
        ? 'spore-drift'
        : pid === 'canticle'
          ? 'ember-drift'
          : pid === 'threnody'
            ? 'mist-drift'
            : pid === 'roshar'
              ? 'spore-drift'
              : 'none'

  const items = useMemo(() => {
    if (!v.particles) return []
    const pc = v.particles
    return Array.from({ length: pc.count }, (_, i) => {
      const angle = seeded(i, seed) * 360
      const rad = (angle * Math.PI) / 180
      const dist = r * (0.75 + seeded(i, seed + 1) * (pc.spread - 0.75))
      const delay = seeded(i, seed + 3) * pc.speed
      const pr = pc.size[0] + seeded(i, seed + 2) * (pc.size[1] - pc.size[0])
      return { angle, rad, dist, delay, pr }
    })
  }, [v.particles, r, seed])

  if (!v.particles || items.length === 0) return null

  return (
    <g>
      {items.map((p, i) => {
        const orbiting = pid !== 'scadrial' && pid !== 'threnody' && pid !== 'canticle' && pid !== 'lumar'
        if (orbiting) {
          return (
            <g
              key={i}
              style={{
                animation: `planet-rotate ${v.particles!.speed}s linear ${p.delay}s infinite`,
                transformOrigin: `${cx}px ${cy}px`,
              }}
            >
              <circle
                cx={cx + p.dist}
                cy={cy}
                r={p.pr}
                fill={v.particles!.color}
                opacity={0.12 + seeded(i, seed + 4) * 0.12}
              />
            </g>
          )
        }
        return (
          <circle
            key={i}
            cx={cx + p.dist * Math.cos(p.rad)}
            cy={cy + p.dist * Math.sin(p.rad)}
            r={p.pr}
            fill={v.particles!.color}
            opacity={0}
            style={{
              animation: `${driftClass} ${v.particles!.speed * 1.5}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        )
      })}
    </g>
  )
}

const PlanetRenderer = memo(function PlanetRenderer({
  planet,
  isSelected,
  isHighlighted,
  size,
  onPlanetClick,
  onPlanetHover,
}: Props) {
  const r = size
  const [hovered, setHovered] = useState(false)
  const showRing = isSelected || isHighlighted
  const showHalo = isSelected || isHighlighted || hovered
  const v = getPlanetVisual(planet.id)

  const { theme, isActive, activePlanetIds, primaryPlanetId } = useContext(ShardThemeContext)
  const isPrimary = isActive && primaryPlanetId === planet.id
  const isAssociated = isActive && activePlanetIds.includes(planet.id)

  const haloColor =
    isAssociated && theme
      ? (theme.effects.atmosphereTint ?? theme.haloColor)
      : isActive
        ? 'rgba(255,255,255,0.03)'
        : v.halo.color

  const baseOpacity = isActive && !isAssociated && !isPrimary ? 0.2 : isHighlighted ? 1 : 0.4
  const breatheDuration = v.animation.breatheSpeed

  return (
    <g
      onClick={() => onPlanetClick(planet.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onPlanetClick(planet.id)
      }}
      onPointerEnter={() => {
        setHovered(true)
        onPlanetHover(planet.id)
      }}
      onPointerLeave={() => {
        setHovered(false)
        onPlanetHover(null)
      }}
      onFocus={() => {
        setHovered(true)
        onPlanetHover(planet.id)
      }}
      onBlur={() => {
        setHovered(false)
        onPlanetHover(null)
      }}
      tabIndex={0}
      role="button"
      aria-label={`${planet.name}${planet.shard ? ` — ${planet.shard}` : ''}`}
      className="cursor-pointer outline-none"
      style={{
        opacity: baseOpacity,
        transition: 'opacity 0.5s ease, filter 0.5s ease',
        filter: isPrimary ? 'brightness(1.15)' : 'none',
      }}
    >
      {v.thematic?.type === 'highstorm' && <HighstormDefs pid={planet.id} />}

      {showHalo && (
        <circle
          cx={planet.x}
          cy={planet.y}
          r={r * v.halo.size}
          fill={haloColor}
          opacity={isAssociated && theme ? theme.glowIntensity * (isPrimary ? 0.3 : 0.15) : 0.06}
          filter="url(#glow)"
          style={{
            animation: 'halo-breathe 4s ease-in-out infinite',
            transition: 'fill 0.5s ease',
          }}
        />
      )}

      {showRing && (
        <circle
          cx={planet.x}
          cy={planet.y}
          r={r * (v.halo.size + 0.2)}
          fill="none"
          stroke={
            isPrimary && theme
              ? theme.accent
              : isAssociated && theme
                ? theme.accentSecondary
                : isSelected
                  ? 'rgba(255,255,255,0.4)'
                  : v.halo.color
          }
          strokeWidth={isSelected ? 1.5 : 0.8}
          opacity={isSelected ? 0.5 : 0.2}
          style={{ transition: 'stroke 0.5s ease, opacity 0.5s ease' }}
        />
      )}

      {v.thematic?.type === 'highstorm' && <HighstormBack pid={planet.id} cx={planet.x} cy={planet.y} r={r} />}

      <circle
        cx={planet.x}
        cy={planet.y}
        r={r}
        fill={`url(#grad-${planet.id})`}
        style={{ animation: `breathe ${breatheDuration}s ease-in-out infinite` }}
      />

      <SurfacePattern pid={planet.id} cx={planet.x} cy={planet.y} r={r} />

      {v.continents && (
        <g opacity={v.continents.opacity}>
          <clipPath id={`cont-${planet.id}`}>
            <circle cx={planet.x} cy={planet.y} r={r * 0.96} />
          </clipPath>
          <g clipPath={`url(#cont-${planet.id})`}>
            {Array.from({ length: v.continents.count }, (_, i) => {
              const seed = planet.id.charCodeAt(0) + i
              const angle = seeded(i, seed) * 360
              const rad = (angle * Math.PI) / 180
              const dist = seeded(i, seed + 1) * r * 0.35
              const cxc = planet.x + dist * Math.cos(rad)
              const cyc = planet.y + dist * Math.sin(rad)
              const cw = seeded(i, seed + 2) * r * 0.5 + r * 0.15
              const ch = seeded(i, seed + 3) * r * 0.3 + r * 0.08
              return (
                <ellipse
                  key={i}
                  cx={cxc}
                  cy={cyc}
                  rx={cw}
                  ry={ch}
                  fill={v.continents!.color}
                  transform={`rotate(${seeded(i, seed + 4) * 360} ${cxc} ${cyc})`}
                />
              )
            })}
          </g>
        </g>
      )}

      {v.thematic?.type === 'highstorm' && <HighstormFront pid={planet.id} cx={planet.x} cy={planet.y} r={r} />}
      {v.thematic && v.thematic.type !== 'highstorm' && (
        <ThematicLayer pid={planet.id} cx={planet.x} cy={planet.y} r={r} />
      )}

      {v.clouds && (
        <g opacity={v.clouds.opacity}>
          <clipPath id={`cloud-${planet.id}`}>
            <circle cx={planet.x} cy={planet.y} r={r * 0.96} />
          </clipPath>
          <g clipPath={`url(#cloud-${planet.id})`}>
            {Array.from({ length: v.clouds.count }, (_, i) => {
              const seed = planet.id.charCodeAt(planet.id.length - 1) + i
              const angle = seeded(i, seed) * 360
              const rad = (angle * Math.PI) / 180
              const dist = seeded(i, seed + 1) * r * 0.45
              const cxc = planet.x + dist * Math.cos(rad)
              const cyc = planet.y + dist * Math.sin(rad)
              const cw = seeded(i, seed + 2) * r * 0.7 + r * 0.12
              const ch = seeded(i, seed + 3) * r * 0.15 + r * 0.04
              return (
                <ellipse
                  key={i}
                  cx={cxc}
                  cy={cyc}
                  rx={cw}
                  ry={ch}
                  fill={v.clouds!.color}
                  transform={`rotate(${seeded(i, seed + 4) * 360} ${cxc} ${cyc})`}
                />
              )
            })}
          </g>
        </g>
      )}

      {v.shadow.intensity > 0 && (
        <path
          d={`M${planet.x} ${planet.y - r} A ${r} ${r} 0 0 1 ${planet.x} ${planet.y + r} Z`}
          fill={v.shadow.color}
          opacity={v.shadow.intensity * 0.6}
          transform={`rotate(${v.shadow.angle} ${planet.x} ${planet.y})`}
        />
      )}

      <ellipse
        cx={planet.x - r * 0.2}
        cy={planet.y - r * 0.25}
        rx={r * 0.35}
        ry={r * 0.12}
        fill="rgba(255,255,255,0.04)"
        transform={`rotate(-20 ${planet.x} ${planet.y})`}
      />

      {v.particles && v.particles.count > 0 && <BreakoutParticles pid={planet.id} cx={planet.x} cy={planet.y} r={r} />}
    </g>
  )
})

export default PlanetRenderer
