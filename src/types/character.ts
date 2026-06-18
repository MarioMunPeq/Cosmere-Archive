// Character: represents a character in the Cosmere.
// The "requiredBooks" field is the core of our anti-spoiler system:
// if the user hasn't read those books, the character's info stays hidden.

export interface Character {
  /** Unique identifier, e.g. "kaladin". */
  id: string

  /** Character's display name. */
  name: string

  /** A brief description (no spoilers beyond the required books). */
  description: string

  /** Home planet, e.g. "Roshar". */
  planet: string

  /** Optional URL to a portrait image. */
  image?: string

  /**
   * Books the user MUST have read before seeing this character.
   * If empty, the character is visible to everyone (no spoiler risk).
   */
  requiredBooks: string[]
}
