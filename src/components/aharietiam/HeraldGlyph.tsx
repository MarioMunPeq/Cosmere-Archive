'use client'
import { useMemo } from 'react'

interface Props {
  seed: string
  color: string
  size?: number
  className?: string
}

function createRng(seed: string): () => number {
  let state = 2166136261
  for (let index = 0; index < seed.length; index++) {
    state ^= seed.charCodeAt(index)
    state = Math.imul(state, 16777619)
  }
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

interface Mark {
  ringSegments: Array<{ start: number; end: number; radius: number }>
  spokes: Array<{ angle: number; inner: number; outer: number; branch: boolean }>
  dots: Array<{ angle: number; radius: number; size: number }>
  chords: Array<{ x: number; y: number; dx: number; dy: number }>
}

function buildMark(seed: string): Mark {
  const rng = createRng(seed)
  const ringSegments = Array.from({ length: 9 }, (_, index) => {
    const start = (index / 9) * Math.PI * 2 + rng() * 0.06
    return {
      start,
      end: start + 0.24 + rng() * 0.2,
      radius: 24.5 + rng() * 2.4,
    }
  })
  const spokes = Array.from({ length: 7 }, (_, index) => {
    const angle = (index / 7) * Math.PI * 2 + 0.2 + rng() * 0.18
    return {
      angle,
      inner: 6 + rng() * 4,
      outer: 17 + rng() * 5.5,
      branch: rng() > 0.45,
    }
  })
  const dots = Array.from({ length: 6 }, () => ({
    angle: rng() * Math.PI * 2,
    radius: 13 + rng() * 12,
    size: 0.7 + rng() * 0.9,
  }))
  const chords = Array.from({ length: 4 }, () => ({
    x: -8 + rng() * 6,
    y: -12 + rng() * 24,
    dx: 8 + rng() * 9,
    dy: (rng() - 0.5) * 10,
  }))
  return { ringSegments, spokes, dots, chords }
}

/**
 * A Vorin-minded seal for one Herald. The geometry is seeded, so the same
 * Herald is always the same mark and no two Heralds share one.
 */
export default function HeraldGlyph({ seed, color, size = 52, className }: Props) {
  const mark = useMemo(() => buildMark(seed), [seed])

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={{ color, display: 'block', overflow: 'visible' }}
    >
      <g transform="translate(32 32)" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round">
        <circle r="30" strokeOpacity="0.4" />
        {mark.ringSegments.map((segment, index) => {
          const startX = Math.cos(segment.start) * segment.radius
          const startY = Math.sin(segment.start) * segment.radius
          const endX = Math.cos(segment.end) * segment.radius
          const endY = Math.sin(segment.end) * segment.radius
          return (
            <path
              key={`ring-${index}`}
              d={`M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${segment.radius.toFixed(2)} ${segment.radius.toFixed(2)} 0 0 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`}
              strokeOpacity="0.75"
            />
          )
        })}
        <circle r="8.5" strokeOpacity="0.55" />
        <path d="M 0 -18 L 0 18" strokeOpacity="0.8" />
        <path d="M -8 -4 L -15 -8 L -11 0 L -15 8 L -8 4" strokeOpacity="0.65" />
        <path d="M 8 -4 L 15 -8 L 11 0 L 15 8 L 8 4" strokeOpacity="0.65" />
        <path d="M 0 -8 L 5 0 L 0 8 L -5 0 Z" fill="currentColor" fillOpacity="0.18" strokeOpacity="0.9" />
        {mark.spokes.map((spoke, index) => {
          const innerX = Math.cos(spoke.angle) * spoke.inner
          const innerY = Math.sin(spoke.angle) * spoke.inner
          const outerX = Math.cos(spoke.angle) * spoke.outer
          const outerY = Math.sin(spoke.angle) * spoke.outer
          const branchX = Math.cos(spoke.angle + 0.42) * (spoke.outer + 3.5)
          const branchY = Math.sin(spoke.angle + 0.42) * (spoke.outer + 3.5)
          return (
            <g key={`spoke-${index}`}>
              <path
                d={`M ${innerX.toFixed(2)} ${innerY.toFixed(2)} L ${outerX.toFixed(2)} ${outerY.toFixed(2)}`}
                strokeOpacity="0.62"
              />
              {spoke.branch ? (
                <path
                  d={`M ${outerX.toFixed(2)} ${outerY.toFixed(2)} L ${branchX.toFixed(2)} ${branchY.toFixed(2)}`}
                  strokeOpacity="0.4"
                />
              ) : null}
            </g>
          )
        })}
        {mark.chords.map((chord, index) => (
          <path
            key={`chord-${index}`}
            d={`M ${chord.x.toFixed(2)} ${chord.y.toFixed(2)} l ${(chord.dx * 0.55).toFixed(2)} ${(chord.dy * 0.5).toFixed(2)} l ${(chord.dx * 0.45).toFixed(2)} ${(chord.dy * 0.5).toFixed(2)}`}
            strokeOpacity="0.3"
          />
        ))}
        {mark.dots.map((dot, index) => (
          <circle
            key={`dot-${index}`}
            cx={(Math.cos(dot.angle) * dot.radius).toFixed(2)}
            cy={(Math.sin(dot.angle) * dot.radius).toFixed(2)}
            r={dot.size.toFixed(2)}
            fill="currentColor"
            stroke="none"
            fillOpacity="0.75"
          />
        ))}
      </g>
    </svg>
  )
}
