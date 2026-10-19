/**
 * The runtime book list, generated from `content/books/`.
 *
 * This module used to *be* the data: twenty-two hand-written records in a
 * `.ts` file. It is now a typed view over `src/data/generated/books.json`,
 * which `scripts/generate-books.ts` emits from `content/books/` — the source,
 * schema-validated by `pnpm content:validate`.
 *
 * Everything imports from here and nothing changed: sixteen modules import
 * `BOOKS` and `getBookById`, and they keep working. Only the source of the
 * facts moved, which is the entire point.
 *
 * The one thing that did not survive is `emblem`: declared on the `Book` type,
 * set on every record, read by nothing. Verified by grep across `src/` first.
 */

import booksData from '@/data/generated/books.json'
import type { Book as BaseBook } from '@/types/book'

/**
 * `BaseBook` is what the type declares; the three archive fields and the cover
 * were only ever in the generated data, and the type did not know about them.
 * Now it does, and the type is the one place a screen can find out what a book
 * has.
 */
export interface Book extends BaseBook {
  /** Path relative to the site root, e.g. `images/covers/the_final_empire.webp`. */
  cover: string
  /** Accession number on the archive's first page, e.g. `SCR-001`. */
  volumeNumber: string
  classification: string
  archiveDescription: string
}

export const BOOKS: Book[] = booksData as Book[]

const BY_ID = new Map(BOOKS.map((b) => [b.id, b]))

export function getBookById(id: string): Book | undefined {
  return BY_ID.get(id)
}

/** Every book in a saga, in reading order. */
export function getBooksBySaga(sagaId: string): Book[] {
  return BOOKS.filter((b) => b.saga === sagaId).sort((a, b) => a.order - b.order)
}
