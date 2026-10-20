/**
 * The notebook — the diegetic reading surface for the Diagram.
 *
 * ## What this replaces
 *
 * `ReadingPanel.tsx`: a 360px column with `border-[var(--border-subtle)]` and
 * `bg-[var(--surface-raised)]` — a web panel with a paper texture painted on
 * top. The index and the prose lived in a sidebar because the wall had no
 * room for them, and the sidebar said so.
 *
 * ## What a notebook on a desk is
 *
 * An open ledger, bound at the centre, two pages visible. The left page is
 * always the index — roman numerals, ink rules, the tally sheets marked —
 * because that is what a book shows when you open it. The right page is the
 * sheet being read, or a blank page if none has been chosen. There is no
 * "nothing selected" state, because a blank page is a page, not a message.
 *
 * ## Content
 *
 * The prose is transcribed from the Diagram as recorded on the Coppermind,
 * which reproduces the epigraphs from *Words of Radiance* and *Oathbringer*.
 * These are Taravangian's own words from his day of greatest genius.
 */
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DIAGRAM_NOTES, type DiagramNote } from '@/data/static/diagram-notes'

interface Props {
  active: DiagramNote | null
  hovered: DiagramNote | null
  onPick: (id: string) => void
  onHover: (id: string | null) => void
  onClose: () => void
}

export default function Notebook({ active, hovered, onPick, onHover, onClose }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [showIndex, setShowIndex] = useState(true)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [active?.id])

  const preview = hovered && hovered.id !== active?.id ? hovered : null

  return (
    <aside
      data-diagram-panel
      aria-label="The Diagram, open on the desk"
      className="relative z-10 flex shrink-0 flex-col bg-[#3a2616] max-h-[88vh] w-full md:h-full md:max-h-none md:w-[720px]"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-12"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(40,24,12,0.55) 100%)',
        }}
      />

      <div className="relative m-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[3px] shadow-[0_18px_40px_rgba(0,0,0,0.55),0_4px_8px_rgba(0,0,0,0.4)]">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-6 -translate-x-1/2 md:block"
          style={{
            background:
              'linear-gradient(90deg, rgba(30,18,9,0.95) 0%, rgba(52,32,16,0.85) 35%, rgba(52,32,16,0.85) 65%, rgba(30,18,9,0.95) 100%)',
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.6)',
          }}
        >
          {Array.from({ length: 14 }, (_, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute block"
              style={{
                left: '50%',
                top: `${6 + i * 7}%`,
                width: 6,
                height: 1,
                marginLeft: -3,
                background: 'rgba(190,150,100,0.35)',
              }}
            />
          ))}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[rgba(60,40,20,0.35)] bg-[#e8dcc0] px-4 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setShowIndex(true)}
            className="font-[var(--font-display)] text-[13px] italic text-[#241a12]"
          >
            {showIndex ? 'Contents' : '← Contents'}
          </button>
          <span className="font-[var(--font-mono)] text-[10px] tracking-[0.15em] uppercase text-[#5a4028]">
            {active ? active.numeral : '—'}
          </span>
        </div>

        <div className="flex min-h-0 flex-1">
          <div
            className={['min-h-0 flex-1 overflow-y-auto', showIndex ? 'block' : 'hidden', 'md:block'].join(' ')}
            style={{
              background: 'linear-gradient(152deg, #f2e9d4 0%, #eae0c8 40%, #e0d4b6 76%, #d6c8a6 100%)',
            }}
          >
            <PageRule />
            <Index
              entries={DIAGRAM_NOTES}
              active={active}
              onPick={(id) => {
                onPick(id)
                setShowIndex(false)
              }}
              onHover={onHover}
            />
          </div>

          <div
            className={['min-h-0 flex-1 overflow-y-auto', showIndex ? 'hidden' : 'block', 'md:block'].join(' ')}
            style={{
              background: 'linear-gradient(152deg, #f2e9d4 0%, #eae0c8 40%, #e0d4b6 76%, #d6c8a6 100%)',
            }}
          >
            <PageRule />
            {active ? (
              <SheetPage
                note={active}
                onClose={() => {
                  onClose()
                  setShowIndex(true)
                }}
              />
            ) : (
              <BlankPage />
            )}
          </div>
        </div>
      </div>

      {preview ? (
        <p aria-live="polite" className="sr-only" data-diagram-preview>
          {preview.title}
        </p>
      ) : null}
    </aside>
  )
}

function PageRule() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 34 }, (_, i) => (
        <span
          key={i}
          className="absolute block"
          style={{
            left: 28,
            right: 18,
            top: 40 + i * 22,
            height: 1,
            background: 'rgba(58,86,120,0.14)',
          }}
        />
      ))}
      <span
        className="absolute block"
        style={{
          left: 24,
          top: 14,
          bottom: 12,
          width: 1,
          background: 'rgba(170,60,50,0.20)',
        }}
      />
    </div>
  )
}

function Index({
  entries,
  active,
  onPick,
  onHover,
}: {
  entries: DiagramNote[]
  active: DiagramNote | null
  onPick: (id: string) => void
  onHover: (id: string | null) => void
}) {
  return (
    <div className="relative px-6 py-5">
      <header className="mb-3">
        <h2 className="font-[var(--font-display)] text-[20px] leading-[1.15] text-[#241a12]">The Diagram</h2>
        <p className="mt-1 font-[var(--font-display)] text-[13px] italic text-[#5a4028]">
          Nine sheets. Choose one, or read them in order.
        </p>
      </header>
      <div aria-hidden className="mb-3 h-px w-full bg-[rgba(60,40,20,0.35)]" />
      <ol className="space-y-1">
        {entries.map((note) => {
          const isActive = active?.id === note.id
          return (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => onPick(note.id)}
                onMouseEnter={() => onHover(note.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(note.id)}
                onBlur={() => onHover(null)}
                data-diagram-index-entry={note.id}
                className="group w-full cursor-pointer px-1 py-1.5 text-left transition-colors"
                style={{
                  background: isActive ? 'rgba(60,40,20,0.08)' : 'transparent',
                }}
              >
                <span className="flex items-baseline gap-2">
                  <span className="w-6 shrink-0 font-[var(--font-mono)] text-[10px] text-[#5a4028]">
                    {note.numeral}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block text-[13px]"
                      style={{
                        fontFamily: 'var(--font-display)',
                        color: note.tally ? '#5a4028' : '#241a12',
                      }}
                    >
                      {note.title}
                    </span>
                    {note.tally ? (
                      <span className="mt-0.5 inline-block font-[var(--font-mono)] text-[9px] uppercase tracking-[0.15em] text-[#8a6840]">
                        Tally
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function SheetPage({ note, onClose }: { note: DiagramNote; onClose: () => void }) {
  return (
    <div className="relative px-6 py-5">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close sheet"
        className="absolute right-3 top-3 cursor-pointer font-[var(--font-mono)] text-[11px] text-[#8a6840] transition-colors hover:text-[#241a12]"
      >
        ×
      </button>
      <header className="mb-3 pr-6">
        <div className="flex items-baseline gap-2">
          <span className="font-[var(--font-mono)] text-[10px] text-[#5a4028]">{note.numeral}</span>
          {note.tally ? (
            <span className="font-[var(--font-mono)] text-[9px] uppercase tracking-[0.15em] text-[#8a6840]">Tally</span>
          ) : null}
        </div>
        <h2
          data-diagram-sheet-title
          className="mt-1 font-[var(--font-display)] text-[20px] leading-[1.15] text-[#241a12]"
        >
          {note.title}
        </h2>
        {note.caption ? (
          <p className="mt-2 font-[var(--font-display)] text-[13px] italic leading-[1.5] text-[#5a4028]">
            {note.caption}
          </p>
        ) : null}
      </header>
      <div aria-hidden className="mb-3 h-px w-full bg-[rgba(60,40,20,0.35)]" />
      <div className="max-w-[52ch]">
        <div className="font-[var(--font-display)] text-[13px] leading-[1.65] text-[#241a12]">
          {PROSE[note.id] ?? null}
        </div>
        {note.links.length > 0 ? (
          <nav aria-label="What this sheet refers to" className="mt-5 max-w-[52ch]">
            <h3 className="font-[var(--font-mono)] text-[9px] uppercase tracking-[0.15em] text-[#8a6840]">Refers to</h3>
            <ul className="mt-1.5 space-y-1">
              {note.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex items-baseline gap-1.5 text-[12px] text-[#1a3a5c] underline-offset-4 hover:underline"
                  >
                    <span aria-hidden className="text-[#8a6840]">
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
    </div>
  )
}

function BlankPage() {
  return (
    <div className="flex h-full items-center justify-center px-6 py-5">
      <p className="max-w-[30ch] text-center font-[var(--font-display)] text-[14px] italic leading-[1.6] text-[#8a6840]">
        Choose a sheet from the contents, or tap one on the wall.
      </p>
    </div>
  )
}

const PROSE: Record<string, React.ReactNode> = {
  catalogue: (
    <>
      <p className="font-[var(--font-mono)] text-[10px] text-[#8a6840]">
        Catechism of the Back of the Flowered Painting · Paragraph 1
      </p>
      <p className="mt-3">
        Q: For what essential must we strive? A: The essential of preservation, to shelter a seed of humanity through
        the coming storm. Q: What cost must we bear? A: The cost is irrelevant. Mankind must survive. Our burden is that
        of the species, and all other considerations are but dust by comparison.
      </p>
    </>
  ),
  chronology: (
    <>
      <p className="font-[var(--font-mono)] text-[10px] text-[#8a6840]">
        Tenets of Instruction · Paragraph 1 · Back of the Footboard
      </p>
      <p className="mt-3">You must become king. Of Everything.</p>
      <p className="mt-3">
        Debatably refers either to Taravangian's goal of becoming king of Roshar, or to his possible ambition to
        supplant Rayse as the Shard of Odium — as suggested by the capitalization of "Everything".
      </p>
    </>
  ),
  worlds: (
    <>
      <p className="font-[var(--font-mono)] text-[10px] text-[#8a6840]">
        Floorboard 17 · Paragraph 2 · every second letter
      </p>
      <p className="mt-3">
        Ah, but they were left behind. It is obvious from the nature of the bond. But where, where, where, where? Set
        off. Obvious. Realization like apricity. They are with the Shin. We must find one. Can we make to use a
        Truthless? Can we craft a weapon?
      </p>
      <p className="mt-3">This refers to the Honorblades and Szeth, who will become the Assassin in White.</p>
    </>
  ),
  shards: (
    <>
      <p className="font-[var(--font-mono)] text-[10px] text-[#8a6840]">West Wall Psalm of Wonders · Paragraph 8</p>
      <p className="mt-3">
        But who is the wanderer, the wild piece, the one who makes no sense? I glimpse at his implications, and the
        world opens to me. I shy back. Impossible. Is it?
      </p>
      <p className="mt-3">
        A note by Adrotagia accompanies this excerpt asking whether it refers to Mraize. However, the wanderer, the wild
        piece, and the one who makes no sense seems to imply this is talking about Hoid.
      </p>
    </>
  ),
  heralds: (
    <>
      <p className="font-[var(--font-mono)] text-[10px] text-[#8a6840]">
        Writings upon the Bedstand Lamp · Paragraph 4 · Adrotagia's third translation
      </p>
      <p className="mt-3">
        Chaos in Alethkar is, of course, inevitable. Watch carefully, and do not let power in the kingdom solidify. The
        Blackthorn could become an ally or our greatest foe, depending on whether he takes the path of the warlord or
        not. If he seems likely to sue for peace, assassinate him expeditiously. The risk of competition is too great.
      </p>
    </>
  ),
  connections: (
    <>
      <p className="font-[var(--font-mono)] text-[10px] text-[#8a6840]">
        Book of the 2nd Desk Drawer · Paragraphs 14–15, 27
      </p>
      <p className="mt-3">
        The Unmade are a deviation, a flair, a conundrum that may not be worth your time. You cannot help but think of
        them. They are fascinating. Many are mindless. Like the spren of human emotions, only much more nasty. I do
        believe a few can think, however.
      </p>
      <p className="mt-3">
        There is one you will watch. Though all of them have some relevance to precognition, Moelach is one of the most
        powerful in this regard. His touch seeps into a soul as it breaks apart from the body, creating manifestations
        powered by the spark of death itself. But no, this is a distraction. Deviation. Kingship. We must discuss the
        nature of kingship.
      </p>
      <p className="mt-3">One is almost certainly a traitor to the others.</p>
    </>
  ),
  volumes: (
    <>
      <p className="font-[var(--font-mono)] text-[11px] text-[#5a4028]">Counted spine by spine, from the shelf.</p>
      <p className="mt-3">
        Twenty-seven volumes. I have held each of them. Some of them twice. The ones I have held twice are the ones I do
        not trust.
      </p>
    </>
  ),
  wordcount: (
    <>
      <p className="font-[var(--font-mono)] text-[11px] text-[#5a4028]">Counted. I know it serves no purpose.</p>
      <p className="mt-3">
        I count them every few weeks, because it is the only thing here that can be done the same way twice. The number
        grows. The understanding does not.
      </p>
      <p className="mt-3">Four million, four hundred thousand. Approximately. The approximation is the honest part.</p>
    </>
  ),
  population: (
    <>
      <p className="font-[var(--font-mono)] text-[11px] text-[#5a4028]">
        Most of them in eleven worlds. The rest, in none that I know.
      </p>
      <p className="mt-3">
        Ninety-three names. All of them dead. This is an archive of the dead, and I am the one who keeps it.
      </p>
      <p className="mt-3">
        I have not decided whether that is a duty or a habit. The distinction matters and I cannot make it.
      </p>
    </>
  ),
}
