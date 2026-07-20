import { getPlanetById } from '@/data/static'

interface Props {
  planetId: string
  size?: number
  interactive?: boolean
}

const PLANET_COLORS: Record<string, string> = {
  roshar: '#6b93b8',
  scadrial: '#b87860',
  sel: '#68a068',
  nalthis: '#a078b8',
  taldain: '#c8b060',
  lumar: '#58a8a8',
  canticle: '#c88048',
  komashi: '#4898a8',
  'first-of-the-sun': '#58a878',
  threnody: '#9878a0',
  yolen: '#c8b848',
}

export default function PlanetMarble({ planetId, size = 48, interactive }: Props) {
  const planet = getPlanetById(planetId)
  const color = planet?.color ?? PLANET_COLORS[planetId] ?? '#8a7a6a'
  const r = size / 2
  const cx = r
  const cy = r

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={interactive ? 'cursor-pointer' : ''}
      style={{ filter: 'drop-shadow(0 2px 8px rgba(60,45,30,0.18))' }}
    >
      <defs>
        <radialGradient id={`marble-bg-${planetId}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="40%" stopColor={color} stopOpacity="0.3" />
          <stop offset="80%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.08" />
        </radialGradient>
        <radialGradient id={`marble-glow-${planetId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`marble-shine-${planetId}`} cx="30%" cy="25%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="50%" stopColor="white" stopOpacity="0.04" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`marble-clip-${planetId}`}>
          <circle cx={cx} cy={cy} r={r - 1} />
        </clipPath>
      </defs>

      {/* Shadow */}
      <ellipse cx={cx + 1} cy={cy + 1.5} rx={r} ry={r} fill="rgba(60,45,30,0.10)" />

      {/* Glass body */}
      <circle cx={cx} cy={cy} r={r} fill={`url(#marble-bg-${planetId})`} stroke={`${color}30`} strokeWidth="0.5" />

      {/* Inner glow */}
      <circle cx={cx} cy={cy} r={r - 2} fill={`url(#marble-glow-${planetId})`} opacity="0.4" />

      {/* Highlight/shine */}
      <circle
        cx={cx}
        cy={cy}
        r={r - 1}
        fill={`url(#marble-shine-${planetId})`}
        clipPath={`url(#marble-clip-${planetId})`}
      />

      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r - 0.5} fill="none" stroke={`${color}20`} strokeWidth="0.3" />

      {/* Tiny specular dot */}
      <circle cx={cx - r * 0.15} cy={cy - r * 0.25} r={r * 0.08} fill="white" opacity="0.3" />
    </svg>
  )
}
