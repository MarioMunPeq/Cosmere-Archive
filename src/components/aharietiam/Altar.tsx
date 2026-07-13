'use client'
import { memo } from 'react'

const RUNE_COUNT = 12
const RUNE_RADIUS_PCT = 42

export default memo(function Altar() {
  return (
    <div
      className="absolute"
      style={{
        left: 'calc(50% - 6vmin)',
        top: 'calc(50% - 6vmin)',
        width: '12vmin',
        height: '12vmin',
        transformStyle: 'preserve-3d',
        transform: 'translateZ(3px)',
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          inset: 0,
          borderRadius: '50%',
          border: '1px solid rgba(255,235,210,0.02)',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
        }}
      />

      <div
        className="absolute rounded-full"
        style={{
          left: '15%',
          top: '15%',
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          border: '0.5px solid rgba(255,235,210,0.012)',
          boxShadow: 'inset 0 0 15px rgba(0,0,0,0.25)',
        }}
      />

      <div
        className="absolute rounded-full"
        style={{
          left: '28%',
          top: '28%',
          width: '44%',
          height: '44%',
          borderRadius: '50%',
          border: '0.5px solid rgba(255,235,210,0.008)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.35)',
        }}
      />

      <div
        className="absolute rounded-full"
        style={{
          left: '36%',
          top: '36%',
          width: '28%',
          height: '28%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 50%, #100c08 0%, #080503 100%)',
          boxShadow: 'inset 0 0 12px rgba(0,0,0,0.5)',
        }}
      />

      {Array.from({ length: RUNE_COUNT }).map((_, i) => {
        const angle = (i / RUNE_COUNT) * Math.PI * 2 - Math.PI / 2
        const left = 50 + (RUNE_RADIUS_PCT / 2) * Math.cos(angle)
        const top = 50 + (RUNE_RADIUS_PCT / 2) * Math.sin(angle)
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: '0.4vmin',
              height: '0.4vmin',
              borderRadius: '50%',
              background: 'rgba(255,235,210,0.012)',
            }}
          />
        )
      })}

      {[0, 3, 6, 9].map((i) => {
        const angle = (i / RUNE_COUNT) * Math.PI * 2 - Math.PI / 2
        const left = 50 + (RUNE_RADIUS_PCT / 2) * Math.cos(angle)
        const top = 50 + (RUNE_RADIUS_PCT / 2) * Math.sin(angle)
        return (
          <div
            key={`cardinal-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: 0,
              height: 0,
              borderLeft: '0.3vmin solid transparent',
              borderRight: '0.3vmin solid transparent',
              borderBottom: `0.5vmin solid rgba(255,235,210,0.02)`,
              transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
            }}
          />
        )
      })}

      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.02 }}>
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2 - Math.PI / 2
          const x2 = 50 + 48 * Math.cos(angle)
          const y2 = 50 + 48 * Math.sin(angle)
          return (
            <line
              key={i}
              x1="50%"
              y1="50%"
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="rgba(255,235,210,0.2)"
              strokeWidth={0.2}
            />
          )
        })}
      </svg>
    </div>
  )
})
