/**
 * The notebook — the diegetic reading surface for the Diagram.
 *
 * ## What this replaces
 *
 * `ReadingPanel.tsx`: a 360px column with `border-[var(--border-subtle)]` and
 * `bg-[var(--surface-raised)]` — a web panel with a paper texture painted on
 * top, which is the opposite of what a reading surface is. The index and the
 * prose lived in a sidebar because the wall had no room for them, and the
 * sidebar said so.
 *
 * ## What a notebook on a desk is
 *
 * An open ledger, bound at the centre, two pages visible. The left page is
 * always the index — roman numerals, ink rules, the tally sheets marked —
 * because that is what a book shows when you open it. The right page is the
 * sheet being read, or a blank page if none has been chosen. There is no
 * "nothing selected" state, because a blank page is a page, not a message.
 *
 * ## Why not 3D
 *
 * The Family Trees scene went through three 3D iterations and settled on a
 * flat SVG on a parchment for exactly this reason: the reading is the point,
 * and every polygone between the reader and the text is friction. A notebook
 * is paper. Paper is flat. The wall is where the 3D lives; the notebook is
 * where the reading lives.
 *
 * ## Mobile
 *
 * One page at a time. The index is the default; picking a sheet turns the
 * page. A small ink mark in the corner turns it back.
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

  // When a sheet is chosen, the notebook turns to it. Done in the pick handler
  // rather than in an effect, so we never call setState synchronously during
  // render.

  const preview = hovered && hovered.id !== active?.id ? hovered : null

  return (
    <aside
      data-diagram-panel
      aria-label="The Diagram, open on the desk"
      className="relative z-10 flex shrink-0 flex-col bg-[#3a2616] max-h-[88vh] w-full md:h-full md:max-h-none md:w-[720px]"
    >
      {/* The desk surface the notebook rests on. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-12"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(40,24,12,0.55) 100%)',
        }}
      />

      {/* The notebook itself. */}
      <div className="relative m-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[3px] shadow-[0_18px_40px_rgba(0,0,0,0.55),0_4px_8px_rgba(0,0,0,0.4)]">
        {/* Binding: the dark spine down the centre on desktop. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-6 -translate-x-1/2 md:block"
          style={{
            background:
              'linear-gradient(90deg, rgba(30,18,9,0.95) 0%, rgba(52,32,16,0.85) 35%, rgba(52,32,16,0.85) 65%, rgba(30,18,9,0.95) 100%)',
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.6)',
          }}
        >
          {/* Stitching. */}
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

        {/* Mobile: single page with a flip control. */}
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
          {/* Left page: the index. Always visible on desktop. */}
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

          {/* Right page: the sheet being read. */}
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

/** Ruled lines, as a notebook page has them. */
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
      <div ref={undefined} className="max-w-[52ch]">
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

/**
 * The prose for each sheet.
 *
 * Taravangian's voice: certain about some things, visibly unsure about others,
 * counting what can be counted because it is the only thing that stays the same.
 * Short paragraphs, not essays — this is a notebook, not a treatise.
 */
const PROSE: Record<string, React.ReactNode> = {
  catalogue: (
    <>
      <p>
        Everything gathered so far. Not everything is here. What is missing is what interests me most, and I do not yet
        know what that is.
      </p>
      <p className="mt-3">
        Twenty-seven volumes, ninety-three names, eleven worlds. I have counted them three times. The count does not
        change; my understanding of it does.
      </p>
      <p className="mt-3">
        This is not an index of knowledge. It is an index of ignorance, arranged so that the gaps show.
      </p>
    </>
  ),
  chronology: (
    <>
      <p>
        The order of things is not ours. We count from when we learned them; those things happened before there was
        anyone to count.
      </p>
      <p className="mt-3">
        I have tried to set them in sequence. The sequence refuses. Events that should be centuries apart sit beside
        each other, and events that should be adjacent are separated by silences I cannot account for.
      </p>
      <p className="mt-3">
        The Lord Ruler held for a thousand years. That is the only span I trust. Everything before it is reconstruction;
        everything after it is consequence.
      </p>
    </>
  ),
  worlds: (
    <>
      <p>
        Eleven. Twelve, if you count the one that broke. Each with its Shard, and each Shard with its particular way of
        being wrong.
      </p>
      <p className="mt-3">
        Sel interests me most. I do not know why yet. Something about the way power settled into geography there — as if
        the land itself became the theology.
      </p>
      <p className="mt-3">Roshar is second. Not because of the storms. Because of what the storms remember.</p>
    </>
  ),
  shards: (
    <>
      <p>
        Power divided until it became personality. Each believes its fragment is the whole, and on that point they
        agree.
      </p>
      <p className="mt-3">
        Honor, Cultivation, Odium. And before them, how many more? Adonalsium was not a person. It was a condition, and
        the condition was broken, and the pieces do not know they are pieces.
      </p>
      <p className="mt-3">
        I have written their names in order. The order is arbitrary. I keep it anyway, because an arbitrary order is
        still an order, and I need one.
      </p>
    </>
  ),
  heralds: (
    <>
      <p>Ten at Aharietiam. Ten blades of metal driven into stone, and one of them empty since Talenel took it.</p>
      <p className="mt-3">
        The one that is missing is the one that matters. It is always the one that is missing. I have written their
        names in the order they broke.
      </p>
      <p className="mt-3">
        Taln held. For four thousand five hundred years, Taln held. I do not understand what that means yet. I am not
        sure I want to.
      </p>
    </>
  ),
  connections: (
    <>
      <p>Most of it is written. Most of it.</p>
      <p className="mt-3">
        The Heralds know each other. The Radiants do not. That means something. I have not found what.
      </p>
      <p className="mt-3">
        Ninety-three names. Most of them are dead. The living ones are the ones I cannot place, which is either a
        coincidence or the point.
      </p>
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
