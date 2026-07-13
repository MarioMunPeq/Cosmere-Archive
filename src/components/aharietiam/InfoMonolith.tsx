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

export default memo(function InfoMonolith({ blade, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const prevId = useRef<string | null>(null)

  useEffect(() => {
    if (cardRef.current && backdropRef.current) {
      gsap.set(cardRef.current, { y: 'calc(100% + 10vh)', opacity: 0, scale: 0.95 })
      gsap.set(backdropRef.current, { opacity: 0, pointerEvents: 'none' })
    }
  }, [])

  useEffect(() => {
    if (!blade) {
      /* close */
      if (prevId.current && cardRef.current && backdropRef.current) {
        gsap.to(cardRef.current, {
          y: 'calc(100% + 10vh)',
          opacity: 0,
          scale: 0.92,
          duration: 0.55,
          ease: 'power3.in',
        })
        gsap.to(backdropRef.current, {
          opacity: 0,
          duration: 0.45,
          pointerEvents: 'none',
        })
      }
      prevId.current = null
      return
    }

    if (prevId.current !== blade.id) {
      /* reset content */
      if (contentRef.current) {
        const kids = Array.from(contentRef.current.children) as HTMLElement[]
        kids.forEach((el) => gsap.set(el, { opacity: 0, y: 16 }))
      }

      gsap.set(cardRef.current, { y: 'calc(100% + 10vh)', opacity: 0, scale: 0.95 })
      gsap.set(backdropRef.current, { pointerEvents: 'auto' })

      const tl = gsap.timeline()
      tl.to(backdropRef.current, { opacity: 1, duration: 0.35 }, 0)
        .to(cardRef.current, {
          y: '0%',
          opacity: 1,
          scale: 1,
          duration: 0.65,
          ease: 'power3.out',
        }, 0)

      if (contentRef.current) {
        const kids = Array.from(contentRef.current.children) as HTMLElement[]
        if (kids[0]) tl.to(kids[0], { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.5)
        if (kids[1]) tl.to(kids[1], { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.7)
        if (kids[2]) tl.to(kids[2], { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.85)
        if (kids[3]) tl.to(kids[3], { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 1.0)
      }

      prevId.current = blade.id
    }
  }, [blade])

  const info = blade

  return (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0"
        style={{
          zIndex: 40,
          opacity: 0,
          background: 'rgba(0,0,0,0.5)',
          pointerEvents: 'none',
        }}
        onClick={onClose}
      />
      <div
        ref={cardRef}
        data-card
        className="fixed"
        style={{
          zIndex: 45,
          left: '50%',
          top: '50%',
          width: 'clamp(360px, 42vw, 560px)',
          maxHeight: 'clamp(400px, 70vh, 700px)',
          transform: 'translate(-50%, -50%)',
          borderRadius: 16,
          background: 'rgba(20, 16, 12, 0.65)',
          backdropFilter: 'blur(24px) saturate(0.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(0.8)',
          border: '1px solid rgba(255, 235, 210, 0.08)',
          boxShadow: `
            0 24px 80px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,235,210,0.06),
            0 0 40px rgba(100,150,255,0.03)
          `,
          overflow: 'hidden',
        }}
      >
        <div
          ref={contentRef}
          className="overflow-y-auto"
          style={{
            padding: 'clamp(24px, 3vw, 40px)',
            maxHeight: 'clamp(400px, 70vh, 700px)',
            color: '#d4c8b8',
          }}
        >
          {info && (
            <>
              <div>
                <h2
                  style={{
                    fontFamily: "'Times New Roman', serif",
                    fontSize: 'clamp(22px, 2.5vw, 34px)',
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
                    fontFamily: "'Times New Roman', serif",
                    fontSize: 'clamp(13px, 1.1vw, 17px)',
                    color: 'rgba(200, 185, 165, 0.65)',
                    fontStyle: 'italic',
                    margin: '4px 0 0 0',
                  }}
                >
                  {info.title}
                </p>
              </div>

              <div style={{ marginTop: 'clamp(12px, 1.5vw, 20px)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span
                    style={{
                      padding: '3px 12px',
                      borderRadius: 20,
                      fontSize: 'clamp(11px, 0.9vw, 14px)',
                      background: 'rgba(255,235,210,0.06)',
                      border: '1px solid rgba(255,235,210,0.08)',
                      color: 'rgba(200,185,165,0.7)',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {info.order}
                  </span>
                  {info.surges.map((s) => (
                    <span
                      key={s}
                      style={{
                        padding: '3px 12px',
                        borderRadius: 20,
                        fontSize: 'clamp(11px, 0.9vw, 14px)',
                        background: 'rgba(100,150,255,0.05)',
                        border: '1px solid rgba(100,150,255,0.08)',
                        color: 'rgba(180,200,230,0.6)',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                  <span
                    style={{
                      padding: '3px 12px',
                      borderRadius: 20,
                      fontSize: 'clamp(11px, 0.9vw, 14px)',
                      background:
                        info.status === 'standing'
                          ? 'rgba(100,200,150,0.06)'
                          : 'rgba(200,100,100,0.06)',
                      border:
                        info.status === 'standing'
                          ? '1px solid rgba(100,200,150,0.1)'
                          : '1px solid rgba(200,100,100,0.08)',
                      color:
                        info.status === 'standing'
                          ? 'rgba(180,220,190,0.5)'
                          : 'rgba(210,160,160,0.5)',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {info.status}
                  </span>
                </div>
              </div>

              <p
                style={{
                  marginTop: 'clamp(14px, 1.6vw, 22px)',
                  fontSize: 'clamp(13px, 1vw, 16px)',
                  lineHeight: 1.65,
                  color: 'rgba(200, 185, 165, 0.7)',
                  fontFamily: "'Georgia', serif",
                }}
              >
                {info.description}
              </p>

              <div style={{ marginTop: 'clamp(12px, 1.4vw, 20px)' }}>
                <div
                  style={{
                    fontSize: 'clamp(11px, 0.85vw, 13px)',
                    color: 'rgba(200,185,165,0.35)',
                    marginBottom: 4,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Appears in
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {info.books.map((b) => (
                    <span
                      key={b}
                      style={{
                        padding: '2px 10px',
                        borderRadius: 12,
                        fontSize: 'clamp(10px, 0.8vw, 12px)',
                        background: 'rgba(255,235,210,0.03)',
                        border: '1px solid rgba(255,235,210,0.05)',
                        color: 'rgba(200,185,165,0.35)',
                      }}
                    >
                      {b.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>

                {info.connections.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        fontSize: 'clamp(11px, 0.85vw, 13px)',
                        color: 'rgba(200,185,165,0.35)',
                        marginBottom: 4,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Connections
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {info.connections.map((c) => (
                        <span
                          key={c}
                          style={{
                            padding: '2px 10px',
                            borderRadius: 12,
                            fontSize: 'clamp(10px, 0.8vw, 12px)',
                            background: 'rgba(100,150,200,0.04)',
                            border: '1px solid rgba(100,150,200,0.06)',
                            color: 'rgba(180,200,220,0.35)',
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
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
