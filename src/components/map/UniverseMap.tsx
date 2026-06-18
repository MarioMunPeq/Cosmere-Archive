import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { PLANETS } from '@/data/static'
import type { Character } from '@/types'
import type { Planet } from '@/types/planet'
import PlanetRenderer from './PlanetRenderer'
import charactersData from '@/data/generated/characters.json'
import { validateCharacterArray } from '@/data/generated/validate'
import { useFocusTrap } from '@/hooks/useFocusTrap'

const ALL_CHARACTERS = validateCharacterArray(charactersData)

export interface Worldhopper {
  id: string
  name: string
  description: string
  color: string
  planets: string[]
  sagas: string[]
}

const WORLDHOPPERS: Worldhopper[] = [
  { id: "hoid",     name: "Hoid",     description: "Appears in almost every world. Storyteller, wanderer, seeker.",     color: "#a78bfa", planets: ["roshar","scadrial","nalthis","sel","taldain","first-of-the-sun","lumar","komashi","canticle"], sagas: ["stormlight","mistborn-era-1","elantris","warbreaker","secret-projects"] },
  { id: "vasher",   name: "Vasher",   description: "Kalad the Usurper. Wielder of Nightblood, expert in Awakening.",     color: "#f472b6", planets: ["nalthis","roshar"], sagas: ["warbreaker","stormlight"] },
  { id: "khriss",   name: "Khriss",   description: "Scholar from Taldain. Documents investiture systems.",           color: "#22c55e", planets: ["taldain","scadrial","roshar","first-of-the-sun"], sagas: ["white-sand"] },
  { id: "nazh",     name: "Nazh",     description: "Cartographer and spy. Collects information for Khriss.",              color: "#eab308", planets: ["threnody","scadrial","roshar"], sagas: ["stormlight"] },
  { id: "kelsier",  name: "Kelsier",  description: "The Survivor. Operates from the Cognitive Realm.",                  color: "#ef4444", planets: ["scadrial","roshar"], sagas: ["mistborn-era-1","stormlight"] },
]

function drawCurvedPath(p1: Planet, p2: Planet, offset: number): string {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const f = 0.2 + offset
  const cx = (p1.x + p2.x) / 2 + dy * f
  const cy = (p1.y + p2.y) / 2 - dx * f
  return `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`
}

const STARS = Array.from({ length: 350 }, (_, i) => ({
  id: i,
  x: Math.random() * 900,
  y: Math.random() * 600,
  r: Math.random() * 0.8 + 0.15,
  opacity: Math.random() * 0.35 + 0.05,
  twinkle: Math.random() > 0.7 ? Math.random() * 6 : -1,
}))

interface Props {
  selectedPlanet: string | null
  onSelectPlanet: (id: string | null) => void
  activeWorldhoppers: string[]
  onToggleWorldhopper: (id: string) => void
  highlightedPlanet: string | null
}

const SHARD_COLORS: Record<string, string> = {
  'Honor': '#f59e0b', 'Cultivation': '#22c55e', 'Odium': '#ef4444',
  'Preservation': '#3b82f6', 'Ruin': '#991b1b', 'Harmony': '#14b8a6',
  'Devotion': '#a5b4fc', 'Dominion': '#312e81',
  'Endowment': '#d946ef', 'Autonomy': '#eab308',
  'Ambition': '#8b5cf6', 'Virtuosity': '#0ea5e9', 'Mercy': '#f472b6',
}

export default function UniverseMap({
  selectedPlanet,
  onSelectPlanet,
  activeWorldhoppers,
  onToggleWorldhopper,
  highlightedPlanet,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const panState = useRef({ isDown: false, startX: 0, startY: 0, wasPan: false })
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null)
  const [activeShards, setActiveShards] = useState<string[]>([])
  const [showLegend, setShowLegend] = useState(false)
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panRafRef = useRef<number | null>(null)

  const shardData = useMemo(() => {
    const map = new Map<string, { color: string; planets: string[] }>()
    for (const p of PLANETS) {
      if (!p.shard) continue
      const parts = p.shard.split(/, | y | & /)
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
    const handler = (e: WheelEvent) => { e.preventDefault() }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  const planetMap = useMemo(() => {
    const map = new Map<string, Planet>()
    PLANETS.forEach((p) => map.set(p.id, p))
    return map
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

  const selected = selectedPlanet ? (planetMap.get(selectedPlanet) ?? null) : null
  const selectedCharacters = selected ? (charactersByPlanet.get(selected.id) ?? []) : []

  const connections = useMemo(() => {
    const lines: { from: Planet; to: Planet; color: string; whId: string; offset: number }[] = []
    for (const wh of WORLDHOPPERS) {
      for (let i = 0; i < wh.planets.length; i++) {
        for (let j = i + 1; j < wh.planets.length; j++) {
          const a = planetMap.get(wh.planets[i])
          const b = planetMap.get(wh.planets[j])
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
        g.forEach((l, idx) => { l.offset = (idx - (g.length - 1) / 2) * step })
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

  const handlePlanetClick = useCallback((planetId: string) => {
    if (panState.current.wasPan) return
    onSelectPlanet(selectedPlanet === planetId ? null : planetId)
  }, [onSelectPlanet, selectedPlanet])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (zoomTimerRef.current) return
    zoomTimerRef.current = setTimeout(() => { zoomTimerRef.current = null }, 50)
    const svgEl = svgRef.current
    if (!svgEl) return
    const rect = svgEl.getBoundingClientRect()
    const svgW = rect.width
    const svgH = rect.height
    if (svgW === 0 || svgH === 0) return
    const mouseVX = ((e.clientX - rect.left) / svgW) * 900
    const mouseVY = ((e.clientY - rect.top) / svgH) * 600
    const newZoom = Math.max(0.5, Math.min(3, zoom - e.deltaY * 0.001 * zoom))
    if (newZoom !== zoom) {
      const origX = (mouseVX - panX) / zoom
      const origY = (mouseVY - panY) / zoom
      setPanX(mouseVX - origX * newZoom)
      setPanY(mouseVY - origY * newZoom)
      setZoom(newZoom)
    }
  }, [zoom, panX, panY])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    panState.current = { isDown: true, startX: e.clientX, startY: e.clientY, wasPan: false }
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!panState.current.isDown || e.buttons !== 1) return
    const dx = e.clientX - panState.current.startX
    const dy = e.clientY - panState.current.startY
    if (!panState.current.wasPan && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      panState.current.wasPan = true
      setIsPanning(true)
    }
    if (panState.current.wasPan) {
      if (panRafRef.current) return
      panRafRef.current = requestAnimationFrame(() => {
        panRafRef.current = null
        const svgEl = svgRef.current
        if (!svgEl) return
        const rect = svgEl.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return
        const scaleX = 900 / rect.width
        const scaleY = 600 / rect.height
        setPanX(p => p + (e.clientX - panState.current.startX) * scaleX)
        setPanY(p => p + (e.clientY - panState.current.startY) * scaleY)
        panState.current.startX = e.clientX
        panState.current.startY = e.clientY
      })
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    panState.current.isDown = false
    setIsPanning(false)
    if (panRafRef.current) { cancelAnimationFrame(panRafRef.current); panRafRef.current = null }
    setTimeout(() => { panState.current.wasPan = false }, 100)
  }, [])

  const handlePlanetHover = useCallback((planetId: string | null) => {
    setHoveredPlanetId(planetId)
  }, [])

  const tooltipPlanet = !selected && hoveredPlanetId ? (planetMap.get(hoveredPlanetId) ?? null) : null
  const tooltipScreenPos = useMemo(() => {
    if (!tooltipPlanet) return { left: 0, top: 0 }
    const svgEl = svgRef.current
    if (!svgEl) return { left: 0, top: 0 }
    const rect = svgEl.getBoundingClientRect()
    const svgW = rect.width; const svgH = rect.height
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
  }, [tooltipPlanet, zoom, panX, panY])

  const transform = `translate(${panX}, ${panY}) scale(${zoom})`

  const activeWhDetail = useMemo(() => {
    if (activeWorldhoppers.length === 0 || selected) return null
    const whs = activeWorldhoppers
      .map((id) => WORLDHOPPERS.find((w) => w.id === id))
      .filter((w): w is Worldhopper => w !== undefined)
    return whs.length > 0 ? whs[0] : null
  }, [activeWorldhoppers, selected])

  const planetPanelRef = useFocusTrap(!!selected)
  const whPanelRef = useFocusTrap(!!activeWhDetail)

  return (
    <div ref={containerRef} className="relative flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-800 bg-gray-950">
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
          </defs>
          <g transform={transform}>
            {STARS.map((s) => (
              <circle
                key={s.id} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.opacity}
                className={s.twinkle >= 0 ? 'animate-twinkle' : ''}
                style={s.twinkle >= 0 ? { animationDelay: `${s.twinkle}s` } : undefined}
              />
            ))}

            {hasFilter && connections.map((c, i) => {
              const isActive = activeWorldhoppers.includes(c.whId)
              const opacity = isActive ? 0.6 : 0.05
              return (
                <g key={`${c.whId}-${i}`}>
                  {isActive && (
                    <path
                      d={drawCurvedPath(c.from, c.to, c.offset)}
                      fill="none" stroke={c.color} strokeWidth="5" opacity={0.12}
                    />
                  )}
                  <path
                    d={drawCurvedPath(c.from, c.to, c.offset)}
                    fill="none" stroke={c.color}
                    strokeWidth={isActive ? 2 : 0.5}
                    strokeDasharray={isActive ? "none" : "4 4"}
                    opacity={opacity}
                  />
                  {isActive && (
                    <path
                      d={drawCurvedPath(c.from, c.to, c.offset)}
                      fill="none" stroke={c.color} strokeWidth={2}
                      strokeDasharray="6 20" opacity={0.7} className="animate-dash"
                    />
                  )}
                </g>
              )
            })}

            {PLANETS.map((p) => (
              <PlanetRenderer
                key={p.id}
                planet={p}
                size={p.size * 0.4}
                isSelected={selectedPlanet === p.id}
                isHighlighted={hasFilter ? highlightedPlanets.has(p.id) : true}
                onClick={() => handlePlanetClick(p.id)}
                onHover={(h) => handlePlanetHover(h ? p.id : null)}
              />
            ))}

            {PLANETS.map((p) => {
              const labelX = p.x + p.size * 0.4 + 6
              return (
                <g key={`lbl-${p.id}`} className="pointer-events-none select-none">
                  <line x1={p.x + p.size * 0.4} y1={p.y} x2={labelX} y2={p.y} stroke="#6b7280" strokeWidth="0.5" opacity={0.5} />
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
          {tooltipPlanet.shard && (
            <p className="mt-0.5 text-xs text-gray-400">{tooltipPlanet.shard}</p>
          )}
          <p className="mt-1 text-xs leading-relaxed text-gray-400 line-clamp-2">
            {tooltipPlanet.description}
          </p>
        </div>
      )}

      {selected && (
        <div
          ref={planetPanelRef}
          key={selected.id}
          className="absolute bottom-4 left-4 right-4 top-auto w-auto animate-scale-in rounded-xl border border-gray-700/60 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-lg sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:w-72 sm:p-5"
        >
          <button
            onClick={() => onSelectPlanet(null)}
            aria-label="Close planet panel"
            className="absolute right-3 top-3 text-gray-600 transition-colors hover:text-gray-300"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="mb-3 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selected.color }} />
            <h3 className="text-lg font-bold text-gray-100">{selected.name}</h3>
          </div>

          <p className="text-xs font-medium text-gray-400">{selected.shard}</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">{selected.description}</p>

          {selectedCharacters.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Characters ({selectedCharacters.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedCharacters.map((c) => (
                  <span key={c.id} className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300">{c.name}</span>
                ))}
              </div>
            </div>
          )}

          {WORLDHOPPERS.filter((wh) => wh.planets.includes(selected.id)).length > 0 && (
            <div className="mt-3">
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Worldhoppers</h4>
              <div className="space-y-1">
                {WORLDHOPPERS.filter((wh) => wh.planets.includes(selected.id)).map((wh) => {
                  const active = activeWorldhoppers.includes(wh.id)
                  return (
                    <button
                      key={wh.name}
                      onClick={(e) => { e.stopPropagation(); onToggleWorldhopper(wh.id) }}
                      className={`block w-full rounded px-2 py-1 text-left text-xs transition-colors ${
                        active ? 'bg-gray-700/50 font-medium text-white' : 'text-gray-400 hover:bg-gray-800/50'
                      }`}
                    >
                      {wh.name} {active && '✓'}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeWhDetail && (
        <div
          ref={whPanelRef}
          key={activeWhDetail.id}
          className="absolute bottom-4 left-4 right-4 top-auto w-auto animate-scale-in rounded-xl border border-gray-700/60 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-lg sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:w-72 sm:p-5"
        >
          <button
            onClick={() => onToggleWorldhopper(activeWhDetail.id)}
            aria-label="Close worldhopper panel"
            className="absolute right-3 top-3 text-gray-600 transition-colors hover:text-gray-300"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="mb-3 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: activeWhDetail.color }} />
            <h3 className="text-lg font-bold text-gray-100">{activeWhDetail.name}</h3>
          </div>

          <p className="text-sm leading-relaxed text-gray-400">{activeWhDetail.description}</p>

          {activeWorldhoppers.length > 1 && (
            <p className="mt-2 text-xs text-gray-500">
              +{activeWorldhoppers.length - 1} more worldhopper(s) selected
            </p>
          )}

          <div className="mt-4">
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Visited planets</h4>
            <div className="flex flex-wrap gap-1.5">
              {activeWhDetail.planets.map((pid) => {
                const p = planetMap.get(pid)
                return p ? (
                  <button
                    key={pid}
                    onClick={() => { onSelectPlanet(pid); onToggleWorldhopper(activeWhDetail.id) }}
                    className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300 hover:bg-gray-700"
                  >{p.name}</button>
                ) : null
              })}
            </div>
          </div>

          <div className="mt-3">
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Sagas</h4>
            <div className="flex flex-wrap gap-1.5">
              {activeWhDetail.sagas.map((s) => (
                <span key={s} className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">{s}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowLegend(v => !v)}
        className="absolute bottom-4 left-4 z-20 rounded-lg border border-gray-700/60 bg-gray-900/80 px-2.5 py-1.5 text-xs text-gray-400 backdrop-blur-sm transition-colors hover:border-purple-500/60 hover:text-purple-400 sm:px-3"
        aria-label={showLegend ? 'Close shard legend' : 'Open shard legend'}
      >
        {showLegend ? '✕ Close' : '⚡ Shards'}
      </button>

      {showLegend && (
        <div className="absolute bottom-12 left-2 right-2 z-20 w-auto animate-fade-in-up rounded-xl border border-gray-700/60 bg-gray-900/95 p-3 shadow-2xl backdrop-blur-lg sm:bottom-12 sm:left-4 sm:right-auto sm:w-56 sm:p-4">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Shards</h4>
          <div className="space-y-1.5">
            <button
              onClick={() => setActiveShards([])}
              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors ${
                activeShards.length === 0 ? 'bg-purple-900/30 text-purple-300' : 'text-gray-400 hover:bg-gray-800/50'
              }`}
            >
              <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-gray-600 text-[8px] text-gray-500">*</span>
              All shards
            </button>
            {shardData.map((sd) => {
              const active = activeShards.includes(sd.name)
              return (
                <button
                  key={sd.name}
                  onClick={() => setActiveShards(prev =>
                    prev.includes(sd.name) ? prev.filter(s => s !== sd.name) : [...prev, sd.name]
                  )}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors ${
                    active ? 'bg-gray-700/50 font-medium text-white' : 'text-gray-400 hover:bg-gray-800/50'
                  }`}
                >
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: sd.color, opacity: active ? 1 : 0.5 }} />
                  <span className="flex-1">{sd.name}</span>
                  <span className="text-[10px] text-gray-600">{sd.planets.length}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {!selected && activeWorldhoppers.length === 0 && activeShards.length === 0 && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <p className="hidden text-xs text-gray-600 sm:block">
            Scroll to zoom &middot; Drag to pan &middot; Click a planet
          </p>
          <p className="text-xs text-gray-600 sm:hidden">
            Drag to pan &middot; Tap a planet
          </p>
        </div>
      )}
    </div>
  )
}
