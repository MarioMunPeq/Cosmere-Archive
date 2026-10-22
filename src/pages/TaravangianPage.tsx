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
 * ## The room, the index, and the sheet
 *
 * Three objects, none of them a web panel:
 *
 *   the wall    `DiagramScene` — nine pinned sheets, clippings, chalk, string.
 *   the index   `DiagramIndex` — a paper strip at the wall's edge. A sibling,
 *               not an overlay, so it can never cover a pinned sheet.
 *   the sheet   `SheetReader` — a leaf lifted from its pin onto the desk, with
 *               the full text, the ledger, and the way back.
 *
 * The page owns only the choice: which sheet, where it hung, and what had focus
 * when it was taken down. Everything physical belongs to the components.
 */

import { useCallback, useRef, useState } from 'react'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { DiagramScene } from '@/components/diagram/DiagramScene'
import { DiagramIndex } from '@/components/diagram/DiagramIndex'
import { SheetReader } from '@/components/diagram/SheetReader'
import { DIAGRAM_NOTES, noteFor } from '@/data/static/diagram-notes'
import '@/components/diagram/diagram.css'

export default function TaravangianPage() {
  useSEOMeta({
    title: 'The Diagram — Cosmere Archive',
    description:
      'The shapes the Thirteenth Shard left behind: nine sheets of speculation, tally and correction, pinned to a wall.',
  })

  const [activeId, setActiveId] = useState<string | null>(null)
  const [origin, setOrigin] = useState<DOMRect | null>(null)
  const trigger = useRef<HTMLElement | null>(null)

  /*
   * Take a sheet down.
   *
   * The element matters twice: its rectangle is where the paper lifts from, and
   * the element itself is where focus goes back when the sheet returns. When a
   * sheet is chosen from the index instead of the wall, the wall's own button is
   * still in the document — find it, so the lift comes from the pin the reader
   * would have used.
   */
  const openSheet = useCallback((id: string, element?: HTMLElement) => {
    const sheet = element ?? document.querySelector<HTMLElement>(`[data-diagram-sheet="${id}"]`)
    const from = element ?? (document.activeElement instanceof HTMLElement ? document.activeElement : sheet)
    setOrigin(sheet?.getBoundingClientRect() ?? null)
    trigger.current = from ?? null
    setActiveId(id)
  }, [])

  const close = useCallback(() => {
    const back = trigger.current
    setActiveId(null)
    // After the reader unmounts and the trap releases focus.
    requestAnimationFrame(() => back?.focus({ preventScroll: true }))
  }, [])

  const move = useCallback((step: -1 | 1) => {
    setActiveId((current) => {
      if (!current) return current
      const index = DIAGRAM_NOTES.findIndex((note) => note.id === current)
      const next = DIAGRAM_NOTES[(index + step + DIAGRAM_NOTES.length) % DIAGRAM_NOTES.length]
      return next?.id ?? current
    })
  }, [])

  const note = activeId ? noteFor(activeId) : null

  return (
    <div
      data-taravangian
      // Column on a phone — the index is a strip *below* the wall. Row from
      // `md`, where it becomes a narrow column at the left.
      //
      // The index sits before the mural in the DOM so that, on a phone, the
      // strip is announced after the wall's parallel heading but painted below
      // it. `order` handles the visual side; neither reading order puts the
      // index on top of a sheet.
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--codex-desk)] pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] md:flex-row md:pb-0"
    >
      <DiagramIndex entries={DIAGRAM_NOTES} onPick={(id) => openSheet(id)} />

      <main className="relative min-h-0 min-w-0 flex-1">
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
        <DiagramScene onSelect={openSheet} />
      </main>

      {note ? (
        <SheetReader note={note} origin={origin} onClose={close} onPrev={() => move(-1)} onNext={() => move(1)} />
      ) : null}
    </div>
  )
}
