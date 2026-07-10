import { useState, memo, useMemo } from 'react'
import type { Book } from '@/types'
import CoverFrame from './CoverFrame'

interface MaterialConfig {
  leather: { base: string; dark: string; light: string; highlight: string }
  foil: string
  foilShine: string
  headband: [string, string]
  pageEdge: string
  isLight: boolean
}

const MATERIALS: Record<string, MaterialConfig> = {
  stormlight: {
    leather: { base: '#0c1220', dark: '#060a12', light: '#1a2640', highlight: '#2a3a5a' },
    foil: '#c0c8d4',
    foilShine: '#e8ecf4',
    headband: ['#1a3050', '#c0c8d4'],
    pageEdge: '#e8e0d0',
    isLight: false,
  },
  'mistborn-era-1': {
    leather: { base: '#120a06', dark: '#0a0502', light: '#20140e', highlight: '#2e1c14' },
    foil: '#b87333',
    foilShine: '#d4a060',
    headband: ['#802020', '#b87333'],
    pageEdge: '#e4dcc8',
    isLight: false,
  },
  'mistborn-era-2': {
    leather: { base: '#0c1624', dark: '#060c14', light: '#14263a', highlight: '#203850' },
    foil: '#b8860b',
    foilShine: '#e8c840',
    headband: ['#1a3040', '#b8860b'],
    pageEdge: '#e8e0d4',
    isLight: false,
  },
  elantris: {
    leather: { base: '#e8e4e0', dark: '#d0cbc6', light: '#f5f0eb', highlight: '#ffffff' },
    foil: '#a0a0a8',
    foilShine: '#d4d4dc',
    headband: ['#c8c0b8', '#a0a0a8'],
    pageEdge: '#f0ece6',
    isLight: true,
  },
  warbreaker: {
    leather: { base: '#1a0a1e', dark: '#0e0410', light: '#2d1035', highlight: '#401848' },
    foil: '#d4af37',
    foilShine: '#f0e6a0',
    headband: ['#401030', '#d4af37'],
    pageEdge: '#e4dcc8',
    isLight: false,
  },
  'white-sand': {
    leather: { base: '#2a1e14', dark: '#1a120a', light: '#3d2c1e', highlight: '#4e3828' },
    foil: '#b87333',
    foilShine: '#daa060',
    headband: ['#4a3020', '#b87333'],
    pageEdge: '#e8e0d0',
    isLight: false,
  },
  'secret-projects': {
    leather: { base: '#0a0a18', dark: '#04040e', light: '#1a1a2e', highlight: '#282848' },
    foil: '#e2e8f0',
    foilShine: '#ffffff',
    headband: ['#181828', '#e2e8f0'],
    pageEdge: '#e8e0d4',
    isLight: false,
  },
  'arcanum-unbounded': {
    leather: { base: '#1a0a2e', dark: '#0e0418', light: '#2a1040', highlight: '#3a1a52' },
    foil: '#a0a0c0',
    foilShine: '#d0d0e0',
    headband: ['#20103a', '#a0a0c0'],
    pageEdge: '#e8e0d0',
    isLight: false,
  },
}

const FALLBACK_MATERIAL: MaterialConfig = {
  leather: { base: '#1a1428', dark: '#0e0a18', light: '#2a1e3e', highlight: '#3a2a52' },
  foil: '#9ca3af',
  foilShine: '#d1d5db',
  headband: ['#1a1028', '#9ca3af'],
  pageEdge: '#e8e0d0',
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

function getTitleLayout(title: string, mode: TextMode): TitleLine[] {
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
    heightOffset: Math.floor(n() * 6) - 2,
    shiftX: Math.floor(n() * 7) - 3,
    shiftY: Math.floor(n() * 5) - 2,
    rotate: (Math.floor(n() * 9) - 4) * 0.1,
    depthOffset: Math.floor(n() * 5) - 2,
    cornerWear: Math.floor(n() * 3),
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

  if (!emblem || failed) {
    return (
      <div style={{ position: 'relative', width: ringSize, height: ringSize }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `1.5px solid ${foil}66`,
            boxShadow: [`inset 0 1px 3px rgba(0,0,0,0.12)`, `0 0 6px ${foilShine}22`].join(', '),
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        {(
          [
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, 0],
          ] as const
        ).map(([dx, dy], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: rivetSize,
              height: rivetSize,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, ${foilShine}, ${foil})`,
              boxShadow: `inset 0 ${-rivetSize * 0.15}px ${rivetSize * 0.3}px rgba(0,0,0,0.2)`,
              transform: `translate(calc(-50% + ${dx * (ringSize / 2 - rivetSize)}px), calc(-50% + ${dy * (ringSize / 2 - rivetSize)}px))`,
              zIndex: 2,
            }}
          />
        ))}
        <div
          style={{
            width: emblemSize * 0.5,
            height: emblemSize * 0.5,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${foilShine}, ${foil})`,
            boxShadow: `inset 0 ${-ringSize * 0.02}px ${ringSize * 0.04}px rgba(0,0,0,0.15)`,
            zIndex: 1,
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: ringSize, height: ringSize }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `1.5px solid ${foil}66`,
          boxShadow: [`inset 0 1px 3px rgba(0,0,0,0.12)`, `0 0 6px ${foilShine}22`].join(', '),
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {(
        [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ] as const
      ).map(([dx, dy], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: rivetSize,
            height: rivetSize,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, ${foilShine}, ${foil})`,
            boxShadow: `inset 0 ${-rivetSize * 0.15}px ${rivetSize * 0.3}px rgba(0,0,0,0.2)`,
            transform: `translate(calc(-50% + ${dx * (ringSize / 2 - rivetSize)}px), calc(-50% + ${dy * (ringSize / 2 - rivetSize)}px))`,
            zIndex: 2,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: Math.round(ringSize * 0.18),
          zIndex: 1,
          filter:
            'brightness(1.08) drop-shadow(0 0.5px 0 rgba(255,255,255,0.08)) drop-shadow(0 -0.5px 0 rgba(0,0,0,0.12))',
        }}
      >
        <img
          src={EMBLEM_BASE + emblem}
          alt=""
          className="h-full w-full object-contain"
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
}

export default function BookSpine({ book, onOpen, width, height, fontSize }: Props) {
  const material = getMaterial(book.saga)
  const imp = useMemo(() => imperfection(book.id), [book.id])

  const actualHeight = height + imp.heightOffset
  const isLight = material.isLight
  const lightBoost = 1 + (imp.depthOffset ?? 0) * 0.06
  const shadowBoost = 1 + (imp.depthOffset ?? 0) * 0.05

  const textMode = getTextMode(width)
  const titleLayout = getTitleLayout(book.title, textMode)

  const { base, dark, light, highlight } = material.leather
  const { foil, foilShine, headband, pageEdge } = material

  const spineRadius = Math.round(width * 0.035)
  const borderRadius = `${spineRadius}px`

  // ── Leather base — warm gradient with vertical variation ──
  const leatherBase = [
    `linear-gradient(180deg,`,
    `${light} 0%,`,
    `${highlight}${isLight ? '22' : ''} 8%,`,
    `${base} 25%,`,
    `${dark} 50%,`,
    `${base} 75%,`,
    `${light}44 88%,`,
    `${base} 100%`,
    `)`,
  ].join(' ')

  // ── Spine curvature — 3D cylinder illusion ──
  const specStrength = isLight ? 0.02 : 0.045
  const curvature = [
    `linear-gradient(90deg,`,
    `rgba(0,0,0,0.55) 0%,`,
    `rgba(0,0,0,0.32) 4%,`,
    `rgba(0,0,0,0.12) 9%,`,
    `rgba(255,255,255,${specStrength}) 17%,`,
    `rgba(255,255,255,${(specStrength * 0.7).toFixed(3)}) 20%,`,
    `rgba(255,255,255,${(specStrength * 0.3).toFixed(3)}) 24%,`,
    `transparent 30%,`,
    `transparent 70%,`,
    `rgba(0,0,0,0.03) 78%,`,
    `rgba(0,0,0,0.10) 88%,`,
    `rgba(0,0,0,0.20) 94%,`,
    `rgba(0,0,0,0.50) 100%`,
    `)`,
  ].join(' ')

  // ── Leather grain — porous texture at multiple scales ──
  const grainFine = `repeating-linear-gradient(87deg, transparent, rgba(255,255,255,0.003) 0.8px, transparent 1.6px)`
  const grainFine2 = `repeating-linear-gradient(-83deg, transparent, rgba(0,0,0,0.002) 0.6px, transparent 1.4px)`
  const grainMed = `repeating-linear-gradient(92deg, transparent 0, rgba(255,255,255,0.002) 2px, transparent 4px, rgba(0,0,0,0.0015) 6px, transparent 8px)`
  const grainLarge = `repeating-linear-gradient(0deg, rgba(255,255,255,0.002) 0, transparent 1px, transparent 5px, rgba(0,0,0,0.0015) 6px, transparent 8px)`

  // ── Wrinkle/stretch lines — very subtle ──
  const wrinkles = [
    `linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.002) 12%, transparent 14%)`,
    `linear-gradient(90deg, transparent 45%, rgba(0,0,0,0.002) 47%, transparent 49%)`,
    `linear-gradient(90deg, transparent 72%, rgba(255,255,255,0.0015) 74%, transparent 76%)`,
  ].join(', ')

  const bgLayers = [grainFine, grainFine2, grainMed, grainLarge, wrinkles, leatherBase, curvature].join(', ')

  const borderColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.03)'
  const bevelShadow = [
    `inset 0.5px 0 0 rgba(255,255,255,0.02)`,
    `inset -0.5px 0 0 rgba(0,0,0,0.04)`,
    `inset 0 0.5px 0 rgba(255,255,255,0.015)`,
    `inset 0 -0.5px 0 rgba(0,0,0,0.05)`,
  ].join(', ')

  const coverOverhang = Math.max(2, Math.round(width * 0.035))
  const pageBlockPct = 0.035
  const pageBlockH = Math.max(3, Math.round(actualHeight * pageBlockPct))
  const headbandH = Math.max(2, Math.round(actualHeight * 0.004))
  const foilBandH = Math.max(2, Math.round(actualHeight * 0.006))
  const foilBandH2 = Math.max(1, Math.round(actualHeight * 0.003))

  const topPad = Math.round(actualHeight * 0.06)
  const botPad = Math.round(actualHeight * 0.06)
  const medallionPad = Math.round(actualHeight * 0.025)
  const authorBotPad = Math.round(actualHeight * 0.035)
  const innerFontSize = textMode === 'initialism' ? Math.max(fontSize + 3, 18) : fontSize

  // ── Embossed text shadow ──
  const embossShadow = isLight
    ? [`0 -0.5px 0 rgba(255,255,255,0.15)`, `0 0.5px 1px rgba(0,0,0,0.08)`].join(', ')
    : [`0 0.5px 0 ${foilShine}44`, `0 -0.5px 1px rgba(0,0,0,0.2)`, `0 -1px 2px rgba(0,0,0,0.08)`].join(', ')

  const keyColor = isLight ? base : foil
  const minorColor = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.35)'

  const frameKey =
    book.id === 'tress_of_the_emerald_sea' ? 'tress' : book.id === 'yumi_and_the_nightmare_painter' ? 'yumi' : book.saga

  // ── Foil band with metallic shimmer ──
  const foilBand = (w: number, rev = false) => {
    const stops = rev
      ? `transparent 18%, ${foil}44 25%, ${foilShine}77 30%, ${foil}55 40%, ${foilShine} 48%, ${foil}55 55%, ${foilShine}77 60%, ${foil}44 68%, transparent 75%`
      : `transparent 18%, ${foil}55 25%, ${foilShine} 30%, ${foil}55 40%, ${foilShine}77 48%, ${foil}55 55%, ${foilShine}77 60%, ${foil}44 68%, transparent 75%`
    return (
      <div
        className="mx-auto rounded-full"
        style={{
          width: `${w}%`,
          height: foilBandH,
          background: `linear-gradient(90deg, ${stops})`,
          boxShadow: [
            `inset 0 ${Math.round(foilBandH * 0.15)}px 0 rgba(255,255,255,0.08)`,
            `inset 0 ${Math.round(-foilBandH * 0.1)}px 0 rgba(0,0,0,0.1)`,
          ].join(', '),
        }}
      />
    )
  }

  const foilBandThin = (w: number) => (
    <div
      className="mx-auto rounded-full"
      style={{
        width: `${w}%`,
        height: foilBandH2,
        background: `linear-gradient(90deg, transparent 20%, ${foil}55 35%, ${foilShine}44 50%, ${foil}55 65%, transparent 80%)`,
      }}
    />
  )

  // ── Separator line ──
  const separatorLine = (
    <div
      className="pointer-events-none shrink-0"
      style={{
        width: '45%',
        height: 1,
        marginBottom: Math.round(actualHeight * 0.008),
        background: `linear-gradient(90deg, transparent 15%, ${foil}44 30%, ${foilShine}66 50%, ${foil}44 70%, transparent 85%)`,
      }}
    />
  )

  // ── Decorative corner ornaments ──
  const cornerOrnament = (position: 'top' | 'bottom') => {
    const ornSize = Math.max(4, Math.round(actualHeight * 0.022))
    const yPos =
      position === 'top' ? Math.round(actualHeight * 0.045) : actualHeight - Math.round(actualHeight * 0.045) - ornSize
    return (
      <div
        className="pointer-events-none absolute"
        style={{
          left: '50%',
          top: yPos,
          width: ornSize,
          height: ornSize,
          transform: 'translateX(-50%)',
          opacity: 0.25,
        }}
      >
        <svg viewBox="0 0 20 20" width={ornSize} height={ornSize}>
          <circle cx="10" cy="10" r="8" fill="none" stroke={foil} strokeWidth="0.6" />
          <circle cx="10" cy="10" r="3" fill={foil} opacity="0.5" />
        </svg>
      </div>
    )
  }

  // ── Page block texture (paper edges) ──
  const pageBlockStyle = (edge: 'top' | 'bottom'): React.CSSProperties => ({
    position: 'absolute',
    left: -coverOverhang,
    right: -coverOverhang,
    [edge]: 0,
    height: pageBlockH,
    background: [
      `repeating-linear-gradient(0deg, ${pageEdge} 0px, ${pageEdge} 0.8px, ${pageEdge}99 0.8px, transparent 1.6px)`,
      `linear-gradient(180deg, ${edge === 'top' ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.06)'}, transparent 100%)`,
      `linear-gradient(180deg, ${edge === 'top' ? `${pageEdge}` : 'transparent'} 0%, ${edge === 'top' ? 'transparent' : `${pageEdge}`} 100%)`,
    ].join(', '),
    pointerEvents: 'none' as const,
    zIndex: 1,
  })

  // ── Headband ──
  const headbandStyle = (edge: 'top' | 'bottom'): React.CSSProperties => ({
    position: 'absolute',
    left: -coverOverhang + 2,
    right: -coverOverhang + 2,
    [edge]: edge === 'top' ? pageBlockH : pageBlockH,
    height: headbandH + 1,
    background: [
      `repeating-linear-gradient(90deg, ${headband[0]} 0px, ${headband[0]} 3px, ${headband[1]}44 3px, ${headband[1]}44 5px)`,
      `linear-gradient(180deg, ${edge === 'top' ? `${headband[0]}55` : 'transparent'} 0%, ${edge === 'top' ? 'transparent' : `${headband[0]}55`} 100%)`,
    ].join(', '),
    boxShadow:
      edge === 'top'
        ? `inset 0 1px 0 ${headband[1]}33, inset 0 -0.5px 0 rgba(0,0,0,0.1)`
        : `inset 0 -1px 0 ${headband[1]}33, inset 0 0.5px 0 rgba(0,0,0,0.1)`,
    pointerEvents: 'none' as const,
    zIndex: 2,
  })

  // ── Cover side edges (visible at left/right) ──
  const coverSideEdge = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    top: -coverOverhang - 1,
    bottom: -coverOverhang - 1,
    [side]: side === 'left' ? -(coverOverhang + 1) : -(coverOverhang + 1),
    width: coverOverhang + 1,
    background:
      side === 'left'
        ? `linear-gradient(90deg, ${light}55 0%, ${base}88 100%)`
        : `linear-gradient(90deg, ${base}88 0%, ${dark} 100%)`,
    borderRadius:
      side === 'left'
        ? `${Math.round(coverOverhang * 0.3)}px 0 0 ${Math.round(coverOverhang * 0.3)}px`
        : `0 ${Math.round(coverOverhang * 0.3)}px ${Math.round(coverOverhang * 0.3)}px 0`,
    pointerEvents: 'none' as const,
    zIndex: 0,
  })

  return (
    <div className="group relative shrink-0" style={{ width }}>
      <div
        className="relative cursor-pointer select-none transition-all duration-[350ms] ease-out group-hover:translate-y-[-8px] group-hover:scale-[1.02]"
        style={{
          perspective: `${Math.round(width * 12)}px`,
          transform: `rotate(${imp.rotate}deg)`,
          height: actualHeight + coverOverhang * 2 + 2,
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          onOpen(book.id, rect)
        }}
      >
        {/* Cover side edges — left and right */}
        <div style={coverSideEdge('left')} />
        <div style={coverSideEdge('right')} />

        {/* Page block edges — visible paper */}
        <div className="opacity-60" style={pageBlockStyle('top')} />
        <div className="opacity-60" style={pageBlockStyle('bottom')} />

        {/* Headbands */}
        <div className="opacity-50" style={headbandStyle('top')} />
        <div className="opacity-50" style={headbandStyle('bottom')} />

        {/* ── Spine body ── */}
        <div
          className="relative flex flex-col items-center overflow-hidden"
          style={{
            position: 'absolute',
            left: coverOverhang,
            top: coverOverhang,
            width,
            height: actualHeight,
            borderRadius,
            background: bgLayers,
            border: `0.5px solid ${borderColor}`,
            boxShadow: [
              `0 ${Math.round(5 * shadowBoost)}px ${Math.round(10 * shadowBoost)}px rgba(0,0,0,${Math.min(0.45, 0.35 * shadowBoost).toFixed(2)})`,
              `0 ${Math.round(2 * shadowBoost)}px ${Math.round(4 * shadowBoost)}px rgba(0,0,0,0.2)`,
              `inset 0 0 0 0.5px rgba(255,255,255,${isLight ? 0.02 : 0.01})`,
              bevelShadow,
            ].join(', '),
            marginLeft: imp.shiftX,
            marginTop: imp.shiftY,
          }}
        >
          <CoverFrame saga={frameKey} width={width} height={actualHeight} foil={foil} />

          {/* Spine hinge grooves */}
          <div
            className="pointer-events-none absolute top-[2%] bottom-[2%]"
            style={{
              left: '4%',
              width: 1.5,
              background: `linear-gradient(180deg, transparent, rgba(0,0,0,0.08) 15%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.08) 85%, transparent)`,
            }}
          />
          <div
            className="pointer-events-none absolute top-[2%] bottom-[2%]"
            style={{
              right: '4%',
              width: 1.5,
              background: `linear-gradient(180deg, transparent, rgba(0,0,0,0.08) 15%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.08) 85%, transparent)`,
            }}
          />

          {/* Warm top light */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius,
              background: `linear-gradient(180deg, rgba(255,220,190,${((isLight ? 0.02 : 0.035) * lightBoost).toFixed(4)}) 0%, transparent 30%)`,
              mixBlendMode: 'overlay',
            }}
          />

          {/* Aged leather sheen */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius,
              background: `linear-gradient(180deg, rgba(255,220,190,${((isLight ? 0 : 0.01) * lightBoost).toFixed(4)}) 0%, transparent 5%, transparent 95%, rgba(0,0,0,0.02) 100%)`,
              mixBlendMode: 'soft-light',
            }}
          />

          {/* Hover reflection */}
          <div
            className="pointer-events-none absolute inset-0 rounded transition-opacity duration-[350ms] opacity-0 group-hover:opacity-100"
            style={{
              background: `linear-gradient(180deg, rgba(255,255,255,${isLight ? 0.03 : 0.06}) 0%, transparent 50%)`,
              mixBlendMode: 'overlay',
            }}
          />

          {/* ── Decorative framework ── */}

          {/* Top ornament */}
          {cornerOrnament('top')}

          {/* Top foil band — double line */}
          <div className="w-full shrink-0" style={{ padding: `${topPad}px ${Math.round(actualHeight * 0.015)}px 0` }}>
            {foilBand(78)}
            <div style={{ height: 1.5 }} />
            {foilBandThin(55)}
          </div>

          {/* Medallion / emblem */}
          <div
            className="flex shrink-0 items-center justify-center"
            style={{ paddingTop: medallionPad, paddingBottom: medallionPad }}
          >
            <BookEmblem emblem={book.emblem} foil={foil} foilShine={foilShine} bookHeight={actualHeight} />
          </div>

          {/* Separator */}
          {separatorLine}

          {/* ── Title ── */}
          <div
            className="flex w-full flex-1 flex-col items-center justify-center"
            style={{
              padding: `0 ${Math.max(6, Math.round(width * 0.12))}px`,
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
                      fontSize: piece.isKey ? `${innerFontSize}px` : `${Math.round(innerFontSize * 0.65)}px`,
                      fontWeight: piece.isKey ? 700 : 400,
                      color: piece.isKey ? keyColor : minorColor,
                      letterSpacing: piece.isKey ? '0.1em' : '0.04em',
                      textShadow: piece.isKey ? embossShadow : 'none',
                      lineHeight: 1.25,
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
              className="block text-center font-normal italic tracking-[0.18em]"
              style={{
                fontSize: `${Math.round(fontSize * 0.45)}px`,
                color: minorColor,
                opacity: 0.25,
                lineHeight: 1,
                textShadow: isLight ? 'none' : `0 0.3px 0 ${foilShine}22`,
              }}
            >
              Brandon Sanderson
            </span>
          </div>

          {/* Bottom separator */}
          {separatorLine}

          {/* Bottom ornament */}
          {cornerOrnament('bottom')}

          {/* Bottom foil band — double line */}
          <div
            className="flex w-full shrink-0 flex-col items-center"
            style={{ padding: `0 ${Math.round(actualHeight * 0.015)}px ${botPad}px` }}
          >
            {foilBandThin(55)}
            <div style={{ height: 1.5 }} />
            {foilBand(78, true)}
          </div>

          {/* Edge wear — top */}
          <div
            className="pointer-events-none absolute left-[3%] right-[3%] top-0 h-[0.5px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.035)'}, transparent)`,
            }}
          />

          {/* Edge wear — bottom */}
          <div
            className="pointer-events-none absolute bottom-0 left-[3%] right-[3%] h-[0.5px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.05), transparent)',
            }}
          />

          {/* Contact shadow */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-1"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 100%)',
              borderRadius: '50%',
              transform: 'scaleX(0.92)',
              transformOrigin: 'bottom center',
            }}
          />

          {/* Inter-book shadow */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-[3px]"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.08) 30%, rgba(0,0,0,0.02) 100%)',
              borderRadius: `0 ${spineRadius}px ${spineRadius}px 0`,
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
