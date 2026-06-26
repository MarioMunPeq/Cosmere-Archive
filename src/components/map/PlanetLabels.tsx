import { PLANETS } from '@/data/static'

export default function PlanetLabels() {
  return (
    <g>
      {PLANETS.map((p, i) => {
        const labelX = p.x + p.size * 0.4 + 6
        return (
          <g
            key={`lbl-${p.id}`}
            className="pointer-events-none select-none animate-label-fade"
            style={{ animationDelay: `${0.8 + i * 0.08}s` }}
          >
            <line
              x1={p.x + p.size * 0.4}
              y1={p.y}
              x2={labelX}
              y2={p.y}
              stroke="#6b7280"
              strokeWidth="0.5"
              opacity={0.5}
            />
            <text x={labelX + 2} y={p.y + 3} fill="#6b7280" fontSize="9" fontFamily="ui-monospace, monospace">
              {p.name}
            </text>
          </g>
        )
      })}
    </g>
  )
}
