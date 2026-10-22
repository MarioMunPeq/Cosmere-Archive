/**
 * The leaves of a catalogued volume.
 *
 * This is not the old reader's generic page generator. A catalogue entry has a
 * shape: the cover mounted as a plate and a ledger on the left, the synopsis
 * with its drop cap and the first faces on the right, then the people, the
 * worlds, the investiture and the shelf's own cross-references. Everything is
 * split into leaves that a page can hold, so no paragraph is cut off and no
 * page fades out at the bottom.
 */

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import BookCover from '@/components/common/BookCover'
import Monogram from '@/components/common/Monogram'
import { PlanetSigil } from '@/components/records/RecordSpread'
import { ALL_CHARACTERS, BOOKS, PLANETS, SAGA_BY_ID } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import { getBookArchiveEntry } from '@/data/static/book-archive-entries'
import { getCharacterPortrait } from '@/utils/character-portrait'
import { recordSpreadId } from '@/utils/codex-records'
import type { CodexSpreadView } from '@/components/codex/Codex'
import type { Book } from '@/data/static/books'
import type { Character } from '@/types/character'
import type { Planet } from '@/types/planet'

const PLANETS_BY_KEY = new Map<string, Planet>()
for (const planet of PLANETS) {
  PLANETS_BY_KEY.set(planet.id, planet)
  PLANETS_BY_KEY.set(planet.name, planet)
}

const FIRST_SYNOPSIS = 620
const NEXT_SYNOPSIS = 960
const CHARACTERS_PER_LEAF = 2
const WORLDS_PER_LEAF = 3
const SYSTEMS_PER_LEAF = 2

export interface LibraryLeaf {
  id: string
  title: string
  header: string
  folio: string
  node: ReactNode
}

export interface LibraryLeafOptions {
  /** A phone page has less room before the faces; a shorter first leaf keeps
      the medallions on the same page instead of below the fold. */
  firstSynopsis?: number
  nextSynopsis?: number
}

export function splitText(text: string, firstLimit = FIRST_SYNOPSIS, nextLimit = NEXT_SYNOPSIS): string[] {
  const clean = text.trim()
  if (!clean) return ['']

  const sentences = clean.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) ?? [clean]
  const chunks: string[] = []
  let current = ''
  let limit = firstLimit

  for (const raw of sentences) {
    const sentence = raw.trim()
    if (!sentence) continue
    if (current && current.length + sentence.length + 1 > limit) {
      chunks.push(current)
      current = ''
      limit = nextLimit
    }
    current = current ? `${current} ${sentence}` : sentence
  }

  if (current) chunks.push(current)
  return chunks.length > 0 ? chunks : [clean]
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let index = 0; index < items.length; index += size) out.push(items.slice(index, index + size))
  return out
}

function sagaName(book: Book): string {
  return SAGA_BY_ID.get(book.saga)?.name ?? book.saga
}

function firstName(name: string): string {
  return name.split(' ')[0] ?? name
}

function PortraitDisc({ character, size = 54 }: { character: Character; size?: number }) {
  const portrait = getCharacterPortrait(character.name)
  const planet = PLANETS_BY_KEY.get(character.planet)
  const deceased = character.status === 'deceased' || character.died != null

  return (
    <span className="library-portrait-disc" style={{ width: size, height: size }} aria-hidden="true">
      {portrait ? (
        <img src={portrait} alt="" loading="lazy" decoding="async" className="library-portrait-disc__image" />
      ) : (
        <Monogram name={character.name} planet={planet?.id} size={size} isDeceased={deceased} />
      )}
    </span>
  )
}

function CharacterMedallion({ character }: { character: Character }) {
  return (
    <Link to={`/characters?spread=${encodeURIComponent(recordSpreadId(character.id))}`} className="library-medallion">
      <PortraitDisc character={character} />
      <span className="library-medallion__name">{firstName(character.name)}</span>
    </Link>
  )
}

function CoverLeaf({ book, planets }: { book: Book; planets: Planet[] }) {
  const [broken, setBroken] = useState(false)
  const archive = getBookArchiveEntry(book.id)
  const series = sagaName(book)
  const planet = planets[0]
  const src = `${import.meta.env.BASE_URL}${book.cover}`

  return (
    <article className="library-cover-leaf">
      <p className="library-kicker">
        {archive?.volumeNumber ?? 'Unaccessioned'} · {series}
      </p>

      <div className="record-portrait library-cover-plate">
        <span className="record-portrait__corner record-portrait__corner--tl" aria-hidden="true" />
        <span className="record-portrait__corner record-portrait__corner--tr" aria-hidden="true" />
        <span className="record-portrait__corner record-portrait__corner--bl" aria-hidden="true" />
        <span className="record-portrait__corner record-portrait__corner--br" aria-hidden="true" />
        <div className="record-portrait__frame library-cover-plate__frame">
          {broken ? (
            <BookCover book={book} size="lg" />
          ) : (
            <img
              src={src}
              alt={`Cover of ${book.title}`}
              loading="eager"
              decoding="async"
              className="record-portrait__image library-cover-plate__image"
              onError={() => setBroken(true)}
              data-library-cover={book.id}
            />
          )}
        </div>
      </div>

      <h2 className="library-book-title">{book.title}</h2>
      <p className="library-book-saga">
        {series} · volume {book.order}
      </p>

      <dl className="record-ledger library-ledger">
        <div className="record-ledger__row">
          <dt>Accession</dt>
          <dd>
            <span className="record-code">{archive?.volumeNumber ?? 'Unrecorded'}</span>
          </dd>
        </div>
        <div className="record-ledger__row">
          <dt>Published</dt>
          <dd>{book.year ?? 'Unrecorded'}</dd>
        </div>
        <div className="record-ledger__row">
          <dt>Extent</dt>
          <dd>{book.wordCount ? `${book.wordCount.toLocaleString()} words` : 'Unrecorded'}</dd>
        </div>
        <div className="record-ledger__row">
          <dt>World</dt>
          <dd>
            {planet ? (
              <Link to={`/celestial-charts?focus=planet&id=${planet.id}`} className="record-link">
                {planet.name}
              </Link>
            ) : (
              'Unrecorded'
            )}
          </dd>
        </div>
        <div className="record-ledger__row">
          <dt>Classification</dt>
          <dd>
            <span className="record-code">{archive?.classification ?? series}</span>
          </dd>
        </div>
      </dl>

      <p className="library-handnote">A reading copy, kept on the {series} shelf.</p>
    </article>
  )
}

function SynopsisLeaf({
  text,
  first,
  characters,
  planet,
  totalCharacters,
}: {
  text: string
  first: boolean
  characters: Character[]
  planet?: Planet
  totalCharacters: number
}) {
  const more = totalCharacters - characters.length

  return (
    <article className="library-synopsis-leaf">
      <h2 className="library-page-title">{first ? 'Synopsis' : 'Synopsis, continued'}</h2>
      <p className={first ? 'record-bio library-synopsis library-synopsis--first' : 'library-synopsis'}>{text}</p>

      {first && planet && (
        <Link to={`/celestial-charts?focus=planet&id=${planet.id}`} className="library-world-link">
          <PlanetSigil planet={planet} />
          <span>
            <span className="library-world-link__name">{planet.name}</span>
            <span className="library-world-link__note">{planet.shard ?? 'World entry'} · open the atlas</span>
          </span>
        </Link>
      )}

      {first && characters.length > 0 && (
        <div className="library-faces">
          <p className="library-section-kicker">Faces in this volume</p>
          <div className="library-medallions">
            {characters.map((character) => (
              <CharacterMedallion key={character.id} character={character} />
            ))}
          </div>
          {more > 0 && (
            <p className="library-more">
              and {more} more in the{' '}
              <Link to="/characters" className="record-link">
                Biographical Archives
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </article>
  )
}

function DramatisLeaf({ characters, page, pages }: { characters: Character[]; page: number; pages: number }) {
  return (
    <article className="library-dramatis-leaf">
      <h2 className="library-page-title">{page === 0 ? 'Dramatis Personae' : 'Dramatis Personae, continued'}</h2>
      <p className="library-page-intro">
        {page === 0
          ? 'The principal figures recorded for this volume. Every name resolves to its full record.'
          : 'The register continues.'}
      </p>

      {characters.map((character) => (
        <section key={character.id} className="library-character">
          <Link
            to={`/characters?spread=${encodeURIComponent(recordSpreadId(character.id))}`}
            className="library-character__portrait"
            aria-label={`Open the record for ${character.name}`}
          >
            <PortraitDisc character={character} size={58} />
          </Link>
          <div className="library-character__text">
            <h3 className="library-character__name">
              <Link to={`/characters?spread=${encodeURIComponent(recordSpreadId(character.id))}`}>
                {character.name}
              </Link>
            </h3>
            {character.titles?.[0] && <p className="library-character__epithet">{character.titles[0]}</p>}
            <p className="library-character__body">{character.description}</p>
            <p className="library-character__more">
              <Link
                to={`/characters?spread=${encodeURIComponent(recordSpreadId(character.id))}`}
                className="record-link"
              >
                Open the record
              </Link>
            </p>
          </div>
        </section>
      ))}

      <p className="library-leaf-count">
        {page + 1} of {pages}
      </p>
    </article>
  )
}

function WorldLeaf({ planets, page, pages }: { planets: Planet[]; page: number; pages: number }) {
  return (
    <article className="library-world-leaf">
      <h2 className="library-page-title">{page === 0 ? 'The World' : 'The World, continued'}</h2>
      <p className="library-page-intro">Where this volume is set, as the atlas records it.</p>

      {planets.map((planet) => (
        <Link key={planet.id} to={`/celestial-charts?focus=planet&id=${planet.id}`} className="library-world-card">
          <PlanetSigil planet={planet} />
          <span className="library-world-card__text">
            <strong>{planet.name}</strong>
            <span>{planet.shard ?? 'World entry'}</span>
          </span>
          <span className="library-world-card__arrow" aria-hidden="true">
            →
          </span>
        </Link>
      ))}

      <p className="library-leaf-count">
        {page + 1} of {pages}
      </p>
    </article>
  )
}

function InvestitureLeaf({
  systems,
  page,
  pages,
}: {
  systems: (typeof MAGIC_SYSTEMS)[number][]
  page: number
  pages: number
}) {
  return (
    <article className="library-investiture-leaf">
      <h2 className="library-page-title">{page === 0 ? 'Investiture' : 'Investiture, continued'}</h2>
      <p className="library-page-intro">The manifestations of investiture indexed to this volume.</p>

      {systems.map((system) => (
        <section key={system.id} className="library-system">
          <h3 className="library-system__name">
            <Link to={`/magic?system=${system.id}`}>{system.name}</Link>
          </h3>
          <p className="library-system__body">{system.description}</p>
          <p className="library-system__more">
            <Link to={`/magic?system=${system.id}`} className="record-link">
              Open the Arcanum entry
            </Link>
          </p>
        </section>
      ))}

      <p className="library-leaf-count">
        {page + 1} of {pages}
      </p>
    </article>
  )
}

function ArchiveLeaf({ book }: { book: Book }) {
  const archive = getBookArchiveEntry(book.id)
  if (!archive) return null

  return (
    <article className="library-archive-leaf">
      <h2 className="library-page-title">Archivist&apos;s Note</h2>
      <p className="library-kicker">{archive.classification}</p>
      <p className="library-archive-body">{archive.archiveDescription}</p>
      <p className="library-handnote">Filed under {archive.volumeNumber}.</p>
    </article>
  )
}

function ColophonLeaf({ book }: { book: Book }) {
  return (
    <article className="library-colophon-leaf">
      <h2 className="library-page-title">Colophon</h2>
      <p className="library-archive-body">
        {book.title} is held in the Library of Jasnah as a working reading copy. The text is set in Garamond; the
        records are drawn from the archive&apos;s own ledgers.
      </p>
      <p className="library-handnote">Return the volume to its shelf when you are done.</p>
    </article>
  )
}

function ConnectionsLeaf({ book, related }: { book: Book; related: Book[] }) {
  return (
    <article className="library-connections-leaf">
      <h2 className="library-page-title">On This Shelf</h2>
      <p className="library-page-intro">The other volumes that stand beside this one, in reading order.</p>

      <ol className="library-related">
        {related.map((other) => (
          <li key={other.id}>
            <Link to={`/library?book=${other.id}`} className="library-related__link">
              <span className="library-related__vol">{String(other.order).padStart(2, '0')}</span>
              <span>
                <strong>{other.title}</strong>
                <span>{other.year ?? 'Unrecorded'}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="library-connections__note">
        Full catalogue entry:{' '}
        <Link to={`/books/${book.id}`} className="record-link">
          {book.title}
        </Link>
        .
      </p>
    </article>
  )
}

export function buildLibraryLeaves(book: Book, options: LibraryLeafOptions = {}): LibraryLeaf[] {
  const series = sagaName(book)
  const archive = getBookArchiveEntry(book.id)
  const characters = ALL_CHARACTERS.filter((character) => character.requiredBooks?.includes(book.id))
  const planets = PLANETS.filter((planet) => planet.books?.includes(book.id))
  const systems = MAGIC_SYSTEMS.filter((system) => system.bookIds.includes(book.id))
  const related = BOOKS.filter((other) => other.saga === book.saga && other.id !== book.id).sort(
    (a, b) => a.order - b.order,
  )

  const leaves: LibraryLeaf[] = [
    {
      id: `${book.id}-cover`,
      title: book.title,
      header: 'Volume record',
      folio: 'i',
      node: <CoverLeaf book={book} planets={planets} />,
    },
  ]

  const synopsis = splitText(
    book.description ?? '',
    options.firstSynopsis ?? FIRST_SYNOPSIS,
    options.nextSynopsis ?? NEXT_SYNOPSIS,
  )
  synopsis.forEach((text, index) => {
    const first = index === 0
    leaves.push({
      id: `${book.id}-synopsis-${index + 1}`,
      title: first ? 'Synopsis' : 'Synopsis, continued',
      header: first ? 'Synopsis' : 'Synopsis, continued',
      folio: String(index + 1),
      node: (
        <SynopsisLeaf
          text={text}
          first={first}
          characters={first ? characters.slice(0, 4) : []}
          planet={planets[0]}
          totalCharacters={characters.length}
        />
      ),
    })
  })

  const characterPages = chunk(characters, CHARACTERS_PER_LEAF)
  characterPages.forEach((group, index) => {
    leaves.push({
      id: `${book.id}-dramatis-${index + 1}`,
      title: 'Dramatis Personae',
      header: 'Dramatis Personae',
      folio: String(synopsis.length + index + 1),
      node: <DramatisLeaf characters={group} page={index} pages={characterPages.length} />,
    })
  })

  const worldPages = chunk(planets, WORLDS_PER_LEAF)
  worldPages.forEach((group, index) => {
    leaves.push({
      id: `${book.id}-world-${index + 1}`,
      title: 'The World',
      header: 'The World',
      folio: String(synopsis.length + characterPages.length + index + 1),
      node: <WorldLeaf planets={group} page={index} pages={worldPages.length} />,
    })
  })

  const systemPages = chunk(systems, SYSTEMS_PER_LEAF)
  systemPages.forEach((group, index) => {
    leaves.push({
      id: `${book.id}-investiture-${index + 1}`,
      title: 'Investiture',
      header: 'Investiture',
      folio: String(synopsis.length + characterPages.length + worldPages.length + index + 1),
      node: <InvestitureLeaf systems={group} page={index} pages={systemPages.length} />,
    })
  })

  if (archive) {
    leaves.push({
      id: `${book.id}-archive`,
      title: "Archivist's Note",
      header: "Archivist's Note",
      folio: String(synopsis.length + characterPages.length + worldPages.length + systemPages.length + 1),
      node: <ArchiveLeaf book={book} />,
    })
  }

  if (related.length > 0) {
    leaves.push({
      id: `${book.id}-shelf`,
      title: 'On This Shelf',
      header: series,
      folio: String(synopsis.length + characterPages.length + worldPages.length + systemPages.length + 2),
      node: <ConnectionsLeaf book={book} related={related} />,
    })
  }

  return leaves
}

/** The two-page edition used by the desk. */
export function buildLibrarySpreads(book: Book): CodexSpreadView[] {
  const leaves = buildLibraryLeaves(book)
  const [cover, ...rest] = leaves
  const firstRight = rest[0]

  const spreads: CodexSpreadView[] = [
    {
      id: `${book.id}-spread-1`,
      title: firstRight?.title ?? book.title,
      left: cover?.node ?? null,
      right: firstRight?.node ?? null,
      leftHeader: cover?.header,
      rightHeader: firstRight?.header,
      leftFolio: cover?.folio,
      rightFolio: firstRight?.folio,
    },
  ]

  const tail = rest.slice(1)
  if (tail.length % 2 === 1) {
    tail.push({
      id: `${book.id}-colophon`,
      title: 'Colophon',
      header: 'Colophon',
      folio: '',
      node: <ColophonLeaf book={book} />,
    })
  }

  for (let index = 0; index < tail.length; index += 2) {
    const left = tail[index]
    const right = tail[index + 1]
    spreads.push({
      id: `${book.id}-spread-${spreads.length + 1}`,
      title: left?.title ?? right?.title ?? book.title,
      left: left?.node ?? null,
      right: right?.node ?? null,
      leftHeader: left?.header,
      rightHeader: right?.header,
      leftFolio: left?.folio,
      rightFolio: right?.folio,
    })
  }

  return spreads
}

/** The single-page edition used on a phone. */
export function buildLibraryMobileSpreads(book: Book): CodexSpreadView[] {
  return buildLibraryLeaves(book, { firstSynopsis: 320, nextSynopsis: 700 }).map((leaf) => ({
    id: leaf.id,
    title: leaf.title,
    left: null,
    right: leaf.node,
    rightHeader: leaf.header,
    rightFolio: leaf.folio,
  }))
}
