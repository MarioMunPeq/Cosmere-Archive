/**
 * CharacterIndex — the A–Z index down the left of the Records screen.
 *
 * M4 · block 1. §5.4.2.
 *
 * Every measurement in that table exists because the previous index failed it.
 * The old one set colours inline as `rgba(45,26,14,0.6)` on parchment, which
 * put the planet chip at 2.21:1 and the search placeholder at 1.68:1 — both
 * measured in the audit, both now tokens with ratios written next to them in
 * tokens.css.
 *
 * Three things changed beyond the sizes:
 *
 *   - The rows are `<Link>`s, not `<div role="button" tabIndex={0}>`. The old
 *     ones were focusable divs with a keydown handler bolted on, which is what
 *     criterion R.6 forbids, and they could not be opened in a new tab or
 *     copied as a link. Selection lives in the URL, so it survives a reload
 *     and the browser's Back button does something sensible.
 *   - The search query is in the URL too. The old one was `useState`, which
 *     meant a filtered index could not be shared or restored.
 *   - The planet chip is the Shard's own colour as a 6px dot, at the ratio the
 *     table calls for, rather than three truncated letters of the world name in
 *     that colour at 55% alpha.
 */

import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getPlanetById, ALL_CHARACTERS } from '@/data/static'
import { SHARD_COLORS } from '@/data/static/static-data'
import type { Character } from '@/types/character'

interface Props {
  /** Called when the query changes, so the page can reset the card if needed. */
  onQueryChange?: (q: string) => void
}

/** Planet id → Shard colour, for the chip dot. */
function shardColourFor(planetId: string | undefined): string {
  if (!planetId) return SHARD_COLORS.roshar ?? '#6b7280'
  return SHARD_COLORS[planetId] ?? SHARD_COLORS.roshar ?? '#6b7280'
}

/**
 * The chip's label, in three letters.
 *
 * The column is 232–288px and the name needs the room. With the full world
 * name in the chip, "Ash (Shaw)", "Bluishwater" and "Clubs" were all truncated
 * at the second or third character — the chip was deciding which records you
 * could read, which is backwards. The full name stays on `title` for hover.
 */
function planetCode(name: string): string {
  const letters = name.replace(/[^a-zA-Z ]/g, '').trim()
  if (!letters) return '—'
  const words = letters.split(/\s+/)
  if (words.length === 1) return (words[0]!.slice(0, 3) || words[0]!).toUpperCase()
  return (words[0]!.charAt(0) + words[1]!.charAt(0)).toUpperCase()
}

function matches(c: Character, q: string): boolean {
  if (!q) return true
  const lq = q.toLowerCase()
  return (
    c.name.toLowerCase().includes(lq) || c.description.toLowerCase().includes(lq) || c.planet.toLowerCase().includes(lq)
  )
}

export default function CharacterIndex({ onQueryChange }: Props) {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const selected = params.get('character')

  const groups = useMemo(() => {
    const filtered = ALL_CHARACTERS.filter((c) => matches(c, query.trim()))
    // Sorting by name with a numeric collation so "Tress" and "The" behave and
    // accents land where a reader expects them.
    const sorted = [...filtered].sort((a, b) =>
      a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' }),
    )
    const byLetter = new Map<string, Character[]>()
    for (const c of sorted) {
      const letter = (c.name.charAt(0) || '#').toUpperCase()
      const bucket = byLetter.get(letter)
      if (bucket) bucket.push(c)
      else byLetter.set(letter, [c])
    }
    return [...byLetter.entries()]
  }, [query])

  const total = groups.reduce((n, [, chars]) => n + chars.length, 0)

  /** Writes the query and drops the current selection, which may not be in the result set. */
  const setQuery = (q: string) => {
    const next = new URLSearchParams(params)
    if (q) next.set('q', q)
    else next.delete('q')
    next.delete('character')
    setParams(next, { replace: true })
    onQueryChange?.(q)
  }

  /** A row link that keeps the query but points at this record. */
  const hrefFor = (id: string) => {
    const next = new URLSearchParams(params)
    if (query) next.set('q', query)
    next.set('character', id)
    return `?${next.toString()}`
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 px-lg pb-md pt-lg">
        <h2 className="text-micro font-semibold uppercase tracking-[0.14em] text-tertiary">Character Index</h2>

        <div className="relative mt-md">
          <label htmlFor="record-search" className="sr-only">
            Search records
          </label>
          <input
            id="record-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records"
            className="h-10 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-3 text-body text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 h-8 -translate-y-1/2 cursor-pointer rounded-sm px-2 text-meta text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              Clear
              <span className="sr-only"> search</span>
            </button>
          )}
        </div>

        <p className="mt-sm text-nano tabular-nums text-tertiary">
          {total} of {ALL_CHARACTERS.length} records
        </p>
      </header>

      <nav aria-label="Character index" className="min-h-0 flex-1 overflow-y-auto px-md pb-lg">
        {groups.length === 0 ? (
          <p className="px-2 py-lg text-meta text-tertiary">
            No records match “{query}”. Try a surname, a title, or a world.
          </p>
        ) : (
          groups.map(([letter, chars]) => (
            <section key={letter} className="mb-lg" aria-labelledby={`letter-${letter}`}>
              <div className="flex items-baseline gap-2">
                <h3 id={`letter-${letter}`} className="text-meta font-semibold text-tertiary">
                  {letter}
                </h3>
                <span className="text-nano tabular-nums text-tertiary">{chars.length}</span>
                <span aria-hidden className="h-px flex-1 border-b border-dotted border-[var(--border-subtle)]" />
              </div>

              <ul className="mt-xs">
                {chars.map((c) => {
                  const isActive = c.id === selected
                  const planet = getPlanetById(c.planet)
                  return (
                    <li key={c.id}>
                      <Link
                        to={hrefFor(c.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={[
                          'flex items-center gap-2 rounded-md py-xs pr-2 pl-3 transition-colors duration-[var(--dur-fast)]',
                          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                          isActive
                            ? 'bg-[var(--surface-raised)] text-[var(--text-primary)]'
                            : 'text-[var(--text-primary)] hover:bg-[var(--surface-inset)]',
                        ].join(' ')}
                      >
                        {/* The active mark: 3px of accent on the left edge. */}
                        <span
                          aria-hidden
                          className="-left-0 h-5 w-[3px] shrink-0 rounded-r-sm"
                          style={{ background: isActive ? 'var(--text-accent)' : 'transparent' }}
                        />
                        <span className="truncate text-body">{c.name}</span>
                        <span
                          aria-hidden
                          className="h-px min-w-md flex-1 border-b border-dotted border-[var(--border-subtle)]"
                        />
                        <span
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-[var(--surface-inset)] px-2 py-[3px] text-nano tabular-nums text-[var(--text-secondary)]"
                          title={planet?.name ?? c.planet}
                        >
                          <span
                            aria-hidden
                            className="size-[6px] rounded-full"
                            style={{ background: shardColourFor(c.planet) }}
                          />
                          {planetCode(planet?.name ?? c.planet)}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))
        )}
      </nav>
    </div>
  )
}
