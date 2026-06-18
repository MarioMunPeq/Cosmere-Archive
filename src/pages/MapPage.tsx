import { useState, useCallback } from 'react'
import { TIMELINE_EVENTS } from '@/data/static/timeline'
import UniverseMap from '@/components/map/UniverseMap'
import EventsTab from '@/components/timeline/EventsTab'
import WorldhoppersTab from '@/components/timeline/WorldhoppersTab'

export default function MapPage() {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [activeWorldhoppers, setActiveWorldhoppers] = useState<string[]>([])
  const [highlightedPlanet, setHighlightedPlanet] = useState<string | null>(null)
  const [tab, setTab] = useState<'eventos' | 'saltamundos'>('eventos')

  const toggleWorldhopper = useCallback((id: string) => {
    setActiveWorldhoppers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }, [])

  const handleEventSelect = useCallback((eventId: string | null) => {
    if (!eventId) { setHighlightedPlanet(null); return }
    const event = TIMELINE_EVENTS.find((e) => e.id === eventId)
    if (event && event.planets.length > 0) {
      setHighlightedPlanet(event.planets[0])
      setSelectedPlanet(event.planets[0])
    }
  }, [])

  return (
    <section>
      {/* ── Header ─────────────────────────────── */}
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-purple-900/30 bg-gradient-to-br from-gray-950 via-purple-950/15 to-gray-950 px-6 py-5">
        <h1 className="text-xl font-bold tracking-tight text-purple-300">
          Universo del Cosmere
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Haz clic en un planeta del mapa para explorar. Selecciona eventos o worldhoppers en las pestañas de abajo.
        </p>
      </div>

      {/* ── Map ──────────────────────────────────── */}
      <div className="mb-4">
        <UniverseMap
          selectedPlanet={selectedPlanet}
          onSelectPlanet={(id) => { setSelectedPlanet(id); if (id) setHighlightedPlanet(null) }}
          activeWorldhoppers={activeWorldhoppers}
          onToggleWorldhopper={toggleWorldhopper}
          highlightedPlanet={highlightedPlanet}
        />
      </div>

      {/* ── Tabs ─────────────────────────────────── */}
      <div className="mb-4 flex gap-4 border-b border-gray-800">
        <button
          onClick={() => setTab('eventos')}
          className={`pb-2 text-sm font-medium transition-all ${
            tab === 'eventos'
              ? 'border-b-2 border-amber-400 text-amber-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Eventos
        </button>
        <button
          onClick={() => setTab('saltamundos')}
          className={`pb-2 text-sm font-medium transition-all ${
            tab === 'saltamundos'
              ? 'border-b-2 border-amber-400 text-amber-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Saltamundos
        </button>
      </div>

      {/* ── Tab content ──────────────────────────── */}
      {tab === 'eventos' && (
        <EventsTab onEventSelect={handleEventSelect} />
      )}

      {tab === 'saltamundos' && (
        <WorldhoppersTab
          activeWorldhoppers={activeWorldhoppers}
          onToggleWorldhopper={toggleWorldhopper}
          onSelectPlanet={(id) => { setSelectedPlanet(id); setTab('eventos') }}
        />
      )}
    </section>
  )
}
