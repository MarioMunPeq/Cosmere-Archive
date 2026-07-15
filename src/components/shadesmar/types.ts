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

export interface ClusterDef {
  id: string
  name: string
  cx: number
  cy: number
  radius: number
  planetRadius: number
  color: string
}

export const CLUSTERS: ClusterDef[] = [
  { id: 'roshar', name: 'Roshar', cx: 0.311, cy: 0.396, radius: 0.14, planetRadius: 0.013, color: '0,182,212' },
  { id: 'scadrial', name: 'Scadrial', cx: 0.675, cy: 0.396, radius: 0.13, planetRadius: 0.013, color: '239,68,68' },
  { id: 'sel', name: 'Sel', cx: 0.213, cy: 0.55, radius: 0.11, planetRadius: 0.01, color: '20,184,166' },
  { id: 'nalthis', name: 'Nalthis', cx: 0.388, cy: 0.55, radius: 0.1, planetRadius: 0.009, color: '217,70,239' },
  { id: 'taldain', name: 'Taldain', cx: 0.598, cy: 0.55, radius: 0.09, planetRadius: 0.009, color: '234,179,8' },
  { id: 'threnody', name: 'Threnody', cx: 0.206, cy: 0.305, radius: 0.08, planetRadius: 0.007, color: '139,92,246' },
  {
    id: 'first-of-the-sun',
    name: 'First of the Sun',
    cx: 0.353,
    cy: 0.256,
    radius: 0.08,
    planetRadius: 0.007,
    color: '34,197,94',
  },
  { id: 'komashi', name: 'Komashi', cx: 0.528, cy: 0.256, radius: 0.08, planetRadius: 0.007, color: '14,165,233' },
  { id: 'lumar', name: 'Lumar', cx: 0.675, cy: 0.27, radius: 0.08, planetRadius: 0.007, color: '244,114,182' },
  { id: 'canticle', name: 'Canticle', cx: 0.78, cy: 0.501, radius: 0.07, planetRadius: 0.006, color: '249,115,22' },
  { id: 'yolen', name: 'Yolen', cx: 0.493, cy: 0.186, radius: 0.07, planetRadius: 0.007, color: '167,139,250' },
  { id: 'cosmere', name: 'Cosmere', cx: 0.493, cy: 0.41, radius: 0.08, planetRadius: 0, color: '100,150,200' },
]

export const CLUSTER_BY_ID = new Map<string, ClusterDef>(CLUSTERS.map((c) => [c.id, c]))

export const FOG_PARTICLES = 100
export const OTHER_DIM_FACTOR = 0.4

export const MIN_ZOOM = 0.3
export const MAX_ZOOM = 5.0
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
export const SMART_HOVER_RADIUS = 0.08
export const HOVER_STABILITY_THRESHOLD = 0.006
export const FOCUS_FLY_DURATION = 0.8
export const FOCUS_EXIT_DURATION = 0.6
