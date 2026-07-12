import type { Planet } from '@/types'

const PLANET_APPEARANCE: Record<
  string,
  'storm' | 'mist' | 'crystal' | 'desert' | 'forest' | 'spore' | 'shadow' | 'flame'
> = {
  roshar: 'storm',
  scadrial: 'mist',
  sel: 'crystal',
  nalthis: 'crystal',
  taldain: 'desert',
  threnody: 'shadow',
  'first-of-the-sun': 'forest',
  komashi: 'crystal',
  lumar: 'spore',
  canticle: 'flame',
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (n >> 16) + amt))
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt))
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt))
  return `rgb(${r},${g},${b})`
}

interface Props {
  planet: Planet
  r: number
  selected: boolean
  onClick: () => void
}

export default function AstronomicalPlanet({ planet, r, selected, onClick }: Props) {
  const cx = 0
  const cy = 0
  const app = PLANET_APPEARANCE[planet.id] ?? 'crystal'
  const highlight = shade(planet.color, 90)
  const shadow = shade(planet.color, -90)
  const gradId = `pl-grad-${planet.id}`
  const atmoId = `pl-atmo-${planet.id}`

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <g
      onClick={onClick}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-label={planet.name}
      className="star-chart-planet"
      style={{ cursor: 'pointer', outline: 'none' }}
      opacity={selected ? 1 : 0.75}
    >
      {/* Invisible large hit area */}
      <circle cx={cx} cy={cy} r={r + 6} fill="transparent" />

      {/* Hover glow ring — CSS driven via className */}
      <circle
        cx={cx}
        cy={cy}
        r={r * 1.6}
        fill={`url(#${atmoId})`}
        className="planet-glow"
        opacity={selected ? 0.7 : 0}
      />

      {/* Selected decorative ring */}
      {selected && (
        <circle
          cx={cx}
          cy={cy}
          r={r * 1.3}
          fill="none"
          stroke={planet.color}
          strokeWidth="0.5"
          opacity="0.25"
          strokeDasharray="2 3"
        />
      )}

      {/* Planet sphere */}
      <circle cx={cx} cy={cy} r={r} fill={`url(#${gradId})`} className="planet-sphere" />

      {/* Surface patterns */}
      {app === 'storm' && (
        <>
          <path
            d={`M ${-r * 0.5} ${-r * 0.5} Q ${-r * 0.1} ${-r * 0.7} ${r * 0.15} ${-r * 0.4} Q ${r * 0.4} ${-r * 0.1} ${r * 0.55} ${-r * 0.35}`}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.4"
          />
          <path
            d={`M ${-r * 0.55} ${0} Q ${-r * 0.2} ${-r * 0.2} ${r * 0.1} ${-r * 0.15} Q ${r * 0.35} ${-r * 0.05} ${r * 0.45} ${-r * 0.2}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.35"
          />
          <path
            d={`M ${-r * 0.35} ${r * 0.35} Q ${0} ${r * 0.2} ${r * 0.25} ${r * 0.3} Q ${r * 0.45} ${r * 0.4} ${r * 0.6} ${r * 0.15}`}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.3"
          />
        </>
      )}
      {app === 'mist' && (
        <>
          <path
            d={`M ${-r * 0.65} ${-r * 0.15} Q ${-r * 0.25} ${-r * 0.4} ${0} ${-r * 0.05} Q ${r * 0.25} ${r * 0.3} ${r * 0.55} ${r * 0.1}`}
            fill="none"
            stroke="rgba(200,210,255,0.05)"
            strokeWidth="1.5"
          />
          <path
            d={`M ${-r * 0.45} ${r * 0.3} Q ${-r * 0.1} ${0} ${r * 0.2} ${r * 0.15} Q ${r * 0.45} ${r * 0.3} ${r * 0.7} ${r * 0.25}`}
            fill="none"
            stroke="rgba(200,210,255,0.03)"
            strokeWidth="1.8"
          />
        </>
      )}
      {app === 'crystal' && (
        <>
          <line
            x1={-r * 0.25}
            y1={-r * 0.4}
            x2={r * 0.15}
            y2={-r * 0.25}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="0.25"
          />
          <line
            x1={r * 0.15}
            y1={-r * 0.25}
            x2={r * 0.4}
            y2={-r * 0.5}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.25"
          />
          <polygon
            points={`${-r * 0.15},${r * 0.3} ${0.05 * r},${r * 0.45} ${r * 0.3},${r * 0.2} ${r * 0.1},${r * 0.1}`}
            fill="rgba(255,255,255,0.04)"
          />
        </>
      )}
      {app === 'desert' && (
        <>
          <ellipse cx={-r * 0.1} cy={r * 0.2} rx={r * 0.35} ry={r * 0.07} fill="rgba(180,150,80,0.06)" />
          <ellipse cx={r * 0.2} cy={-r * 0.1} rx={r * 0.25} ry={r * 0.05} fill="rgba(180,150,80,0.04)" />
        </>
      )}
      {app === 'forest' && (
        <>
          <circle cx={-r * 0.12} cy={-r * 0.12} r={r * 0.07} fill="rgba(120,210,120,0.06)" />
          <circle cx={r * 0.18} cy={r * 0.08} r={r * 0.05} fill="rgba(120,210,120,0.04)" />
        </>
      )}
      {app === 'spore' && (
        <>
          <circle cx={-r * 0.18} cy={-r * 0.08} r={r * 0.035} fill="rgba(255,200,230,0.08)" />
          <circle cx={r * 0.08} cy={-r * 0.25} r={r * 0.025} fill="rgba(255,200,230,0.06)" />
          <circle cx={r * 0.25} cy={r * 0.12} r={r * 0.04} fill="rgba(255,200,230,0.05)" />
        </>
      )}
      {app === 'shadow' && (
        <path
          d={`M ${-r * 0.4} ${-r * 0.5} A ${r * 0.6} ${r * 0.6} 0 0 1 ${r * 0.45} ${r * 0.35}`}
          fill="none"
          stroke="rgba(30,10,50,0.1)"
          strokeWidth="1.8"
        />
      )}
      {app === 'flame' && (
        <>
          <path
            d={`M ${-r * 0.15} ${-r * 0.35} Q ${r * 0.12} ${-r * 0.5} ${r * 0.28} ${-r * 0.25} Q ${r * 0.45} ${0} ${r * 0.25} ${r * 0.25}`}
            fill="none"
            stroke="rgba(255,150,50,0.06)"
            strokeWidth="0.8"
          />
          <path
            d={`M ${-r * 0.35} ${r * 0.08} Q ${-r * 0.15} ${-r * 0.15} ${0.02 * r} ${-r * 0.25} Q ${r * 0.18} ${-r * 0.35} ${r * 0.35} ${-r * 0.18}`}
            fill="none"
            stroke="rgba(255,200,100,0.04)"
            strokeWidth="0.6"
          />
        </>
      )}

      {/* Specular highlight */}
      <ellipse
        cx={-r * 0.18}
        cy={-r * 0.18}
        rx={r * 0.28}
        ry={r * 0.07}
        fill="rgba(255,255,255,0.04)"
        transform={`rotate(-25 ${-r * 0.18} ${-r * 0.18})`}
      />

      {/* Shadow crescent */}
      <path
        d={`M ${r * 0.2} ${-r * 0.7} A ${r * 0.7} ${r * 0.7} 0 0 1 ${r * 0.2} ${r * 0.7} A ${r * 0.5} ${r * 0.7} 0 0 0 ${r * 0.2} ${-r * 0.7}`}
        fill="rgba(0,0,0,0.03)"
      />

      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={highlight} stopOpacity="0.9" />
          <stop offset="35%" stopColor={planet.color} stopOpacity="0.85" />
          <stop offset="75%" stopColor={planet.color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={shadow} stopOpacity="0.4" />
        </radialGradient>
        <radialGradient id={atmoId} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor={planet.color} stopOpacity="0.1" />
          <stop offset="100%" stopColor={planet.color} stopOpacity="0" />
        </radialGradient>
      </defs>
    </g>
  )
}
