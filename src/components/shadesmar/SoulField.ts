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
    case 'planet':
    case 'shard':
    case 'adonalsium':
      return 0.15
    case 'book':
    case 'saga':
    case 'filler':
      return 0.35
    case 'important_character':
    case 'herald':
    case 'magic':
      return 0.65
    default:
      return 1.2
  }
}

function createSoul(def: SoulDef, x: number, y: number, _index: number): Soul {
  const rng = seed(`soul:${def.id}`)
  const ev = ENTITY_VISUALS[def.kind]
  const radius = ev.sizeMin + rng() * (ev.sizeMax - ev.sizeMin)
  const mass = ev.mass

  let layer: DepthLayer = 3
  if (mass >= 3) layer = 0
  else if (mass >= 1.5) layer = 1
  else if (mass >= 0.5) layer = 2

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
    mass,
    vx: ((rng() - 0.5) * 0.00015) / Math.max(1, mass * 0.5),
    vy: ((rng() - 0.5) * 0.00015) / Math.max(1, mass * 0.5),
    noisePhase: rng() * Math.PI * 2,
    noiseAmp: (0.00003 + rng() * 0.0001) / Math.max(1, mass * 0.4),
    orbitAngle: rng() * Math.PI * 2,
    orbitSpeed: (0.03 + rng() * 0.1) / Math.max(1, mass * 0.3),
    orbitRadius: (0.0001 + rng() * 0.0003) / Math.max(1, mass * 0.3),
    opacity: 0,
    targetOpacity: 0.7 + rng() * 0.3,
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
    if (clusterDefs.length === 0 && cluster.id !== 'cosmere') continue

    const groups: Array<{ defs: SoulDef[]; layer: number }> = [
      { defs: clusterDefs.filter((d) => d.kind === 'shard' || d.kind === 'adonalsium'), layer: 0.02 },
      { defs: clusterDefs.filter((d) => d.kind === 'herald'), layer: 0.03 },
      { defs: clusterDefs.filter((d) => d.kind === 'honorblade'), layer: 0.04 },
      { defs: clusterDefs.filter((d) => d.kind === 'book'), layer: 0.05 },
      { defs: clusterDefs.filter((d) => d.kind === 'important_character'), layer: 0.06 },
      { defs: clusterDefs.filter((d) => d.kind === 'artifact'), layer: 0.07 },
      { defs: clusterDefs.filter((d) => d.kind === 'magic'), layer: 0.08 },
      { defs: clusterDefs.filter((d) => d.kind === 'character'), layer: 0.08 },
      { defs: clusterDefs.filter((d) => d.kind === 'spren'), layer: 0.09 },
      { defs: clusterDefs.filter((d) => d.kind === 'location'), layer: 0.1 },
      { defs: clusterDefs.filter((d) => d.kind === 'concept' || d.kind === 'saga'), layer: 0.1 },
      { defs: clusterDefs.filter((d) => d.kind === 'organization'), layer: 0.11 },
      { defs: clusterDefs.filter((d) => d.kind === 'event'), layer: 0.11 },
    ]

    const angleRng = seed(`cluster:${cluster.id}`)
    const angleOffset = angleRng() * Math.PI * 2

    let groupIdx = 0
    for (const group of groups) {
      const n = group.defs.length
      if (n === 0) {
        groupIdx++
        continue
      }
      const gap = (Math.PI * 2) / n
      const baseAngle = angleOffset + groupIdx * 0.3

      for (let i = 0; i < n; i++) {
        const def = group.defs[i]!
        const pRng = seed(`pos:${def.id}`)
        const jitterA = (pRng() - 0.5) * gap * 0.5
        const jitterD = (pRng() - 0.5) * 0.12
        const angle = baseAngle + i * gap + jitterA
        const dist = cr * (group.layer + jitterD)
        let x = cx + Math.cos(angle) * dist
        let y = cy + Math.sin(angle) * dist
        x = Math.max(0.01, Math.min(0.99, x))
        y = Math.max(0.01, Math.min(0.99, y))
        souls.push(createSoul(def, x, y, souls.length))
      }
      groupIdx++
    }

    const planetDefs = clusterDefs.filter((d) => d.kind === 'planet')
    for (const pDef of planetDefs) {
      const soul = createSoul(pDef, cx, cy, souls.length)
      souls.push(soul)
    }
  }

  const fillerRng = seed('filler')
  for (const cluster of CLUSTERS) {
    const cx = cluster.cx
    const cy = cluster.cy
    const cr = cluster.radius * 0.7
    const count = Math.floor(8 + fillerRng() * 12)

    for (let i = 0; i < count; i++) {
      const angle = fillerRng() * Math.PI * 2
      const dist = fillerRng() * cr
      let x = cx + Math.cos(angle) * dist
      let y = cy + Math.sin(angle) * dist
      x = Math.max(0.01, Math.min(0.99, x))
      y = Math.max(0.01, Math.min(0.99, y))

      const ev = ENTITY_VISUALS['filler']
      souls.push({
        id: `filler_${cluster.id}_${i}`,
        x,
        y,
        radius: ev.sizeMin + fillerRng() * (ev.sizeMax - ev.sizeMin),
        kind: 'filler',
        layer: 3,
        color: ev.color,
        glowColor: ev.glow,
        coreColor: ev.core,
        mass: ev.mass,
        vx: (fillerRng() - 0.5) * 0.0003,
        vy: (fillerRng() - 0.5) * 0.0003,
        noisePhase: fillerRng() * Math.PI * 2,
        noiseAmp: 0.00008 + fillerRng() * 0.0002,
        orbitAngle: fillerRng() * Math.PI * 2,
        orbitSpeed: 0.06 + fillerRng() * 0.2,
        orbitRadius: 0.0002 + fillerRng() * 0.0006,
        opacity: 0,
        targetOpacity: 0.3 + fillerRng() * 0.25,
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
        planet: cluster.id,
        lodReveal: 0.35,
        parent: cluster.id,
      })
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
