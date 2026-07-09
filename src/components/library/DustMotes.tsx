import { useMemo } from 'react'

const PARTICLE_COUNT = 60
const DRIFT_NAMES = ['dust-drift-1', 'dust-drift-2', 'dust-drift-3', 'dust-drift-4']

function r(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export default function DustMotes() {
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      left: r(2, 98),
      top: r(0, 100),
      size: r(1.5, 5),
      opacity: r(0.08, 0.3),
      duration: r(14, 30),
      delay: r(0, 25),
      drift: DRIFT_NAMES[i % DRIFT_NAMES.length],
    }))
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-amber-100"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            animation: `${p.drift} ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: `0 0 ${p.size * 3}px rgba(255, 220, 180, ${p.opacity * 0.6})`,
          }}
        />
      ))}
    </div>
  )
}
