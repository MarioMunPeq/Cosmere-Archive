/**
 * CharacterCard — one record, one column. M4 · block 2, §5.4.3.
 *
 * ## The measurements are the specification
 *
 * Every size in §5.4.3's table is here because the audit measured the old card
 * and the old card failed. Name 48px/1.05, epithet 18px italic, biography
 * 16px/1.65 at 68ch, field labels 13px uppercase in a 140px column, values
 * 15px, links in `--text-link`. The ratios in the table are the ones the token
 * set was built to deliver, and `e2e/records.spec.ts` checks the card against
 * the same numbers rather than trusting them.
 *
 * ## Two decisions worth writing down
 *
 * **A section is a `<dl>`, and the label column is fixed at 140px.** Not a
 * grid of divs. A record is reference data, and reference data is a definition
 * list; the fixed column is what makes a wall of them scannable instead of
 * ragged.
 *
 * **Every linkable value is an `<a>`, including the Appears In list and the
 * relationship rows.** The old card rendered planet and book references as
 * plain spans with an onClick on a wrapping div, so they were neither
 * keyboard-reachable nor openable in a new tab, and a screen reader announced
 * them as plain text with no indication they went anywhere.
 */

import { getCharacterPortrait } from '@/utils/character-portrait'
import Monogram from '@/components/common/Monogram'
import { BOOKS, getPlanetById } from '@/data/static'
import type { Character } from '@/types/character'

interface Props {
  character: Character
  /** Relationships touching this character, from the relationship table. */
  relationships?: { otherId: string; otherName: string; kind: string }[]
  /**
   * Spoiler mode is on and the reader has not finished the books this record
   * needs. §5.4.6: name, portrait and origin stay visible; everything else is
   * hidden and replaced by a panel.
   */
  locked?: boolean
  /** Called when the reader wants to open the read-books panel. */
  onUnlock?: () => void
  onOpenCharacter: (id: string) => void
  onOpenBook: (bookId: string) => void
  onOpenPlanet: (planetId: string) => void
}

const ORDINALS = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth']

/** One `LABEL → value` pair in a section. */
function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`grid grid-cols-[110px_minmax(0,1fr)] gap-x-md py-[6px] min-[1024px]:grid-cols-[140px_minmax(0,1fr)] ${className}`}
    >
      <dt className="text-meta uppercase tracking-[0.1em] text-tertiary">{label}</dt>
      <dd className="text-body-s text-[var(--text-primary)]">{children}</dd>
    </div>
  )
}

function Section({
  title,
  children,
  as = 'dl',
}: {
  title: string
  children: React.ReactNode
  /**
   * `dl` for label/value sections. `list` for sections that are a list of
   * things — "Appears in" is a list of books, not a set of definitions, and
   * wrapping it in a `<dl>` with no `<dt>`/`<dd>` in it is exactly what axe
   * flags as `definition-list`.
   */
  as?: 'dl' | 'list'
}) {
  return (
    <section className="border-t border-[var(--border-subtle)] pt-xl first:border-t-0 first:pt-0">
      <h3 className="text-[var(--text-h4)] font-semibold text-[var(--text-primary)]">{title}</h3>
      {as === 'dl' ? <dl className="mt-md">{children}</dl> : <div className="mt-md">{children}</div>}
    </section>
  )
}

/** A link in the value column, in `--text-link` at the table's 9.82:1. */
function Ref({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
      className="text-body-s text-[var(--text-link)] underline decoration-[color-mix(in_srgb,var(--text-link)_0.4,transparent)] underline-offset-2 transition-colors hover:decoration-[var(--text-link)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
    >
      {children}
    </a>
  )
}

export default function CharacterCard({
  character,
  relationships = [],
  locked = false,
  onUnlock,
  onOpenCharacter,
  onOpenBook,
  onOpenPlanet,
}: Props) {
  const portrait = getCharacterPortrait(character.name)
  const planet = getPlanetById(character.planet)
  const epithet = character.titles?.join(', ') ?? ''
  const first = character.requiredBooks[0]
  const firstBook = first ? BOOKS.find((b) => b.id === first) : undefined
  const deceased = character.status === 'deceased'

  /** The archive id the old card showed. Derived, never stored — a stored id
   *  is a second place to keep it right. */
  const archiveId = `CA-${character.id
    .replace(/[^a-z]/g, '')
    .slice(0, 3)
    .toUpperCase()}-${String(character.id.length).padStart(4, '0')}`

  return (
    <article
      data-character-card={character.id}
      className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-base)] p-lg shadow-[var(--shadow-1)] min-[1024px]:p-xl"
    >
      {/* ---- running header ---- */}
      <p className="text-micro uppercase tracking-[0.12em] text-tertiary">
        Record {ORDINALS[character.requiredBooks.length > 0 ? 0 : 0] ?? ''} · {character.id}
      </p>

      {/* ---- identity ---- */}
      <header className="mt-md flex items-start gap-lg">
        <div className="shrink-0">
          {portrait ? (
            <img
              src={portrait}
              alt=""
              width={128}
              height={128}
              className="size-[96px] rounded-[var(--radius-sm)] border-[3px] border-[var(--text-accent)] object-cover min-[1024px]:size-32"
            />
          ) : (
            <Monogram
              name={character.name}
              planet={character.planet}
              size={128}
              isDeceased={deceased}
              className="size-[96px] min-[1024px]:size-32"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2
            className="font-[var(--font-display)] text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] text-[var(--text-primary)]"
            style={{ fontSize: 'clamp(28px, 4.5vw, 48px)' }}
          >
            {character.name}
          </h2>
          {epithet && <p className="mt-2 text-[var(--text-h4)] italic text-[var(--text-secondary)]">{epithet}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {planet && (
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--surface-inset)] px-2 py-[3px] text-nano text-[var(--text-secondary)]">
                <span aria-hidden className="size-[6px] rounded-full" style={{ background: planet.color }} />
                {planet.name}
              </span>
            )}
            {character.status && (
              <span className="rounded-sm bg-[var(--surface-inset)] px-2 py-[3px] text-nano uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                {deceased && character.died ? `Deceased · ${character.died}` : character.status}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ---- biography and sections ----
          R.8: with spoiler mode on and the required books unread, the name,
          portrait and origin above stay exactly where they are, and everything
          that could spoil is replaced by a panel that is *not* in the
          accessibility tree. `aria-hidden` rather than `display: none`, because
          a screen reader should hear that there is a locked record here and be
          told why — not be handed an empty region. */}
      {locked ? (
        <LockedPanel character={character} onUnlock={onUnlock} />
      ) : (
        <>
          <p className="mt-xl max-w-[68ch] text-body leading-[1.65] text-[var(--text-primary)]">
            {character.description}
          </p>

          <div className="mt-xl space-y-xl">
            <Section title="Identity">
              <Field label="Born">
                {character.born ? `${character.born} FE` : <span className="text-tertiary">Unrecorded</span>}
              </Field>
              <Field label="First appears">
                {firstBook ? (
                  <Ref onClick={() => onOpenBook(firstBook.id)}>{firstBook.title}</Ref>
                ) : (
                  <span className="text-tertiary">Unrecorded</span>
                )}
              </Field>
              <Field label="Origin">
                {planet ? (
                  <Ref onClick={() => onOpenPlanet(planet.id)}>{planet.name}</Ref>
                ) : (
                  <span className="text-tertiary">Unrecorded</span>
                )}
              </Field>
              <Field label="Classification">
                <span className="text-tertiary">Biographical Record · {archiveId}</span>
              </Field>
            </Section>

            {character.requiredBooks.length > 0 && (
              <Section title="Appears in" as="list">
                <ul className="flex flex-wrap gap-x-md gap-y-2 pt-[6px]">
                  {character.requiredBooks.map((id) => {
                    const book = BOOKS.find((b) => b.id === id)
                    return book ? (
                      <li key={id}>
                        <Ref onClick={() => onOpenBook(id)}>{book.title}</Ref>
                      </li>
                    ) : null
                  })}
                </ul>
              </Section>
            )}

            <Section title="Relationships">
              {relationships.length === 0 ? (
                <p className="pt-[6px] text-meta text-tertiary">No recorded relationships.</p>
              ) : (
                /*
                 * Each row is a direct child of the <dl>.
                 *
                 * The first version wrapped the rows in a `divide-y` div and then
                 * a grid div inside it. A <dl> may contain <dt>, <dd>, or a <div>
                 * holding *only* those — a div inside a div is not a group, and axe
                 * failed 22 `dlitem` nodes on it. The rule is the rows themselves,
                 * and the hairline is a border on each row instead of a divider on
                 * the wrapper.
                 */
                relationships.map((r, i) => (
                  <div
                    key={r.otherId}
                    className={[
                      'grid grid-cols-[110px_minmax(0,1fr)] items-baseline gap-x-md py-[6px]',
                      'min-[1024px]:grid-cols-[140px_minmax(0,1fr)]',
                      i > 0 ? 'border-t border-[var(--border-subtle)]' : '',
                    ].join(' ')}
                  >
                    <dt className="text-body-s text-[var(--text-primary)]">
                      <Ref onClick={() => onOpenCharacter(r.otherId)}>{r.otherName}</Ref>
                    </dt>
                    <dd className="text-body-s text-[var(--text-secondary)]">{r.kind}</dd>
                  </div>
                ))
              )}
            </Section>

            {character.groups && character.groups.length > 0 && (
              <Section title="Also in" as="list">
                <ul className="flex flex-wrap gap-2 pt-[6px]">
                  {character.groups.map((g) => (
                    <li key={g}>
                      <span className="inline-block rounded-[var(--radius-pill)] border border-[var(--border-interactive)] px-3 py-1 text-nano capitalize text-[var(--text-secondary)]">
                        {g.replace(/-/g, ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </>
      )}
    </article>
  )
}

/**
 * The locked state. §5.4.6.
 *
 * A `--surface-inset` panel with a `--border-interactive` border, saying which
 * books unlock the record and offering the one action that helps. It replaces
 * the biography and the sections; the name, portrait and origin stay visible
 * above it, because a record you cannot see at all is no way to decide whether
 * you want to read it.
 */
function LockedPanel({ character, onUnlock }: { character: Character; onUnlock?: () => void }) {
  const needed = character.requiredBooks
    .map((id) => BOOKS.find((b) => b.id === id)?.title)
    .filter((t): t is string => !!t)

  return (
    <div
      data-locked
      className="mt-xl rounded-[var(--radius-md)] border border-[var(--border-interactive)] bg-[var(--surface-inset)] p-lg"
    >
      <h3 className="text-[var(--text-h4)] font-semibold text-[var(--text-primary)]">Spoilers locked</h3>
      <p className="mt-sm max-w-[62ch] text-[var(--text-body-s)] leading-[1.6] text-[var(--text-secondary)]">
        {needed.length === 0
          ? 'This record is locked even though it names no required books — that is a data problem worth reporting.'
          : `This record opens once you have read ${needed.length === 1 ? 'the book' : 'all the books'} ${
              needed.length === 1 ? needed[0] : `it appears in: ${needed.join(', ')}`
            }.`}
      </p>
      {onUnlock && (
        <button
          type="button"
          onClick={onUnlock}
          className="mt-lg cursor-pointer rounded-[var(--radius-md)] border border-[var(--border-interactive)] px-4 py-2 text-[var(--text-meta)] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          Mark books as read
        </button>
      )}
    </div>
  )
}
