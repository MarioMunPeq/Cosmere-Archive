import type { Planet } from '@/types/planet'

interface Props {
  planet: Planet
  isSelected: boolean
  isHighlighted: boolean  // for worldhopper route highlighting
  size: number            // visual body radius
  onClick: () => void
}

export default function PlanetRenderer({ planet, isSelected, isHighlighted, size, onClick }: Props) {
  const c = planet.color
  const r = size

  // Shared selection / hover ring
  const ringR = r * 1.6

  return (
    <g
      onClick={onClick}
      className="cursor-pointer transition-opacity duration-300"
      opacity={isHighlighted ? 1 : 0.6}
    >
      {/* Selection / hover ring */}
      {(isSelected || isHighlighted) && (
        <circle
          cx={planet.x}
          cy={planet.y}
          r={ringR}
          fill="none"
          stroke={isSelected ? '#fbbf24' : c}
          strokeWidth={isSelected ? 2 : 1}
          opacity={isSelected ? 0.7 : 0.3}
          strokeDasharray={isSelected ? 'none' : '4 4'}
        />
      )}

      {/* Atmosphere glow */}
      <circle
        cx={planet.x}
        cy={planet.y}
        r={r * 1.3}
        fill="none"
        stroke={c}
        strokeWidth="6"
        opacity={0.12}
      />

      {/* ── Planet-specific rendering ──────────────── */}
      {renderPlanetBody(planet, r)}

      {/* Name label */}
      <text
        x={planet.x}
        y={planet.y + r + 14}
        textAnchor="middle"
        fill={isSelected ? '#fbbf24' : '#9ca3af'}
        fontSize="11"
        fontWeight={isSelected ? 'bold' : 'normal'}
        className="pointer-events-none select-none"
      />
    </g>
  )
}

function renderPlanetBody(planet: Planet, r: number) {
  const { x, y, id, color: c } = planet

  switch (id) {
    /* ── Roshar: storm bands ───────────── */
    case "roshar":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill={c} opacity={0.85} />
          {/* Storm bands */}
          {[-0.3, -0.1, 0.1, 0.3].map((offset, i) => (
            <path
              key={i}
              d={`M ${x - r} ${y + offset * r} Q ${x - r * 0.5} ${y + offset * r - 3} ${x} ${y + offset * r} Q ${x + r * 0.5} ${y + offset * r + 3} ${x + r} ${y + offset * r}`}
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              opacity={0.3}
            />
          ))}
          {/* Lightning bolt */}
          <path
            d={`M ${x - 2} ${y - r * 0.4} L ${x + 1} ${y - r * 0.1} L ${x - 1} ${y} L ${x + 3} ${y + r * 0.3}`}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            opacity={0.6}
          />
        </g>
      )

    /* ── Scadrial: volcanic ash spots ──── */
    case "scadrial":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill={c} opacity={0.85} />
          {/* Ash spots */}
          {[
            [-0.4, -0.3], [0.2, -0.4], [-0.2, 0.1], [0.4, 0.2], [-0.35, 0.35],
            [0.1, -0.2], [-0.1, 0.4], [0.35, -0.1],
          ].map(([dx, dy], i) => (
            <circle
              key={i}
              cx={x + dx * r}
              cy={y + dy * r}
              r={3 + Math.random() * 2}
              fill="#1a1a1a"
              opacity={0.4}
            />
          ))}
          {/* Mist line */}
          <path
            d={`M ${x - r * 0.7} ${y + r * 0.4} Q ${x} ${y + r * 0.6} ${x + r * 0.7} ${y + r * 0.4}`}
            fill="none"
            stroke="white"
            strokeWidth="1"
            opacity={0.2}
            strokeDasharray="2 3"
          />
        </g>
      )

    /* ── Sel: Aon symbols ──────────────── */
    case "sel":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill={c} opacity={0.85} />
          {/* Aon-like circle */}
          <circle cx={x} cy={y} r={r * 0.5} fill="none" stroke="white" strokeWidth="1" opacity={0.3} />
          <circle cx={x} cy={y} r={r * 0.3} fill="none" stroke="white" strokeWidth="0.8" opacity={0.3} />
          {/* Center dot */}
          <circle cx={x} cy={y} r={2} fill="white" opacity={0.5} />
          {/* Lines radiating */}
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <line
              key={angle}
              x1={x + Math.cos((angle * Math.PI) / 180) * r * 0.3}
              y1={y + Math.sin((angle * Math.PI) / 180) * r * 0.3}
              x2={x + Math.cos((angle * Math.PI) / 180) * r * 0.5}
              y2={y + Math.sin((angle * Math.PI) / 180) * r * 0.5}
              stroke="white"
              strokeWidth="0.8"
              opacity={0.3}
            />
          ))}
        </g>
      )

    /* ── Nalthis: ringed planet ────────── */
    case "nalthis":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill={c} opacity={0.85} />
          {/* Planetary ring */}
          <ellipse
            cx={x}
            cy={y}
            rx={r * 1.8}
            ry={r * 0.3}
            fill="none"
            stroke={c}
            strokeWidth="2"
            opacity={0.5}
            transform={`rotate(-20 ${x} ${y})`}
          />
          <ellipse
            cx={x}
            cy={y}
            rx={r * 1.5}
            ry={r * 0.2}
            fill="none"
            stroke={c}
            strokeWidth="1"
            opacity={0.3}
            transform={`rotate(-20 ${x} ${y})`}
          />
          {/* Color coronas */}
          <circle cx={x - r * 0.15} cy={y - r * 0.2} r={3} fill="white" opacity={0.2} />
          <circle cx={x + r * 0.25} cy={y + r * 0.15} r={2.5} fill="white" opacity={0.15} />
        </g>
      )

    /* ── Taldain: day/night split ──────── */
    case "taldain":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill={c} opacity={0.85} />
          {/* Day/night split */}
          <path
            d={`M ${x} ${y - r} A ${r} ${r} 0 0 0 ${x} ${y + r} Z`}
            fill="#1a1a1a"
            opacity={0.6}
          />
          {/* Terminator line */}
          <line x1={x} y1={y - r} x2={x} y2={y + r} stroke={c} strokeWidth="1.5" />
          {/* Sand dune wave */}
          <path
            d={`M ${x - r * 0.5} ${y + r * 0.1} Q ${x - r * 0.25} ${y - r * 0.05} ${x} ${y + r * 0.1} Q ${x + r * 0.25} ${y + r * 0.25} ${x + r * 0.4} ${y + r * 0.1}`}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1"
            opacity={0.3}
          />
        </g>
      )

    /* ── Threnody: shadow world ────────── */
    case "threnody":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill={c} opacity={0.85} />
          {/* Shadow aura */}
          <circle cx={x} cy={y} r={r * 0.7} fill="none" stroke="white" strokeWidth="1" opacity={0.15} />
          {/* Silhouette trees */}
          {[
            [x - r * 0.3, y + r * 0.2],
            [x - r * 0.1, y + r * 0.3],
            [x + r * 0.25, y + r * 0.15],
          ].map(([tx, ty], i) => (
            <polygon
              key={i}
              points={`${tx},${ty} ${tx - 4},${ty + 10} ${tx + 4},${ty + 10}`}
              fill="#1a1a1a"
              opacity={0.5}
            />
          ))}
        </g>
      )

    /* ── First of the Sun ──────────────── */
    case "first-of-the-sun":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill={c} opacity={0.85} />
          {/* Bird silhouette */}
          <path
            d={`M ${x - r * 0.4} ${y + r * 0.1} Q ${x - r * 0.2} ${y - r * 0.2} ${x} ${y - r * 0.15} Q ${x + r * 0.2} ${y - r * 0.1} ${x + r * 0.4} ${y + r * 0.15}`}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            opacity={0.4}
          />
          <circle cx={x - r * 0.15} cy={y - r * 0.35} r={2} fill="#fbbf24" opacity={0.6} />
          {/* Tiny waves */}
          <path
            d={`M ${x - r * 0.5} ${y + r * 0.35} Q ${x - r * 0.25} ${y + r * 0.45} ${x} ${y + r * 0.35} Q ${x + r * 0.25} ${y + r * 0.25} ${x + r * 0.5} ${y + r * 0.35}`}
            fill="none"
            stroke="white"
            strokeWidth="0.8"
            opacity={0.2}
          />
        </g>
      )

    /* ── Komashi: yin-yang split ───────── */
    case "komashi":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill="#1a1a2e" opacity={0.85} />
          {/* Split circle */}
          <path d={`M ${x} ${y - r} A ${r} ${r} 0 0 1 ${x} ${y + r} Z`} fill={c} opacity={0.7} />
          {/* Yin-yang dots */}
          <circle cx={x} cy={y - r * 0.4} r={4} fill="#1a1a2e" opacity={0.8} />
          <circle cx={x} cy={y + r * 0.4} r={4} fill={c} opacity={0.8} />
          {/* Paint brush strokes */}
          <path
            d={`M ${x + r * 0.3} ${y - r * 0.6} Q ${x + r * 0.5} ${y - r * 0.1} ${x + r * 0.2} ${y + r * 0.3}`}
            fill="none"
            stroke="white"
            strokeWidth="1"
            opacity={0.25}
            strokeDasharray="2 2"
          />
        </g>
      )

    /* ── Lumar: dragon scales ──────────── */
    case "lumar":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill={c} opacity={0.85} />
          {/* Scale pattern */}
          {[0, 1, 2].flatMap((row) =>
            [0, 1, 2, 3].map((col) => {
              const sx = x + (col - 1.5) * r * 0.45
              const sy = y + (row - 1) * r * 0.4
              return (
                <ellipse
                  key={`${row}-${col}`}
                  cx={sx}
                  cy={sy}
                  rx={r * 0.2}
                  ry={r * 0.15}
                  fill="none"
                  stroke="white"
                  strokeWidth="0.8"
                  opacity={0.2}
                />
              )
            }),
          )}
          {/* Dragon eye */}
          <ellipse cx={x + r * 0.1} cy={y - r * 0.1} rx={4} ry={2.5} fill="#1a1a1a" opacity={0.5} />
        </g>
      )

    /* ── Canticle: sunburst ────────────── */
    case "canticle":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill={c} opacity={0.85} />
          {/* Sun rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180
            const x1 = x + Math.cos(rad) * r * 0.3
            const y1 = y + Math.sin(rad) * r * 0.3
            const x2 = x + Math.cos(rad) * r * 0.7
            const y2 = y + Math.sin(rad) * r * 0.7
            return (
              <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="1" opacity={0.25} />
            )
          })}
          {/* Core */}
          <circle cx={x} cy={y} r={r * 0.25} fill="#fbbf24" opacity={0.2} />
        </g>
      )

    /* ── Default fallback ──────────────── */
    default:
      return <circle cx={x} cy={y} r={r} fill={c} opacity={0.85} />
  }
}
