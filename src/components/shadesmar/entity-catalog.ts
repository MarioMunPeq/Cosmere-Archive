import type { EntityKind } from './types'
import { HONORBLADES } from '@/data/static/aharietiam'
import ALL_CHARACTERS from '@/data/generated/characters.json'
import { ENTITY_VISUALS, CLUSTER_BY_ID } from './types'

export interface SoulDef {
  id: string
  name: string
  description: string
  kind: EntityKind
  cluster: string
  orbitLayer: number
  connections: string[]
}

const IMPORTANT_CHAR_IDS = new Set([
  'kaladin',
  'shallan',
  'dalinar',
  'adolin',
  'jasnah',
  'szeth',
  'navani',
  'vin',
  'kelsier',
  'elend',
  'sazed',
  'marsh',
  'spook',
  'wax',
  'wayne',
  'marasi',
  'steris',
  'raoden',
  'sarene',
  'shai',
  'vasher',
  'vivenna',
  'siri',
  'susebron',
  'lightsong',
  'khriss',
  'kenton',
  'hoid',
  'silence',
  'sixth_of_the_dusk',
  'tress',
  'charlie',
  'the_cinder_king',
  'fort',
  'nightblood',
  'sylphrena',
  'pattern',
])

/**
 * Where in its constellation a soul sits, as a fraction of the cluster radius.
 *
 * The previous values were 0.03 / 0.05 / 0.07, which put every soul inside 7% of
 * its cluster's radius: Roshar's 38 souls were a knot 7 millimetres across in a
 * 2.4-unit ocean. Each layer is now a ring at a readable distance, and
 * `jitterD` (see SoulField) spreads the layer wide enough that the outer one
 * fills the disc instead of drawing a circle.
 */
const ORBIT_LAYER = {
  // Keep the ten Heralds distinct as a small inner constellation rather than
  // stacking their flames into one white flare at the exact centre.
  HERALD: 0.32,
  IMPORTANT_CHAR: 0.46,
  CHAR: 0.82,
}

function connSet(arr: string[]): string[] {
  const s = new Set(arr.map((c) => `soul_${c}`))
  return [...s]
}

function clusterForPlanet(planetId: string): string {
  if (CLUSTER_BY_ID.has(planetId)) return planetId
  return 'cosmere'
}

function characterCatalog(): SoulDef[] {
  const out: SoulDef[] = []
  for (const ch of ALL_CHARACTERS) {
    if (!ch || !ch.id || !ch.name) continue
    const kind: EntityKind = IMPORTANT_CHAR_IDS.has(ch.id) ? 'important_character' : 'character'
    const planet = ch.planet ?? 'cosmere'
    const cluster = clusterForPlanet(planet)
    const connections: string[] = []
    if (ch.requiredBooks) connections.push(...ch.requiredBooks)
    out.push({
      id: `soul_${ch.id}`,
      name: ch.name,
      description: ch.description ?? '',
      kind,
      cluster,
      orbitLayer: kind === 'important_character' ? ORBIT_LAYER.IMPORTANT_CHAR : ORBIT_LAYER.CHAR,
      connections: connSet(connections),
    })
  }
  return out
}

function heraldCatalog(): SoulDef[] {
  const out: SoulDef[] = []
  for (const h of HONORBLADES) {
    out.push({
      id: `soul_${h.id}`,
      name: h.name,
      description: h.description ?? '',
      kind: 'herald',
      cluster: 'roshar',
      orbitLayer: ORBIT_LAYER.HERALD,
      connections: connSet(h.connections ?? []),
    })
  }
  return out
}

export function buildEntityCatalog(): SoulDef[] {
  const catalog: SoulDef[] = [...heraldCatalog(), ...characterCatalog()]

  const seen = new Set<string>()
  return catalog.filter((s) => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return true
  })
}

export function weightForKind(kind: EntityKind): number {
  return ENTITY_VISUALS[kind]?.mass ?? 1
}
