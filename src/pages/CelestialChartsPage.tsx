import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import ArchivalViewer from '@/components/ars-arcanum/ArchivalViewer'
import AtlasIndex from '@/components/celestial-charts/AtlasIndex'
import { TitlePageLeft, TitlePageRight } from '@/components/celestial-charts/SilverlightTitle'
import CelestialChart from '@/components/celestial-charts/CelestialChart'
import PlanetDossier from '@/components/celestial-charts/PlanetDossier'
import AtlasImmersiveDetails from '@/components/celestial-charts/AtlasImmersiveDetails'

type ViewState = 'title' | 'chart' | 'dossier' | 'foldout'

export default function CelestialChartsPage() {
  const [searchParams] = useSearchParams()
  const planetParam = searchParams.get('planet')

  const [view, setView] = useState<ViewState>(planetParam ? 'dossier' : 'title')
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(planetParam)
  const [activeRoute, setActiveRoute] = useState<{ id: string; planets: string[]; color: string } | null>(null)

  useSEOMeta({
    title: 'Celestial Charts — Cosmere Archive',
    description: 'Cartographic and astronomical records of planetary systems throughout the known Cosmere.',
  })

  const handleEnterAtlas = useCallback(() => {
    setView('chart')
  }, [])

  const handleSelectPlanet = useCallback((id: string) => {
    setSelectedPlanetId(id)
    setView('dossier')
    setActiveRoute(null)
  }, [])

  const handleBackToChart = useCallback(() => {
    setView('chart')
    setSelectedPlanetId(null)
  }, [])

  const handleInkRoute = useCallback(
    (route: { id: string; planets: string[]; color: string } | null) => {
      setActiveRoute(route)
      if (route && view !== 'chart') setView('chart')
    },
    [view],
  )

  const handleFoldOut = useCallback((_planetId: string) => {
    setView((v) => (v === 'foldout' ? 'dossier' : 'foldout'))
  }, [])

  const showImmersive = view !== 'title'
  const isDossierView = view === 'dossier' || view === 'foldout'

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 50%, #1a1008 0%, #0f0a06 100%)' }}
    >
      <div className="relative flex flex-1 min-h-0">
        {view === 'title' ? (
          <ArchivalViewer
            key="title"
            left={<TitlePageLeft onEnter={handleEnterAtlas} />}
            right={<TitlePageRight onEnter={handleEnterAtlas} />}
            leftFolio="i"
            rightFolio="ii"
            leftHeader="Title Page"
            rightHeader=""
            paperStain={true}
          />
        ) : view === 'chart' ? (
          <ArchivalViewer
            key="chart"
            left={
              <AtlasIndex
                onSelectPlanet={handleSelectPlanet}
                onInkRoute={handleInkRoute}
                selectedPlanetId={selectedPlanetId}
              />
            }
            right={
              <div className="w-full h-full min-h-0 flex flex-col pt-2">
                <CelestialChart
                  selectedPlanetId={selectedPlanetId}
                  onSelectPlanet={handleSelectPlanet}
                  activeRoute={activeRoute}
                />
              </div>
            }
            leftFolio="Fol. 9–12"
            rightFolio="Fol. 13–14"
            leftHeader="Atlas Index"
            rightHeader="Celestial Chart"
            paperStain={true}
          />
        ) : (
          <ArchivalViewer
            key={`dossier-${selectedPlanetId}-${view}`}
            left={
              <AtlasIndex
                onSelectPlanet={handleSelectPlanet}
                onInkRoute={handleInkRoute}
                selectedPlanetId={selectedPlanetId}
              />
            }
            right={
              selectedPlanetId ? (
                <PlanetDossier
                  planetId={selectedPlanetId}
                  onBack={handleBackToChart}
                  onFoldOut={handleFoldOut}
                  foldOutActive={view === 'foldout'}
                />
              ) : (
                <div className="w-full h-full min-h-0 flex flex-col pt-2">
                  <CelestialChart
                    selectedPlanetId={selectedPlanetId}
                    onSelectPlanet={handleSelectPlanet}
                    activeRoute={activeRoute}
                  />
                </div>
              )
            }
            leftFolio="Fol. 9–12"
            rightFolio={view === 'foldout' ? 'Fol. 14 (folded)' : 'Fol. 14'}
            leftHeader="Atlas Index"
            rightHeader={
              selectedPlanetId
                ? `Planetary Record — ${selectedPlanetId.charAt(0).toUpperCase() + selectedPlanetId.slice(1)}`
                : 'Celestial Chart'
            }
            paperStain={true}
          />
        )}

        {/* Immersive overlays for all non-title views */}
        {showImmersive && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
            <AtlasImmersiveDetails planetId={isDossierView ? selectedPlanetId : null} showDeskObjects={true} />
          </div>
        )}
      </div>
    </div>
  )
}
