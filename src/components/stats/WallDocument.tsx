import type { ReactNode } from 'react'

interface WallDocumentProps {
  x: number
  y: number
  w: number
  h: number
  rotation?: number
  children: ReactNode
  id: string
  onClick?: (e: React.MouseEvent) => void
  isFocused?: boolean
  pinAt?: 'top' | 'topleft' | 'topright'
  className?: string
  style?: React.CSSProperties
  taped?: boolean
}

export function WallDocument({
  x,
  y,
  w,
  h,
  rotation = 0,
  children,
  id,
  onClick,
  isFocused = false,
  pinAt = 'top',
  className = '',
  style,
  taped = false,
}: WallDocumentProps) {
  const pinStyle: React.CSSProperties =
    pinAt === 'top'
      ? { left: '50%', top: -6, transform: 'translateX(-50%)' }
      : pinAt === 'topleft'
        ? { left: 16, top: -6 }
        : { right: 16, top: -6 }

  return (
    <div
      data-doc-id={id}
      onClick={onClick}
      className={`absolute cursor-pointer select-none ${className}`}
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `rotate(${rotation}deg)`,
        transition: 'filter 0.6s ease',
        filter: isFocused ? 'brightness(1.06)' : 'brightness(1)',
        zIndex: isFocused ? 100 : 1,
        ...style,
      }}
    >
      {/* Multi-layer shadow for physical depth */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
        {/* Shadow layer 1 — tight dark offset */}
        <div
          className="absolute inset-0"
          style={{
            top: 4,
            left: -2,
            boxShadow: '-2px 4px 8px rgba(0,0,0,0.18)',
            borderRadius: '1px',
          }}
        />
        {/* Shadow layer 2 — wide soft spread */}
        <div
          className="absolute inset-0"
          style={{
            top: 8,
            left: -4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: '1px',
          }}
        />
        {/* Focus glow shadow */}
        {isFocused && (
          <div
            className="absolute inset-0"
            style={{
              top: 0,
              left: 0,
              boxShadow: '0 0 0 2px rgba(200,180,150,0.15), 0 12px 48px rgba(0,0,0,0.4)',
              borderRadius: '1px',
            }}
          />
        )}
      </div>

      {/* Document body — parchment with deckled edge feel */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, #ede3d4 0%, #dccdb8 40%, #e0d2c0 100%)',
          border: '1px solid rgba(180,160,140,0.45)',
          boxShadow: 'inset 0 0 80px rgba(120,100,80,0.06), inset 0 1px 0 rgba(255,255,255,0.10)',
        }}
      >
        {/* Fiber lines — thin wavy paper texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            background: `
              repeating-linear-gradient(85deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, transparent 4px),
              repeating-linear-gradient(175deg, transparent, transparent 5px, rgba(0,0,0,0.03) 5px, transparent 6px)
            `,
          }}
        />
        {/* Age stains */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 35% 25% at 12% 18%, rgba(170,150,120,0.08) 0%, transparent 60%),
              radial-gradient(ellipse 25% 35% at 88% 78%, rgba(150,130,100,0.06) 0%, transparent 50%),
              radial-gradient(ellipse 18% 18% at 65% 8%, rgba(160,140,110,0.05) 0%, transparent 40%),
              radial-gradient(ellipse 20% 15% at 40% 90%, rgba(140,120,95,0.04) 0%, transparent 40%)
            `,
          }}
        />
        {/* Ink speckles */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 25%, #2a1a0a 0.5px, transparent 1px), radial-gradient(circle at 75% 60%, #2a1a0a 0.3px, transparent 0.8px), radial-gradient(circle at 40% 80%, #2a1a0a 0.4px, transparent 1px), radial-gradient(circle at 85% 15%, #2a1a0a 0.6px, transparent 1.2px)',
          }}
        />
        {/* Curled corner — bottom-right */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: 0,
            right: 0,
            width: 20,
            height: 20,
            background: 'linear-gradient(225deg, rgba(120,100,80,0.12) 0%, transparent 50%)',
            clipPath: 'polygon(100% 100%, 100% 60%, 60% 100%)',
          }}
        />
        {/* Curled corner — top-left */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0,
            left: 0,
            width: 16,
            height: 16,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
            clipPath: 'polygon(0% 0%, 0% 60%, 60% 0%)',
          }}
        />
      </div>

      {/* Pin or tape */}
      {taped ? (
        <>
          <div className="absolute" style={{ left: 8, top: 8, width: 28, height: 12, opacity: 0.3 }}>
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(180deg, rgba(180,160,130,0.5), rgba(140,120,90,0.3))',
                clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
              }}
            />
          </div>
          <div className="absolute" style={{ right: 8, top: 8, width: 28, height: 12, opacity: 0.3 }}>
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(180deg, rgba(180,160,130,0.5), rgba(140,120,90,0.3))',
                clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
              }}
            />
          </div>
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', ...pinStyle, zIndex: 20 }}>
            {/* Pin shadow */}
            <div
              className="absolute rounded-full"
              style={{
                width: 12,
                height: 12,
                top: 4,
                left: 2,
                background: 'rgba(0,0,0,0.15)',
                filter: 'blur(2px)',
              }}
            />
            <div
              className="rounded-full relative"
              style={{
                width: 10,
                height: 10,
                background: 'radial-gradient(circle at 35% 30%, #9a8a7a, #6a5a4a 50%, #4a3a2a)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                border: '0.5px solid rgba(60,50,40,0.3)',
              }}
            />
            <div
              style={{
                width: 1,
                height: 14,
                background: 'linear-gradient(180deg, #5a4a3a, rgba(60,50,40,0.2))',
                margin: '-1px auto 0',
                borderRadius: '0 0 1px 1px',
              }}
            />
          </div>
        </>
      )}

      {/* Content area */}
      <div className="relative z-10 p-3 sm:p-4 h-full w-full overflow-hidden">{children}</div>
    </div>
  )
}
