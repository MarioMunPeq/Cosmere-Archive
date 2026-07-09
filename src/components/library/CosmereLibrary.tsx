import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import type { Book } from '@/types'
import { BOOKS } from '@/data/static'
import { calcShelfLayout } from '@/utils/shelf-layout'
import BookSpine from './BookSpine'
import Plaque from './Plaque'
import BookCanvas from './BookCanvas'

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

  return (
    <div
      className="w-full shrink-0"
      style={{
        height: h,
        position: 'relative',
        background: [
          // Visible wood grain — alternating light/dark streaks
          'repeating-linear-gradient(90deg,',
          'transparent 0, transparent 7px,',
          'rgba(160,120,80,0.05) 7px, transparent 8px,',
          'transparent 15px, rgba(100,70,40,0.06) 15px, transparent 17px,',
          'transparent 24px, rgba(180,140,100,0.04) 24px, transparent 26px,',
          'transparent 33px, rgba(80,50,30,0.09) 33px, transparent 35px,',
          'transparent 42px, rgba(160,120,80,0.035) 42px, transparent 44px,',
          'transparent 51px, rgba(60,40,20,0.08) 51px, transparent 53px,',
          'transparent 60px, rgba(200,160,120,0.03) 60px, transparent 62px,',
          'transparent 69px, rgba(90,60,35,0.07) 69px, transparent 71px,',
          'transparent 78px, rgba(140,100,65,0.045) 78px, transparent 80px,',
          'transparent 87px, rgba(70,45,25,0.08) 87px, transparent 89px,',
          'transparent 96px, rgba(170,130,90,0.03) 96px, transparent 98px,',
          'transparent 105px, rgba(50,35,20,0.1) 105px, transparent 107px,',
          'transparent 114px, rgba(130,95,60,0.05) 114px, transparent 116px,',
          'transparent 123px, rgba(80,55,30,0.07) 123px, transparent 125px,',
          'transparent 132px, rgba(190,150,110,0.025) 132px, transparent 134px,',
          'transparent 141px, rgba(60,40,25,0.09) 141px, transparent 143px,',
          'transparent 150px',
          ')',
          // Sapwood streaks — wider lighter bands
          'linear-gradient(180deg, transparent 0%, rgba(200,170,130,0.04) 15%, transparent 30%)',
          'linear-gradient(180deg, transparent 60%, rgba(180,145,105,0.03) 75%, transparent 90%)',
          // Base gradient — warm walnut with color variation
          'linear-gradient(180deg, #4a3220 0%, #3d2817 10%, #543820 30%, #3a2212 45%, #4a3020 65%, #2d1a0e 80%, #1f1008 100%)',
          // Top bevel highlight
          `linear-gradient(180deg, rgba(255,220,180,0.12) 0%, rgba(255,210,170,0.04) ${bevelPx}px, transparent ${Math.round(h * 0.14)}px)`,
          // Bottom shadow
          `linear-gradient(0deg, rgba(0,0,0,0.18) 0%, transparent ${shadowPx}px)`,
          // Knots
          'radial-gradient(ellipse 24px 6px at 15% 38%, rgba(40,25,15,0.12) 0%, rgba(80,50,30,0.04) 60%, transparent 100%)',
          'radial-gradient(ellipse 14px 4px at 68% 55%, rgba(35,20,10,0.1) 0%, rgba(60,40,25,0.03) 60%, transparent 100%)',
          'radial-gradient(ellipse 10px 3px at 42% 22%, rgba(30,18,8,0.08) 0%, transparent 100%)',
          'radial-gradient(ellipse 18px 5px at 88% 75%, rgba(40,25,15,0.09) 0%, rgba(60,40,25,0.03) 60%, transparent 100%)',
          // Subtle warm wash across the plank
          'linear-gradient(180deg, rgba(200,170,130,0.025) 0%, transparent 20%, rgba(200,170,130,0.015) 50%, transparent 80%)',
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

  const shelfLayouts = useMemo(
    () =>
      shelvesWithBooks.map((shelf) => {
        const wordCounts = shelf.books.map((b) => b.wordCount ?? 50000)
        return calcShelfLayout(wordCounts, availableWidth)
      }),
    [shelvesWithBooks, availableWidth],
  )

  const plankHeight = Math.max(16, Math.round(availableWidth * 0.01))

  const activeBook = activeBookId
    ? (shelvesWithBooks.flatMap((s) => s.books).find((b) => b.id === activeBookId) ?? null)
    : null

  const isDimmed = activeBookId !== null

  return (
    <>
      <div
        ref={containerRefObj}
        className="relative flex min-h-0 flex-1 flex-col gap-36 overflow-y-auto px-24 pb-20 pt-16"
        style={{
          ...(isDimmed
            ? {
                opacity: 0.28,
                filter: 'blur(2px)',
                transition: 'opacity 600ms ease, filter 600ms ease',
                pointerEvents: 'none' as const,
              }
            : {
                opacity: 1,
                filter: 'blur(0px)',
                transition: 'opacity 600ms ease, filter 600ms ease',
              }),
        }}
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
                // Each lower shelf receives less overhead light
                background: `linear-gradient(180deg, rgba(255,210,170,${(0.025 * Math.max(0.25, 1 - si * 0.3)).toFixed(4)}) 0%, transparent 45%)`,
                // Cabinet cast shadow (wide + close) separates the shelf unit from the wall
                boxShadow: [
                  '0 20px 60px rgba(0,0,0,0.08)',
                  '0 4px 24px rgba(0,0,0,0.3)',
                  '0 2px 8px rgba(0,0,0,0.15)',
                ].join(', '),
                borderRadius: '4px',
              }}
            >
              <Plaque title={shelf.title} width={layout.totalWidth} saga={shelf.saga} />
              <div className="flex flex-col">
                <div
                  className="flex items-end rounded-t"
                  style={{
                    gap: spacing,
                    padding: `${Math.round(h * 0.24)}px ${layout.sidePadding}px 0`,
                    minHeight: h + Math.round(h * 0.2),
                    background: [
                      // Floor shadow (where back wall meets the shelf surface)
                      'radial-gradient(ellipse 80% 25% at 50% 90%, rgba(0,0,0,0.15) 0%, transparent 100%)',
                      // Side wall shadows
                      'linear-gradient(90deg, rgba(0,0,0,0.18) 0%, transparent 6%, transparent 94%, rgba(0,0,0,0.18) 100%)',
                      // Top shelf shadow
                      `linear-gradient(180deg, rgba(0,0,0,0.28) 0%, transparent ${Math.round(h * 0.1)}%, transparent 100%)`,
                      // Recessed back wall base
                      'linear-gradient(180deg, #1a0e08 0%, #0f0804 45%, #080402 100%)',
                    ].join(', '),
                    boxShadow: [
                      `inset 0 0 ${Math.round(availableWidth * 0.06)}px rgba(0,0,0,0.5)`,
                      'inset 0 1px 0 rgba(255,255,255,0.015)',
                    ].join(', '),
                    borderRadius: `${Math.round(plankHeight * 0.3)}px ${Math.round(plankHeight * 0.3)}px 0 0`,
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
                <ShelfPlank height={plankHeight} />
              </div>
            </div>
          )
        })}
      </div>

      {activeBook && spineRect && <BookCanvas book={activeBook} rect={spineRect} onClose={handleClose} />}
    </>
  )
}
