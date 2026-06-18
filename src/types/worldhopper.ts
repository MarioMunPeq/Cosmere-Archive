// Worldhopper: a special type of character who travels between Cosmere worlds.
// They are tracked separately so we can show a "map of travels" later.

export interface Worldhopper {
  /** Unique identifier (usually matches a character id). */
  id: string

  /** Display name. */
  name: string

  /** List of Cosmere planets this character has visited. */
  visitedWorlds: string[]

  /**
   * Books required to unlock this worldhopper's info.
   * Worldhopper appearances often span multiple books/series,
   * so this is particularly important for spoiler control.
   */
  requiredBooks: string[]
}
