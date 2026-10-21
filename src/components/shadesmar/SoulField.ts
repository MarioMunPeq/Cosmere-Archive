import type { Soul, DepthLayer } from './types'
import { ENTITY_VISUALS, CLUSTERS, WORLD_W, WORLD_H } from './types'
import { buildEntityCatalog } from './entity-catalog'
import type { SoulDef } from './entity-catalog'

/**
 * How far a soul may stray from its layer's radius.
 *
 * Must be wider than the gap to the next layer or the layers overlap and the
 * hierarchy — heralds at the centre, everyone else in the field — stops reading.
 */
const ORBIT_JITTER = 0.15

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

/**
 * The smallest zoom at which a soul of this kind is drawn.
 *
 * The renderer compares `camera.zoom * 2` against this, so these are half-zoom
 * values. Every threshold has to sit below the overview framing, which is
 * `VIEWPORT_FIT / WORLD_SPAN_Y = 0.5125` and therefore a `currentLod` of
 * 1.025 — the previous 1.2 for ordinary characters meant that at the overview,
 * the frame you always see first, 58 of the 93 souls were culled. An ocean that
 * is empty until you zoom in is a loading screen with a star field.
 *
 * What zoom *does* control is how detailed a soul is drawn, which is §5.5.4's
 * three-level LOD. That is a separate axis from whether it exists.
 */
function lodForKind(kind: SoulDef['kind']): number {
  switch (kind) {
    case 'herald':
      return 0.15
    case 'important_character':
      return 0.3
    default:
      return 0.55
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
    /*
     * Built once, here, rather than per frame in the draw loop. §5.5.4's
     * one-pixel level sets `fillStyle` from these; assembling ninety-five
     * `rgba()` strings on every frame to express values that never change is
     * ninety-five allocations a frame buying nothing.
     */
    dotFill: `rgba(${ev.core}, 0.9)`,
    rimStroke: `rgba(${ev.glow}, 0.55)`,
  }
}

/**
 * Every soul, ordered by depth layer.
 *
 * §5.5.4 asks for the sort to happen once rather than every frame. The draw
 * order is a property of the souls — a herald is always behind an ordinary
 * character — and filtering a sorted array preserves it, so the renderer can
 * cull by viewport and LOD and still draw back to front without sorting.
 */
function byLayer(a: Soul, b: Soul): number {
  return a.layer - b.layer
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
        const jitterD = (pRng() - 0.5) * ORBIT_JITTER
        const angle = baseAngle + i * gap + jitterA
        const dist = cr * (layer + jitterD)
        let x = cx + Math.cos(angle) * dist
        let y = cy + Math.sin(angle) * dist
        // The clamp is now to the world, not to a unit square that no longer
        // exists — the previous 0.01/0.99 bound quietly pushed every soul in the
        // right-hand third of the ocean onto its edge.
        x = Math.max(0.01, Math.min(WORLD_W - 0.01, x))
        y = Math.max(0.01, Math.min(WORLD_H - 0.01, y))
        souls.push(createSoul(def, x, y))
      }
    }
  }

  return souls.sort(byLayer)
}

/**
 * A uniform grid over the souls, for "who is near this point" queries.
 *
 * ## Why this is not rebuilt every frame
 *
 * The renderer used to call `rebuild(souls)` on every animation frame, which
 * cleared and refilled the whole structure sixty times a second to answer a
 * question about a world where ninety-five beads breathe by millimetres.
 *
 * `update()` now checks one number per soul — the cell it was last indexed at —
 * and only rebuilds when one of them has actually changed cell. A soul that has
 * drifted inside its cell cannot have changed any query's answer that matters,
 * because the query walks whole cells.
 *
 * The threshold is `cellSize / 4` rather than "any movement", because a soul
 * sitting exactly on a cell boundary would otherwise flip cells on every frame
 * from noise alone and rebuild forever.
 */
export class SpatialGrid {
  private cellSize: number
  private cells = new Map<number, Map<number, Soul[]>>()
  /** id → the position it was filed at, for the laziness check. */
  private indexed = new Map<string, { x: number; y: number }>()
  /** Rebuilds performed, so a test can assert the grid is actually lazy. */
  rebuilds = 0

  constructor(cellSize: number) {
    this.cellSize = cellSize
  }

  rebuild(souls: Soul[]): void {
    this.cells.clear()
    this.indexed.clear()
    this.rebuilds++
    for (const s of souls) {
      const cx = Math.floor(s.x / this.cellSize)
      const cy = Math.floor(s.y / this.cellSize)
      let col = this.cells.get(cx)
      if (!col) {
        col = new Map()
        this.cells.set(cx, col)
      }
      let cell = col.get(cy)
      if (!cell) {
        cell = []
        col.set(cy, cell)
      }
      cell.push(s)
      this.indexed.set(s.id, { x: s.x, y: s.y })
    }
  }

  /**
   * Rebuild only if a soul has actually travelled.
   *
   * The threshold is `cellSize / 4`, measured as **distance since the soul was
   * last indexed** — not as a difference of cell numbers. Comparing cell indices
   * looks equivalent and is not: a soul sitting a hair on the wrong side of a
   * boundary differs by one whole cell, so it rebuilt on every frame it sat
   * there. The test for "stays quiet for motion smaller than a quarter of a
   * cell" is what caught it.
   *
   * Rebuilding re-indexes everyone at their current position, so the distance
   * resets and a drifting world costs one rebuild per quarter-cell of travel
   * rather than one per frame.
   *
   * Returns true when it rebuilt, so the caller and the tests can see.
   */
  update(souls: Soul[]): boolean {
    const slackSq = (this.cellSize / 4) ** 2
    for (const s of souls) {
      const at = this.indexed.get(s.id)
      if (!at) {
        this.rebuild(souls)
        return true
      }
      const dx = s.x - at.x
      const dy = s.y - at.y
      if (dx * dx + dy * dy < slackSq) continue
      this.rebuild(souls)
      return true
    }
    return false
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
