'use client'
import { memo } from 'react'

export default memo(function Atmosphere() {
  return (
    <>
      {/* Distant landscape — blurred mountain silhouettes */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        {/* Sky gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg,
                #070504 0%,
                #0d0907 20%,
                #14100b 40%,
                #18130e 55%,
                #0f0b08 75%,
                #030205 100%
              )
            `,
          }}
        />

        {/* Far mountain range — blurred layer */}
        <div
          className="absolute"
          style={{
            left: '-10%',
            bottom: 0,
            width: '120%',
            height: '45%',
            background: `
              radial-gradient(ellipse 30% 100% at 15% 100%, rgba(25,18,13,0.5) 0%, transparent 100%),
              radial-gradient(ellipse 25% 80% at 40% 100%, rgba(30,22,16,0.35) 0%, transparent 100%),
              radial-gradient(ellipse 35% 90% at 70% 100%, rgba(20,14,10,0.4) 0%, transparent 100%),
              radial-gradient(ellipse 20% 70% at 88% 100%, rgba(28,20,15,0.3) 0%, transparent 100%)
            `,
            filter: 'blur(35px)',
          }}
        />

        {/* Mid mountain layer */}
        <div
          className="absolute"
          style={{
            left: '-5%',
            bottom: 0,
            width: '110%',
            height: '30%',
            background: `
              radial-gradient(ellipse 20% 80% at 25% 100%, rgba(16,11,8,0.6) 0%, transparent 100%),
              radial-gradient(ellipse 15% 70% at 55% 100%, rgba(18,12,9,0.45) 0%, transparent 100%),
              radial-gradient(ellipse 18% 75% at 80% 100%, rgba(14,10,7,0.5) 0%, transparent 100%)
            `,
            filter: 'blur(18px)',
          }}
        />

        {/* Near rocky outcroppings */}
        <div
          className="absolute"
          style={{
            left: 0,
            bottom: 0,
            width: '100%',
            height: '18%',
            background: `
              radial-gradient(ellipse 15% 60% at 10% 100%, rgba(12,8,6,0.35) 0%, transparent 100%),
              radial-gradient(ellipse 12% 50% at 90% 100%, rgba(12,8,6,0.25) 0%, transparent 100%)
            `,
            filter: 'blur(6px)',
          }}
        />

        {/* Ground-level dust haze */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(0deg,
                rgba(180,160,140,0.025) 0%,
                transparent 35%
              ),
              linear-gradient(180deg,
                transparent 70%,
                rgba(180,160,140,0.015) 85%,
                transparent 100%
              )
            `,
            filter: 'blur(12px)',
          }}
        />
      </div>

      {/* Light rays — very subtle volumetric feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 5,
          background: `
            linear-gradient(
              155deg,
              transparent 20%,
              rgba(210,190,165,0.012) 32%,
              transparent 40%,
              rgba(210,190,165,0.008) 50%,
              transparent 60%
            ),
            linear-gradient(
              175deg,
              transparent 45%,
              rgba(210,190,165,0.005) 55%,
              transparent 65%
            )
          `,
        }}
      />

      {/* Ground fog — animated */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 35,
          background: `
            radial-gradient(ellipse 70% 15% at 50% 90%,
              rgba(200,185,165,0.04) 0%,
              transparent 100%
            )
          `,
          filter: 'blur(15px)',
        }}
      />
    </>
  )
})
