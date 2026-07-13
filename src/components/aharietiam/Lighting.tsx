'use client'
import { memo } from 'react'

export default memo(function Lighting() {
  return (
    <>
      {/* Warm key light — upper-right */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 50,
          background: `
            radial-gradient(ellipse 35% 30% at 68% 18%,
              rgba(230, 200, 160, 0.025) 0%,
              transparent 100%
            )
          `,
        }}
      />

      {/* Cool ambient fill — lower-left */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 50,
          background: `
            radial-gradient(ellipse 40% 35% at 25% 75%,
              rgba(100, 140, 200, 0.015) 0%,
              transparent 100%
            )
          `,
        }}
      />

      {/* Subtle rim light — back edge of platform */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 50,
          background: `
            radial-gradient(ellipse 55% 20% at 50% 20%,
              rgba(210, 190, 165, 0.02) 0%,
              transparent 70%
            )
          `,
          filter: 'blur(10px)',
        }}
      />

      {/* Very subtle bloom overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 50,
          background: `
            radial-gradient(ellipse 45% 40% at 50% 50%,
              rgba(180, 170, 155, 0.012) 0%,
              transparent 70%
            )
          `,
          mixBlendMode: 'screen',
        }}
      />
    </>
  )
})
