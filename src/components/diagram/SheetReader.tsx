/**
 * A sheet, lifted off the wall and laid on the desk.
 *
 * ## Not a modal with paper on it
 *
 * The reader is one loose leaf: no spine, no binding, no chapters. It comes up
 * from the pin it was hanging on, straightens, and the rest of the room goes
 * dark behind it. The paper is the codex's own `PageSurface`, so it is the same
 * stock as the volumes next door — the same grain, the same deckle, the same
 * foxing. The gutter shade is hidden because a single leaf has no gutter.
 *
 * ## The lift
 *
 * `origin` is the DOM rectangle of the sheet on the wall when it was clicked.
 * On mount those coordinates are written to custom properties and a keyframe
 * carries the paper from there to the centre. Only `transform` and `opacity`
 * move. Closing runs the same path in reverse, and the parent unmounts the
 * reader when the short return has finished (or immediately, when the reader
 * has asked for reduced motion).
 *
 * ## Reading
 *
 * The full text lives here. The wall carries excerpts — a page nailed up is
 * read at a glance — and the reader carries the paragraphs, the source line,
 * and the cross-references. The tallies become the ledger they always wanted
 * to be: hand-ruled columns, mono numerals, ink strokes drawn one at a time.
 *
 * Keyboard: `Esc` puts the sheet back, `←` and `→` move to the sheet before and
 * after, `Tab` stays inside the paper. Arrow keys belong to the text when the
 * text column itself has focus, so a long sheet can still be scrolled.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import CodexObject from '@/components/codex/CodexObject'
import PageSurface from '@/components/codex/PageSurface'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import type { DiagramNote } from '@/data/static/diagram-notes'
import { Ledger } from './Ledger'
import { ledgerFor } from './tally-data'

interface Props {
  note: DiagramNote
  /** Where the sheet hung, so it can lift from — and return to — its pin. */
  origin: DOMRect | null
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

const RETURN_MS = 280

const INK = 'var(--text-on-page-primary)'
const SOFT = 'var(--text-on-page-secondary)'
const FAINT = 'var(--text-on-page-tertiary)'
const RED = '#8c2b1f'
const RULE = 'rgb(36 26 18 / 0.28)'

const serif = 'var(--font-display)'
const hand = 'var(--font-hand)'

export function SheetReader({ note, origin, onClose, onPrev, onNext }: Props) {
  const trapRef = useFocusTrap(true)
  const reduced = usePrefersReducedMotion()

  const paperRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const leavingRef = useRef(false)

  const [leaving, setLeaving] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  /*
   * Where the paper starts. Written straight to the node before the first
   * paint so the keyframe reads the values at the moment it begins; React state
   * here would land a frame too late and the leaf would jump.
   */
  useLayoutEffect(() => {
    const el = paperRef.current
    if (!el) return

    let dx = 0
    let dy = 48
    let scale = 0.82
    if (origin) {
      const rect = el.getBoundingClientRect()
      const onScreen =
        origin.right > 0 && origin.left < window.innerWidth && origin.bottom > 0 && origin.top < window.innerHeight
      if (onScreen && rect.width > 0) {
        dx = origin.left + origin.width / 2 - (rect.left + rect.width / 2)
        dy = origin.top + origin.height / 2 - (rect.top + rect.height / 2)
        scale = Math.max(0.35, Math.min(1, origin.width / rect.width))
      }
    }
    el.style.setProperty('--reader-dx', `${dx.toFixed(1)}px`)
    el.style.setProperty('--reader-dy', `${dy.toFixed(1)}px`)
    el.style.setProperty('--reader-scale', scale.toFixed(3))
  }, [origin])

  /*
   * The heading takes focus on arrival, not the first button. A reader who
   * entered with a keyboard hears the name of the sheet and then chooses
   * whether to read, move on, or put it back.
   */
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  /* A new sheet starts at its top, not halfway down the last one. */
  useEffect(() => {
    const body = paperRef.current?.querySelector<HTMLElement>('.codex-page__body')
    body?.scrollTo({ top: 0 })
  }, [note.id])

  const leave = useCallback(() => {
    if (leavingRef.current) return
    leavingRef.current = true
    setLeaving(true)
    if (reduced) {
      onClose()
      return
    }
    timer.current = window.setTimeout(onClose, RETURN_MS)
  }, [onClose, reduced])

  useEffect(() => {
    return () => {
      if (timer.current !== undefined) window.clearTimeout(timer.current)
    }
  }, [])

  const go = useCallback(
    (dir: 'prev' | 'next') => {
      setDirection(dir)
      if (dir === 'prev') onPrev()
      else onNext()
    },
    [onNext, onPrev],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return
      if (e.key === 'Escape') {
        e.preventDefault()
        leave()
        return
      }
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return

      // Inside the paper, the arrows scroll. A long sheet is a document first.
      const target = e.target as HTMLElement | null
      const body = target?.closest<HTMLElement>('.codex-page__body')
      if (body && body.scrollHeight > body.clientHeight + 2) return

      e.preventDefault()
      go(e.key === 'ArrowLeft' ? 'prev' : 'next')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, leave])

  const ledger = note.tally ? ledgerFor(note.id) : null

  return (
    <div
      ref={trapRef}
      className="diagram-reader"
      data-diagram-reader
      data-diagram-reader-id={note.id}
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagram-reader-title"
    >
      <div className="absolute inset-0 flex">
        <CodexObject>
          {/* The desk, not the paper. Clicking it is the same as putting it back. */}
          <div
            aria-hidden
            className="absolute inset-0 z-[2] cursor-pointer"
            onClick={leave}
            data-diagram-reader-backdrop
          />

          <div
            className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-3 px-3 py-4 md:px-8"
            onClick={(e) => {
              if (e.target === e.currentTarget) leave()
            }}
          >
            <div
              ref={paperRef}
              className="diagram-reader__paper relative w-full max-w-[760px] outline-none"
              data-diagram-reader-sheet
              data-leaving={leaving ? 'true' : 'false'}
              onClick={(e) => e.stopPropagation()}
            >
              <PageSurface side="right" header={`The Diagram · sheet ${note.numeral}`} folio={note.numeral}>
                <article
                  key={note.id}
                  ref={contentRef}
                  className="diagram-reader__leaf mx-auto w-full max-w-[62ch] pb-4"
                  data-direction={direction}
                >
                  <p className="flex items-baseline gap-2">
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        letterSpacing: '0.12em',
                        color: FAINT,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {note.numeral}
                    </span>
                    {note.tally ? (
                      <span
                        style={{
                          fontFamily: hand,
                          fontSize: 16,
                          lineHeight: 1,
                          color: RED,
                        }}
                      >
                        a tally
                      </span>
                    ) : null}
                  </p>

                  <h2
                    id="diagram-reader-title"
                    data-diagram-sheet-title
                    ref={titleRef}
                    tabIndex={-1}
                    className="mt-1 outline-none"
                    style={{
                      fontFamily: serif,
                      fontSize: 'clamp(28px, 3.4vw, 38px)',
                      lineHeight: 1.08,
                      letterSpacing: '-0.012em',
                      color: INK,
                    }}
                  >
                    {note.title}
                  </h2>

                  {note.caption ? (
                    <p
                      className="mt-2 max-w-[52ch] italic"
                      style={{ fontFamily: serif, fontSize: 18, lineHeight: 1.45, color: SOFT }}
                    >
                      {note.caption}
                    </p>
                  ) : null}

                  <span aria-hidden className="mt-4 mb-4 block h-px w-full" style={{ background: RULE }} />

                  {ledger ? (
                    <TallySheet note={note} ledger={ledger} />
                  ) : (
                    <div className="diagram-reader__prose">{PROSE[note.id] ?? null}</div>
                  )}

                  {note.links.length > 0 ? (
                    <nav aria-label="What this sheet refers to" className="mt-6 max-w-[52ch]">
                      <h3
                        style={{
                          fontFamily: serif,
                          fontSize: 12,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: FAINT,
                        }}
                      >
                        Refers to
                      </h3>
                      <ul className="mt-2">
                        {note.links.map((link) => (
                          <li key={link.to} className="mt-1">
                            <Link
                              to={link.to}
                              className="inline-flex items-baseline gap-2 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:[outline:2px_solid_var(--text-on-page-link)] focus-visible:[outline-offset:2px]"
                              style={{
                                fontFamily: serif,
                                fontSize: 16,
                                lineHeight: 1.4,
                                color: 'var(--text-on-page-link)',
                              }}
                            >
                              <span aria-hidden style={{ color: FAINT }}>
                                →
                              </span>
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  ) : null}
                </article>
              </PageSurface>

              {/* A sheet of clean paper laid over the ink, drawn back. */}
              <span aria-hidden className="diagram-reader__ink" />
            </div>

            <div
              className="diagram-reader__controls flex w-full max-w-[760px] flex-wrap items-center justify-between gap-x-3 gap-y-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" onClick={() => go('prev')} className="diagram-reader__control" data-diagram-prev>
                <span aria-hidden>←</span>
                <span>the sheet before</span>
              </button>

              <button
                type="button"
                onClick={leave}
                className="diagram-reader__control diagram-reader__control--close"
                data-diagram-close
              >
                put it back
              </button>

              <button type="button" onClick={() => go('next')} className="diagram-reader__control" data-diagram-next>
                <span>the sheet after</span>
                <span aria-hidden>→</span>
              </button>
            </div>

            <p className="sr-only" aria-live="polite">
              Showing sheet {note.numeral}: {note.title}
            </p>
          </div>
        </CodexObject>
      </div>
    </div>
  )
}

function TallySheet({ note, ledger }: { note: DiagramNote; ledger: NonNullable<ReturnType<typeof ledgerFor>> }) {
  return (
    <div>
      <p className="max-w-[48ch]" style={{ fontFamily: hand, fontSize: 19, lineHeight: 1.25, color: RED }}>
        {TALLY_PREFACE[note.id] ?? null}
      </p>

      <p className="mt-4 flex items-baseline gap-3" style={{ whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: serif, fontSize: 'clamp(40px, 6vw, 56px)', lineHeight: 0.9, color: INK }}>
          {ledger.total.toLocaleString('es-ES')}
        </span>
        <span style={{ fontFamily: hand, fontSize: 22, color: SOFT }}>{ledger.totalLabel}</span>
      </p>

      <Ledger
        rows={ledger.rows}
        unit={ledger.unit}
        total={ledger.total}
        totalLabel={ledger.totalLabel}
        note={TALLY_NOTE[note.id]}
      />
    </div>
  )
}

const PROSE: Record<string, ReactNode> = {
  catalogue: (
    <>
      <Source>Catechism of the Back of the Flowered Painting · Paragraph 1</Source>
      <Paragraph>
        Q: For what essential must we strive? A: The essential of preservation, to shelter a seed of humanity through
        the coming storm. Q: What cost must we bear? A: The cost is irrelevant. Mankind must survive. Our burden is that
        of the species, and all other considerations are but dust by comparison.
      </Paragraph>
    </>
  ),
  chronology: (
    <>
      <Source>Tenets of Instruction · Paragraph 1 · back of the footboard</Source>
      <Paragraph>You must become king. Of Everything.</Paragraph>
      <Paragraph>
        Debatably refers either to Taravangian's goal of becoming king of Roshar, or to his possible ambition to
        supplant Rayse as the Shard of Odium — as suggested by the capitalization of “Everything”.
      </Paragraph>
    </>
  ),
  worlds: (
    <>
      <Source>Floorboard 17 · Paragraph 2 · every second letter</Source>
      <Paragraph>
        Ah, but they were left behind. It is obvious from the nature of the bond. But where, where, where, where? Set
        off. Obvious. Realization like apricity. They are with the Shin. We must find one. Can we make to use a
        Truthless? Can we craft a weapon?
      </Paragraph>
      <Paragraph>This refers to the Honorblades and Szeth, who will become the Assassin in White.</Paragraph>
    </>
  ),
  shards: (
    <>
      <Source>West Wall Psalm of Wonders · Paragraph 8</Source>
      <Paragraph>
        But who is the wanderer, the wild piece, the one who makes no sense? I glimpse at his implications, and the
        world opens to me. I shy back. Impossible. Is it?
      </Paragraph>
      <Paragraph>
        A note by Adrotagia accompanies this excerpt asking whether it refers to Mraize. However, the wanderer, the wild
        piece, and the one who makes no sense seems to imply this is talking about Hoid.
      </Paragraph>
    </>
  ),
  heralds: (
    <>
      <Source>Writings upon the Bedstand Lamp · Paragraph 4 · Adrotagia's third translation</Source>
      <Paragraph>
        Chaos in Alethkar is, of course, inevitable. Watch carefully, and do not let power in the kingdom solidify. The
        Blackthorn could become an ally or our greatest foe, depending on whether he takes the path of the warlord or
        not. If he seems likely to sue for peace, assassinate him expeditiously. The risk of competition is too great.
      </Paragraph>
    </>
  ),
  connections: (
    <>
      <Source>Book of the 2nd Desk Drawer · Paragraphs 14–15, 27</Source>
      <Paragraph>
        The Unmade are a deviation, a flair, a conundrum that may not be worth your time. You cannot help but think of
        them. They are fascinating. Many are mindless. Like the spren of human emotions, only much more nasty. I do
        believe a few can think, however.
      </Paragraph>
      <Paragraph>
        There is one you will watch. Though all of them have some relevance to precognition, Moelach is one of the most
        powerful in this regard. His touch seeps into a soul as it breaks apart from the body, creating manifestations
        powered by the spark of death itself. But no, this is a distraction. Deviation. Kingship. We must discuss the
        nature of kingship.
      </Paragraph>
      <Paragraph>One is almost certainly a traitor to the others.</Paragraph>
    </>
  ),
}

const TALLY_PREFACE: Record<string, string> = {
  volumes:
    'Counted spine by spine, from the shelf. Some of them twice. The ones I have held twice are the ones I do not trust.',
  wordcount: 'Counted. I know it serves no purpose.',
  population: 'Most of them in eleven worlds. The rest, in none that I know.',
}

const TALLY_NOTE: Record<string, string> = {
  volumes: 'the shelf is not the argument. it is only the evidence.',
  wordcount: 'four million, four hundred thousand. approximately. the approximation is the honest part.',
  population: 'ninety-three names. all of them dead. this is an archive of the dead, and i am the one who keeps it.',
}

function Source({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: hand,
        fontSize: 17,
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        color: FAINT,
      }}
    >
      {children}
    </p>
  )
}

function Paragraph({ children }: { children: ReactNode }) {
  return (
    <p
      className="mt-4"
      style={{
        fontFamily: serif,
        fontSize: 18,
        lineHeight: 1.62,
        color: SOFT,
        maxWidth: '62ch',
      }}
    >
      {children}
    </p>
  )
}

export default SheetReader
