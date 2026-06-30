import { memo, useState } from 'react'
import type { Planet } from '@/types/planet'
import OrbitRing from './OrbitRing'

interface Props {
  planet: Planet
  isSelected: boolean
  isHighlighted: boolean
  size: number
  onPlanetClick: (id: string) => void
  onPlanetHover: (id: string | null) => void
}

function PlanetRenderer({ planet, isSelected, isHighlighted, size, onPlanetClick, onPlanetHover }: Props) {
  const r = size
  const [hovered, setHovered] = useState(false)
  const showExtra = isSelected || isHighlighted
  const showHalo = isSelected || isHighlighted || hovered

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
      opacity={isHighlighted ? 1 : 0.4}
      style={{
        transition: 'opacity 0.25s ease-out, transform 0.2s ease-out',
        transformOrigin: `${planet.x} ${planet.y}`,
        transformBox: 'fill-box',
        transform: isHighlighted ? 'scale(1.08)' : 'scale(1)',
      }}
    >
      {showHalo && (
        <circle
          cx={planet.x}
          cy={planet.y}
          r={r * 1.4}
          fill={planet.color}
          opacity={hovered && !isSelected ? 0.15 : 0.08}
          filter="url(#glow)"
        />
      )}

      {showExtra && (
        <circle
          cx={planet.x}
          cy={planet.y}
          r={r * 1.6}
          fill="none"
          stroke={isSelected ? '#fbbf24' : planet.color}
          strokeWidth={isSelected ? 2 : 1}
          opacity={isSelected ? 0.7 : 0.3}
          strokeDasharray={isSelected ? 'none' : '4 4'}
        />
      )}

      <g className="orbit-ring">
        <OrbitRing cx={planet.x} cy={planet.y} r={r * 1.8} color={planet.color} />
      </g>

      <g className="animate-breathe">
        <circle cx={planet.x} cy={planet.y} r={r} fill={`url(#grad-${planet.id})`} />
      </g>
    </g>
  )
}

export default memo(PlanetRenderer)
