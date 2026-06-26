export { SAGAS } from './sagas'
export type { Saga } from './sagas'
export { BOOKS, getBookById } from './books'

import { SAGAS } from './sagas'
import type { Saga } from './sagas'
export const SAGA_BY_ID: Map<string, Saga> = new Map(SAGAS.map((s) => [s.id, s]))

import { PLANETS } from './planets'
import type { Planet } from '@/types/planet'
export { PLANETS }
export type { Planet }
export const PLANET_BY_ID: Map<string, Planet> = new Map(PLANETS.map((p) => [p.id, p]))
export function getPlanetById(id: string): Planet | undefined {
  return PLANET_BY_ID.get(id)
}

import charactersData from '@/data/generated/characters.json'
import { validateCharacterArray } from '@/data/generated/validate'
import type { Character } from '@/types'
export const ALL_CHARACTERS: Character[] = validateCharacterArray(charactersData)

export { CHARACTER_RELATIONSHIPS } from './character-relationships'
