import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'
import { useCodexRoute } from '@/hooks/useCodexRoute'
import { useCodexSession } from '@/hooks/useCodexSession'
import { BOOKS, ALL_CHARACTERS } from '@/data/static'
import { MAGIC_SYSTEMS, type MagicSystem } from '@/data/static/magic-systems'
import {
  buildSpreads,
  findSpreadForSystem,
  spreadIndexById,
  type CodexLeaf,
  type CodexSection,
} from '@/utils/codex-pages'
import { ARCANUM_CHAPTERS, chapterNumeral, type ArcanumChapter } from '@/utils/ars-arcanum'
import ArchivalIndex from '@/components/ars-arcanum/ArchivalIndex'
import Codex, { type CodexSpreadView } from '@/components/codex/Codex'
import ContentsPage, { type ContentsCompanion, type ContentsPart } from '@/components/codex/ContentsPage'
import ThumbTabs, { type ThumbTab } from '@/components/codex/ThumbTabs'
import AllomanticTable from '@/components/magic/AllomanticTable'

const TEXT_BUTTON = 'cursor-pointer border-0 bg-transparent p-0 text-left'

function getRelatedSystems(
  system: MagicSystem,
  allSystems: MagicSystem[],
): { samePlanet: MagicSystem[]; sameShard: MagicSystem[]; sameClassification: MagicSystem[] } {
  const samePlanet = allSystems.filter(
    (candidate) => candidate.planetId === system.planetId && candidate.id !== system.id,
  )
  const sameShard = allSystems.filter(
    (candidate) =>
      candidate.shard === system.shard && candidate.planetId !== system.planetId && candidate.id !== system.id,
  )
  const sameClassification = system.classification
    ? allSystems.filter(
        (candidate) =>
          candidate.classification === system.classification &&
          candidate.planetId !== system.planetId &&
          candidate.id !== system.id,
      )
    : []
  return { samePlanet, sameShard, sameClassification }
}

function shortStatus(status: string): string {
  if (status === 'Documented') return 'Doc.'
  if (status === 'Partially Documented') return 'Part.'
  if (status === 'Poorly Understood') return 'Unc.'
  return status
}

function RecordField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span
        className="shrink-0 text-right text-[11px] uppercase tracking-[0.1em] [font-family:var(--font-ui)]"
        style={{ color: 'var(--text-on-page-tertiary)', minWidth: '82px' }}
      >
        {label}
      </span>
      <span
        className="text-[clamp(12px,0.9vw,13px)] [font-family:var(--font-display)]"
        style={{ color: 'var(--text-on-page-secondary)' }}
      >
        {children}
      </span>
    </div>
  )
}

function TitlePage() {
  return (
    <div className="flex h-full flex-col items-center justify-start text-center sm:justify-center">
      <div className="mb-2 h-px w-12 sm:mb-3" style={{ background: 'rgba(80,60,40,0.28)' }} />
      <h1
        className="text-[clamp(20px,6vw,42px)] font-bold leading-tight tracking-[0.1em] [font-family:var(--font-display)] sm:text-[clamp(24px,3vw,42px)] sm:tracking-[0.15em]"
        style={{ color: 'var(--text-on-page-primary)' }}
      >
        ARS
        <br />
        ARCANUM
      </h1>
      <div className="mt-3 h-px w-10 sm:mt-4" style={{ background: 'rgba(80,60,40,0.24)' }} />
      <p
        className="mt-3 max-w-[360px] text-[clamp(13px,1vw,15px)] italic leading-snug [font-family:var(--font-display)] sm:mt-5 sm:leading-relaxed"
        style={{ color: 'var(--text-on-page-secondary)' }}
      >
        Collected observations concerning the manifestations of Investiture throughout the known Cosmere
      </p>
      <div className="mt-3 space-y-1 sm:mt-8">
        <p className="text-[11px] [font-family:var(--font-display)]" style={{ color: 'var(--text-on-page-tertiary)' }}>
          Compiled from the research of Khrissalla
        </p>
        <p
          className="text-[11px] italic [font-family:var(--font-display)]"
          style={{ color: 'var(--text-on-page-tertiary)' }}
        >
          Preserved within the Cosmere Archive
        </p>
      </div>
      <div className="mt-5 h-px w-12 sm:mt-10" style={{ background: 'rgba(80,60,40,0.28)' }} />
      <p
        className="mt-3 text-[11px] uppercase tracking-[0.04em] [font-family:var(--font-ui)] sm:mt-4 sm:tracking-[0.12em]"
        style={{ color: 'var(--text-on-page-tertiary)' }}
      >
        <span className="hidden sm:inline">— </span>Silverlight Edition
        <span className="hidden sm:inline"> —</span>
      </p>
    </div>
  )
}

interface ChapterPageProps {
  chapter: ArcanumChapter
  onOpenSystem: (system: MagicSystem) => void
  onOpenContents: () => void
}

function ChapterPage({ chapter, onOpenSystem, onOpenContents }: ChapterPageProps) {
  const { planet, systems } = chapter
  const shardLabel = planet.shard?.includes('&') ? 'Shards' : 'Shard'

  return (
    <div>
      <p
        className="text-[11px] uppercase tracking-[0.12em] [font-family:var(--font-ui)]"
        style={{ color: 'var(--text-on-page-tertiary)' }}
      >
        Chapter {chapter.numeral}
      </p>
      <h1
        className="mt-2 mb-1 text-[clamp(22px,2.4vw,32px)] font-bold leading-tight tracking-[0.05em] [font-family:var(--font-display)]"
        style={{ color: 'var(--text-on-page-primary)' }}
      >
        {planet.name}
      </h1>

      <div
        className="mt-3 mb-5 space-y-1 text-[12px] [font-family:var(--font-display)]"
        style={{ color: 'var(--text-on-page-secondary)' }}
      >
        <p>
          <span style={{ color: 'var(--text-on-page-tertiary)' }}>{shardLabel}:</span> {planet.shard ?? 'Unknown'}
        </p>
        <p>
          <span style={{ color: 'var(--text-on-page-tertiary)' }}>Investiture:</span> {systems.length} documented
          manifestation{systems.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-[1px]">
        {systems.map((system, index) => (
          <button
            key={system.id}
            type="button"
            onClick={() => onOpenSystem(system)}
            className={`${TEXT_BUTTON} group flex w-full items-baseline gap-2 py-[3px]`}
          >
            <span
              className="min-w-[18px] text-right text-[11px] [font-family:var(--font-display)]"
              style={{ color: 'var(--text-on-page-tertiary)' }}
            >
              {index + 1}.
            </span>
            <span
              className="text-[14px] tracking-[0.02em] transition-colors duration-150 group-hover:text-[color:var(--text-on-page-link)] [font-family:var(--font-display)]"
              style={{ color: 'var(--text-on-page-primary)' }}
            >
              {system.name}
            </span>
            {system.status && (
              <span
                className="ml-auto text-[11px] uppercase tracking-[0.06em] [font-family:var(--font-ui)]"
                style={{ color: 'var(--text-on-page-tertiary)' }}
              >
                {shortStatus(system.status)}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={onOpenContents}
          className={`${TEXT_BUTTON} text-[11px] uppercase tracking-[0.1em] [font-family:var(--font-ui)]`}
          style={{ color: 'var(--text-on-page-tertiary)' }}
        >
          ← Contents
        </button>
      </div>
    </div>
  )
}

interface ByWorldProps {
  chapters: ArcanumChapter[]
  onOpenChapter: (planetId: string) => void
  onOpenSystem: (system: MagicSystem) => void
}

function ByWorldPage({ chapters, onOpenChapter, onOpenSystem }: ByWorldProps) {
  return (
    <div>
      <h2
        className="mb-5 text-[12px] uppercase tracking-[0.15em] [font-family:var(--font-ui)]"
        style={{ color: 'var(--text-on-page-secondary)' }}
      >
        By World
      </h2>
      <div className="space-y-4">
        {chapters.map(({ planet, systems, numeral }) => (
          <div key={planet.id}>
            <button
              type="button"
              onClick={() => onOpenChapter(planet.id)}
              className={`${TEXT_BUTTON} text-[13px] font-medium transition-colors duration-150 hover:text-[color:var(--text-on-page-link)] [font-family:var(--font-display)]`}
              style={{ color: 'var(--text-on-page-primary)' }}
            >
              {numeral}. {planet.name}
            </button>
            <div className="mt-1">
              {systems.map((system) => (
                <button
                  key={system.id}
                  type="button"
                  onClick={() => onOpenSystem(system)}
                  className={`${TEXT_BUTTON} block pl-4 py-[1px] text-[12px] transition-colors duration-150 hover:text-[color:var(--text-on-page-link)] [font-family:var(--font-display)]`}
                  style={{ color: 'var(--text-on-page-secondary)' }}
                >
                  {system.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MagicSystemsPage() {
  useSEOMeta({
    title: 'Ars Arcanum — Cosmere Archive',
    description: 'Collected observations concerning the manifestations of Investiture throughout the known Cosmere.',
  })

  const navigate = useViewTransitionNavigate()
  const chapters = ARCANUM_CHAPTERS
  const chapterByPlanet = useMemo(() => new Map(chapters.map((chapter) => [chapter.planet.id, chapter])), [chapters])
  const systemById = useMemo(() => new Map(MAGIC_SYSTEMS.map((system) => [system.id, system])), [])

  const sections = useMemo<CodexSection[]>(() => {
    const book: CodexSection[] = [
      {
        leaves: [
          { id: 'contents', title: 'Contents', frontMatter: true, view: 'contents' },
          { id: 'title', title: 'Ars Arcanum', frontMatter: true, view: 'contents' },
        ],
      },
    ]

    for (const { planet, systems } of chapters) {
      const leaves: CodexLeaf[] = [
        { id: `chapter-${planet.id}`, title: planet.name, chapterId: planet.id, view: 'chapter' },
        ...systems.map((system) => ({
          id: `system-${system.id}`,
          title: system.name,
          chapterId: planet.id,
          systemIds: [system.id],
        })),
      ]
      book.push({ leaves })
    }

    book.push({
      leaves: [
        { id: 'index', title: 'Index', view: 'index' },
        { id: 'index-world', title: 'Index of Worlds', view: 'index' },
      ],
    })

    return book
  }, [chapters])

  const spreads = useMemo(() => buildSpreads(sections), [sections])
  const leafById = useMemo(
    () => new Map(sections.flatMap((section) => section.leaves).map((leaf) => [leaf.id, leaf])),
    [sections],
  )

  const { ribbon, rememberSpread, edition } = useCodexSession('investiture')
  const fallbackId = ribbon && spreadIndexById(spreads, ribbon) >= 0 ? ribbon : spreads[0]?.id
  const route = useCodexRoute({ spreads, fallbackId })
  const activeSpreadId = route.spread?.id

  useEffect(() => {
    if (activeSpreadId) rememberSpread(activeSpreadId)
  }, [activeSpreadId, rememberSpread])

  const openChapter = useCallback(
    (planetId: string) => {
      route.openSpread(`chapter-${planetId}`)
    },
    [route],
  )

  const openIndex = useCallback(() => {
    route.openSpread('index')
  }, [route])

  const openContents = useCallback(() => {
    route.openSpread('contents')
  }, [route])

  const chapterCount = chapters.length
  const manifestationCount = chapters.reduce((total, chapter) => total + chapter.systems.length, 0)

  const contentsPart: ContentsPart = {
    id: 'investiture',
    kicker: 'Part I',
    title: 'Investiture',
    description: `${chapterCount} worlds and ${manifestationCount} documented manifestations of Investiture, surveyed by Khrissalla.`,
    total: chapterCount,
    totalLabel: 'chapters',
    entries: chapters.map(({ planet, systems, numeral }) => ({
      id: planet.id,
      label: planet.name,
      numeral,
      meta: `${systems.length} manifestation${systems.length === 1 ? '' : 's'}`,
      onOpen: () => openChapter(planet.id),
    })),
    indexLabel: 'Archival Index →',
    onOpenIndex: openIndex,
  }

  const recordCompanion: ContentsCompanion = {
    kicker: 'Part II',
    title: 'Biographical Records',
    count: ALL_CHARACTERS.length,
    countLabel: 'records',
    onOpen: () => navigate('/characters'),
  }

  const activeChapterId = route.spread?.chapterId
  const worldTabs: ThumbTab[] = chapters.map(({ planet, systems, numeral }) => ({
    id: planet.id,
    label: numeral,
    ariaLabel: `${numeral} — ${planet.name}, ${systems.length} manifestation${systems.length === 1 ? '' : 's'}`,
    active: activeChapterId === planet.id,
    onSelect: () => openChapter(planet.id),
  }))

  const goToSystem = useCallback(
    (system: MagicSystem, sameChapter: boolean) => {
      const target = findSpreadForSystem(spreads, system.id)
      if (!target) return
      if (sameChapter) route.turnTo(target.id)
      else route.openSpread(target.id)
    },
    [route, spreads],
  )

  const renderSection = (system: MagicSystem) => {
    const chapter = chapterByPlanet.get(system.planetId)
    const systems = chapter?.systems ?? []
    const sectionIndex = Math.max(
      0,
      systems.findIndex((candidate) => candidate.id === system.id),
    )
    const planet = chapter?.planet
    const related = getRelatedSystems(system, systems)
    const allRelated = getRelatedSystems(system, MAGIC_SYSTEMS)
    const shardRefs = allRelated.sameShard.slice(0, 3)
    const classRefs = allRelated.sameClassification.slice(0, 3)
    const characters = ALL_CHARACTERS.filter((character) => character.planet === system.planetId)
    const books = system.bookIds
      .map((bookId) => BOOKS.find((book) => book.id === bookId))
      .filter((book): book is (typeof BOOKS)[number] => Boolean(book))

    return (
      <section key={system.id} id={`section-${system.id}`} className="mb-2">
        <div className="mb-4 h-px w-full" style={{ background: 'rgba(80,60,40,0.08)' }} />

        <h2
          className="text-[clamp(17px,1.7vw,23px)] font-bold leading-tight tracking-[0.04em] [font-family:var(--font-display)]"
          style={{ color: 'var(--text-on-page-primary)' }}
        >
          {sectionIndex + 1}. {system.name}
        </h2>

        <p
          className="mt-3 mb-4 text-[clamp(13px,1.05vw,15px)] leading-[1.9] [font-family:var(--font-display)]"
          style={{ color: 'var(--text-on-page-secondary)' }}
        >
          {system.description}
        </p>

        {system.academicNote && (
          <p
            className="mb-4 border-l pl-3 text-[12px] italic leading-relaxed [font-family:var(--font-display)]"
            style={{ color: 'var(--text-on-page-tertiary)', borderColor: 'var(--surface-page-edge)' }}
          >
            {system.academicNote}
            <span
              className="mt-1 block text-[11px] not-italic uppercase tracking-[0.08em] [font-family:var(--font-ui)]"
              style={{ color: 'var(--text-on-page-tertiary)' }}
            >
              — Silverlight Scholarly Record
            </span>
          </p>
        )}

        {system.id === 'allomancy' && (
          <div className="mb-5">
            <AllomanticTable />
          </div>
        )}

        <div className="mb-4">
          <p
            className="mb-1.5 text-[11px] uppercase tracking-[0.15em] [font-family:var(--font-ui)]"
            style={{ color: 'var(--text-on-page-tertiary)' }}
          >
            Research Record
          </p>
          <div className="space-y-[2px]">
            <RecordField label="Origin">{planet?.name ?? system.planetId}</RecordField>
            <RecordField label="Shard">{system.shard}</RecordField>
            {system.classification && <RecordField label="Classification">{system.classification}</RecordField>}
            {system.status && <RecordField label="Status">{system.status}</RecordField>}
            {books.length > 0 && (
              <RecordField label="Appears in">
                {books.map((book, index) => (
                  <span key={book.id}>
                    {index > 0 && <span style={{ color: 'var(--text-on-page-tertiary)' }}>; </span>}
                    <span>{book.title}</span>
                  </span>
                ))}
              </RecordField>
            )}
          </div>
        </div>

        {(related.samePlanet.length > 0 || shardRefs.length > 0 || classRefs.length > 0) && (
          <div>
            <p
              className="mb-1 text-[11px] uppercase tracking-[0.15em] [font-family:var(--font-ui)]"
              style={{ color: 'var(--text-on-page-tertiary)' }}
            >
              See also
            </p>
            <div className="space-y-[1px]">
              {related.samePlanet.map((candidate) => {
                const section = Math.max(
                  0,
                  systems.findIndex((entry) => entry.id === candidate.id),
                )
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => goToSystem(candidate, true)}
                    className={`${TEXT_BUTTON} block text-[12px] italic underline-offset-2 transition-colors duration-150 hover:underline [font-family:var(--font-display)]`}
                    style={{ color: 'var(--text-on-page-link)' }}
                  >
                    → Sec. {section + 1}: {candidate.name}
                  </button>
                )
              })}
              {shardRefs.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => goToSystem(candidate, false)}
                  className={`${TEXT_BUTTON} block text-[12px] italic underline-offset-2 transition-colors duration-150 hover:underline [font-family:var(--font-display)]`}
                  style={{ color: 'var(--text-on-page-link)' }}
                >
                  → {candidate.name} · Ch. {chapterNumeral(candidate.planetId)} ({candidate.shard})
                </button>
              ))}
              {classRefs.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => goToSystem(candidate, false)}
                  className={`${TEXT_BUTTON} block text-[12px] italic underline-offset-2 transition-colors duration-150 hover:underline [font-family:var(--font-display)]`}
                  style={{ color: 'var(--text-on-page-link)' }}
                >
                  → {candidate.name} · Ch. {chapterNumeral(candidate.planetId)} ({system.classification})
                </button>
              ))}
            </div>
          </div>
        )}

        {characters.length > 0 && (
          <div className="mt-3">
            <p
              className="mb-1 text-[11px] uppercase tracking-[0.15em] [font-family:var(--font-ui)]"
              style={{ color: 'var(--text-on-page-tertiary)' }}
            >
              Known Practitioners
            </p>
            <p
              className="text-[12px] leading-relaxed [font-family:var(--font-display)]"
              style={{ color: 'var(--text-on-page-secondary)' }}
            >
              {characters.map((character, index) => (
                <span key={character.id}>
                  {index > 0 && <span style={{ color: 'var(--text-on-page-tertiary)' }}>, </span>}
                  <button
                    type="button"
                    onClick={() => navigate(`/characters?character=${character.id}`)}
                    className={`${TEXT_BUTTON} underline transition-colors duration-150 hover:text-[color:var(--text-on-page-link)]`}
                    style={{
                      color: 'var(--text-on-page-secondary)',
                      textDecorationColor: 'var(--surface-page-edge)',
                      textUnderlineOffset: '2px',
                    }}
                  >
                    {character.name}
                  </button>
                </span>
              ))}
            </p>
          </div>
        )}
      </section>
    )
  }

  const renderLeaf = (leaf: CodexLeaf | undefined): ReactNode => {
    if (!leaf) return null

    if (leaf.id === 'contents') {
      return <ContentsPage part={contentsPart} companion={recordCompanion} />
    }
    if (leaf.id === 'title') return <TitlePage />
    if (leaf.id === 'index') {
      return <ArchivalIndex systems={MAGIC_SYSTEMS} onSelectSystem={(system) => goToSystem(system, false)} />
    }
    if (leaf.id === 'index-world') {
      return (
        <ByWorldPage
          chapters={chapters}
          onOpenChapter={openChapter}
          onOpenSystem={(system) => goToSystem(system, false)}
        />
      )
    }
    if (leaf.view === 'chapter' && leaf.chapterId) {
      const chapter = chapterByPlanet.get(leaf.chapterId)
      if (!chapter) return null
      return (
        <ChapterPage
          chapter={chapter}
          onOpenSystem={(system) => goToSystem(system, true)}
          onOpenContents={openContents}
        />
      )
    }
    const systemId = leaf.systemIds?.[0]
    if (systemId) {
      const system = systemById.get(systemId)
      return system ? renderSection(system) : null
    }
    return null
  }

  const views: CodexSpreadView[] = spreads.map((spread) => {
    const chapter = spread.chapterId ? chapterByPlanet.get(spread.chapterId) : undefined
    const planet = chapter?.planet
    const leftLeaf = spread.leftId ? leafById.get(spread.leftId) : undefined
    const rightLeaf = spread.rightId ? leafById.get(spread.rightId) : undefined

    return {
      id: spread.id,
      title: spread.title,
      left: renderLeaf(leftLeaf),
      right: renderLeaf(rightLeaf),
      leftFolio: spread.folios[0] ?? undefined,
      rightFolio: spread.folios[1] ?? undefined,
      leftHeader: planet?.name ?? 'Ars Arcanum',
      rightHeader: planet?.name ?? (spread.view === 'index' ? 'Index' : 'Investiture'),
    }
  })

  return (
    <Codex
      spreads={views}
      index={route.index}
      onTurn={(next) => {
        const spread = spreads[next]
        if (spread) route.turnTo(spread.id)
      }}
      edition={edition}
      part="investiture"
      label="Ars Arcanum"
      thumbs={<ThumbTabs label="World chapters" tabs={worldTabs} />}
    />
  )
}
