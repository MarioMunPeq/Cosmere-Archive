import { useMemo, useState } from 'react'

interface Props {
  onEnter: () => void
}

const INK = {
  title: '#2a1810',
  body: '#3d2818',
  label: '#4a3020',
  meta: '#5a3d28',
  subtle: '#7a6040',
  muted: '#9a8060',
  faint: '#b8a088',
}

function TitlePageLeft(_: Props) {
  const signatures = useMemo(() => {
    const names = ['Khriss of Silverlight', 'Nazh', 'Mraize', 'Iyatil']
    return names.map((n, i) => ({
      name: n,
      delay: 1.0 + i * 0.4,
    }))
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full px-12 py-16 select-none">
      {/* Decorative top ornament — hand-drawn entry */}
      <div
        className="text-center mb-8 animate-ink-write-fast"
        style={{
          color: INK.muted,
          fontSize: '14px',
          letterSpacing: '6px',
          fontFamily: 'serif',
          animationDelay: '0.1s',
        }}
      >
        ✦ ✦ ✦
      </div>

      {/* Engraved classification */}
      <div className="mb-6 text-center animate-ink-write-fast" style={{ animationDelay: '0.25s' }}>
        <span
          className="inline-block px-5 py-1.5 tracking-[0.25em] font-serif"
          style={{
            color: INK.meta,
            fontSize: 'clamp(8px, 0.85vw, 10px)',
            border: '0.5px solid rgba(140,100,70,0.15)',
            borderRadius: '1px',
          }}
        >
          Restricted · Silverlight Archive · Codex Primus
        </span>
      </div>

      {/* Title — ink-written entrance */}
      <h1 className="font-serif text-center mb-2">
        <span
          className="block text-[clamp(24px,3.2vw,44px)] tracking-[0.35em] font-[900] animate-ink-write"
          style={{ color: INK.title, animationDelay: '0.3s' }}
        >
          SILVERLIGHT
        </span>
        <span
          className="block text-[clamp(17px,2.3vw,32px)] tracking-[0.3em] mt-1 font-[400] animate-ink-write-fast"
          style={{ color: INK.label, animationDelay: '0.7s' }}
        >
          ASTRONOMICAL
        </span>
        <span
          className="block text-[clamp(17px,2.3vw,32px)] tracking-[0.3em] mt-1 font-[400] animate-ink-write-fast"
          style={{ color: INK.label, animationDelay: '0.85s' }}
        >
          ATLAS
        </span>
      </h1>

      {/* Decorative divider — drawn line */}
      <div className="flex items-center gap-4 my-5 w-full max-w-[280px]" style={{ opacity: 0.12 }}>
        <div
          className="flex-1 h-px animate-line-draw"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(140,120,80,0.5))', animationDelay: '1.1s' }}
        />
        <span
          className="text-[16px] animate-fade-in-up"
          style={{ color: 'rgba(140,120,80,0.5)', fontFamily: 'serif', animationDelay: '1.2s' }}
        >
          ❧
        </span>
        <div
          className="flex-1 h-px animate-line-draw"
          style={{ background: 'linear-gradient(270deg, transparent, rgba(140,120,80,0.5))', animationDelay: '1.1s' }}
        />
      </div>

      {/* Volume */}
      <p
        className="font-serif tracking-[0.2em] italic animate-fade-in-up"
        style={{ color: INK.subtle, fontSize: 'clamp(12px, 1.4vw, 18px)', animationDelay: '1.0s' }}
      >
        Volume III
      </p>

      {/* Attestation */}
      <p
        className="font-serif tracking-[0.15em] mt-5 animate-fade-in-up text-center"
        style={{ color: INK.meta, fontSize: 'clamp(8px, 0.85vw, 11px)', animationDelay: '1.2s' }}
      >
        Compiled by the Scholars of the Silverlight Archive
      </p>
      <p
        className="font-serif tracking-[0.1em] mt-1 animate-fade-in-up text-center"
        style={{ color: INK.subtle, fontSize: 'clamp(7px, 0.75vw, 9px)', animationDelay: '1.3s' }}
      >
        Year 342 of the Silverlight Ascendancy
      </p>

      {/* Epigraph */}
      <div className="mt-8 max-w-[300px] text-center animate-fade-in-up" style={{ animationDelay: '1.5s' }}>
        <div className="h-px w-12 mx-auto mb-4" style={{ background: 'rgba(140,120,80,0.1)' }} />
        <p
          className="font-serif italic leading-[1.9]"
          style={{ color: INK.meta, fontSize: 'clamp(8px, 0.85vw, 11px)' }}
        >
          "It is not merely the stars that move,
          <br />
          but the very fabric of the Cosmere."
        </p>
        <p className="font-serif mt-2" style={{ color: INK.subtle, fontSize: 'clamp(7px, 0.7vw, 9px)' }}>
          — Khriss of Silverlight
        </p>
      </div>

      {/* Signatures */}
      <div className="mt-8 w-full max-w-[240px] animate-fade-in-up" style={{ animationDelay: '1.9s' }}>
        <p
          className="font-serif tracking-[0.2em] mb-3 text-center"
          style={{ color: INK.subtle, fontSize: 'clamp(7px, 0.7vw, 9px)' }}
        >
          Attested by
        </p>
        {signatures.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-3 mb-2 animate-fade-in-up"
            style={{ animationDelay: `${s.delay}s` }}
          >
            <div className="flex-1 h-px" style={{ background: 'rgba(80,60,40,0.06)' }} />
            <span className="font-serif italic" style={{ color: INK.subtle, fontSize: 'clamp(7px, 0.7vw, 9px)' }}>
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function compassRose() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" style={{ opacity: 0.08 }}>
      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(60,45,30,0.2)" strokeWidth="0.3" />
      <circle
        cx="100"
        cy="100"
        r="75"
        fill="none"
        stroke="rgba(60,45,30,0.1)"
        strokeWidth="0.3"
        strokeDasharray="2 4"
      />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2
        const x1 = 100 + 40 * Math.cos(a)
        const y1 = 100 + 40 * Math.sin(a)
        const x2 = 100 + 88 * Math.cos(a)
        const y2 = 100 + 88 * Math.sin(a)
        const isCardinal = i % 2 === 0
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(60,45,30,0.15)"
            strokeWidth={isCardinal ? '0.6' : '0.3'}
          />
        )
      })}
      {['N', 'E', 'S', 'W'].map((d, i) => {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2
        return (
          <text
            key={d}
            x={100 + 62 * Math.cos(a)}
            y={100 + 62 * Math.sin(a) + 3}
            textAnchor="middle"
            fontSize="8"
            fill="rgba(60,45,30,0.08)"
            fontFamily="serif"
            fontStyle="italic"
          >
            {d}
          </text>
        )
      })}
    </svg>
  )
}

function SilverlightSeal() {
  return (
    <div className="text-center animate-fade-in-up" style={{ animationDelay: '2.8s' }}>
      <div
        className="inline-flex items-center justify-center"
        style={{
          width: 'clamp(50px, 5vw, 70px)',
          height: 'clamp(50px, 5vw, 70px)',
          borderRadius: '50%',
          border: '1.5px solid rgba(140,120,80,0.2)',
          background: 'radial-gradient(circle, rgba(140,120,80,0.03) 0%, transparent 70%)',
        }}
      >
        <div className="text-center">
          <p
            className="font-serif"
            style={{ color: INK.muted, fontSize: 'clamp(7px, 0.65vw, 9px)', letterSpacing: '0.2em', fontWeight: 600 }}
          >
            SA
          </p>
          <p
            className="font-serif"
            style={{ color: INK.muted, fontSize: 'clamp(4px, 0.45vw, 6px)', letterSpacing: '0.1em' }}
          >
            ARCHIVE
          </p>
        </div>
      </div>
    </div>
  )
}

function TitlePageRight({ onEnter }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center h-full px-12 py-16 select-none relative overflow-hidden">
      {/* Compass rose watermark — background */}
      <div
        className="absolute inset-0 flex items-center justify-center p-16 animate-fade-in-up pointer-events-none"
        style={{ animationDelay: '2.2s' }}
      >
        {compassRose()}
      </div>

      {/* Decorative top border */}
      <div
        className="w-16 h-px mb-14 animate-line-draw-center"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(140,120,80,0.15), transparent)',
          animationDelay: '2.4s',
        }}
      />

      {/* Invitation heading */}
      <div className="text-center animate-fade-in-up z-[1]" style={{ animationDelay: '2.3s' }}>
        <p
          className="font-serif italic"
          style={{ color: INK.subtle, fontSize: 'clamp(8px, 0.8vw, 11px)', letterSpacing: '0.08em' }}
        >
          An account of the known celestial bodies
        </p>
        <p
          className="font-serif italic"
          style={{ color: INK.subtle, fontSize: 'clamp(8px, 0.8vw, 11px)', letterSpacing: '0.08em' }}
        >
          within the Cosmere, recorded and verified
        </p>
        <p
          className="font-serif italic"
          style={{ color: INK.subtle, fontSize: 'clamp(8px, 0.8vw, 11px)', letterSpacing: '0.08em' }}
        >
          by the Silverlight Cartographic Guild.
        </p>
      </div>

      {/* Decorative spacer */}
      <div
        className="my-10 w-full max-w-[200px] flex items-center gap-3 z-[1] animate-line-draw-center"
        style={{ animationDelay: '2.5s' }}
      >
        <div
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(140,120,80,0.08))' }}
        />
        <span className="text-[12px]" style={{ color: 'rgba(140,120,80,0.1)', fontFamily: 'serif' }}>
          ✦
        </span>
        <div
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(270deg, transparent, rgba(140,120,80,0.08))' }}
        />
      </div>

      {/* CTA — physical book interaction */}
      <div className="z-[1] animate-fade-in-up" style={{ animationDelay: '2.7s' }}>
        <div
          role="button"
          tabIndex={0}
          onClick={onEnter}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onEnter()
            }
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="cursor-pointer transition-all duration-500"
          style={{
            transform: hovered
              ? 'perspective(600px) rotateX(-1deg) scale(1.02)'
              : 'perspective(600px) rotateX(0deg) scale(1)',
            filter: hovered ? 'brightness(1.05)' : 'brightness(1)',
          }}
        >
          {/* Ornamental frame */}
          <div
            className="relative px-10 py-5"
            style={{
              border: '0.5px solid rgba(160,130,90,0.12)',
              borderRadius: '1px',
              background: hovered
                ? 'radial-gradient(ellipse at 50% 50%, rgba(160,130,90,0.02) 0%, transparent 70%)'
                : 'transparent',
              transition: 'background 0.4s ease',
            }}
          >
            {/* Corner flourishes */}
            <span
              className="absolute top-0 left-0 text-[10px]"
              style={{ color: 'rgba(160,130,90,0.08)', transform: 'translate(-2px, -2px)', fontFamily: 'serif' }}
            >
              ❧
            </span>
            <span
              className="absolute top-0 right-0 text-[10px]"
              style={{ color: 'rgba(160,130,90,0.08)', transform: 'translate(2px, -2px)', fontFamily: 'serif' }}
            >
              ❧
            </span>
            <span
              className="absolute bottom-0 left-0 text-[10px]"
              style={{
                color: 'rgba(160,130,90,0.08)',
                transform: 'translate(-2px, 2px) rotate(180deg)',
                fontFamily: 'serif',
              }}
            >
              ❧
            </span>
            <span
              className="absolute bottom-0 right-0 text-[10px]"
              style={{
                color: 'rgba(160,130,90,0.08)',
                transform: 'translate(2px, 2px) rotate(180deg)',
                fontFamily: 'serif',
              }}
            >
              ❧
            </span>

            <p
              className="font-serif text-center"
              style={{
                color: INK.label,
                fontSize: 'clamp(13px, 1.5vw, 20px)',
                letterSpacing: '0.35em',
                textShadow: hovered
                  ? '0 0 4px rgba(180,150,80,0.15), 0 1px 3px rgba(60,45,30,0.1)'
                  : '0 0 1px rgba(180,150,80,0.08), 0 1px 2px rgba(60,45,30,0.05)',
                transition: 'text-shadow 0.4s ease',
              }}
            >
              OPEN FOLIO
            </p>
            <p
              className="font-serif text-center mt-2 italic"
              style={{
                color: hovered ? INK.subtle : INK.muted,
                fontSize: 'clamp(7px, 0.7vw, 9px)',
                letterSpacing: '0.12em',
                transition: 'color 0.4s ease',
              }}
            >
              enter the atlas
            </p>
          </div>
        </div>
      </div>

      {/* Silverlight Seal */}
      <div className="mt-10 z-[1]">{SilverlightSeal()}</div>

      {/* Bottom colophon */}
      <p
        className="absolute bottom-12 font-serif text-center animate-fade-in-up z-[1]"
        style={{ color: INK.muted, fontSize: 'clamp(6px, 0.6vw, 8px)', letterSpacing: '0.15em', animationDelay: '3s' }}
      >
        Codex Primus · Volume III
      </p>
    </div>
  )
}

export { TitlePageLeft, TitlePageRight }
export default TitlePageLeft
