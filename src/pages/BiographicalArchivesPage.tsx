/**
 * BiographicalArchivesPage — the Records screen. M4 · block 1.
 *
 * ## What changed and why
 *
 * The layout. §5.4.1 replaces the `ArchivalViewer` two-page book — spine,
 * gutter shadow, perspective projection, 136px of fixed structure — with a
 * sidebar and a single column. The projection was not only decoration: text
 * inside it was rasterised at whatever angle the projection produced, which is
 * the reason the old records blurred at the edges. A record is a document.
 *
 * Selection. It was `useState` plus a `scrollIntoView`, so the "record" was a
 * scroll of all ninety-three entries and the index highlight was a scroll
 * position. It is now a URL parameter and one record on screen, which is what
 * the index has always implied it was doing.
 *
 * Rows. The index entries were `<div role="button" tabIndex={0}>` with a
 * keydown handler bolted on — criterion R.6 forbids exactly this — and they
 * could not be opened in a new tab. They are `<Link>`s now.
 *
 * Colour. Every inline `rgba(45,26,14,0.6)` is gone. The audit measured the
 * planet chip at 2.21:1 and the search placeholder at 1.68:1 against
 * parchment; the token set in tokens.css was built for this screen, with the
 * measured ratio written next to each value.
 *
 * ## What is deliberately untouched
 *
 * Bloodlines and Connections keep their existing implementations. They are
 * migrations for a later block, and rewriting them here would make this diff
 * unreviewable. What changed is only that they now live inside the new shell
 * rather than inside the book.
 */

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import RecordsShell from '@/components/records/RecordsShell'
import CharacterIndex from '@/components/records/CharacterIndex'
import EmptyState from '@/components/primitives/EmptyState'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'
import { ALL_CHARACTERS } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import { CHARACTER_RELATIONSHIPS } from '@/data/static/static-data'
import { FAMILY_TREES } from '@/data/static/family-data'
import BiographicalContents from '@/components/biographical-archives/BiographicalContents'
import CharacterRecord from '@/components/biographical-archives/CharacterRecord'
import { GenealogyManuscript } from '@/components/genealogy-archive'
import ConnectionDiagram from '@/components/biographical-archives/ConnectionDiagram'
import type { Character } from '@/types/character'

type Chapter = 'contents' | 'records' | 'bloodlines' | 'connections'

const CHAR_MAP: Map<string, Character> = new Map(ALL_CHARACTERS.map((c) => [c.id, c]))

/** Characters with at least one recorded relationship, most-connected first. */
function connectedCharacters(): { id: string; name: string; count: number }[] {
  const tally = new Map<string, number>()
  for (const rel of CHARACTER_RELATIONSHIPS) {
    for (const id of rel.characters) tally.set(id, (tally.get(id) ?? 0) + 1)
  }
  return ALL_CHARACTERS.map((c) => ({ id: c.id, name: c.name, count: tally.get(c.id) ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
}

const CONNECTIONS = connectedCharacters()

export default function BiographicalArchivesPage() {
  const [searchParams, setParams] = useSearchParams()
  const navigate = useViewTransitionNavigate()

  const chapter = useMemo<Chapter>(() => {
    const tab = searchParams.get('tab')
    if (tab === 'bloodlines') return 'bloodlines'
    if (tab === 'connections') return 'connections'
    if (tab === 'contents') return 'contents'
    return 'records'
  }, [searchParams])

  const selectedId = searchParams.get('character')
  const selected = selectedId ? CHAR_MAP.get(selectedId) : undefined
  const activeFamilyId = searchParams.get('family') ?? FAMILY_TREES[0]?.id ?? ''

  const connectionId = searchParams.get('character') ?? 'hoid'

  useSEOMeta({
    title: 'Biographical Archives — Cosmere Archive',
    description:
      'Collected biographies, bloodlines and historical records of notable individuals throughout the Cosmere.',
  })

  /** Chapter changes keep the rest of the query so a shared link stays useful. */
  const setChapter = useCallback(
    (next: Chapter) => {
      const params = new URLSearchParams(searchParams)
      params.delete('character')
      params.delete('family')
      if (next === 'records') params.delete('tab')
      else params.set('tab', next)
      setParams(params)
    },
    [searchParams, setParams],
  )

  const openCharacter = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams)
      params.delete('tab')
      params.set('character', id)
      setParams(params)
    },
    [searchParams, setParams],
  )

  const header = (
    <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--border-subtle)] px-5 py-3 min-[1024px]:flex-nowrap min-[1024px]:px-8">
      <h1 className="font-[var(--font-display)] text-[var(--text-h4)] text-[var(--text-primary)] min-[1024px]:text-[var(--text-h3)]">
        Biographical Archives
      </h1>
      <span className="hidden text-[var(--text-meta)] text-[var(--text-tertiary)] min-[1024px]:inline">
        {ALL_CHARACTERS.length} records
      </span>

      {/* `min-w-0` and a scroll container: three section names plus the title
          do not fit 375px, and clipping "Connections" to "Connec" is worse
          than letting the row scroll. */}
      <nav aria-label="Records sections" className="ml-auto min-w-0 max-w-full overflow-x-auto">
        <ul className="flex items-center gap-1">
          {(['records', 'bloodlines', 'connections'] as const).map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => setChapter(c)}
                aria-current={chapter === c ? 'page' : undefined}
                className={[
                  'cursor-pointer rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-meta)] capitalize',
                  'transition-colors duration-[var(--dur-fast)]',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                  chapter === c
                    ? 'bg-[var(--surface-raised)] text-[var(--text-primary)]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]',
                ].join(' ')}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )

  /* ---- Bloodlines and Connections: unchanged implementations, new frame ---- */

  if (chapter === 'bloodlines') {
    return (
      <RecordsShell
        header={header}
        drawerLabel="Family index"
        index={
          <nav aria-label="Families" className="h-full overflow-y-auto p-md">
            <ul className="space-y-1">
              {FAMILY_TREES.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams)
                      params.set('tab', 'bloodlines')
                      params.set('family', f.id)
                      setParams(params)
                    }}
                    aria-current={activeFamilyId === f.id ? 'true' : undefined}
                    className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-[var(--text-body-s)] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-inset)] aria-[current]:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                  >
                    {f.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        }
        record={<GenealogyManuscript families={FAMILY_TREES} focusFamilyId={activeFamilyId} charMap={CHAR_MAP} />}
      />
    )
  }

  if (chapter === 'connections') {
    return (
      <RecordsShell
        header={header}
        drawerLabel="Connection index"
        index={
          <nav aria-label="Characters by connections" className="h-full overflow-y-auto p-md">
            <ul>
              {CONNECTIONS.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams)
                      params.set('tab', 'connections')
                      params.set('character', c.id)
                      setParams(params)
                    }}
                    aria-current={connectionId === c.id ? 'true' : undefined}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-[var(--surface-inset)] aria-[current]:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                  >
                    <span className="truncate text-[var(--text-body-s)] text-[var(--text-primary)]">{c.name}</span>
                    <span className="text-nano tabular-nums text-[var(--text-tertiary)]">{c.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        }
        record={<ConnectionDiagram selectedId={connectionId} onNavigateCharacter={openCharacter} />}
      />
    )
  }

  /* ---- Records: the index and one record ---- */

  const record = selected ? (
    <CharacterRecord
      key={selected.id}
      character={selected}
      magicSystems={MAGIC_SYSTEMS}
      onNavigatePlanet={(planetId) => navigate(`/celestial-charts?focus=planet&id=${planetId}`)}
      onNavigateMagic={(systemId) => navigate(`/magic?system=${systemId}`)}
      onNavigateBook={(bookId) => navigate(`/books/${bookId}`)}
      onNavigateChapter={(c) => setChapter(c)}
    />
  ) : (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-base)] p-xl shadow-[var(--shadow-1)]">
      {chapter === 'contents' ? (
        <BiographicalContents onSelectChapter={setChapter} />
      ) : (
        <EmptyState
          title="Choose a record"
          description="Pick a name from the index to read its record. Every entry links, so any record has its own address."
        />
      )}
    </div>
  )

  return <RecordsShell header={header} index={<CharacterIndex />} record={record} />
}
