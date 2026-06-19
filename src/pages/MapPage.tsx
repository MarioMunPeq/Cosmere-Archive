import { useState, useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BOOKS, PLANETS } from '@/data/static'
import { TIMELINE_EVENTS, CHARACTER_SPANS } from '@/data/static/timeline'
import UniverseMap from '@/components/map/UniverseMap'
import CharacterGrid from '@/components/map/CharacterGrid'
import WorldhopperGallery from '@/components/map/WorldhopperGallery'
import JourneyAnimation from '@/components/map/JourneyAnimation'
import TimelinePage from './TimelinePage'
import BookPanel from '@/components/detail/BookPanel'
import CharacterPanel from '@/components/detail/CharacterPanel'
import MapSkeleton from '@/components/common/MapSkeleton'
import type { Book } from '@/types'
import type { CharacterSpan } from '@/data/static/timeline/character-lifespans'

type Tab = 'map' | 'characters' | 'worldhoppers' | 'timeline'

export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [activeWorldhoppers, setActiveWorldhoppers] = useState<string[]>([])
  const [highlightedPlanet, setHighlightedPlanet] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('map')
  const [highlightedCharacter, setHighlightedCharacter] = useState<string | null>(null)
  const [activeJourney, setActiveJourney] = useState<string | null>(null)

  const planetMap = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>()
    PLANETS.forEach((p) => m.set(p.id, { x: p.x, y: p.y }))
    return m
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const paramsStr = searchParams.toString()

  const detailBook = useMemo<Book | null>(() => {
    if (searchParams.get('focus') !== 'book') return null
    const id = searchParams.get('id')
    if (!id) return null
    return BOOKS.find((b) => b.id === id) ?? null
  }, [searchParams])

  const detailCharacter = useMemo<CharacterSpan | null>(() => {
    if (searchParams.get('focus') !== 'character') return null
    const id = searchParams.get('id')
    if (!id) return null
    return CHARACTER_SPANS.find((c) => c.id === id) ?? null
  }, [searchParams])

  useEffect(() => {
    if (!paramsStr) return
    const focus = searchParams.get('focus')
    const id = searchParams.get('id')
    if (!focus || !id) return

    if (focus === 'book' || focus === 'character') {
      return
    }

    switch (focus) {
      case 'planet':
        queueMicrotask(() => {
          setSelectedPlanet(id)
          setHighlightedPlanet(id)
        })
        break
      case 'event': {
        const planet = searchParams.get('planet')
        if (planet) {
          queueMicrotask(() => {
            setSelectedPlanet(planet)
            setHighlightedPlanet(planet)
          })
        } else {
          const event = TIMELINE_EVENTS.find((e) => e.id === id)
          if (event && event.planets.length > 0) {
            const eventPlanet = event.planets[0]!
            queueMicrotask(() => {
              setSelectedPlanet(eventPlanet)
              setHighlightedPlanet(eventPlanet)
            })
          }
        }
        break
      }
      case 'worldhopper':
        queueMicrotask(() => {
          setActiveWorldhoppers((prev) => (prev.includes(id) ? prev : [...prev, id]))
        })
        break
    }

    setSearchParams({}, { replace: true })
  }, [paramsStr, searchParams, setSearchParams])

  const handleCloseDetail = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const toggleWorldhopper = useCallback((id: string) => {
    setActiveWorldhoppers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const handleSelectPlanet = useCallback(
    (id: string) => {
      setSelectedPlanet(id)
      setHighlightedPlanet(null)
      handleCloseDetail()
    },
    [handleCloseDetail],
  )

  const handleSelectCharacter = useCallback((id: string) => {
    setHighlightedCharacter(id)
    setSelectedPlanet(null)
    setTab('characters')
  }, [])

  const handleStartJourney = useCallback((id: string) => {
    setActiveJourney(id)
    setActiveWorldhoppers((prev) => prev.filter((x) => x !== id))
  }, [])

  const handleCloseJourney = useCallback(() => {
    setActiveJourney(null)
  }, [])

  if (loading) return <MapSkeleton />

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setTab('map')}
          className={`flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors sm:flex-none sm:px-6 ${
            tab === 'map' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setTab('characters')}
          className={`flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors sm:flex-none sm:px-6 ${
            tab === 'characters' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          Characters
        </button>
        <button
          onClick={() => setTab('worldhoppers')}
          className={`flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors sm:flex-none sm:px-6 ${
            tab === 'worldhoppers'
              ? 'border-b-2 border-purple-500 text-purple-400'
              : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          Worldhoppers
        </button>
        <button
          onClick={() => setTab('timeline')}
          className={`flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors sm:flex-none sm:px-6 ${
            tab === 'timeline' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          Timeline
        </button>
      </div>

      {tab === 'map' ? (
        <div className="relative flex min-h-0 flex-1">
          <UniverseMap
            selectedPlanet={detailBook || detailCharacter ? null : selectedPlanet}
            onSelectPlanet={(id) => {
              setSelectedPlanet(id)
              if (id) setHighlightedPlanet(null)
            }}
            activeWorldhoppers={activeWorldhoppers}
            onToggleWorldhopper={toggleWorldhopper}
            highlightedPlanet={highlightedPlanet}
            onSelectCharacter={handleSelectCharacter}
            onStartJourney={handleStartJourney}
          />

          {activeJourney && (
            <JourneyAnimation worldhopperId={activeJourney} planetMap={planetMap} onClose={handleCloseJourney} />
          )}

          {detailBook && <BookPanel book={detailBook} onClose={handleCloseDetail} />}

          {detailCharacter && (
            <CharacterPanel
              character={detailCharacter}
              onClose={handleCloseDetail}
              onSelectPlanet={handleSelectPlanet}
            />
          )}
        </div>
      ) : tab === 'timeline' ? (
        <TimelinePage />
      ) : tab === 'characters' ? (
        <CharacterGrid highlightedCharacter={highlightedCharacter} />
      ) : (
        <WorldhopperGallery />
      )}
    </div>
  )
}
