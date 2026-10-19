/**
 * The seven houses and their genealogies, generated from `content/families/`.
 *
 * ## A correction
 *
 * The previous block reported that `content/families/` held no genealogy — no
 * `parentIds`, no `spouseId`, no `characterId` — and that converting it would
 * have deleted the Bloodlines tree.
 *
 * That was a check looking for the *runtime* field names and finding none. The
 * data is there under different names: `parents`, `spouse` and `character`. A
 * check that looks for the names a consumer uses will always report a gap; only
 * one that looks at the values finds the truth. Nothing was lost, and the tree
 * is now generated rather than hand-maintained.
 */

import familiesData from '@/data/generated/families.json'
import type { FamilyDefinition } from '@/types/family'

export type { FamilyDefinition }

export const FAMILY_TREES: FamilyDefinition[] = familiesData as unknown as FamilyDefinition[]
