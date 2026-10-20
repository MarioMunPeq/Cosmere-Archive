/**
 * CosmereLibrary — the archive hall. M3 · block 3.
 *
 * Replaces a 411-line component whose layout was driven by four hard-coded
 * constants that did not agree with each other. Everything here is measured.
 *
 * Structure:
 *
 *   LibraryPage        the shell, the header and the Shelves/List switch
 *   CosmereLibrary     the hall: room, shelves, dust, keyboard across shelves
 *   Shelf              one series, measured and fitted
 *   BookSpine          one volume
 *   ShelfPlank         the board
 *   Dust               the motes
 *   BookReader         the 2D opening (block 4)
 *   ListView           the table (block 5)
 *
 * Section 5.9's responsive table, applied: the bottom bar takes the navigation
 * below 768px, the shelves are one row on tablet and wrap to two on a phone,
 * and no spine text is ever below 11px.
 */

import { useCallback, useMemo, useRef, useState } from 'react'
import Shelf from './Shelf'
import type { ShelfApi } from './Shelf'
import Dust from './Dust'
import { woodTexture } from './wood'
import { SHELF_GROUPS, booksForGroup } from './shelf-groups'
import { spineMaterial } from '@/navigation'
import type { Book } from '@/types'

interface Props {
  onOpen: (book: Book) => void
}

export default function CosmereLibrary({ onOpen }: Props) {
  const [active, setActive] = useState<Book | null>(null)
  const shelfApis = useRef(new Map<number, ShelfApi>())

  const shelves = useMemo(
    () =>
      SHELF_GROUPS.map((group) => ({
        id: group.id,
        label: group.label,
        note: group.note,
        books: booksForGroup(group),
      })).filter((s) => s.books.length > 0),
    [],
  )

  const registerShelf = useCallback((index: number, api: ShelfApi | null) => {
    if (api) shelfApis.current.set(index, api)
    else shelfApis.current.delete(index)
  }, [])

  /** Up and down move between shelves, keeping the column. */
  const onShelfKey = useCallback((e: React.KeyboardEvent, shelfIndex: number, spineIndex: number) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    const next = shelfIndex + (e.key === 'ArrowDown' ? 1 : -1)
    const api = shelfApis.current.get(next)
    if (!api) return
    api.focusSpine(spineIndex)
    document
      .querySelector<HTMLElement>(`[data-shelf] [data-book-id]`)
      ?.closest('[data-shelf]')
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [])

  const activeMaterial = active ? spineMaterial(active.saga) : null

  return (
    <div
      className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
      style={{ background: 'radial-gradient(ellipse 130% 90% at 45% 8%, #0b0d12 0%, #06070a 70%)' }}
    >
      {/* The wall behind the cabinet. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgb(200 169 106 / .055) 0%, transparent 60%)',
        }}
      />
      <Dust count={24} />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pt-6 pb-24">
        {/*
          The cabinet. A warm inner glow at the top and a hard floor shadow are
          what make the shelves read as recessed into a room rather than
          floating on a page.
        */}
        <div
          className="relative rounded-t-[6px] px-1 pt-4 pb-2"
          style={{
            // The cabinet: procedural oak under a light that falls off toward the
            // floor, so the wood recedes and the books come forward.
            //
            // Stretched to fill rather than tiled: a 512px tile across a 1400px
            // cabinet repeats three times, and the vertical joins were visible as
            // seams in the screenshot. Grain lines run horizontally, so stretching
            // costs almost nothing.
            //
            // The last layer is the important one. Twenty-two books on three shelves
            // leaves roughly 900px of bare board beside the shorter runs, and any
            // surface at all fills that space with itself. Two vignettes — one down
            // the empty right side, one into the corners — put the empty board back
            // into shadow, so it reads as the unlit end of a cabinet rather than as
            // a wall of brown.
            backgroundImage: [
              'linear-gradient(90deg, transparent 42%, rgb(4 5 8 / .55) 100%)',
              'radial-gradient(120% 100% at 50% 0%, transparent 40%, rgb(3 4 6 / .5) 100%)',
              woodTexture(),
              'linear-gradient(180deg, rgb(255 235 205 / .05) 0%, rgb(10 8 5 / .42) 26%, rgb(4 3 2 / .78) 100%)',
            ].join(','),
            backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
            boxShadow: 'inset 0 1px 0 rgb(255 225 180 / .08), 0 -2px 0 rgb(0 0 0 / .5)',
          }}
        >
          {shelves.map((shelf, i) => (
            <div
              key={shelf.id}
              // 48px between shelves (M3.6). The spacing tokens live in the
              // `@theme` `spacing-*` namespace, so the utility is `mb-2xl`.
              // `mb-[var(--space-2xl)]` was silently invalid — that variable
              // does not exist — which made the gap 0 and every shelf touch.
              className="mb-2xl"
              onKeyDown={(e) => {
                const target = e.target as HTMLElement
                const bookEl = target.closest<HTMLElement>('[data-book-id]')
                if (!bookEl) return
                const spineIndex = Number(
                  Array.from(bookEl.parentElement?.children ?? []).indexOf(bookEl.parentElement!),
                )
                onShelfKey(e, i, Math.max(0, spineIndex))
              }}
            >
              <Shelf
                id={shelf.id}
                label={shelf.label}
                note={shelf.note}
                books={shelf.books}
                baseHeight={380}
                shadowed={i > 0}
                shelfIndex={i}
                onOpen={onOpen}
                onActiveChange={setActive}
                registerShelf={registerShelf}
              />
            </div>
          ))}

          {/* Floor shadow under the last shelf. */}
          <div
            aria-hidden
            className="h-16 w-full"
            style={{ background: 'linear-gradient(0deg, rgb(0 0 0 / .5), transparent)' }}
          />
        </div>
      </div>

      {/*
        A quiet status line for the pointed-at book. It is aria-live because
        hover-and-focus both change it and a keyboard user needs to hear what
        they just landed on.
      */}
      <p
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-[calc(var(--bottom-nav-h)+var(--spacing-sm))] left-1/2 z-20 -translate-x-1/2 px-4 py-1.5 font-[var(--font-display)] text-[12px] opacity-0 transition-opacity duration-[var(--dur-fast)] max-md:bottom-[var(--spacing-sm)]"
        style={{
          left: '50%',
          opacity: active ? 1 : 0,
          color: activeMaterial?.foil ?? '#d8b878',
          background: 'linear-gradient(180deg, #2a1a0e 0%, #1a0e06 100%)',
          border: '1px solid #5a3e1e',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        {active
          ? `${active.title} · ${active.year ?? '—'} · ${active.wordCount?.toLocaleString('es') ?? '—'} palabras`
          : ''}
      </p>
    </div>
  )
}
