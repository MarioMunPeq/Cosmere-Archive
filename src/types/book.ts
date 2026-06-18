// Book: represents a single Cosmere book.
// Each field is commented so you know exactly what it's for.

export interface Book {
  /** Unique identifier, e.g. "the_final_empire". Used in URLs and lookups. */
  id: string

  /** Display title, e.g. "The Final Empire" (or Spanish title if preferred). */
  title: string

  /** Which saga this book belongs to, e.g. "Mistborn Era 1", "Stormlight Archive". */
  saga: string

  /** Position within the saga (1 = first book, 2 = second, etc.). */
  order: number

  /** Optional: URL or path to the book cover image. */
  cover?: string

  /** In-universe year (approximate), useful for timeline features later. */
  year?: number

  /** Short description of the book. */
  description?: string
}
