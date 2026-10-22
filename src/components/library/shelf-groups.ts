/**
 * Which books stand on which shelf. M3.
 *
 * The natural grouping is the saga, which gives ten shelves for twenty-two
 * books: the widest held four volumes and four shelves held one, so the cabinet
 * read as a wall with a few books scattered on it. A shelf is a piece of
 * furniture, and furniture needs a reason to be there.
 *
 * Three shelves instead, in the order the shelf is actually read:
 *
 *   Stormlight     The Way of Kings through Wind and Truth. The flagship series,
 *                  and the one a visitor comes for.
 *   Mistborn       Era One and Era Two on the same shelf, in reading order. They
 *                  are one story told in seven volumes; splitting them across two
 *                  boards interrupted it for no gain.
 *   Elsewhere      everything else — White Sand, the Secret Projects, Elantris,
 *                  Warbreaker and Arcanum Unbounded
 *
 * Ordering inside a shelf is `order` within each saga, sagas in the sequence
 * below, so the shelf always reads front to back.
 */

import { BOOKS } from '@/data/static'
import type { Book } from '@/data/static/books'

export interface ShelfGroup {
  id: string
  /** Engraved on the side column. */
  label: string
  /** One line under the label, on wide screens. */
  note: string
  sagas: string[]
}

/** Display order, which is also reading order. */
export const SHELF_GROUPS: ShelfGroup[] = [
  {
    id: 'stormlight',
    label: 'The Stormlight Archive',
    note: 'Roshar',
    sagas: ['stormlight'],
  },
  {
    id: 'mistborn',
    label: 'Mistborn',
    note: 'The Final Empire',
    sagas: ['mistborn-era-1', 'mistborn-era-2'],
  },
  {
    id: 'elsewhere',
    label: 'Elsewhere',
    note: 'And the rest',
    sagas: ['white-sand', 'secret-projects', 'elantris', 'warbreaker', 'arcanum-unbounded'],
  },
]

/** Volumes for one group, in reading order. */
export function booksForGroup(group: ShelfGroup): Book[] {
  return group.sagas.flatMap((saga) => BOOKS.filter((b) => b.saga === saga).sort((a, b) => a.order - b.order))
}

/** Every volume that belongs on a shelf, in shelf order. */
export function shelvedBooks(): Book[] {
  return SHELF_GROUPS.flatMap(booksForGroup)
}
