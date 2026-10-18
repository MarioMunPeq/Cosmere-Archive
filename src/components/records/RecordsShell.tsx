/**
 * RecordsShell — the two-column frame the Records screen sits in. M4 · block 1.
 *
 * §5.4.1's layout table:
 *
 *   M (<768)   index in a drawer, opened by a 44×44 button in the header;
 *              record fills the width minus 32px
 *   T (768+)   232px fixed index, 16px gutter
 *   D (1024+)  264px index, 20px gutter, record capped at 780px
 *   UW (1440+) 288px index, 24px gutter, record centred, capped at 860px
 *
 * The record is a `--surface-base` card, `--radius-lg`, `--shadow-1`, padded
 * `--space-xl`.
 *
 * Two constraints from §5.4.1 that are worth stating because they are easy to
 * undo by accident:
 *
 *   No `rotateY`, no 3D transforms, nothing that blurs. The old Records screen
 *   was an `ArchivalViewer` — a two-page book with a spine, a gutter shadow and
 *   a perspective projection — and the text inside it was being rasterised at
 *   whatever angle the projection produced. A record is a document, not a prop.
 *
 *   The page background is `--surface-void` (#07090F), not the brown radial
 *   gradient the old one used. The brown is still in the token set as a legacy
 *   value; this screen is where it was retired.
 */

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface Props {
  /** The A–Z index. Hidden behind a drawer below 768px. */
  index: ReactNode
  /** The selected record. */
  record: ReactNode
  /** Header above both columns. */
  header?: ReactNode
  /** Accessible name for the drawer. */
  drawerLabel?: string
}

export default function RecordsShell({ index, record, header, drawerLabel = 'Character index' }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  // A drawer that can be opened but not closed with Escape is a trap. Escape
  // closes it and returns focus to the button that opened it.
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setDrawerOpen(false)
        document.getElementById('records-index-toggle')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--surface-void)]">
      {header}

      <div className="relative flex min-h-0 flex-1 gap-md">
        {/* ---- the index column ---- */}
        <aside
          id="records-index"
          aria-label={drawerLabel}
          data-records-index
          className={[
            'min-h-0 w-[232px] shrink-0 border-r border-[var(--border-subtle)] bg-[var(--surface-base)]',
            'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-30 max-md:w-[288px] max-md:shadow-2xl',
            'max-md:transition-transform max-md:duration-[var(--dur-base)] max-md:ease-[var(--ease-standard)]',
            drawerOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
          ].join(' ')}
        >
          {index}
        </aside>

        {/* Scrim, only while the drawer is open, only on mobile.
            A <button>, not a div with onClick: criterion R.6 forbids the
            latter outright, and it is the right call anyway — a scrim that
            dismisses a drawer is a control, and a control should be in the tab
            order and reachable by name. */}
        {drawerOpen && (
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close the index"
            className="max-md:absolute max-md:inset-0 max-md:z-20 max-md:cursor-pointer max-md:bg-[rgb(4_5_8/0.6)]"
          />
        )}

        {/* ---- the record column ---- */}
        <main
          id="main-content"
          className="min-h-0 min-w-0 flex-1 overflow-y-auto px-md py-md min-[1024px]:px-xl min-[1024px]:py-xl"
        >
          <div className="mx-auto w-full max-w-[780px] min-[1440px]:max-w-[860px]">{record}</div>
        </main>
      </div>

      {/* The drawer button. Mobile only, because that is the only layout that
          hides the index. 44×44 per the table. */}
      <button
        id="records-index-toggle"
        type="button"
        onClick={() => setDrawerOpen((v) => !v)}
        aria-expanded={drawerOpen}
        aria-controls="records-index"
        className="fixed bottom-[calc(var(--bottom-nav-h)+var(--spacing-sm))] left-md z-40 grid size-11 cursor-pointer place-items-center rounded-[var(--radius-md)] border border-[var(--border-interactive)] bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-lg transition-colors hover:bg-[var(--surface-overlay)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] max-[767px]:inline-grid min-[768px]:hidden"
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
        </svg>
        <span className="sr-only">
          {drawerOpen ? 'Close' : 'Open'} the {drawerLabel.toLowerCase()}
        </span>
      </button>
    </div>
  )
}
