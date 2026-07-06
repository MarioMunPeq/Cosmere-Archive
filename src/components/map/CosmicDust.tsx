import { memo, useMemo } from 'react'
import { MAP_VIEWBOX_W, MAP_VIEWBOX_H } from '@/constants'

function dustUnit(index: number, salt: number): number {
  return Math.abs((Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453) % 1)
}

const DUST_COUNT = 400

const CosmicDust = memo(function CosmicDust() {
  const particles = useMemo(
    () =>
      Array.from({ length: DUST_COUNT }, (_, i) => ({
        id: i,
        x: dustUnit(i, 1) * MAP_VIEWBOX_W,
        y: dustUnit(i, 2) * MAP_VIEWBOX_H,
        r: dustUnit(i, 3) * 0.6 + 0.15,
        opacity: dustUnit(i, 4) * 0.06 + 0.02,
        driftX: (dustUnit(i, 5) - 0.5) * 4,
        driftY: (dustUnit(i, 6) - 0.5) * 4,
        duration: 120 + dustUnit(i, 7) * 120,
        delay: dustUnit(i, 8) * 200,
      })),
    [],
  )

  return (
    <g>
      {particles.map((p) => (
        <circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill="white"
          opacity={p.opacity}
          style={{
            animation: `dust-drift ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
            willChange: 'transform',
            ['--dx' as string]: `${p.driftX}px`,
            ['--dy' as string]: `${p.driftY}px`,
          }}
        />
      ))}
    </g>
  )
})

export default CosmicDust
