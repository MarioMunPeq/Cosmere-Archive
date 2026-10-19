export interface CosmicEra {
  id: string
  name: string
  startYear: number
  endYear: number
  color: string
  description: string
}

import erasData from '@/data/generated/eras.json'

/**
 * The eleven cosmic eras, generated from content/eras/.
 *
 * Identical values in both layers before this: same eleven, same years,
 * same colours. The only difference was the field name — summary in
 * content/, description here — and the generator owns that translation.
 */
export const ERAS: CosmicEra[] = erasData as CosmicEra[]
