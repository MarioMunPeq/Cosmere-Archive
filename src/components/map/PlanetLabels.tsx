import { PLANETS } from '@/data/static'
import { memo } from 'react'

const PlanetLabels = memo(function PlanetLabels() {
  return (
    <g>
      {PLANETS.map((p) => {
        const labelX = p.x + p.size * 0.4 + 8
        return (
          <g
            key={`lbl-${p.id}`}
            className="pointer-events-none select-none"
            style={{ animation: 'label-appear 0.6s ease-out both' }}
          >
            <line
              x1={p.x + p.size * 0.4}
              y1={p.y}
              x2={labelX}
              y2={p.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.5"
            />
            <text
              x={labelX + 3}
              y={p.y + 3}
              fill="rgba(255,255,255,0.35)"
              fontSize="8"
              fontFamily="ui-monospace, SFMono-Regular, monospace"
              letterSpacing="0.05em"
            >
              {p.name.toUpperCase()}
            </text>
          </g>
        )
      })}
    </g>
  )
})

export default PlanetLabels
