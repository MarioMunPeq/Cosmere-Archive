export { Canvas } from './Canvas'
export { generateSoulField, SpatialGrid } from './SoulField'
export { CameraController } from './Camera'
export { InteractionSystem } from './InteractionSystem'
export { SelectionSystem } from './SelectionSystem'
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
  CURIOUS_RADIUS_WORLD,
  HOVER_RADIUS_WORLD,
  CLICK_RADIUS_WORLD,
  FOG_PARTICLES,
  BG_DIM_FACTOR,
  OTHER_DIM_FACTOR,
  MIN_ZOOM,
  MAX_ZOOM,
} from './types'
