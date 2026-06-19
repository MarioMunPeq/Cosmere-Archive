export { SAGAS } from './sagas'
export type { Saga } from './sagas'
export { PLANETS } from './planets'
export type { Planet } from '@/types/planet'
export { BOOKS, getBookById } from './books'

import { SAGAS } from './sagas'
import type { Saga } from './sagas'
export const SAGA_BY_ID: Map<string, Saga> = new Map(SAGAS.map(s => [s.id, s]))

import charactersData from '@/data/generated/characters.json'
import { validateCharacterArray } from '@/data/generated/validate'
import type { Character } from '@/types'
export const ALL_CHARACTERS: Character[] = validateCharacterArray(charactersData)
