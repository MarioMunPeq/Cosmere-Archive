// Character: represents a character in the Cosmere.
// The "requiredBooks" field is the core of our anti-spoiler system:
// if the user hasn't read those books, the character's info stays hidden.
//
// M4: the fields below `requiredBooks` were already authored and
// schema-validated in content/characters/*.json, where nothing imported them.
// They arrived here when `scripts/generate-characters.ts` made `content/` the
// source for this file. See §5.4.3, which asks for BORN, STATUS and ALSO IN.

export interface Character {
  /** Unique identifier, e.g. "kaladin". */
  id: string

  /** Character's display name. */
  name: string

  /** A brief description (no spoilers beyond the required books). */
  description: string

  /** Home planet, e.g. "Roshar". The `origin` field of the content record. */
  planet: string

  /** Year of birth in the world's calendar, or null when unrecorded. */
  born?: number | null

  /** Year of death, or null while living. */
  died?: number | null

  /** "living" | "deceased" | "unknown". */
  status?: string

  /** Groups the character belongs to, for ALSO IN. */
  groups?: string[]

  /** Titles held, for the epithet under the name. */
  titles?: string[]

  /** Portrait path relative to public/, or null when there is none. */
  portrait?: string | null

  /** Optional phonetic pronunciation guide. */
  pronunciation?: string

  /** Optional URL to a portrait image. Legacy; superseded by `portrait`. */
  image?: string

  /**
   * Books the user MUST have read before seeing this character.
   * If empty, the character is visible to everyone (no spoiler risk).
   */
  requiredBooks: string[]

  /**
   * Where the record is unlocked from, when that differs from
   * `requiredBooks`. Only written when it differs, so the common case is free.
   */
  spoilers?: string[]
}
