import { useEffect, useRef, useMemo } from 'react'

interface Props {
  pageW: number
  pageH: number
  active: boolean
  direction: 'forward' | 'backward'
  front: React.ReactNode
  back: React.ReactNode
  onComplete: () => void
}

export default function PageTurn({ pageW, pageH, active, direction, front, back, onComplete }: Props) {
  const innerRef = useRef<HTMLDivElement>(null)
  const hinge = direction === 'forward' ? 'left center' : 'right center'
  const targetAngle = direction === 'forward' ? -180 : 180

  useEffect(() => {
    if (!active) return
    const el = innerRef.current
    if (!el) return

    el.style.transition = 'none'
    el.style.transform = 'rotateY(0deg)'
    el.getBoundingClientRect()

    requestAnimationFrame(() => {
      el.style.transition = `transform 600ms ${direction === 'forward' ? 'cubic-bezier(0.22, 1, 0.36, 1)' : 'cubic-bezier(0.4, 0, 0.64, 1)'}`
      el.style.transform = `rotateY(${targetAngle}deg)`
    })

    const t = setTimeout(onComplete, 650)
    return () => clearTimeout(t)
  }, [active, direction, targetAngle, onComplete])

  const wrapperStyle: React.CSSProperties = useMemo(
    () => ({
      position: 'absolute',
      width: pageW,
      height: pageH,
      transformStyle: 'preserve-3d',
      zIndex: active ? 30 : 1,
      ...(direction === 'forward' ? { right: 0 } : { left: 0 }),
    }),
    [pageW, pageH, active, direction],
  )

  return (
    <div style={wrapperStyle}>
      {/* Thickness layers behind the turning page */}
      {active && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: hinge,
            transformStyle: 'preserve-3d',
            pointerEvents: 'none',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                background: '#ede4d8',
                transform: `translateZ(${-i * 1.5}px)`,
                transition: 'transform 600ms ease',
                borderRadius: direction === 'forward' ? '0 2px 2px 0' : '2px 0 0 2px',
              }}
            />
          ))}
        </div>
      )}

      {/* The turning page */}
      <div
        ref={innerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          transformOrigin: hinge,
          transformStyle: 'preserve-3d',
          cursor: 'pointer',
        }}
      >
        {/* Front face (original right page content) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            overflow: 'hidden',
            background: '#f5efe6',
            borderRadius: direction === 'forward' ? '0 3px 3px 0' : '3px 0 0 3px',
          }}
        >
          {front}
        </div>

        {/* Back face (revealed during flip — becomes left page content) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            overflow: 'hidden',
            background: '#f5efe6',
            ...(direction === 'forward' ? { borderRadius: '3px 0 0 3px' } : { borderRadius: '0 3px 3px 0' }),
            ...(direction === 'forward'
              ? { boxShadow: '-4px 0 12px rgba(0,0,0,0.06)' }
              : { boxShadow: '4px 0 12px rgba(0,0,0,0.06)' }),
          }}
        >
          {back}
        </div>
      </div>
    </div>
  )
}
