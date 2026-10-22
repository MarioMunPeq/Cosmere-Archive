/**
 * CosmereLibrary — the wall of the reading room.
 *
 * The room is the Codex desk: walnut, a candle pool that follows the pointer,
 * dust and a vignette. Reusing it means the Library and the three archive
 * volumes are visibly in the same building, and it means the pointer light is
 * implemented once.
 *
 * The wall itself is three measured shelves. There is no side column and no
 * vertical series label: the name of a collection lives on a brass plate on the
 * front edge of its bottom board, where it can be read horizontally and never
 * truncated.
 */

import { useCallback, useMemo, useRef } from 'react'
import Shelf from './Shelf'
import type { ShelfApi } from './Shelf'
import { CodexObject } from '@/components/codex'
import { BOOKS } from '@/data/static'
import { SHELF_GROUPS, booksForGroup } from './shelf-groups'
import type { Book } from '@/data/static/books'
import './library.css'

interface Props {
  onOpen: (book: Book, source: DOMRect) => void
}

export default function CosmereLibrary({ onOpen }: Props) {
  const shelfApis = useRef(new Map<number, ShelfApi>())

  const shelves = useMemo(
    () =>
      SHELF_GROUPS.map((group) => ({
        id: group.id,
        label: group.label,
        note: group.note,
        books: booksForGroup(group),
      })).filter((shelf) => shelf.books.length > 0),
    [],
  )

  const registerShelf = useCallback((index: number, api: ShelfApi | null) => {
    if (api) shelfApis.current.set(index, api)
    else shelfApis.current.delete(index)
  }, [])

  const onShelfKey = useCallback((event: React.KeyboardEvent, shelfIndex: number, spineIndex: number) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    const next = shelfIndex + (event.key === 'ArrowDown' ? 1 : -1)
    const api = shelfApis.current.get(next)
    if (!api) return
    api.focusSpine(spineIndex)
  }, [])

  return (
    <CodexObject>
      <div className="library-page">
        <header className="library-sign">
          <div className="library-sign__plate">
            <h1 className="library-sign__title">The Library of Jasnah</h1>
          </div>
          <p className="library-sign__count">{BOOKS.length} volumes · three shelves · one candle</p>
          <p className="library-sign__author">by Brandon Sanderson</p>
        </header>

        <div className="library-hall" data-library-hall>
          <div className="library-wall">
            {shelves.map((shelf, index) => (
              <div
                key={shelf.id}
                onKeyDown={(event) => {
                  const target = event.target as HTMLElement
                  const bookEl = target.closest<HTMLElement>('[data-book-id]')
                  if (!bookEl) return
                  const row = bookEl.parentElement
                  const books = Array.from(row?.querySelectorAll('[data-book-id]') ?? [])
                  onShelfKey(event, index, Math.max(0, books.indexOf(bookEl)))
                }}
              >
                <Shelf
                  id={shelf.id}
                  label={shelf.label}
                  note={shelf.note}
                  books={shelf.books}
                  baseHeight={390}
                  shadowed={index > 0}
                  shelfIndex={index}
                  onOpen={onOpen}
                  registerShelf={registerShelf}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </CodexObject>
  )
}
