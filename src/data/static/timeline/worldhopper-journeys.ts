export interface WorldhopperMovement {
  id: string
  name: string
  color: string
  description: string
  planets: string[]
  sagas: string[]
  movements: { year: number; planet: string; description: string }[]
}

import worldhoppersData from '@/data/generated/worldhoppers.json'

/**
 * Five wanderers and forty-one movements between them, generated from
 * content/worldhoppers/.
 *
 * id is the runtime spelling (hoid), not the content one (wh-hoid).
 * Nothing outside this module reads it, but it is what any DOM key has
 * always used, so the prefix is stripped rather than propagated.
 *
 * character is new and sourced: it is the join back to content/characters/.
 * Dropping it would leave the id as the only link between a wanderer and a person.
 */
export const WORLDHOPPER_MOVEMENTS: WorldhopperMovement[] = worldhoppersData as WorldhopperMovement[]
