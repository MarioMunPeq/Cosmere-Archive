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

const ORBIT_LAYER = {
  HERALD: 0.03,
  IMPORTANT_CHAR: 0.05,
  CHAR: 0.07,
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
