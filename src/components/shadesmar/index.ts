export { Canvas } from './Canvas'
export { generateSoulField, SpatialGrid } from './SoulField'
export { InteractionSystem } from './InteractionSystem'
export { SelectionSystem } from './SelectionSystem'
export { getSoulTexture, clearTextureCache, prewarmTextures } from './TextureCache'
export { drawBackground, drawSouls, drawHoverLabel, drawSelectionInfo, drawConnectionLines } from './Renderer'
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
  PLANET_REGIONS,
  LAYER_CONFIG,
  TOTAL_SOULS,
  WORLD_RADIUS,
  CURIOUS_RADIUS,
  CURIOUS_MAX_SHIFT,
  CURIOUS_FORCE,
  HOVER_RADIUS,
  CLICK_RADIUS,
  VIEW_DRIFT_MAX,
  FOG_PARTICLES,
  ZOOM_FACTOR,
} from './types'
