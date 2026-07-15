export { Canvas } from './Canvas'
export { generateSoulField, SpatialGrid } from './SoulField'
export { CameraController } from './Camera'
export { InteractionSystem } from './InteractionSystem'
export { InteractionModel } from './InteractionModel'
export { SelectionSystem } from './SelectionSystem'
export { PhysicsSystem } from './PhysicsSystem'
export { getSoulTexture, clearTextureCache, prewarmTextures } from './TextureCache'
export {
  drawBackground,
  drawSouls,
  drawHoverLabel,
  drawSelectionInfo,
  drawConnectionLines,
  drawClusterLabels,
} from './Renderer'
export { buildEntityCatalog } from './entity-catalog'
export type { SoulDef } from './entity-catalog'
export type {
  Soul,
  EntityKind,
  DepthLayer,
  SelectionState,
  SelectionParticle,
  ConnectionLine,
  EntityVisual,
} from './types'
export {
  ENTITY_VISUALS,
  CLUSTERS,
  CLUSTER_BY_ID,
  CURSOR_RADIUS_WORLD,
  HOVER_RADIUS_WORLD,
  CLICK_RADIUS_WORLD,
  FOG_PARTICLES,
  BG_DIM_FACTOR,
  OTHER_DIM_FACTOR,
  MIN_ZOOM,
  MAX_ZOOM,
  SMART_HOVER_RADIUS,
  HOVER_STABILITY_THRESHOLD,
  FOCUS_EXPANSION_AMPLITUDE,
  CURSOR_RIPPLE_STRENGTH,
  CURSOR_RIPPLE_RADIUS,
  SPRING_K,
  DAMPING_PER_FRAME,
  NOISE_AMP,
  MAX_VELOCITY,
  LABEL_FADE_ZOOM,
  CLUSTER_HOVER_RADIUS_WORLD,
  FOCUS_FLY_DURATION,
  FOCUS_EXIT_DURATION,
} from './types'
