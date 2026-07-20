'use client'
import { memo, useEffect, useRef } from 'react'
import gsap from 'gsap'

interface BladeInfo {
  id: string
  name: string
  title: string
  order: string
  surges: [string, string]
  description: string
  books: string[]
  connections: string[]
  status: string
}

interface Props {
  blade: BladeInfo | null
  onClose: () => void
}

/*
 * Ceremonial information panel — left side, dark translucent stone.
 * Sections animate in on a timeline:
 *   0.0 camera arrives
 *   0.3 sword glow increases
 *   0.6 panel frame fades in
 *   0.8 title appears
 *   1.0 statistics appear
 *   1.3 description fades
 *   1.6 quote fades
 *   2.0 done
 */
export default memo(function InfoMonolith({ blade, onClose }: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const prevId = useRef<string | null>(null)

  useEffect(() => {
    const frame = frameRef.current
    const backdrop = backdropRef.current
    const sections = frame?.querySelectorAll('[data-section]')
    if (frame && backdrop) {
      gsap.set(frame, { opacity: 0, x: -60 })
      gsap.set(backdrop, { opacity: 0, pointerEvents: 'none' })
    }
    if (sections) sections.forEach((el) => gsap.set(el, { opacity: 0, y: 12 }))
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
        gsap.to(frame, { opacity: 0, x: -40, duration: 0.4, ease: 'power2.in' })
        gsap.to(backdrop, { opacity: 0, duration: 0.35, pointerEvents: 'none' })
      }
      prevId.current = null
      return
    }

    if (prevId.current !== blade.id) {
      const sections = frame?.querySelectorAll('[data-section]')

      /* Reset all sections hidden */
      if (sections) sections.forEach((el) => gsap.set(el, { opacity: 0, y: 12 }))

      if (frame) gsap.set(frame, { opacity: 0, x: -60 })
      if (backdrop) gsap.set(backdrop, { opacity: 0, pointerEvents: 'auto' })

      const tl = gsap.timeline()

      /* 0.0 Backdrop fade */
      tl.to(backdrop, { opacity: 1, duration: 0.3 }, 0)

      /* 0.6 Panel frame slides in */
      tl.to(frame, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.5)

      if (sections) {
        /* 0.8 Title section */
        if (sections[0]) tl.to(sections[0], { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.7)
        /* 1.0 Stats section (order, surges, status) */
        if (sections[1]) tl.to(sections[1], { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.9)
        /* 1.3 Description */
        if (sections[2]) tl.to(sections[2], { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 1.15)
        /* 1.6 Books + connections + quote */
        if (sections[3]) tl.to(sections[3], { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 1.45)
      }

      prevId.current = blade.id
    }
  }, [blade])

  const info = blade

  return (
    <>
      {/* Backdrop — darkens the scene */}
      <div
        ref={backdropRef}
        className="fixed inset-0"
        style={{
          zIndex: 40,
          opacity: 0,
          background: 'rgba(0,0,0,0.45)',
          pointerEvents: 'none',
        }}
        onClick={onClose}
      />

      {/* Panel — left-aligned, dark translucent stone */}
      <div
        ref={frameRef}
        className="fixed"
        style={{
          zIndex: 45,
          left: 'clamp(24px, 4vw, 48px)',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 'clamp(300px, 28vw, 420px)',
          maxHeight: 'clamp(400px, 75vh, 720px)',
          borderRadius: 12,
          background: 'rgba(16, 12, 10, 0.75)',
          backdropFilter: 'blur(28px) saturate(0.7)',
          WebkitBackdropFilter: 'blur(28px) saturate(0.7)',
          border: '1px solid rgba(255, 235, 210, 0.06)',
          boxShadow: `
            0 20px 60px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,235,210,0.04),
            0 0 30px rgba(100,150,255,0.02)
          `,
          overflow: 'hidden',
          pointerEvents: 'auto',
        }}
      >
        <div
          className="overflow-y-auto"
          style={{
            padding: 'clamp(20px, 2.5vw, 32px)',
            maxHeight: 'clamp(400px, 75vh, 720px)',
            color: '#d4c8b8',
            fontFamily: "'Times New Roman', 'Georgia', serif",
          }}
        >
          {info && (
            <>
              {/* Section 0: Title */}
              <div data-section style={{ opacity: 0, y: 12 }}>
                <div
                  style={{
                    fontSize: 'clamp(9px, 0.6vw, 11px)',
                    color: 'rgba(200,185,165,0.3)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  Herald
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(20px, 2vw, 28px)',
                    fontWeight: 400,
                    color: '#e8ddd0',
                    margin: 0,
                    letterSpacing: '0.02em',
                  }}
                >
                  {info.name}
                </h2>
                <p
                  style={{
                    fontSize: 'clamp(12px, 0.9vw, 15px)',
                    color: 'rgba(200,185,165,0.55)',
                    fontStyle: 'italic',
                    margin: '2px 0 0 0',
                  }}
                >
                  {info.title}
                </p>
              </div>

              {/* Section 1: Attributes */}
              <div data-section style={{ opacity: 0, y: 12, marginTop: 'clamp(14px, 1.4vw, 20px)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <Pill>{info.order}</Pill>
                  {info.surges.map((s) => (
                    <Pill key={s} accent>
                      {s}
                    </Pill>
                  ))}
                  <Pill status={info.status}>{info.status}</Pill>
                </div>
              </div>

              {/* Section 2: Description */}
              <div data-section style={{ opacity: 0, y: 12, marginTop: 'clamp(14px, 1.4vw, 20px)' }}>
                <p
                  style={{
                    fontSize: 'clamp(12px, 0.85vw, 14px)',
                    lineHeight: 1.65,
                    color: 'rgba(200,185,165,0.65)',
                    margin: 0,
                  }}
                >
                  {info.description}
                </p>
              </div>

              {/* Section 3: Books, connections, quote */}
              <div data-section style={{ opacity: 0, y: 12, marginTop: 'clamp(14px, 1.4vw, 20px)' }}>
                <div
                  style={{
                    fontSize: 'clamp(10px, 0.65vw, 12px)',
                    color: 'rgba(200,185,165,0.3)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  Appears in
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {info.books.map((b) => (
                    <span
                      key={b}
                      style={{
                        padding: '2px 8px',
                        fontSize: 'clamp(10px, 0.65vw, 11px)',
                        background: 'rgba(255,235,210,0.03)',
                        borderRadius: 10,
                        color: 'rgba(200,185,165,0.3)',
                      }}
                    >
                      {b.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>

                {info.connections.length > 0 && (
                  <>
                    <div
                      style={{
                        fontSize: 'clamp(10px, 0.65vw, 12px)',
                        color: 'rgba(200,185,165,0.3)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      Connections
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                      {info.connections.map((c) => (
                        <span
                          key={c}
                          style={{
                            padding: '2px 8px',
                            fontSize: 'clamp(10px, 0.65vw, 11px)',
                            background: 'rgba(100,150,200,0.04)',
                            borderRadius: 10,
                            color: 'rgba(180,200,220,0.3)',
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {/* Quote — elegant block */}
                {info.id && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 'clamp(10px, 1vw, 14px)',
                      borderLeft: '2px solid rgba(200,185,165,0.08)',
                      fontStyle: 'italic',
                      fontSize: 'clamp(11px, 0.75vw, 13px)',
                      color: 'rgba(200,185,165,0.4)',
                      lineHeight: 1.5,
                    }}
                  >
                    &ldquo;{getHeraldQuote(info.id)}&rdquo;
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
})

/* Reusable pill component */
function Pill({ children, accent, status }: { children: string; accent?: boolean; status?: string }) {
  let bg = 'rgba(255,235,210,0.04)'
  let border = 'rgba(255,235,210,0.06)'
  let color = 'rgba(200,185,165,0.5)'
  if (accent) {
    bg = 'rgba(100,150,255,0.04)'
    border = 'rgba(100,150,255,0.06)'
    color = 'rgba(180,200,230,0.45)'
  }
  if (status === 'standing') {
    bg = 'rgba(100,200,150,0.05)'
    border = 'rgba(100,200,150,0.08)'
    color = 'rgba(180,220,190,0.4)'
  }
  if (status === 'fallen') {
    bg = 'rgba(200,100,100,0.04)'
    border = 'rgba(200,100,100,0.06)'
    color = 'rgba(210,160,160,0.4)'
  }

  return (
    <span
      style={{
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 'clamp(10px, 0.7vw, 12px)',
        background: bg,
        border: `1px solid ${border}`,
        color,
        letterSpacing: '0.03em',
      }}
    >
      {children}
    </span>
  )
}

const QUOTES: Record<string, string> = {
  jezrien: 'I have given you the sky. The rest you must earn.',
  nale: 'The law is not a suggestion. It is the foundation upon which civilization rests.',
  chanarach: 'Destruction is not the opposite of creation — it is the prelude.',
  vedel: 'The deepest wounds are those the eye cannot see.',
  pailiah: 'To know is to bear a burden. Ignorance is the lighter path, but not the truer one.',
  shalash: 'Erase me from your memory. Burn my image. I am not worthy of worship.',
  battar: 'Wisdom is knowing what questions to ask — not knowing the answers.',
  kalak: 'I have walked through worlds and watched them burn. I am tired.',
  talenel: 'I did not break. They could not make me break.',
  ishar: 'I was the first. I will be the last. And in between, I have become something terrible.',
}

function getHeraldQuote(id: string): string {
  return QUOTES[id] ?? 'The words are lost to time.'
}
