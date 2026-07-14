export type EntityKind =
  | 'character'
  | 'important_character'
  | 'herald'
  | 'honorblade'
  | 'book'
  | 'magic'
  | 'shard'
  | 'planet'
  | 'saga'
  | 'spren'
  | 'organization'
  | 'event'
  | 'adonalsium'
  | 'location'
  | 'artifact'
  | 'concept'
  | 'filler'

export type DepthLayer = 0 | 1 | 2 | 3

export interface Soul {
  id: string
  x: number
  y: number
  radius: number
  kind: EntityKind
  layer: DepthLayer
  color: string
  glowColor: string
  coreColor: string
  mass: number

  vx: number
  vy: number
  noisePhase: number
  noiseAmp: number
  orbitAngle: number
  orbitSpeed: number
  orbitRadius: number

  opacity: number
  targetOpacity: number
  glow: number
  targetGlow: number
  scale: number
  targetScale: number
  breathePhase: number

  curious: boolean
  curiousDx: number
  curiousDy: number

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
  filler: { sizeMin: 3, sizeMax: 5, color: '100,110,120', glow: '80,90,100', core: '140,150,160', mass: 0.3 },
  character: { sizeMin: 6, sizeMax: 9, color: '0,200,255', glow: '80,220,255', core: '180,235,255', mass: 0.5 },
  important_character: {
    sizeMin: 11,
    sizeMax: 15,
    color: '0,200,255',
    glow: '80,220,255',
    core: '180,235,255',
    mass: 0.7,
  },
  book: { sizeMin: 12, sizeMax: 16, color: '220,225,230', glow: '240,242,245', core: '255,255,255', mass: 2.0 },
  magic: { sizeMin: 12, sizeMax: 16, color: '160,100,255', glow: '140,80,230', core: '200,160,255', mass: 1.8 },
  shard: { sizeMin: 20, sizeMax: 26, color: '220,180,40', glow: '255,215,0', core: '255,240,180', mass: 4.0 },
  herald: { sizeMin: 14, sizeMax: 20, color: '210,215,225', glow: '230,235,245', core: '250,250,255', mass: 2.5 },
  honorblade: { sizeMin: 10, sizeMax: 14, color: '160,200,240', glow: '180,220,255', core: '210,235,255', mass: 1.5 },
  planet: { sizeMin: 22, sizeMax: 28, color: '80,200,120', glow: '60,180,100', core: '140,240,180', mass: 3.5 },
  saga: { sizeMin: 10, sizeMax: 13, color: '220,225,230', glow: '240,242,245', core: '255,255,255', mass: 1.5 },
  spren: { sizeMin: 5, sizeMax: 8, color: '120,200,240', glow: '80,180,230', core: '180,230,255', mass: 0.4 },
  organization: { sizeMin: 9, sizeMax: 13, color: '220,180,60', glow: '200,160,40', core: '255,210,100', mass: 1.2 },
  event: { sizeMin: 6, sizeMax: 10, color: '200,60,80', glow: '180,40,60', core: '240,140,150', mass: 0.8 },
  location: { sizeMin: 6, sizeMax: 10, color: '80,200,120', glow: '40,160,80', core: '140,240,180', mass: 0.6 },
  artifact: { sizeMin: 7, sizeMax: 11, color: '200,180,140', glow: '180,160,120', core: '230,210,180', mass: 0.9 },
  adonalsium: { sizeMin: 28, sizeMax: 36, color: '180,160,220', glow: '220,200,255', core: '250,240,255', mass: 6.0 },
  concept: { sizeMin: 7, sizeMax: 11, color: '200,180,200', glow: '180,160,180', core: '230,210,230', mass: 0.8 },
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
  { id: 'roshar', name: 'Roshar', cx: 0.24, cy: 0.4, radius: 0.14, planetRadius: 0.013, color: '0,182,212' },
  { id: 'scadrial', name: 'Scadrial', cx: 0.76, cy: 0.4, radius: 0.13, planetRadius: 0.013, color: '239,68,68' },
  { id: 'sel', name: 'Sel', cx: 0.1, cy: 0.62, radius: 0.11, planetRadius: 0.01, color: '20,184,166' },
  { id: 'nalthis', name: 'Nalthis', cx: 0.35, cy: 0.62, radius: 0.1, planetRadius: 0.009, color: '217,70,239' },
  { id: 'taldain', name: 'Taldain', cx: 0.65, cy: 0.62, radius: 0.09, planetRadius: 0.009, color: '234,179,8' },
  { id: 'threnody', name: 'Threnody', cx: 0.09, cy: 0.27, radius: 0.08, planetRadius: 0.007, color: '139,92,246' },
  {
    id: 'first-of-the-sun',
    name: 'First of the Sun',
    cx: 0.3,
    cy: 0.2,
    radius: 0.08,
    planetRadius: 0.007,
    color: '34,197,94',
  },
  { id: 'komashi', name: 'Komashi', cx: 0.55, cy: 0.2, radius: 0.08, planetRadius: 0.007, color: '14,165,233' },
  { id: 'lumar', name: 'Lumar', cx: 0.76, cy: 0.22, radius: 0.08, planetRadius: 0.007, color: '244,114,182' },
  { id: 'canticle', name: 'Canticle', cx: 0.91, cy: 0.55, radius: 0.07, planetRadius: 0.006, color: '249,115,22' },
  { id: 'yolen', name: 'Yolen', cx: 0.5, cy: 0.1, radius: 0.07, planetRadius: 0.007, color: '167,139,250' },
  { id: 'cosmere', name: 'Cosmere', cx: 0.5, cy: 0.42, radius: 0.08, planetRadius: 0, color: '100,150,200' },
]

export const CLUSTER_BY_ID = new Map<string, ClusterDef>(CLUSTERS.map((c) => [c.id, c]))

export const CURIOUS_RADIUS_WORLD = 0.08
export const HOVER_RADIUS_WORLD = 0.018
export const CLICK_RADIUS_WORLD = 0.018
export const FOG_PARTICLES = 100
export const BG_DIM_FACTOR = 0.35
export const OTHER_DIM_FACTOR = 0.4

export const MIN_ZOOM = 0.3
export const MAX_ZOOM = 5.0
export const CAMERA_DRAG_DAMPING = 0.92
export const CAMERA_INERTIA = 0.97

export const LABEL_FADE_ZOOM = 0.25
export const CLUSTER_HOVER_RADIUS_WORLD = 0.04
