import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'
import { getPlanetById, BOOKS, ALL_CHARACTERS } from '@/data/static'
import { MAGIC_SYSTEMS, type MagicSystem } from '@/data/static/magic-systems'
import type { Planet } from '@/types/planet'
import ArchivalViewer from '@/components/ars-arcanum/ArchivalViewer'
import ArchivalIndex from '@/components/ars-arcanum/ArchivalIndex'
import AllomanticTable from '@/components/magic/AllomanticTable'

type Mode = 'toc' | 'chapter' | 'index'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'] as const
const CHAPTER_ORDER = [
  'yolen',
  'roshar',
  'scadrial',
  'sel',
  'nalthis',
  'taldain',
  'threnody',
  'first-of-the-sun',
  'komashi',
  'lumar',
  'canticle',
]

function getChapters(): { planet: Planet; systems: MagicSystem[] }[] {
  const map = new Map<string, MagicSystem[]>()
  for (const s of MAGIC_SYSTEMS) {
    const existing = map.get(s.planetId) ?? []
    existing.push(s)
    map.set(s.planetId, existing)
  }
  return CHAPTER_ORDER.map((id) => {
    const planet = getPlanetById(id)
    const systems = map.get(id)
    return planet && systems ? { planet, systems } : null
  }).filter((x): x is { planet: Planet; systems: MagicSystem[] } => x !== null && x.planet !== undefined)
}

function getRelatedSystems(
  system: MagicSystem,
  allSystems: MagicSystem[],
): { samePlanet: MagicSystem[]; sameShard: MagicSystem[]; sameClassification: MagicSystem[] } {
  const samePlanet = allSystems.filter((s) => s.planetId === system.planetId && s.id !== system.id)
  const sameShard = allSystems.filter(
    (s) => s.shard === system.shard && s.planetId !== system.planetId && s.id !== system.id,
  )
  const sameClassification = system.classification
    ? allSystems.filter(
        (s) => s.classification === system.classification && s.planetId !== system.planetId && s.id !== system.id,
      )
    : []
  return { samePlanet, sameShard, sameClassification }
}

export default function MagicSystemsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useViewTransitionNavigate()
  const [mode, setMode] = useState<Mode>(() => (searchParams.get('system') ? 'chapter' : 'toc'))
  const [currentChapter, setCurrentChapter] = useState<string | null>(() => {
    const param = searchParams.get('system')
    if (param) {
      const sys = MAGIC_SYSTEMS.find((ms) => ms.id === param)
      return sys?.planetId ?? null
    }
    return null
  })
  const [scrollToSection, setScrollToSection] = useState<string | null>(searchParams.get('system'))

  useSEOMeta({
    title: 'Ars Arcanum — Cosmere Archive',
    description: 'Collected observations concerning the manifestations of Investiture throughout the known Cosmere.',
  })

  const chapters = useMemo(() => getChapters(), [])

  const chapterData = useMemo(() => {
    if (!currentChapter) return null
    return chapters.find((c) => c.planet.id === currentChapter) ?? null
  }, [currentChapter, chapters])

  const currentSystems = chapterData?.systems ?? []
  const chapterIndex = currentChapter ? CHAPTER_ORDER.indexOf(currentChapter) : -1

  const chaptersForToc = useMemo(
    () => chapters.map(({ planet, systems }, idx) => ({ planet, count: systems.length, roman: ROMAN[idx] ?? '' })),
    [chapters],
  )

  const openChapter = useCallback((planetId: string, sectionId?: string) => {
    setCurrentChapter(planetId)
    setMode('chapter')
    setScrollToSection(sectionId ?? null)
  }, [])

  const openIndex = useCallback(() => {
    setMode('index')
  }, [])

  const backToToc = useCallback(() => {
    setCurrentChapter(null)
    setMode('toc')
    setScrollToSection(null)
  }, [])

  const navigateToSystem = useCallback(
    (system: MagicSystem) => {
      if (system.planetId === currentChapter) {
        document.getElementById(`section-${system.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        openChapter(system.planetId, system.id)
      }
    },
    [currentChapter, openChapter],
  )

  const handleSystemClick = useCallback(
    (system: MagicSystem) => {
      openChapter(system.planetId)
    },
    [openChapter],
  )

  useEffect(() => {
    if (scrollToSection) {
      const id = scrollToSection
      requestAnimationFrame(() => {
        setScrollToSection(null)
        document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [scrollToSection])

  const renderSection = (system: MagicSystem, sectionIndex: number) => {
    const related = getRelatedSystems(system, currentSystems)
    const planet = chapterData?.planet
    const chars = ALL_CHARACTERS.filter((c) => c.planet === system.planetId)
    const books = system.bookIds
      .map((bid) => BOOKS.find((b) => b.id === bid))
      .filter((b): b is (typeof BOOKS)[number] => !!b)

    const allRelated = getRelatedSystems(system, MAGIC_SYSTEMS)
    const shardRefs = allRelated.sameShard.slice(0, 3)
    const classRefs = allRelated.sameClassification.slice(0, 3)

    return (
      <section key={system.id} id={`section-${system.id}`} className="mb-8">
        <div className="h-px w-full mb-4" style={{ background: 'rgba(80,60,40,0.06)' }} />

        <h2
          className="font-serif text-[clamp(16px,1.6vw,22px)] font-bold tracking-[0.04em] leading-tight"
          style={{ color: '#2d1a0e' }}
        >
          {sectionIndex + 1}. {system.name}
        </h2>

        <p
          className="font-serif text-[clamp(10px,0.85vw,13px)] leading-[1.9] mt-3 mb-4"
          style={{ color: 'rgba(40,30,20,0.75)' }}
        >
          {system.description}
        </p>

        {system.academicNote && (
          <p
            className="font-serif text-[10px] italic leading-relaxed mb-4 pl-3"
            style={{ color: 'rgba(80,60,40,0.45)' }}
          >
            {system.academicNote}
            <span
              className="block mt-1 text-[8px] not-italic uppercase tracking-[0.08em]"
              style={{ color: 'rgba(80,60,40,0.2)' }}
            >
              — Silverlight Scholarly Record
            </span>
          </p>
        )}

        {system.id === 'allomancy' && (
          <div className="mb-4 pl-3">
            <AllomanticTable />
          </div>
        )}

        <div className="mb-3">
          <p
            className="font-serif text-[8px] uppercase tracking-[0.15em] mb-1.5"
            style={{ color: 'rgba(80,60,40,0.2)' }}
          >
            Research Record
          </p>
          <div className="space-y-[1px]">
            <RecordField label="Origin">{planet?.name ?? system.planetId}</RecordField>
            <RecordField label="Shard">{system.shard}</RecordField>
            {system.classification && <RecordField label="Classification">{system.classification}</RecordField>}
            {system.status && <RecordField label="Status">{system.status}</RecordField>}
            {books.length > 0 && (
              <RecordField label="Appears in">
                {books.map((b, i) => (
                  <span key={b.id}>
                    {i > 0 && <span style={{ color: 'rgba(80,60,40,0.2)' }}>; </span>}
                    <span>{b.title}</span>
                  </span>
                ))}
              </RecordField>
            )}
          </div>
        </div>

        {(related.samePlanet.length > 0 || shardRefs.length > 0 || classRefs.length > 0) && (
          <div>
            <p
              className="font-serif text-[8px] uppercase tracking-[0.15em] mb-1"
              style={{ color: 'rgba(80,60,40,0.2)' }}
            >
              See also
            </p>
            <div className="space-y-[1px]">
              {related.samePlanet.map((s) => {
                const secNum = currentSystems.indexOf(s)
                return (
                  <span
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigateToSystem(s)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigateToSystem(s)
                      }
                    }}
                    className="block font-serif text-[11px] italic cursor-pointer transition-opacity hover:opacity-60"
                    style={{ color: 'rgba(60,40,25,0.45)' }}
                  >
                    → Sec. {secNum + 1}: {s.name}
                  </span>
                )
              })}
              {shardRefs.map((s) => {
                const chIdx = CHAPTER_ORDER.indexOf(s.planetId)
                const chRoman = chIdx >= 0 ? (ROMAN[chIdx] ?? '') : ''
                return (
                  <span
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigateToSystem(s)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigateToSystem(s)
                      }
                    }}
                    className="block font-serif text-[11px] italic cursor-pointer transition-opacity hover:opacity-60"
                    style={{ color: 'rgba(60,40,25,0.3)' }}
                  >
                    → {s.name} · Ch. {chRoman} ({s.shard})
                  </span>
                )
              })}
              {classRefs.map((s) => {
                const chIdx = CHAPTER_ORDER.indexOf(s.planetId)
                const chRoman = chIdx >= 0 ? (ROMAN[chIdx] ?? '') : ''
                return (
                  <span
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigateToSystem(s)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigateToSystem(s)
                      }
                    }}
                    className="block font-serif text-[11px] italic cursor-pointer transition-opacity hover:opacity-60"
                    style={{ color: 'rgba(60,40,25,0.3)' }}
                  >
                    → {s.name} · Ch. {chRoman} ({system.classification})
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {chars.length > 0 && (
          <div className="mt-3">
            <p
              className="font-serif text-[8px] uppercase tracking-[0.15em] mb-1"
              style={{ color: 'rgba(80,60,40,0.2)' }}
            >
              Known Practitioners
            </p>
            <p className="font-serif text-[11px]" style={{ color: 'rgba(60,40,25,0.55)' }}>
              {chars
                .map((c) => (
                  <span
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/characters?character=${c.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/characters?character=${c.id}`)
                      }
                    }}
                    className="cursor-pointer transition-opacity hover:opacity-60"
                    style={{
                      textDecoration: 'underline',
                      textDecorationColor: 'rgba(80,60,40,0.15)',
                      textUnderlineOffset: '2px',
                    }}
                  >
                    {c.name}
                  </span>
                ))
                .reduce((acc, el, i, arr) => {
                  if (i < arr.length - 1) {
                    return [
                      ...acc,
                      el,
                      <span key={`sep-${i}`} style={{ color: 'rgba(80,60,40,0.15)' }}>
                        ,{' '}
                      </span>,
                    ]
                  }
                  return [...acc, el]
                }, [] as React.ReactNode[])}
            </p>
          </div>
        )}
      </section>
    )
  }

  const renderLeft = () => {
    switch (mode) {
      case 'toc':
        return (
          <div>
            <h2
              className="font-serif text-xs uppercase tracking-[0.15em] mb-5"
              style={{ color: 'rgba(80,60,40,0.35)' }}
            >
              Contents
            </h2>
            <div className="space-y-[3px]">
              {chaptersForToc.map(({ planet, count, roman }) => (
                <span
                  key={planet.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openChapter(planet.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openChapter(planet.id)
                    }
                  }}
                  className="flex items-baseline gap-2 cursor-pointer group"
                >
                  <span
                    className="font-serif text-[11px] min-w-[22px] text-right"
                    style={{ color: 'rgba(80,60,40,0.25)' }}
                  >
                    {roman}.
                  </span>
                  <span
                    className="font-serif text-sm tracking-[0.02em] transition-colors duration-150 group-hover:opacity-60"
                    style={{ color: '#2d1a0e' }}
                  >
                    {planet.name}
                  </span>
                  <span className="flex-1 min-w-[12px]" style={{ borderBottom: '1px dotted rgba(80,60,40,0.08)' }} />
                  <span className="font-serif text-[10px]" style={{ color: 'rgba(80,60,40,0.2)' }}>
                    {count} manifestation{count !== 1 ? 's' : ''}
                  </span>
                </span>
              ))}
            </div>
            <div className="mt-8">
              <span
                role="button"
                tabIndex={0}
                onClick={openIndex}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openIndex()
                  }
                }}
                className="font-serif text-[10px] uppercase tracking-[0.1em] cursor-pointer transition-opacity hover:opacity-60"
                style={{ color: 'rgba(80,60,40,0.3)' }}
              >
                Archival Index →
              </span>
            </div>
          </div>
        )

      case 'chapter':
        return chapterData ? (
          <div>
            <span className="font-serif text-[9px] uppercase tracking-[0.12em]" style={{ color: 'rgba(80,60,40,0.2)' }}>
              Chapter {chapterIndex >= 0 ? ROMAN[chapterIndex] : ''}
            </span>
            <h1
              className="font-serif text-[clamp(18px,2vw,28px)] font-bold tracking-[0.06em] leading-tight mt-2 mb-1"
              style={{ color: '#2d1a0e' }}
            >
              {chapterData.planet.name}
            </h1>
            <div className="space-y-0.5 mt-3 mb-5">
              <p className="font-serif text-[10px]" style={{ color: 'rgba(80,60,40,0.3)' }}>
                <span style={{ color: 'rgba(80,60,40,0.15)' }}>
                  Shard{chapterData.planet.shard && chapterData.planet.shard.includes('&') ? 's' : ''}:
                </span>{' '}
                {chapterData.planet.shard ?? 'Unknown'}
              </p>
              <p className="font-serif text-[10px]" style={{ color: 'rgba(80,60,40,0.3)' }}>
                <span style={{ color: 'rgba(80,60,40,0.15)' }}>Investiture:</span> {currentSystems.length} documented
                manifestation{currentSystems.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-[1px]">
              {currentSystems.map((system, idx) => (
                <span
                  key={system.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    document
                      .getElementById(`section-${system.id}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      document
                        .getElementById(`section-${system.id}`)
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className="flex items-baseline gap-2 py-[3px] cursor-pointer group"
                >
                  <span
                    className="font-serif text-[10px] min-w-[18px] text-right"
                    style={{ color: 'rgba(80,60,40,0.15)' }}
                  >
                    {idx + 1}.
                  </span>
                  <span
                    className="font-serif text-sm tracking-[0.02em] transition-opacity group-hover:opacity-60"
                    style={{ color: '#2d1a0e' }}
                  >
                    {system.name}
                  </span>
                  {system.status && (
                    <span
                      className="ml-auto font-serif text-[8px] uppercase tracking-[0.06em]"
                      style={{ color: 'rgba(80,60,40,0.15)' }}
                    >
                      {system.status === 'Documented'
                        ? 'Doc.'
                        : system.status === 'Partially Documented'
                          ? 'Part.'
                          : system.status === 'Poorly Understood'
                            ? 'Unc.'
                            : system.status}
                    </span>
                  )}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <span
                role="button"
                tabIndex={0}
                onClick={backToToc}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    backToToc()
                  }
                }}
                className="font-serif text-[10px] uppercase tracking-[0.1em] cursor-pointer transition-opacity hover:opacity-60"
                style={{ color: 'rgba(80,60,40,0.3)' }}
              >
                ← Contents
              </span>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-serif text-[11px] italic" style={{ color: 'rgba(80,60,40,0.35)' }}>
              Select a chapter from the contents.
            </p>
          </div>
        )

      case 'index':
        return <ArchivalIndex systems={MAGIC_SYSTEMS} onSelectSystem={handleSystemClick} />
    }
  }

  const renderRight = () => {
    switch (mode) {
      case 'toc':
        return (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <div className="mb-3 h-px w-12" style={{ background: 'rgba(80,60,40,0.12)' }} />
            <h1
              className="font-serif text-[clamp(24px,3vw,42px)] font-bold tracking-[0.15em] leading-tight"
              style={{ color: '#2d1a0e' }}
            >
              ARS
              <br />
              ARCANUM
            </h1>
            <div className="mt-4 h-px w-10" style={{ background: 'rgba(80,60,40,0.1)' }} />
            <p
              className="mt-5 font-serif text-[clamp(10px,1vw,14px)] italic leading-relaxed max-w-[360px]"
              style={{ color: 'rgba(80,60,40,0.55)' }}
            >
              Collected observations concerning the manifestations of Investiture throughout the known Cosmere
            </p>
            <div className="mt-8 space-y-1">
              <p className="font-serif text-[clamp(9px,0.8vw,11px)]" style={{ color: 'rgba(80,60,40,0.35)' }}>
                Compiled from the research of Khrissalla
              </p>
              <p className="font-serif text-[clamp(8px,0.7vw,10px)] italic" style={{ color: 'rgba(80,60,40,0.25)' }}>
                Preserved within the Cosmere Archive
              </p>
            </div>
            <div className="mt-10 h-px w-12" style={{ background: 'rgba(80,60,40,0.12)' }} />
            <p
              className="mt-4 font-serif text-[clamp(7px,0.6vw,8px)] uppercase tracking-[0.12em]"
              style={{ color: 'rgba(80,60,40,0.15)' }}
            >
              — Silverlight Edition —
            </p>
          </div>
        )

      case 'chapter':
        return chapterData ? (
          <div>{currentSystems.map((system, idx) => renderSection(system, idx))}</div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <p
              className="font-serif text-[clamp(10px,0.9vw,13px)] italic leading-relaxed max-w-[360px]"
              style={{ color: 'rgba(80,60,40,0.4)' }}
            >
              Select a chapter from the contents.
            </p>
          </div>
        )

      case 'index':
        return (
          <div>
            <h2
              className="font-serif text-xs uppercase tracking-[0.15em] mb-5"
              style={{ color: 'rgba(80,60,40,0.35)' }}
            >
              By World
            </h2>
            <div className="space-y-4">
              {chapters.map(({ planet, systems }) => {
                const idx = CHAPTER_ORDER.indexOf(planet.id)
                return (
                  <div key={planet.id}>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => openChapter(planet.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          openChapter(planet.id)
                        }
                      }}
                      className="font-serif text-[12px] font-medium cursor-pointer transition-opacity hover:opacity-60"
                      style={{ color: '#2d1a0e' }}
                    >
                      {idx >= 0 ? (ROMAN[idx] ?? '') : ''}. {planet.name}
                    </span>
                    {systems.map((s) => (
                      <span
                        key={s.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigateToSystem(s)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            navigateToSystem(s)
                          }
                        }}
                        className="block font-serif text-[11px] pl-4 py-[1px] cursor-pointer transition-opacity hover:opacity-60"
                        style={{ color: 'rgba(60,40,25,0.45)' }}
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )
    }
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 50%, #1a1008 0%, #0f0a06 100%)' }}
    >
      <div className="relative flex flex-1 min-h-0">
        <ArchivalViewer left={renderLeft()} right={renderRight()} />
      </div>
    </div>
  )
}

function RecordField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span
        className="font-serif text-[9px] uppercase tracking-[0.1em] shrink-0 text-right"
        style={{ color: 'rgba(80,60,40,0.2)', minWidth: '80px' }}
      >
        {label}
      </span>
      <span className="font-serif text-[clamp(10px,0.8vw,12px)]" style={{ color: 'rgba(60,40,25,0.65)' }}>
        {children}
      </span>
    </div>
  )
}
