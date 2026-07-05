import { useState, memo } from 'react'
import type { Book } from '@/types'

// ─── Saga Palettes ──
interface SagaPalette {
  primary: string
  metal: string
  bg: string
  bgLight: string
  accent: string
}

const SAGA_PALETTES: Record<string, SagaPalette> = {
  stormlight: {
    primary: '#fbbf24',
    metal: '#ffd700',
    bg: '#0c1222',
    bgLight: '#1a2444',
    accent: '#38bdf8',
  },
  'mistborn-era-1': {
    primary: '#f87171',
    metal: '#94a3b8',
    bg: '#1a1111',
    bgLight: '#2a1818',
    accent: '#991b1b',
  },
  'mistborn-era-2': {
    primary: '#2dd4bf',
    metal: '#b8860b',
    bg: '#0a1628',
    bgLight: '#142840',
    accent: '#0d9488',
  },
  elantris: {
    primary: '#60a5fa',
    metal: '#c0c0c0',
    bg: '#e8e4e0',
    bgLight: '#f5f0eb',
    accent: '#1e3a5f',
  },
  warbreaker: {
    primary: '#34d399',
    metal: '#d4af37',
    bg: '#1a0a1e',
    bgLight: '#2d1035',
    accent: '#a21caf',
  },
  'white-sand': {
    primary: '#fb923c',
    metal: '#b87333',
    bg: '#1a1410',
    bgLight: '#2a1e14',
    accent: '#92400e',
  },
  'secret-projects': {
    primary: '#f472b6',
    metal: '#e2e8f0',
    bg: '#0a0a0a',
    bgLight: '#1a1a2e',
    accent: '#7e22ce',
  },
  'arcanum-unbounded': {
    primary: '#818cf8',
    metal: '#c0c0c0',
    bg: '#1a0a2e',
    bgLight: '#2a1040',
    accent: '#6b21a8',
  },
}

const FALLBACK_PALETTE: SagaPalette = {
  primary: '#a78bfa',
  metal: '#9ca3af',
  bg: '#1f1b2e',
  bgLight: '#2a2440',
  accent: '#7c3aed',
}

function getPalette(sagaId: string): SagaPalette {
  return SAGA_PALETTES[sagaId] ?? FALLBACK_PALETTE
}

// ─── Title wrapping ──
function wrapTitle(title: string, charWidth: number): string[] {
  const words = title.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (test.length <= charWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
      if (word.length > charWidth) {
        for (let i = 0; i < word.length; i += charWidth) {
          const chunk = word.slice(i, i + charWidth)
          lines.push(chunk)
        }
        current = ''
      }
    }
  }
  if (current) lines.push(current)
  return lines
}

// ─── Emblem ──
const EMBLEM_BASE = import.meta.env.BASE_URL + 'images/emblems/'

const BookEmblem = memo(function BookEmblem({
  emblem,
  primary,
  bookHeight,
}: {
  emblem?: string
  primary: string
  bookHeight: number
}) {
  const [failed, setFailed] = useState(false)
  const size = Math.round(bookHeight * 0.045)

  if (!emblem || failed) {
    const dotSize = Math.round(size * 0.6)
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div
          className="rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: primary,
            boxShadow: `0 0 ${Math.round(size * 0.35)}px ${primary}88`,
            opacity: 0.85,
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <img
        src={EMBLEM_BASE + emblem}
        alt=""
        className="max-h-full max-w-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  )
})

// ─── BookSpine (receives layout from parent) ──
interface Props {
  book: Book
  isExiting: boolean
  onSelect: (id: string) => void
  width: number
  height: number
  fontSize: number
  charWidth: number
  staggerDelay: number
}

export default function BookSpine({
  book,
  isExiting,
  onSelect,
  width,
  height,
  fontSize,
  charWidth,
  staggerDelay,
}: Props) {
  const palette = getPalette(book.saga)
  const [hovered, setHovered] = useState(false)

  const titleLines = wrapTitle(book.title, charWidth)

  const hoverLift = Math.round(height * 0.015)
  const exitSlide = Math.round(width * 0.15)

  const tf = isExiting
    ? `translateX(-${Math.max(exitSlide, 30)}px) rotateY(-12deg)`
    : hovered
      ? `translateY(-${hoverLift}px) rotateZ(-1.2deg) rotateX(3deg) scale(1.04)`
      : 'none'

  const shadowBlurHover = Math.round(height * 0.06)
  const shadowBlurExit = Math.round(height * 0.08)

  const shadow = isExiting
    ? `${shadowBlurExit}px ${Math.round(height * 0.03)}px ${shadowBlurExit}px rgba(0,0,0,0.6), 0 0 ${Math.round(height * 0.08)}px ${palette.primary}44`
    : hovered
      ? `${shadowBlurHover}px ${Math.round(height * 0.025)}px ${shadowBlurHover}px rgba(0,0,0,0.6), 0 0 ${Math.round(height * 0.08)}px ${palette.primary}44`
      : `inset ${Math.round(-width * 0.025)}px 0 ${Math.round(width * 0.015)}px rgba(0,0,0,0.3), ${Math.round(width * 0.02)}px ${Math.round(height * 0.01)}px ${Math.round(height * 0.015)}px rgba(0,0,0,0.35)`

  const isLightBg = palette.bg === '#e8e4e0'
  const textColor = isLightBg ? palette.accent : '#ffffff'
  const textColorDim = isLightBg ? '#666' : '#bbb'

  const bgGradient = `linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 12%, transparent 88%, rgba(0,0,0,0.35) 100%), linear-gradient(180deg, ${palette.bgLight} 0%, ${palette.bg} 50%, ${palette.bgLight} 100%)`

  const bandH = Math.round(height * 0.005)
  const bandH2 = Math.round(height * 0.004)
  const bandH3 = Math.round(height * 0.003)
  const borderRadius = Math.round(width * 0.02)
  const perspective = Math.round(width * 12)

  return (
    <div
      className="relative shrink-0 cursor-pointer select-none transition-all duration-300 ease-out"
      style={{
        width,
        height,
        perspective: `${perspective}px`,
        animation: staggerDelay >= 0 ? `scale-in 0.4s ease-out ${staggerDelay}s both` : 'none',
      }}
      onClick={() => onSelect(book.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex h-full w-full flex-col items-center overflow-hidden transition-all duration-400 ease-out"
        style={{
          transform: tf,
          boxShadow: shadow,
          background: bgGradient,
          opacity: hovered ? 1 : 0.92,
          borderRadius,
        }}
      >
        <div
          className="flex w-full shrink-0 gap-[1px]"
          style={{
            padding: `${Math.round(height * 0.025)}px ${Math.round(height * 0.016)}px ${Math.round(height * 0.016)}px`,
          }}
        >
          <div
            className="flex-1 rounded-full"
            style={{ height: bandH, background: `linear-gradient(90deg, transparent, ${palette.metal}, transparent)` }}
          />
        </div>

        <div className="flex shrink-0 items-center justify-center" style={{ opacity: 0.85 }}>
          <BookEmblem emblem={book.emblem} primary={palette.primary} bookHeight={height} />
        </div>

        <div
          className="flex w-full flex-1 flex-col items-center justify-center"
          style={{ padding: `0 ${Math.round(height * 0.016)}px` }}
        >
          {titleLines.map((line, i) => (
            <span
              key={i}
              className="text-center font-bold tracking-wider"
              style={{
                fontSize: `${fontSize}px`,
                color: textColor,
                letterSpacing: '0.04em',
                lineHeight: `${Math.round(fontSize * 1.1)}px`,
                textShadow: isLightBg
                  ? 'none'
                  : `0 ${Math.round(height * 0.002)}px ${Math.round(height * 0.004)}px rgba(0,0,0,0.5)`,
              }}
            >
              {line}
            </span>
          ))}
        </div>

        <div className="shrink-0" style={{ paddingBottom: Math.round(height * 0.012) }}>
          <span
            className="block text-center font-normal tracking-wider"
            style={{
              fontSize: `${Math.round(fontSize * 0.55)}px`,
              color: textColorDim,
              opacity: 0.7,
              lineHeight: 1.1,
            }}
          >
            Sanderson
          </span>
        </div>

        <div
          className="flex w-full shrink-0 flex-col items-center gap-[1px]"
          style={{
            padding: `${Math.round(height * 0.008)}px ${Math.round(height * 0.016)}px ${Math.round(height * 0.016)}px`,
          }}
        >
          <div
            style={{
              width: '60%',
              height: bandH3,
              borderRadius: '999px',
              background: `linear-gradient(90deg, transparent, ${palette.metal}88, transparent)`,
            }}
          />
          <div
            style={{
              width: '80%',
              height: bandH2,
              borderRadius: '999px',
              background: `linear-gradient(90deg, transparent, ${palette.metal}, transparent)`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
