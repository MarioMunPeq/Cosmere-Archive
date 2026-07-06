import { memo, useState, useContext, useMemo } from 'react'
import type { Planet } from '@/types/planet'
import { ShardThemeContext } from '@/contexts/ShardThemeContext'
import { getPlanetVisual } from '@/data/static/planet-visuals'

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
        const bandCount = 6
        for (let i = 0; i < bandCount; i++) {
          const yOff = -r + (i / bandCount) * r * 2
          const bandR = r * 0.3
          list.push(
            <ellipse
              key={i}
              cx={cx}
              cy={cy + yOff}
              rx={r * 1.2}
              ry={bandR}
              fill={c.colors[i % c.colors.length]}
              opacity={0.5 + seeded(i, seed) * 0.3}
            />,
          )
        }
        break
      }
      case 'veins': {
        const veinCount = 5
        for (let i = 0; i < veinCount; i++) {
          const angle = seeded(i, seed) * 360
          const rad = (angle * Math.PI) / 180
          const len = r * (0.5 + seeded(i, seed + 1) * 0.5)
          const w = seeded(i, seed + 2) * 1.5 + 0.5
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
              opacity={0.3 + seeded(i, seed + 3) * 0.3}
              strokeLinecap="round"
            />,
          )
        }
        break
      }
      case 'speckled': {
        const dotCount = 12
        for (let i = 0; i < dotCount; i++) {
          const angle = seeded(i, seed) * 360
          const dist = seeded(i, seed + 1) * r * 0.8
          const rad = (angle * Math.PI) / 180
          const dotR = seeded(i, seed + 2) * 1 + 0.3
          list.push(
            <circle
              key={i}
              cx={cx + dist * Math.cos(rad)}
              cy={cy + dist * Math.sin(rad)}
              r={dotR}
              fill={c.colors[i % c.colors.length]}
              opacity={0.4 + seeded(i, seed + 3) * 0.3}
            />,
          )
        }
        break
      }
      case 'metallic': {
        list.push(
          <linearGradient key="metal" id={`metal-${pid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c.colors[0]} />
            <stop offset="30%" stopColor={c.colors[1]} />
            <stop offset="60%" stopColor={c.colors[2]} />
            <stop offset="100%" stopColor={c.colors[3]} />
          </linearGradient>,
        )
        list.push(
          <circle key="fill" cx={cx} cy={cy} r={r * 0.95} fill={`url(#metal-${pid})`} opacity={c.opacity ?? 0.9} />,
        )
        for (let i = 0; i < 3; i++) {
          const angle = seeded(i, seed) * 360
          const rad = (angle * Math.PI) / 180
          list.push(
            <line
              key={`hl-${i}`}
              x1={cx + r * 0.3 * Math.cos(rad)}
              y1={cy + r * 0.3 * Math.sin(rad)}
              x2={cx + r * 1.1 * Math.cos(rad)}
              y2={cy + r * 1.1 * Math.sin(rad)}
              stroke="white"
              strokeWidth="0.3"
              opacity={0.04}
            />,
          )
        }
        break
      }
      case 'scales': {
        const scaleCount = 8
        for (let i = 0; i < scaleCount; i++) {
          const angle = seeded(i, seed) * 360
          const rad = (angle * Math.PI) / 180
          const dist = seeded(i, seed + 1) * r * 0.6
          const sx = cx + dist * Math.cos(rad)
          const sy = cy + dist * Math.sin(rad)
          const sr = seeded(i, seed + 2) * r * 0.2 + r * 0.1
          list.push(
            <circle
              key={i}
              cx={sx}
              cy={sy}
              r={sr}
              fill="none"
              stroke={c.colors[i % c.colors.length]}
              strokeWidth="0.5"
              opacity={0.15 + seeded(i, seed + 3) * 0.15}
            />,
          )
        }
        break
      }
      case 'marble': {
        const swirlCount = 4
        for (let i = 0; i < swirlCount; i++) {
          const angle = seeded(i, seed) * 360
          const rad = (angle * Math.PI) / 180
          const len = r * 1.5
          const cx2 = cx + r * 0.3 * Math.cos(rad)
          const cy2 = cy + r * 0.3 * Math.sin(rad)
          list.push(
            <path
              key={i}
              d={`M${cx2 - len * 0.5 * Math.cos(rad)} ${cy2 - len * 0.5 * Math.sin(rad)} Q${cx2 + len * 0.3 * Math.cos(rad + 0.5)} ${cy2 + len * 0.3 * Math.sin(rad + 0.5)} ${cx2 + len * 0.5 * Math.cos(rad)} ${cy2 + len * 0.5 * Math.sin(rad)}`}
              fill="none"
              stroke={c.colors[i % c.colors.length]}
              strokeWidth={seeded(i, seed + 1) * 2 + 1}
              opacity={0.15 + seeded(i, seed + 2) * 0.15}
              strokeLinecap="round"
            />,
          )
        }
        break
      }
    }
    return list
  }, [c, cx, cy, r, pid, seed])

  if (c.pattern === 'metallic') {
    return <>{elements}</>
  }

  return (
    <g opacity={c.opacity ?? 0.85}>
      <clipPath id={id}>
        <circle cx={cx} cy={cy} r={r * 0.95} />
      </clipPath>
      <g clipPath={`url(#${id})`}>{elements}</g>
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

  const particles = useMemo(() => {
    if (!v.particles) return []
    const seed = planet.id.charCodeAt(0) + planet.id.charCodeAt(planet.id.length - 1)
    return Array.from({ length: v.particles.count }, (_, i) => ({
      angle: seeded(i, seed) * 360,
      dist: r * (0.6 + seeded(i, seed + 1) * (v.particles!.spread - 0.6)),
      pr: v.particles!.size[0] + seeded(i, seed + 2) * (v.particles!.size[1] - v.particles!.size[0]),
      delay: seeded(i, seed + 3) * v.particles!.speed,
    }))
  }, [v.particles, r, planet.id])

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
      {showHalo && (
        <circle
          cx={planet.x}
          cy={planet.y}
          r={r * v.halo.size}
          fill={haloColor}
          opacity={
            isAssociated && theme
              ? theme.glowIntensity * (isPrimary ? 0.3 : 0.15)
              : hovered && !isSelected
                ? 0.12
                : 0.06
          }
          filter="url(#glow)"
          style={{ transition: 'fill 0.5s ease, opacity 0.5s ease' }}
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
            <circle cx={planet.x} cy={planet.y} r={r * 0.95} />
          </clipPath>
          <g clipPath={`url(#cont-${planet.id})`}>
            {Array.from({ length: v.continents.count }, (_, i) => {
              const seed = planet.id.charCodeAt(0) + i
              const angle = seeded(i, seed) * 360
              const rad = (angle * Math.PI) / 180
              const dist = seeded(i, seed + 1) * r * 0.4
              const cx = planet.x + dist * Math.cos(rad)
              const cy = planet.y + dist * Math.sin(rad)
              const cw = seeded(i, seed + 2) * r * 0.5 + r * 0.2
              const ch = seeded(i, seed + 3) * r * 0.35 + r * 0.1
              return (
                <ellipse
                  key={i}
                  cx={cx}
                  cy={cy}
                  rx={cw}
                  ry={ch}
                  fill={v.continents!.color}
                  transform={`rotate(${seeded(i, seed + 4) * 360} ${cx} ${cy})`}
                />
              )
            })}
          </g>
        </g>
      )}

      {v.clouds && (
        <g opacity={v.clouds.opacity}>
          <clipPath id={`cloud-${planet.id}`}>
            <circle cx={planet.x} cy={planet.y} r={r * 0.95} />
          </clipPath>
          <g clipPath={`url(#cloud-${planet.id})`}>
            {Array.from({ length: v.clouds.count }, (_, i) => {
              const seed = planet.id.charCodeAt(planet.id.length - 1) + i
              const angle = seeded(i, seed) * 360
              const rad = (angle * Math.PI) / 180
              const dist = seeded(i, seed + 1) * r * 0.5
              const cx = planet.x + dist * Math.cos(rad)
              const cy = planet.y + dist * Math.sin(rad)
              const cw = seeded(i, seed + 2) * r * 0.7 + r * 0.15
              const ch = seeded(i, seed + 3) * r * 0.2 + r * 0.05
              return (
                <ellipse
                  key={i}
                  cx={cx}
                  cy={cy}
                  rx={cw}
                  ry={ch}
                  fill={v.clouds!.color}
                  transform={`rotate(${seeded(i, seed + 4) * 360} ${cx} ${cy})`}
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

      {particles.length > 0 && (
        <g
          style={{
            animation: `planet-rotate ${v.particles!.speed}s linear infinite`,
            transformOrigin: `${planet.x}px ${planet.y}px`,
          }}
        >
          {particles.map((p, i) => (
            <g
              key={i}
              style={{
                animation: `planet-rotate ${v.particles!.speed}s linear ${p.delay}s infinite`,
                transformOrigin: `${planet.x}px ${planet.y}px`,
              }}
            >
              <circle
                cx={planet.x + p.dist}
                cy={planet.y}
                r={p.pr}
                fill={v.particles!.color}
                opacity={0.15 + seeded(i, planet.id.charCodeAt(0)) * 0.15}
              />
            </g>
          ))}
        </g>
      )}
    </g>
  )
})

export default PlanetRenderer
