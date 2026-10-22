/**
 * What is written on the nine sheets — the wall text.
 *
 * The prose is the Diagram as recorded on the Coppermind, which reproduces the
 * epigraphs from *Words of Radiance* and *Oathbringer*. It is not edited here.
 * What changes is the hand it is written in: everything on paper is EB Garamond
 * or the archive's handwriting, never a UI sans, and nothing is set below the
 * contrast of `--text-on-page-tertiary` — the old wall's faint grey paragraphs
 * were 2.6:1, which is decoration pretending to be writing.
 *
 * VII–IX are not prose, they are the ledger. They draw their rows from
 * `tally-data.ts`, which counts the same generated archive `/stats` counts.
 */
import type { CSSProperties, ReactNode } from 'react'
import { Ledger } from './Ledger'
import { ledgerFor } from './tally-data'

const INK = 'var(--text-on-page-primary)'
const INK_SOFT = 'var(--text-on-page-secondary)'
const INK_FAINT = 'var(--text-on-page-tertiary)'
const RED = '#8c2b1f'

const serif = 'var(--font-display)'
const hand = 'var(--font-hand)'

function SheetBody({ id, large = false }: { id: string; large?: boolean }): ReactNode {
  return (
    <div className="flex h-full flex-col">
      <Typography large={large}>{BODIES[id] ?? null}</Typography>
    </div>
  )
}

/**
 * The wall is read at arm's length, not at a desk. Small sheets get one step
 * less type than the fold-out ledgers, and every excerpt is short enough to
 * finish inside the paper instead of being guillotined by `overflow: hidden`.
 */
function Typography({ large, children }: { large: boolean; children: ReactNode }) {
  return (
    <div
      data-sheet-large={large ? 'true' : 'false'}
      className="flex h-full flex-col"
      style={
        {
          '--sheet-title-step': large ? '4px' : '0px',
          '--sheet-body-step': large ? '1px' : '0px',
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}

function Title({ children, strike = false }: { children: ReactNode; strike?: boolean }) {
  return (
    <h3
      className="relative inline-block self-start leading-[1.08]"
      style={{
        fontFamily: serif,
        fontSize: 'calc(22px + var(--sheet-title-step, 0px))',
        color: INK,
        letterSpacing: '-0.005em',
      }}
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
    <p
      className="mt-sm leading-[1.4]"
      style={{ fontFamily: serif, fontSize: 'calc(14px + var(--sheet-body-step, 0px))', color: INK_SOFT }}
    >
      {children}
    </p>
  )
}

/** The source line. Written, not typeset: it is a note to himself. */
function Source({ children }: { children: ReactNode }) {
  return (
    <p
      className="mt-xs leading-[1.15]"
      style={{ fontFamily: hand, fontSize: 15, color: INK_FAINT, letterSpacing: '0.01em' }}
    >
      {children}
    </p>
  )
}

function Margin({ children }: { children: ReactNode }) {
  return (
    <p className="mt-sm -rotate-[1.1deg] leading-[1.15]" style={{ fontFamily: hand, fontSize: 16, color: RED }}>
      {children}
    </p>
  )
}

function Figure({ value, unit }: { value: string; unit: string }) {
  const size = value.length > 6 ? 42 : value.length > 4 ? 48 : 56
  return (
    <div className="mt-md flex items-baseline gap-sm" style={{ whiteSpace: 'nowrap' }}>
      <span style={{ fontFamily: serif, fontSize: size, lineHeight: 0.9, color: INK }}>{value}</span>
      <span style={{ fontFamily: hand, fontSize: 22, color: INK_SOFT }}>{unit}</span>
    </div>
  )
}

/** A tally sheet: a figure, then the ruled rows that make the figure true. */
function Tally({ id, note }: { id: string; note?: string }) {
  const ledger = ledgerFor(id)
  if (!ledger) return null
  return (
    <>
      <Figure value={ledger.total.toLocaleString('es-ES')} unit={ledger.totalLabel} />
      <Ledger
        rows={ledger.rows}
        unit={ledger.unit}
        total={ledger.total}
        totalLabel={ledger.totalLabel}
        compact
        note={note}
      />
    </>
  )
}

const BODIES: Record<string, ReactNode> = {
  catalogue: (
    <>
      <Title>Catechism of the Back of the Flowered Painting</Title>
      <Body>
        Q: For what essential must we strive? A: The essential of preservation, to shelter a seed of humanity.
      </Body>
      <Source>Paragraph 1</Source>
      <Margin>— mankind must survive. Our burden is that of the species.</Margin>
    </>
  ),

  chronology: (
    <>
      <Title>Tenets of Instruction</Title>
      <Body>You must become king. Of Everything.</Body>
      <Source>Paragraph 1 · back of the footboard</Source>
      <Margin>— of Everything. The capital letter is not an accident.</Margin>
    </>
  ),

  worlds: (
    <>
      <Title>Floorboard 17</Title>
      <Body>They are with the Shin. We must find one. Can we craft a weapon?</Body>
      <Source>Paragraph 2 · every second letter</Source>
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
      <Source>Paragraph 8</Source>
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
      <Source>Paragraph 4 · Adrotagia's third translation</Source>
      <Margin>— if he seems likely to sue for peace, assassinate him.</Margin>
    </>
  ),

  connections: (
    <>
      <Title>Book of the 2nd Desk Drawer</Title>
      <Body>The Unmade are a deviation, a flair, a conundrum.</Body>
      <Source>Paragraph 14</Source>
      <Margin>— one is almost certainly a traitor to the others.</Margin>
    </>
  ),

  volumes: (
    <>
      <Title>The Volumes</Title>
      <Tally id="volumes" />
    </>
  ),

  wordcount: (
    <>
      <Title>Of the Words Counted</Title>
      <Tally id="wordcount" note="counted every few weeks. it is the only thing here that can be done twice." />
    </>
  ),

  population: (
    <>
      <Title>How Many Live, and Where</Title>
      <Tally id="population" note="all of them dead. this is an archive of the dead." />
    </>
  ),
}

export { SheetBody }
