import type { Soul, DepthLayer } from './types'
import { ENTITY_VISUALS, LAYER_CONFIG, PLANET_REGIONS, TOTAL_SOULS } from './types'
import { buildEntityCatalog, getFillerCount } from './entity-catalog'
import type { SoulDef } from './entity-catalog'

function seed(s: string): () => number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  let calls = 0
  return () => {
    calls++
    return (((h + calls * 7919) * 0x9e3779b9) >>> 0) / 0xffffffff
  }
}

function createSoulFromDef(def: SoulDef, x: number, y: number, layer: DepthLayer, _index: number): Soul {
  const rng = seed(`soul:${def.id}`)
  const ev = ENTITY_VISUALS[def.kind]
  const radius = ev.sizeMin + rng() * (ev.sizeMax - ev.sizeMin)
  const lc = LAYER_CONFIG[layer]

  return {
    id: def.id,
    x,
    y,
    radius,
    kind: def.kind,
    layer,
    color: ev.color,
    glowColor: ev.glow,
    coreColor: ev.core,
    mass: ev.mass,

    vx: ((rng() - 0.5) * 0.2) / Math.max(1, ev.mass * 0.5),
    vy: ((rng() - 0.5) * 0.2) / Math.max(1, ev.mass * 0.5),
    noisePhase: rng() * Math.PI * 2,
    noiseAmp: (0.05 + rng() * 0.15) / Math.max(1, ev.mass * 0.4),
    orbitAngle: rng() * Math.PI * 2,
    orbitSpeed: (0.04 + rng() * 0.15) / Math.max(1, ev.mass * 0.3),
    orbitRadius: (0.1 + rng() * 0.5) / Math.max(1, ev.mass * 0.3),

    opacity: 0,
    targetOpacity: lc.opacity * (0.7 + rng() * 0.3),
    glow: 0,
    targetGlow: 0,
    scale: 1,
    targetScale: 1,
    breathePhase: rng() * Math.PI * 2,

    curious: false,
    curiousDx: 0,
    curiousDy: 0,

    entityId: def.id,
    name: def.name,
    description: def.description,
    connections: def.connections,
    planet: def.planet,
  }
}

const STACK_RADII: Record<string, number> = {
  character: 0.25,
  important_character: 0.2,
  herald: 0.1,
  honorblade: 0.2,
  book: 0.3,
  magic: 0.25,
  shard: 0.15,
  planet: 0.05,
  saga: 0.3,
  spren: 0.35,
  organization: 0.25,
  event: 0.35,
  location: 0.3,
  artifact: 0.3,
  adonalsium: 0.08,
  concept: 0.3,
  filler: 0.5,
}

function positionInRegion(
  def: SoulDef,
  region: { x: number; y: number; radius: number },
  index: number,
  rng: () => number,
): [number, number] {
  const stackR = STACK_RADII[def.kind] ?? 0.3
  const dist = Math.sqrt(rng()) * region.radius * stackR
  const angle = rng() * Math.PI * 2 + index * 0.01
  const x = region.x + Math.cos(angle) * dist
  const y = region.y + Math.sin(angle) * dist
  return [x, y]
}

function positionEntity(def: SoulDef, _catalog: SoulDef[], idx: number, rngFn: () => number): [number, number] {
  const planet = def.planet

  if (planet && PLANET_REGIONS[planet]) {
    const region = PLANET_REGIONS[planet]!
    return positionInRegion(def, region, idx, rngFn)
  }

  const region = PLANET_REGIONS['cosmere']!
  return positionInRegion(def, region, idx, rngFn)
}

function assignLayer(_rng: () => number, mass: number): DepthLayer {
  if (mass >= 3) return 0
  if (mass >= 1.5) return 1
  if (mass >= 0.5) return 2
  return 3
}

export function generateSoulField(): Soul[] {
  const catalog = buildEntityCatalog()
  const rng = seed('cosmere_field')
  const souls: Soul[] = []

  for (let i = 0; i < catalog.length; i++) {
    const def = catalog[i]!
    const [x, y] = positionEntity(def, catalog, i, rng)
    const mass = ENTITY_VISUALS[def.kind]?.mass ?? 1
    const layer = assignLayer(rng, mass)
    const soul = createSoulFromDef(def, x, y, layer, i)
    souls.push(soul)
  }

  const fillerCount = getFillerCount()
  const fillerRng = seed('filler_field')
  const planetKeys = Object.keys(PLANET_REGIONS)

  for (let i = 0; i < fillerCount; i++) {
    const pk = planetKeys[Math.floor(fillerRng() * planetKeys.length)]!
    const region = PLANET_REGIONS[pk]!
    const dist = Math.sqrt(fillerRng()) * region.radius * 0.8
    const angle = fillerRng() * Math.PI * 2
    const x = region.x + Math.cos(angle) * dist
    const y = region.y + Math.sin(angle) * dist
    const layer: DepthLayer = fillerRng() < 0.3 ? 2 : 3
    const ev = ENTITY_VISUALS['filler']
    const lc = LAYER_CONFIG[layer]

    const soul: Soul = {
      id: `filler_${i}`,
      x,
      y,
      radius: ev.sizeMin + fillerRng() * (ev.sizeMax - ev.sizeMin),
      kind: 'filler',
      layer,
      color: ev.color,
      glowColor: ev.glow,
      coreColor: ev.core,
      mass: ev.mass,

      vx: (fillerRng() - 0.5) * 0.4,
      vy: (fillerRng() - 0.5) * 0.4,
      noisePhase: fillerRng() * Math.PI * 2,
      noiseAmp: 0.1 + fillerRng() * 0.25,
      orbitAngle: fillerRng() * Math.PI * 2,
      orbitSpeed: 0.08 + fillerRng() * 0.25,
      orbitRadius: 0.2 + fillerRng() * 0.8,

      opacity: 0,
      targetOpacity: lc.opacity * (0.3 + fillerRng() * 0.3),
      glow: 0,
      targetGlow: 0,
      scale: 1,
      targetScale: 1,
      breathePhase: fillerRng() * Math.PI * 2,

      curious: false,
      curiousDx: 0,
      curiousDy: 0,

      entityId: null,
      name: null,
      description: null,
      connections: [],
      planet: pk,
    }
    souls.push(soul)
  }

  return souls.slice(0, TOTAL_SOULS)
}

export class SpatialGrid {
  private cellSize: number
  private cells = new Map<number, Map<number, Soul[]>>()

  constructor(cellSize: number) {
    this.cellSize = cellSize
  }

  rebuild(souls: Soul[]): void {
    this.cells.clear()
    for (const s of souls) {
      const cx = Math.floor(s.x / this.cellSize)
      const cy = Math.floor(s.y / this.cellSize)
      if (!this.cells.has(cx)) this.cells.set(cx, new Map())
      if (!this.cells.get(cx)!.has(cy)) this.cells.get(cx)!.set(cy, [])
      this.cells.get(cx)!.get(cy)!.push(s)
    }
  }

  query(x: number, y: number, range: number): Soul[] {
    const result: Soul[] = []
    const minCX = Math.floor((x - range) / this.cellSize)
    const maxCX = Math.floor((x + range) / this.cellSize)
    const minCY = Math.floor((y - range) / this.cellSize)
    const maxCY = Math.floor((y + range) / this.cellSize)
    for (let cx = minCX; cx <= maxCX; cx++) {
      const col = this.cells.get(cx)
      if (!col) continue
      for (let cy = minCY; cy <= maxCY; cy++) {
        const cell = col.get(cy)
        if (cell) result.push(...cell)
      }
    }
    return result
  }

  nearest(x: number, y: number, range: number): Soul | null {
    const candidates = this.query(x, y, range)
    let best: Soul | null = null
    let bestD2 = range * range
    for (const s of candidates) {
      const dx = s.x - x
      const dy = s.y - y
      const d2 = dx * dx + dy * dy
      if (d2 < bestD2) {
        bestD2 = d2
        best = s
      }
    }
    return best
  }
}
