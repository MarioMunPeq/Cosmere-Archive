export type { CosmicEra } from './eras'
export { ERAS } from './eras'

export type { TimelineEvent } from './events'
export { TIMELINE_EVENTS } from './events'

export type { CharacterSpan } from './character-lifespans'
export { CHARACTER_SPANS, CHARACTER_GROUPS } from './character-lifespans'

export type { WorldhopperMovement } from './worldhopper-journeys'
import { WORLDHOPPER_MOVEMENTS } from './worldhopper-journeys'
export { WORLDHOPPER_MOVEMENTS }

export interface WorldhopperDisplay {
  id: string
  name: string
  description: string
  color: string
  planets: string[]
  sagas: string[]
}
export const WORLDHOPPERS: WorldhopperDisplay[] = WORLDHOPPER_MOVEMENTS.map(w => ({
  id: w.id,
  name: w.name,
  description: w.description,
  color: w.color,
  planets: w.planets,
  sagas: w.sagas,
}))
