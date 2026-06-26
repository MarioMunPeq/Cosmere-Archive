import { useMemo, useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react'
import { PLANETS, ALL_CHARACTERS } from '@/data/static'
import { WORLDHOPPERS } from '@/data/static/timeline'
import type { WorldhopperDisplay } from '@/data/static/timeline'
import type { Planet } from '@/types/planet'
import PlanetRenderer from './PlanetRenderer'
import PlanetPanel from './PlanetPanel'
import WorldhopperDetailPanel from './WorldhopperDetailPanel'
import ShardLegend from './ShardLegend'
import WorldhopperPicker from './WorldhopperPicker'
import ZoomControls from './ZoomControls'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { Character } from '@/types'
import { easeOutCubic, calculateFlyTarget } from '@/utils/fly-to'

function drawCurvedPath(p1: Planet, p2: Planet, offset: number): string {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const f = 0.2 + offset
  const cx = (p1.x + p2.x) / 2 + dy * f
  const cy = (p1.y + p2.y) / 2 - dx * f
  return `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`
}

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
}

const SHARD_COLORS: Record<string, string> = {
  Honor: '#f59e0b',
  Cultivation: '#22c55e',
  Odium: '#ef4444',
  Preservation: '#3b82f6',
  Ruin: '#991b1b',
  Harmony: '#14b8a6',
  Devotion: '#a5b4fc',
  Dominion: '#312e81',
  Endowment: '#d946ef',
  Autonomy: '#eab308',
  Ambition: '#8b5cf6',
  Virtuosity: '#0ea5e9',
  Mercy: '#f472b6',
}

function seededUnit(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function createStars(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const twinkleSeed = seededUnit(i, 5)
    return {
      id: i,
      x: seededUnit(i, 1) * 900,
      y: seededUnit(i, 2) * 600,
      r: seededUnit(i, 3) * 0.8 + 0.15,
      opacity: seededUnit(i, 4) * 0.35 + 0.05,
      twinkle: twinkleSeed > 0.7 ? seededUnit(i, 6) * 6 : -1,
    }
  })
}

export default function UniverseMap({
  selectedPlanet,
  onSelectPlanet,
  activeWorldhoppers,
  onToggleWorldhopper,
  highlightedPlanet,
  onSelectCharacter,
  onStartJourney,
  flyToTarget,
  onFlyToDone,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const mapGroupRef = useRef<SVGGElement>(null)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const drag = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    wasPan: false,
    x: 0,
    y: 0,
    z: 1,
  })
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null)
  const [activeShards, setActiveShards] = useState<string[]>([])
  const [showLegend, setShowLegend] = useState(() => window.innerWidth >= 640)
  const [showWorldhopperPicker, setShowWorldhopperPicker] = useState(false)
  const [tooltipScreenPos, setTooltipScreenPos] = useState({ left: 0, top: 0 })

  const isCoarse = useMemo(() => window.matchMedia('(pointer: coarse)').matches, [])
  const starCount = useMemo(() => (window.innerWidth < 640 ? 100 : 350), [])
  const STARS = useMemo(() => createStars(starCount), [starCount])

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 640) setShowLegend((prev) => (prev ? prev : true))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panRafRef = useRef<number | null>(null)
  const flyRafRef = useRef<number | null>(null)
  const isFlyingRef = useRef(false)

  useEffect(() => {
    return () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
      if (panRafRef.current) cancelAnimationFrame(panRafRef.current)
      if (flyRafRef.current) cancelAnimationFrame(flyRafRef.current)
    }
  }, [])

  function syncTransform() {
    const g = mapGroupRef.current
    if (g) g.setAttribute('transform', `translate(${drag.current.x}, ${drag.current.y}) scale(${drag.current.z})`)
  }

  useLayoutEffect(() => {
    drag.current.x = panX
    drag.current.y = panY
    drag.current.z = zoom
    syncTransform()
  }, [zoom, panX, panY])

  const shardData = useMemo(() => {
    const map = new Map<string, { color: string; planets: string[] }>()
    for (const p of PLANETS) {
      if (!p.shard) continue
      const parts = p.shard.split(/, | & /)
      for (const raw of parts) {
        const name = raw.replace(/\s*\(.*?\)\s*/g, '').trim()
        if (!name) continue
        if (!map.has(name)) {
          map.set(name, { color: SHARD_COLORS[name] ?? '#6b7280', planets: [] })
        }
        const entry = map.get(name)
        if (entry) entry.planets.push(p.id)
      }
    }
    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data }))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  const planetMap = useMemo(() => {
    const map = new Map<string, Planet>()
    PLANETS.forEach((p) => map.set(p.id, p))
    return map
  }, [])

  useEffect(() => {
    if (!flyToTarget) return

    const d = drag.current
    const planet = planetMap.get(flyToTarget.planetId)
    if (!planet) return

    if (flyRafRef.current) {
      cancelAnimationFrame(flyRafRef.current)
      flyRafRef.current = null
    }

    const targetZoom = Math.max(0.5, Math.min(3, d.z < 1.5 ? 2 : d.z))
    const target = calculateFlyTarget(flyToTarget.x, flyToTarget.y, targetZoom)
    const startX = d.x
    const startY = d.y
    const startZ = d.z
    const duration = 600
    const startTime = performance.now()

    isFlyingRef.current = true

    function tick(now: number) {
      if (!isFlyingRef.current) return
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)

      d.x = startX + (target.x - startX) * eased
      d.y = startY + (target.y - startY) * eased
      d.z = startZ + (targetZoom - startZ) * eased
      syncTransform()

      if (progress < 1) {
        flyRafRef.current = requestAnimationFrame(tick)
      } else {
        isFlyingRef.current = false
        flyRafRef.current = null
        setPanX(d.x)
        setPanY(d.y)
        setZoom(d.z)
        if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
        zoomTimerRef.current = null
        onFlyToDone?.()
      }
    }

    flyRafRef.current = requestAnimationFrame(tick)
  }, [flyToTarget, planetMap, onFlyToDone])

  const charactersByPlanet = useMemo(() => {
    const map = new Map<string, Character[]>()
    for (const char of ALL_CHARACTERS) {
      const list = map.get(char.planet) ?? []
      list.push(char)
      map.set(char.planet, list)
    }
    return map
  }, [])

  const selected = selectedPlanet ? (planetMap.get(selectedPlanet) ?? null) : null
  const selectedCharacters = selected ? (charactersByPlanet.get(selected.id) ?? []) : []

  const connections = useMemo(() => {
    const lines: { from: Planet; to: Planet; color: string; whId: string; offset: number }[] = []
    for (const wh of WORLDHOPPERS) {
      for (let i = 0; i < wh.planets.length; i++) {
        for (let j = i + 1; j < wh.planets.length; j++) {
          const a = planetMap.get(wh.planets[i]!)
          const b = planetMap.get(wh.planets[j]!)
          if (!a || !b) continue
          lines.push({ from: a, to: b, color: wh.color, whId: wh.id, offset: 0 })
        }
      }
    }
    const groups = new Map<string, typeof lines>()
    for (const l of lines) {
      const key = [l.from.id, l.to.id].sort().join('-')
      const g = groups.get(key) ?? []
      g.push(l)
      groups.set(key, g)
    }
    for (const g of groups.values()) {
      if (g.length > 1) {
        const step = 0.25 / g.length
        g.forEach((l, idx) => {
          l.offset = (idx - (g.length - 1) / 2) * step
        })
      }
    }
    return lines
  }, [planetMap])

  const highlightedPlanets = useMemo(() => {
    const s = new Set<string>()
    if (activeShards.length > 0) {
      for (const sd of shardData) {
        if (activeShards.includes(sd.name)) {
          sd.planets.forEach((pid) => s.add(pid))
        }
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

  function resetView() {
    const d = drag.current
    d.x = 0
    d.y = 0
    d.z = 1
    syncTransform()
    setPanX(0)
    setPanY(0)
    setZoom(1)
  }

  function zoomToCenter(newZoom: number) {
    const d = drag.current
    const svgEl = svgRef.current
    if (!svgEl) return
    const rect = svgEl.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const centerVX = 450
    const centerVY = 300
    const clamped = Math.max(0.5, Math.min(3, newZoom))
    if (clamped !== d.z) {
      const origX = (centerVX - d.x) / d.z
      const origY = (centerVY - d.y) / d.z
      d.x = centerVX - origX * clamped
      d.y = centerVY - origY * clamped
      d.z = clamped
      syncTransform()
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
      zoomTimerRef.current = setTimeout(() => {
        zoomTimerRef.current = null
        setPanX(d.x)
        setPanY(d.y)
        setZoom(d.z)
      }, 80)
    }
  }

  const handlePlanetClick = useCallback(
    (planetId: string) => {
      if (drag.current.wasPan) return
      onSelectPlanet(selectedPlanet === planetId ? null : planetId)
    },
    [onSelectPlanet, selectedPlanet],
  )

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const svgEl = svgRef.current
    if (!svgEl) return
    const rect = svgEl.getBoundingClientRect()
    const svgW = rect.width
    const svgH = rect.height
    if (svgW === 0 || svgH === 0) return
    const mouseVX = ((e.clientX - rect.left) / svgW) * 900
    const mouseVY = ((e.clientY - rect.top) / svgH) * 600
    const d = drag.current
    const newZoom = Math.max(0.5, Math.min(3, d.z - e.deltaY * 0.001 * d.z))
    if (newZoom !== d.z) {
      const origX = (mouseVX - d.x) / d.z
      const origY = (mouseVY - d.y) / d.z
      d.x = mouseVX - origX * newZoom
      d.y = mouseVY - origY * newZoom
      d.z = newZoom
      syncTransform()
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
      zoomTimerRef.current = setTimeout(() => {
        zoomTimerRef.current = null
        setPanX(d.x)
        setPanY(d.y)
        setZoom(d.z)
      }, 80)
    }
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isFlyingRef.current) {
        isFlyingRef.current = false
        if (flyRafRef.current) {
          cancelAnimationFrame(flyRafRef.current)
          flyRafRef.current = null
        }
        onFlyToDone?.()
      }
      const d = drag.current
      d.isDown = true
      d.startX = e.clientX
      d.startY = e.clientY
      d.wasPan = false
    },
    [onFlyToDone],
  )

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current
    if (!d.isDown || e.buttons !== 1) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (!d.wasPan && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      d.wasPan = true
      setIsPanning(true)
    }
    if (d.wasPan) {
      if (panRafRef.current) return
      panRafRef.current = requestAnimationFrame(() => {
        panRafRef.current = null
        const svgEl = svgRef.current
        if (!svgEl) return
        const rect = svgEl.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return
        const scale = 900 / Math.min(rect.width, rect.height)
        d.x += (e.clientX - d.startX) * scale
        d.y += (e.clientY - d.startY) * scale
        d.startX = e.clientX
        d.startY = e.clientY
        syncTransform()
      })
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    const d = drag.current
    d.isDown = false
    setIsPanning(false)
    if (panRafRef.current) {
      cancelAnimationFrame(panRafRef.current)
      panRafRef.current = null
    }
    setPanX(d.x)
    setPanY(d.y)
    setZoom(d.z)
  }, [])

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
    [zoom, panX, panY],
  )

  const handlePlanetHover = useCallback(
    (planetId: string | null) => {
      setHoveredPlanetId(planetId)
      const planet = planetId ? planetMap.get(planetId) : null
      setTooltipScreenPos(planet ? calculateTooltipPosition(planet) : { left: 0, top: 0 })
    },
    [calculateTooltipPosition, planetMap],
  )

  const tooltipPlanet = !selected && hoveredPlanetId ? (planetMap.get(hoveredPlanetId) ?? null) : null

  const transform = `translate(${panX}, ${panY}) scale(${zoom})`

  const activeWhDetail = useMemo(() => {
    if (activeWorldhoppers.length === 0 || selected) return null
    const whs = activeWorldhoppers
      .map((id) => WORLDHOPPERS.find((w) => w.id === id))
      .filter((w): w is WorldhopperDisplay => w !== undefined)
    return whs.length > 0 ? whs[0] : null
  }, [activeWorldhoppers, selected])

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
          viewBox="0 0 900 600"
          className="block h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ touchAction: 'none' }}
          role="img"
          aria-label="Interactive map of the Cosmere galaxy showing all known planets"
        >
          <defs>
            <radialGradient id="grad-roshar" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#22d3ee" stop-opacity="1" />
              <stop offset="50%" stop-color="#0891b2" stop-opacity="1" />
              <stop offset="100%" stop-color="#164e63" stop-opacity="1" />
            </radialGradient>
            <radialGradient id="grad-scadrial" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#f87171" stop-opacity="1" />
              <stop offset="50%" stop-color="#b91c1c" stop-opacity="1" />
              <stop offset="100%" stop-color="#450a0a" stop-opacity="1" />
            </radialGradient>
            <radialGradient id="grad-sel" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#5eead4" stop-opacity="1" />
              <stop offset="50%" stop-color="#0d9488" stop-opacity="1" />
              <stop offset="100%" stop-color="#134e4a" stop-opacity="1" />
            </radialGradient>
            <radialGradient id="grad-nalthis" cx="35%" cy="25%" r="75%">
              <stop offset="0%" stop-color="#f0abfc" stop-opacity="1" />
              <stop offset="50%" stop-color="#a21caf" stop-opacity="1" />
              <stop offset="100%" stop-color="#4a044e" stop-opacity="1" />
            </radialGradient>
            <radialGradient id="grad-taldain" cx="20%" cy="30%" r="80%">
              <stop offset="0%" stop-color="#fef08a" stop-opacity="1" />
              <stop offset="50%" stop-color="#a16207" stop-opacity="1" />
              <stop offset="100%" stop-color="#713f12" stop-opacity="1" />
            </radialGradient>
            <radialGradient id="grad-threnody" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#6b7280" stop-opacity="1" />
              <stop offset="50%" stop-color="#4b5563" stop-opacity="1" />
              <stop offset="100%" stop-color="#111827" stop-opacity="1" />
            </radialGradient>
            <radialGradient id="grad-first-of-the-sun" cx="25%" cy="25%" r="75%">
              <stop offset="0%" stop-color="#6ee7b7" stop-opacity="1" />
              <stop offset="50%" stop-color="#15803d" stop-opacity="1" />
              <stop offset="100%" stop-color="#14532d" stop-opacity="1" />
            </radialGradient>
            <radialGradient id="grad-komashi" cx="35%" cy="35%" r="70%">
              <stop offset="0%" stop-color="#7dd3fc" stop-opacity="1" />
              <stop offset="50%" stop-color="#0369a1" stop-opacity="1" />
              <stop offset="100%" stop-color="#0c4a6e" stop-opacity="1" />
            </radialGradient>
            <radialGradient id="grad-lumar" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#f9a8d4" stop-opacity="1" />
              <stop offset="50%" stop-color="#db2777" stop-opacity="1" />
              <stop offset="100%" stop-color="#831843" stop-opacity="1" />
            </radialGradient>
            <radialGradient id="grad-canticle" cx="20%" cy="20%" r="80%">
              <stop offset="0%" stop-color="#fde047" stop-opacity="1" />
              <stop offset="50%" stop-color="#ea580c" stop-opacity="1" />
              <stop offset="100%" stop-color="#7c2d12" stop-opacity="1" />
            </radialGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="blur-heavy">
              <feGaussianBlur stdDeviation="40" />
            </filter>
          </defs>
          <g ref={mapGroupRef} transform={transform}>
            <circle
              cx="300"
              cy="200"
              r="180"
              fill="#a78bfa"
              opacity="0.04"
              filter="url(#blur-heavy)"
              style={{ animation: 'nebula-drift 20s ease-in-out infinite' }}
            />
            <circle
              cx="600"
              cy="400"
              r="220"
              fill="#22d3ee"
              opacity="0.03"
              filter="url(#blur-heavy)"
              style={{ animation: 'nebula-drift 25s ease-in-out infinite reverse' }}
            />
            <circle
              cx="150"
              cy="500"
              r="160"
              fill="#f59e0b"
              opacity="0.03"
              filter="url(#blur-heavy)"
              style={{ animation: 'nebula-drift 30s ease-in-out infinite', animationDelay: '-10s' }}
            />

            {STARS.map((s) => (
              <circle
                key={s.id}
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill="white"
                opacity={s.opacity}
                className={s.twinkle >= 0 ? 'animate-twinkle' : ''}
                style={s.twinkle >= 0 ? { animationDelay: `${s.twinkle}s` } : undefined}
              />
            ))}

            {hasFilter &&
              connections.map((c, i) => {
                const isActive = activeWorldhoppers.includes(c.whId)
                const opacity = isActive ? 0.6 : 0.05
                return (
                  <g key={`${c.whId}-${i}`}>
                    {isActive && (
                      <path
                        d={drawCurvedPath(c.from, c.to, c.offset)}
                        fill="none"
                        stroke={c.color}
                        strokeWidth="5"
                        opacity={0.12}
                        className="animate-line-pulse"
                      />
                    )}
                    <path
                      d={drawCurvedPath(c.from, c.to, c.offset)}
                      fill="none"
                      stroke={c.color}
                      strokeWidth={isActive ? 2 : 0.5}
                      strokeDasharray={isActive ? 'none' : '4 4'}
                      opacity={opacity}
                    />
                    {isActive && (
                      <path
                        d={drawCurvedPath(c.from, c.to, c.offset)}
                        fill="none"
                        stroke={c.color}
                        strokeWidth={2}
                        strokeDasharray="6 20"
                        opacity={0.7}
                        className="animate-dash"
                      />
                    )}
                  </g>
                )
              })}

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

            {PLANETS.map((p, i) => {
              const labelX = p.x + p.size * 0.4 + 6
              return (
                <g
                  key={`lbl-${p.id}`}
                  className="pointer-events-none select-none animate-label-fade"
                  style={{ animationDelay: `${0.8 + i * 0.08}s` }}
                >
                  <line
                    x1={p.x + p.size * 0.4}
                    y1={p.y}
                    x2={labelX}
                    y2={p.y}
                    stroke="#6b7280"
                    strokeWidth="0.5"
                    opacity={0.5}
                  />
                  <text x={labelX + 2} y={p.y + 3} fill="#6b7280" fontSize="9" fontFamily="ui-monospace, monospace">
                    {p.name}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {tooltipPlanet && (
        <div
          className="pointer-events-none absolute z-30 hidden max-w-56 animate-fade-in-up rounded-lg border border-gray-700/50 bg-gray-900/90 px-3 py-2 shadow-lg backdrop-blur-md sm:block"
          style={{ left: tooltipScreenPos.left, top: tooltipScreenPos.top }}
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: tooltipPlanet.color }} />
            <span className="text-sm font-bold text-gray-100">{tooltipPlanet.name}</span>
          </div>
          {tooltipPlanet.shard && <p className="mt-0.5 text-xs text-gray-400">{tooltipPlanet.shard}</p>}
          <p className="mt-1 text-xs leading-relaxed text-gray-400 line-clamp-2">{tooltipPlanet.description}</p>
        </div>
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
          planetMap={planetMap}
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
      </div>

      <ZoomControls
        onZoomIn={() => zoomToCenter(drag.current.z + 0.3)}
        onZoomOut={() => zoomToCenter(drag.current.z - 0.3)}
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
}
