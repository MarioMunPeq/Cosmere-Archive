import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import type { Book } from '@/types'
import { BOOKS } from '@/data/static'
import { calcShelfLayout } from '@/utils/shelf-layout'
import BookSpine from './BookSpine'
import Plaque from './Plaque'
import OpenedBook from './OpenedBook'

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
  const woodBase =
    'linear-gradient(180deg, #4a3020 0%, #3d2817 2px, #2d1a0e 15%, #2a180d 50%, #1a0e08 85%, #100804 96%, #3a2518 100%)'
  const woodGrain =
    'repeating-linear-gradient(90deg, transparent 0px, transparent 6px, rgba(0,0,0,0.015) 6px, transparent 8px, transparent 16px, rgba(0,0,0,0.01) 16px, transparent 18px)'
  const woodKnots =
    'radial-gradient(ellipse 18px 7px at 15% 30%, rgba(0,0,0,0.05) 0%, transparent 100%), radial-gradient(ellipse 10px 3px at 65% 60%, rgba(0,0,0,0.03) 0%, transparent 100%), radial-gradient(ellipse 8px 3px at 40% 15%, rgba(60,40,25,0.04) 0%, transparent 100%)'
  const frontLip =
    'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 15%, rgba(0,0,0,0.03) 85%, rgba(0,0,0,0.08) 100%)'
  const lipShadow = `0 ${Math.max(1, Math.round(height * 0.08))}px ${Math.round(height * 0.3)}px rgba(0,0,0,0.5)`

  return (
    <div
      className="w-full shrink-0"
      style={{
        height,
        background: `${woodKnots}, ${woodGrain}, ${frontLip}, ${woodBase}`,
        boxShadow: `0 -${Math.max(1, Math.round(height * 0.08))}px 0 rgba(255,255,255,0.03), ${lipShadow}, inset 0 ${Math.round(height * 0.06)}px 0 rgba(255,255,255,0.04), inset 0 ${Math.round(-height * 0.04)}px ${Math.round(height * 0.2)}px rgba(0,0,0,0.3)`,
        borderRadius: `0 0 ${Math.round(height * 0.2)}px ${Math.round(height * 0.2)}px`,
      }}
    />
  )
}

export default function CosmereLibrary() {
  const [openedBookId, setOpenedBookId] = useState<string | null>(null)
  const [containerRefObj, containerWidth] = useContainerWidth()

  const handleOpen = useCallback((bookId: string) => {
    setOpenedBookId(bookId)
  }, [])

  const handleClose = useCallback(() => {
    setOpenedBookId(null)
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

  const plankHeight = Math.max(10, Math.round(availableWidth * 0.006))

  const openedBook = openedBookId
    ? (shelvesWithBooks.flatMap((s) => s.books).find((b) => b.id === openedBookId) ?? null)
    : null

  return (
    <>
      <div
        ref={containerRefObj}
        className="relative flex min-h-0 flex-1 flex-col gap-28 overflow-y-auto px-20 pb-16 pt-12"
      >
        {shelvesWithBooks.map((shelf, si) => {
          const layout = shelfLayouts[si]!
          const h = layout.books[0]!.height
          const spacing = Math.max(6, Math.round(layout.gap * 1.4))

          return (
            <div key={shelf.id} className="flex flex-col items-start">
              <Plaque title={shelf.title} width={layout.totalWidth} saga={shelf.saga} />
              <div className="flex flex-col">
                <div
                  className="flex items-end rounded-t"
                  style={{
                    gap: spacing,
                    padding: `${Math.round(h * 0.18)}px ${layout.sidePadding}px 0`,
                    minHeight: h + Math.round(h * 0.2),
                    background: 'linear-gradient(180deg, #2d1a0e 0%, #2a180d 20%, #1a0e08 60%, #0f0804 100%)',
                    boxShadow: `inset 0 0 ${Math.round(availableWidth * 0.06)}px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.025)`,
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

      {openedBook && <OpenedBook book={openedBook} onClose={handleClose} />}
    </>
  )
}
