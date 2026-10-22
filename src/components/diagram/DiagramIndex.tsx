/**
 * The contents, as a strip of paper pinned at the wall's edge.
 *
 * It replaces a full-height 460px sheet that covered the right third of the
 * wall and hid three pinned papers behind it. This is a *sibling* of the mural,
 * not an overlay: when it opens, the wall gets narrower and reframes, and when
 * it closes, the wall gets wider. Nothing is ever hidden under it.
 *
 *   desktop  a narrow column at the left, 212px open / 60px closed
 *   phone    a strip at the bottom, 44vh open / 48px closed
 *
 * The open state starts open on a desktop and closed on a phone, because a
 * 44vh sheet over a 667px screen is a page, not an index. It collapses without
 * an animation on purpose: animating height is a layout animation, and this
 * block only animates transform and opacity.
 */
import { useEffect, useState } from 'react'
import type { DiagramNote } from '@/data/static/diagram-notes'

interface Props {
  entries: DiagramNote[]
  onPick: (id: string) => void
}

export function DiagramIndex({ entries, onPick }: Props) {
  const [open, setOpen] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 768px)').matches,
  )
  const [desktop, setDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 768px)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    // Crossing the breakpoint re-decides the strip: a phone gets it folded,
    // because 44vh of index over a 667px screen is a page, not an index. A
    // desktop gets it open, because there is room for it beside the wall.
    const sync = () => {
      setDesktop(mq.matches)
      setOpen(mq.matches)
    }
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    <aside
      data-diagram-panel
      data-diagram-index
      aria-label="Index of the nine sheets"
      className={[
        'relative z-10 flex shrink-0 flex-col overflow-hidden border-[var(--codex-thread)]',
        'order-2 border-t md:order-first md:h-full md:border-r md:border-t-0',
        open ? 'h-[44vh] md:h-full md:w-[212px]' : 'h-12 md:h-full md:w-[60px]',
      ].join(' ')}
      style={{
        background: 'linear-gradient(100deg, var(--codex-desk) 0%, #24170e 46%, #1a1008 100%)',
        transition: 'none',
      }}
    >
      {/* The paper. */}
      <div
        id="diagram-index-paper"
        className={['relative m-1.5 flex min-h-0 flex-col', open ? 'flex-1' : 'h-9'].join(' ')}
        style={{
          background:
            'linear-gradient(152deg, var(--surface-page) 0%, var(--codex-page-block) 58%, var(--surface-page-inset) 100%)',
          clipPath: 'polygon(0% 1%, 100% 0%, 99% 100%, 1% 99%)',
          boxShadow: '3px 6px 12px rgb(4 2 1 / 0.5), 1px 2px 3px rgb(4 2 1 / 0.35)',
          color: 'var(--text-on-page-primary)',
        }}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-[-4px] block h-2.5 w-2.5 -translate-x-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 34% 30%, var(--codex-brass-highlight) 0%, var(--codex-brass) 52%, var(--codex-thread) 100%)',
            boxShadow: '0 2px 3px rgb(4 2 1 / 0.65)',
          }}
        />

        {open ? (
          <>
            <header className="shrink-0 px-3 pb-2 pt-3">
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  lineHeight: 1.05,
                  letterSpacing: '0.01em',
                }}
              >
                The Diagram
              </h2>
              <p
                className="mt-1"
                style={{
                  fontFamily: 'var(--font-hand)',
                  fontSize: 15,
                  lineHeight: 1.1,
                  color: 'var(--text-on-page-tertiary)',
                }}
              >
                nine sheets · three tallies
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-expanded={true}
                aria-controls="diagram-index-paper"
                data-diagram-index-toggle
                className="mt-1.5 cursor-pointer"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 12,
                  color: 'var(--text-on-page-tertiary)',
                  textDecoration: 'underline',
                  textDecorationColor: 'var(--surface-page-edge)',
                  textUnderlineOffset: 3,
                }}
              >
                fold it away
              </button>
              <span aria-hidden className="mt-2 block h-px w-full" style={{ background: 'rgb(36 26 18 / 0.26)' }} />
            </header>

            <nav aria-label="Sheets" className="manuscript-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-3">
              <ol>
                {entries.map((note) => (
                  <li key={note.id}>
                    <button
                      type="button"
                      data-diagram-index-entry={note.id}
                      onClick={() => onPick(note.id)}
                      className="group flex w-full cursor-pointer items-baseline gap-2 py-1 text-left focus-visible:outline-none focus-visible:[outline:2px_solid_var(--text-on-page-link)] focus-visible:[outline-offset:1px]"
                    >
                      <span
                        aria-hidden
                        className="w-5 shrink-0"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          color: 'var(--text-on-page-tertiary)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {note.numeral}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className="block group-hover:underline"
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 14,
                            lineHeight: 1.2,
                            color: 'var(--text-on-page-primary)',
                            textUnderlineOffset: 3,
                          }}
                        >
                          {note.title}
                        </span>
                        {note.tally ? (
                          <span
                            className="mt-0.5 block"
                            style={{
                              fontFamily: 'var(--font-hand)',
                              fontSize: 15,
                              lineHeight: 1,
                              color: '#8c2b1f',
                            }}
                          >
                            tally
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={false}
            aria-controls="diagram-index-paper"
            data-diagram-index-toggle
            aria-label="Contents IX — open the index of the nine sheets"
            className="flex h-full w-full cursor-pointer items-center justify-center gap-2 focus-visible:outline-none focus-visible:[outline:2px_solid_var(--text-on-page-link)] focus-visible:[outline-offset:-3px]"
            style={{
              fontFamily: 'var(--font-hand)',
              fontSize: 17,
              lineHeight: 1,
              color: 'var(--text-on-page-secondary)',
              writingMode: desktop ? 'vertical-rl' : 'horizontal-tb',
            }}
          >
            contents
            <span
              aria-hidden
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--text-on-page-tertiary)',
                writingMode: 'horizontal-tb',
              }}
            >
              IX
            </span>
          </button>
        )}
      </div>
    </aside>
  )
}
