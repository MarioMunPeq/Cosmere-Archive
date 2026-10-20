/**
 * The Diagram of Taravangian — §5.6, under D-DIEG.
 *
 * ## Why this has its own route
 *
 * It did not have one. The nav entry called "Taravangian Diagram" pointed at
 * `/stats`, and the mural was one section of a statistics page — which makes
 * §5.6's own criteria impossible: a fixed 360px column has nothing to fix
 * itself against in a scrolling list of ten sections, and a panel at 88vh is
 * not 88vh of anything.
 *
 * The plan's objective for this screen is *"que el mural deje de ser decorativo
 * y pase a ser el índice del archivo"*. An index is a destination.
 *
 * ## What moved out of `/stats`
 *
 * Only the mural. `/stats` keeps its counts, its distributions and its
 * bookshelf — it stops being the place the Diagram happens to live. The tallies
 * on the wall draw from the same generated data it does, which is why they can
 * move without either page inventing a number.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { DiagramScene } from '@/components/diagram/DiagramScene'
import ReadingPanel from '@/components/diagram/ReadingPanel'
import { noteFor, type DiagramNote } from '@/data/static/diagram-notes'

export default function TaravangianPage() {
  useSEOMeta({
    title: 'The Diagram — Cosmere Archive',
    description:
      'The shapes the Thirteenth Shard left behind: nine sheets of speculation, tally and correction, pinned to a wall.',
  })

  const [activeId, setActiveId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const active: DiagramNote | null = useMemo(() => (activeId ? noteFor(activeId) : null), [activeId])
  const hovered: DiagramNote | null = useMemo(() => (hoveredId ? noteFor(hoveredId) : null), [hoveredId])

  const onPick = useCallback((id: string) => setActiveId((current) => (current === id ? null : id)), [])
  const onClose = useCallback(() => setActiveId(null), [])

  /*
   * `Esc` backs out of a sheet.
   *
   * On the window rather than on the page element, because the page element is
   * not focusable: a `keydown` handler on a `div` without `tabindex` only ever
   * sees a key that something *inside* it bubbled up from, and once a reader has
   * clicked a sheet the focus is in the canvas's own drag handling. The window
   * is the only listener that is always told.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      data-taravangian
      // Column on a phone — the panel is a sheet *below* the wall. Row from
      // `md`, where the panel becomes a bound column on the right.
      //
      // `relative z-10` on the panel matters as much as the direction: the
      // mural paints a 5000x5000 sheet of absolutely positioned paper, and
      // without a stacking context above it, every click on the index landed on
      // the wall instead.
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--surface-base)] md:flex-row"
    >
      <main className="relative min-h-0 flex-1">
        {/*
         * The page's own name, for anyone who is not looking at the wall.
         *
         * Hidden, not painted on the plaster. A title written across the wall
         * would say "this is a website about Taravangian", which is the one
         * thing the wall must not say. A screen reader, though, arrives with no
         * wall: it gets a document, and a document with nine sheet headings and
         * no title is a document with no name.
         */}
        <h1
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            margin: -1,
            padding: 0,
            overflow: 'hidden',
            clipPath: 'inset(50%)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          The Diagram of Taravangian
        </h1>
        <DiagramScene activeDoc={activeId} onSelect={onPick} onHover={setHoveredId} />
      </main>

      <ReadingPanel active={active} hovered={hovered} onPick={onPick} onHover={setHoveredId} onClose={onClose} />
    </div>
  )
}
