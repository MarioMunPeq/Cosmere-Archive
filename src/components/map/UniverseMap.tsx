import { useMemo, useState, useCallback } from 'react'
import { PLANETS, ALL_CHARACTERS, PLANET_BY_ID, SHARD_COLORS, FALLBACK_COLOR } from '@/data/static'
import { WORLDHOPPERS } from '@/data/static/timeline'
import { useShardTheme, ShardThemeProvider } from '@/contexts/ShardThemeContext'
import type { WorldhopperDisplay } from '@/data/static/timeline'
import type { Planet } from '@/types/planet'
import type { Character } from '@/types'
import PlanetRenderer from './PlanetRenderer'
import PlanetPanel from './PlanetPanel'
import WorldhopperDetailPanel from './WorldhopperDetailPanel'
import NavigationConsole from './NavigationConsole'
import StarField from './StarField'
import CosmicDust from './CosmicDust'
import PlanetLabels from './PlanetLabels'
import WorldhopperRoutes from './WorldhopperRoutes'
import PlanetTooltip from './PlanetTooltip'
import type { MapLayers } from './LayersToggle'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useMapInteraction } from '@/hooks/useMapInteraction'
import { MAP_VIEWBOX_W, MAP_VIEWBOX_H } from '@/constants'

interface Props {
  selectedPlanet: string | null
  onSelectPlanet: (id: string | null) => void
  activeWorldhoppers: string[]
  onToggleWorldhopper: (id: string) => void
  highlightedPlanet: string | null
  onSelectCharacter?: (id: string) => void
  onStartJourney?: (id: string) => void
  children?: React.ReactNode
}

function MapInner({
  selectedPlanet,
  onSelectPlanet,
  activeWorldhoppers,
  onToggleWorldhopper,
  highlightedPlanet,
  onSelectCharacter,
  onStartJourney,
  children,
}: Props) {
  const { theme: shardTheme, isActive: shardActive, primaryPlanetId } = useShardTheme()

  const {
    containerRef,
    svgRef,
    mapGroupRef,
    zoom,
    panX,
    panY,
    isPanning,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetView,
    zoomToCenter,
  } = useMapInteraction(null)

  const [closingPlanetId, setClosingPlanetId] = useState<string | null>(null)
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null)
  const [activeShards, setActiveShards] = useState<string[]>([])
  const [tooltipScreenPos, setTooltipScreenPos] = useState({ left: 0, top: 0 })
  const [layers, setLayers] = useState<MapLayers>({
    labels: true,
    routes: true,
    shardIcons: false,
    constellation: false,
    heatmap: false,
  })
  const [showConsole, setShowConsole] = useState(false)

  const shardData = useMemo(() => {
    const map = new Map<string, { color: string; planets: string[] }>()
    for (const p of PLANETS) {
      if (!p.shard) continue
      const parts = p.shard.split(/, | & /)
      for (const raw of parts) {
        const name = raw.replace(/\s*\(.*?\)\s*/g, '').trim()
        if (!name) continue
        if (!map.has(name)) map.set(name, { color: SHARD_COLORS[name] ?? FALLBACK_COLOR, planets: [] })
        const entry = map.get(name)
        if (entry) entry.planets.push(p.id)
      }
    }
    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data }))
  }, [])

  const charactersByPlanet = useMemo(() => {
    const map = new Map<string, Character[]>()
    for (const char of ALL_CHARACTERS) {
      const list = map.get(char.planet) ?? []
      list.push(char)
      map.set(char.planet, list)
    }
    return map
  }, [])

  const selected = selectedPlanet ? (PLANET_BY_ID.get(selectedPlanet) ?? null) : null
  const panelPlanet = selected ?? (closingPlanetId ? (PLANET_BY_ID.get(closingPlanetId) ?? null) : null)
  const panelCharacters = panelPlanet ? (charactersByPlanet.get(panelPlanet.id) ?? []) : []
  const isClosing = selected === null && closingPlanetId !== null
  const showPanel = selected !== null || closingPlanetId !== null

  const highlightedPlanets = useMemo(() => {
    const s = new Set<string>()
    if (activeShards.length > 0) {
      for (const sd of shardData) {
        if (activeShards.includes(sd.name)) sd.planets.forEach((pid) => s.add(pid))
      }
    }
    if (highlightedPlanet) s.add(highlightedPlanet)
    for (const whId of activeWorldhoppers) {
      const wh = WORLDHOPPERS.find((w) => w.id === whId)
      if (wh) wh.planets.forEach((p) => s.add(p))
    }
    if (shardActive && primaryPlanetId) s.add(primaryPlanetId)
    return s
  }, [activeShards, shardData, activeWorldhoppers, highlightedPlanet, shardActive, primaryPlanetId])

  const hasFilter = activeShards.length > 0 || activeWorldhoppers.length > 0 || shardActive

  const handleClosePanel = useCallback(() => {
    if (!selectedPlanet) return
    setClosingPlanetId(selectedPlanet)
    setTimeout(() => {
      onSelectPlanet(null)
      setClosingPlanetId(null)
    }, 300)
  }, [selectedPlanet, onSelectPlanet])

  const handlePlanetClick = useCallback(
    (planetId: string) => {
      if (selectedPlanet === planetId) {
        handleClosePanel()
      } else {
        setClosingPlanetId(null)
        onSelectPlanet(planetId)
      }
    },
    [onSelectPlanet, selectedPlanet, handleClosePanel],
  )

  const calculateTooltipPosition = useCallback(
    (tooltipPlanet: Planet) => {
      const svgEl = svgRef.current
      if (!svgEl) return { left: 0, top: 0 }
      const rect = svgEl.getBoundingClientRect()
      const svgW = rect.width
      const svgH = rect.height
      if (svgW === 0 || svgH === 0) return { left: 0, top: 0 }
      const screenX = ((tooltipPlanet.x * zoom + panX) / 900) * svgW + rect.left
      const screenY = ((tooltipPlanet.y * zoom + panY) / 600) * svgH + rect.top
      let left = screenX - rect.left + 15
      let top = screenY - rect.top - tooltipPlanet.size * 0.4 * zoom - 10
      const tooltipW = 224
      const containerW = containerRef.current?.clientWidth ?? 900
      if (left + tooltipW > containerW - 8) left = containerW - tooltipW - 8
      if (left < 8) left = 8
      if (top < 4) top = screenY - rect.top + tooltipPlanet.size * 0.4 * zoom + 10
      return { left, top }
    },
    [zoom, panX, panY, containerRef, svgRef],
  )

  const handlePlanetHover = useCallback(
    (planetId: string | null) => {
      setHoveredPlanetId(planetId)
      const planet = planetId ? PLANET_BY_ID.get(planetId) : null
      setTooltipScreenPos(planet ? calculateTooltipPosition(planet) : { left: 0, top: 0 })
    },
    [calculateTooltipPosition],
  )

  const tooltipPlanet = !selected && hoveredPlanetId ? (PLANET_BY_ID.get(hoveredPlanetId) ?? null) : null

  const activeWhDetail = useMemo(() => {
    if (activeWorldhoppers.length === 0 || selected) return null
    const whs = activeWorldhoppers
      .map((id) => WORLDHOPPERS.find((w) => w.id === id))
      .filter((w): w is WorldhopperDisplay => w !== undefined)
    return whs.length > 0 ? whs[0] : null
  }, [activeWorldhoppers, selected])

  const handleToggleLayer = useCallback((layer: keyof MapLayers) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }, [])

  const planetPanelRef = useFocusTrap(!!selected)
  const whPanelRef = useFocusTrap(!!activeWhDetail && selectedPlanet === null)

  const cssVars = useMemo(() => {
    if (!shardTheme) return {}
    return {
      '--theme-accent': shardTheme.accent,
      '--theme-accent-secondary': shardTheme.accentSecondary,
      '--theme-halo': shardTheme.haloColor,
      '--theme-route': shardTheme.routeColor,
      '--theme-particle': shardTheme.particleColor,
      '--theme-panel-accent': shardTheme.panelAccent,
      '--theme-glow-intensity': String(shardTheme.glowIntensity),
    } as React.CSSProperties
  }, [shardTheme])

  return (
    <ShardThemeProvider activeShardNames={activeShards}>
      <div ref={containerRef} className="relative flex min-h-0 flex-1 overflow-hidden" style={cssVars}>
        <div
          className="relative flex min-h-0 flex-1"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${MAP_VIEWBOX_W} ${MAP_VIEWBOX_H}`}
            className="block h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            style={{ touchAction: 'none' }}
            role="img"
            aria-label="Interactive map of the Cosmere galaxy showing all known planets"
          >
            <defs>
              {(
                [
                  ['roshar', '#22d3ee', '#0891b2', '#164e63'],
                  ['scadrial', '#f87171', '#b91c1c', '#450a0a'],
                  ['sel', '#5eead4', '#0d9488', '#134e4a'],
                  ['nalthis', '#f0abfc', '#a21caf', '#4a044e'],
                  ['taldain', '#fef08a', '#a16207', '#713f12'],
                  ['threnody', '#6b7280', '#4b5563', '#111827'],
                  ['first-of-the-sun', '#6ee7b7', '#15803d', '#14532d'],
                  ['komashi', '#7dd3fc', '#0369a1', '#0c4a6e'],
                  ['lumar', '#f9a8d4', '#db2777', '#831843'],
                  ['canticle', '#fde047', '#ea580c', '#7c2d12'],
                ] as const
              ).map(([id, c1, c2, c3]) => (
                <radialGradient key={id} id={`grad-${id}`} cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stop-color={c1} stop-opacity="1" />
                  <stop offset="50%" stop-color={c2} stop-opacity="1" />
                  <stop offset="100%" stop-color={c3} stop-opacity="1" />
                </radialGradient>
              ))}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <g ref={mapGroupRef}>
              <CosmicDust />
              <StarField />
              {layers.routes && (
                <WorldhopperRoutes
                  planetMap={PLANET_BY_ID}
                  activeWorldhoppers={activeWorldhoppers}
                  hasFilter={hasFilter}
                />
              )}
              {PLANETS.map((p) => (
                <g key={p.id}>
                  <PlanetRenderer
                    planet={p}
                    size={p.size * 0.4}
                    isSelected={selectedPlanet === p.id}
                    isHighlighted={hasFilter ? highlightedPlanets.has(p.id) : true}
                    onPlanetClick={handlePlanetClick}
                    onPlanetHover={handlePlanetHover}
                  />
                </g>
              ))}
              {layers.labels && <PlanetLabels />}
              {children}
            </g>
          </svg>
        </div>

        {showPanel && (
          <div className="pointer-events-none fixed inset-0 z-20 bg-black/20 transition-opacity duration-300" />
        )}

        {tooltipPlanet && (
          <PlanetTooltip planet={tooltipPlanet} left={tooltipScreenPos.left} top={tooltipScreenPos.top} />
        )}
        {showPanel && (
          <PlanetPanel
            selected={panelPlanet!}
            selectedCharacters={panelCharacters}
            onClose={handleClosePanel}
            onSelectCharacter={onSelectCharacter ?? (() => {})}
            onStartJourney={onStartJourney ?? (() => {})}
            panelRef={planetPanelRef}
            isClosing={isClosing}
          />
        )}
        {activeWhDetail && selectedPlanet === null && !closingPlanetId && (
          <WorldhopperDetailPanel
            wh={activeWhDetail}
            activeWorldhoppers={activeWorldhoppers}
            planetMap={PLANET_BY_ID}
            onToggleWorldhopper={onToggleWorldhopper}
            onSelectPlanet={onSelectPlanet}
            onStartJourney={onStartJourney}
            panelRef={whPanelRef}
          />
        )}

        <NavigationConsole
          show={showConsole}
          onToggle={() => setShowConsole((v) => !v)}
          shardData={shardData}
          activeShards={activeShards}
          onToggleShard={(name) =>
            setActiveShards((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]))
          }
          onClearShards={() => setActiveShards([])}
          worldhoppers={WORLDHOPPERS}
          activeWorldhoppers={activeWorldhoppers}
          onToggleWorldhopper={onToggleWorldhopper}
          onStartJourney={onStartJourney}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          zoom={zoom}
          onZoomIn={() => zoomToCenter(zoom + 0.25)}
          onZoomOut={() => zoomToCenter(zoom - 0.25)}
          onReset={resetView}
        />

        {!selected &&
          !closingPlanetId &&
          activeWorldhoppers.length === 0 &&
          activeShards.length === 0 &&
          !shardActive && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              <p className="text-xs text-gray-600">Scroll to zoom &middot; Drag to pan &middot; Click a planet</p>
            </div>
          )}
      </div>
    </ShardThemeProvider>
  )
}

export default MapInner
