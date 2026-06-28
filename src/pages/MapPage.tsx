import { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BOOKS, PLANETS, getPlanetById, SAGA_BY_ID } from '@/data/static'
import ColorDot from '@/components/ui/ColorDot'
import { TIMELINE_EVENTS, CHARACTER_SPANS } from '@/data/static/timeline'
import UniverseMap from '@/components/map/UniverseMap'
import MapSkeleton from '@/components/common/MapSkeleton'
import SplitPane from '@/components/common/SplitPane'
import { CloseIcon } from '@/components/common/icons'
import BookCover from '@/components/common/BookCover'
import { JourneyProvider, JourneySvgContent } from '@/components/map/JourneyContext'
import type { Book } from '@/types'
import type { CharacterSpan } from '@/data/static/timeline/character-lifespans'
import { useSEOMeta } from '@/hooks/useSEOMeta'

function formatCharacterYear(year: number | null): string {
  if (year === null) return 'Unknown'
  if (year < 0) return `${Math.abs(year)} FE`
  return `${year}`
}

const JourneyAnimation = lazy(() => import('@/components/map/JourneyAnimation'))

export default function MapPage() {
  useSEOMeta({
    title: 'Cosmere Archive',
    description: 'Interactive map of the Cosmere universe — explore planets, worldhopper routes, and constellations',
    path: '/',
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [activeWorldhoppers, setActiveWorldhoppers] = useState<string[]>([])
  const [highlightedPlanet, setHighlightedPlanet] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeJourney, setActiveJourney] = useState<string | null>(null)
  const [flyToTarget, setFlyToTarget] = useState<{ planetId: string; x: number; y: number } | null>(null)

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
      case 'planet': {
        const p = getPlanetById(id)
        queueMicrotask(() => {
          setSelectedPlanet(id)
          setHighlightedPlanet(id)
          if (p) setFlyToTarget({ planetId: p.id, x: p.x, y: p.y })
        })
        break
      }
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

  const handleStartJourney = useCallback((id: string) => {
    setActiveJourney(id)
    setActiveWorldhoppers((prev) => prev.filter((x) => x !== id))
  }, [])

  const handleCloseJourney = useCallback(() => {
    setActiveJourney(null)
  }, [])

  const handleSelectMapPlanet = useCallback((id: string | null) => {
    setSelectedPlanet(id)
    if (id) setHighlightedPlanet(null)
  }, [])

  const handleFlyToDone = useCallback(() => {
    setFlyToTarget(null)
  }, [])

  if (loading) return <MapSkeleton />

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {detailBook || detailCharacter ? (
        <SplitPane
          left={
            <div className="flex h-full min-h-0 flex-1 flex-col">
              <JourneyProvider worldhopperId={activeJourney ?? ''} planetMap={planetMap} speed={1}>
                <UniverseMap
                  selectedPlanet={null}
                  onSelectPlanet={handleSelectMapPlanet}
                  activeWorldhoppers={activeWorldhoppers}
                  onToggleWorldhopper={toggleWorldhopper}
                  highlightedPlanet={highlightedPlanet}
                  onStartJourney={handleStartJourney}
                  flyToTarget={flyToTarget}
                  onFlyToDone={handleFlyToDone}
                >
                  {activeJourney && <JourneySvgContent />}
                </UniverseMap>
                {activeJourney && (
                  <Suspense fallback={null}>
                    <JourneyAnimation onClose={handleCloseJourney} />
                  </Suspense>
                )}
              </JourneyProvider>
            </div>
          }
          right={
            <div className="flex flex-col p-5">
              {detailBook && (
                <>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <BookCover book={detailBook} size="sm" />
                      <h3 className="text-lg font-bold text-gray-100">{detailBook.title}</h3>
                    </div>
                    <button
                      onClick={handleCloseDetail}
                      aria-label="Close"
                      className="text-gray-600 transition-colors hover:text-gray-300"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  {(() => {
                    const saga = SAGA_BY_ID.get(detailBook.saga)
                    return (
                      <>
                        {saga && <p className="mb-1 text-xs font-medium text-gray-500">{saga.name}</p>}
                        {detailBook.year && <p className="mb-3 text-xs text-gray-600">Published {detailBook.year}</p>}
                        {detailBook.description && (
                          <p className="mb-4 text-sm leading-relaxed text-gray-400">{detailBook.description}</p>
                        )}
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Saga</h4>
                          <span className="inline-block rounded bg-gray-800 px-2.5 py-1 text-xs text-gray-300">
                            {saga?.name ?? detailBook.saga}
                          </span>
                        </div>
                      </>
                    )
                  })()}
                </>
              )}
              {detailCharacter && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: detailCharacter.color }} />
                      <h3 className="text-lg font-bold text-gray-100">{detailCharacter.name}</h3>
                    </div>
                    <button
                      onClick={handleCloseDetail}
                      aria-label="Close"
                      className="text-gray-600 transition-colors hover:text-gray-300"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  {detailCharacter.titles.length > 0 && (
                    <p className="mb-3 text-xs text-gray-500">{detailCharacter.titles.join(', ')}</p>
                  )}
                  <div className="mb-4 flex gap-4 text-xs text-gray-500">
                    <span>
                      Born: <strong className="text-gray-400">{formatCharacterYear(detailCharacter.birthYear)}</strong>
                    </span>
                    <span>
                      Died: <strong className="text-gray-400">{formatCharacterYear(detailCharacter.deathYear)}</strong>
                    </span>
                  </div>
                  {(() => {
                    const planet = getPlanetById(detailCharacter.planet.toLowerCase())
                    return planet ? (
                      <div className="mb-4">
                        <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Home Planet
                        </h4>
                        <button
                          onClick={() => {
                            handleSelectPlanet(planet.id)
                            handleCloseDetail()
                          }}
                          className="flex items-center gap-2 rounded bg-gray-800 px-2.5 py-1.5 text-xs text-gray-300 transition-colors hover:bg-gray-700"
                        >
                          <ColorDot color={planet.color} />
                          {planet.name}
                        </button>
                      </div>
                    ) : null
                  })()}
                  <div>
                    <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Group</h4>
                    <span className="inline-block rounded bg-gray-800 px-2.5 py-1 text-xs text-gray-400">
                      {detailCharacter.group}
                    </span>
                  </div>
                </>
              )}
            </div>
          }
        />
      ) : (
        <div className="relative flex min-h-0 flex-1">
          <JourneyProvider worldhopperId={activeJourney ?? ''} planetMap={planetMap} speed={1}>
            <UniverseMap
              selectedPlanet={selectedPlanet}
              onSelectPlanet={handleSelectMapPlanet}
              activeWorldhoppers={activeWorldhoppers}
              onToggleWorldhopper={toggleWorldhopper}
              highlightedPlanet={highlightedPlanet}
              onStartJourney={handleStartJourney}
              flyToTarget={flyToTarget}
              onFlyToDone={handleFlyToDone}
            >
              {activeJourney && <JourneySvgContent />}
            </UniverseMap>

            {activeJourney && (
              <Suspense fallback={null}>
                <JourneyAnimation onClose={handleCloseJourney} />
              </Suspense>
            )}
          </JourneyProvider>
        </div>
      )}
    </div>
  )
}
