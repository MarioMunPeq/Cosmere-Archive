/**
 * The eleven worlds, generated from `content/planets/`.
 *
 * `x`, `y` and `size` are the map layout and live in no collection: they are
 * presentation, not lore. `generate-worlds.ts` carries them from here by
 * reading this file, so removing the hardcoded records below is a two-line
 * change rather than a migration — and the coordinates are reported rather than
 * invented the day they go missing.
 *
 * `shardIds` is new and sourced: the display string is derived from it by
 * joining the Shard records' names, so "Honor, Cultivation & Odium" is a
 * rendering of three ids rather than a fourth copy of the fact.
 */

import planetsData from '@/data/generated/planets.json'
import type { Planet } from '@/types/planet'

export type { Planet }

export const PLANETS: Planet[] = planetsData as unknown as Planet[]

/** The twelve Allomantic metals, from `content/allomantic-metals/`. */
export { ALLOMANTIC_METALS } from './magic-systems'
