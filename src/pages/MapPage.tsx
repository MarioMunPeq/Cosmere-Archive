import { useState, useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BOOKS } from '@/data/static'
import { TIMELINE_EVENTS, CHARACTER_SPANS } from '@/data/static/timeline'
import UniverseMap from '@/components/map/UniverseMap'
import BookPanel from '@/components/detail/BookPanel'
import CharacterPanel from '@/components/detail/CharacterPanel'
import MapSkeleton from '@/components/common/MapSkeleton'
import type { Book } from '@/types'
import type { CharacterSpan } from '@/data/static/timeline/character-lifespans'

export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [activeWorldhoppers, setActiveWorldhoppers] = useState<string[]>([])
  const [highlightedPlanet, setHighlightedPlanet] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
  }, [paramsStr])

  const detailCharacter = useMemo<CharacterSpan | null>(() => {
    if (searchParams.get('focus') !== 'character') return null
    const id = searchParams.get('id')
    if (!id) return null
    return CHARACTER_SPANS.find((c) => c.id === id) ?? null
  }, [paramsStr])

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
        setSelectedPlanet(id)
        setHighlightedPlanet(id)
        break
      case 'event': {
        const planet = searchParams.get('planet')
        if (planet) {
          setSelectedPlanet(planet)
          setHighlightedPlanet(planet)
        } else {
          const event = TIMELINE_EVENTS.find((e) => e.id === id)
          if (event && event.planets.length > 0) {
            setSelectedPlanet(event.planets[0])
            setHighlightedPlanet(event.planets[0])
          }
        }
        break
      }
      case 'worldhopper':
        setActiveWorldhoppers(prev => prev.includes(id) ? prev : [...prev, id])
        break
    }

    setSearchParams({}, { replace: true })
  }, [paramsStr])

  const handleCloseDetail = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const toggleWorldhopper = useCallback((id: string) => {
    setActiveWorldhoppers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }, [])

  const handleSelectPlanet = useCallback((id: string) => {
    setSelectedPlanet(id)
    setHighlightedPlanet(null)
    handleCloseDetail()
  }, [handleCloseDetail])

  if (loading) return <MapSkeleton />

  return (
    <div className="relative flex min-h-0 flex-1">
      <UniverseMap
        selectedPlanet={detailBook || detailCharacter ? null : selectedPlanet}
        onSelectPlanet={(id) => { setSelectedPlanet(id); if (id) setHighlightedPlanet(null) }}
        activeWorldhoppers={activeWorldhoppers}
        onToggleWorldhopper={toggleWorldhopper}
        highlightedPlanet={highlightedPlanet}
      />

      {detailBook && (
        <BookPanel
          book={detailBook}
          onClose={handleCloseDetail}
        />
      )}

      {detailCharacter && (
        <CharacterPanel
          character={detailCharacter}
          onClose={handleCloseDetail}
          onSelectPlanet={handleSelectPlanet}
        />
      )}
    </div>
  )
}
