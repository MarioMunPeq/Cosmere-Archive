'use client'
import { memo, type ReactNode } from 'react'

export default memo(function Camera({ children }: { children: ReactNode }) {
  return (
    <div
      className="absolute inset-0"
      style={{ perspective: '1200px', zIndex: 2 }}
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'scale(1.55) rotateX(22.5deg) translateY(5%)',
        }}
      >
        {children}
      </div>
    </div>
  )
})
