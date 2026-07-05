import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Book } from '@/types'
import { BOOKS } from '@/data/static'
import { calcShelfLayout } from '@/utils/shelf-layout'
import BookSpine from './BookSpine'
import Plaque from './Plaque'

interface ShelfDef {
  id: string
  title: string
  decoration?: string
  bookIds: string[]
}

const SHELVES: ShelfDef[] = [
  {
    id: 'stormlight',
    title: 'THE STORMLIGHT ARCHIVE',
    bookIds: ['the_way_of_kings', 'words_of_radiance', 'oathbringer', 'dawnshard', 'rhythm_of_war', 'wind_and_truth'],
  },
  {
    id: 'mistborn',
    title: 'MISTBORN',
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

// ─── ResizeObserver hook ──
function useContainerWidth(): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(1200)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

// ─── Decoration slot ──
function DecorationSlot(_props: Record<string, unknown>) {
  return null
}

// ─── Shelf Plank ──
function ShelfPlank({ height }: { height: number }) {
  return (
    <div
      className="w-full shrink-0"
      style={{
        height,
        background:
          'linear-gradient(180deg, #4a3020 0%, #3d2817 2px, #2d1a0e 15%, #2a180d 50%, #1a0e08 85%, #100804 98%, #4a3020 100%)',
        boxShadow: `0 -${Math.max(1, Math.round(height * 0.1))}px 0 rgba(255,255,255,0.06), 0 ${Math.round(height * 0.6)}px ${Math.round(height * 2)}px rgba(0,0,0,0.7), inset 0 ${Math.round(height * 0.1)}px 0 rgba(255,255,255,0.1), inset 0 ${Math.round(height * 0.1)}px ${Math.round(height * 0.4)}px rgba(0,0,0,0.3)`,
        borderRadius: `0 0 ${Math.round(height * 0.2)}px ${Math.round(height * 0.2)}px`,
      }}
    />
  )
}

// ─── CosmereLibrary ──
export default function CosmereLibrary() {
  const navigate = useNavigate()
  const [containerRef, containerWidth] = useContainerWidth()
  const [exitingId, setExitingId] = useState<string | null>(null)
  const exitingRef = useRef(exitingId)
  useEffect(() => {
    exitingRef.current = exitingId
  }, [exitingId])

  const handleSelect = useCallback(
    (bookId: string) => {
      if (exitingRef.current) return
      setExitingId(bookId)
      setTimeout(() => navigate(`/books/${bookId}`), 350)
    },
    [navigate],
  )

  const shelvesWithBooks = useMemo(() => {
    return SHELVES.map((shelf) => ({
      ...shelf,
      books: shelf.bookIds.map((id) => BOOKS.find((b) => b.id === id)).filter((b): b is Book => !!b),
    }))
  }, [])

  // Available width for shelf content (container minus outer padding)
  const outerPad = 80
  const availableWidth = Math.max(400, containerWidth - outerPad)

  // Calculate layout for each shelf
  const shelfLayouts = useMemo(() => {
    return shelvesWithBooks.map((shelf) => {
      const wordCounts = shelf.books.map((b) => b.wordCount ?? 50000)
      return calcShelfLayout(wordCounts, availableWidth)
    })
  }, [shelvesWithBooks, availableWidth])

  const plankHeight = Math.max(6, Math.round(availableWidth * 0.005))

  return (
    <div ref={containerRef} className="flex flex-col gap-16 overflow-y-auto px-10 py-8">
      {shelvesWithBooks.map((shelf, si) => {
        const layout = shelfLayouts[si]!
        const h = layout.books[0]!.height
        return (
          <div
            key={shelf.id}
            className="flex flex-col items-start"
            style={{ animation: `fade-in-up 0.6s ease-out ${0.1 + si * 0.2}s both` }}
          >
            <Plaque title={shelf.title} width={layout.totalWidth} />
            <div className="flex flex-col">
              <div
                className="flex items-end rounded-t"
                style={{
                  gap: layout.gap,
                  padding: `${Math.round(h * 0.1)}px ${layout.sidePadding}px 0`,
                  minHeight: h + Math.round(h * 0.12),
                  background: 'linear-gradient(180deg, #1a0e08 0%, #2d1a0e 30%, #1a0e08 60%, #0f0804 100%)',
                  boxShadow: `inset 0 0 ${Math.round(availableWidth * 0.06)}px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)`,
                  borderRadius: `${Math.round(plankHeight * 0.3)}px ${Math.round(plankHeight * 0.3)}px 0 0`,
                }}
              >
                {shelf.books.map((book, bi) => {
                  const bl = layout.books[bi]!
                  return (
                    <BookSpine
                      key={book.id}
                      book={book}
                      isExiting={exitingId === book.id}
                      onSelect={handleSelect}
                      width={bl.width}
                      height={bl.height}
                      fontSize={bl.fontSize}
                      charWidth={bl.charWidth}
                      staggerDelay={0.1 + bi * 0.04}
                    />
                  )
                })}
                {shelf.decoration && <DecorationSlot _filename={shelf.decoration} />}
              </div>
              <ShelfPlank height={plankHeight} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
