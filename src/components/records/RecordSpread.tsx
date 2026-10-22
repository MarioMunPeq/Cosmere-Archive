/**
 * RecordSpread â€” one person's leaf in Part II.
 *
 * The left leaf is the plate: portrait, name, planet sigil and the identity
 * ledger. The right leaf is the reading page: biography, book references and
 * the people this record is connected to. The two leaves are built together so
 * a record can never share a spread with the next person in the alphabet.
 *
 * The ledger's label column is fixed at 132px on a normal page. At phone widths
 * it becomes a stacked definition row; keeping 132px there would leave the
 * value about one character wide.
 */

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Monogram from '@/components/common/Monogram'
import { ALL_CHARACTERS, BOOKS, PLANETS } from '@/data/static'
import { getCharacterPortrait } from '@/utils/character-portrait'
import { relationshipsFor } from '@/utils/relationships'
import { recordSpreadId } from '@/utils/codex-records'
import type { CodexSpreadView } from '@/components/codex/Codex'
import type { Character } from '@/types/character'
import type { Planet } from '@/types/planet'

const CHARACTERS_BY_ID = new Map(ALL_CHARACTERS.map((character) => [character.id, character]))
const PLANETS_BY_KEY = new Map<string, Planet>()
for (const planet of PLANETS) {
  PLANETS_BY_KEY.set(planet.id, planet)
  PLANETS_BY_KEY.set(planet.name, planet)
}
const BOOKS_BY_ID = new Map(BOOKS.map((book) => [book.id, book]))

export interface RecordSpreadProps {
  character: Character
  locked?: boolean
  onUnlock?: () => void
}

type RecordStatus = 'living' | 'deceased' | 'unknown'

function statusOf(character: Character): RecordStatus {
  if (character.status === 'living' || character.status === 'deceased') return character.status
  return character.died != null ? 'deceased' : 'unknown'
}

const STATUS_LABEL: Record<RecordStatus, string> = {
  living: 'Living',
  deceased: 'Deceased',
  unknown: 'Unrecorded',
}

/** A stable catalogue number, e.g. CA-ADO-0001. */
function classificationOf(character: Character): string {
  const letters = character.id
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'X')
  const index = ALL_CHARACTERS.findIndex((candidate) => candidate.id === character.id)
  const serial = String(index + 1).padStart(4, '0')
  return `CA-${letters}-${serial}`
}

export function PlanetSigil({ planet }: { planet?: Planet }) {
  const seed = [...(planet?.id ?? 'unknown')].reduce((sum, character) => sum + character.charCodeAt(0), 0)
  const spokes = 6 + (seed % 5)
  const colour = planet?.color ?? 'var(--text-on-page-accent)'

  return (
    <svg
      viewBox="0 0 40 40"
      className="size-9 shrink-0"
      style={{ color: `color-mix(in srgb, ${colour} 42%, #8a713a)` }}
      aria-hidden="true"
      focusable="false"
      data-record-sigil="true"
    >
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
      <circle cx="20" cy="20" r="12.5" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
      <circle cx="20" cy="20" r="7" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
      {Array.from({ length: spokes }, (_, index) => {
        const angle = (index / spokes) * Math.PI * 2
        const inner = 8
        const outer = 16
        return (
          <line
            key={index}
            x1={20 + Math.cos(angle) * inner}
            y1={20 + Math.sin(angle) * inner}
            x2={20 + Math.cos(angle) * outer}
            y2={20 + Math.sin(angle) * outer}
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="0.9"
          />
        )
      })}
      <circle cx="20" cy="20" r="2.2" fill="currentColor" fillOpacity="0.8" />
    </svg>
  )
}

function PortraitPlate({ character }: { character: Character }) {
  const planet = PLANETS_BY_KEY.get(character.planet)
  const portrait = getCharacterPortrait(character.name)
  const deceased = statusOf(character) === 'deceased'

  return (
    <div className="record-portrait group mx-auto mt-6" data-deceased={deceased ? 'true' : 'false'}>
      <span className="record-portrait__corner record-portrait__corner--tl" aria-hidden="true" />
      <span className="record-portrait__corner record-portrait__corner--tr" aria-hidden="true" />
      <span className="record-portrait__corner record-portrait__corner--bl" aria-hidden="true" />
      <span className="record-portrait__corner record-portrait__corner--br" aria-hidden="true" />

      <div className="record-portrait__frame">
        {portrait ? (
          <img
            src={portrait}
            alt=""
            loading="lazy"
            decoding="async"
            className="record-portrait__image"
            data-record-portrait="true"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center" aria-hidden="true">
            <Monogram
              name={character.name}
              planet={planet?.id}
              size={220}
              isDeceased={deceased}
              className="h-auto w-full"
            />
          </span>
        )}
      </div>
    </div>
  )
}

function IdentityLedger({ character }: { character: Character }) {
  const planet = PLANETS_BY_KEY.get(character.planet)
  const firstBook = character.requiredBooks.map((id) => BOOKS_BY_ID.get(id)).find(Boolean)

  return (
    <dl className="record-ledger mt-6">
      <div className="record-ledger__row">
        <dt>Born</dt>
        <dd>{character.born != null ? `${character.born} FE` : 'Unrecorded'}</dd>
      </div>

      <div className="record-ledger__row">
        <dt>First appears</dt>
        <dd>
          {firstBook ? (
            <Link to={`/books/${firstBook.id}`} className="record-link">
              {firstBook.title}
            </Link>
          ) : (
            'Unrecorded'
          )}
        </dd>
      </div>

      <div className="record-ledger__row">
        <dt>Origin</dt>
        <dd>
          {planet ? (
            <Link to={`/celestial-charts?focus=planet&id=${planet.id}`} className="record-link">
              {planet.name}
            </Link>
          ) : (
            character.planet || 'Unrecorded'
          )}
        </dd>
      </div>

      <div className="record-ledger__row">
        <dt>Classification</dt>
        <dd>
          <span className="record-code">{classificationOf(character)}</span>
        </dd>
      </div>
    </dl>
  )
}

export function RecordLeftPage({ character, locked = false }: RecordSpreadProps) {
  const planet = PLANETS_BY_KEY.get(character.planet)
  const status = statusOf(character)
  const epithet = character.titles?.[0]

  return (
    <article className="record-plate" data-record-plate={character.id}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <PlanetSigil planet={planet} />
          <span
            className="truncate text-[11px] uppercase tracking-[0.12em] [font-family:var(--font-ui)]"
            style={{ color: 'var(--text-on-page-secondary)' }}
            data-record-planet
          >
            {planet?.name ?? character.planet ?? 'Unknown world'}
          </span>
        </div>

        <span className="record-stamp" data-status={locked ? 'sealed' : status}>
          {locked ? 'Sealed' : STATUS_LABEL[status]}
        </span>
      </div>

      <PortraitPlate character={character} />

      <h2
        className="mt-5 text-balance font-semibold leading-[1.05] tracking-[0.01em] [font-family:var(--font-display)] [overflow-wrap:anywhere]"
        style={{ fontSize: 'clamp(28px, 3vw, 44px)', color: 'var(--text-on-page-primary)' }}
      >
        {character.name}
      </h2>

      {!locked && epithet && (
        <p
          className="mt-1 text-[15px] italic leading-snug [font-family:var(--font-display)]"
          style={{ color: 'var(--text-on-page-secondary)' }}
        >
          {epithet}
        </p>
      )}

      {locked ? (
        <p
          className="mt-5 text-[12px] italic leading-relaxed [font-family:var(--font-display)]"
          style={{ color: 'var(--text-on-page-tertiary)' }}
        >
          The identity ledger is sealed until the required books are read.
        </p>
      ) : (
        <IdentityLedger character={character} />
      )}
    </article>
  )
}

interface ResolvedRelationship {
  otherId: string
  otherName: string
  label: string
  other: Character
}

function relationshipPortrait(character: Character) {
  const portrait = getCharacterPortrait(character.name)
  const planet = PLANETS_BY_KEY.get(character.planet)
  const deceased = statusOf(character) === 'deceased'

  return (
    <span className="record-miniature" aria-hidden="true">
      {portrait ? (
        <img src={portrait} alt="" loading="lazy" decoding="async" className="record-miniature__image" />
      ) : (
        <Monogram name={character.name} planet={planet?.id} size={64} isDeceased={deceased} className="h-full w-full" />
      )}
    </span>
  )
}

function RecordLockedPanel({ character, onUnlock }: RecordSpreadProps) {
  const books = character.requiredBooks.map((id) => BOOKS_BY_ID.get(id)).filter(Boolean)

  return (
    <div data-locked="true" className="record-locked">
      <p
        className="text-[11px] uppercase tracking-[0.16em] [font-family:var(--font-ui)]"
        style={{ color: 'var(--text-on-page-tertiary)' }}
      >
        Restricted archive copy
      </p>
      <h3
        className="mt-2 text-[clamp(24px,2.4vw,34px)] font-semibold leading-tight [font-family:var(--font-display)]"
        style={{ color: 'var(--text-on-page-primary)' }}
      >
        Spoilers locked
      </h3>
      <p
        className="mt-3 max-w-[40ch] text-[14px] leading-relaxed [font-family:var(--font-display)]"
        style={{ color: 'var(--text-on-page-secondary)' }}
      >
        This record opens once every book it requires has been read. The name, portrait and origin remain visible so you
        know whose page you have found.
      </p>

      <div className="mt-5 border-t pt-4" style={{ borderColor: 'rgba(80,60,40,0.18)' }}>
        <p
          className="text-[11px] uppercase tracking-[0.12em] [font-family:var(--font-ui)]"
          style={{ color: 'var(--text-on-page-tertiary)' }}
        >
          Required reading
        </p>
        <ul className="mt-2 space-y-1">
          {books.map((book) =>
            book ? (
              <li key={book.id}>
                <Link to={`/books/${book.id}`} className="record-link text-[13px]">
                  {book.title}
                </Link>
              </li>
            ) : null,
          )}
        </ul>
      </div>

      {onUnlock && (
        <button
          type="button"
          onClick={onUnlock}
          className="mt-6 cursor-pointer border border-[color:var(--text-on-page-accent)] bg-transparent px-4 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors duration-150 hover:bg-[color:var(--surface-page-inset)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring-on-page)] [font-family:var(--font-ui)]"
          style={{ color: 'var(--text-on-page-primary)' }}
        >
          Mark books as read
        </button>
      )}
    </div>
  )
}

export function RecordRightPage({ character, locked = false, onUnlock }: RecordSpreadProps) {
  const relationships = useMemo<ResolvedRelationship[]>(() => {
    const resolved: ResolvedRelationship[] = []
    for (const link of relationshipsFor(character.id)) {
      const other = CHARACTERS_BY_ID.get(link.otherId)
      if (!other) continue
      resolved.push({ otherId: other.id, otherName: other.name, label: link.label, other })
    }
    return resolved
  }, [character.id])

  if (locked) return <RecordLockedPanel character={character} locked onUnlock={onUnlock} />

  const books = character.requiredBooks.map((id) => BOOKS_BY_ID.get(id)).filter(Boolean)

  return (
    <article className="record-biography">
      <section className="record-biography__summary" aria-labelledby={`record-bio-${character.id}`}>
        <h3
          id={`record-bio-${character.id}`}
          className="record-section-heading text-[11px] uppercase tracking-[0.16em] [font-family:var(--font-ui)]"
          style={{ color: 'var(--text-on-page-tertiary)' }}
        >
          Biography
        </h3>
        <p className="record-bio mt-2">{character.description || 'No biography has been recorded.'}</p>
      </section>

      <div className="record-reference-grid">
        <section aria-labelledby={`record-books-${character.id}`} className="record-reference">
          <h3
            id={`record-books-${character.id}`}
            className="record-section-heading text-[11px] uppercase tracking-[0.16em] [font-family:var(--font-ui)]"
            style={{ color: 'var(--text-on-page-tertiary)' }}
          >
            Appears in
          </h3>
          {books.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {books.map((book) =>
                book ? (
                  <li key={book.id}>
                    <Link to={`/books/${book.id}`} className="record-link text-[13px]">
                      {book.title}
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          ) : (
            <p className="record-empty-note">
              <span aria-hidden="true">—</span>
              No book references recorded.
            </p>
          )}
        </section>

        <section aria-labelledby={`record-rels-${character.id}`} className="record-reference">
          <h3
            id={`record-rels-${character.id}`}
            className="record-section-heading text-[11px] uppercase tracking-[0.16em] [font-family:var(--font-ui)]"
            style={{ color: 'var(--text-on-page-tertiary)' }}
          >
            Relationships
          </h3>
          {relationships.length > 0 ? (
            <ul className="mt-3 grid grid-cols-1 gap-2">
              {relationships.map((relationship) => (
                <li key={relationship.otherId}>
                  <Link
                    to={`/characters?spread=${encodeURIComponent(recordSpreadId(relationship.otherId))}`}
                    className="group flex min-w-0 items-center gap-2.5 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring-on-page)]"
                  >
                    {relationshipPortrait(relationship.other)}
                    <span className="min-w-0">
                      <span
                        className="record-relationship__name block truncate text-[13px] leading-snug transition-colors duration-150 [font-family:var(--font-display)]"
                        style={{ color: 'var(--text-on-page-primary)' }}
                      >
                        {relationship.otherName}
                      </span>
                      <span
                        className="mt-0.5 block truncate text-[11px] leading-snug [font-family:var(--font-ui)]"
                        style={{ color: 'var(--text-on-page-tertiary)' }}
                      >
                        {relationship.label}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="record-empty-note">
              <span aria-hidden="true">—</span>
              No recorded relationships.
            </p>
          )}
        </section>
      </div>
    </article>
  )
}

/** A standalone two-leaf preview. The codex mounts the leaves separately. */
export default function RecordSpread(props: RecordSpreadProps) {
  return (
    <div className="grid gap-8 min-[900px]:grid-cols-2" data-record-spread={props.character.id}>
      <RecordLeftPage {...props} />
      <RecordRightPage {...props} />
    </div>
  )
}

/** Build the spread view consumed by the codex engine. */
export function buildRecordSpread(props: RecordSpreadProps): CodexSpreadView {
  return {
    id: recordSpreadId(props.character.id),
    title: props.character.name,
    left: <RecordLeftPage {...props} />,
    right: <RecordRightPage {...props} />,
    recordId: props.character.id,
  }
}
