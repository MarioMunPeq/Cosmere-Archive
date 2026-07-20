import { useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'
import { ALL_CHARACTERS, getPlanetById } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import { CHARACTER_RELATIONSHIPS } from '@/data/static/static-data'
import { FAMILY_TREES } from '@/data/static/family-data'
import ArchivalViewer from '@/components/ars-arcanum/ArchivalViewer'
import BiographicalContents from '@/components/biographical-archives/BiographicalContents'
import CharacterRecord from '@/components/biographical-archives/CharacterRecord'
import FamilyTreeRenderer from '@/components/biographical-archives/FamilyTreeRenderer'
import ConnectionDiagram from '@/components/biographical-archives/ConnectionDiagram'
import type { Character } from '@/types/character'

type Chapter = 'contents' | 'records' | 'bloodlines' | 'connections'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const

function getCharactersForText(q: string): Character[] {
  const lq = q.toLowerCase()
  return ALL_CHARACTERS.filter(
    (c) =>
      c.name.toLowerCase().includes(lq) ||
      c.description.toLowerCase().includes(lq) ||
      c.planet.toLowerCase().includes(lq),
  )
}

function groupByFirstLetter(chars: Character[]): Map<string, Character[]> {
  const map = new Map<string, Character[]>()
  for (const c of chars) {
    const letter = c.name.charAt(0).toUpperCase()
    const existing = map.get(letter) ?? []
    existing.push(c)
    map.set(letter, existing)
  }
  return map
}

export default function BiographicalArchivesPage() {
  const [searchParams] = useSearchParams()
  const navigate = useViewTransitionNavigate()
  const [chapter, setChapter] = useState<Chapter>(() => {
    const tab = searchParams.get('tab')
    if (tab === 'bloodlines') return 'bloodlines'
    if (tab === 'connections') return 'connections'
    if (searchParams.get('character') || tab === 'records') return 'records'
    return 'contents'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCharId, setSelectedCharId] = useState<string | null>(() => {
    const char = searchParams.get('character')
    if (char && ALL_CHARACTERS.some((c) => c.id === char)) return char
    if (searchParams.get('tab') === 'records') return ALL_CHARACTERS[0]?.id ?? null
    return null
  })

  const [activeFamilyId, setActiveFamilyId] = useState<string>(FAMILY_TREES[0]?.id ?? '')
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [connectionSelectedId, setConnectionSelectedId] = useState<string>('hoid')

  useSEOMeta({
    title: 'Biographical Archives — Cosmere Archive',
    description:
      'Collected biographies, bloodlines and historical records of notable individuals throughout the Cosmere.',
  })

  const filteredCharacters = useMemo(() => {
    const q = searchQuery.trim()
    if (!q) return ALL_CHARACTERS
    return getCharactersForText(q)
  }, [searchQuery])

  const groupedCharacters = useMemo(() => groupByFirstLetter(filteredCharacters), [filteredCharacters])

  const sortedLetters = useMemo(
    () => Array.from(groupedCharacters.entries()).sort((a, b) => a[0].localeCompare(b[0])),
    [groupedCharacters],
  )

  const familiesWithCounts = useMemo(
    () => FAMILY_TREES.map((f, idx) => ({ ...f, roman: ROMAN[idx] ?? '', memberCount: f.members.length })),
    [],
  )

  const connectionSortedChars = useMemo(() => {
    const map = new Map<string, number>()
    for (const rel of CHARACTER_RELATIONSHIPS) {
      for (const id of rel.characters) map.set(id, (map.get(id) ?? 0) + 1)
    }
    return ALL_CHARACTERS.map((c) => ({ id: c.id, name: c.name, count: map.get(c.id) ?? 0 }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [])

  const handleSelectChapter = useCallback((ch: 'records' | 'bloodlines' | 'connections') => {
    setChapter(ch)
    if (ch !== 'records') setSearchQuery('')
  }, [])

  const handleBackToContents = useCallback(() => {
    setChapter('contents')
    setSelectedCharId(null)
    setSearchQuery('')
  }, [])

  const scrollToRecord = useCallback((charId: string) => {
    requestAnimationFrame(() => {
      document.getElementById(`record-${charId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const openCharacter = useCallback(
    (id: string) => {
      setChapter('records')
      setSelectedCharId(id)
      scrollToRecord(id)
    },
    [scrollToRecord],
  )

  const renderLeft = () => {
    if (chapter === 'contents') {
      return <BiographicalContents onSelectChapter={handleSelectChapter} />
    }

    if (chapter === 'records') {
      return (
        <div className="flex flex-col h-full">
          <h2
            className="font-serif text-[14px] uppercase tracking-[0.18em] mb-6 font-bold"
            style={{ color: 'rgba(60,45,30,0.45)' }}
          >
            Character Index
          </h2>
          {/* Search line — like finding a record in an archive */}
          <div
            className="relative mb-5 pb-3 manuscript-search"
            style={{ borderBottom: '1px solid rgba(80,60,40,0.05)' }}
          >
            <div className="flex items-center gap-3">
              <span className="search-icon">Q</span>
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="manuscript-input flex-1 pl-[14px] py-0.5 font-serif text-[13px]"
                style={{ color: 'rgba(60,40,25,0.65)' }}
              />
              {searchQuery && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => setSearchQuery('')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSearchQuery('')
                    }
                  }}
                  className="font-serif text-[9px] cursor-pointer transition-opacity hover:opacity-60"
                  style={{ color: 'rgba(80,60,40,0.18)' }}
                >
                  Clear
                </span>
              )}
            </div>
          </div>
          {/* Letter-section index */}
          <div className="flex-1 overflow-y-auto manuscript-scrollbar">
            {sortedLetters.length === 0 ? (
              <p className="font-serif text-[12px] italic" style={{ color: 'rgba(80,60,40,0.3)' }}>
                No entries match your query.
              </p>
            ) : (
              sortedLetters.map(([letter, chars]) => (
                <div key={letter} className="mb-5">
                  <span
                    className="font-serif text-[12px] font-bold tracking-[0.1em]"
                    style={{ color: 'rgba(60,40,25,0.35)' }}
                  >
                    {letter}
                  </span>
                  {chars.map((c) => {
                    const isActive = c.id === selectedCharId
                    const planetMeta = getPlanetById(c.planet)
                    const planetColor = planetMeta?.color ?? 'rgba(80,60,40,0.3)'
                    const planetAbbr = (planetMeta?.name ?? c.planet).slice(0, 3).toLowerCase()
                    return (
                      <div
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedCharId(c.id)
                          scrollToRecord(c.id)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedCharId(c.id)
                            scrollToRecord(c.id)
                          }
                        }}
                        className="flex items-center gap-2 py-[2px] cursor-pointer group"
                        style={{ paddingLeft: '22px' }}
                      >
                        <span
                          className="font-serif text-[14px] tracking-[0.01em] transition-colors group-hover:opacity-60"
                          style={{ color: isActive ? '#2d1a0e' : 'rgba(45,26,14,0.6)' }}
                        >
                          {c.name}
                        </span>
                        <span
                          className="flex-1 min-w-[8px]"
                          style={{ borderBottom: '1px dotted rgba(80,60,40,0.06)' }}
                        />
                        <span
                          className="font-serif text-[10px] tracking-[0.04em]"
                          style={{ color: `${planetColor}70` }}
                        >
                          {planetAbbr}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(80,60,40,0.04)' }}>
            <span
              role="button"
              tabIndex={0}
              onClick={handleBackToContents}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleBackToContents()
                }
              }}
              className="font-serif text-[10px] uppercase tracking-[0.1em] cursor-pointer transition-opacity hover:opacity-60"
              style={{ color: 'rgba(80,60,40,0.25)' }}
            >
              ← Contents
            </span>
            <span className="float-right font-serif text-[9px] italic" style={{ color: 'rgba(80,60,40,0.12)' }}>
              Fol. 25–27
            </span>
          </div>
        </div>
      )
    }

    if (chapter === 'bloodlines') {
      return (
        <div className="flex flex-col h-full">
          <h2
            className="font-serif text-[14px] uppercase tracking-[0.18em] mb-6 font-bold"
            style={{ color: 'rgba(60,45,30,0.45)' }}
          >
            Archives of Bloodlines
          </h2>
          <div className="flex-1 space-y-[1px] overflow-y-auto manuscript-scrollbar">
            {familiesWithCounts.map((f) => {
              const isActive = f.id === activeFamilyId
              return (
                <div
                  key={f.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setActiveFamilyId(f.id)
                    setSelectedMemberId(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActiveFamilyId(f.id)
                      setSelectedMemberId(null)
                    }
                  }}
                  className="flex items-baseline gap-2 py-[3px] cursor-pointer group"
                >
                  <span
                    className="font-serif text-[11px] font-medium min-w-[22px] text-right"
                    style={{ color: isActive ? 'rgba(180,160,90,0.55)' : 'rgba(80,60,40,0.18)' }}
                  >
                    {f.roman}.
                  </span>
                  <span
                    className="font-serif text-[16px] tracking-[0.02em] transition-colors group-hover:opacity-60"
                    style={{ color: isActive ? '#2d1a0e' : 'rgba(45,26,14,0.55)' }}
                  >
                    {f.name}
                  </span>
                  <span className="flex-1 min-w-[8px]" style={{ borderBottom: '1px dotted rgba(80,60,40,0.04)' }} />
                  <span
                    className="font-serif text-[10px]"
                    style={{ color: isActive ? 'rgba(80,60,40,0.25)' : 'rgba(80,60,40,0.12)' }}
                  >
                    {f.memberCount}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(80,60,40,0.04)' }}>
            <span
              role="button"
              tabIndex={0}
              onClick={handleBackToContents}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleBackToContents()
                }
              }}
              className="font-serif text-[10px] uppercase tracking-[0.1em] cursor-pointer transition-opacity hover:opacity-60"
              style={{ color: 'rgba(80,60,40,0.25)' }}
            >
              ← Contents
            </span>
            <span className="float-right font-serif text-[9px] italic" style={{ color: 'rgba(80,60,40,0.12)' }}>
              Fol. 28–30
            </span>
          </div>
        </div>
      )
    }

    if (chapter === 'connections') {
      return (
        <div className="flex flex-col h-full">
          <h2
            className="font-serif text-[14px] uppercase tracking-[0.18em] mb-6 font-bold"
            style={{ color: 'rgba(60,45,30,0.45)' }}
          >
            Index of Connections
          </h2>
          <div
            className="relative mb-4 pb-3 manuscript-search"
            style={{ borderBottom: '1px solid rgba(80,60,40,0.05)' }}
          >
            <div className="flex items-center gap-3">
              <span className="search-icon">Q</span>
              <input
                type="text"
                placeholder="Search entries..."
                className="manuscript-input flex-1 pl-[14px] py-0.5 font-serif text-[13px]"
                style={{ color: 'rgba(60,40,25,0.65)' }}
                onChange={(e) => {
                  const q = e.target.value.toLowerCase()
                  if (!q) return
                  const match = connectionSortedChars.find((c) => c.name.toLowerCase().includes(q))
                  if (match) setConnectionSelectedId(match.id)
                }}
              />
            </div>
          </div>
          <div className="flex-1 space-y-[1px] overflow-y-auto manuscript-scrollbar">
            {connectionSortedChars.map((entry) => {
              const isActive = entry.id === connectionSelectedId
              return (
                <div
                  key={entry.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setConnectionSelectedId(entry.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setConnectionSelectedId(entry.id)
                    }
                  }}
                  className="flex items-baseline gap-2 py-[2px] cursor-pointer group"
                >
                  <span
                    className="font-serif text-[14px] tracking-[0.02em] transition-colors group-hover:opacity-60"
                    style={{ color: isActive ? '#2d1a0e' : 'rgba(45,26,14,0.55)' }}
                  >
                    {entry.name}
                  </span>
                  <span className="flex-1 min-w-[8px]" style={{ borderBottom: '1px dotted rgba(80,60,40,0.04)' }} />
                  <span
                    className="font-serif text-[10px]"
                    style={{ color: isActive ? 'rgba(80,60,40,0.25)' : 'rgba(80,60,40,0.12)' }}
                  >
                    {entry.count}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(80,60,40,0.04)' }}>
            <span
              role="button"
              tabIndex={0}
              onClick={handleBackToContents}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleBackToContents()
                }
              }}
              className="font-serif text-[10px] uppercase tracking-[0.1em] cursor-pointer transition-opacity hover:opacity-60"
              style={{ color: 'rgba(80,60,40,0.25)' }}
            >
              ← Contents
            </span>
            <span className="float-right font-serif text-[9px] italic" style={{ color: 'rgba(80,60,40,0.12)' }}>
              Fol. 31–32
            </span>
          </div>
        </div>
      )
    }

    return null
  }

  const renderRight = () => {
    if (chapter === 'contents') {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full">
          <div className="mb-4 h-px w-14" style={{ background: 'rgba(80,60,40,0.08)' }} />
          <h1
            className="font-serif font-bold tracking-[0.15em] leading-tight"
            style={{ color: '#2d1a0e', fontSize: 'clamp(26px, 3.5vw, 48px)' }}
          >
            Biographical
            <br />
            Archives
          </h1>
          <div className="mt-5 h-px w-12" style={{ background: 'rgba(80,60,40,0.06)' }} />
          <p
            className="mt-6 font-serif italic leading-relaxed max-w-[420px]"
            style={{ color: 'rgba(80,60,40,0.55)', fontSize: 'clamp(12px, 1.1vw, 15px)' }}
          >
            Collected biographies, bloodlines and historical records of notable individuals throughout the Cosmere
          </p>
          <div className="mt-10 space-y-[5px]">
            <p className="font-serif" style={{ color: 'rgba(80,60,40,0.35)', fontSize: 'clamp(10px, 0.9vw, 12px)' }}>
              Compiled from records preserved within the Silverlight Archives
            </p>
            <p
              className="font-serif italic"
              style={{ color: 'rgba(80,60,40,0.2)', fontSize: 'clamp(9px, 0.8vw, 11px)' }}
            >
              Fol. 25–32
            </p>
          </div>
          <div className="mt-12 h-px w-14" style={{ background: 'rgba(80,60,40,0.08)' }} />
          <p
            className="mt-5 font-serif uppercase tracking-[0.15em]"
            style={{ color: 'rgba(80,60,40,0.15)', fontSize: 'clamp(8px, 0.7vw, 10px)' }}
          >
            — Silverlight Edition —
          </p>
        </div>
      )
    }

    if (chapter === 'records') {
      if (!filteredCharacters.length) {
        return (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <p
              className="font-serif italic"
              style={{ color: 'rgba(80,60,40,0.35)', fontSize: 'clamp(10px, 0.85vw, 12px)' }}
            >
              No records match your query.
            </p>
          </div>
        )
      }

      return (
        <div>
          {filteredCharacters.map((char) => (
            <CharacterRecord
              key={char.id}
              character={char}
              magicSystems={MAGIC_SYSTEMS}
              onNavigatePlanet={(planetId) => navigate(`/celestial-charts?focus=planet&id=${planetId}`)}
              onNavigateMagic={(systemId) => navigate(`/magic?system=${systemId}`)}
              onNavigateBook={(bookId) => navigate(`/books/${bookId}`)}
              onNavigateChapter={(ch) => handleSelectChapter(ch)}
            />
          ))}
        </div>
      )
    }

    if (chapter === 'bloodlines') {
      return (
        <FamilyTreeRenderer
          activeFamilyId={activeFamilyId}
          selectedMemberId={selectedMemberId}
          onSelectMember={(memberId, charId) => {
            setSelectedMemberId(memberId)
            if (charId) openCharacter(charId)
          }}
        />
      )
    }

    if (chapter === 'connections') {
      return <ConnectionDiagram selectedId={connectionSelectedId} onNavigateCharacter={openCharacter} />
    }

    return null
  }

  const folioMap: Record<Chapter, [string, string, string, string]> = {
    contents: ['Contents', 'Biographical Archives', 'Table of Contents', 'Biographical Archives'],
    records: ['Fol. 25', 'Fol. 26–27', 'Character Index', 'Character Records'],
    bloodlines: ['Fol. 28', 'Fol. 29–30', 'Bloodlines Index', 'Genealogical Charts'],
    connections: ['Fol. 31', 'Fol. 32', 'Connections Index', 'Relationship Diagrams'],
  }
  const [leftFolio, rightFolio, leftHeader, rightHeader] = folioMap[chapter] ?? ['', '', '', '']

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 50%, #1a1008 0%, #0f0a06 100%)' }}
    >
      <div className="relative flex flex-1 min-h-0">
        <ArchivalViewer
          key={`${chapter}-${selectedCharId ?? ''}`}
          left={renderLeft()}
          right={renderRight()}
          leftFolio={leftFolio}
          rightFolio={rightFolio}
          leftHeader={leftHeader}
          rightHeader={rightHeader}
        />
      </div>
    </div>
  )
}
