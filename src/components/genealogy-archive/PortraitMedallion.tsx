import { memo, useRef, useState, useCallback, useMemo } from 'react'

export type SizeTier = 'hero' | 'large' | 'medium' | 'small' | 'minor'

interface Props {
  id: string
  name: string
  imageUrl: string
  isSelected: boolean
  isRelated: boolean
  isDeceased: boolean
  isDimmed: boolean
  tier: SizeTier
  depth: number
  onClick: (id: string) => void
  onHover: (id: string | null) => void
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

const GOLD = '#b8964a'
const GOLD_LIGHT = '#d4b060'
const GOLD_BRIGHT = '#e8c870'
const PARCHMENT = '#ede4d2'
const PARCHMENT_DARK = '#d4c8b6'

/* ── Decorative background disc (selected state) ── */
function SelectedDisc({ seed }: { seed: number }) {
  const spokes = 6 + (seed % 4)
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: '165%',
        height: '165%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        zIndex: -1,
        animation: 'discFadeIn 500ms ease',
      }}
    >
      {/* Outer engraved ring */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="76" fill="none" stroke={GOLD} strokeWidth="0.4" opacity="0.15" />
        <circle
          cx="80"
          cy="80"
          r="72"
          fill="none"
          stroke={GOLD}
          strokeWidth="0.25"
          opacity="0.1"
          strokeDasharray="1.5 3.2 0.7 3.2"
        />
        {/* Radial spokes */}
        {Array.from({ length: spokes }, (_, i) => {
          const a = (i / spokes) * Math.PI * 2
          return (
            <line
              key={i}
              x1={80 + Math.cos(a) * 58}
              y1={80 + Math.sin(a) * 58}
              x2={80 + Math.cos(a) * 70}
              y2={80 + Math.sin(a) * 70}
              stroke={GOLD}
              strokeWidth="0.2"
              opacity="0.1"
            />
          )
        })}
        {/* Cardinal dots */}
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((a, i) => (
          <circle key={i} cx={80 + Math.cos(a) * 68} cy={80 + Math.sin(a) * 68} r="1.2" fill={GOLD} opacity="0.1" />
        ))}
      </svg>
      {/* Radial gold gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(184,150,74,0.06) 30%, rgba(184,150,74,0.02) 55%, transparent 70%)`,
        }}
      />
      {/* Parchment texture disc */}
      <div
        style={{
          position: 'absolute',
          inset: '8%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 42% 38%, ${PARCHMENT}18, ${PARCHMENT_DARK}10)`,
          opacity: 0.5,
        }}
      />
    </div>
  )
}

export const PortraitMedallion = memo(function PortraitMedallion({
  id,
  name,
  imageUrl,
  isSelected,
  isRelated,
  isDeceased,
  isDimmed,
  tier,
  depth,
  onClick,
  onHover,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  const seed = useMemo(() => hashStr(id), [id])

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - r.left - r.width / 2) / r.width
      const dy = (e.clientY - r.top - r.height / 2) / r.height
      const amp = 3 - depth * 0.4
      setParallax({ x: dx * amp, y: dy * amp })
    },
    [depth],
  )

  const onEnter = useCallback(() => {
    setHover(true)
    onHover(id)
  }, [id, onHover])
  const onLeave = useCallback(() => {
    setHover(false)
    setParallax({ x: 0, y: 0 })
    onHover(null)
  }, [onHover])

  const shadowY = 4 - depth - parallax.y * 1.5
  const shadowX = -parallax.x * 1.5
  const shadowSpread = isSelected ? 24 : hover ? 18 : 8 + depth * 2
  const shadowAlpha = isSelected ? 0.18 : hover ? 0.14 : 0.06 + depth * 0.015

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation()
        onClick(id)
      }}
      onMouseEnter={onEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onLeave}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(id)
        }
      }}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: 'pointer',
        transform: [`translate(${parallax.x}px, ${parallax.y}px)`, `scale(${hover && !isSelected ? 1.03 : 1})`].join(
          ' ',
        ),
        transition: 'transform 250ms cubic-bezier(0.23,1,0.32,1), opacity 400ms ease',
        opacity: isDimmed ? 0.18 : isDeceased && !isSelected ? 0.5 : 1,
        willChange: 'transform',
      }}
    >
      {/* Decorative background disc — only for selected */}
      {isSelected && <SelectedDisc seed={seed} />}

      {/* Shadow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          boxShadow: [
            `${shadowX}px ${shadowY}px ${shadowSpread}px rgba(0,0,0,${shadowAlpha})`,
            hover ? '0 0 14px rgba(184,150,74,0.06)' : '',
            isSelected ? '0 0 20px rgba(184,150,74,0.10)' : '',
          ]
            .filter(Boolean)
            .join(', '),
          transition: 'box-shadow 250ms ease',
        }}
      />

      {/* Outer gold frame */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: isSelected
            ? `linear-gradient(145deg, ${GOLD_BRIGHT}, ${GOLD_LIGHT} 20%, ${GOLD} 45%, #9a7e3a 65%, ${GOLD_LIGHT} 85%, ${GOLD_BRIGHT})`
            : `linear-gradient(145deg, ${GOLD_LIGHT}, ${GOLD} 35%, #9a7e3a 60%, ${GOLD_LIGHT} 80%, ${GOLD})`,
          padding: isSelected ? 3 : 1.5,
          transition: 'padding 400ms ease, background 400ms ease',
        }}
      >
        <div style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
      </div>

      {/* Metallic highlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Engraved ring */}
      <svg style={{ position: 'absolute', inset: 1, pointerEvents: 'none' }} viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={GOLD_LIGHT}
          strokeWidth="0.3"
          opacity={hover || isSelected ? 0.45 : 0.2}
          strokeDasharray="1.2 2.8 0.6 2.8"
          style={{ transition: 'opacity 250ms ease' }}
        />
        {/* Second decorative ring — selected only */}
        {isSelected && (
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={GOLD}
            strokeWidth="0.2"
            opacity="0.18"
            strokeDasharray="0.8 4 0.4 4"
          />
        )}
      </svg>

      {/* Inner parchment border */}
      <div
        style={{
          position: 'absolute',
          inset: 3,
          borderRadius: '50%',
          border: `0.5px solid rgba(237,228,210,${hover || isSelected ? 0.55 : 0.3})`,
          transition: 'border-color 250ms ease',
        }}
      />

      {/* Portrait area */}
      <div
        style={{
          position: 'absolute',
          inset: 5,
          borderRadius: '50%',
          overflow: 'hidden',
          background: imageUrl ? 'transparent' : `radial-gradient(circle at 40% 35%, ${PARCHMENT}, ${PARCHMENT_DARK})`,
        }}
      >
        <PortraitImage name={name} imageUrl={imageUrl} tier={tier} seed={seed} />
      </div>

      {/* Hover bloom */}
      <div
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(184,150,74,${hover ? 0.07 : 0.02}) 50%, transparent 70%)`,
          pointerEvents: 'none',
          opacity: hover ? 1 : 0,
          transition: 'opacity 250ms ease',
        }}
      />

      {/* Related highlight */}
      {isRelated && (
        <div
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: '50%',
            border: '1px solid rgba(184,150,74,0.18)',
            pointerEvents: 'none',
            animation: 'portraitRelatedPulse 3s ease-in-out infinite',
          }}
        />
      )}

      {/* Selection halo */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            border: '1.5px solid rgba(184,150,74,0.12)',
            boxShadow: '0 0 32px rgba(184,150,74,0.08), inset 0 0 16px rgba(184,150,74,0.03)',
            pointerEvents: 'none',
            animation: 'haloGlow 4s ease-in-out infinite',
          }}
        />
      )}

      {/* Rotating engraved ring (selected) */}
      {isSelected && (
        <svg
          style={{
            position: 'absolute',
            inset: -3,
            width: 'calc(100% + 6px)',
            height: 'calc(100% + 6px)',
            pointerEvents: 'none',
            animation: 'portraitRotateRing 40s linear infinite',
          }}
          viewBox="0 0 106 106"
        >
          <circle
            cx="53"
            cy="53"
            r="51"
            fill="none"
            stroke={GOLD_LIGHT}
            strokeWidth="0.25"
            opacity="0.12"
            strokeDasharray="2 5 1 5"
          />
        </svg>
      )}

      {/* Deceased mark */}
      {isDeceased && (
        <svg
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: isSelected ? 0.08 : 0.12 }}
          viewBox="0 0 100 100"
        >
          <line x1="30" y1="30" x2="70" y2="70" stroke="#5a4a3a" strokeWidth="1" strokeLinecap="round" />
          <line x1="70" y1="30" x2="30" y2="70" stroke="#5a4a3a" strokeWidth="1" strokeLinecap="round" />
        </svg>
      )}
    </div>
  )
})

function PortraitImage({
  name,
  imageUrl,
  tier,
  seed,
}: {
  name: string
  imageUrl: string
  tier: SizeTier
  seed: number
}) {
  const [imgErr, setImgErr] = useState(false)
  const showImage = imageUrl && !imgErr
  const initial = name
    .replace(/^(?:King|Queen|Lord|Lady|Prince|Princess|Highprince|Highprincess)\s+/i, '')
    .charAt(0)
    .toUpperCase()

  if (!showImage) {
    const hue = (seed % 30) - 15
    const ringR = tier === 'hero' ? 36 : tier === 'large' ? 34 : 32
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `radial-gradient(circle at 40% 35%, ${PARCHMENT}, ${PARCHMENT_DARK})`,
          position: 'relative',
        }}
      >
        {/* Paper grain */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '64px 64px',
          }}
        />
        {/* Decorative ring */}
        <svg style={{ position: 'absolute', inset: '12%', opacity: 0.05 }} viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={ringR}
            fill="none"
            stroke={GOLD}
            strokeWidth="0.4"
            strokeDasharray="2 3.5 0.8 3.5"
          />
          <circle cx="50" cy="50" r={ringR - 3} fill="none" stroke={GOLD} strokeWidth="0.2" opacity="0.5" />
        </svg>
        {/* Corner ornaments */}
        <svg style={{ position: 'absolute', inset: '18%', opacity: 0.04 }} viewBox="0 0 100 100">
          <path d="M50 15 L53 20 L50 19 L47 20 Z" fill={GOLD} />
          <path d="M50 85 L53 80 L50 81 L47 80 Z" fill={GOLD} />
          <path d="M15 50 L20 53 L19 50 L20 47 Z" fill={GOLD} />
          <path d="M85 50 L80 53 L81 50 L80 47 Z" fill={GOLD} />
        </svg>
        {/* Monogram */}
        <span
          style={{
            fontSize:
              tier === 'hero'
                ? 'clamp(22px, 3vw, 30px)'
                : tier === 'large'
                  ? 'clamp(16px, 2.2vw, 22px)'
                  : 'clamp(12px, 1.6vw, 16px)',
            fontFamily: 'serif',
            fontWeight: 700,
            lineHeight: 1,
            color: 'transparent',
            background: `linear-gradient(145deg, ${GOLD_LIGHT} 0%, ${GOLD_BRIGHT} 30%, ${GOLD} 55%, ${GOLD_LIGHT} 80%, ${GOLD_BRIGHT} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            filter: `drop-shadow(0 1px 1px rgba(0,0,0,0.08)) drop-shadow(0 0 4px rgba(184,150,74,${0.06 + (hue + 15) * 0.003}))`,
            userSelect: 'none',
          }}
        >
          {initial}
        </span>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      loading="lazy"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: 'saturate(0.92) contrast(1.02)',
      }}
      onError={() => setImgErr(true)}
    />
  )
}
