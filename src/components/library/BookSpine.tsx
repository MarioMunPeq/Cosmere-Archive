import { useState, memo, useMemo } from 'react'
import type { Book } from '@/types'
import CoverFrame from './CoverFrame'

interface MaterialConfig {
  leather: { base: string; dark: string; light: string }
  foil: string
  foilShine: string
  isLight: boolean
}

const MATERIALS: Record<string, MaterialConfig> = {
  stormlight: {
    leather: { base: '#0c1220', dark: '#060a12', light: '#1a2640' },
    foil: '#c0c8d4',
    foilShine: '#e8ecf0',
    isLight: false,
  },
  'mistborn-era-1': {
    leather: { base: '#120a06', dark: '#0a0502', light: '#20140e' },
    foil: '#b87333',
    foilShine: '#d4a060',
    isLight: false,
  },
  'mistborn-era-2': {
    leather: { base: '#0c1624', dark: '#060c14', light: '#14263a' },
    foil: '#b8860b',
    foilShine: '#e8c840',
    isLight: false,
  },
  elantris: {
    leather: { base: '#e8e4e0', dark: '#d0cbc6', light: '#f5f0eb' },
    foil: '#a0a0a8',
    foilShine: '#d4d4dc',
    isLight: true,
  },
  warbreaker: {
    leather: { base: '#1a0a1e', dark: '#0e0410', light: '#2d1035' },
    foil: '#d4af37',
    foilShine: '#f0e6a0',
    isLight: false,
  },
  'white-sand': {
    leather: { base: '#2a1e14', dark: '#1a120a', light: '#3d2c1e' },
    foil: '#b87333',
    foilShine: '#daa060',
    isLight: false,
  },
  'secret-projects': {
    leather: { base: '#0a0a18', dark: '#04040e', light: '#1a1a2e' },
    foil: '#e2e8f0',
    foilShine: '#ffffff',
    isLight: false,
  },
  'arcanum-unbounded': {
    leather: { base: '#1a0a2e', dark: '#0e0418', light: '#2a1040' },
    foil: '#a0a0c0',
    foilShine: '#d0d0e0',
    isLight: false,
  },
}

const FALLBACK_MATERIAL: MaterialConfig = {
  leather: { base: '#1a1428', dark: '#0e0a18', light: '#2a1e3e' },
  foil: '#9ca3af',
  foilShine: '#d1d5db',
  isLight: false,
}

const MINOR_WORDS = new Set([
  'the',
  'a',
  'an',
  'of',
  'in',
  'on',
  'at',
  'to',
  'for',
  'and',
  'or',
  'but',
  'by',
  'with',
  'from',
  'into',
  'upon',
  'its',
  'his',
  'her',
  'their',
  'our',
  'your',
  'my',
  'is',
])

function getMaterial(sagaId: string): MaterialConfig {
  return MATERIALS[sagaId] ?? FALLBACK_MATERIAL
}

function getInitials(title: string): string {
  const words = title.split(' ')
  if (words.length === 1 && words[0]) return words[0].slice(0, 2).toUpperCase()
  return words
    .filter((w) => w.length > 0)
    .map((w) => w[0]!)
    .join('')
    .toUpperCase()
    .slice(0, 4)
}

type TextMode = 'initialism' | 'stacked' | 'wrapped' | 'flowing'

function getTextMode(w: number): TextMode {
  if (w < 38) return 'initialism'
  if (w < 52) return 'stacked'
  if (w < 74) return 'wrapped'
  return 'flowing'
}

function splitWord(w: string): string[] {
  if (w.length <= 4) return [w.toUpperCase()]
  const mid = Math.ceil(w.length / 2)
  const a = w.slice(0, mid)
  const b = w.slice(mid)
  if (a.length <= 2) return [w.toUpperCase()]
  return [a.toUpperCase(), b.toUpperCase()]
}

interface WordPiece {
  text: string
  isKey: boolean
}

function getWordPieces(title: string): WordPiece[] {
  return title.split(' ').map((w) => ({ text: w, isKey: !MINOR_WORDS.has(w.toLowerCase()) }))
}

interface TitleLine {
  pieces: WordPiece[]
}

function getTitleLayout(title: string, mode: TextMode, _fontSize: number): TitleLine[] {
  const pieces = getWordPieces(title)
  if (mode === 'initialism') return [{ pieces: [{ text: getInitials(title), isKey: true }] }]
  if (mode === 'stacked') {
    if (pieces.length === 1) {
      const p = pieces[0]!
      return splitWord(p.text).map((t) => ({ pieces: [{ text: t, isKey: true }] }))
    }
    if (pieces.length <= 3 && title.length <= 18) return pieces.map((p) => ({ pieces: [p] }))
    return [{ pieces: [{ text: getInitials(title), isKey: true }] }]
  }
  if (mode === 'wrapped') {
    const groups: TitleLine[] = []
    let current: WordPiece[] = []
    for (const p of pieces) {
      const lineLen = [...current, p].reduce((s, x) => s + x.text.length + 1, 0)
      if (current.length > 0 && lineLen > 18) {
        groups.push({ pieces: current })
        current = [p]
      } else {
        current.push(p)
      }
    }
    if (current.length > 0) groups.push({ pieces: current })
    return groups.length > 0 ? groups : [{ pieces }]
  }
  if (mode === 'flowing') return pieces.map((p) => ({ pieces: [p] }))
  return [{ pieces }]
}

function imperfection(id: string) {
  let s = 0
  for (let i = 0; i < id.length; i++) {
    s = (s << 5) - s + id.charCodeAt(i)
    s |= 0
  }
  const n = () => {
    s = (s * 1103515245 + 12345) | 0
    return (s >>> 0) / 0xffffffff
  }
  return {
    heightOffset: Math.floor(n() * 5) - 2,
    shiftX: Math.floor(n() * 5) - 2,
    rotate: (Math.floor(n() * 7) - 3) * 0.1,
  }
}

const EMBLEM_BASE = import.meta.env.BASE_URL + 'images/emblems/'

const BookEmblem = memo(function BookEmblem({
  emblem,
  foil,
  foilShine,
  bookHeight,
}: {
  emblem?: string
  foil: string
  foilShine: string
  bookHeight: number
}) {
  const [failed, setFailed] = useState(false)
  const ringSize = Math.round(bookHeight * 0.18)
  const emblemSize = Math.round(ringSize * 0.65)
  const rivetSize = Math.max(2, Math.round(ringSize * 0.07))

  const ringStyle = (hasEmblem: boolean): React.CSSProperties => ({
    position: 'relative',
    width: ringSize,
    height: ringSize,
    ...(hasEmblem ? {} : { display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  })

  const ringBorder = (): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: `1px solid ${foil}44`,
    boxShadow: `inset 0 1px 2px rgba(0,0,0,0.08)`,
    pointerEvents: 'none' as const,
    zIndex: 0,
  })

  const rivets = (): React.ReactNode[] => {
    const positions = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ] as const
    return positions.map(([dx, dy], i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: rivetSize,
          height: rivetSize,
          borderRadius: '50%',
          background: foil,
          boxShadow: `inset 0 ${Math.round(-rivetSize * 0.15)}px ${Math.round(rivetSize * 0.25)}px rgba(0,0,0,0.15)`,
          transform: `translate(calc(-50% + ${dx * (ringSize / 2 - rivetSize)}px), calc(-50% + ${dy * (ringSize / 2 - rivetSize)}px))`,
          zIndex: 2,
        }}
      />
    ))
  }

  if (!emblem || failed) {
    return (
      <div style={ringStyle(false)}>
        <div style={ringBorder()} />
        {rivets()}
        <div
          style={{
            width: emblemSize * 0.5,
            height: emblemSize * 0.5,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${foilShine}, ${foil})`,
            boxShadow: `inset 0 ${Math.round(-ringSize * 0.02)}px ${Math.round(ringSize * 0.03)}px rgba(0,0,0,0.1)`,
            zIndex: 1,
          }}
        />
      </div>
    )
  }

  return (
    <div style={ringStyle(true)}>
      <div style={ringBorder()} />
      {rivets()}
      <div
        style={{
          position: 'absolute',
          inset: Math.round(ringSize * 0.18),
          zIndex: 1,
        }}
      >
        <img
          src={EMBLEM_BASE + emblem}
          alt=""
          className="h-full w-full object-contain"
          style={{
            filter:
              'brightness(1.05) drop-shadow(0 0.5px 0 rgba(255,255,255,0.06)) drop-shadow(0 -0.5px 0 rgba(0,0,0,0.1))',
          }}
          onError={() => setFailed(true)}
        />
      </div>
    </div>
  )
})

interface Props {
  book: Book
  onOpen: (id: string, rect: DOMRect) => void
  width: number
  height: number
  fontSize: number
  isHidden?: boolean
}

export default function BookSpine({ book, onOpen, width, height, fontSize, isHidden }: Props) {
  const material = getMaterial(book.saga)
  const imp = useMemo(() => imperfection(book.id), [book.id])

  const actualHeight = height + imp.heightOffset
  const isLight = material.isLight

  const textMode = getTextMode(width)
  const titleLayout = getTitleLayout(book.title, textMode, fontSize)

  const borderRadius = `${Math.round(width * 0.03)}px`

  const { base, dark, light } = material.leather
  const { foil, foilShine } = material

  const baseBg = `linear-gradient(180deg, ${light} 0%, ${base} 35%, ${dark} 55%, ${dark} 85%, ${base} 100%)`

  const spineCurve = `linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.04) 20%, transparent 35%, transparent 65%, rgba(0,0,0,0.04) 80%, rgba(0,0,0,0.35) 100%)`

  const cantoLeft = `linear-gradient(90deg, rgba(255,255,255,${isLight ? 0 : 0.02}) 0%, transparent 4%, transparent 96%, rgba(0,0,0,0.03) 100%)`

  const bgLayers = [cantoLeft, baseBg, spineCurve].join(', ')

  const borderColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.025)'
  const bevelShadow = `inset 0.5px 0 0 rgba(255,255,255,0.015), inset -0.5px 0 0 rgba(0,0,0,0.03), inset 0 0.5px 0 rgba(255,255,255,0.01), inset 0 -0.5px 0 rgba(0,0,0,0.04)`

  const goldH = Math.max(2, Math.round(actualHeight * 0.005))
  const goldH2 = Math.max(1, Math.round(actualHeight * 0.003))
  const topPad = Math.round(actualHeight * 0.07)
  const botPad = Math.round(actualHeight * 0.07)
  const medallionTopPad = Math.round(actualHeight * 0.03)
  const medallionBotPad = Math.round(actualHeight * 0.01)
  const authorBotPad = Math.round(actualHeight * 0.045)
  const innerFontSize = textMode === 'initialism' ? Math.max(fontSize + 3, 18) : fontSize

  const foilShadow = isLight
    ? `0 ${Math.round(actualHeight * 0.001)}px 0 rgba(255,255,255,0.15), 0 ${Math.round(-actualHeight * 0.001)}px ${Math.round(actualHeight * 0.003)}px rgba(0,0,0,0.08)`
    : `0 ${Math.round(actualHeight * 0.001)}px 0 ${foilShine}44, 0 ${Math.round(-actualHeight * 0.001)}px ${Math.round(actualHeight * 0.004)}px rgba(0,0,0,0.25)`

  const keyColor = isLight ? base : foil
  const minorColor = isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.4)'

  const frameKey =
    book.id === 'tress_of_the_emerald_sea' ? 'tress' : book.id === 'yumi_and_the_nightmare_painter' ? 'yumi' : book.saga

  return (
    <div className="group relative shrink-0" style={{ width, visibility: isHidden ? 'hidden' : undefined }}>
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: `${Math.round(width * 12)}px`, transform: `rotate(${imp.rotate}deg)` }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          onOpen(book.id, rect)
        }}
      >
        <div
          className="relative flex flex-col items-center overflow-hidden transition-all duration-[350ms] ease-out group-hover:translate-y-[-8px] group-hover:scale-[1.02]"
          style={{
            width,
            height: actualHeight,
            borderRadius,
            background: bgLayers,
            border: `1px solid ${borderColor}`,
            boxShadow: `0 4px 8px rgba(0,0,0,0.3), ${bevelShadow}`,
            marginLeft: imp.shiftX,
          }}
        >
          <CoverFrame saga={frameKey} width={width} height={actualHeight} foil={foil} />

          {/* Warm top light */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius,
              background: `linear-gradient(180deg, rgba(255,210,170,${isLight ? 0.015 : 0.03}) 0%, transparent 35%)`,
              mixBlendMode: 'overlay',
            }}
          />

          {/* Hover reflection */}
          <div
            className="pointer-events-none absolute inset-0 rounded transition-opacity duration-[350ms] opacity-0 group-hover:opacity-100"
            style={{
              background: `linear-gradient(180deg, rgba(255,255,255,${isLight ? 0.02 : 0.04}) 0%, transparent 45%)`,
              mixBlendMode: 'overlay',
            }}
          />

          {/* Top foil band */}
          <div className="w-full shrink-0" style={{ padding: `${topPad}px ${Math.round(actualHeight * 0.015)}px 0` }}>
            <div
              className="mx-auto rounded-full"
              style={{
                width: '82%',
                height: goldH,
                background: `linear-gradient(90deg, transparent 12%, ${foil}55 25%, ${foilShine} 50%, ${foil}55 75%, transparent 88%)`,
                boxShadow: `inset 0 ${Math.round(goldH * 0.12)}px 0 ${foilShine}22, inset 0 ${Math.round(-goldH * 0.08)}px 0 rgba(0,0,0,0.12)`,
              }}
            />
            <div
              className="mx-auto mt-[1.5px] rounded-full"
              style={{
                width: '55%',
                height: goldH2,
                background: `linear-gradient(90deg, transparent, ${foil}44, ${foilShine}33, ${foil}44, transparent)`,
              }}
            />
          </div>

          {/* Medallion logo */}
          <div
            className="flex shrink-0 items-center justify-center"
            style={{ paddingTop: medallionTopPad, paddingBottom: medallionBotPad }}
          >
            <BookEmblem emblem={book.emblem} foil={foil} foilShine={foilShine} bookHeight={actualHeight} />
          </div>

          {/* Thin separator */}
          <div
            className="pointer-events-none shrink-0"
            style={{
              width: '50%',
              height: 1,
              marginBottom: Math.round(actualHeight * 0.01),
              background: `linear-gradient(90deg, transparent 15%, ${foil}33 30%, ${foil}44 50%, ${foil}33 70%, transparent 85%)`,
              opacity: 0.25,
            }}
          />

          {/* Title */}
          <div
            className="flex w-full flex-1 flex-col items-center justify-center"
            style={{
              padding: `0 ${Math.max(5, Math.round(width * 0.1))}px`,
              fontFamily: "'Cormorant Garamond', 'Playfair Display', 'Georgia', serif",
            }}
          >
            {titleLayout.map((line, li) => (
              <div key={li} className="flex flex-wrap items-baseline justify-center gap-x-[0.25em] leading-none">
                {line.pieces.map((piece, pi) => (
                  <span
                    key={pi}
                    className="text-center"
                    style={{
                      fontSize: piece.isKey ? `${innerFontSize}px` : `${Math.round(innerFontSize * 0.7)}px`,
                      fontWeight: piece.isKey ? 600 : 400,
                      color: piece.isKey ? keyColor : minorColor,
                      letterSpacing: piece.isKey ? '0.08em' : '0.03em',
                      textShadow: piece.isKey ? foilShadow : 'none',
                      lineHeight: 1.2,
                      fontVariant: 'all-small-caps',
                    }}
                  >
                    {piece.text.toUpperCase()}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Author */}
          <div
            className="shrink-0"
            style={{
              paddingBottom: authorBotPad,
              fontFamily: "'Playfair Display', 'Georgia', 'Times New Roman', serif",
            }}
          >
            <span
              className="block text-center font-normal italic tracking-[0.15em]"
              style={{ fontSize: `${Math.round(fontSize * 0.48)}px`, color: minorColor, opacity: 0.3, lineHeight: 1 }}
            >
              Brandon Sanderson
            </span>
          </div>

          {/* Bottom foil band */}
          <div
            className="flex w-full shrink-0 flex-col items-center gap-[1.5px]"
            style={{ padding: `0 ${Math.round(actualHeight * 0.015)}px ${botPad}px` }}
          >
            <div
              className="mx-auto rounded-full"
              style={{
                width: '55%',
                height: goldH2,
                background: `linear-gradient(90deg, transparent, ${foil}44, ${foilShine}33, ${foil}44, transparent)`,
              }}
            />
            <div
              className="mx-auto rounded-full"
              style={{
                width: '82%',
                height: goldH,
                background: `linear-gradient(90deg, transparent 12%, ${foil}55 25%, ${foilShine} 50%, ${foil}55 75%, transparent 88%)`,
                boxShadow: `inset 0 ${Math.round(-goldH * 0.12)}px 0 ${foilShine}22, inset 0 ${Math.round(goldH * 0.08)}px 0 rgba(0,0,0,0.12)`,
              }}
            />
          </div>

          {/* Edge wear */}
          <div
            className="pointer-events-none absolute left-[4%] right-[4%] top-0 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${isLight ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.03)'}, transparent)`,
              opacity: 0.5,
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-[4%] right-[4%] h-[1px]"
            style={{ background: `linear-gradient(90deg, transparent, rgba(0,0,0,0.04), transparent)`, opacity: 0.5 }}
          />

          {/* Contact shadow */}
          <div
            className="pointer-events-none absolute bottom-0 left-[2px] right-[2px] h-[3px] rounded-full"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.2), transparent)' }}
          />

          {/* Inter-book shadow */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(0,0,0,0.05))`,
              borderRadius: `0 ${Math.round(width * 0.03)}px ${Math.round(width * 0.03)}px 0`,
            }}
          />
        </div>
      </div>

      {/* Tooltip for initialism mode */}
      {textMode === 'initialism' && (
        <div
          className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded border border-gray-600 bg-gray-900 px-2 py-1 text-xs text-white shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ bottom: '105%' }}
        >
          {book.title}
        </div>
      )}
    </div>
  )
}
