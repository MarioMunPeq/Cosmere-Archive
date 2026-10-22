/**
 * RecordsContents — the Part II table of contents.
 *
 * The index is the same eight ranges as the fore-edge tabs, so a reader who
 * learns that K lives under J–M can use either surface. Search is local to this
 * spread: it is a lens on the printed page, not a destination, and putting it in
 * the URL would make every keystroke a history entry.
 */

import { useMemo, useState } from 'react'
import ContentsPage, { type ContentsCompanion, type ContentsPart } from '@/components/codex/ContentsPage'
import { buildRecordRanges } from '@/utils/codex-records'
import { ARCANUM_CHAPTERS } from '@/utils/ars-arcanum'
import type { Character } from '@/types/character'

interface Props {
  records: readonly Character[]
  onOpenRecord: (characterId: string) => void
  onOpenRange: (spreadId: string) => void
  onOpenPartI: () => void
  onOpenLineages: () => void
}

function matches(record: Character, query: string): boolean {
  const haystack = `${record.name} ${record.description} ${record.planet}`.toLowerCase()
  return haystack.includes(query)
}

export default function RecordsContents({ records, onOpenRecord, onOpenRange, onOpenPartI, onOpenLineages }: Props) {
  const [query, setQuery] = useState('')
  const trimmed = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!trimmed) return records
    return records.filter((record) => matches(record, trimmed))
  }, [records, trimmed])

  const ranges = useMemo(() => buildRecordRanges(filtered), [filtered])

  const part: ContentsPart = {
    id: 'records',
    kicker: 'Part II',
    title: 'Biographical Records',
    description: 'Portraits, identities and biographies from across the Cosmere, ordered by the name on the plate.',
    total: filtered.length,
    totalLabel: trimmed ? 'matching records' : 'records',
    ranges: ranges.map((range) => ({
      id: range.id,
      label: range.label,
      count: range.count,
      firstRecordName: range.records[0]?.name,
      entries: range.records.map((record) => ({
        id: record.id,
        label: record.name,
        onOpen: () => onOpenRecord(record.id),
      })),
      onOpen: () => onOpenRange(range.firstSpreadId),
    })),
  }

  const companion: ContentsCompanion = {
    kicker: 'Part I',
    title: 'Investiture',
    count: ARCANUM_CHAPTERS.length,
    countLabel: 'chapters',
    onOpen: onOpenPartI,
  }

  const emptyMessage = trimmed
    ? `No records match “${query.trim()}”.`
    : records.length === 0
      ? 'No records are unlocked yet. Use the Spoilers control to tick the books you have read.'
      : null

  return (
    <div data-records-index>
      <ContentsPage part={part} companion={companion}>
        <div className="mb-5">
          <label htmlFor="record-search" className="sr-only">
            Search records
          </label>
          <div className="flex items-center gap-2">
            <input
              id="record-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search records"
              autoComplete="off"
              spellCheck={false}
              className="record-search min-w-0 flex-1 border bg-[var(--surface-page-inset)] px-3 py-2 text-[13px] text-[color:var(--text-on-page-primary)] outline-none transition-colors duration-150 placeholder:text-[color:var(--text-on-page-tertiary)] focus-visible:border-[color:var(--text-on-page-link)] focus-visible:[box-shadow:var(--focus-ring-on-page)] [font-family:var(--font-ui)]"
              style={{ borderColor: 'var(--border-interactive-on-page)' }}
            />
            {trimmed && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="cursor-pointer border-0 bg-transparent px-1 py-2 text-[11px] underline underline-offset-2 [font-family:var(--font-ui)]"
                style={{ color: 'var(--text-on-page-link)' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="mb-5 border-t pt-3" style={{ borderColor: 'rgba(80,60,40,0.16)' }}>
          <p
            className="text-[11px] uppercase tracking-[0.16em] [font-family:var(--font-ui)]"
            style={{ color: 'var(--text-on-page-tertiary)' }}
          >
            Volume II
          </p>
          <button
            type="button"
            onClick={onOpenLineages}
            className="mt-1 cursor-pointer border-0 bg-transparent p-0 text-left text-[12px] underline underline-offset-2 [font-family:var(--font-display)]"
            style={{ color: 'var(--text-on-page-link)' }}
          >
            Bloodlines &amp; Connections — houses and recorded bonds →
          </button>
        </div>

        {emptyMessage && (
          <p
            className="mb-4 max-w-[42ch] text-[13px] italic leading-relaxed [font-family:var(--font-display)]"
            style={{ color: 'var(--text-on-page-secondary)' }}
          >
            {emptyMessage}
          </p>
        )}
      </ContentsPage>
    </div>
  )
}
