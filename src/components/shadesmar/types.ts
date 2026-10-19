export type EntityKind = 'character' | 'important_character' | 'herald'

export type DepthLayer = 0 | 1 | 2

export interface Soul {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  restX: number
  restY: number
  radius: number
  kind: EntityKind
  layer: DepthLayer
  color: string
  glowColor: string
  coreColor: string
  mass: number

  opacity: number
  targetOpacity: number
  glow: number
  targetGlow: number
  scale: number
  targetScale: number
  breathePhase: number

  entityId: string | null
  name: string | null
  description: string | null
  connections: string[]
  planet: string | null

  lodReveal: number
  parent: string | null
}

export interface SelectionParticle {
  angle: number
  radius: number
  speed: number
  size: number
  opacity: number
}

export interface ConnectionLine {
  toId: string
  color: string
  progress: number
}

export interface SelectionState {
  soulId: string | null
  phase: 'idle' | 'growing' | 'revealing' | 'displaying' | 'hiding'
  progress: number
  particles: SelectionParticle[]
  connections: ConnectionLine[]
  bgDim: number
  otherDim: number
}

export interface EntityVisual {
  sizeMin: number
  sizeMax: number
  color: string
  glow: string
  core: string
  mass: number
}

export const ENTITY_VISUALS: Record<EntityKind, EntityVisual> = {
  character: { sizeMin: 8, sizeMax: 12, color: '0,200,255', glow: '80,220,255', core: '180,235,255', mass: 0.5 },
  important_character: {
    sizeMin: 14,
    sizeMax: 20,
    color: '0,200,255',
    glow: '80,220,255',
    core: '180,235,255',
    mass: 0.7,
  },
  herald: { sizeMin: 18, sizeMax: 26, color: '210,215,225', glow: '230,235,245', core: '250,250,255', mass: 2.5 },
}

/* ---------------------------------------------------------------------------
 * The world.
 *
 * §5.5.1 calls the old calibration "the main bug": a 1x1 world, a hardcoded
 * `zoom = 0.5`, and twelve cluster centres written out by hand. On a 2557px
 * screen the Roshar cluster measured 136px — 5.3% of the view. The ocean had
 * the proportions of a stamp.
 *
 * 3:2 rather than 1:1 because a viewport is rarely square, and fitting a square
 * world into a 21:9 monitor leaves most of the width empty.
 * ------------------------------------------------------------------------- */

export const WORLD_W = 2.4
export const WORLD_H = 1.6

/** The span `fitToViewport` fits to: the shorter axis, so nothing is ever cropped vertically. */
export const WORLD_SPAN_Y = WORLD_H

/**
 * Grid the realms are placed on: 4 x 3, cells filled in reading order.
 *
 * The 12th cell is left empty. `src/data/static/planets.ts` defines eleven
 * worlds, so there are eleven perpendicularities, not the twelve §5.5.1 assumes.
 * The plan's number is not the data's number, and inventing a twelfth realm to
 * fill a grid square would put a place that does not exist into a view whose
 * whole subject is places that do.
 */
export const GRID_COLS = 4
export const GRID_ROWS = 3
export const CELL_W = WORLD_W / GRID_COLS
export const CELL_H = WORLD_H / GRID_ROWS

/**
 * Constellation radius, as a fraction of the smaller grid cell.
 *
 * §5.4.5 writes this as "0.19 x worldSpan". Read against the world (1.6) the
 * radius would be 0.304 against a 0.533 row pitch, so vertically adjacent
 * clusters would overlap by 14% and their outer rings would interpenetrate.
 * Read against the cell it is the same proportion, and neighbouring
 * constellations stay legible as separate bodies of light.
 */
export const CLUSTER_RADIUS = 0.19 * Math.min(CELL_W, CELL_H)

/** Deterministic jitter, so clusters are not on a visibly perfect lattice. */
export const CLUSTER_JITTER = 0.025

/** Fraction of the viewport the world's short axis is fitted to; the rest is margin. */
export const VIEWPORT_FIT = 0.82

export interface ClusterDef {
  id: string
  name: string
  cx: number
  cy: number
  radius: number
  planetRadius: number
  color: string
  /** `false` for the Cosmere itself, which is not a perpendicularity. */
  perpendicularity: boolean
}

/**
 * Stable string hash. Jitter must be identical on every render and on every
 * machine: a constellation that reshuffles between frames is not a place.
 */
function hashUnit(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return ((h >>> 0) % 100000) / 100000 - 0.5
}

/** One grid cell's centre, in world units. */
function cellCentre(col: number, row: number): { cx: number; cy: number } {
  return { cx: (col + 0.5) * CELL_W, cy: (row + 0.5) * CELL_H }
}

/** Place a cluster on its grid cell, offset by a hash of its own id. */
function place(id: string, col: number, row: number) {
  const { cx, cy } = cellCentre(col, row)
  return {
    cx: cx + hashUnit(id) * 2 * CLUSTER_JITTER,
    cy: cy + hashUnit(`${id}:y`) * 2 * CLUSTER_JITTER,
  }
}

/**
 * The realms, in reading order, and their cells.
 *
 * `planetRadius` is the size of the labelled body at the constellation's centre,
 * which shrinks with zoom out to a point of light. `perpendicularity` is false
 * only for the Cosmere, which the other eleven orbit.
 */
const REALMS: { id: string; name: string; color: string }[] = [
  { id: 'roshar', name: 'Roshar', color: '0,182,212' },
  { id: 'scadrial', name: 'Scadrial', color: '239,68,68' },
  { id: 'sel', name: 'Sel', color: '20,184,166' },
  { id: 'nalthis', name: 'Nalthis', color: '217,70,239' },
  { id: 'taldain', name: 'Taldain', color: '234,179,8' },
  { id: 'threnody', name: 'Threnody', color: '139,92,246' },
  { id: 'first-of-the-sun', name: 'First of the Sun', color: '34,197,94' },
  { id: 'komashi', name: 'Komashi', color: '14,165,233' },
  { id: 'lumar', name: 'Lumar', color: '244,114,182' },
  { id: 'canticle', name: 'Canticle', color: '249,115,22' },
  { id: 'yolen', name: 'Yolen', color: '167,139,250' },
]

function buildClusters(): ClusterDef[] {
  const out: ClusterDef[] = REALMS.map((r, i) => {
    const col = i % GRID_COLS
    const row = Math.floor(i / GRID_COLS)
    const { cx, cy } = place(r.id, col, row)
    return { ...r, cx, cy, radius: CLUSTER_RADIUS, planetRadius: 0.011, perpendicularity: true }
  })
  // The Cosmere sits at the centre of the ocean rather than in a grid cell,
  // because every realm is a perpendicularity *to* it and drawing it as
  // another peer would imply a fourteenth world.
  out.push({
    id: 'cosmere',
    name: 'Cosmere',
    cx: WORLD_W / 2,
    cy: WORLD_H / 2,
    radius: CLUSTER_RADIUS,
    planetRadius: 0,
    color: '100,150,200',
    perpendicularity: false,
  })
  return out
}

export const CLUSTERS: ClusterDef[] = buildClusters()

/** The eleven perpendicularities. The legend and the index are built from this. */
export const PERPENDICULARITIES = CLUSTERS.filter((c) => c.perpendicularity)

/**
 * The on-screen extent of the realm grid, in world units.
 *
 * Criterion S.1 measures this, so it is a function and not a constant someone
 * recomputes in a test: the number has to come from the same layout the canvas
 * draws, or the test is measuring a second, imaginary ocean.
 */
export function realmBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const c of PERPENDICULARITIES) {
    minX = Math.min(minX, c.cx - c.radius)
    minY = Math.min(minY, c.cy - c.radius)
    maxX = Math.max(maxX, c.cx + c.radius)
    maxY = Math.max(maxY, c.cy + c.radius)
  }
  return { minX, minY, maxX, maxY }
}

export const CLUSTER_BY_ID = new Map<string, ClusterDef>(CLUSTERS.map((c) => [c.id, c]))

export const FOG_PARTICLES = 100
export const OTHER_DIM_FACTOR = 0.4

export const MIN_ZOOM = 0.25
export const MAX_ZOOM = 4.0
export const CAMERA_INERTIA = 0.97

export const LABEL_FADE_ZOOM = 0.25
export const CLUSTER_HOVER_RADIUS_WORLD = 0.04

export const SPRING_K = 6.0
export const DAMPING_PER_FRAME = 0.94
export const CURSOR_RIPPLE_STRENGTH = 0.0004
export const CURSOR_RIPPLE_RADIUS = 0.05
export const NOISE_AMP = 0.0003
export const MAX_VELOCITY = 0.00005

export const FOCUS_EXPANSION_AMPLITUDE = 0.8
/** Fraction of the viewport's short side a focused realm fills. */
export const FOCUS_VIEWPORT_FRACTION = 0.62

/* ---- §5.5.2 gestures ---- */

/** Travel, in CSS pixels, past which a press is a drag rather than a tap. */
export const DRAG_THRESHOLD_PX = 4

/**
 * Smallest pinch ratio applied.
 *
 * A pinch whose spread changes by 0.1% is a finger resting on glass, not a
 * gesture, and multiplying the zoom by 1.001 sixty times a second walks the
 * camera somewhere nobody asked it to go.
 */
export const PINCH_ZOOM_MIN_STEP = 1.01

/** Wheel steps, per §5.5.2. */
export const WHEEL_ZOOM_IN = 1.08
export const WHEEL_ZOOM_OUT = 0.92

/** The HUD's touch targets. Criterion S.9 requires exactly this, not "about". */
export const HUD_BUTTON_SIZE = 44
export const SMART_HOVER_RADIUS = 0.08
export const HOVER_STABILITY_THRESHOLD = 0.006
export const FOCUS_FLY_DURATION = 0.8
export const FOCUS_EXIT_DURATION = 0.6
