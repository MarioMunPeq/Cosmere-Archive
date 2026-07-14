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
  character: { sizeMin: 7, sizeMax: 9, color: '0,200,255', glow: '80,220,255', core: '180,235,255', mass: 0.5 },
  important_character: {
    sizeMin: 12,
    sizeMax: 16,
    color: '0,200,255',
    glow: '80,220,255',
    core: '180,235,255',
    mass: 0.7,
  },
  book: { sizeMin: 14, sizeMax: 18, color: '220,225,230', glow: '240,242,245', core: '255,255,255', mass: 2.0 },
  magic: { sizeMin: 14, sizeMax: 18, color: '160,100,255', glow: '140,80,230', core: '200,160,255', mass: 1.8 },
  shard: { sizeMin: 22, sizeMax: 28, color: '220,180,40', glow: '255,215,0', core: '255,240,180', mass: 4.0 },
  herald: { sizeMin: 16, sizeMax: 22, color: '210,215,225', glow: '230,235,245', core: '250,250,255', mass: 2.5 },
  honorblade: { sizeMin: 12, sizeMax: 16, color: '160,200,240', glow: '180,220,255', core: '210,235,255', mass: 1.5 },
  planet: { sizeMin: 18, sizeMax: 24, color: '80,200,120', glow: '60,180,100', core: '140,240,180', mass: 3.0 },
  saga: { sizeMin: 10, sizeMax: 14, color: '220,225,230', glow: '240,242,245', core: '255,255,255', mass: 1.5 },
  spren: { sizeMin: 5, sizeMax: 8, color: '120,200,240', glow: '80,180,230', core: '180,230,255', mass: 0.4 },
  organization: { sizeMin: 10, sizeMax: 14, color: '220,180,60', glow: '200,160,40', core: '255,210,100', mass: 1.2 },
  event: { sizeMin: 7, sizeMax: 11, color: '200,60,80', glow: '180,40,60', core: '240,140,150', mass: 0.8 },
  location: { sizeMin: 6, sizeMax: 10, color: '80,200,120', glow: '40,160,80', core: '140,240,180', mass: 0.6 },
  artifact: { sizeMin: 8, sizeMax: 12, color: '200,180,140', glow: '180,160,120', core: '230,210,180', mass: 0.9 },
  adonalsium: { sizeMin: 30, sizeMax: 40, color: '180,160,220', glow: '220,200,255', core: '250,240,255', mass: 6.0 },
  concept: { sizeMin: 8, sizeMax: 12, color: '200,180,200', glow: '180,160,180', core: '230,210,230', mass: 0.8 },
}

export const PLANET_REGIONS: Record<string, { x: number; y: number; radius: number }> = {
  roshar: { x: -600, y: 0, radius: 400 },
  scadrial: { x: 600, y: 0, radius: 380 },
  sel: { x: -300, y: 500, radius: 260 },
  nalthis: { x: 300, y: 450, radius: 220 },
  taldain: { x: -500, y: -400, radius: 200 },
  threnody: { x: 0, y: -500, radius: 180 },
  'first-of-the-sun': { x: 500, y: -350, radius: 180 },
  komashi: { x: -200, y: -200, radius: 180 },
  lumar: { x: 200, y: -150, radius: 170 },
  canticle: { x: 700, y: -200, radius: 150 },
  yolen: { x: -100, y: 100, radius: 160 },
  cosmere: { x: 0, y: 0, radius: 200 },
}

export const LAYER_CONFIG = [
  { parallax: 1.0, drift: 1.0, opacity: 0.95 },
  { parallax: 0.6, drift: 0.7, opacity: 0.8 },
  { parallax: 0.3, drift: 0.4, opacity: 0.6 },
  { parallax: 0.1, drift: 0.2, opacity: 0.35 },
] as const

export const TOTAL_SOULS = 1500
export const WORLD_RADIUS = 2000
export const CURIOUS_RADIUS = 250
export const CURIOUS_MAX_SHIFT = 35
export const CURIOUS_FORCE = 20
export const HOVER_RADIUS = 30
export const CLICK_RADIUS = 25
export const VIEW_DRIFT_MAX = 6
export const FOG_PARTICLES = 150
export const ZOOM_FACTOR = 2.2
