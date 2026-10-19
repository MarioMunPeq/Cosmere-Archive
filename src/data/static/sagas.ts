/**
 * The nine series, generated from `content/series/`.
 *
 * ## The colour
 *
 * This file used to carry a `color` holding a **Tailwind palette name** -
 * `'gray'`, `'red'`, `'amber'` - and nothing read it. The colours the site
 * actually paints with live in two hex maps in `static-data.ts`, keyed by saga
 * id, and `content/series/` holds a third set as hex.
 *
 * Three representations of one fact, and the one on this interface was dead.
 * It is gone rather than generated: emitting it would have carried a field
 * nobody reads into a file whose whole purpose is to stop fields nobody reads
 * from existing.
 *
 * The hex in `content/series/` is the one that survives, because it is the one
 * in the source. `SAGA_BG` and `SAGA_NAME_COLORS` are a separate problem and a
 * separate block.
 */

import seriesData from '@/data/generated/series.json'

export interface Saga {
  id: string
  name: string
  order: number
  description?: string
  /** Hex, from `content/series/`. */
  color: string
}

export const SAGAS: Saga[] = seriesData as Saga[]
