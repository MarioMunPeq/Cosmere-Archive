import { useMemo } from 'react'

interface Props {
  planetId?: string | null
  showDeskObjects?: boolean
}

const INK = {
  subtle: '#7a6040',
  muted: '#9a8060',
  faint: 'rgba(80,60,40,0.06)',
}

const STAMPS: { label: string; x: string; y: string; rot: string; color: string; opacity: number }[] = [
  { label: 'SILVERLIGHT\nARCHIVE', x: '72%', y: '12%', rot: '-4deg', color: 'rgba(80,50,30,0.25)', opacity: 1 },
  { label: 'VERIFIED', x: '18%', y: '18%', rot: '6deg', color: 'rgba(50,80,60,0.2)', opacity: 1 },
  { label: 'CLASSIFIED', x: '78%', y: '85%', rot: '-2deg', color: 'rgba(120,50,50,0.15)', opacity: 1 },
]

const MARGINALIA: { text: string; x: string; y: string; rot: string }[] = [
  { text: 'Cf. Khriss, "On the\nMotion of Spheres"', x: '82%', y: '40%', rot: '2deg' },
  { text: 'NB: orbital\nirregularities\nsuggest Investiture\ninterference', x: '6%', y: '55%', rot: '-1.5deg' },
  { text: 'compare with\nScadrian measurements', x: '80%', y: '62%', rot: '3deg' },
]

export default function AtlasImmersiveDetails({ planetId, showDeskObjects = true }: Props) {
  const seed = useMemo(() => {
    if (!planetId) return 0
    let h = 0
    for (let i = 0; i < planetId.length; i++) h = ((h << 5) - h + planetId.charCodeAt(i)) | 0
    return Math.abs(h)
  }, [planetId])

  return (
    <div className="absolute inset-0 pointer-events-none z-[5]" style={{ overflow: 'hidden' }}>
      {/* Official stamps */}
      {STAMPS.map((stamp, i) => (
        <div
          key={`stamp-${i}`}
          className="absolute"
          style={{ left: stamp.x, top: stamp.y, transform: `rotate(${stamp.rot})` }}
        >
          <div
            className="inline-block"
            style={{
              border: `0.5px solid ${stamp.color}`,
              borderRadius: '50% / 30%',
              padding: '2px 5px',
              background: `radial-gradient(ellipse, ${stamp.color.replace('0.25', '0.03').replace('0.2', '0.025').replace('0.15', '0.02')} 0%, transparent 70%)`,
            }}
          >
            {stamp.label.split('\n').map((line, j) => (
              <p
                key={j}
                className="font-serif text-center leading-[1.3]"
                style={{
                  color: stamp.color,
                  fontSize: 'clamp(5px, 0.5vw, 6px)',
                  letterSpacing: '0.12em',
                  fontWeight: 600,
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}

      {/* Marginalia */}
      {MARGINALIA.map((m, i) => (
        <div key={`margin-${i}`} className="absolute" style={{ left: m.x, top: m.y, transform: `rotate(${m.rot})` }}>
          <p
            className="font-serif italic leading-[1.5]"
            style={{
              color: INK.subtle,
              fontSize: 'clamp(5px, 0.5vw, 6px)',
              maxWidth: '75px',
              whiteSpace: 'pre-line',
            }}
          >
            {m.text}
          </p>
        </div>
      ))}

      {/* Desk objects */}
      {showDeskObjects && (
        <>
          {/* Brass compass — bottom right */}
          <div className="absolute" style={{ right: '8%', bottom: '8%' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" style={{ opacity: 0.15 }}>
              <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(140,120,80,0.5)" strokeWidth="1.5" />
              <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(140,120,80,0.2)" strokeWidth="0.5" />
              <line x1="24" y1="6" x2="24" y2="42" stroke="rgba(140,120,80,0.3)" strokeWidth="0.8" />
              <line x1="6" y1="24" x2="42" y2="24" stroke="rgba(140,120,80,0.3)" strokeWidth="0.8" />
              <polygon points="24,8 22,22 26,22" fill="rgba(140,120,80,0.15)" />
              <polygon points="24,40 22,26 26,26" fill="rgba(140,120,80,0.08)" />
              <circle cx="24" cy="24" r="2" fill="rgba(140,120,80,0.2)" />
              <text x="24" y="5" textAnchor="middle" fontSize="5" fill="rgba(140,120,80,0.15)" fontFamily="serif">
                N
              </text>
            </svg>
          </div>

          {/* Quill — left edge */}
          <div className="absolute" style={{ left: '1%', top: '25%', transform: 'rotate(-25deg)' }}>
            <svg width="60" height="160" viewBox="0 0 60 160" style={{ opacity: 0.1 }}>
              <path
                d="M30 155 C28 140, 25 100, 28 50 C30 20, 32 10, 35 5 L37 5 C38 10, 35 20, 34 50 C33 100, 32 140, 30 155Z"
                fill="rgba(80,60,40,0.2)"
                stroke="rgba(80,60,40,0.08)"
                strokeWidth="0.3"
              />
              <path d="M35 5 L37 5 C38 8, 37 12, 35 15Z" fill="rgba(80,60,40,0.06)" />
              <line x1="30" y1="155" x2="30" y2="158" stroke="rgba(80,60,40,0.06)" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Magnifying lens — top right */}
          <div className="absolute" style={{ right: '4%', top: '30%', transform: 'rotate(12deg)' }}>
            <svg width="32" height="52" viewBox="0 0 32 52" style={{ opacity: 0.08 }}>
              <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(140,120,80,0.3)" strokeWidth="1.2" />
              <circle cx="16" cy="16" r="11" fill="none" stroke="rgba(140,120,80,0.08)" strokeWidth="0.3" />
              <line
                x1="25"
                y1="26"
                x2="31"
                y2="50"
                stroke="rgba(140,120,80,0.15)"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
              <circle cx="16" cy="16" r="10" fill="rgba(255,255,255,0.02)" />
              <line x1="11" y1="11" x2="21" y2="21" stroke="rgba(140,120,80,0.04)" strokeWidth="0.3" />
            </svg>
          </div>

          {/* Ruler — bottom left */}
          <div className="absolute" style={{ left: '5%', bottom: '12%', transform: 'rotate(-6deg)' }}>
            <svg width="100" height="12" viewBox="0 0 100 12" style={{ opacity: 0.06 }}>
              <rect
                x="0"
                y="0"
                width="100"
                height="12"
                fill="rgba(160,140,110,0.08)"
                stroke="rgba(160,140,110,0.06)"
                strokeWidth="0.3"
                rx="1"
              />
              {Array.from({ length: 21 }, (_, i) => (
                <line
                  key={i}
                  x1={i * 5}
                  y1={0}
                  x2={i * 5}
                  y2={i % 5 === 0 ? 8 : i % 2 === 0 ? 5 : 3}
                  stroke="rgba(160,140,110,0.06)"
                  strokeWidth="0.3"
                />
              ))}
            </svg>
          </div>
        </>
      )}

      {/* Planet-specific marginalia */}
      {planetId && (
        <div className="absolute" style={{ right: '6%', top: '48%' }}>
          <p
            className="font-serif italic leading-[1.5]"
            style={{ color: INK.subtle, fontSize: 'clamp(5px, 0.5vw, 6px)', maxWidth: '65px' }}
          >
            Obs. {(seed % 1000) + 300} SA
            <br />
            Ap. {((seed % 7) + 3).toFixed(1)} AU
            <br />
            Incl. {(seed % 13) + 1}°
          </p>
        </div>
      )}
    </div>
  )
}
