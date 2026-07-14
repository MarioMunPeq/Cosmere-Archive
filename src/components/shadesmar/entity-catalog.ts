import type { EntityKind } from './types'
import { BOOKS } from '@/data/static/books'
import { PLANETS } from '@/data/static/planets'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import { HONORBLADES } from '@/data/static/aharietiam'
import { SAGAS } from '@/data/static/sagas'
import ALL_CHARACTERS from '@/data/generated/characters.json'
import { ENTITY_VISUALS } from './types'

export interface SoulDef {
  id: string
  name: string
  description: string
  kind: EntityKind
  planet: string | null
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
  'tenSoon',
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
  'aux',
  'sylphrena',
  'pattern',
])

const connSet = (arr: string[]): string[] => {
  const s = new Set(arr.map((c) => `soul_${c}`))
  return [...s]
}

function buildCharacterCatalog(): SoulDef[] {
  const out: SoulDef[] = []
  for (const ch of ALL_CHARACTERS) {
    if (!ch || !ch.id || !ch.name) continue
    const kind: EntityKind = IMPORTANT_CHAR_IDS.has(ch.id) ? 'important_character' : 'character'
    const planet = ch.planet ?? null
    const connections: string[] = []
    if (ch.requiredBooks) connections.push(...ch.requiredBooks)
    out.push({
      id: `soul_${ch.id}`,
      name: ch.name,
      description: ch.description ?? '',
      kind,
      planet,
      connections: connSet(connections),
    })
  }
  return out
}

function buildBookCatalog(): SoulDef[] {
  return BOOKS.map((b) => ({
    id: `soul_${b.id}`,
    name: b.title,
    description: b.description ?? '',
    kind: 'book' as EntityKind,
    planet: planetForSaga(b.saga),
    connections: connSet(b.saga ? [b.saga] : []),
  }))
}

function planetForSaga(saga: string): string | null {
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
  return map[saga] ?? null
}

function buildMagicCatalog(): SoulDef[] {
  return MAGIC_SYSTEMS.map((m) => ({
    id: `soul_${m.id}`,
    name: m.name,
    description: m.description ?? '',
    kind: 'magic' as EntityKind,
    planet: m.planetId ?? null,
    connections: connSet(m.bookIds ?? []),
  }))
}

function buildPlanetCatalog(): SoulDef[] {
  return PLANETS.map((p) => ({
    id: `soul_planet_${p.id}`,
    name: p.name,
    description: p.description ?? '',
    kind: 'planet' as EntityKind,
    planet: p.id,
    connections: connSet(p.books ?? []),
  }))
}

function buildHonorbladeCatalog(): SoulDef[] {
  const out: SoulDef[] = []
  for (const h of HONORBLADES) {
    out.push({
      id: `soul_${h.id}`,
      name: h.name,
      description: h.description ?? '',
      kind: 'herald' as EntityKind,
      planet: 'roshar',
      connections: connSet(h.connections ?? []),
    })
    out.push({
      id: `soul_honorblade_${h.id}`,
      name: `${h.name}'s Honorblade`,
      description: `The Honorblade of ${h.name}, ${h.title}.`,
      kind: 'honorblade' as EntityKind,
      planet: 'roshar',
      connections: connSet(h.connections ?? []),
    })
  }
  return out
}

function buildSagaCatalog(): SoulDef[] {
  return SAGAS.map((s) => ({
    id: `soul_saga_${s.id}`,
    name: s.name,
    description: s.description ?? '',
    kind: 'saga' as EntityKind,
    planet: planetForSaga(s.id),
    connections: [],
  }))
}

function buildShardCatalog(): SoulDef[] {
  const shards = new Map<string, string[]>()
  for (const p of PLANETS) {
    if (!p.shard) continue
    const names = p.shard
      .split(/[&,]/)
      .map((s) => s.trim())
      .filter(Boolean)
    for (const n of names) {
      if (!shards.has(n)) shards.set(n, [])
      shards.get(n)!.push(`soul_planet_${p.id}`)
    }
  }
  shards.set('Adonalsium', ['soul_planet_yolen'])

  const knownShards: [string, string][] = [
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

  return knownShards.map(([name, planet]) => ({
    id: `soul_shard_${name.toLowerCase()}`,
    name: name,
    description: `The Shard of ${name}.`,
    kind: name === 'Adonalsium' ? ('adonalsium' as EntityKind) : ('shard' as EntityKind),
    planet,
    connections: connSet(shards.get(name) ?? []),
  }))
}

function buildLocationCatalog(): SoulDef[] {
  const extraLocs: SoulDef[] = [
    {
      id: 'soul_cognitive_realm',
      name: 'Shadesmar',
      description: 'The Cognitive Realm — an endless ocean of glass beads connecting all worlds.',
      kind: 'location',
      planet: 'cosmere',
      connections: [],
    },
    {
      id: 'soul_spiritual_realm',
      name: 'The Spiritual Realm',
      description: 'The realm of Connection, Identity, and Investiture.',
      kind: 'location',
      planet: 'cosmere',
      connections: [],
    },
    {
      id: 'soul_physical_realm',
      name: 'The Physical Realm',
      description: 'The realm of matter and energy.',
      kind: 'location',
      planet: 'cosmere',
      connections: [],
    },
    {
      id: 'soul_beyond',
      name: 'The Beyond',
      description: 'What lies after death — unknown and unknowable.',
      kind: 'concept',
      planet: 'cosmere',
      connections: [],
    },
    {
      id: 'soul_elantris_city',
      name: 'Elantris',
      description: 'The fallen city of the Aonic people of Arelon, Sel.',
      kind: 'location',
      planet: 'sel',
      connections: [],
    },
    {
      id: 'soul_kholinar',
      name: 'Kholinar',
      description: 'The capital of Alethkar on Roshar.',
      kind: 'location',
      planet: 'roshar',
      connections: [],
    },
    {
      id: 'soul_urithiru',
      name: 'Urithiru',
      description: 'The ancient tower-city of the Knights Radiant.',
      kind: 'location',
      planet: 'roshar',
      connections: [],
    },
    {
      id: 'soul_luthadel',
      name: 'Luthadel',
      description: 'The capital of the Final Empire on Scadrial.',
      kind: 'location',
      planet: 'scadrial',
      connections: [],
    },
    {
      id: 'soul_elendel',
      name: 'Elendel',
      description: 'The great city of the Basin on Scadrial.',
      kind: 'location',
      planet: 'scadrial',
      connections: [],
    },
    {
      id: 'soul_taldain_cities',
      name: 'Dayside Cities',
      description: 'The cities of the Dayside of Taldain.',
      kind: 'location',
      planet: 'taldain',
      connections: [],
    },
    {
      id: 'soul_hallandren',
      name: 'Hallandren',
      description: 'The jungle kingdom on Nalthis.',
      kind: 'location',
      planet: 'nalthis',
      connections: [],
    },
    {
      id: 'soul_threnody_forest',
      name: 'The Forests of Threnody',
      description: 'The haunted woodlands of Threnody.',
      kind: 'location',
      planet: 'threnody',
      connections: [],
    },
    {
      id: 'soul_patji_island',
      name: 'Patji',
      description: 'The island on First of the Sun, home of the Pantheon.',
      kind: 'location',
      planet: 'first-of-the-sun',
      connections: [],
    },
    {
      id: 'soul_komashi_land',
      name: 'Komashi',
      description: 'The planet Komashi, home of the Yoki-Hijo.',
      kind: 'location',
      planet: 'komashi',
      connections: [],
    },
    {
      id: 'soul_lumar_isles',
      name: 'The Lumar Isles',
      description: 'The spore-covered islands of Lumar.',
      kind: 'location',
      planet: 'lumar',
      connections: [],
    },
    {
      id: 'soul_canticle',
      name: 'Canticle',
      description: 'The planet Canticle, a runaway world.',
      kind: 'location',
      planet: 'canticle',
      connections: [],
    },
    {
      id: 'soul_yolen_place',
      name: 'Yolen',
      description: 'The original world of Adonalsium, now lost.',
      kind: 'location',
      planet: 'yolen',
      connections: [],
    },
    {
      id: 'soul_silverlight',
      name: 'Silverlight',
      description: 'A city in the Cognitive Realm inhabited by scholars and worldhoppers.',
      kind: 'location',
      planet: 'cosmere',
      connections: [],
    },
    {
      id: 'soul_oathgates',
      name: 'The Oathgates',
      description: 'Transportation network connecting Rosharan cities via Shadesmar.',
      kind: 'artifact',
      planet: 'roshar',
      connections: [],
    },
    {
      id: 'soul_perpendicularities',
      name: 'The Perpendicularities',
      description: 'Points where all three Realms converge.',
      kind: 'artifact',
      planet: 'cosmere',
      connections: [],
    },
    {
      id: 'soul_nightblood',
      name: 'Nightblood',
      description: 'The sentient sword created by Vasher and Shashara.',
      kind: 'artifact',
      planet: 'nalthis',
      connections: ['soul_vasher', 'soul_szeth'],
    },
    {
      id: 'soul_dawnshards',
      name: 'Dawnshards',
      description: 'Primordial Commands from before the Shattering of Adonalsium.',
      kind: 'adonalsium',
      planet: 'cosmere',
      connections: [],
    },
    {
      id: 'soul_shardblades',
      name: 'Shardblades',
      description: 'Living weapons of the Knights Radiant — spren in blade form.',
      kind: 'artifact',
      planet: 'roshar',
      connections: [],
    },
    {
      id: 'soul_shardplate',
      name: 'Shardplate',
      description: 'Living armor of the Knights Radiant.',
      kind: 'artifact',
      planet: 'roshar',
      connections: [],
    },
  ]
  return extraLocs
}

export function buildEntityCatalog(): SoulDef[] {
  const catalog: SoulDef[] = [
    ...buildCharacterCatalog(),
    ...buildBookCatalog(),
    ...buildMagicCatalog(),
    ...buildPlanetCatalog(),
    ...buildHonorbladeCatalog(),
    ...buildSagaCatalog(),
    ...buildShardCatalog(),
    ...buildLocationCatalog(),
  ]

  const seen = new Set<string>()
  return catalog.filter((s) => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return true
  })
}

export function getFillerCount(): number {
  const real = buildEntityCatalog().length
  return Math.max(0, 1500 - real)
}

export function weightForKind(kind: EntityKind): number {
  return ENTITY_VISUALS[kind]?.mass ?? 1
}
