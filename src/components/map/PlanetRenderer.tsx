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
  onClick: () => void
  onHover?: (hovering: boolean) => void
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

export default function PlanetRenderer({ planet, isSelected, isHighlighted, size, onClick, onHover }: Props) {
  const c = planet.color
  const r = size
  const BodyRenderer = RENDERERS[planet.id]

  return (
    <g
      onClick={onClick}
      onPointerEnter={() => onHover?.(true)}
      onPointerLeave={() => onHover?.(false)}
      className="cursor-pointer"
      opacity={isHighlighted ? 1 : 0.4}
    >
      {(isSelected || isHighlighted) && (
        <circle cx={planet.x} cy={planet.y} r={r * 1.4} fill={c} opacity={0.08} filter="url(#glow)" />
      )}

      {(isSelected || isHighlighted) && (
        <circle
          cx={planet.x} cy={planet.y} r={r * 1.6}
          fill="none"
          stroke={isSelected ? '#fbbf24' : c}
          strokeWidth={isSelected ? 2 : 1}
          opacity={isSelected ? 0.7 : 0.3}
          strokeDasharray={isSelected ? 'none' : '4 4'}
        />
      )}

      <BodyRenderer x={planet.x} y={planet.y} r={r} />
    </g>
  )
}
