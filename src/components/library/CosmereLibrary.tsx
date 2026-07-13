import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import type { Book } from '@/types'
import { BOOKS } from '@/data/static'
import { calcShelfLayout } from '@/utils/shelf-layout'
import BookSpine from './BookSpine'
import BookCanvas from './BookCanvas'

const WOOD_TEXTURE = `url('${import.meta.env.BASE_URL}images/decorations/wood-pattern.png')`

interface ShelfDef {
  id: string
  title: string
  bookIds: string[]
  saga: string
}

const SHELVES: ShelfDef[] = [
  {
    id: 'stormlight',
    title: 'THE STORMLIGHT ARCHIVE',
    saga: 'stormlight',
    bookIds: ['the_way_of_kings', 'words_of_radiance', 'oathbringer', 'dawnshard', 'rhythm_of_war', 'wind_and_truth'],
  },
  {
    id: 'mistborn',
    title: 'MISTBORN',
    saga: 'mistborn',
    bookIds: [
      'the_final_empire',
      'the_well_of_ascension',
      'the_hero_of_ages',
      'the_alloy_of_law',
      'shadows_of_self',
      'the_bands_of_mourning',
      'the_lost_metal',
    ],
  },
  {
    id: 'cosmere',
    title: 'THE COSMERE COLLECTION',
    saga: 'arcanum',
    bookIds: [
      'elantris',
      'warbreaker',
      'white_sand_vol_1',
      'white_sand_vol_2',
      'white_sand_vol_3',
      'arcanum_unbounded',
      'tress_of_the_emerald_sea',
      'yumi_and_the_nightmare_painter',
      'the_sunlit_man',
    ],
  },
]

function useContainerWidth(): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(1200)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

function ShelfPlank({ height }: { height: number }) {
  const h = Math.max(16, height)
  const bevelPx = Math.max(1, Math.round(h * 0.12))
  const shadowPx = Math.max(2, Math.round(h * 0.18))
  const textureScale = Math.max(200, Math.round(h * 8))

  // CSS grain streaks — visible even if the PNG fails to load
  const cssGrain = [
    'repeating-linear-gradient(90deg,',
    'transparent 0, transparent 7px,',
    'rgba(160,120,80,0.06) 7px, transparent 8px,',
    'transparent 15px, rgba(100,70,40,0.07) 15px, transparent 17px,',
    'transparent 24px, rgba(180,140,100,0.05) 24px, transparent 26px,',
    'transparent 33px, rgba(80,50,30,0.10) 33px, transparent 35px,',
    'transparent 42px, rgba(160,120,80,0.04) 42px, transparent 44px,',
    'transparent 51px, rgba(60,40,20,0.09) 51px, transparent 53px,',
    'transparent 60px, rgba(200,160,120,0.035) 60px, transparent 62px,',
    'transparent 69px, rgba(90,60,35,0.08) 69px, transparent 71px,',
    'transparent 78px, rgba(140,100,65,0.05) 78px, transparent 80px,',
    'transparent 87px, rgba(70,45,25,0.09) 87px, transparent 89px,',
    'transparent 96px, rgba(170,130,90,0.035) 96px, transparent 98px,',
    'transparent 105px, rgba(50,35,20,0.11) 105px, transparent 107px,',
    'transparent 114px, rgba(130,95,60,0.06) 114px, transparent 116px,',
    'transparent 123px, rgba(80,55,30,0.08) 123px, transparent 125px,',
    'transparent 132px, rgba(190,150,110,0.03) 132px, transparent 134px,',
    'transparent 141px, rgba(60,40,25,0.10) 141px, transparent 143px,',
    'transparent 150px',
    ')',
  ].join(' ')

  return (
    <div
      className="w-full shrink-0"
      style={{
        height: h,
        position: 'relative',
        background: [
          // Knots
          'radial-gradient(ellipse 24px 6px at 15% 38%, rgba(40,25,15,0.12) 0%, rgba(80,50,30,0.04) 60%, transparent 100%)',
          'radial-gradient(ellipse 14px 4px at 68% 55%, rgba(35,20,10,0.1) 0%, rgba(60,40,25,0.03) 60%, transparent 100%)',
          'radial-gradient(ellipse 10px 3px at 42% 22%, rgba(30,18,8,0.08) 0%, transparent 100%)',
          'radial-gradient(ellipse 18px 5px at 88% 75%, rgba(40,25,15,0.09) 0%, rgba(60,40,25,0.03) 60%, transparent 100%)',
          // Subtle warm wash
          'linear-gradient(180deg, rgba(200,170,130,0.025) 0%, transparent 20%, rgba(200,170,130,0.015) 50%, transparent 80%)',
          // Bottom shadow
          `linear-gradient(0deg, rgba(0,0,0,0.18) 0%, transparent ${shadowPx}px)`,
          // Top bevel highlight
          `linear-gradient(180deg, rgba(255,220,180,0.12) 0%, rgba(255,210,170,0.04) ${bevelPx}px, transparent ${Math.round(h * 0.14)}px)`,
          // Real wood grain overlay (transparent PNG)
          `${WOOD_TEXTURE} repeat 0 0 / ${textureScale}px 100%`,
          // CSS grain streaks (visible fallback + primary grain detail)
          cssGrain,
          // Sapwood streaks — wider lighter bands
          'linear-gradient(180deg, transparent 0%, rgba(200,170,130,0.04) 15%, transparent 30%)',
          'linear-gradient(180deg, transparent 60%, rgba(180,145,105,0.03) 75%, transparent 90%)',
          // Base gradient — warm walnut
          'linear-gradient(180deg, #4a3220 0%, #3d2817 10%, #543820 30%, #3a2212 45%, #4a3020 65%, #2d1a0e 80%, #1f1008 100%)',
        ].join(', '),
        boxShadow: [
          'inset 0 1px 0 rgba(255,220,180,0.08)',
          'inset 0 -1px 0 rgba(0,0,0,0.1)',
          '0 2px 6px rgba(0,0,0,0.2)',
          '0 8px 14px rgba(0,0,0,0.1)',
        ].join(', '),
        borderRadius: `0 0 ${Math.round(h * 0.18)}px ${Math.round(h * 0.18)}px`,
      }}
    />
  )
}

// ── Side column — architectural carved inscription ────────────
function sideSubtitle(id: string): string | null {
  switch (id) {
    case 'stormlight':
      return 'ROSHAR'
    case 'mistborn':
      return 'SCADRIAL'
    default:
      return null
  }
}

function SideColumn({
  side,
  width,
  title,
  subtitle,
}: {
  side: 'left' | 'right'
  width: number
  title: string
  subtitle: string | null
}) {
  if (side === 'right') {
    return (
      <div
        className="shrink-0"
        style={{
          width,
          borderLeft: '0.5px solid rgba(0,0,0,0.08)',
        }}
      >
        {/* Vertical decorative groove */}
        <div
          className="mx-auto"
          style={{
            width: 1,
            height: '62%',
            marginTop: '19%',
            background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.04), transparent)',
          }}
        />
      </div>
    )
  }

  const words = title.split(' ')
  const fontSize = Math.max(7, Math.min(13, Math.round(width * 0.28)))
  const carveShadow = ['-1px -1px 0.5px rgba(0,0,0,0.12)', '0 0.5px 0 rgba(200,160,120,0.04)'].join(', ')
  const ornSize = Math.max(6, Math.round(width * 0.4))

  return (
    <div
      className="shrink-0"
      style={{
        width,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '0.5px solid rgba(0,0,0,0.08)',
        gap: Math.round(fontSize * 0.3),
      }}
    >
      {/* Top ornament — Vorin diamond */}
      <svg width={ornSize} height={ornSize} viewBox="0 0 20 20" style={{ opacity: 0.12, marginBottom: fontSize * 0.2 }}>
        <path d="M10 2 L18 10 L10 18 L2 10 Z" fill="none" stroke="#8a7050" strokeWidth="0.5" />
        <circle cx="10" cy="10" r="1.5" fill="#8a7050" opacity="0.3" />
      </svg>

      {/* Words stacked vertically */}
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            fontFamily: "'Cormorant Garamond', 'Georgia', serif",
            fontSize,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: Math.round(fontSize * 0.12),
            color: '#0d0703',
            textShadow: carveShadow,
            lineHeight: 1.08,
            textAlign: 'center',
            display: 'block',
            maxWidth: width - 4,
            wordBreak: 'break-word',
          }}
        >
          {word}
        </span>
      ))}

      {/* Subtitle */}
      {subtitle && (
        <>
          <div
            style={{
              width: ornSize * 0.6,
              height: 0.5,
              background: 'rgba(140,110,80,0.08)',
              marginTop: fontSize * 0.1,
            }}
          />
          <span
            style={{
              fontFamily: "'Cormorant Garamond', 'Georgia', serif",
              fontSize: Math.round(fontSize * 0.75),
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: Math.round(fontSize * 0.2),
              color: '#0d0703',
              textShadow: carveShadow,
              lineHeight: 1.1,
              textAlign: 'center',
              opacity: 0.7,
            }}
          >
            {subtitle}
          </span>
        </>
      )}

      {/* Bottom ornament */}
      <svg width={ornSize} height={ornSize} viewBox="0 0 20 20" style={{ opacity: 0.12, marginTop: fontSize * 0.2 }}>
        <path d="M10 2 L18 10 L10 18 L2 10 Z" fill="none" stroke="#8a7050" strokeWidth="0.5" />
        <circle cx="10" cy="10" r="1.5" fill="#8a7050" opacity="0.3" />
      </svg>
    </div>
  )
}

export default function CosmereLibrary() {
  const [activeBookId, setActiveBookId] = useState<string | null>(null)
  const [spineRect, setSpineRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [containerRefObj, containerWidth] = useContainerWidth()

  const handleOpen = useCallback((id: string, rect: DOMRect) => {
    setActiveBookId(id)
    setSpineRect({ x: rect.x, y: rect.y, w: rect.width, h: rect.height })
  }, [])

  const handleClose = useCallback(() => {
    setActiveBookId(null)
    setSpineRect(null)
  }, [])

  const shelvesWithBooks = useMemo(
    () =>
      SHELVES.map((shelf) => ({
        ...shelf,
        books: shelf.bookIds.map((id) => BOOKS.find((b) => b.id === id)).filter((b): b is Book => !!b),
      })),
    [],
  )

  const outerPad = 100
  const availableWidth = Math.max(400, containerWidth - outerPad)
  const columnWidth = Math.max(26, Math.min(42, Math.round(availableWidth * 0.04)))
  const innerWidth = Math.max(300, availableWidth - 2 * columnWidth)

  const shelfLayouts = useMemo(
    () =>
      shelvesWithBooks.map((shelf) => {
        const wordCounts = shelf.books.map((b) => b.wordCount ?? 50000)
        return calcShelfLayout(wordCounts, innerWidth)
      }),
    [shelvesWithBooks, innerWidth],
  )

  const plankHeight = Math.max(16, Math.round(availableWidth * 0.01))

  const activeBook = activeBookId
    ? (shelvesWithBooks.flatMap((s) => s.books).find((b) => b.id === activeBookId) ?? null)
    : null

  return (
    <>
      <div
        ref={containerRefObj}
        className="relative flex min-h-0 flex-1 flex-col gap-36 overflow-y-auto px-24 pb-20 pt-16"
      >
        {shelvesWithBooks.map((shelf, si) => {
          const layout = shelfLayouts[si]!
          const h = layout.books[0]!.height
          const spacing = Math.max(6, Math.round(layout.gap * 1.4))

          return (
            <div
              key={shelf.id}
              className="flex flex-col items-start"
              style={{
                // Cabinet body wood with warm overhead light falloff
                background: [
                  `linear-gradient(180deg, rgba(255,210,170,${(0.025 * Math.max(0.25, 1 - si * 0.3)).toFixed(4)}) 0%, transparent 45%)`,
                  `${WOOD_TEXTURE} repeat 0 0 / ${Math.round(plankHeight * 15)}px 100%`,
                  // Very dark wood base for cabinet body
                  'linear-gradient(180deg, #1a0e08 0%, #0f0804 100%)',
                ].join(', '),
                // Cabinet cast shadow (wide + close) separates the shelf unit from the wall
                boxShadow: [
                  '0 20px 60px rgba(0,0,0,0.08)',
                  '0 4px 24px rgba(0,0,0,0.3)',
                  '0 2px 8px rgba(0,0,0,0.15)',
                ].join(', '),
                borderRadius: '4px',
              }}
            >
              {/* Content row: columns + books */}
              <div className="flex" style={{ width: layout.totalWidth + 2 * columnWidth }}>
                {/* Left column — carved inscription */}
                <SideColumn side="left" width={columnWidth} title={shelf.title} subtitle={sideSubtitle(shelf.id)} />

                {/* Book area */}
                <div className="flex flex-1 flex-col">
                  <div
                    className="flex items-end"
                    style={{
                      gap: spacing,
                      padding: `${Math.round(h * 0.24)}px ${layout.sidePadding}px 0`,
                      minHeight: h + Math.round(h * 0.2),
                      background: [
                        // Floor shadow
                        'radial-gradient(ellipse 80% 25% at 50% 90%, rgba(0,0,0,0.15) 0%, transparent 100%)',
                        // Side wall shadows
                        `linear-gradient(90deg, rgba(0,0,0,0.18) 0%, transparent 6%, transparent 94%, rgba(0,0,0,0.18) 100%)`,
                        'linear-gradient(90deg, rgba(0,0,0,0.05) 0%, transparent 4%, transparent 96%, rgba(0,0,0,0.05) 100%)',
                        // Top shelf shadow
                        `linear-gradient(180deg, rgba(0,0,0,0.28) 0%, transparent ${Math.round(h * 0.1)}%, transparent 100%)`,
                        // Wood grain on back panel
                        `${WOOD_TEXTURE} repeat 0 0 / ${Math.round(plankHeight * 15)}px 100%`,
                        // Recessed back wall base
                        'linear-gradient(180deg, #1a0e08 0%, #0f0804 45%, #080402 100%)',
                      ].join(', '),
                      boxShadow: [
                        `inset 0 0 ${Math.round(availableWidth * 0.06)}px rgba(0,0,0,0.5)`,
                        'inset 0 1px 0 rgba(255,255,255,0.015)',
                      ].join(', '),
                      borderTopLeftRadius: Math.round(plankHeight * 0.3),
                      borderTopRightRadius: Math.round(plankHeight * 0.3),
                    }}
                  >
                    {shelf.books.map((book, bi) => {
                      const bl = layout.books[bi]!
                      return (
                        <BookSpine
                          key={book.id}
                          book={book}
                          onOpen={handleOpen}
                          width={bl.width}
                          height={bl.height}
                          fontSize={bl.fontSize}
                        />
                      )
                    })}
                  </div>
                </div>

                {/* Right column — structural */}
                <SideColumn side="right" width={columnWidth} title="" subtitle={null} />
              </div>
              <ShelfPlank height={plankHeight} />
            </div>
          )
        })}
      </div>

      {activeBook && spineRect && <BookCanvas book={activeBook} rect={spineRect} onClose={handleClose} />}
    </>
  )
}
