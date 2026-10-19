/**
 * Births, deaths and where they happened — generated from `content/characters/`.
 *
 * ## The fourth copy
 *
 * This file held a hand-maintained list of forty-six people with their birth
 * and death years, their planet, a colour and a group. `content/characters/`
 * has had `born`, `died` and `origin` since the first migration, and
 * `generate-characters.ts` has emitted them since the first block of Fase A.
 *
 * Two things made this file look like more than a copy, and both are now
 * computed instead of maintained:
 *
 *   `planet` was a display name (`"Roshar"`) where the source holds an id
 *   (`"roshar"`). It is now an id, with `planetName` beside it — so the Atlas
 *   can join and the name cannot drift from the world record.
 *   `color` and `group` were a second answer to "what colour is Roshar" and
 *   "who is Scadrian", now read off the planet record and a single mapping.
 */

import spansData from '@/data/generated/character-spans.json'

export interface CharacterSpan {
  id: string
  name: string
  /** A world **id**, not a display name. */
  planet: string
  planetName: string
  color: string
  birthYear: number | null
  deathYear: number | null
  isAlive: boolean
  group: 'radiant' | 'scadrian' | 'elantrian' | 'nalthian' | 'taldaini' | 'other'
  titles: string[]
}

export const CHARACTER_SPANS: CharacterSpan[] = spansData as CharacterSpan[]

/**
 * The six group labels, with their colours.
 *
 * These are the planet colours read by hand. `generate-worlds.ts` derives
 * `CharacterSpan.group` from the same mapping and now owns it; this list exists
 * so the label and its colour have one home rather than a name in one file and a
 * hex in another.
 */
export const CHARACTER_GROUPS: { id: CharacterSpan['group']; label: string; color: string }[] = [
  { id: 'radiant', label: 'Roshar — Radiants', color: '#06b6d4' },
  { id: 'scadrian', label: 'Scadrial — Mistborn', color: '#ef4444' },
  { id: 'elantrian', label: 'Sel — Elantrians', color: '#14b8a6' },
  { id: 'nalthian', label: 'Nalthis — Awakeners', color: '#f472b6' },
  { id: 'taldaini', label: 'Taldain — Sand Masters', color: '#eab308' },
  { id: 'other', label: 'Other Worlds', color: '#8b5cf6' },
]
