import { useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'
import { ALL_CHARACTERS } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import { CHARACTER_RELATIONSHIPS } from '@/data/static/static-data'
import { FAMILY_TREES } from '@/data/static/family-data'
import ArchivalViewer from '@/components/ars-arcanum/ArchivalViewer'
import BiographicalContents from '@/components/biographical-archives/BiographicalContents'
import CharacterRecord from '@/components/biographical-archives/CharacterRecord'
import FamilyTreeRenderer from '@/components/biographical-archives/FamilyTreeRenderer'
import ConnectionDiagram from '@/components/biographical-archives/ConnectionDiagram'
import PortraitMedallion from '@/components/biographical-archives/PortraitMedallion'
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
  const [chapter, setChapter] = useState<Chapter>(() => (searchParams.get('character') ? 'records' : 'contents'))
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCharId, setSelectedCharId] = useState<string | null>(searchParams.get('character'))

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
          <h2 className="font-serif text-xs uppercase tracking-[0.15em] mb-4" style={{ color: 'rgba(80,60,40,0.35)' }}>
            Character Index
          </h2>
          <div className="relative mb-3">
            <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid rgba(80,60,40,0.06)' }}>
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent px-0 py-0.5 font-serif text-[11px] outline-none"
                style={{ color: 'rgba(60,40,25,0.5)' }}
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
                  className="font-serif text-[10px] cursor-pointer transition-opacity hover:opacity-60"
                  style={{ color: 'rgba(80,60,40,0.2)' }}
                >
                  Clear
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {sortedLetters.length === 0 ? (
              <p className="font-serif text-[10px] italic" style={{ color: 'rgba(80,60,40,0.25)' }}>
                No entries match your query.
              </p>
            ) : (
              sortedLetters.map(([letter, chars]) => (
                <div key={letter}>
                  <span
                    className="font-serif text-[10px] font-bold tracking-[0.04em]"
                    style={{ color: 'rgba(60,40,25,0.3)' }}
                  >
                    {letter}
                  </span>
                  {chars.map((c) => {
                    const isActive = c.id === selectedCharId
                    return (
                      <span
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
                      >
                        <PortraitMedallion name={c.name} size={22} />
                        <span
                          className="font-serif text-[12px] tracking-[0.02em]"
                          style={{ color: isActive ? '#2d1a0e' : 'rgba(45,26,14,0.55)' }}
                        >
                          {c.name}
                        </span>
                      </span>
                    )
                  })}
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
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
              style={{ color: 'rgba(80,60,40,0.3)' }}
            >
              ← Contents
            </span>
          </div>
        </div>
      )
    }

    if (chapter === 'bloodlines') {
      return (
        <div className="flex flex-col h-full">
          <h2 className="font-serif text-xs uppercase tracking-[0.15em] mb-4" style={{ color: 'rgba(80,60,40,0.35)' }}>
            Archives of Bloodlines
          </h2>
          <div className="flex-1 space-y-[2px] overflow-y-auto">
            {familiesWithCounts.map((f) => {
              const isActive = f.id === activeFamilyId
              return (
                <span
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
                    className="font-serif text-[10px] min-w-[18px] text-right"
                    style={{ color: isActive ? 'rgba(180,160,90,0.6)' : 'rgba(80,60,40,0.15)' }}
                  >
                    {f.roman}.
                  </span>
                  <span
                    className="font-serif text-sm tracking-[0.02em]"
                    style={{ color: isActive ? '#2d1a0e' : 'rgba(45,26,14,0.6)' }}
                  >
                    {f.name}
                  </span>
                  <span
                    className="ml-auto font-serif text-[9px]"
                    style={{ color: isActive ? 'rgba(80,60,40,0.3)' : 'rgba(80,60,40,0.12)' }}
                  >
                    {f.memberCount}
                  </span>
                </span>
              )
            })}
          </div>
        </div>
      )
    }

    if (chapter === 'connections') {
      return (
        <div className="flex flex-col h-full">
          <h2 className="font-serif text-xs uppercase tracking-[0.15em] mb-4" style={{ color: 'rgba(80,60,40,0.35)' }}>
            Index of Connections
          </h2>
          <div className="relative mb-2">
            <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid rgba(80,60,40,0.06)' }}>
              <input
                type="text"
                placeholder="Search entries..."
                className="flex-1 border-0 bg-transparent px-0 py-0.5 font-serif text-[11px] outline-none"
                style={{ color: 'rgba(60,40,25,0.5)' }}
                onChange={(e) => {
                  const q = e.target.value.toLowerCase()
                  if (!q) return
                  const match = connectionSortedChars.find((c) => c.name.toLowerCase().includes(q))
                  if (match) setConnectionSelectedId(match.id)
                }}
              />
            </div>
          </div>
          <div className="flex-1 space-y-[1px] overflow-y-auto">
            {connectionSortedChars.map((entry) => {
              const isActive = entry.id === connectionSelectedId
              return (
                <span
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
                    className="font-serif text-sm tracking-[0.02em]"
                    style={{ color: isActive ? '#2d1a0e' : 'rgba(45,26,14,0.55)' }}
                  >
                    {entry.name}
                  </span>
                  <span
                    className="ml-auto font-serif text-[9px]"
                    style={{ color: isActive ? 'rgba(80,60,40,0.3)' : 'rgba(80,60,40,0.12)' }}
                  >
                    {entry.count}
                  </span>
                </span>
              )
            })}
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
          <div className="mb-3 h-px w-12" style={{ background: 'rgba(80,60,40,0.12)' }} />
          <h1
            className="font-serif text-[clamp(22px,2.8vw,36px)] font-bold tracking-[0.12em] leading-tight"
            style={{ color: '#2d1a0e' }}
          >
            BIOGRAPHICAL
            <br />
            ARCHIVES
          </h1>
          <div className="mt-4 h-px w-10" style={{ background: 'rgba(80,60,40,0.1)' }} />
          <p
            className="mt-5 font-serif text-[clamp(10px,0.9vw,13px)] italic leading-relaxed max-w-[380px]"
            style={{ color: 'rgba(80,60,40,0.55)' }}
          >
            Collected biographies, bloodlines and historical records of notable individuals throughout the Cosmere
          </p>
          <div className="mt-8 space-y-1">
            <p className="font-serif text-[clamp(9px,0.8vw,11px)]" style={{ color: 'rgba(80,60,40,0.35)' }}>
              Compiled from records preserved within the Silverlight Archives
            </p>
            <p className="font-serif text-[clamp(8px,0.7vw,10px)] italic" style={{ color: 'rgba(80,60,40,0.25)' }}>
              Fol. 25–32
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
    }

    if (chapter === 'records') {
      if (!filteredCharacters.length) {
        return (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <p className="font-serif text-[11px] italic" style={{ color: 'rgba(80,60,40,0.35)' }}>
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
              onNavigatePlanet={(planetId) => navigate(`/map?focus=planet&id=${planetId}`)}
              onNavigateMagic={(systemId) => navigate(`/magic?system=${systemId}`)}
              onNavigateBook={(bookId) => navigate(`/books/${bookId}`)}
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
