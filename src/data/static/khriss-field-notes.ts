/**
 * Khriss's field notes, generated from `content/field-notes/`.
 *
 * The Atlas reads this as `Record<planetId, FieldNoteData[]>`: the generator
 * groups by planet already, so this module only narrows the JSON types and
 * fills the optional layout fields. The old handwritten table was a second copy
 * of every note, and its positions had drifted from the source.
 */
import notesData from '@/data/generated/field-notes.json'

export type SketchKind =
  | 'moon'
  | 'ellipse'
  | 'meteor'
  | 'shard'
  | 'question-mark'
  | 'wind-arrow'
  | 'bird'
  | 'spore'
  | 'geometric'
  | 'sun-path'
  | 'allomantic'
  | 'highstorm'

export interface FieldNoteData {
  id: string
  text: string[]
  style?: 'khriss' | 'nazh'
  /** Position relative to the right page container (0–100%) */
  left: string
  top: string
  rotation?: string
  maxWidth?: string
  crossedOut?: boolean
  correction?: string
  sketch?: SketchKind
  sketchSize?: number
}

interface GeneratedNote {
  id: string
  planet: string
  text: string[]
  style?: 'khriss' | 'nazh'
  left: string
  top: string
  rotation?: string
  maxWidth?: string
  crossedOut?: boolean
  correction?: string | null
  sketch?: SketchKind | null
  sketchSize?: number | null
}

const generated = notesData as Record<string, GeneratedNote[]>

export const PLANET_NOTES: Record<string, FieldNoteData[]> = Object.fromEntries(
  Object.entries(generated).map(([planet, notes]) => [
    planet,
    notes.map((note) => ({
      id: note.id,
      text: note.text,
      ...(note.style ? { style: note.style } : {}),
      left: note.left,
      top: note.top,
      ...(note.rotation ? { rotation: note.rotation } : {}),
      ...(note.maxWidth ? { maxWidth: note.maxWidth } : {}),
      ...(note.crossedOut ? { crossedOut: note.crossedOut } : {}),
      ...(note.correction ? { correction: note.correction } : {}),
      ...(note.sketch ? { sketch: note.sketch } : {}),
      ...(note.sketchSize !== null && note.sketchSize !== undefined ? { sketchSize: note.sketchSize } : {}),
    })),
  ]),
)
