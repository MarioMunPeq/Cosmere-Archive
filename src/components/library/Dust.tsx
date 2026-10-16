/**
 * Dust — the motes in the air of the archive hall.
 *
 * M3 · block 3. Section 5.3.4 caps this at 24 particles, opacity 0.04–0.10 and a
 * 18–26s drift: enough to make the light feel like it has volume, not enough to
 * be noticed as an effect.
 *
 * Positions are seeded rather than random, for the same reason the spines lean
 * deterministically: a mote that jumps position on every re-render is worse
 * than no mote.
 */

import { useEffect, useRef } from 'react'

interface Props {
  count?: number
  className?: string
}

interface Mote {
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
}

/** Deterministic 0–1 from an integer seed. */
function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export default function Dust({ count = 24, className = '' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  const motes: Mote[] = Array.from({ length: count }, (_, i) => ({
    x: seeded(i * 3 + 1) * 100,
    y: seeded(i * 3 + 2) * 100,
    size: 1 + seeded(i * 3 + 3) * 2,
    opacity: 0.04 + seeded(i * 7 + 4) * 0.06,
    duration: 18 + seeded(i * 11 + 5) * 8,
    delay: seeded(i * 13 + 6) * 18,
  }))

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Cheap containment: pause the whole field when the tab is hidden, which is
    // the difference between a smooth background and a hot tab.
    const onVisibility = () => {
      el.style.animationPlayState = document.hidden ? 'paused' : 'running'
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[var(--text-accent)]"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
            opacity: m.opacity,
            animation: `dust-drift ${m.duration}s linear ${m.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes dust-drift {
          0%   { transform: translate3d(0, 0, 0); }
          25%  { transform: translate3d(14px, -8vh, 0); }
          50%  { transform: translate3d(-10px, -18vh, 0); }
          75%  { transform: translate3d(8px, -26vh, 0); }
          100% { transform: translate3d(0, -34vh, 0); }
        }
      `}</style>
    </div>
  )
}
