/**
 * The wall between the sheets: clippings, chalk, and the odd scrap of arithmetic.
 *
 * These are not decoration. They are the reason a wall reads as worked-on rather
 * than laid out: a broadsheet torn out and pinned, a hand-drawn coast, a receipt
 * for a candle, and a line written straight on the plaster because there was no
 * paper within reach.
 *
 * No overlaps with a sheet, by construction — `wall-docs.ts` places every piece
 * in a gap. Chalk is pale because dark ink on a dark wall is invisible; the
 * string is dark because it is string.
 */
import type { WallAnnotation, WallClipping } from './wall-docs'
import { PLANETS } from '@/data/static/planets'
import { POPULATION_TOTAL, VOLUME_TOTAL, WORD_TOTAL } from './tally-data'

const INK = 'var(--text-on-page-primary)'
const SOFT = 'var(--text-on-page-secondary)'
const RED = '#8c2b1f'

export function Clipping({ clip }: { clip: WallClipping }) {
  const seed = hash(clip.id)
  const torn = tornClip(seed)

  return (
    <div
      data-diagram-clip={clip.id}
      className="absolute"
      style={{
        left: clip.x,
        top: clip.y,
        width: clip.w,
        height: clip.h,
        transform: `rotate(${clip.rot}deg)`,
        filter: 'drop-shadow(4px 7px 8px rgb(4 2 1 / 0.5))',
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background:
            'linear-gradient(155deg, var(--surface-page) 0%, var(--codex-page-block) 58%, var(--surface-page-inset) 100%)',
          clipPath: torn,
          padding: clip.kind === 'press' ? '10px 12px' : '10px 12px 8px',
          color: INK,
        }}
      >
        {clip.kind === 'map' ? (
          <MapScrap label={clip.text} />
        ) : clip.kind === 'ledger' ? (
          <NumberScrap label={clip.text} />
        ) : clip.kind === 'press' ? (
          <PressScrap text={clip.text} />
        ) : (
          <NoteScrap text={clip.text} />
        )}

        {/* One tack, unless it is a press cutting, which is taped. */}
        {clip.kind === 'press' ? (
          <span
            aria-hidden
            className="absolute"
            style={{
              right: -8,
              top: -5,
              width: 34,
              height: 13,
              transform: 'rotate(-24deg)',
              background: 'linear-gradient(180deg, rgb(232 214 166 / 0.42), rgb(206 186 138 / 0.3))',
              boxShadow: '0 1px 2px rgb(4 2 1 / 0.4)',
            }}
          />
        ) : (
          <span
            aria-hidden
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: -5,
              width: 10,
              height: 10,
              marginLeft: -5,
              background:
                'radial-gradient(circle at 34% 30%, var(--codex-brass-highlight) 0%, var(--codex-brass) 52%, var(--codex-thread) 100%)',
              boxShadow: '0 2px 3px rgb(4 2 1 / 0.65)',
            }}
          />
        )}
      </div>
    </div>
  )
}

function PressScrap({ text }: { text: string }) {
  return (
    <div className="flex h-full flex-col">
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          lineHeight: 1.15,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: INK,
        }}
      >
        The Broadsheet
      </p>
      <span aria-hidden className="my-1 block h-px w-full" style={{ background: 'rgb(36 26 18 / 0.4)' }} />
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, lineHeight: 1.3, color: SOFT }}>{text}</p>
    </div>
  )
}

function NoteScrap({ text }: { text: string }) {
  return (
    <p
      className="-rotate-[0.7deg]"
      style={{ fontFamily: 'var(--font-hand)', fontSize: 17, lineHeight: 1.2, color: RED }}
    >
      {text}
    </p>
  )
}

function NumberScrap({ label }: { label: string }) {
  const rows = [
    ['volumes', VOLUME_TOTAL.toLocaleString('es-ES')],
    ['words', `${(WORD_TOTAL / 1_000_000).toFixed(2).replace('.', ',')} M`],
    ['names', POPULATION_TOTAL.toLocaleString('es-ES')],
    ['worlds', String(PLANETS.length)],
  ]
  return (
    <div className="flex h-full flex-col">
      {rows.map(([name, value], i) => (
        <div
          key={name}
          className="flex items-baseline justify-between"
          style={{
            borderTop: i === 0 ? 'none' : '1px solid rgb(36 26 18 / 0.24)',
            paddingTop: i === 0 ? 0 : 3,
            marginTop: i === 0 ? 0 : 3,
          }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: SOFT }}>{name}</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: INK,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
          </span>
        </div>
      ))}
      <p className="mt-1" style={{ fontFamily: 'var(--font-hand)', fontSize: 15, lineHeight: 1.05, color: RED }}>
        {label}
      </p>
    </div>
  )
}

function MapScrap({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col">
      <svg viewBox="0 0 260 150" className="min-h-0 flex-1" fill="none" aria-hidden>
        <path
          d="M12 96 C34 78 48 86 62 66 C78 44 102 58 118 44 C136 28 158 40 178 30 C196 22 214 34 232 26"
          stroke={INK}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M4 122 C30 112 52 120 78 104 C100 90 124 100 146 88 C168 76 196 86 220 74 C234 68 246 70 256 64"
          stroke="rgb(36 26 18 / 0.4)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path d="M64 62 L72 46 L86 52 L78 64 Z" stroke="rgb(36 26 18 / 0.5)" strokeWidth="1" />
        <circle cx="72" cy="52" r="2.4" fill={RED} />
        <path d="M150 92 L156 76 L170 82 L162 94 Z" stroke="rgb(36 26 18 / 0.5)" strokeWidth="1" />
        <circle cx="158" cy="82" r="2.4" fill={RED} />
        <path d="M96 132 L110 120 L128 128 L114 142 Z" stroke="rgb(36 26 18 / 0.4)" strokeWidth="1" />
        <text x="80" y="42" fontFamily="var(--font-display)" fontSize="12" fontStyle="italic" fill={SOFT}>
          Alethkar
        </text>
        <text x="152" y="72" fontFamily="var(--font-display)" fontSize="12" fontStyle="italic" fill={SOFT}>
          Jah Keved
        </text>
        <text x="96" y="116" fontFamily="var(--font-display)" fontSize="12" fontStyle="italic" fill={SOFT}>
          the Shin
        </text>
      </svg>
      <p style={{ fontFamily: 'var(--font-hand)', fontSize: 15, lineHeight: 1.05, color: RED }}>{label}</p>
    </div>
  )
}

/** Chalk on the plaster. Pale, because it is not ink and the wall is not paper. */
export function Chalk({ note }: { note: WallAnnotation }) {
  return (
    <p
      data-diagram-chalk={note.id}
      className="pointer-events-none absolute whitespace-nowrap"
      style={{
        left: note.x,
        top: note.y,
        transform: `rotate(${note.rot}deg)`,
        transformOrigin: 'left top',
        fontFamily: 'var(--font-hand)',
        fontSize: 24,
        lineHeight: 1,
        color: 'rgb(226 210 184 / 0.78)',
        textShadow: '0 1px 0 rgb(4 2 1 / 0.5)',
      }}
      aria-hidden
    >
      {note.text}
    </p>
  )
}

function tornClip(seed: number): string {
  const j = (n: number) => (((seed >> n) % 7) - 3) / 2
  const top = `0% ${j(0).toFixed(2)}%, 30% ${(j(1) * 0.7).toFixed(2)}%, 64% ${j(2).toFixed(2)}%, 100% ${(j(3) * 0.6).toFixed(2)}%`
  const right = `100% ${(j(4) * 0.8).toFixed(2)}%, ${(100 + j(5)).toFixed(2)}% 36%, ${(100 + j(6) * 0.7).toFixed(2)}% 70%, 100% ${(100 + j(7) * 0.6).toFixed(2)}%`
  const bottom = `100% ${(100 - j(8) * 0.7).toFixed(2)}%, 68% ${(100 - j(9)).toFixed(2)}%, 32% ${(100 - j(10) * 0.6).toFixed(2)}%, 0% ${(100 - j(11) * 0.9).toFixed(2)}%`
  const left = `0% ${(100 - j(12) * 0.9).toFixed(2)}%, ${j(13).toFixed(2)}% 66%, ${(j(14) * 0.7).toFixed(2)}% 34%, 0% ${(100 - j(15) * 0.7).toFixed(2)}%`
  return `polygon(${top}, ${right}, ${bottom}, ${left})`
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
  return Math.abs(h)
}
