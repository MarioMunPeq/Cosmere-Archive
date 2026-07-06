import { memo, useMemo } from 'react'

function seededUnit(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function createStars(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const twinkleSeed = seededUnit(i, 5)
    return {
      id: i,
      x: seededUnit(i, 1) * 900,
      y: seededUnit(i, 2) * 600,
      r: seededUnit(i, 3) * 0.8 + 0.15,
      opacity: seededUnit(i, 4) * 0.35 + 0.05,
      twinkle: twinkleSeed > 0.6 ? seededUnit(i, 6) * 8 : -1,
    }
  })
}

const StarField = memo(function StarField() {
  const starCount = useMemo(() => (window.innerWidth < 640 ? 100 : 350), [])
  const STARS = useMemo(() => createStars(starCount), [starCount])

  return (
    <g>
      {STARS.map((s) => (
        <circle
          key={s.id}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="white"
          opacity={s.opacity}
          className={s.twinkle >= 0 ? 'animate-twinkle' : ''}
          style={s.twinkle >= 0 ? { animationDelay: `${s.twinkle}s`, animationDuration: '6s' } : undefined}
        />
      ))}
    </g>
  )
})

export default StarField
