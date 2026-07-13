'use client'
import { memo } from 'react'

const R = 50
const R_MINOR = 42
const R_CIRCLE_1 = 38
const R_CIRCLE_2 = 30
const R_CIRCLE_3 = 22

const CRACKS = [
  'M47,14 Q44,18 40,20 Q36,21 33,24 Q30,27 28,30',
  'M68,22 Q72,28 78,30 Q84,33 90,34 Q94,36 98,38',
  'M32,68 Q36,72 42,74 Q48,76 54,80 Q58,84 62,88',
  'M78,64 Q74,58 70,54 Q66,50 60,46 Q56,44 52,42',
  'M60,12 Q64,16 68,18 Q74,20 80,22 Q86,23 92,24',
  'M12,52 Q16,56 22,58 Q28,60 34,64 Q38,68 42,72',
  'M85,50 Q80,48 76,44 Q72,40 66,36 Q62,34 58,32',
  'M42,88 Q40,82 36,78 Q32,74 28,70 Q24,66 20,62',
  'M52,8 Q50,12 48,16 Q44,20 40,24 Q36,28 34,32',
  'M8,48 Q12,44 18,42 Q24,40 30,38 Q36,36 42,34',
  'M38,58 Q42,56 48,54 Q54,52 60,50 Q66,48 72,46',
  'M58,42 Q54,46 50,50 Q46,54 42,58 Q38,62 34,66',
  'M72,72 Q68,68 64,64 Q60,60 56,56 Q52,52 48,48',
  'M28,28 Q32,32 36,36 Q40,40 44,44 Q48,48 52,52',
  'M18,36 Q22,40 28,42 Q34,44 40,46',
  'M82,36 Q78,40 72,42 Q66,44 60,46',
]

const WEAR_SPOTS = [
  '35% 30%', '68% 42%', '25% 65%', '72% 75%', '50% 20%',
  '20% 45%', '80% 55%', '38% 78%', '62% 28%', '45% 85%',
]

export default memo(function Ground() {
  return (
    <div
      className="absolute"
      style={{
        left: '-80%',
        top: '-100%',
        width: '260%',
        height: '300%',
        transformStyle: 'preserve-3d',
        transform: 'translateZ(-10px)',
      }}
    >
      {/* ▸ Base stone — extended terrain */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 55% at 50% 55%,
              #2a1f17 0%,
              #18120d 35%,
              #0d0907 65%,
              #030205 100%
            )
          `,
        }}
      />

      {/* ▸ Grain / relief — tool-mark texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,235,210,0.045) 2px, transparent 3px),
            repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(255,235,210,0.025) 4px, transparent 5px)
          `,
        }}
      />

      {/* ▸ Ceremonial platform — large stone disk */}
      <div
        className="absolute rounded-full"
        style={{
          left: `calc(50% - ${R}vmin)`,
          top: `calc(50% - ${R}vmin)`,
          width: `${R * 2}vmin`,
          height: `${R * 2}vmin`,
          background: `
            radial-gradient(ellipse at 50% 50%,
              #382b20 0%,
              #2d2118 12%,
              #221912 28%,
              #1a130d 50%,
              #110c08 72%,
              #0a0705 100%
            )
          `,
          boxShadow: `
            inset 0 2px 8px rgba(210,190,165,0.05),
            inset 0 0 30px rgba(0,0,0,0.15),
            0 12px 30px rgba(0,0,0,0.7),
            0 -1px 6px rgba(180,160,135,0.02)
          `,
        }}
      />

      {/* ▸ Cylinder wall rim — gradient face for depth */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: `calc(50% - ${R}vmin)`,
          top: `calc(50% + ${R - 2}vmin)`,
          width: `${R * 2}vmin`,
          height: '3vmin',
          background: `
            linear-gradient(180deg,
              rgba(30,22,16,1) 0%,
              rgba(15,10,7,1) 50%,
              rgba(5,3,2,1) 100%
            )
          `,
          borderRadius: '0 0 50% 50%',
          filter: 'blur(1px)',
        }}
      />

      {/* ▸ Outer edge ring — bevel highlight */}
      <div
        className="absolute rounded-full border pointer-events-none"
        style={{
          left: `calc(50% - ${R}vmin)`,
          top: `calc(50% - ${R}vmin)`,
          width: `${R * 2}vmin`,
          height: `${R * 2}vmin`,
          border: '1.5px solid rgba(210,190,165,0.025)',
          boxShadow: 'inset 0 0 15px rgba(0,0,0,0.2)',
        }}
      />

      {/* ▸ Minor ring — platform inner boundary */}
      <div
        className="absolute rounded-full border pointer-events-none"
        style={{
          left: `calc(50% - ${R_MINOR}vmin)`,
          top: `calc(50% - ${R_MINOR}vmin)`,
          width: `${R_MINOR * 2}vmin`,
          height: `${R_MINOR * 2}vmin`,
          border: '1px solid rgba(210,190,165,0.018)',
        }}
      />

      {/* ▸ Ceremonial engraved circles */}
      {[R_CIRCLE_1, R_CIRCLE_2, R_CIRCLE_3].map((r, i) => (
        <div
          key={i}
          className="absolute rounded-full border pointer-events-none"
          style={{
            left: `calc(50% - ${r}vmin)`,
            top: `calc(50% - ${r}vmin)`,
            width: `${r * 2}vmin`,
            height: `${r * 2}vmin`,
            border: '1px solid rgba(210,190,165,0.012)',
            boxShadow: i === 2 ? 'inset 0 0 40px rgba(0,0,0,0.15)' : 'none',
          }}
        />
      ))}

      {/* ▸ Wear / patina — uneven surface discolouration */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 35% 30%, rgba(200,180,155,0.12) 0%, transparent 40%),
            radial-gradient(circle at 70% 65%, rgba(0,0,0,0.18) 0%, transparent 35%),
            radial-gradient(circle at 20% 75%, rgba(200,180,155,0.06) 0%, transparent 30%),
            radial-gradient(circle at 80% 25%, rgba(0,0,0,0.12) 0%, transparent 45%),
            ${WEAR_SPOTS.map((s) => `radial-gradient(circle at ${s}, rgba(255,235,210,0.04) 0%, transparent 25%)`).join(',')}
          `,
        }}
      />

      {/* ▸ Stone cracks */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.1 }}
      >
        {CRACKS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="rgba(0,0,0,0.7)"
            strokeWidth={0.4 + (i % 4) * 0.25}
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* ▸ Edge ambient occlusion */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 50% 48% at 50% 52%,
              transparent 35%,
              rgba(0,0,0,0.15) 50%,
              rgba(0,0,0,0.35) 70%,
              rgba(0,0,0,0.55) 85%,
              rgba(0,0,0,0.75) 100%
            )
          `,
        }}
      />

      {/* ▸ Directional light — warm key from upper-right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 62% 26%,
              rgba(210,190,165,0.04) 0%,
              transparent 50%
            ),
            linear-gradient(
              145deg,
              rgba(210,190,165,0.03) 0%,
              transparent 30%,
              rgba(0,0,0,0.06) 60%,
              rgba(0,0,0,0.12) 100%
            )
          `,
        }}
      />
    </div>
  )
})
