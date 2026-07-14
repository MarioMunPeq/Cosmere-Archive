import type { EntityKind } from './types'
import { BOOKS } from '@/data/static/books'
import { PLANETS } from '@/data/static/planets'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import { HONORBLADES } from '@/data/static/aharietiam'
import { SAGAS } from '@/data/static/sagas'
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
  PLANET: 0.0,
  SHARD: 0.02,
  HERALD: 0.03,
  ADONALSIUM: 0.02,
  BOOK: 0.05,
  IMPORTANT_CHAR: 0.06,
  CHAR: 0.08,
  MAGIC: 0.08,
  SPREN: 0.09,
  HONORBLADE: 0.04,
  LOCATION: 0.1,
  ORGANIZATION: 0.11,
  EVENT: 0.11,
  ARTIFACT: 0.07,
  CONCEPT: 0.1,
  SAGA: 0.12,
  FILLER: 0.13,
}

function connSet(arr: string[]): string[] {
  const s = new Set(arr.map((c) => `soul_${c}`))
  return [...s]
}

function clusterForPlanet(planetId: string): string {
  if (CLUSTER_BY_ID.has(planetId)) return planetId
  return 'cosmere'
}

function sagaToCluster(saga: string): string {
  const map: Record<string, string> = {
    'mistborn-era-1': 'scadrial',
    'mistborn-era-2': 'scadrial',
    stormlight: 'roshar',
    elantris: 'sel',
    warbreaker: 'nalthis',
    'white-sand': 'taldain',
    'secret-projects': 'cosmere',
    'arcanum-unbounded': 'cosmere',
  }
  return map[saga] ?? 'cosmere'
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

function bookCatalog(): SoulDef[] {
  return BOOKS.map((b) => ({
    id: `soul_${b.id}`,
    name: b.title,
    description: b.description ?? '',
    kind: 'book' as EntityKind,
    cluster: sagaToCluster(b.saga),
    orbitLayer: ORBIT_LAYER.BOOK,
    connections: connSet(b.saga ? [b.saga] : []),
  }))
}

function magicCatalog(): SoulDef[] {
  return MAGIC_SYSTEMS.map((m) => ({
    id: `soul_${m.id}`,
    name: m.name,
    description: m.description ?? '',
    kind: 'magic' as EntityKind,
    cluster: m.planetId && CLUSTER_BY_ID.has(m.planetId) ? m.planetId : 'cosmere',
    orbitLayer: ORBIT_LAYER.MAGIC,
    connections: connSet(m.bookIds ?? []),
  }))
}

function planetCatalog(): SoulDef[] {
  return PLANETS.map((p) => ({
    id: `soul_planet_${p.id}`,
    name: p.name,
    description: p.description ?? '',
    kind: 'planet' as EntityKind,
    cluster: p.id,
    orbitLayer: ORBIT_LAYER.PLANET,
    connections: connSet(p.books ?? []),
  }))
}

function honorbladeCatalog(): SoulDef[] {
  const out: SoulDef[] = []
  for (const h of HONORBLADES) {
    out.push({
      id: `soul_${h.id}`,
      name: h.name,
      description: h.description ?? '',
      kind: 'herald' as EntityKind,
      cluster: 'roshar',
      orbitLayer: ORBIT_LAYER.HERALD,
      connections: connSet(h.connections ?? []),
    })
    out.push({
      id: `soul_honorblade_${h.id}`,
      name: `${h.name}'s Honorblade`,
      description: `The Honorblade of ${h.name}, ${h.title}.`,
      kind: 'honorblade' as EntityKind,
      cluster: 'roshar',
      orbitLayer: ORBIT_LAYER.HONORBLADE,
      connections: connSet(h.connections ?? []),
    })
  }
  return out
}

function sagaCatalog(): SoulDef[] {
  return SAGAS.map((s) => ({
    id: `soul_saga_${s.id}`,
    name: s.name,
    description: s.description ?? '',
    kind: 'saga' as EntityKind,
    cluster: sagaToCluster(s.id),
    orbitLayer: ORBIT_LAYER.SAGA,
    connections: [],
  }))
}

function shardCatalog(): SoulDef[] {
  const shards: [string, string][] = [
    ['Honor', 'roshar'],
    ['Cultivation', 'roshar'],
    ['Odium', 'roshar'],
    ['Preservation', 'scadrial'],
    ['Ruin', 'scadrial'],
    ['Harmony', 'scadrial'],
    ['Devotion', 'sel'],
    ['Dominion', 'sel'],
    ['Endowment', 'nalthis'],
    ['Autonomy', 'taldain'],
    ['Ambition', 'threnody'],
    ['Mercy', 'lumar'],
    ['Virtuosity', 'komashi'],
    ['Adonalsium', 'yolen'],
  ]

  return shards.map(([name, planet]) => ({
    id: `soul_shard_${name.toLowerCase()}`,
    name,
    description: `The Shard of ${name}.`,
    kind: (name === 'Adonalsium' ? 'adonalsium' : 'shard') as EntityKind,
    cluster: planet,
    orbitLayer: name === 'Adonalsium' ? ORBIT_LAYER.ADONALSIUM : ORBIT_LAYER.SHARD,
    connections: [],
  }))
}

function extraCatalog(): SoulDef[] {
  return [
    {
      id: 'soul_cognitive_realm',
      name: 'Shadesmar',
      description: 'The Cognitive Realm — an endless ocean connecting all worlds.',
      kind: 'location',
      cluster: 'cosmere',
      orbitLayer: ORBIT_LAYER.CONCEPT,
      connections: [],
    },
    {
      id: 'soul_spiritual_realm',
      name: 'The Spiritual Realm',
      description: 'The realm of Connection, Identity, and Investiture.',
      kind: 'location',
      cluster: 'cosmere',
      orbitLayer: ORBIT_LAYER.CONCEPT,
      connections: [],
    },
    {
      id: 'soul_physical_realm',
      name: 'The Physical Realm',
      description: 'The realm of matter and energy.',
      kind: 'location',
      cluster: 'cosmere',
      orbitLayer: ORBIT_LAYER.CONCEPT,
      connections: [],
    },
    {
      id: 'soul_beyond',
      name: 'The Beyond',
      description: 'What lies after death — unknown and unknowable.',
      kind: 'concept',
      cluster: 'cosmere',
      orbitLayer: ORBIT_LAYER.CONCEPT,
      connections: [],
    },
    {
      id: 'soul_elantris_city',
      name: 'Elantris',
      description: 'The fallen city of the Aonic people on Sel.',
      kind: 'location',
      cluster: 'sel',
      orbitLayer: ORBIT_LAYER.LOCATION,
      connections: [],
    },
    {
      id: 'soul_kholinar',
      name: 'Kholinar',
      description: 'The capital of Alethkar on Roshar.',
      kind: 'location',
      cluster: 'roshar',
      orbitLayer: ORBIT_LAYER.LOCATION,
      connections: [],
    },
    {
      id: 'soul_urithiru',
      name: 'Urithiru',
      description: 'The ancient tower-city of the Knights Radiant.',
      kind: 'location',
      cluster: 'roshar',
      orbitLayer: ORBIT_LAYER.LOCATION,
      connections: [],
    },
    {
      id: 'soul_luthadel',
      name: 'Luthadel',
      description: 'The capital of the Final Empire on Scadrial.',
      kind: 'location',
      cluster: 'scadrial',
      orbitLayer: ORBIT_LAYER.LOCATION,
      connections: [],
    },
    {
      id: 'soul_elendel',
      name: 'Elendel',
      description: 'The great city of the Basin on Scadrial.',
      kind: 'location',
      cluster: 'scadrial',
      orbitLayer: ORBIT_LAYER.LOCATION,
      connections: [],
    },
    {
      id: 'soul_hallandren',
      name: 'Hallandren',
      description: 'The jungle kingdom on Nalthis.',
      kind: 'location',
      cluster: 'nalthis',
      orbitLayer: ORBIT_LAYER.LOCATION,
      connections: [],
    },
    {
      id: 'soul_threnody_forest',
      name: 'The Forests of Threnody',
      description: 'The haunted woodlands of Threnody.',
      kind: 'location',
      cluster: 'threnody',
      orbitLayer: ORBIT_LAYER.LOCATION,
      connections: [],
    },
    {
      id: 'soul_patji',
      name: 'Patji',
      description: 'The island on First of the Sun, home of the Pantheon.',
      kind: 'location',
      cluster: 'first-of-the-sun',
      orbitLayer: ORBIT_LAYER.LOCATION,
      connections: [],
    },
    {
      id: 'soul_komashi_land',
      name: 'Komashi',
      description: 'The planet Komashi, home of the Yoki-Hijo.',
      kind: 'location',
      cluster: 'komashi',
      orbitLayer: ORBIT_LAYER.LOCATION,
      connections: [],
    },
    {
      id: 'soul_lumar_isles',
      name: 'The Lumar Isles',
      description: 'The spore-covered islands of Lumar.',
      kind: 'location',
      cluster: 'lumar',
      orbitLayer: ORBIT_LAYER.LOCATION,
      connections: [],
    },
    {
      id: 'soul_canticle_planet',
      name: 'Canticle',
      description: 'A runaway world, home to the Cinder King.',
      kind: 'location',
      cluster: 'canticle',
      orbitLayer: ORBIT_LAYER.LOCATION,
      connections: [],
    },
    {
      id: 'soul_yolen_place',
      name: 'Yolen',
      description: 'The original world of Adonalsium, now lost.',
      kind: 'location',
      cluster: 'yolen',
      orbitLayer: ORBIT_LAYER.LOCATION,
      connections: [],
    },
    {
      id: 'soul_silverlight',
      name: 'Silverlight',
      description: 'A city in the Cognitive Realm inhabited by scholars and worldhoppers.',
      kind: 'location',
      cluster: 'cosmere',
      orbitLayer: ORBIT_LAYER.LOCATION,
      connections: [],
    },
    {
      id: 'soul_oathgates',
      name: 'The Oathgates',
      description: 'Transportation network connecting Rosharan cities via Shadesmar.',
      kind: 'artifact',
      cluster: 'roshar',
      orbitLayer: ORBIT_LAYER.ARTIFACT,
      connections: [],
    },
    {
      id: 'soul_perpendicularities',
      name: 'Perpendicularities',
      description: 'Points where all three Realms converge.',
      kind: 'artifact',
      cluster: 'cosmere',
      orbitLayer: ORBIT_LAYER.ARTIFACT,
      connections: [],
    },
    {
      id: 'soul_nightblood',
      name: 'Nightblood',
      description: 'The sentient sword created by Vasher.',
      kind: 'artifact',
      cluster: 'nalthis',
      orbitLayer: ORBIT_LAYER.ARTIFACT,
      connections: ['soul_vasher', 'soul_szeth'],
    },
    {
      id: 'soul_dawnshards',
      name: 'Dawnshards',
      description: 'Primordial Commands from before the Shattering.',
      kind: 'adonalsium',
      cluster: 'cosmere',
      orbitLayer: ORBIT_LAYER.ARTIFACT,
      connections: [],
    },
    {
      id: 'soul_shardblades',
      name: 'Shardblades',
      description: 'Living weapons of the Knights Radiant.',
      kind: 'artifact',
      cluster: 'roshar',
      orbitLayer: ORBIT_LAYER.ARTIFACT,
      connections: [],
    },
    {
      id: 'soul_shardplate',
      name: 'Shardplate',
      description: 'Living armor of the Knights Radiant.',
      kind: 'artifact',
      cluster: 'roshar',
      orbitLayer: ORBIT_LAYER.ARTIFACT,
      connections: [],
    },
    {
      id: 'soul_spren',
      name: 'Spren',
      description: 'Cognitive entities on Roshar — living ideas.',
      kind: 'spren',
      cluster: 'roshar',
      orbitLayer: ORBIT_LAYER.SPREN,
      connections: [],
    },
    {
      id: 'soul_knights_radiant',
      name: 'Knights Radiant',
      description: 'Order of Invested warriors bonded to spren.',
      kind: 'organization',
      cluster: 'roshar',
      orbitLayer: ORBIT_LAYER.ORGANIZATION,
      connections: [],
    },
    {
      id: 'soul_ghostbloods',
      name: 'The Ghostbloods',
      description: 'A secret organization spanning worlds.',
      kind: 'organization',
      cluster: 'roshar',
      orbitLayer: ORBIT_LAYER.ORGANIZATION,
      connections: [],
    },
    {
      id: 'soul_kandra',
      name: 'The Kandra',
      description: 'Shapeshifting creatures of Scadrial.',
      kind: 'organization',
      cluster: 'scadrial',
      orbitLayer: ORBIT_LAYER.ORGANIZATION,
      connections: [],
    },
    {
      id: 'soul_set',
      name: 'The Set',
      description: 'A technological organization on Scadrial.',
      kind: 'organization',
      cluster: 'scadrial',
      orbitLayer: ORBIT_LAYER.ORGANIZATION,
      connections: [],
    },
    {
      id: 'soul_ironeyes',
      name: 'Marsh',
      description: 'Surviving Inquisitor, eyes of Ruin.',
      kind: 'important_character',
      cluster: 'scadrial',
      orbitLayer: ORBIT_LAYER.IMPORTANT_CHAR,
      connections: [],
    },
    {
      id: 'soul_demoux',
      name: 'Demoux',
      description: 'General of the Armies of the Final Empire.',
      kind: 'character',
      cluster: 'scadrial',
      orbitLayer: ORBIT_LAYER.CHAR,
      connections: [],
    },
    {
      id: 'soul_galladon',
      name: 'Galladon',
      description: 'A Dula from Sel, worldhopper.',
      kind: 'character',
      cluster: 'sel',
      orbitLayer: ORBIT_LAYER.CHAR,
      connections: [],
    },
    {
      id: 'soul_nazh',
      name: 'Nazh',
      description: 'A worldhopper mapmaker.',
      kind: 'character',
      cluster: 'cosmere',
      orbitLayer: ORBIT_LAYER.CHAR,
      connections: [],
    },
    {
      id: 'soul_shattering',
      name: 'The Shattering',
      description: 'The event that broke Adonalsium into sixteen Shards.',
      kind: 'event',
      cluster: 'yolen',
      orbitLayer: ORBIT_LAYER.EVENT,
      connections: [],
    },
    {
      id: 'soul_recreance',
      name: 'The Recreance',
      description: 'The mass abandonment of the Knights Radiant.',
      kind: 'event',
      cluster: 'roshar',
      orbitLayer: ORBIT_LAYER.EVENT,
      connections: [],
    },
    {
      id: 'soul_catacendre',
      name: 'The Catacendre',
      description: 'The final battle and remaking of Scadrial.',
      kind: 'event',
      cluster: 'scadrial',
      orbitLayer: ORBIT_LAYER.EVENT,
      connections: [],
    },
  ]
}

export function buildEntityCatalog(): SoulDef[] {
  const catalog: SoulDef[] = [
    ...planetCatalog(),
    ...shardCatalog(),
    ...honorbladeCatalog(),
    ...bookCatalog(),
    ...characterCatalog(),
    ...magicCatalog(),
    ...sagaCatalog(),
    ...extraCatalog(),
  ]

  const seen = new Set<string>()
  return catalog.filter((s) => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return true
  })
}

export function getEntityCatalogSize(): number {
  return buildEntityCatalog().length
}

export function weightForKind(kind: EntityKind): number {
  return ENTITY_VISUALS[kind]?.mass ?? 1
}
