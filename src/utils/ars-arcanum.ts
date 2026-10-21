/**
 * The Ars Arcanum's table of contents, derived from the archive's data.
 *
 * `MAGIC_SYSTEMS` is generated in content order, which is alphabetical by
 * world. The printed book deliberately follows the survey order below: Yolen
 * first because it is the origin, then the worlds where Investiture is best
 * documented. Keeping the order here means the contents page, the thumb index,
 * the chapter headings and the index all agree without copying a second list
 * of planets into each of them.
 */

import { PLANETS } from '@/data/static'
import { MAGIC_SYSTEMS, type MagicSystem } from '@/data/static/magic-systems'
import type { Planet } from '@/types/planet'
import { toRoman } from './codex-pages'

export const ARS_ARCANUM_ORDER = [
  'yolen',
  'roshar',
  'scadrial',
  'sel',
  'nalthis',
  'taldain',
  'threnody',
  'first-of-the-sun',
  'komashi',
  'lumar',
  'canticle',
] as const

export interface ArcanumChapter {
  planet: Planet
  systems: MagicSystem[]
  /** Printed chapter number, I–XI. */
  numeral: string
}

const planetById = new Map(PLANETS.map((planet) => [planet.id, planet]))
const systemsByPlanet = new Map<string, MagicSystem[]>()

for (const system of MAGIC_SYSTEMS) {
  const existing = systemsByPlanet.get(system.planetId) ?? []
  existing.push(system)
  systemsByPlanet.set(system.planetId, existing)
}

export const ARCANUM_CHAPTERS: ArcanumChapter[] = ARS_ARCANUM_ORDER.flatMap((planetId, index) => {
  const planet = planetById.get(planetId)
  const systems = systemsByPlanet.get(planetId)
  if (!planet || !systems?.length) return []
  return [{ planet, systems, numeral: toRoman(index + 1) }]
})

const numeralByPlanet = new Map(ARCANUM_CHAPTERS.map((chapter) => [chapter.planet.id, chapter.numeral]))

/** Printed chapter number for a world, or an empty string when it has none. */
export function chapterNumeral(planetId: string): string {
  return numeralByPlanet.get(planetId) ?? ''
}
