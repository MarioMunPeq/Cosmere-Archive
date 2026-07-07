import type { ReactNode } from 'react'
import type { Book } from '@/types'
import BookPaper from './BookPaper'

interface Props {
  book: Book
  spineT: number
  pageW: number
  coverDeg: number
  leftChildren: ReactNode
  rightChildren: ReactNode
  turnElement: ReactNode | null
  showContent: boolean
  navigation: ReactNode
}

const MATERIALS: Record<string, { base: string; dark: string; light: string }> = {
  stormlight: { base: '#0c1220', dark: '#060a12', light: '#1a2640' },
  'mistborn-era-1': { base: '#120a06', dark: '#0a0502', light: '#20140e' },
  'mistborn-era-2': { base: '#0c1624', dark: '#060c14', light: '#14263a' },
  elantris: { base: '#e8e4e0', dark: '#d0cbc6', light: '#f5f0eb' },
  warbreaker: { base: '#1a0a1e', dark: '#0e0410', light: '#2d1035' },
  'white-sand': { base: '#2a1e14', dark: '#1a120a', light: '#3d2c1e' },
  'secret-projects': { base: '#0a0a18', dark: '#04040e', light: '#1a1a2e' },
  'arcanum-unbounded': { base: '#1a0a2e', dark: '#0e0418', light: '#2a1040' },
}

const FALLBACK_MAT = { base: '#1a1428', dark: '#0e0a18', light: '#2a1e3e' }

function getMat(saga: string) {
  return MATERIALS[saga] ?? FALLBACK_MAT
}

const PAGE_C = '#f5efe6'

export default function BookModel({
  book,
  spineT,
  pageW,
  coverDeg,
  leftChildren,
  rightChildren,
  turnElement,
  showContent,
  navigation,
}: Props) {
  const mat = getMat(book.saga)
  const isLight = mat.base === '#e8e4e0'
  const coverStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    transformOrigin: 'left center',
    transform: `rotateY(${coverDeg}deg)`,
    transition: 'transform 950ms cubic-bezier(0.12, 0.85, 0.25, 0.95)',
    zIndex: coverDeg < -10 ? 1 : 10,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    borderRadius: '0 6px 6px 0',
    overflow: 'hidden',
  }

  const spineStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: spineT,
    height: '100%',
    transformOrigin: 'left center',
    transform: `rotateY(-90deg) translateX(-${spineT}px)`,
    background: `linear-gradient(180deg, ${mat.light} 0%, ${mat.base} 35%, ${mat.dark} 55%, ${mat.dark} 85%, ${mat.base} 100%)`,
    border: '1px solid rgba(255,255,255,0.03)',
    zIndex: 0,
  }

  const backStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: `translateZ(-2px)`,
    borderRadius: '0 6px 6px 0',
    background: `linear-gradient(180deg, ${mat.dark} 0%, ${mat.base} 60%, ${mat.dark} 100%)`,
    border: '1px solid rgba(255,255,255,0.025)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.5), 2px 0 10px rgba(0,0,0,0.2)',
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        position: 'relative',
      }}
    >
      {/* Spine */}
      <div style={spineStyle} />

      {/* Back cover */}
      <div style={backStyle} />

      {/* Page block */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `translateZ(${spineT}px)`,
          zIndex: 5,
          borderRadius: '0 4px 4px 0',
          overflow: 'hidden',
        }}
      >
        {/* Page depth layers */}
        <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(90deg, #ede4d8 0%, #f5efe6 40%, #faf5ed 60%, #ede4d8 100%)`,
                transform: `translateZ(${i * 1.8}px)`,
                borderRadius: '0 3px 3px 0',
              }}
            />
          ))}

          {/* Page edge texture lines */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translateZ(${6 * 1.8 + 1}px)`,
              background: `repeating-linear-gradient(0deg, transparent 0px, transparent 1.2px, rgba(0,0,0,0.005) 1.2px, transparent 1.8px)`,
              opacity: 0.25,
              pointerEvents: 'none',
            }}
          />

          {/* Two-page spread */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translateZ(${6 * 1.8 + 2}px)`,
              opacity: showContent ? 1 : 0,
              transition: 'opacity 300ms ease-in',
              display: 'flex',
              background: PAGE_C,
              borderRadius: '0 3px 3px 0',
            }}
          >
            {/* Left page */}
            <BookPaper style={{ width: pageW, height: '100%', flexShrink: 0, borderRadius: '3px 0 0 3px' }}>
              {leftChildren}
            </BookPaper>

            {/* Center fold shadow */}
            <div
              style={{
                width: spineT,
                height: '100%',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              {/* Valley shadow */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.04) 30%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.04) 70%, transparent 100%)`,
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Right page */}
            <BookPaper style={{ width: pageW, height: '100%', flexShrink: 0, borderRadius: '0 3px 3px 0' }}>
              {rightChildren}
            </BookPaper>

            {/* Page turn element */}
            {turnElement}

            {/* Navigation */}
            {navigation}
          </div>
        </div>
      </div>

      {/* Front cover */}
      <div
        style={{
          ...coverStyle,
          background: `linear-gradient(180deg, ${mat.light} 0%, ${mat.base} 40%, ${mat.dark} 100%)`,
          border: `1px solid rgba(255,255,255,${isLight ? 0.04 : 0.025})`,
          boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12%',
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(1.2rem, 2.8vw, 2.4rem)',
              fontWeight: 600,
              color: isLight ? '#1a1a2e' : '#e0e4ec',
              letterSpacing: '0.1em',
              textAlign: 'center',
              lineHeight: 1.3,
              fontVariant: 'all-small-caps',
              textShadow: isLight ? '0 1px 1px rgba(255,255,255,0.2)' : '0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            {book.title}
          </div>
          <div
            style={{
              width: '50%',
              height: 1,
              margin: '8% 0',
              background: isLight
                ? 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            }}
          />
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(0.7rem, 1.4vw, 1.1rem)',
              color: isLight ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.3)',
              letterSpacing: '0.15em',
            }}
          >
            Brandon Sanderson
          </div>
        </div>
      </div>
    </div>
  )
}
