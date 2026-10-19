/**
 * ConnectionsView — one character's relationships. M4 · block 4, §5.4.5.
 *
 * §5.4.5: "a graph of the record's relationships, not a mural. Each node is an
 * `<a>` with monogram + name."
 *
 * The previous implementation was a mural: a fixed 700×500 SVG with every
 * character the selected one has ever touched arranged on a circle, because
 * that is what the connections looked like when the relationship table was a
 * different shape. With the table as it is — pairs of ids and a label — a
 * radial graph is decoration over a list of eleven.
 *
 * So this is a list. It reads in one column, every entry is a link to the other
 * person's record, and the one fact that matters — what the relationship is —
 * is in the row rather than in a line colour.
 *
 * The coverage note is honest about the data: `CHARACTER_RELATIONSHIPS` links
 * twenty-five of the ninety-three records, so most cards here say so. That is
 * stated rather than hidden, because a viewer that renders an empty panel with
 * no explanation looks broken rather than incomplete.
 */

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Monogram from '@/components/common/Monogram'
import { ALL_CHARACTERS } from '@/data/static'
import { CHARACTER_RELATIONSHIPS } from '@/data/static/static-data'
import type { Character } from '@/types/character'

interface Props {
  /** The character whose relationships are shown. */
  character: Character
  /** Carries `?character=` through, so the list and the card stay in step. */
  buildHref?: (id: string) => string
}

const BY_ID = new Map(ALL_CHARACTERS.map((c) => [c.id, c]))

export default function ConnectionsView({ character, buildHref }: Props) {
  const relations = useMemo(() => {
    const out: { other: Character; kind: string }[] = []
    const seen = new Set<string>()
    for (const rel of CHARACTER_RELATIONSHIPS) {
      if (!rel.characters.includes(character.id)) continue
      for (const otherId of rel.characters) {
        if (otherId === character.id || seen.has(otherId)) continue
        const other = BY_ID.get(otherId)
        if (!other) continue
        seen.add(otherId)
        out.push({ other, kind: rel.label ?? rel.type })
      }
    }
    return out.sort((a, b) => a.other.name.localeCompare(b.other.name))
  }, [character.id])

  const hrefFor = (id: string) => buildHref?.(id) ?? `?character=${id}`

  return (
    <div
      data-connections={character.id}
      className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-base)] p-lg shadow-[var(--shadow-1)] min-[1024px]:p-xl"
    >
      <header>
        <h2 className="font-[var(--font-display)] text-[var(--text-h4)] text-[var(--text-primary)] min-[1024px]:text-[var(--text-h3)]">
          Connections of {character.name}
        </h2>
        <p className="mt-sm text-[var(--text-meta)] text-[var(--text-tertiary)]">
          {relations.length === 0
            ? 'No recorded relationships.'
            : `${relations.length} recorded ${relations.length === 1 ? 'link' : 'links'}.`}
        </p>
      </header>

      {relations.length > 0 && (
        <ul className="mt-lg space-y-2">
          {relations.map(({ other, kind }) => (
            <li key={other.id}>
              <Link
                to={hrefFor(other.id)}
                className={[
                  'flex items-center gap-md rounded-[var(--radius-md)] border border-[var(--border-subtle)]',
                  'bg-[var(--surface-inset)] px-md py-sm transition-colors duration-[var(--dur-fast)]',
                  'hover:border-[var(--border-interactive)] hover:bg-[var(--surface-raised)]',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                ].join(' ')}
              >
                <Monogram
                  name={other.name}
                  planet={other.planet}
                  size={36}
                  isDeceased={other.status === 'deceased'}
                  className="size-9 shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[var(--text-body-s)] text-[var(--text-primary)]">
                    {other.name}
                  </span>
                  <span className="block truncate text-[var(--text-nano)] uppercase tracking-[var(--ls-caps-wide)] text-[var(--text-tertiary)]">
                    {kind}
                  </span>
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="size-4 shrink-0 text-[var(--text-tertiary)]"
                  aria-hidden
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
