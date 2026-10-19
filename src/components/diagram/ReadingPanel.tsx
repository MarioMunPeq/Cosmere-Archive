/**
 * The reading panel — §5.6.2's fixed right column.
 *
 * ## What it is
 *
 * A 360px column on desktop, a sheet at 88vh on a phone. It is **not** a sidebar
 * and it is **not** a card. It is the page of a very large book, bound at the
 * left edge, with the sheet's title at the top and the rest of the room for the
 * text — which is why D-DIEG puts the paper texture and the rule under the
 * title here rather than a heading and a divider.
 *
 * ## The index state
 *
 * With nothing selected the panel shows the index of the nine sheets: roman
 * numerals, ink rules, the tally sheets marked. That is what a bound book does
 * when you open it, and it means the panel is never empty and never says
 * "nothing selected" — which is the one thing a web panel always ends up
 * saying.
 *
 * ## Typography is the plan's, and the plan measured it
 *
 * §5.6.2 asks for `--text-body` at 16px with `max-width: 52ch` — 9.89:1 on
 * `#141A24`. The measure is the point: a line longer than about 70 characters
 * is a line the eye loses, and this is a page meant to be *read*.
 */

import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { DIAGRAM_NOTES, type DiagramNote } from '@/data/static/diagram-notes'

interface Props {
  /** The sheet being read, or `null` for the index. */
  active: DiagramNote | null
  /** The sheet under the pointer, previewed without changing the selection. */
  hovered: DiagramNote | null
  onPick: (id: string) => void
  onHover: (id: string | null) => void
  onClose: () => void
}

export default function ReadingPanel({ active, hovered, onPick, onHover, onClose }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)

  /*
   * A new sheet starts at the top of the panel.
   *
   * Without this, reading the ninth sheet after the eighth leaves the reader
   * halfway down a page they have not started — which is the kind of small
   * betrayal that makes a reading experience feel like an application.
   */
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [active?.id])

  const preview = hovered && hovered.id !== active?.id ? hovered : null

  return (
    <aside
      data-diagram-panel
      aria-label="Sheet"
      className={[
        // `relative z-10` puts the panel in its own stacking context above the
        // mural, which paints a 5000x5000 sheet of absolutely positioned paper.
        // Without it every click on the index landed on the wall instead.
        'relative z-10 flex flex-col border-[var(--border-subtle)] bg-[var(--surface-raised)]',
        // M: a sheet below the mural, almost full height. T/D/UW: a bound column.
        'max-h-[88vh] w-full shrink-0 border-t',
        'md:h-full md:max-h-none md:w-[360px] md:shrink-0 md:border-t-0 md:border-l',
      ].join(' ')}
    >
      {/* The binding: three lines where a spine would be. */}
      <div aria-hidden className="hidden shrink-0 border-r border-[var(--border-subtle)] md:block md:w-3" />

      {active ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <header className="shrink-0 px-lg pb-md pt-lg">
            <div className="flex items-baseline gap-sm">
              <span aria-hidden className="font-[var(--font-mono)] text-[var(--text-nano)] text-[var(--text-tertiary)]">
                {active.numeral}
              </span>
              {active.tally ? (
                <span className="text-[var(--text-nano)] uppercase tracking-[var(--ls-caps-wide)] text-[var(--text-tertiary)]">
                  Tally
                </span>
              ) : null}
            </div>

            <h1 className="mt-xs font-[var(--font-display)] text-[var(--text-h3)] leading-[1.15] text-[var(--text-primary)]">
              {active.title}
            </h1>

            {active.caption ? (
              <p className="mt-sm text-[var(--text-meta)] italic leading-[1.5] text-[var(--text-secondary)]">
                {active.caption}
              </p>
            ) : null}

            {/* The ink rule under a title, which is what a heading has. */}
            <div aria-hidden className="mt-md h-px w-full bg-[var(--border-subtle)]" />
          </header>

          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-lg pb-lg">
            {/*
              The prose itself.
              16px at 52ch: §5.6.2's numbers, measured at 9.89:1 on this
              surface. The ink is the same colour as every other body text on
              the site because the contrast budget covers the surface, not the
              intention.
            */}
            <div className="max-w-[52ch] text-[var(--text-body)] leading-[1.65] text-[var(--text-primary)]">
              <p>{placeholder}</p>
            </div>

            {active.links.length > 0 ? (
              <nav aria-label="What this sheet refers to" className="mt-xl max-w-[52ch]">
                <h2 className="text-[var(--text-nano)] uppercase tracking-[var(--ls-caps-wide)] text-[var(--text-tertiary)]">
                  What this sheet refers to
                </h2>
                <ul className="mt-sm space-y-1">
                  {active.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="inline-flex items-baseline gap-xs text-[var(--text-body-s)] text-[var(--text-link)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                      >
                        <span aria-hidden className="text-[var(--text-tertiary)]">
                          →
                        </span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>

          <footer className="shrink-0 border-t border-[var(--border-subtle)] px-lg py-md">
            <div className="flex items-center justify-between gap-md">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer text-[var(--text-body-s)] text-[var(--text-secondary)] underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-[var(--text-primary)] hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                Contents
              </button>
              <span className="text-[var(--text-nano)] text-[var(--text-tertiary)]">Esc</span>
            </div>
          </footer>
        </div>
      ) : (
        <Index entries={DIAGRAM_NOTES} onPick={onPick} onHover={onHover} />
      )}

      {preview ? (
        <p aria-live="polite" className="sr-only" data-diagram-preview>
          {preview.title}
        </p>
      ) : null}
    </aside>
  )
}

/**
 * The index of the nine sheets.
 *
 * Roman numerals and an ink rule, the way a bound book opens. The tally sheets
 * are marked because they *are* different: a reader who taps "Cuántos viven" and
 * gets the same kind of page as "De las Esquirlas" has been misled about what
 * the wall contains.
 */
function Index({
  entries,
  onPick,
  onHover,
}: {
  entries: DiagramNote[]
  onPick: (id: string) => void
  onHover: (id: string | null) => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 px-lg pb-md pt-lg">
        <h1 className="font-[var(--font-display)] text-[var(--text-h4)] font-semibold text-[var(--text-primary)]">
          The Diagram
        </h1>
        <p className="mt-sm text-[var(--text-meta)] leading-[1.5] text-[var(--text-secondary)]">
          Nine sheets. Choose one, or read them in order.
        </p>
        <div aria-hidden className="mt-md h-px w-full bg-[var(--border-subtle)]" />
      </header>

      <nav aria-label="Sheets" className="min-h-0 flex-1 overflow-y-auto px-lg pb-lg">
        <ol className="space-y-1">
          {entries.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => onPick(note.id)}
                onMouseEnter={() => onHover(note.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(note.id)}
                onBlur={() => onHover(null)}
                data-diagram-index-entry={note.id}
                className={[
                  'group w-full cursor-pointer rounded-[var(--radius-md)] px-sm py-sm text-left',
                  'transition-colors duration-[var(--dur-fast)]',
                  'hover:bg-[var(--surface-inset)]',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                ].join(' ')}
              >
                <span className="flex items-baseline gap-sm">
                  <span
                    aria-hidden
                    className="w-7 shrink-0 font-[var(--font-mono)] text-[var(--text-nano)] text-[var(--text-tertiary)]"
                  >
                    {note.numeral}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={[
                        'block text-[var(--text-body-s)]',
                        note.tally ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]',
                      ].join(' ')}
                    >
                      {note.title}
                    </span>
                    {note.tally ? (
                      <span className="mt-1 inline-block text-[var(--text-nano)] uppercase tracking-[var(--ls-caps-wide)] text-[var(--text-tertiary)]">
                        Tally
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}

/**
 * Placeholder body.
 *
 * Replaced in the next block by the 37 KB of prose that `DiagramWritings.tsx`
 * already holds — this component has to exist and render before that text has a
 * home here. It is here rather than absent so the panel is never a blank
 * rectangle during development.
 */
const placeholder =
  'The prose for this sheet lives in DiagramWritings.tsx and is bound to this panel in the next block.'
