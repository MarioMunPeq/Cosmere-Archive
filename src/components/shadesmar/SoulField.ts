import type { Soul, DepthLayer } from './types'
import { ENTITY_VISUALS, CLUSTERS } from './types'
import { buildEntityCatalog } from './entity-catalog'
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

function lodForKind(kind: SoulDef['kind']): number {
  switch (kind) {
    case 'herald':
      return 0.15
    case 'important_character':
      return 0.65
    default:
      return 1.2
  }
}

function depthForMass(mass: number): DepthLayer {
  if (mass >= 1.5) return 0
  if (mass >= 0.7) return 1
  return 2
}

function createSoul(def: SoulDef, x: number, y: number): Soul {
  const rng = seed(`soul:${def.id}`)
  const ev = ENTITY_VISUALS[def.kind]
  const radius = ev.sizeMin + rng() * (ev.sizeMax - ev.sizeMin)
  const mass = ev.mass

  return {
    id: def.id,
    x,
    y,
    vx: 0,
    vy: 0,
    restX: x,
    restY: y,
    radius,
    kind: def.kind,
    layer: depthForMass(mass),
    color: ev.color,
    glowColor: ev.glow,
    coreColor: ev.core,
    mass,
    opacity: 0,
    targetOpacity: 0.7 + rng() * 0.3,
    glow: 0,
    targetGlow: 0,
    scale: 1,
    targetScale: 1,
    breathePhase: rng() * Math.PI * 2,
    entityId: def.id,
    name: def.name,
    description: def.description,
    connections: def.connections,
    planet: def.cluster,
    lodReveal: lodForKind(def.kind),
    parent: def.cluster,
  }
}

export function generateSoulField(): Soul[] {
  const catalog = buildEntityCatalog()
  const souls: Soul[] = []

  for (const cluster of CLUSTERS) {
    const cx = cluster.cx
    const cy = cluster.cy
    const cr = cluster.radius

    const clusterDefs = catalog.filter((d) => d.cluster === cluster.id)
    if (clusterDefs.length === 0) continue

    const layerGroups = new Map<number, SoulDef[]>()
    for (const def of clusterDefs) {
      const layer = def.orbitLayer
      if (!layerGroups.has(layer)) layerGroups.set(layer, [])
      layerGroups.get(layer)!.push(def)
    }

    const sortedLayers = [...layerGroups.entries()].sort((a, b) => a[0] - b[0])
    const angleRng = seed(`cluster:${cluster.id}`)
    const angleOffset = angleRng() * Math.PI * 2

    for (let gi = 0; gi < sortedLayers.length; gi++) {
      const [layer, defs] = sortedLayers[gi]!
      const n = defs.length
      if (n === 0) continue

      const gap = (Math.PI * 2) / n
      const baseAngle = angleOffset + gi * 0.25

      for (let i = 0; i < n; i++) {
        const def = defs[i]!
        const pRng = seed(`pos:${def.id}`)
        const jitterA = (pRng() - 0.5) * gap * 0.4
        const jitterD = (pRng() - 0.5) * 0.08
        const angle = baseAngle + i * gap + jitterA
        const dist = cr * (layer + jitterD)
        let x = cx + Math.cos(angle) * dist
        let y = cy + Math.sin(angle) * dist
        x = Math.max(0.01, Math.min(0.99, x))
        y = Math.max(0.01, Math.min(0.99, y))
        souls.push(createSoul(def, x, y))
      }
    }
  }

  return souls
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
