/**
 * RecordsCodex — Part II of the Ars Arcanum.
 *
 * The contents spread is the entrance; every person is one spread, and the
 * eight fore-edge tabs point at the same letter ranges printed on the contents
 * page. `?character=` and the search palette's `/records/:id` links both resolve
 * to the record's own spread, then the URL is canonicalised to `?spread=`.
 */

import { useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'
import { useCodexRoute } from '@/hooks/useCodexRoute'
import { useCodexSession } from '@/hooks/useCodexSession'
import { useSpoilerMode } from '@/hooks/useSpoilerMode'
import Codex, { type CodexSpreadView } from '@/components/codex/Codex'
import ThumbTabs, { type ThumbTab } from '@/components/codex/ThumbTabs'
import SpoilerControl from '@/components/records/SpoilerControl'
import RecordsContents from '@/components/records/RecordsContents'
import { buildRecordSpread } from '@/components/records/RecordSpread'
import { ALL_CHARACTERS } from '@/data/static'
import { ARCANUM_CHAPTERS } from '@/utils/ars-arcanum'
import { buildRecordRanges, buildRecordSections, recordSpreadId } from '@/utils/codex-records'
import { buildSpreads, spreadIndexById, type CodexSection } from '@/utils/codex-pages'
import type { Character } from '@/types/character'

const CHARACTERS_BY_ID = new Map(ALL_CHARACTERS.map((character) => [character.id, character]))
const CONTENTS_ID = 'records-contents'
const TITLE_ID = 'records-title'

function RecordsTitlePage({ total, ranges }: { total: number; ranges: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center" data-record-title>
      <p
        className="text-[11px] uppercase tracking-[0.22em] [font-family:var(--font-ui)]"
        style={{ color: 'var(--text-on-page-tertiary)' }}
      >
        Part II
      </p>
      <h2
        className="mt-3 max-w-[12ch] text-[clamp(30px,3.4vw,54px)] font-semibold leading-[1.02] tracking-[0.01em] [font-family:var(--font-display)]"
        style={{ color: 'var(--text-on-page-primary)' }}
      >
        Biographical Records
      </h2>
      <div className="mt-5 h-px w-16" style={{ backgroundColor: 'var(--text-on-page-accent)' }} aria-hidden="true" />
      <p
        className="mt-5 max-w-[34ch] text-[13px] italic leading-relaxed [font-family:var(--font-display)]"
        style={{ color: 'var(--text-on-page-secondary)' }}
      >
        {total} lives, gathered from the archive and arranged by the name on the plate. The index at the fore-edge opens
        the same {ranges} letter ranges printed opposite.
      </p>
      <p
        className="mt-6 text-[11px] uppercase tracking-[0.12em] [font-family:var(--font-ui)]"
        style={{ color: 'var(--text-on-page-tertiary)' }}
      >
        {total} records · {ranges} ranges · {ARCANUM_CHAPTERS.length} Investiture chapters in Part I
      </p>
    </div>
  )
}

function RecordsMissing({ id }: { id: string }) {
  const navigate = useNavigate()

  return (
    <div data-records-main className="flex min-h-0 flex-1 items-center justify-center bg-[var(--surface-void)] p-6">
      <div className="max-w-[46ch]">
        <p
          className="text-[11px] uppercase tracking-[0.16em] [font-family:var(--font-ui)]"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Archive error
        </p>
        <h1 className="mt-2 font-[var(--font-display)] text-[var(--text-h2)] text-[var(--text-primary)]">
          No such record
        </h1>
        <p className="mt-3 text-[var(--text-body-s)] leading-relaxed text-[var(--text-secondary)]">
          The archive has no record with the id “{id}”. The link that brought you here may be out of date.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/characters?spread=${CONTENTS_ID}`, { replace: true })}
          className="mt-6 cursor-pointer rounded-[var(--radius-md)] border border-[var(--border-interactive)] px-4 py-2 text-[var(--text-meta)] text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          Back to the index
        </button>
      </div>
    </div>
  )
}

type Spoiler = ReturnType<typeof useSpoilerMode>

function RecordsBook({ spoiler }: { spoiler: Spoiler }) {
  const navigate = useViewTransitionNavigate()
  const session = useCodexSession('records')

  const ranges = useMemo(() => buildRecordRanges(ALL_CHARACTERS), [])

  const visibleCharacters = useMemo(
    () => (spoiler.enabled ? spoiler.filterCharacters(ALL_CHARACTERS) : ALL_CHARACTERS),
    [spoiler],
  )

  const sections = useMemo<CodexSection[]>(
    () => [
      {
        leaves: [
          { id: CONTENTS_ID, title: 'Contents', frontMatter: true, view: 'contents' },
          { id: TITLE_ID, title: 'Biographical Records', frontMatter: true, view: 'contents' },
        ],
      },
      ...buildRecordSections(ALL_CHARACTERS),
    ],
    [],
  )

  const spreads = useMemo(() => buildSpreads(sections), [sections])
  const fallbackId = session.ribbon && spreadIndexById(spreads, session.ribbon) >= 0 ? session.ribbon : CONTENTS_ID

  const route = useCodexRoute({ spreads, fallbackId })
  const spread = route.spread
  const activeCharacterId = spread?.characterIds[0]
  const activeRange = ranges.find((range) => range.records.some((record) => record.id === activeCharacterId))

  const spreadId = spread?.id
  const rememberSpread = session.rememberSpread
  useEffect(() => {
    if (spreadId) rememberSpread(spreadId)
  }, [rememberSpread, spreadId])

  const openRecord = (characterId: string) => route.openSpread(recordSpreadId(characterId))
  const openRange = (rangeId: string) => route.openSpread(rangeId)

  const views: CodexSpreadView[] = spreads.map((entry) => {
    if (entry.id === CONTENTS_ID) {
      return {
        id: entry.id,
        title: entry.title,
        left: (
          <RecordsContents
            records={visibleCharacters}
            onOpenRecord={openRecord}
            onOpenRange={openRange}
            onOpenPartI={() => navigate('/magic')}
          />
        ),
        right: <RecordsTitlePage total={ALL_CHARACTERS.length} ranges={ranges.length} />,
        leftFolio: entry.folios[0] ?? undefined,
        rightFolio: entry.folios[1] ?? undefined,
        leftHeader: 'Biographical Records',
        rightHeader: 'Contents',
      }
    }

    const character = activeCharacterIdForSpread(entry.characterIds[0])
    if (!character) {
      return {
        id: entry.id,
        title: entry.title,
        left: null,
        right: null,
        leftFolio: entry.folios[0] ?? undefined,
        rightFolio: entry.folios[1] ?? undefined,
        leftHeader: 'Biographical Records',
        rightHeader: 'Record',
      }
    }

    const locked = spoiler.enabled && !spoiler.isCharacterVisible(character)

    return {
      ...buildRecordSpread({
        character,
        locked,
        onUnlock: () => spoiler.setPanelOpen(true),
      }),
      leftFolio: entry.folios[0] ?? undefined,
      rightFolio: entry.folios[1] ?? undefined,
      leftHeader: 'Biographical Records',
      rightHeader: character.name,
    }
  })

  const tabs: ThumbTab[] = ranges.map((range) => ({
    id: range.id,
    label: range.label,
    ariaLabel: `${range.label} — ${range.count} records, starting with ${range.records[0]?.name ?? 'the first record'}`,
    active: activeRange?.id === range.id,
    onSelect: () => openRange(range.firstSpreadId),
  }))

  return (
    <>
      <Codex
        spreads={views}
        index={route.index}
        onTurn={(next) => {
          const target = spreads[next]
          if (target) route.turnTo(target.id)
        }}
        progress={route.total > 1 ? route.index / (route.total - 1) : 0}
        edition={session.edition}
        part="records"
        label="Biographical Records"
        thumbs={<ThumbTabs label="Record ranges" tabs={tabs} />}
      />
      <div className="records-spoiler">
        <SpoilerControl spoiler={spoiler} />
      </div>
    </>
  )
}

function activeCharacterIdForSpread(id: string | undefined): Character | undefined {
  return id ? CHARACTERS_BY_ID.get(id) : undefined
}

export default function RecordsCodex() {
  const [params] = useSearchParams()
  const requestedCharacter = params.get('character')
  const spoiler = useSpoilerMode()

  useSEOMeta({
    title: 'Biographical Archives — Cosmere Archive',
    description:
      'Collected biographies, bloodlines and historical records of notable individuals throughout the Cosmere.',
  })

  if (requestedCharacter && !CHARACTERS_BY_ID.has(requestedCharacter)) {
    return <RecordsMissing id={requestedCharacter} />
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <h1 className="sr-only">Biographical Archives</h1>
      <RecordsBook spoiler={spoiler} />
    </div>
  )
}
