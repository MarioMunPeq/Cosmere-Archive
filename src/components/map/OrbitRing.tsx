import { memo } from 'react'

interface Props {
  cx: number
  cy: number
  r: number
  color: string
}

const DOT_COUNT = 6
const DOT_R = 1.5

function OrbitRing({ cx, cy, r, color }: Props) {
  const dots: { angle: number }[] = Array.from({ length: DOT_COUNT }, (_, i) => ({
    angle: (i * 360) / DOT_COUNT,
  }))

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={0.3} opacity={0.15} />
      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'orbit-spin 8s linear infinite' }}>
        {dots.map((d, i) => {
          const rad = (d.angle * Math.PI) / 180
          const dx = cx + r * Math.cos(rad)
          const dy = cy + r * Math.sin(rad)
          return (
            <circle
              key={i}
              cx={dx}
              cy={dy}
              r={DOT_R}
              fill={color}
              opacity={0.5}
              style={{ animation: 'orbit-pulse 2s ease-in-out infinite', animationDelay: `${i * 0.3}s` }}
            />
          )
        })}
      </g>
    </g>
  )
}

export default memo(OrbitRing)
