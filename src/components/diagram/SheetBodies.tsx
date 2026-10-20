/**
 * What is written on the nine sheets — the wall text.
 *
 * ## Content source
 *
 * The text is drawn from the Diagram as recorded on the Coppermind, which
 * reproduces the epigraphs from *Words of Radiance* and *Oathbringer*. These
 * are Taravangian's own words from his day of greatest genius. They are not
 * invented; they are transcribed, the way a wall of notes is transcribed from
 * the surfaces it was written on.
 *
 * The wall shows the short form. The notebook shows the full excerpt.
 */
import type { ReactNode } from 'react'
import { BOOKS } from '@/data/static/books'
import { ALL_CHARACTERS } from '@/data/static'

const INK = '#241a12'
const INK_SOFT = 'rgba(36,26,18,0.68)'
const INK_FAINT = 'rgba(36,26,18,0.42)'
const RED = 'rgba(150,44,34,0.82)'

const serif = 'var(--font-display)'

function SheetBody({ id }: { id: string }): ReactNode {
  return <div className="flex h-full flex-col">{BODIES[id] ?? null}</div>
}

function Title({ children, strike = false }: { children: ReactNode; strike?: boolean }) {
  return (
    <h3
      className="relative inline-block self-start leading-[1.15]"
      style={{ fontFamily: serif, fontSize: 26, color: INK, letterSpacing: '-0.01em' }}
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

function Body({ children }: { children: ReactNode }) {
  return (
    <p className="mt-md leading-[1.55]" style={{ fontSize: 15, color: INK_SOFT }}>
      {children}
    </p>
  )
}

function Mono({ children }: { children: ReactNode }) {
  return (
    <p className="mt-sm font-[var(--font-mono)]" style={{ fontSize: 13, color: INK_FAINT, letterSpacing: '0.02em' }}>
      {children}
    </p>
  )
}

function Margin({ children }: { children: ReactNode }) {
  return (
    <p className="mt-md -rotate-[1.2deg]" style={{ fontFamily: serif, fontSize: 14, color: RED, fontStyle: 'italic' }}>
      {children}
    </p>
  )
}

function Figure({ value, unit }: { value: string; unit: string }) {
  const size = value.length > 6 ? 56 : value.length > 4 ? 68 : 82
  return (
    <div className="mt-lg flex items-baseline gap-sm" style={{ whiteSpace: 'nowrap' }}>
      <span style={{ fontFamily: serif, fontSize: size, lineHeight: 0.9, color: INK }}>{value}</span>
      <span style={{ fontFamily: serif, fontSize: 22, color: INK_SOFT }}>{unit}</span>
    </div>
  )
}

const totalWords = BOOKS.reduce((a, b) => a + (b.wordCount ?? 0), 0)

const BODIES: Record<string, ReactNode> = {
  catalogue: (
    <>
      <Title>Catechism of the Back of the Flowered Painting</Title>
      <Body>
        Q: For what essential must we strive? A: The essential of preservation, to shelter a seed of humanity through
        the coming storm. Q: What cost must we bear? A: The cost is irrelevant. Mankind must survive.
      </Body>
      <Mono>Paragraph 1</Mono>
      <Margin>— mankind must survive. Our burden is that of the species.</Margin>
    </>
  ),

  chronology: (
    <>
      <Title>Tenets of Instruction</Title>
      <Body>You must become king. Of Everything.</Body>
      <Mono>Paragraph 1 · Back of the Footboard</Mono>
      <Margin>— of Everything. The capital letter is not an accident.</Margin>
    </>
  ),

  worlds: (
    <>
      <Title>Floorboard 17</Title>
      <Body>
        Ah, but they were left behind. It is obvious from the nature of the bond. But where, where, where, where? Set
        off. Obvious. Realization like apricity. They are with the Shin.
      </Body>
      <Mono>Paragraph 2 · every second letter</Mono>
      <Margin>— can we craft a weapon?</Margin>
    </>
  ),

  shards: (
    <>
      <Title>West Wall Psalm of Wonders</Title>
      <Body>
        But who is the wanderer, the wild piece, the one who makes no sense? I glimpse at his implications, and the
        world opens to me. I shy back. Impossible. Is it?
      </Body>
      <Mono>Paragraph 8</Mono>
      <Margin>— the wanderer. The one who makes no sense.</Margin>
    </>
  ),

  heralds: (
    <>
      <Title>Writings upon the Bedstand Lamp</Title>
      <Body>
        Chaos in Alethkar is, of course, inevitable. Watch carefully, and do not let power in the kingdom solidify. The
        Blackthorn could become an ally or our greatest foe.
      </Body>
      <Mono>Paragraph 4 · Adrotagia's third translation</Mono>
      <Margin>— if he seems likely to sue for peace, assassinate him.</Margin>
    </>
  ),

  connections: (
    <>
      <Title>Book of the 2nd Desk Drawer</Title>
      <Body>
        The Unmade are a deviation, a flair, a conundrum that may not be worth your time. You cannot help but think of
        them. They are fascinating.
      </Body>
      <Mono>Paragraph 14</Mono>
      <Margin>— one is almost certainly a traitor to the others.</Margin>
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

function fmtWords(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} M`
  return n.toLocaleString('es-ES')
}

export { SheetBody }
