/**
 * Portrait resolution — decision D-DATA.
 *
 * Before this, the resolver built a URL from the display name and let the
 * browser discover at runtime that most of them did not exist, falling back to
 * `placeholder.webp`, which did not exist either. That produced a broken image
 * for 61 of the 85 characters.
 *
 * The list of portraits that actually exist is generated into
 * `src/data/generated/portraits.ts` by `pnpm content:migrate`, so this module
 * can answer without touching the network: a name either has a portrait or it
 * returns null and the caller draws a <Monogram>.
 */

import { hasPortraitFile } from '@/data/generated/portraits'

const BASE = `${import.meta.env.BASE_URL}characters/`

/** Titles are not part of the filename: "King Dalinar" is stored as Dalinar.webp. */
const FIRST_WORD = /^(?:King|Queen|Lord|Lady|Prince|Princess|Highprince|Highprincess|Sir|Dame)\s+/i

/** The filename stem a character name maps to, e.g. "Roshi" -> "Roshi". */
export function portraitStem(name: string): string {
  if (!name) return ''
  const stripped = name.replace(FIRST_WORD, '')
  const firstWord = stripped.split(' ')[0] ?? stripped
  const clean = firstWord.replace(/['']/g, '').replace(/[^a-zA-Z0-9]/g, '')
  if (!clean) return ''
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase()
}

/**
 * The portrait URL for a character, or null when none exists.
 * Callers must handle null; see `getCharacterPortraitFallback`.
 */
export function getCharacterPortrait(name: string): string | null {
  const stem = portraitStem(name)
  if (!stem || !hasPortraitFile(stem)) return null
  return `${BASE}${stem}.webp`
}

/**
 * Retained for callers that need a secondary attempt. There is only ever one
 * candidate extension on disk (webp), so this returns null and the caller
 * should switch to the Monogram instead of retrying.
 */
export function getCharacterPortraitFallback(name: string): string | null {
  void name
  return null
}

/** True when the character has a portrait on disk. */
export function hasCharacterPortrait(name: string): boolean {
  const stem = portraitStem(name)
  return stem !== '' && hasPortraitFile(stem)
}
