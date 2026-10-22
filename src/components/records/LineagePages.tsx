/**
 * LineagePages — the leaves of Volume II.
 *
 * This volume is deliberately a sibling of the record book rather than a tab
 * inside it. A record is a life; a house is a structure that outlives one. The
 * left leaf of a house spread is the heraldic plate, the right leaf is the
 * fold-out chart. Connections get their own plate and ledger, so the reader can
 * follow a bond back into Volume I without losing the page they were on.
 */

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Monogram, { initialsOf } from '@/components/common/Monogram'
import { ALL_CHARACTERS } from '@/data/static'
import { getCharacterPortrait } from '@/utils/character-portrait'
import { relationshipsFor } from '@/utils/relationships'
import { recordSpreadId } from '@/utils/codex-records'
import type { Character } from '@/types/character'
import type { FamilyDefinition, FamilyMember } from '@/types/family'

export { default as FamilyTreeChart } from './LineagePlate'

export interface ConnectedEntry {
  character: Character
  count: number
}

const CHARACTERS_BY_ID = new Map(ALL_CHARACTERS.map((character) => [character.id, character]))
const HOUSE_ROOT = /\b(?:house|houses|circle|crowns|dynasty|kin)\b/i

/** A house crest is not a person; the chart never puts a death mark on it. */
function memberIsDeceased(family: FamilyDefinition, member: FamilyMember): boolean {
  const crest =
    family.rootIds.includes(member.id) &&
    !member.characterId &&
    !getCharacterPortrait(member.name) &&
    HOUSE_ROOT.test(member.name)
  if (crest) return false

  const character = member.characterId ? CHARACTERS_BY_ID.get(member.characterId) : undefined
  return Boolean(member.isDeceased || character?.status === 'deceased')
}

const KICKER = 'text-[12px] uppercase tracking-[0.16em] [font-family:var(--font-ui)]'
const BODY = 'text-[13px] leading-relaxed [font-family:var(--font-display)]'
const SMALL = 'text-[12px] leading-snug [font-family:var(--font-ui)]'
const INK = 'var(--text-on-page-primary)'
const MUTED = 'var(--text-on-page-secondary)'
const FAINT = 'var(--text-on-page-tertiary)'
const RULE = 'rgba(80,60,40,0.16)'

function DeathMark() {
  return (
    <span className="text-[12px] leading-snug [font-family:var(--font-display)]" style={{ color: FAINT }}>
      <span aria-hidden="true">†</span>
      <span className="sr-only">, deceased</span>
    </span>
  )
}

/* ------------------------------------------------------------------ shared */

function HouseSigil({ family, size = 42 }: { family: FamilyDefinition; size?: number }) {
  const seed = [...family.id].reduce((sum, character) => sum + character.charCodeAt(0), 0)
  const spokes = 6 + (seed % 5)

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className="shrink-0"
      style={{ color: family.color }}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
      <circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" strokeOpacity="0.26" strokeWidth="1" />
      {Array.from({ length: spokes }, (_, index) => {
        const angle = (index / spokes) * Math.PI * 2 - Math.PI / 2
        return (
          <line
            key={index}
            x1={24 + Math.cos(angle) * 8}
            y1={24 + Math.sin(angle) * 8}
            x2={24 + Math.cos(angle) * 19}
            y2={24 + Math.sin(angle) * 19}
            stroke="currentColor"
            strokeOpacity="0.52"
            strokeWidth="1"
          />
        )
      })}
      <circle cx="24" cy="24" r="4.2" fill="currentColor" fillOpacity="0.75" />
    </svg>
  )
}

function PageHeading({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
  return (
    <header className="mb-5">
      <p className={KICKER} style={{ color: FAINT }}>
        {kicker}
      </p>
      <h2
        className="mt-1 text-[clamp(20px,2vw,28px)] font-semibold leading-tight tracking-[0.02em] [font-family:var(--font-display)]"
        style={{ color: INK }}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-2 max-w-[44ch] italic ${BODY}`} style={{ color: MUTED }}>
          {description}
        </p>
      )}
    </header>
  )
}

function CrossVolume({ onOpenRecords }: { onOpenRecords: () => void }) {
  return (
    <div className="mt-6 border-t pt-3" style={{ borderColor: RULE }}>
      <p className={KICKER} style={{ color: FAINT }}>
        Volume I
      </p>
      <p className="mt-0.5 text-[13px] [font-family:var(--font-display)]" style={{ color: MUTED }}>
        Biographical Records
      </p>
      <button
        type="button"
        onClick={onOpenRecords}
        className="mt-1 cursor-pointer border-0 bg-transparent p-0 text-left text-[12px] underline underline-offset-2 [font-family:var(--font-ui)]"
        style={{ color: 'var(--text-on-page-link)' }}
      >
        93 lives — open the record volume →
      </button>
    </div>
  )
}

/* --------------------------------------------------------------- contents */

interface ContentsProps {
  families: readonly FamilyDefinition[]
  connections: readonly ConnectedEntry[]
  onOpenBloodlines: () => void
  onOpenConnections: () => void
  onOpenFamily: (familyId: string) => void
  onOpenConnection: (characterId: string) => void
  onOpenRecords: () => void
}

export function LineagesContents({
  families,
  connections,
  onOpenBloodlines,
  onOpenConnections,
  onOpenFamily,
  onOpenConnection,
  onOpenRecords,
}: ContentsProps) {
  return (
    <div data-lineages-contents>
      <h2 className={`mb-5 ${KICKER}`} style={{ color: FAINT }}>
        Contents
      </h2>

      <header className="mb-5">
        <p className={KICKER} style={{ color: FAINT }}>
          Volume II
        </p>
        <h3
          className="mt-1 text-[clamp(18px,1.7vw,24px)] font-bold leading-tight tracking-[0.04em] [font-family:var(--font-display)]"
          style={{ color: INK }}
        >
          Bloodlines & Connections
        </h3>
        <p className={`mt-2 max-w-[42ch] italic ${BODY}`} style={{ color: MUTED }}>
          Seven houses and the bonds recorded between their people. The charts are fold-outs; the ledger opposite each
          plate follows a thread back into the records.
        </p>
      </header>

      <section aria-labelledby="lineages-contents-bloodlines">
        <button
          type="button"
          onClick={onOpenBloodlines}
          className="group flex w-full cursor-pointer items-baseline justify-between gap-2 border-b bg-transparent p-0 pb-1 text-left"
          style={{ borderColor: RULE }}
        >
          <span
            id="lineages-contents-bloodlines"
            className="text-[12px] font-bold tracking-[0.04em] [font-family:var(--font-display)]"
            style={{ color: MUTED }}
          >
            Bloodlines
          </span>
          <span className={SMALL} style={{ color: FAINT }}>
            {families.length} houses
          </span>
        </button>
        <ul className="mt-1.5 grid grid-cols-2 gap-x-5">
          {families.map((family) => (
            <li key={family.id}>
              <button
                type="button"
                onClick={() => onOpenFamily(family.id)}
                className="w-full cursor-pointer border-0 bg-transparent p-0 text-left text-[12px] leading-[1.55] underline-offset-2 hover:underline [font-family:var(--font-display)]"
                style={{ color: MUTED }}
              >
                {family.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="lineages-contents-connections" className="mt-5">
        <button
          type="button"
          onClick={onOpenConnections}
          className="group flex w-full cursor-pointer items-baseline justify-between gap-2 border-b bg-transparent p-0 pb-1 text-left"
          style={{ borderColor: RULE }}
        >
          <span
            id="lineages-contents-connections"
            className="text-[12px] font-bold tracking-[0.04em] [font-family:var(--font-display)]"
            style={{ color: MUTED }}
          >
            Connections
          </span>
          <span className={SMALL} style={{ color: FAINT }}>
            {connections.length} people
          </span>
        </button>
        <ul className="mt-1.5 grid grid-cols-2 gap-x-5">
          {connections.map(({ character, count }) => (
            <li key={character.id}>
              <button
                type="button"
                onClick={() => onOpenConnection(character.id)}
                className="w-full cursor-pointer border-0 bg-transparent p-0 text-left text-[12px] leading-[1.55] underline-offset-2 hover:underline [font-family:var(--font-display)]"
                style={{ color: MUTED }}
              >
                {character.name}
                <span className="ml-1 [font-family:var(--font-ui)]" style={{ color: FAINT }}>
                  {count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <CrossVolume onOpenRecords={onOpenRecords} />
    </div>
  )
}

export function LineagesTitlePage({ familyCount, bondCount }: { familyCount: number; bondCount: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center" data-lineages-title>
      <p className={KICKER} style={{ color: FAINT }}>
        Volume II
      </p>
      <h2
        className="mt-3 max-w-[13ch] text-[clamp(30px,3.4vw,54px)] font-semibold leading-[1.02] tracking-[0.01em] [font-family:var(--font-display)]"
        style={{ color: INK }}
      >
        Bloodlines &amp; Connections
      </h2>
      <div className="mt-5 h-px w-16" style={{ backgroundColor: 'var(--text-on-page-accent)' }} aria-hidden="true" />
      <p className={`mt-5 max-w-[34ch] italic ${BODY}`} style={{ color: MUTED }}>
        {familyCount} houses, their dead and their living, and {bondCount} people whose recorded bonds cross the
        archive. Read a lineage from its founder down; read a connection from either end.
      </p>
      <p className={`mt-6 ${KICKER}`} style={{ color: FAINT }}>
        Fold-out charts · {familyCount} houses · {bondCount} people
      </p>
    </div>
  )
}

/* --------------------------------------------------------------- bloodlines */

export function BloodlinesIndex({
  families,
  onOpenFamily,
}: {
  families: readonly FamilyDefinition[]
  onOpenFamily: (familyId: string) => void
}) {
  return (
    <div>
      <PageHeading
        kicker="Chapter I"
        title="Bloodlines"
        description="Houses are read from the founder down. A marriage is drawn in the house colour; a parent-to-child line is ink."
      />
      <nav aria-label="Families">
        <ul className="space-y-1">
          {families.map((family) => (
            <li key={family.id}>
              <button
                type="button"
                onClick={() => onOpenFamily(family.id)}
                className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-0 py-2 text-left"
              >
                <HouseSigil family={family} size={30} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] [font-family:var(--font-display)]" style={{ color: INK }}>
                    {family.name}
                  </span>
                  <span className={`mt-0.5 block ${SMALL}`} style={{ color: FAINT }}>
                    {family.members.length} members
                  </span>
                </span>
                <span className={SMALL} style={{ color: FAINT }} aria-hidden="true">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export function BloodlinesOverview({
  families,
  onOpenFamily,
}: {
  families: readonly FamilyDefinition[]
  onOpenFamily: (familyId: string) => void
}) {
  return (
    <div>
      <PageHeading
        kicker="Chapter I"
        title="Houses of the Cosmere"
        description="The chart opposite each plate is drawn from parentage, not from names. A house is a record of who bore whom, and of who married into the line."
      />
      <div className="grid grid-cols-2 gap-3">
        {families.map((family) => (
          <button
            key={family.id}
            type="button"
            onClick={() => onOpenFamily(family.id)}
            className="group flex min-h-[112px] cursor-pointer flex-col items-center justify-center border bg-transparent px-3 py-4 text-center transition-colors duration-150 hover:bg-[color:var(--surface-page-inset)]"
            style={{ borderColor: RULE }}
          >
            <HouseSigil family={family} size={38} />
            <span className="mt-2 text-[12px] leading-tight [font-family:var(--font-display)]" style={{ color: INK }}>
              {family.name}
            </span>
            <span className={`mt-1 ${SMALL}`} style={{ color: FAINT }}>
              {family.members.length}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function FamilyPlate({
  family,
  onOpenCharacter,
}: {
  family: FamilyDefinition
  onOpenCharacter: (characterId: string) => void
}) {
  const withRecords = family.members.filter((member) => member.characterId).length

  return (
    <article data-family-plate={family.id}>
      <div className="flex items-center gap-3">
        <HouseSigil family={family} size={38} />
        <div>
          <p className={KICKER} style={{ color: FAINT }}>
            House
          </p>
          <h2
            className="text-[clamp(24px,2.7vw,38px)] font-semibold leading-[1.05] [font-family:var(--font-display)]"
            style={{ color: INK }}
          >
            {family.name}
          </h2>
        </div>
      </div>

      <div className="mt-4 h-px w-16" style={{ backgroundColor: family.color, opacity: 0.7 }} aria-hidden="true" />

      <p className={`mt-4 ${BODY}`} style={{ color: MUTED }}>
        {family.description}
      </p>

      <dl className="mt-5 border-t pt-3" style={{ borderColor: RULE }}>
        <div className="flex items-baseline justify-between gap-4 py-1">
          <dt className={KICKER} style={{ color: FAINT }}>
            Members
          </dt>
          <dd className={SMALL} style={{ color: MUTED }}>
            {family.members.length}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-1">
          <dt className={KICKER} style={{ color: FAINT }}>
            With records
          </dt>
          <dd className={SMALL} style={{ color: MUTED }}>
            {withRecords}
          </dd>
        </div>
      </dl>

      <h3 className={`mt-5 border-t pt-3 ${KICKER}`} style={{ borderColor: RULE, color: FAINT }}>
        Members of the house
      </h3>
      <ul className="mt-1.5 space-y-0.5">
        {family.members.map((member) => {
          const deceased = memberIsDeceased(family, member)

          return (
            <li key={member.id}>
              {member.characterId ? (
                <button
                  type="button"
                  onClick={() => onOpenCharacter(member.characterId!)}
                  className="group flex w-full cursor-pointer items-baseline gap-2 border-0 bg-transparent px-0 py-0.5 text-left"
                >
                  <span
                    className="text-[13px] leading-snug transition-colors duration-150 group-hover:text-[color:var(--text-on-page-link)] [font-family:var(--font-display)]"
                    style={{ color: INK }}
                  >
                    {member.name}
                  </span>
                  {deceased && <DeathMark />}
                  <span className="ml-auto text-[12px]" style={{ color: FAINT }} aria-hidden="true">
                    →
                  </span>
                </button>
              ) : (
                <span className="flex items-baseline gap-2 py-0.5">
                  <span className="text-[13px] leading-snug [font-family:var(--font-display)]" style={{ color: MUTED }}>
                    {member.name}
                  </span>
                  {deceased && <DeathMark />}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <p className={`mt-4 border-t pt-3 ${SMALL}`} style={{ borderColor: RULE, color: FAINT }}>
        The fold-out opposite follows parentage. It is fitted to the page: drag to pan, use the letterpress marks to
        study a branch, and the page itself still turns from the fore-edge.
      </p>
    </article>
  )
}

/* --------------------------------------------------------------- connections */

export function ConnectionsIndex({
  connections,
  onOpenConnection,
}: {
  connections: readonly ConnectedEntry[]
  onOpenConnection: (characterId: string) => void
}) {
  return (
    <div>
      <PageHeading
        kicker="Chapter II"
        title="Connections"
        description="A connection belongs to a person, not to a line. Each entry below opens the ledger of one record's recorded bonds."
      />
      <nav aria-label="Characters by connections">
        <ul className="space-y-0.5">
          {connections.map(({ character, count }) => (
            <li key={character.id}>
              <button
                type="button"
                onClick={() => onOpenConnection(character.id)}
                className="flex w-full cursor-pointer items-baseline gap-2 border-0 bg-transparent px-0 py-1.5 text-left"
              >
                <span
                  className="min-w-0 flex-1 truncate text-[14px] [font-family:var(--font-display)]"
                  style={{ color: INK }}
                >
                  {character.name}
                </span>
                <span className={SMALL} style={{ color: FAINT }}>
                  {count}
                </span>
                <span className={SMALL} style={{ color: FAINT }} aria-hidden="true">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export function ConnectionsOverview({ bondCount }: { bondCount: number }) {
  return (
    <div>
      <PageHeading
        kicker="Chapter II"
        title="Recorded Bonds"
        description={`${bondCount} people in the archive have at least one recorded relationship. A bond is a fact with two ends; this volume gives each end its own ledger.`}
      />
      <div className="space-y-4">
        <p className={BODY} style={{ color: MUTED }}>
          The plate opposite a ledger is the same portrait plate used in Volume I, so a reader who follows a thread from
          a record recognises the page they arrive on.
        </p>
        <div className="border-t pt-4" style={{ borderColor: RULE }}>
          <p className={KICKER} style={{ color: FAINT }}>
            Reading the ledger
          </p>
          <ul className={`mt-2 space-y-1.5 ${BODY}`} style={{ color: MUTED }}>
            <li>— Each row names the other person and the recorded relationship.</li>
            <li>— The miniature is a portrait when the archive holds one, a monogram otherwise.</li>
            <li>— Every row opens that person's record in Volume I.</li>
          </ul>
        </div>
        <p className={`border-t pt-4 italic ${BODY}`} style={{ borderColor: RULE, color: FAINT }}>
          “A life is not a list of names. It is the shape those names make around it.”
        </p>
      </div>
    </div>
  )
}

function MiniPortrait({ character }: { character: Character }) {
  const portrait = getCharacterPortrait(character.name)
  const deceased = character.status === 'deceased'

  return (
    <span
      className="flex size-11 shrink-0 items-center justify-center overflow-hidden border"
      style={{ borderColor: RULE }}
    >
      {portrait ? (
        <img
          src={portrait}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover [filter:sepia(0.28)_grayscale(0.1)] transition-[filter] duration-300 group-hover:[filter:none]"
        />
      ) : (
        <Monogram
          name={character.name}
          planet={character.planet}
          size={44}
          isDeceased={deceased}
          className="h-full w-full"
        />
      )}
    </span>
  )
}

function ConnectionWeb({ character, others }: { character: Character; others: readonly Character[] }) {
  const shown = others.slice(0, 8)
  const radius = 58
  const cx = 140
  const cy = 86

  return (
    <svg viewBox="0 0 280 172" className="mb-4 h-auto w-full" aria-hidden="true" focusable="false">
      {shown.map((other, index) => {
        const angle = (index / Math.max(1, shown.length)) * Math.PI * 2 - Math.PI / 2
        const x = cx + Math.cos(angle) * radius
        const y = cy + Math.sin(angle) * radius
        return (
          <g key={other.id}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--text-on-page-secondary)" strokeWidth={1} opacity={0.35} />
            <circle cx={x} cy={y} r={14} fill="var(--surface-page-inset)" stroke="var(--border-interactive-on-page)" />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="var(--font-display)"
              fontSize={12}
              fill="var(--text-on-page-secondary)"
            >
              {initialsOf(other.name)}
            </text>
          </g>
        )
      })}
      <circle
        cx={cx}
        cy={cy}
        r={25}
        fill="var(--surface-page-raised)"
        stroke="var(--text-on-page-accent)"
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-display)"
        fontSize={14}
        fill="var(--text-on-page-primary)"
      >
        {initialsOf(character.name)}
      </text>
    </svg>
  )
}

export function ConnectionLedger({ character, locked = false }: { character: Character; locked?: boolean }) {
  const links = useMemo(() => {
    const rows: { other: Character; label: string }[] = []
    for (const link of relationshipsFor(character.id)) {
      const other = CHARACTERS_BY_ID.get(link.otherId)
      if (other) rows.push({ other, label: link.label })
    }
    return rows.sort((a, b) => a.other.name.localeCompare(b.other.name))
  }, [character.id])

  return (
    <article data-connections={character.id}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className={KICKER} style={{ color: FAINT }}>
          Connections
        </h3>
        <span className={SMALL} style={{ color: FAINT }}>
          {links.length} {links.length === 1 ? 'link' : 'links'}
        </span>
      </div>

      {links.length > 0 ? (
        <>
          <ConnectionWeb character={character} others={links.map((link) => link.other)} />
          <ul className="space-y-1">
            {links.map(({ other, label }, index) => (
              <li key={other.id}>
                <Link
                  to={`/characters?spread=${encodeURIComponent(recordSpreadId(other.id))}`}
                  className="group flex items-center gap-3 border-b py-2 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring-on-page)]"
                  style={{ borderColor: RULE }}
                >
                  <span
                    className="w-5 shrink-0 text-right text-[12px] tabular-nums [font-family:var(--font-ui)]"
                    style={{ color: FAINT }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <MiniPortrait character={other} />
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-[14px] leading-snug transition-colors duration-150 group-hover:text-[color:var(--text-on-page-link)] [font-family:var(--font-display)]"
                      style={{ color: INK }}
                    >
                      {other.name}
                    </span>
                    <span
                      className="mt-0.5 block truncate text-[12px] [font-family:var(--font-ui)]"
                      style={{ color: FAINT }}
                    >
                      {label}
                    </span>
                  </span>
                  <span className="text-[12px]" style={{ color: FAINT }} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className={`mt-4 ${BODY}`} style={{ color: MUTED }}>
          No recorded relationships.
        </p>
      )}

      {locked && (
        <p className={`mt-4 border-t pt-3 italic ${SMALL}`} style={{ borderColor: RULE, color: FAINT }}>
          This person's record in Volume I is sealed until the required books are read. The bond itself remains visible
          here.
        </p>
      )}
    </article>
  )
}
