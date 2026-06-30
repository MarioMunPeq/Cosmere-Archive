export { SAGAS } from './sagas'
export type { Saga } from './sagas'
export { BOOKS, getBookById } from './books'

import { getBookById } from './books'

import { SAGAS } from './sagas'
import type { Saga } from './sagas'
export const SAGA_BY_ID: Map<string, Saga> = new Map(SAGAS.map((s) => [s.id, s]))

import { PLANETS } from './planets'
import type { Planet } from '@/types/planet'
export { PLANETS }
export const PLANET_BY_ID: Map<string, Planet> = new Map(PLANETS.map((p) => [p.id, p]))
export function getPlanetById(id: string): Planet | undefined {
  return PLANET_BY_ID.get(id)
}

import charactersData from '@/data/generated/characters.json'
import { validateCharacterArray } from '@/utils/validate'
import type { Character } from '@/types'
export const ALL_CHARACTERS: Character[] = validateCharacterArray(charactersData)

export {
  CHARACTER_RELATIONSHIPS,
  SHORTCUTS,
  FALLBACK_COLOR,
  SHARD_COLORS,
  SAGA_BG,
  SAGA_NAME_COLORS,
  hexToRgb,
  READING_ORDER,
  READING_ORDER_KEY,
  TAILWIND_TO_HEX,
  EVENT_TYPE_BADGE_COLORS,
  TYPE_LABELS,
} from './static-data'
export type { Shortcut } from './static-data'

export function getCharacterSagas(requiredBooks: string[]): string[] {
  const sagaIds = new Set<string>()
  for (const bookId of requiredBooks) {
    const book = getBookById(bookId)
    if (book) sagaIds.add(book.saga)
  }
  return Array.from(sagaIds)
}
