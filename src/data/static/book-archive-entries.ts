/**
 * A book's archive entry.
 *
 * ## Why this file is nearly empty now
 *
 * It used to be 18.5 KB: twenty-two archive descriptions, volume numbers and
 * classifications, hardcoded. `content/books/*.json` had held all three fields
 * since the M1 migration, and `BookContent.ts` read *this* copy to build a
 * book's first page — so a synopsis could be edited in `content/` while the
 * archive entry kept describing the previous edition of the book, and nothing
 * compared them.
 *
 * Three copies of one fact, two of which were the ones being read.
 *
 * So the lookup is now over the generated book data, which is generated from
 * `content/books/`, and there is exactly one of everything.
 */

import { BOOKS } from './books'

export interface BookArchiveEntry {
  volumeNumber: string
  classification: string
  archiveDescription: string
}

/** The archive record for a book, or `undefined` if it has none. */
export function getBookArchiveEntry(bookId: string): BookArchiveEntry | undefined {
  const book = BOOKS.find((b) => b.id === bookId)
  if (!book) return undefined
  return {
    volumeNumber: book.volumeNumber,
    classification: book.classification,
    archiveDescription: book.archiveDescription,
  }
}
