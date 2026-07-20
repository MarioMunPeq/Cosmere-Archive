'use client'
import { memo, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { HonorbladeData } from '@/types/aharietiam'

interface Props {
  blade: HonorbladeData | null
  onClose: () => void
}

/*
 * Carved stone manuscript — suspended left side of the screen.
 * Each section reveals in sequence like opening an ancient archive.
 *
 * Timing (relative to camera settling at time 0):
 *   0.0  camera stops
 *   0.2  panel frame fades in
 *   0.5  name / title appear
 *   0.8  divine attributes + order + surges
 *   1.1  essence + soulcasting + honorblade grants
 *   1.4  description
 *   1.7  books / appearances
 *   2.0  complete
 */
export default memo(function InfoMonolith({ blade, onClose }: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const prevId = useRef<string | null>(null)
  const [stoneNoise] = useState(() => createStoneNoise())

  useEffect(() => {
    const frame = frameRef.current
    const backdrop = backdropRef.current
    const sections = frame?.querySelectorAll('[data-section]')
    if (frame && backdrop) {
      gsap.set(frame, { opacity: 0, x: -80, scale: 0.97 })
      gsap.set(backdrop, { opacity: 0, pointerEvents: 'none' })
    }
    if (sections) sections.forEach((el) => gsap.set(el, { opacity: 0, y: 16 }))
    return () => {
      if (frame) gsap.killTweensOf(frame)
      if (backdrop) gsap.killTweensOf(backdrop)
      if (sections) sections.forEach((el) => gsap.killTweensOf(el))
    }
  }, [])

  useEffect(() => {
    const frame = frameRef.current
    const backdrop = backdropRef.current
    if (!blade) {
      if (prevId.current && frame && backdrop) {
        gsap.to(frame, { opacity: 0, x: -60, scale: 0.97, duration: 0.4, ease: 'power2.in' })
        gsap.to(backdrop, { opacity: 0, duration: 0.35, pointerEvents: 'none' })
        const sections = frame.querySelectorAll('[data-section]')
        sections.forEach((el) => gsap.to(el, { opacity: 0, y: 12, duration: 0.15 }))
      }
      prevId.current = null
      return
    }

    if (prevId.current !== blade.id) {
      const sections = frame?.querySelectorAll('[data-section]')

      /* Reset all hidden */
      if (sections) sections.forEach((el) => gsap.set(el, { opacity: 0, y: 16 }))
      if (frame) gsap.set(frame, { opacity: 0, x: -80, scale: 0.97 })
      if (backdrop) gsap.set(backdrop, { opacity: 0, pointerEvents: 'auto' })

      const tl = gsap.timeline()

      /* 0.0 Backdrop fades */
      tl.to(backdrop, { opacity: 1, duration: 0.4 }, 0)

      /* 0.2 Panel frame slides in */
      tl.to(frame, { opacity: 1, x: 0, scale: 1, duration: 0.55, ease: 'power2.out' }, 0.2)

      if (sections) {
        /* 0.5 Name + title */
        if (sections[0]) tl.to(sections[0], { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.5)
        /* 0.8 Divine attributes + order + surges */
        if (sections[1]) tl.to(sections[1], { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.8)
        /* 1.1 Essence + soulcasting + honorblade */
        if (sections[2]) tl.to(sections[2], { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 1.1)
        /* 1.4 Description */
        if (sections[3]) tl.to(sections[3], { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 1.4)
        /* 1.7 Books */
        if (sections[4]) tl.to(sections[4], { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 1.7)
      }

      prevId.current = blade.id
    }
  }, [blade])

  if (!blade) return null

  return (
    <>
      {/* Backdrop — museum dim */}
      <div
        ref={backdropRef}
        className="fixed inset-0"
        style={{
          zIndex: 40,
          opacity: 0,
          background: 'rgba(0,0,0,0.35)',
          pointerEvents: 'none',
        }}
        onClick={onClose}
      />

      {/* Stone manuscript panel */}
      <div
        ref={frameRef}
        className="fixed pointer-events-auto select-none"
        style={{
          zIndex: 45,
          left: 'clamp(20px, 3.5vw, 40px)',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 'clamp(340px, 30vw, 440px)',
          maxHeight: 'clamp(420px, 78vh, 640px)',
          clipPath:
            'polygon(0% 2%, 3% 0%, 97% 0%, 100% 2%, 100% 98%, 97% 100%, 3% 100%, 0% 98%, 0.5% 90%, 0% 80%, 0.8% 70%, 0% 60%, 0.5% 50%, 0% 40%, 0.7% 30%, 0% 20%, 0.5% 10%)',
          background: `linear-gradient(180deg, rgba(22,17,13,0.92) 0%, rgba(26,20,15,0.92) 50%, rgba(20,15,11,0.92) 100%)`,
          border: '1px solid rgba(170,140,100,0.15)',
          borderRight: '1px solid rgba(170,140,100,0.1)',
          boxShadow: `
            0 24px 80px rgba(0,0,0,0.6),
            0 0 40px rgba(0,0,0,0.3),
            inset 0 0 60px rgba(0,0,0,0.2),
            inset 0 1px 0 rgba(170,140,100,0.08)
          `,
          overflow: 'hidden',
          fontFamily: "'Times New Roman', 'Georgia', serif",
          color: '#c8bda8',
        }}
      >
        {/* Stone noise overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.06,
            mixBlendMode: 'overlay' as unknown as 'multiply',
            backgroundImage: `url(${stoneNoise})`,
            backgroundSize: '256px 256px',
          }}
        />

        {/* Bronze decorative top rail */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: 2,
            background:
              'linear-gradient(90deg, transparent 5%, rgba(170,140,100,0.25) 20%, rgba(170,140,100,0.35) 50%, rgba(170,140,100,0.25) 80%, transparent 95%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: 2,
            background:
              'linear-gradient(90deg, transparent 5%, rgba(170,140,100,0.15) 20%, rgba(170,140,100,0.2) 50%, rgba(170,140,100,0.15) 80%, transparent 95%)',
          }}
        />

        {/* Scrollable content */}
        <div
          className="overflow-y-auto"
          style={{
            padding: 'clamp(24px, 2.8vw, 36px) clamp(20px, 2.5vw, 32px)',
            maxHeight: 'clamp(420px, 78vh, 640px)',
          }}
        >
          {/* Section 0: Herald heading + name + title */}
          <div data-section>
            <div
              style={{
                fontSize: 'clamp(9px, 0.55vw, 11px)',
                color: 'rgba(170,140,100,0.35)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 8,
                fontWeight: 300,
              }}
            >
              Herald
            </div>
            <h2
              style={{
                fontSize: 'clamp(22px, 2.2vw, 30px)',
                fontWeight: 400,
                color: '#ddd0c0',
                margin: 0,
                letterSpacing: '0.04em',
                lineHeight: 1.2,
              }}
            >
              {blade.name}
            </h2>
            <p
              style={{
                fontSize: 'clamp(11px, 0.75vw, 14px)',
                color: 'rgba(170,140,100,0.5)',
                fontStyle: 'italic',
                margin: '4px 0 0 0',
                letterSpacing: '0.03em',
              }}
            >
              {blade.title}
            </p>
          </div>

          {/* Section 1: Divine attributes + Order + Surges */}
          <div data-section style={{ marginTop: 'clamp(16px, 1.6vw, 22px)' }}>
            <AttributeLine label="Divine Attributes" values={blade.attributes} />
            <div style={{ height: 6 }} />
            <AttributeLine label="Order" values={[blade.order]} />
            <div style={{ height: 6 }} />
            <AttributeLine label="Surges" values={[...blade.surges]} />
          </div>

          {/* Section 2: Essence + Soulcasting + Honorblade */}
          <div data-section style={{ marginTop: 'clamp(16px, 1.6vw, 22px)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(10px, 1.2vw, 16px)' }}>
              <InfoChip label="Essence" value={blade.essence} />
              <InfoChip label="Soulcasting" value={blade.soulcasting} />
            </div>
            <div style={{ marginTop: 'clamp(10px, 1vw, 14px)' }}>
              <div
                style={{
                  fontSize: 'clamp(9px, 0.55vw, 10px)',
                  color: 'rgba(170,140,100,0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: 3,
                }}
              >
                Honorblade
              </div>
              <p
                style={{
                  fontSize: 'clamp(11px, 0.72vw, 13px)',
                  color: 'rgba(200,185,165,0.5)',
                  lineHeight: 1.5,
                  margin: 0,
                  fontStyle: 'italic',
                }}
              >
                Grants {blade.honorbladeGrants}
              </p>
            </div>
          </div>

          {/* Section 3: Description */}
          <div data-section style={{ marginTop: 'clamp(16px, 1.6vw, 22px)' }}>
            <p
              style={{
                fontSize: 'clamp(12px, 0.8vw, 14px)',
                lineHeight: 1.7,
                color: 'rgba(200,185,165,0.55)',
                margin: 0,
              }}
            >
              {blade.description}
            </p>
          </div>

          {/* Section 4: Books / Appearances */}
          <div data-section style={{ marginTop: 'clamp(16px, 1.6vw, 22px)' }}>
            <div
              style={{
                fontSize: 'clamp(9px, 0.55vw, 10px)',
                color: 'rgba(170,140,100,0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 6,
              }}
            >
              Known Appearances
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {blade.books.map((b) => (
                <span
                  key={b}
                  style={{
                    padding: '2px 10px',
                    fontSize: 'clamp(10px, 0.65vw, 12px)',
                    background: 'rgba(170,140,100,0.04)',
                    border: '1px solid rgba(170,140,100,0.06)',
                    borderRadius: 10,
                    color: 'rgba(200,185,165,0.35)',
                    letterSpacing: '0.03em',
                  }}
                >
                  {b.replace(/_/g, ' ')}
                </span>
              ))}
            </div>

            {/* Status indicator */}
            <div style={{ marginTop: 'clamp(12px, 1vw, 16px)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: blade.status === 'standing' ? 'rgba(100,200,150,0.5)' : 'rgba(200,100,100,0.4)',
                  boxShadow: blade.status === 'standing' ? '0 0 6px rgba(100,200,150,0.2)' : 'none',
                }}
              />
              <span
                style={{
                  fontSize: 'clamp(10px, 0.65vw, 12px)',
                  color: 'rgba(200,185,165,0.3)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {blade.status === 'standing' ? 'Standing' : 'Fallen'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
})

/* Inline label → value row */
function AttributeLine({ label, values }: { label: string; values: string[] }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', flexWrap: 'wrap' }}>
      <span
        style={{
          fontSize: 'clamp(9px, 0.55vw, 10px)',
          color: 'rgba(170,140,100,0.3)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginRight: 2,
        }}
      >
        {label}:
      </span>
      {values.map((v, i) => (
        <span
          key={v}
          style={{
            fontSize: 'clamp(12px, 0.75vw, 14px)',
            color: 'rgba(200,185,165,0.5)',
            letterSpacing: '0.02em',
          }}
        >
          {v}
          {i < values.length - 1 ? ', ' : ''}
        </span>
      ))}
    </div>
  )
}

/* Small chip for essence / soulcasting */
function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 'clamp(9px, 0.55vw, 10px)',
          color: 'rgba(170,140,100,0.3)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 'clamp(12px, 0.75vw, 14px)',
          color: 'rgba(200,185,165,0.5)',
          padding: '3px 12px',
          border: '1px solid rgba(170,140,100,0.08)',
          borderRadius: 3,
          background: 'rgba(170,140,100,0.02)',
        }}
      >
        {value}
      </div>
    </div>
  )
}

/* Procedural stone noise as data URL */
function createStoneNoise(): string {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  const d = ctx.createImageData(256, 256)
  const pix = d.data
  for (let i = 0; i < pix.length; i += 4) {
    const v = Math.random() * 255
    pix[i] = v
    pix[i + 1] = v
    pix[i + 2] = v
    pix[i + 3] = 255
  }
  ctx.putImageData(d, 0, 0)
  return c.toDataURL()
}
