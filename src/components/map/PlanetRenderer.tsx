import { memo } from 'react'
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

const RENDERERS: Record<string, React.ComponentType<{ x: number; y: number; r: number }>> = {
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
  const BodyRenderer = RENDERERS[planet.id]

  return (
    <g
      onClick={() => onPlanetClick(planet.id)}
      onPointerEnter={() => onPlanetHover(planet.id)}
      onPointerLeave={() => onPlanetHover(null)}
      className="cursor-pointer"
      opacity={isHighlighted ? 1 : 0.4}
      style={{
        transition: 'opacity 0.25s ease-out, transform 0.2s ease-out',
        transformOrigin: `${planet.x} ${planet.y}`,
        transformBox: 'fill-box',
        transform: isHighlighted ? 'scale(1.08)' : 'scale(1)',
      }}
    >
      {(isSelected || isHighlighted) && (
        <circle cx={planet.x} cy={planet.y} r={r * 1.4} fill={planet.color} opacity={0.08} filter="url(#glow)" />
      )}

      {(isSelected || isHighlighted) && (
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
        <BodyRenderer x={planet.x} y={planet.y} r={r} />
      </g>
    </g>
  )
}

export default memo(PlanetRenderer)
