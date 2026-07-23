import { useMemo } from 'react'

interface Props {
  inscription: string
  seed?: number
}

function pRand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export default function DestroyedManuscript({ inscription, seed = 42 }: Props) {
  const cracks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        x1: 15 + pRand(seed + i * 7) * 70,
        y1: 10 + pRand(seed + i * 11) * 80,
        angle: pRand(seed + i * 13) * 360,
        len: 20 + pRand(seed + i * 17) * 40,
        opacity: 0.04 + pRand(seed + i * 19) * 0.06,
      })),
    [seed],
  )

  const stains = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        cx: 20 + pRand(seed + i * 23) * 60,
        cy: 15 + pRand(seed + i * 29) * 70,
        r: 8 + pRand(seed + i * 31) * 15,
        opacity: 0.02 + pRand(seed + i * 37) * 0.04,
      })),
    [seed],
  )

  const fibers = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        x: pRand(seed + i * 41) * 100,
        y: pRand(seed + i * 43) * 100,
        angle: pRand(seed + i * 47) * 180,
        len: 3 + pRand(seed + i * 53) * 8,
      })),
    [seed],
  )

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '2px',
      }}
    >
      {/* Base parchment */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 70% at 45% 40%, #e8dcc8 0%, #d4c4a8 40%, #c4b498 70%, #b0a088 100%)
          `,
        }}
      />

      {/* Paper grain texture */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}>
        <defs>
          <filter id="manuscript-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#manuscript-noise)" />
      </svg>

      {/* Age staining — large blotches */}
      {stains.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${s.cx}%`,
            top: `${s.cy}%`,
            width: `${s.r}%`,
            height: `${s.r * 1.2}%`,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(120,90,50,${s.opacity}), transparent 70%)`,
          }}
        />
      ))}

      {/* Burn marks — subtle scorching at edges */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '35%',
          height: '30%',
          background: `
            radial-gradient(ellipse at 85% 15%, rgba(60,30,10,0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 100% 0%, rgba(40,20,5,0.06) 0%, transparent 40%)
          `,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '25%',
          height: '25%',
          background: `
            radial-gradient(ellipse at 10% 90%, rgba(60,30,10,0.06) 0%, transparent 50%)
          `,
        }}
      />

      {/* Moisture marks — rings */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '12%',
          height: '12%',
          borderRadius: '50%',
          border: '1px solid rgba(100,80,50,0.04)',
          boxShadow: 'inset 0 0 8px rgba(100,80,50,0.03)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '30%',
          left: '25%',
          width: '8%',
          height: '10%',
          borderRadius: '50%',
          border: '1px solid rgba(100,80,50,0.03)',
        }}
      />

      {/* Ink spills */}
      <div
        style={{
          position: 'absolute',
          top: '55%',
          left: '10%',
          width: '6%',
          height: '3%',
          borderRadius: '60% 40% 50% 50%',
          background: 'rgba(30,20,10,0.06)',
          transform: 'rotate(-15deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '35%',
          right: '20%',
          width: '3%',
          height: '5%',
          borderRadius: '40% 60% 50% 50%',
          background: 'rgba(30,20,10,0.04)',
          transform: 'rotate(25deg)',
        }}
      />

      {/* Running ink — drips */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="M 30 20 Q 31 35 29 50 Q 28 60 30 70" stroke="#1a0a00" fill="none" strokeWidth="0.3" />
        <path d="M 70 15 Q 69 25 71 40" stroke="#1a0a00" fill="none" strokeWidth="0.2" />
        <path d="M 50 60 Q 52 70 50 85" stroke="#1a0a00" fill="none" strokeWidth="0.25" />
      </svg>

      {/* Cracks */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {cracks.map((c, i) => {
          const rad = (c.angle * Math.PI) / 180
          const x2 = c.x1 + Math.cos(rad) * c.len * 0.3
          const y2 = c.y1 + Math.sin(rad) * c.len * 0.3
          return (
            <line key={i} x1={c.x1} y1={c.y1} x2={x2} y2={y2} stroke="#3a2a1a" strokeWidth="0.15" opacity={c.opacity} />
          )
        })}
      </svg>

      {/* Paper fibers */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.035 }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {fibers.map((f, i) => {
          const rad = (f.angle * Math.PI) / 180
          return (
            <line
              key={i}
              x1={f.x}
              y1={f.y}
              x2={f.x + Math.cos(rad) * f.len}
              y2={f.y + Math.sin(rad) * f.len}
              stroke="#5a4a3a"
              strokeWidth="0.08"
            />
          )
        })}
      </svg>

      {/* Torn edges — top */}
      <svg
        style={{ position: 'absolute', top: -1, left: 0, width: '100%', height: '12%' }}
        viewBox="0 0 200 20"
        preserveAspectRatio="none"
      >
        <path
          d={`M 0 8 Q 5 2 12 6 Q 18 10 25 4 Q 32 0 40 5 Q 48 9 55 3 Q 62 0 70 6 Q 78 10 85 4
              Q 92 1 100 7 Q 108 11 115 5 Q 122 1 130 6 Q 138 10 145 3 Q 152 0 160 5 Q 168 9 175 4
              Q 182 1 190 6 Q 195 9 200 5 L 200 20 L 0 20 Z`}
          fill="#030712"
        />
        <path
          d={`M 0 8 Q 5 2 12 6 Q 18 10 25 4 Q 32 0 40 5 Q 48 9 55 3 Q 62 0 70 6 Q 78 10 85 4
              Q 92 1 100 7 Q 108 11 115 5 Q 122 1 130 6 Q 138 10 145 3 Q 152 0 160 5 Q 168 9 175 4
              Q 182 1 190 6 Q 195 9 200 5`}
          fill="none"
          stroke="rgba(180,160,130,0.15)"
          strokeWidth="0.3"
        />
      </svg>

      {/* Torn edges — bottom */}
      <svg
        style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '12%' }}
        viewBox="0 0 200 20"
        preserveAspectRatio="none"
      >
        <path
          d={`M 0 12 Q 8 18 15 14 Q 22 10 30 16 Q 38 20 45 14 Q 52 10 60 15 Q 68 19 75 13
              Q 82 9 90 14 Q 98 18 105 13 Q 112 9 120 15 Q 128 19 135 14 Q 142 10 150 16
              Q 158 20 165 14 Q 172 10 180 15 Q 188 19 195 14 Q 198 12 200 14 L 200 0 L 0 0 Z`}
          fill="#030712"
        />
        <path
          d={`M 0 12 Q 8 18 15 14 Q 22 10 30 16 Q 38 20 45 14 Q 52 10 60 15 Q 68 19 75 13
              Q 82 9 90 14 Q 98 18 105 13 Q 112 9 120 15 Q 128 19 135 14 Q 142 10 150 16
              Q 158 20 165 14 Q 172 10 180 15 Q 188 19 195 14 Q 198 12 200 14`}
          fill="none"
          stroke="rgba(180,160,130,0.12)"
          strokeWidth="0.3"
        />
      </svg>

      {/* Torn edges — left */}
      <svg
        style={{ position: 'absolute', top: 0, left: -1, width: '8%', height: '100%' }}
        viewBox="0 0 12 200"
        preserveAspectRatio="none"
      >
        <path
          d={`M 6 0 Q 2 8 5 15 Q 9 22 3 30 Q 0 38 4 45 Q 8 52 2 60 Q 0 68 5 75
              Q 9 82 3 90 Q 0 98 4 105 Q 8 112 2 120 Q 0 128 5 135 Q 9 142 3 150
              Q 0 158 4 165 Q 8 172 2 180 Q 0 188 5 195 Q 6 200 6 200 L 12 200 L 12 0 Z`}
          fill="#030712"
        />
      </svg>

      {/* Torn edges — right */}
      <svg
        style={{ position: 'absolute', top: 0, right: -1, width: '8%', height: '100%' }}
        viewBox="0 0 12 200"
        preserveAspectRatio="none"
      >
        <path
          d={`M 6 0 Q 10 8 7 15 Q 3 22 9 30 Q 12 38 8 45 Q 4 52 10 60 Q 12 68 7 75
              Q 3 82 9 90 Q 12 98 8 105 Q 4 112 10 120 Q 12 128 7 135 Q 3 142 9 150
              Q 12 158 8 165 Q 4 172 10 180 Q 12 188 7 195 Q 6 200 6 200 L 0 200 L 0 0 Z`}
          fill="#030712"
        />
      </svg>

      {/* Center inscription — faded into the paper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(14px, 1.6vw, 22px)',
            fontWeight: 300,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'transparent',
            background: 'linear-gradient(180deg, rgba(90,70,45,0.08) 0%, rgba(90,70,45,0.04) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            userSelect: 'none',
          }}
        >
          {inscription}
        </span>
      </div>

      {/* Vignette — dark edges */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 85% 85% at 50% 50%, transparent 40%, rgba(60,40,20,0.06) 100%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Page fold shadow — left spine */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '15%',
          height: '100%',
          background: 'linear-gradient(90deg, rgba(0,0,0,0.06) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
