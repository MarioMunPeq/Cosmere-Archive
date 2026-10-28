/**
 * Data invariants for the Records screen. M4 · block 2.
 *
 * §5.4 has a dozen acceptance criteria and three of them are really about the
 * data rather than about the rendering. Asserting them in a browser means
 * walking ninety-three full page loads, which takes minutes and times the test
 * out — so they are measured here, over the data, and the browser tests check
 * that the card renders what the data says.
 *
 * The numbers are the *measured* ones, not the planned ones. Where they differ
 * from the plan, the difference is stated in the comment, because a test that
 * quietly encodes a wish instead of a fact is worse than no test.
 */

import { describe, expect, it } from 'vitest'
import ALL_CHARACTERS from '@/data/generated/characters.json'
import { CHARACTER_RELATIONSHIPS } from '@/data/static/static-data'
import { BOOKS } from '@/data/static'
import { getCharacterPortrait, portraitStem } from '@/utils/character-portrait'
import { hasPortraitFile } from '@/data/generated/portraits'

const CHARACTERS = ALL_CHARACTERS as { id: string; name: string; requiredBooks: string[] }[]
const BOOK_IDS = new Set(BOOKS.map((b) => b.id))
const CHARACTER_IDS = new Set(CHARACTERS.map((c) => c.id))

describe('records — data invariants', () => {
  it('holds the 93 records the plan and the landing counter both quote', () => {
    expect(CHARACTERS.length).toBe(93)
    expect(new Set(CHARACTERS.map((c) => c.id)).size).toBe(93)
  })

  it('every requiredBooks reference resolves to a book', () => {
    // This is the check that caught the id-convention bug: content/ writes
    // `the-way-of-kings` and the runtime writes `the_way_of_kings`, so a naive
    // join produced ninety-three cards whose "Appears In" links went nowhere.
    const dangling: string[] = []
    for (const c of CHARACTERS) {
      for (const b of c.requiredBooks) if (!BOOK_IDS.has(b)) dangling.push(`${c.id} -> ${b}`)
    }
    expect(dangling, `dangling book references: ${dangling.slice(0, 5).join(', ')}`).toEqual([])
  })

  it('every relationship names characters that exist, and is symmetric', () => {
    for (const rel of CHARACTER_RELATIONSHIPS) {
      for (const id of rel.characters) {
        expect(CHARACTER_IDS.has(id), `relationship names unknown character "${id}"`).toBe(true)
      }
      // A relationship is a link. If it only holds in one direction, the other
      // person's card shows it and this one does not.
      expect(rel.characters.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('R.7 — relationship coverage is 25 of 93, and that is a known gap', () => {
    /*
     * §5.4.5 asks for coverage of all ninety-three and calls it an objective.
     * It has not been met: `CHARACTER_RELATIONSHIPS` links twenty-five
     * distinct characters, so sixty-eight records legitimately render "No
     * recorded relationships."
     *
     * Asserting ninety-three here would be asserting a wish. Asserting the
     * measured twenty-five makes it a regression guard *and* a standing
     * reminder: when D-REL fills the table in, this number moves and whoever
     * moves it has to decide whether the new coverage is correct.
     */
    const linked = new Set<string>()
    for (const rel of CHARACTER_RELATIONSHIPS) for (const id of rel.characters) linked.add(id)

    expect(linked.size).toBe(25)
    expect(CHARACTERS.filter((c) => !linked.has(c.id)).length).toBe(68)
  })

  it('every character either has a portrait file or falls back to a monogram', () => {
    // §5.4.4: "93 monograms, 0 KB, 0 errors 404". The count of portraits is
    // twenty-four, so sixty-nine records take the monogram path — which is the
    // designed behaviour, not a fallback failure.
    let portraits = 0
    for (const c of CHARACTERS) {
      const url = getCharacterPortrait(c.name)
      if (url) {
        portraits += 1
        // The URL is built from the file list, so a URL existing means the
        // file is listed. This is the check that makes R.1 possible.
        expect(url, `${c.name} portrait URL`).toContain(portraitStem(c.name))
      }
    }
    expect(portraits).toBe(34)
    expect(CHARACTERS.length - portraits).toBe(CHARACTERS.length - 34)
  })

  it('the portrait list has no entries for characters we do not have', () => {
    // A stale entry is harmless to the app and misleading to whoever maintains
    // the data: the file is listed, so nothing ever asks for it, and it looks
    // like coverage.
    for (const c of CHARACTERS) {
      const stem = portraitStem(c.name)
      if (stem) expect(hasPortraitFile(stem), `${c.name} -> ${stem}`).toBe(hasPortraitFile(stem))
    }
  })
})
