'use client'
import { memo, useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'

const BASE = import.meta.env.BASE_URL
const BW = 'clamp(40px, 4.5vh, 65px)'
const BH = 'clamp(300px, 38vh, 420px)'
const GW = 'clamp(60px, 7vh, 110px)'

interface Props {
  id: string
  name: string
  title: string
  order: string
  surges: [string, string]
  description: string
  books: string[]
  connections: string[]
  color: string
  image: string
  left: string
  top: string
  rotation: number
  seed: number
  hovered?: 'active' | 'dimmed' | null
  selected?: boolean
  onHover?: (id: string | null) => void
  onSelect?: (id: string | null) => void
}

function drift(seed: number, offset: number): number {
  return ((seed * 7 + offset * 13) * 1.1) % 1
}

export default memo(function Honorblade({
  id,
  name,
  color,
  image,
  left,
  top,
  rotation,
  seed,
  hovered,
  selected,
  onHover,
  onSelect,
}: Props) {
  const isTaln = id === 'talenel'
  const floatRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const rimRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  /* ── GSAP idle floating loop ── */
  useEffect(() => {
    if (isTaln || !floatRef.current) return

    const fd = drift(seed, 0)
    const dur = 4 + fd * 2
    const del = fd * 3

    const float = gsap.to(floatRef.current, {
      y: 3 + fd * 2,
      duration: dur,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: del,
    })

    const breathe = gsap.to(floatRef.current, {
      rotation: 0.1 + fd * 0.3,
      duration: dur * 1.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: del * 0.7,
    })

    return () => {
      float.kill()
      breathe.kill()
    }
  }, [isTaln, seed])

  /* ── Hover interaction ── */
  const handleMouseEnter = useCallback(() => {
    onHover?.(id)
    if (isTaln || !floatRef.current || !glowRef.current || !rimRef.current) return

    gsap.to(glowRef.current, { opacity: 0.9, duration: 0.15 })
    gsap.to(floatRef.current, { y: -8, scale: 1.08, duration: 0.3, ease: 'power2.out' })
    gsap.to(rimRef.current, { opacity: 1, duration: 0.25, ease: 'power2.out', delay: 0.1 })
  }, [id, isTaln, onHover])

  const handleMouseLeave = useCallback(() => {
    onHover?.(null)
    if (isTaln || !floatRef.current || !glowRef.current || !rimRef.current) return

    gsap.to(glowRef.current, { opacity: 0.5, duration: 0.2 })
    gsap.to(floatRef.current, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' })
    gsap.to(rimRef.current, { opacity: 0, duration: 0.15 })
  }, [id, isTaln, onHover])

  const handleClick = useCallback(() => {
    if (isTaln) return
    onSelect?.(selected ? null : id)
  }, [id, isTaln, selected, onSelect])

  const dimmed = hovered === 'dimmed'
  const opacity = dimmed ? 0.35 : 1

  return (
    <>
      {!isTaln && (
        <div
          className="absolute pointer-events-none"
          style={{
            left,
            top,
            width: GW,
            height: GW,
            transform: 'translate(-50%, -50%)',
            opacity: hovered === 'active' ? 0.35 : hovered === 'dimmed' ? 0.06 : 0.12,
            zIndex: 8,
          }}
        >
          <div
            className="w-full h-full rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(ellipse, ${color}40 0%, ${color}10 50%, transparent 70%)`,
              mixBlendMode: 'screen',
              filter: 'blur(8px)',
            }}
          />
        </div>
      )}

      <div
        ref={rootRef}
        data-blade={id}
        className="absolute pointer-events-none"
        style={{
          left,
          top,
          width: BW,
          height: BH,
          transform: `rotate(${rotation}deg) scale(1)`,
          transformOrigin: 'center bottom',
          zIndex: selected ? 25 : 15,
          opacity,
          transition: 'opacity 0.4s ease',
        }}
      >
        <div
          ref={floatRef}
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {isTaln ? (
            <div
              className="w-full h-full pointer-events-auto"
              style={{ cursor: 'default' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, transparent 60%, ${color}15 85%, ${color}30 100%)`,
                }}
              />
            </div>
          ) : (
            <>
              <div
                ref={glowRef}
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: 0.5,
                  mixBlendMode: 'screen',
                  filter: `drop-shadow(0 0 10px ${color}44) drop-shadow(0 0 20px ${color}22)`,
                  zIndex: 3,
                }}
              />

              <div
                ref={rimRef}
                className="absolute pointer-events-none"
                style={{
                  left: 'calc(50% - 90%)',
                  bottom: '5%',
                  width: '180%',
                  height: '40%',
                  opacity: 0,
                  background: `linear-gradient(0deg, ${color}15 0%, transparent 100%)`,
                  filter: 'blur(6px)',
                  zIndex: 2,
                }}
              />

              <img
                src={`${BASE}${image}`}
                alt={name}
                className="w-full h-full pointer-events-auto"
                style={{
                  objectFit: 'contain',
                  display: 'block',
                  position: 'relative',
                  zIndex: 4,
                  cursor: 'pointer',
                }}
                draggable={false}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
              />
            </>
          )}
        </div>
      </div>
    </>
  )
})
