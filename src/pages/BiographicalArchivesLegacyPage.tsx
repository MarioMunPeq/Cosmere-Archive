/**
 * BiographicalArchivesLegacyPage — Bloodlines and Connections.
 *
 * Part II of the Ars Arcanum now lives in the codex (`RecordsCodex`). These two
 * chapters keep their existing, tested implementations until their own block
 * rewrites them; the thin `/characters` shell routes `?tab=bloodlines`,
 * `?tab=connections` and `?family=` here so no published link breaks.
 */

import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import RecordsShell from '@/components/records/RecordsShell'
import CharacterIndex from '@/components/records/CharacterIndex'
import CharacterCard from '@/components/records/CharacterCard'
import BloodlinesView from '@/components/records/BloodlinesView'
import ConnectionsView from '@/components/records/ConnectionsView'
import { FamilyIndex, ConnectedIndex } from '@/components/records/RecordIndexes'
import EmptyState from '@/components/primitives/EmptyState'
import Button from '@/components/primitives/Button'
import SpoilerControl from '@/components/records/SpoilerControl'
import { useSpoilerMode } from '@/hooks/useSpoilerMode'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'
import { relationshipsFor, relationshipCounts } from '@/utils/relationships'
import { ALL_CHARACTERS } from '@/data/static'
import { FAMILY_TREES } from '@/data/static/family-data'
import type { Character } from '@/types/character'

type Chapter = 'records' | 'bloodlines' | 'connections'

const CHAR_MAP: Map<string, Character> = new Map(ALL_CHARACTERS.map((c) => [c.id, c]))

function connectedCharacters(): { id: string; name: string; count: number }[] {
  const counts = relationshipCounts()
  return ALL_CHARACTERS.map((c) => ({ id: c.id, name: c.name, count: counts.get(c.id) ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

const CONNECTIONS = connectedCharacters()

function namedRelationshipsFor(id: string): { otherId: string; otherName: string; kind: string }[] {
  const rows: { otherId: string; otherName: string; kind: string }[] = []
  for (const link of relationshipsFor(id)) {
    const other = CHAR_MAP.get(link.otherId)
    if (!other) continue
    rows.push({ otherId: link.otherId, otherName: other.name, kind: link.label })
  }
  return rows
}

export default function BiographicalArchivesLegacyPage() {
  const [searchParams, setParams] = useSearchParams()
  const navigate = useViewTransitionNavigate()

  const chapter = useMemo<Chapter>(() => {
    const tab = searchParams.get('tab')
    if (tab === 'bloodlines') return 'bloodlines'
    if (tab === 'connections') return 'connections'
    if (searchParams.get('family')) return 'bloodlines'
    return 'records'
  }, [searchParams])

  const selectedId = searchParams.get('character')
  const selected = selectedId ? CHAR_MAP.get(selectedId) : undefined
  const activeFamilyId = searchParams.get('family') ?? FAMILY_TREES[0]?.id ?? ''

  const connectionId = searchParams.get('character') ?? 'hoid'

  const [familyQuery, setFamilyQuery] = useState('')

  const pickFamily = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams)
      params.set('tab', 'bloodlines')
      params.set('family', id)
      setParams(params)
    },
    [searchParams, setParams],
  )

  const spoiler = useSpoilerMode()

  useSEOMeta({
    title: 'Biographical Archives — Cosmere Archive',
    description:
      'Collected biographies, bloodlines and historical records of notable individuals throughout the Cosmere.',
  })

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

      <div className="ml-auto flex min-w-0 max-w-full items-center gap-1">
        <SpoilerControl spoiler={spoiler} />
      </div>

      <nav aria-label="Records sections" className="min-w-0 max-w-full overflow-x-auto">
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

  if (chapter === 'bloodlines') {
    const family = FAMILY_TREES.find((f) => f.id === activeFamilyId) ?? FAMILY_TREES[0]
    return (
      <RecordsShell
        header={header}
        drawerLabel="Family index"
        index={
          <FamilyIndex
            families={FAMILY_TREES}
            activeId={family?.id ?? ''}
            onPick={pickFamily}
            search={familyQuery}
            onSearch={setFamilyQuery}
          />
        }
        record={family ? <BloodlinesView family={family} search={familyQuery} onOpenCharacter={openCharacter} /> : null}
      />
    )
  }

  if (chapter === 'connections') {
    const subject = CHAR_MAP.get(connectionId)
    return (
      <RecordsShell
        header={header}
        drawerLabel="Connection index"
        index={
          <ConnectedIndex
            entries={CONNECTIONS}
            activeId={connectionId}
            onPick={(id) => {
              const params = new URLSearchParams(searchParams)
              params.set('tab', 'connections')
              params.set('character', id)
              setParams(params)
            }}
          />
        }
        record={
          subject ? (
            <ConnectionsView
              character={subject}
              buildHref={(id) => {
                const params = new URLSearchParams(searchParams)
                params.set('tab', 'connections')
                params.set('character', id)
                return `?${params.toString()}`
              }}
            />
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-base)] p-xl shadow-[var(--shadow-1)]">
              <EmptyState
                title="Choose a character"
                description="Pick someone from the list to see who they are recorded with."
              />
            </div>
          )
        }
      />
    )
  }

  const record = selected ? (
    <div key={selected.id} className="record-enter">
      <CharacterCard
        character={selected}
        relationships={namedRelationshipsFor(selected.id)}
        locked={spoiler.enabled && !spoiler.isCharacterVisible(selected)}
        onUnlock={() => spoiler.setPanelOpen(true)}
        onOpenCharacter={openCharacter}
        onOpenBook={(id) => navigate(`/library?book=${id}`)}
        onOpenPlanet={(id) => navigate(`/celestial-charts?focus=planet&id=${id}`)}
      />
    </div>
  ) : selectedId ? (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-base)] p-xl shadow-[var(--shadow-1)]">
      <EmptyState
        title="No such record"
        description={`The archive has no record with the id “${selectedId}”. The link that brought you here may be out of date.`}
        action={
          <Button tone="dark" size="sm" onClick={() => setChapter('records')}>
            Back to the index
          </Button>
        }
      />
    </div>
  ) : (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-base)] p-xl shadow-[var(--shadow-1)]">
      <EmptyState
        title="Choose a record"
        description="Pick a name from the index to read its record. Every entry links, so any record has its own address."
      />
    </div>
  )

  const visibleCharacters = spoiler.enabled ? spoiler.filterCharacters(ALL_CHARACTERS) : ALL_CHARACTERS

  return <RecordsShell header={header} index={<CharacterIndex visible={visibleCharacters} />} record={record} />
}
