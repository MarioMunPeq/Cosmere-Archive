/**
 * Loose papers on the desk — the diegetic reading surface for the Diagram.
 *
 * ## Why not a notebook
 *
 * A bound ledger says "someone organised this." Taravangian did not organise
 * anything. He wrote on every surface of his bedroom on a day of genius and
 * the notes have been pulled from those surfaces and left in a pile. A notebook
 * with a spine and stitching is a library's object. A pile of torn paper on a
 * desk is a madman's.
 *
 * ## What it is
 *
 * A wooden surface with a stack of loose sheets. The top sheet is the one being
 * read — or the index, if none has been chosen. The sheets behind it peek out
 * from the edges, so the pile is visible without being legible. There is no
 * binding, no ruled lines, no margin. Taravangian wrote to the edge.
 *
 * ## Interaction
 *
 * Clicking a sheet on the wall pulls the corresponding paper to the top of the
 * pile. The top paper carries a small ink mark in the corner that sends it back
 * to the pile. There is no "Contents" button, because a pile of papers does
 * not have a contents page — it has the top sheet.
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

export default function Papers({ active, hovered, onPick, onHover, onClose }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [showIndex, setShowIndex] = useState(true)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (active) setShowIndex(false)
  }, [active])

  const preview = hovered && hovered.id !== active?.id ? hovered : null

  const topIsIndex = showIndex || !active

  return (
    <aside
      data-diagram-panel
      aria-label="The Diagram, on the desk"
      className="relative z-10 flex shrink-0 flex-col bg-[#2a1a0e] min-h-[85vh] w-full md:h-full md:min-h-0 md:w-[460px]"
    >
      {/* The desk surface. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg, #3a2414 0%, #2a180c 40%, #1a0e06 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(80,50,24,0.18) 0px, rgba(80,50,24,0.18) 1px, transparent 1px, transparent 7px)',
        }}
      />

      {/* The pile. */}
      <div className="relative m-4 flex min-h-0 flex-1 flex-col">
        {/* Backing sheets: the pile behind the top one. */}
        <div aria-hidden className="absolute inset-0" style={{ transform: 'rotate(-2.6deg) translate(6px, 4px)' }}>
          <Sheet back />
        </div>
        <div aria-hidden className="absolute inset-0" style={{ transform: 'rotate(1.8deg) translate(-4px, 6px)' }}>
          <Sheet back />
        </div>
        <div aria-hidden className="absolute inset-0" style={{ transform: 'rotate(-0.8deg) translate(2px, 2px)' }}>
          <Sheet back />
        </div>

        {/* The top sheet. */}
        <div
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
          style={{
            transform: 'rotate(0.6deg)',
            boxShadow: '4px 8px 18px rgba(0,0,0,0.55), 1px 2px 4px rgba(0,0,0,0.4)',
          }}
        >
          <Sheet>
            {topIsIndex ? (
              <Index
                entries={DIAGRAM_NOTES}
                active={active}
                onPick={(id) => {
                  onPick(id)
                  setShowIndex(false)
                }}
                onHover={onHover}
              />
            ) : active ? (
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
          </Sheet>
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

function Sheet({ children, back = false }: { children?: React.ReactNode; back?: boolean }) {
  return (
    <div
      className="h-full w-full overflow-hidden"
      style={{
        background: back
          ? 'linear-gradient(152deg, #e8dcc0 0%, #ded0ae 100%)'
          : 'linear-gradient(152deg, #f2e9d4 0%, #eae0c8 40%, #e0d4b6 76%, #d6c8a6 100%)',
        clipPath: back ? 'polygon(0% 1%, 100% 0%, 99% 100%, 1% 99%)' : 'polygon(0% 0%, 100% 2%, 98% 100%, 2% 98%)',
        padding: '22px 26px',
      }}
    >
      {children}
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
    <div className="relative">
      <h2 className="font-[var(--font-display)] text-[22px] leading-[1.15] text-[#241a12]">The Diagram</h2>
      <p className="mt-1 font-[var(--font-display)] text-[13px] italic text-[#5a4028]">
        Nine sheets. Pick one up, or read them in order.
      </p>
      <div aria-hidden className="my-3 h-px w-full bg-[rgba(60,40,20,0.35)]" />
      <ol className="space-y-1.5">
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
                className="group w-full cursor-pointer text-left"
                style={{
                  background: isActive ? 'rgba(60,40,20,0.06)' : 'transparent',
                  padding: '4px 2px',
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
    <div className="relative">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close sheet"
        className="absolute right-1 top-1 cursor-pointer font-[var(--font-mono)] text-[11px] text-[#8a6840] transition-colors hover:text-[#241a12]"
      >
        ×
      </button>
      <div className="mb-2 pr-4">
        <span className="font-[var(--font-mono)] text-[10px] text-[#5a4028]">{note.numeral}</span>
        {note.tally ? (
          <span className="ml-2 font-[var(--font-mono)] text-[9px] uppercase tracking-[0.15em] text-[#8a6840]">
            Tally
          </span>
        ) : null}
      </div>
      <h2 data-diagram-sheet-title className="font-[var(--font-display)] text-[20px] leading-[1.15] text-[#241a12]">
        {note.title}
      </h2>
      {note.caption ? (
        <p className="mt-2 font-[var(--font-display)] text-[13px] italic leading-[1.5] text-[#5a4028]">
          {note.caption}
        </p>
      ) : null}
      <div aria-hidden className="my-3 h-px w-full bg-[rgba(60,40,20,0.35)]" />
      <div className="max-w-[52ch]">
        <div className="font-[var(--font-display)] text-[13px] leading-[1.65] text-[#241a12]">
          {PROSE[note.id] ?? null}
        </div>
        {note.links.length > 0 ? (
          <nav aria-label="What this sheet refers to" className="mt-5 max-w-[48ch]">
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
        Pick up a sheet from the pile, or tap one on the wall.
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
