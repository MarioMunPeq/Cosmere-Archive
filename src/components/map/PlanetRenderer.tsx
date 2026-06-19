import { memo, useState } from 'react'
import type { Planet } from '@/types/planet'
import RosharRenderer from './renderers/RosharRenderer'
import ScadrialRenderer from './renderers/ScadrialRenderer'
import SelRenderer from './renderers/SelRenderer'
import NalthisRenderer from './renderers/NalthisRenderer'
import TaldainRenderer from './renderers/TaldainRenderer'
import ThrenodyRenderer from './renderers/ThrenodyRenderer'
import FirstOfTheSunRenderer from './renderers/FirstOfTheSunRenderer'
import KomashiRenderer from './renderers/KomashiRenderer'
import LumarRenderer from './renderers/LumarRenderer'
import CanticleRenderer from './renderers/CanticleRenderer'

interface Props {
  planet: Planet
  isSelected: boolean
  isHighlighted: boolean
  size: number
  onPlanetClick: (id: string) => void
  onPlanetHover: (id: string | null) => void
}

type Renderer = React.ComponentType<{ x: number; y: number; r: number }>
const RENDERERS: Record<string, Renderer> = {
  roshar: RosharRenderer,
  scadrial: ScadrialRenderer,
  sel: SelRenderer,
  nalthis: NalthisRenderer,
  taldain: TaldainRenderer,
  threnody: ThrenodyRenderer,
  'first-of-the-sun': FirstOfTheSunRenderer,
  komashi: KomashiRenderer,
  lumar: LumarRenderer,
  canticle: CanticleRenderer,
}

function PlanetRenderer({ planet, isSelected, isHighlighted, size, onPlanetClick, onPlanetHover }: Props) {
  const r = size
  const BodyRenderer: Renderer | undefined = RENDERERS[planet.id]
  const [hovered, setHovered] = useState(false)
  const showExtra = isSelected || isHighlighted
  const showHalo = isSelected || isHighlighted || hovered

  return (
    <g
      onClick={() => onPlanetClick(planet.id)}
      onPointerEnter={() => { setHovered(true); onPlanetHover(planet.id) }}
      onPointerLeave={() => { setHovered(false); onPlanetHover(null) }}
      onFocus={() => { setHovered(true); onPlanetHover(planet.id) }}
      onBlur={() => { setHovered(false); onPlanetHover(null) }}
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
      {(showHalo) && (
        <circle cx={planet.x} cy={planet.y} r={r * 1.4} fill={planet.color} opacity={hovered && !isSelected ? 0.15 : 0.08} filter="url(#glow)" />
      )}

      {showExtra && (
        <circle
          cx={planet.x} cy={planet.y} r={r * 1.6}
          fill="none"
          stroke={isSelected ? '#fbbf24' : planet.color}
          strokeWidth={isSelected ? 2 : 1}
          opacity={isSelected ? 0.7 : 0.3}
          strokeDasharray={isSelected ? 'none' : '4 4'}
        />
      )}

      <g className="animate-breathe">
        {BodyRenderer ? (
          <BodyRenderer x={planet.x} y={planet.y} r={r} />
        ) : (
          <circle cx={planet.x} cy={planet.y} r={r} fill={planet.color} opacity={0.8} />
        )}
      </g>
    </g>
  )
}

export default memo(PlanetRenderer)
