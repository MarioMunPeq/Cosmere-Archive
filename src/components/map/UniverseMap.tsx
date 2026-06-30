import { useMemo, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import { PLANETS, ALL_CHARACTERS } from '@/data/static'
import { WORLDHOPPERS } from '@/data/static/timeline'
import type { WorldhopperDisplay } from '@/data/static/timeline'
import type { Planet } from '@/types/planet'
import type { Character } from '@/types'
import PlanetRenderer from './PlanetRenderer'
import PlanetPanel from './PlanetPanel'
import WorldhopperDetailPanel from './WorldhopperDetailPanel'
import ShardLegend from './ShardLegend'
import WorldhopperPicker from './WorldhopperPicker'
import ZoomControls from './ZoomControls'
import StarField from './StarField'
import PlanetLabels from './PlanetLabels'
import WorldhopperRoutes from './WorldhopperRoutes'
import PlanetTooltip from './PlanetTooltip'
import LayersToggle from './LayersToggle'
import ShardIcons from './ShardIcons'
import ConstellationLines from './ConstellationLines'
import WorldhopperHeatmap from './WorldhopperHeatmap'
import type { MapLayers } from './LayersToggle'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useMapInteraction } from '@/hooks/useMapInteraction'
import { SHARD_COLORS, FALLBACK_COLOR, PLANET_BY_ID } from '@/data/static'
import { MAP_VIEWBOX_W, MAP_VIEWBOX_H, ZOOM_STEP } from '@/constants'

interface Props {
  selectedPlanet: string | null
  onSelectPlanet: (id: string | null) => void
  activeWorldhoppers: string[]
  onToggleWorldhopper: (id: string) => void
  highlightedPlanet: string | null
  onSelectCharacter?: (id: string) => void
  onStartJourney?: (id: string) => void
  flyToTarget?: { planetId: string; x: number; y: number } | null
  onFlyToDone?: () => void
  children?: React.ReactNode
}

export interface UniverseMapHandle {
  mapGroupRef: React.RefObject<SVGGElement | null>
}

const UniverseMap = forwardRef<UniverseMapHandle, Props>(function UniverseMap(
  {
    selectedPlanet,
    onSelectPlanet,
    activeWorldhoppers,
    onToggleWorldhopper,
    highlightedPlanet,
    onSelectCharacter,
    onStartJourney,
    flyToTarget,
    onFlyToDone,
    children,
  },
  ref,
) {
  const {
    containerRef,
    svgRef,
    mapGroupRef,
    zoom,
    panX,
    panY,
    isPanning,
    drag,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetView,
    zoomToCenter,
  } = useMapInteraction(flyToTarget, onFlyToDone)

  useImperativeHandle(ref, () => ({ mapGroupRef }), [mapGroupRef])

  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null)
  const [activeShards, setActiveShards] = useState<string[]>([])
  const [showLegend, setShowLegend] = useState(() => window.innerWidth >= 640)
  const [showWorldhopperPicker, setShowWorldhopperPicker] = useState(false)
  const [tooltipScreenPos, setTooltipScreenPos] = useState({ left: 0, top: 0 })
  const [layers, setLayers] = useState<MapLayers>({
    labels: true,
    routes: true,
    shardIcons: false,
    constellation: false,
    heatmap: false,
  })
  const [showLayers, setShowLayers] = useState(false)

  const isCoarse = useMemo(() => window.matchMedia('(pointer: coarse)').matches, [])

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 640) setShowLegend((prev) => (prev ? prev : true))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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
  const selectedCharacters = selected ? (charactersByPlanet.get(selected.id) ?? []) : []

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
    return s
  }, [activeShards, shardData, activeWorldhoppers, highlightedPlanet])

  const hasFilter = activeShards.length > 0 || activeWorldhoppers.length > 0

  const handlePlanetClick = useCallback(
    (planetId: string) => {
      if (drag.current.wasPan) return
      onSelectPlanet(selectedPlanet === planetId ? null : planetId)
    },
    [onSelectPlanet, selectedPlanet, drag],
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
  const whPanelRef = useFocusTrap(!!activeWhDetail)

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-800 bg-gray-950"
    >
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
            {[
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
            ].map(([id, c1, c2, c3]) => (
              <radialGradient key={id} id={`grad-${id}`} cx="30%" cy="30%" r="70%">
                <stop offset="0%" stop-color={c1 as string} stop-opacity="1" />
                <stop offset="50%" stop-color={c2 as string} stop-opacity="1" />
                <stop offset="100%" stop-color={c3 as string} stop-opacity="1" />
              </radialGradient>
            ))}
            <radialGradient id="heat-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#a78bfa" stop-opacity="1" />
              <stop offset="100%" stop-color="#a78bfa" stop-opacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="blur-heavy">
              <feGaussianBlur stdDeviation="40" />
            </filter>
          </defs>
          <g ref={mapGroupRef} transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
            <StarField />
            {layers.constellation && <ConstellationLines />}
            {layers.routes && (
              <WorldhopperRoutes
                planetMap={PLANET_BY_ID}
                activeWorldhoppers={activeWorldhoppers}
                hasFilter={hasFilter}
              />
            )}
            {PLANETS.map((p, i) => (
              <g key={p.id} className="animate-planet-enter" style={{ animationDelay: `${i * 0.08}s` }}>
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
            {layers.shardIcons && <ShardIcons />}
            {layers.heatmap && <WorldhopperHeatmap />}
            {children}
          </g>
        </svg>
      </div>

      {tooltipPlanet && (
        <PlanetTooltip planet={tooltipPlanet} left={tooltipScreenPos.left} top={tooltipScreenPos.top} />
      )}
      {selected && (
        <PlanetPanel
          selected={selected}
          selectedCharacters={selectedCharacters}
          onSelectPlanet={onSelectPlanet}
          onSelectCharacter={onSelectCharacter ?? (() => {})}
          onStartJourney={onStartJourney ?? (() => {})}
          panelRef={planetPanelRef}
        />
      )}
      {activeWhDetail && (
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

      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 sm:flex-row sm:items-end">
        <ShardLegend
          show={showLegend}
          onToggle={() => setShowLegend((v) => !v)}
          shardData={shardData}
          activeShards={activeShards}
          onToggleShard={(name) =>
            setActiveShards((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]))
          }
          onClear={() => setActiveShards([])}
        />
        <WorldhopperPicker
          show={showWorldhopperPicker}
          worldhoppers={WORLDHOPPERS}
          onToggle={() => setShowWorldhopperPicker((v) => !v)}
          onStartJourney={onStartJourney}
        />
        <LayersToggle
          show={showLayers}
          layers={layers}
          onToggle={() => setShowLayers((v) => !v)}
          onToggleLayer={handleToggleLayer}
        />
      </div>

      <ZoomControls
        onZoomIn={() => zoomToCenter(zoom + ZOOM_STEP)}
        onZoomOut={() => zoomToCenter(zoom - ZOOM_STEP)}
        onReset={resetView}
      />

      {!selected && activeWorldhoppers.length === 0 && activeShards.length === 0 && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <p className="hidden text-xs text-gray-600 sm:block">
            Scroll to zoom &middot; Drag to pan &middot; {isCoarse ? 'Tap' : 'Click'} a planet &middot; Press{' '}
            <kbd className="rounded border border-gray-700 bg-gray-800 px-1 font-sans">/</kbd> to search
          </p>
          <p className="text-xs text-gray-600 sm:hidden">Drag to pan &middot; {isCoarse ? 'Tap' : 'Click'} a planet</p>
        </div>
      )}
    </div>
  )
})

export default UniverseMap
