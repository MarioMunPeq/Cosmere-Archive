export interface AllomanticMetal {
  id: string
  name: string
  alloy: string
  group: 'physical' | 'mental' | 'temporal' | 'enhancement'
  allomanticPower: string
  feruchemicalPower: string
  hemalurgicProperty: string
  color: string
}

export interface MagicSystem {
  id: string
  name: string
  description: string
  planetId: string
  shard: string
  color: string
  category: string
  bookIds: string[]
  allomanticMetals?: AllomanticMetal[]
  /** Metal **ids**, from `content/magic-systems/`. `getMetalsFor` resolves them. */
  allomanticMetalIds?: string[]
  classification?: string
  status?: string
  academicNote?: string
}

import metalsData from '@/data/generated/allomantic-metals.json'

/**
 * The sixteen metals, generated from content/allomantic-metals/.
 *
 * They were hardcoded here as well as authored there, and the two copies
 * held the same sixteen with the same powers — a duplicate that could
 * never disagree about what Iron does and would have disagreed the day
 * somebody edited one of them.
 */
export const ALLOMANTIC_METALS: AllomanticMetal[] = metalsData as AllomanticMetal[]

import systemsData from '@/data/generated/magic-systems.json'

/**
 * The twenty magic systems, generated from `content/magic-systems/`.
 *
 * The win here is a join rather than a copy. Each system used to carry the full
 * text of the metals it touched, so "Iron: Pull on nearby metals" was written
 * down twenty times in two files and would have disagreed with
 * `content/allomantic-metals/` the day anyone edited one of them. A system now
 * names its metals in `allomanticMetalIds` and they are looked up.
 *
 * `getMetalsFor` is the lookup, so consumers get objects rather than ids.
 */
export const MAGIC_SYSTEMS: MagicSystem[] = systemsData as unknown as MagicSystem[]

/** The metals a system touches, as objects. */
export function getMetalsFor(system: MagicSystem): AllomanticMetal[] {
  return (system.allomanticMetalIds ?? [])
    .map((id) => ALLOMANTIC_METALS.find((m) => m.id === id))
    .filter((m): m is AllomanticMetal => Boolean(m))
}
