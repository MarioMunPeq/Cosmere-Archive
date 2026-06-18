import { useMemo } from 'react'
import { PLANETS } from '@/data/static'
import charactersData from '@/data/generated/characters.json'
import PlanetRenderer from './PlanetRenderer'
import type { Character } from '@/types'
import type { Planet } from '@/types/planet'

const ALL_CHARACTERS = charactersData as Character[]

export interface Worldhopper {
  id: string
  name: string
  description: string
  color: string
  planets: string[]
  sagas: string[]
}

export const WORLDHOPPERS: Worldhopper[] = [
  { id: "hoid",     name: "Hoid",     description: "Aparece en casi todos los mundos. Narrador, viajero, buscador.",     color: "#a78bfa", planets: ["roshar","scadrial","nalthis","sel","taldain","first-of-the-sun","lumar","komashi","canticle"], sagas: ["stormlight","mistborn-era-1","elantris","warbreaker","secret-projects"] },
  { id: "vasher",   name: "Vasher",   description: "El Siniestro. Portador de Rompespadas, experto en el Despertar.",     color: "#f472b6", planets: ["nalthis","roshar"], sagas: ["warbreaker","stormlight"] },
  { id: "khriss",   name: "Khriss",   description: "Erudita de Taldain. Documenta los sistemas de investidura.",           color: "#22c55e", planets: ["taldain","scadrial","roshar","first-of-the-sun"], sagas: ["white-sand"] },
  { id: "nazh",     name: "Nazh",     description: "Cartógrafo y espía. Recolecta información para Khriss.",              color: "#eab308", planets: ["threnody","scadrial","roshar"], sagas: ["stormlight"] },
  { id: "kelsier",  name: "Kelsier",  description: "El Superviviente. Opera desde el Reino Cognitivo.",                  color: "#ef4444", planets: ["scadrial","roshar"], sagas: ["mistborn-era-1","stormlight"] },
]

/** Returns a curved SVG path between two planets. `offset` spreads overlapping lines apart. */
function drawCurvedPath(p1: Planet, p2: Planet, offset: number): string {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const f = 0.2 + offset
  const cx = (p1.x + p2.x) / 2 + dy * f
  const cy = (p1.y + p2.y) / 2 - dx * f
  return `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`
}

// Static star field
const STARS = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  x: Math.random() * 900,
  y: Math.random() * 600,
  r: Math.random() * 1.2 + 0.2,
  opacity: Math.random() * 0.3 + 0.1,
}))

interface Props {
  selectedPlanet: string | null
  onSelectPlanet: (id: string | null) => void
  /** IDs of worldhoppers to highlight. Empty array = show no routes. */
  activeWorldhoppers: string[]
  onToggleWorldhopper: (id: string) => void
  /** Planet ID from timeline event click — briefly pulses on map */
  highlightedPlanet: string | null
}

export default function UniverseMap({
  selectedPlanet,
  onSelectPlanet,
  activeWorldhoppers,
  onToggleWorldhopper,
  highlightedPlanet,
}: Props) {
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

  const selected = selectedPlanet ? planetMap.get(selectedPlanet) ?? null : null
  const selectedCharacters = selected ? charactersByPlanet.get(selected.id) ?? [] : []

  // ── Per-worldhopper connection lines (NOT deduplicated) ──────
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
    // Assign offsets so lines on same planet pair don't overlap
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

  // Build a set of planets that active worldhoppers visit
  const highlightedPlanets = useMemo(() => {
    const s = new Set<string>()
    if (highlightedPlanet) s.add(highlightedPlanet)
    for (const whId of activeWorldhoppers) {
      const wh = WORLDHOPPERS.find((w) => w.id === whId)
      if (wh) wh.planets.forEach((p) => s.add(p))
    }
    return s
  }, [activeWorldhoppers, highlightedPlanet])

  const hasFilter = activeWorldhoppers.length > 0

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
      {/* Background nebula */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-1/3 h-96 w-96 rounded-full bg-purple-900/8 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-72 w-72 rounded-full bg-cyan-900/6 blur-3xl" />
      </div>

      {/* SVG Map */}
      <svg viewBox="0 0 900 600" className="relative h-auto w-full">
        {/* Static stars */}
        {STARS.map((s) => (
          <circle key={s.id} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.opacity} />
        ))}

        {/* Worldhopper connection lines — only when at least one is selected */}
        {hasFilter && connections.map((c, i) => {
          const isActive = activeWorldhoppers.includes(c.whId)
          const opacity = isActive ? 0.6 : 0.05
          return (
            <g key={`${c.whId}-${i}`}>
              {/* Glow for active */}
              {isActive && (
                <path
                  d={drawCurvedPath(c.from, c.to, c.offset)}
                  fill="none"
                  stroke={c.color}
                  strokeWidth="5"
                  opacity={0.12}
                />
              )}
              {/* Main line */}
              <path
                d={drawCurvedPath(c.from, c.to, c.offset)}
                fill="none"
                stroke={c.color}
                strokeWidth={isActive ? 2 : 0.5}
                strokeDasharray={isActive ? "none" : "4 4"}
                opacity={opacity}
              />
              {/* Animated dashes for active */}
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

        {/* Planets */}
        {PLANETS.map((p) => (
          <PlanetRenderer
            key={p.id}
            planet={p}
            size={p.size * 0.4}
            isSelected={selectedPlanet === p.id}
            isHighlighted={hasFilter ? highlightedPlanets.has(p.id) : true}
            onClick={() => onSelectPlanet(selectedPlanet === p.id ? null : p.id)}
          />
        ))}
      </svg>

      {/* ── Planet detail panel ─────────────────── */}
      {selected && (
        <div
          key={selected.id}
          className="absolute right-4 top-4 w-72 animate-scale-in rounded-xl border border-gray-700/60 bg-gray-900/95 p-5 shadow-2xl backdrop-blur-lg"
        >
          <button
            onClick={() => onSelectPlanet(null)}
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

          <p className="text-xs font-medium text-gray-500">{selected.shard}</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">{selected.description}</p>

          {selectedCharacters.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Personajes ({selectedCharacters.length})
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
                      className={`block w-full rounded px-2 py-1 text-left text-xs transition-all ${
                        active ? 'bg-gray-700/50 font-medium' : 'hover:bg-gray-800/50'
                      }`}
                      style={{ color: wh.color }}
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

      {/* ── Worldhopper detail panel ────────────── */}
      {activeWorldhoppers.length > 0 && !selected && (() => {
        const whs = activeWorldhoppers.map((id) => WORLDHOPPERS.find((w) => w.id === id)).filter(Boolean) as Worldhopper[]
        if (whs.length === 0) return null
        const wh = whs[0] // show first selected
        return (
          <div
            key={wh.id}
            className="absolute right-4 top-4 w-72 animate-scale-in rounded-xl border border-gray-700/60 bg-gray-900/95 p-5 shadow-2xl backdrop-blur-lg"
          >
            <button
              onClick={() => onToggleWorldhopper(wh.id)}
              className="absolute right-3 top-3 text-gray-600 transition-colors hover:text-gray-300"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="mb-3 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: wh.color }} />
              <h3 className="text-lg font-bold text-gray-100">{wh.name}</h3>
            </div>

            <p className="text-sm leading-relaxed text-gray-400">{wh.description}</p>

            {activeWorldhoppers.length > 1 && (
              <p className="mt-2 text-xs text-gray-500">
                +{activeWorldhoppers.length - 1} worldhopper(s) seleccionados
              </p>
            )}

            <div className="mt-4">
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Planetas visitados</h4>
              <div className="flex flex-wrap gap-1.5">
                {wh.planets.map((pid) => {
                  const p = planetMap.get(pid)
                  return p ? (
                    <button
                      key={pid}
                      onClick={() => onSelectPlanet(pid)}
                      className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300 hover:bg-gray-700"
                    >{p.name}</button>
                  ) : null
                })}
              </div>
            </div>

            <div className="mt-3">
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Sagas</h4>
              <div className="flex flex-wrap gap-1.5">
                {wh.sagas.map((s) => (
                  <span key={s} className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">{s}</span>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* No planet/worldhopper selected: hint text */}
      {!selected && activeWorldhoppers.length === 0 && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <p className="text-xs text-gray-600">
            Selecciona un Worldhopper abajo para ver sus rutas, o haz clic en un planeta
          </p>
        </div>
      )}
    </div>
  )
}
