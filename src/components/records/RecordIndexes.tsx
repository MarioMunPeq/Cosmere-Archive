/**
 * The index columns for Bloodlines and Connections.
 *
 * M4 · block 4. Both are lists of `<Link>`-shaped controls in the shell's
 * index column, sharing one implementation because they are the same thing with
 * different data: a heading, a count, and rows that pick an item.
 */

import { useMemo } from 'react'
import type { FamilyMember } from '@/utils/genealogy-layout'

/* ------------------------------------------------------------------ families */

interface FamilyIndexProps {
  families: { id: string; name: string; members: FamilyMember[] }[]
  activeId: string
  onPick: (id: string) => void
  search: string
  onSearch: (q: string) => void
}

export function FamilyIndex({ families, activeId, onPick, search, onSearch }: FamilyIndexProps) {
  /**
   * The search field doubles as a filter and as the lineage highlight.
   *
   * Typing here dims the chart rather than reordering it — see BloodlinesView.
   * Filtering the family list as well would mean the family you are looking at
   * disappears while you search inside it.
   */
  const matches = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return null
    const set = new Set<string>()
    for (const f of families) {
      for (const m of f.members) if (m.name.toLowerCase().includes(q)) set.add(f.id)
    }
    return set
  }, [families, search])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 px-lg pb-md pt-lg">
        <h2 className="text-micro font-semibold uppercase tracking-[0.14em] text-tertiary">Bloodlines</h2>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Find a member"
          aria-label="Find a member in these families"
          className="mt-md h-10 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-3 text-body text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        />
        <p className="mt-sm text-nano tabular-nums text-tertiary">{families.length} families</p>
      </header>

      <nav aria-label="Families" className="min-h-0 flex-1 overflow-y-auto px-md pb-lg">
        <ul className="space-y-1">
          {families.map((f) => {
            const dim = matches ? !matches.has(f.id) : false
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => onPick(f.id)}
                  aria-current={f.id === activeId ? 'true' : undefined}
                  style={dim ? { opacity: 0.35 } : undefined}
                  className={[
                    'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left',
                    'transition-colors hover:bg-[var(--surface-inset)]',
                    'aria-[current]:bg-[var(--surface-raised)]',
                    'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                  ].join(' ')}
                >
                  <span className="truncate text-[var(--text-body-s)] text-[var(--text-primary)]">{f.name}</span>
                  <span className="ml-auto text-nano tabular-nums text-[var(--text-tertiary)]">{f.members.length}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

/* --------------------------------------------------------------- connections */

interface ConnectedIndexProps {
  entries: { id: string; name: string; count: number }[]
  activeId: string
  onPick: (id: string) => void
}

export function ConnectedIndex({ entries, activeId, onPick }: ConnectedIndexProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 px-lg pb-md pt-lg">
        <h2 className="text-micro font-semibold uppercase tracking-[0.14em] text-tertiary">Connections</h2>
        <p className="mt-sm text-nano tabular-nums text-tertiary">{entries.length} characters with recorded links</p>
      </header>

      <nav aria-label="Characters by connections" className="min-h-0 flex-1 overflow-y-auto px-md pb-lg">
        <ul className="space-y-1">
          {entries.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onPick(c.id)}
                aria-current={c.id === activeId ? 'true' : undefined}
                className={[
                  'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left',
                  'transition-colors hover:bg-[var(--surface-inset)]',
                  'aria-[current]:bg-[var(--surface-raised)]',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                ].join(' ')}
              >
                <span className="truncate text-[var(--text-body-s)] text-[var(--text-primary)]">{c.name}</span>
                <span className="ml-auto text-nano tabular-nums text-[var(--text-tertiary)]">{c.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
