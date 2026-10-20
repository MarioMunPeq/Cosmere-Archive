/**
 * What is written on the nine sheets.
 *
 * ## Why this replaces `DiagramWritings.tsx`
 *
 * 37 KB of handwriting and doodles scattered across the whole wall at 7-8px. At
 * that size it is not text — it is noise with a suggestion of writing in it, and
 * it was most of what made the wall look like a diagram tool. The drawings were
 * worth keeping; the letter was not, because nothing on that wall was ever
 * readable and the reading happens somewhere else.
 *
 * So each sheet now carries **its own content**, sized for A-5, in Taravangian's
 * hand: terse, corrective, certain about some things and visibly unsure about
 * others. Numbers where numbers belong, and the ones that are interesting rather
 * than all of them.
 *
 * ## The sizes are the plan's
 *
 * §5.6.2: title `--text-h3` 22px, body `--text-body-s` 15px, formulas `--text-mono`
 * 13px in `--text-tertiary`. D.2 requires ≥13px and ≥4.5:1.
 *
 * These are wall units, though, and the sheet is scaled when the wall is — so the
 * sizes here are **in wall units at the wall's own scale**, chosen so that a
 * focused sheet (which D.3 puts at ≥310px tall, roughly 1:1 with these numbers)
 * lands on the plan's px.
 */

import type { ReactNode } from 'react'
import { BOOKS } from '@/data/static/books'
import { ALL_CHARACTERS } from '@/data/static'
import { PLANETS } from '@/data/static/planets'
import { HONORBLADES } from '@/data/static/aharietiam'
import { MAGICS } from '@/data/static/diagram-totals'

const INK = '#241a12'
const INK_SOFT = 'rgba(36,26,18,0.68)'
const INK_FAINT = 'rgba(36,26,18,0.42)'
const RED = 'rgba(150,44,34,0.82)'

const serif = 'var(--font-display)'

export function SheetBody({ id }: { id: string }): ReactNode {
  return <div className="flex h-full flex-col">{BODIES[id] ?? null}</div>
}

function Title({ children, strike = false }: { children: ReactNode; strike?: boolean }) {
  return (
    <h3
      className="relative inline-block self-start leading-[1.15]"
      style={{ fontFamily: serif, fontSize: 34, color: INK, letterSpacing: '-0.01em' }}
    >
      {children}
      {strike && (
        <span
          aria-hidden
          className="absolute left-[-2px] right-[-2px] top-1/2 block"
          style={{ height: 3, background: RED, transform: 'rotate(-1.6deg)' }}
        />
      )}
    </h3>
  )
}

/** Body text at the plan's 15px, measured in wall units. */
function Body({ children }: { children: ReactNode }) {
  return (
    <p className="mt-md leading-[1.55]" style={{ fontSize: 21, color: INK_SOFT }}>
      {children}
    </p>
  )
}

/** A formula or a tally. §5.6.2's `--text-mono` at 13px → 18 wall units. */
function Mono({ children }: { children: ReactNode }) {
  return (
    <p className="mt-sm font-[var(--font-mono)]" style={{ fontSize: 18, color: INK_FAINT, letterSpacing: '0.02em' }}>
      {children}
    </p>
  )
}

/** A hand-drawn correction in the margin. */
function Margin({ children }: { children: ReactNode }) {
  return (
    <p className="mt-md -rotate-[1.2deg]" style={{ fontFamily: serif, fontSize: 19, color: RED, fontStyle: 'italic' }}>
      {children}
    </p>
  )
}

/**
 * The big figure on a tally sheet.
 *
 * Sized by length, not fixed: `4,4 M` at the same size as `93` is four times
 * the ink and wraps onto two lines, which on a wall this size looks like a
 * printing fault rather than a large number.
 */
function Figure({ value, unit }: { value: string; unit: string }) {
  const size = value.length > 6 ? 56 : value.length > 4 ? 68 : 82
  return (
    <div className="mt-lg flex items-baseline gap-sm" style={{ whiteSpace: 'nowrap' }}>
      <span style={{ fontFamily: serif, fontSize: size, lineHeight: 0.9, color: INK }}>{value}</span>
      <span style={{ fontFamily: serif, fontSize: 22, color: INK_SOFT }}>{unit}</span>
    </div>
  )
}

/** Ruled list. The old wall had bar charts; a man writing on paper writes lists. */
function Lines({ items }: { items: string[] }) {
  return (
    <ul className="mt-md space-y-1">
      {items.map((t, i) => (
        <li key={i} className="flex items-baseline gap-sm" style={{ fontSize: 19, color: INK_SOFT }}>
          <span style={{ fontFamily: serif, fontSize: 17, color: INK_FAINT }}>{String(i + 1).padStart(2, '0')}</span>
          <span className="truncate">{t}</span>
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------ the nine */

const totalWords = BOOKS.reduce((a, b) => a + (b.wordCount ?? 0), 0)

const BODIES: Record<string, ReactNode> = {
  catalogue: (
    <>
      <Title>De lo que hay en este archivo</Title>
      <Body>Todo lo que se ha juntado hasta ahora. No todo está aquí. Lo que falta es lo que más me interesa.</Body>
      <Mono>
        {BOOKS.length} volúmenes · {ALL_CHARACTERS.length} nombres
      </Mono>
      <Margin>— y sin embargo no sé por dónde empezar.</Margin>
    </>
  ),

  chronology: (
    <>
      <Title>El orden de las cosas</Title>
      <Body>
        Que no es el nuestro. Nosotros contamos desde que lo supimos; aquello ocurrió antes de que hubiera alguien que
        lo contara.
      </Body>
      <Mono>{MAGICS.eventCount} puntos · desde −20000 hasta hoy</Mono>
      <Lines
        items={[
          'La fragmentación, y lo que se rompió al romperlo',
          'El Lord Ruler, y los mil años que lasted',
          'La guerra de Dioses, y quién salió de ella',
        ]}
      />
    </>
  ),

  worlds: (
    <>
      <Title>Los mundos</Title>
      <Body>
        Once. Doce, si se cuenta el que se rompió. Cada uno con su Esquirla, y cada Esquirla con su manera de estar
        equivocado.
      </Body>
      <Lines items={PLANETS.map((p) => `${p.name} — ${p.shard || 'sin Esquirla'}`)} />
      <Margin>Sel es el que más me interesa. No sé por qué todavía.</Margin>
    </>
  ),

  shards: (
    <>
      <Title>De las Esquirlas</Title>
      <Body>
        Poder dividido hasta que se volvió personalidad. Cada una cree que su fragmento es el poder entero, y en eso
        están de acuerdo.
      </Body>
      <Mono>{MAGICS.shardCount} contabilizadas desde los mundos</Mono>
      <Margin>«Honor, Cultivation, Odium…» — y antes de ellas, cuántas más.</Margin>
    </>
  ),

  heralds: (
    <>
      <Title>De los Heralds</Title>
      <Body>
        Diez en Aharietiam. Diez hojas de metal clavadas en una piedra, y una de ellas vacía desde que Talenel la tomó.
      </Body>
      <Lines items={HONORBLADES.map((h) => h.name)} />
      <Margin>La que falta es la que importa. Siempre es la que falta.</Margin>
    </>
  ),

  connections: (
    <>
      <Title>Quién se conoce, y quién se guarda</Title>
      <Body>La mayor parte está escrito. La mayor parte.</Body>
      <Mono>{ALL_CHARACTERS.filter((c) => c.planet).length} con un mundo · el resto todavía no sé de dónde viene</Mono>
      <Margin>Los Heralds se conocen entre sí. Los Radiantes no. Eso significa algo.</Margin>
    </>
  ),

  volumes: (
    <>
      <Title>Los tomos</Title>
      <Figure value={String(BOOKS.length)} unit="volúmenes" />
      <Mono>contados de spine en spine</Mono>
    </>
  ),

  wordcount: (
    <>
      <Title>De las palabras contadas</Title>
      <Figure value={fmtWords(totalWords)} unit="palabras" />
      <Body>
        Las he contado. Sé que no sirve de nada. Lo hago igual, cada pocas semanas, porque es lo único aquí que se puede
        volver a hacer igual.
      </Body>
    </>
  ),

  population: (
    <>
      <Title>Cuántos viven, y dónde</Title>
      <Figure value={String(ALL_CHARACTERS.length)} unit="nombres" />
      <Mono>la mayoría en once mundos · el resto, en ninguno que sepa</Mono>
      <Margin>Todos ellos están muertos. Es un archivo de muertos.</Margin>
    </>
  ),
}

/** 5_240_000 → «5,2 M». Spanish thousands separator, which is what the site uses. */
function fmtWords(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} M`
  return n.toLocaleString('es-ES')
}
