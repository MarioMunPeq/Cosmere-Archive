/**
 * The ten Heralds, generated from `content/heroes/`.
 *
 * `generated/heroes.json` is the only copy of the blade data. This module is a
 * typed view over it, not a second table: the old handwritten array had already
 * drifted from the content collection by an asset path that pointed at a
 * directory the site never shipped.
 */
import heroesData from '@/data/generated/heroes.json'
import type { HonorbladeData } from '@/types/aharietiam'

interface GeneratedHero {
  id: string
  name: string
  title: string
  order: string
  pronunciation: string | null
  description: string
  surges: string[]
  attributes: string[]
  essence: string
  soulcasting: string
  honorbladeGrants: string
  quote: string
  books: string[]
  status: 'fallen' | 'standing' | 'missing'
  connections: string[]
  positionIndex: number
  color: string
}

export const HONORBLADES: HonorbladeData[] = (heroesData as GeneratedHero[])
  .slice()
  .sort((a, b) => a.positionIndex - b.positionIndex)
  .map((hero) => ({
    id: hero.id,
    name: hero.name,
    title: hero.title,
    order: hero.order,
    surges: [hero.surges[0]!, hero.surges[1]!],
    attributes: hero.attributes,
    essence: hero.essence,
    soulcasting: hero.soulcasting,
    honorbladeGrants: hero.honorbladeGrants,
    quote: hero.quote,
    description: hero.description,
    books: hero.books,
    status: hero.status,
    connections: hero.connections,
    positionIndex: hero.positionIndex,
    color: hero.color,
    ...(hero.pronunciation ? { pronunciation: hero.pronunciation } : {}),
  }))
