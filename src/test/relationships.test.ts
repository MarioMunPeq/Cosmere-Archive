/**
 * Relationship resolution tests — Block 0 of the codex merge.
 *
 * These assert the two things the old card got wrong, from the data rather than
 * from a browser: every person appears at most once in a record's list, and the
 * label describes the *other* person as seen by the record's subject. The
 * examples are the reported bugs (Adolin/Shallan, Vin/Elend) plus the harder
 * cases the old data hid: a reverse direction the table never states, a neutral
 * fallback, and a pair whose two rows carry different types.
 */

import { describe, expect, it } from 'vitest'
import ALL_CHARACTERS from '@/data/generated/characters.json'
import { CHARACTER_RELATIONSHIPS } from '@/data/static/static-data'
import { relationshipsFor, relationshipCounts, type RelationshipLink } from '@/utils/relationships'
import type { CharacterRelationship } from '@/types/relationships'

const CHARACTER_IDS = (ALL_CHARACTERS as { id: string }[]).map((c) => c.id)

function linkFor(characterId: string, otherId: string, table?: readonly CharacterRelationship[]): RelationshipLink {
  const link = relationshipsFor(characterId, table).find((l) => l.otherId === otherId)
  expect(link, `${characterId} -> ${otherId} is missing`).toBeDefined()
  return link!
}

function labels(characterId: string): string[] {
  return relationshipsFor(characterId).map((l) => l.label)
}

describe('relationshipsFor — one row per person', () => {
  it('Adolin lists Shallan once, as his wife', () => {
    const shallan = relationshipsFor('adolin').filter((l) => l.otherId === 'shallan')
    expect(shallan).toHaveLength(1)
    expect(shallan[0]).toEqual({ otherId: 'shallan', label: 'Wife', type: 'spouse' })
  })

  it('Shallan sees Adolin as her husband, not as herself', () => {
    expect(linkFor('shallan', 'adolin')).toEqual({ otherId: 'adolin', label: 'Husband', type: 'spouse' })
  })

  it('Vin sees Elend as her husband', () => {
    expect(linkFor('vin', 'elend')).toEqual({ otherId: 'elend', label: 'Husband', type: 'spouse' })
  })

  it('Elend sees Vin as his wife', () => {
    expect(linkFor('elend', 'vin')).toEqual({ otherId: 'vin', label: 'Wife', type: 'spouse' })
  })

  it('Navani and Dalinar are husband and wife from their own sides', () => {
    expect(linkFor('navani', 'dalinar').label).toBe('Husband')
    expect(linkFor('dalinar', 'navani').label).toBe('Wife')
  })

  it('no record lists the same person twice', () => {
    for (const id of CHARACTER_IDS) {
      const ids = relationshipsFor(id).map((l) => l.otherId)
      expect(new Set(ids).size, `${id} has duplicate relationships`).toBe(ids.length)
    }
  })

  it('no record lists itself', () => {
    for (const id of CHARACTER_IDS) {
      expect(
        relationshipsFor(id).some((l) => l.otherId === id),
        `${id} lists itself`,
      ).toBe(false)
    }
  })

  it('every link points at a character the archive knows', () => {
    const known = new Set(CHARACTER_IDS)
    for (const id of CHARACTER_IDS) {
      for (const link of relationshipsFor(id)) {
        expect(known.has(link.otherId), `${id} -> ${link.otherId}`).toBe(true)
      }
    }
  })

  it('every link has a non-empty label that is not a raw id', () => {
    for (const id of CHARACTER_IDS) {
      for (const link of relationshipsFor(id)) {
        expect(link.label.trim().length, `${id} -> ${link.otherId}`).toBeGreaterThan(0)
        expect(link.label, `${id} -> ${link.otherId}`).not.toBe(link.otherId)
      }
    }
  })
})

describe('relationshipsFor — perspective', () => {
  it('states the reverse direction when the table has a mirrored row', () => {
    expect(linkFor('vin', 'kelsier').label).toBe('Mentor')
    expect(linkFor('kelsier', 'vin').label).toBe('Student')
    expect(linkFor('kelsier', 'mare').label).toBe('Wife')
    expect(linkFor('mare', 'kelsier').label).toBe('Husband')
  })

  it('uses inverseLabel where the neutral type word would be false', () => {
    expect(linkFor('sarene', 'kiin').label).toBe('Uncle')
    expect(linkFor('kiin', 'sarene').label).toBe('Niece')
    expect(linkFor('hoid', 'kaladin').label).toBe('Student')
    expect(linkFor('spook', 'kelsier').label).toBe('Mentor')
    expect(linkFor('szeth', 'dalinar').label).toBe('Liege')
  })

  it('falls back to the neutral type word rather than inventing a role', () => {
    // Nobody wrote what Sazed is to Elend, or what Dalinar is to Hoid. "Ally"
    // is imprecise but true; "Husband" or "Advisor" would be a guess.
    expect(linkFor('elend', 'sazed').label).toBe('Ally')
    expect(linkFor('hoid', 'dalinar').label).toBe('Ally')
    expect(linkFor('hoid', 'kelsier').label).toBe('Rival')
    expect(linkFor('elend', 'sazed').label).not.toBe('Husband')
  })

  it('keeps the authored role when both rows describe the same person', () => {
    // The pair is stored twice with the same role word: both directions read
    // "Allies", and the duplicate must not produce a second row.
    expect(relationshipsFor('kelsier').filter((l) => l.otherId === 'sazed')).toHaveLength(1)
    expect(linkFor('kelsier', 'sazed').label).toBe('Allies')
    expect(linkFor('sazed', 'kelsier').label).toBe('Allies')
  })

  it('handles a pair whose two rows carry different machine types', () => {
    // Vasher/Nightblood is stored as `creator` one way and `creation` the
    // other. Each person still gets the right word.
    expect(linkFor('vasher', 'nightblood').label).toBe('Created by')
    expect(linkFor('nightblood', 'vasher').label).toBe('Awakener')
    expect(linkFor('szeth', 'nightblood').label).toBe('Sword')
    expect(linkFor('nightblood', 'szeth').label).toBe('Wielder')
  })
})

describe('relationshipsFor — coverage', () => {
  it('matches the measured coverage: 25 of 93 records are linked', () => {
    const linked = CHARACTER_IDS.filter((id) => relationshipsFor(id).length > 0)
    expect(linked).toHaveLength(25)
  })

  it('gives the most-connected records the counts the index prints', () => {
    const counts = relationshipCounts()
    expect(counts.get('kaladin')).toBe(6)
    expect(counts.get('kelsier')).toBe(5)
    expect(counts.get('dalinar')).toBe(5)
    expect(counts.get('vin')).toBe(4)
    expect(counts.get('hoid')).toBe(3)
    expect(counts.get('sazed')).toBe(3)
  })

  it('keeps the index count equal to the list length for every record', () => {
    const counts = relationshipCounts()
    for (const id of CHARACTER_IDS) {
      expect(counts.get(id) ?? 0, `${id} count vs list`).toBe(relationshipsFor(id).length)
    }
  })

  it('is symmetric: if A lists B, B lists A', () => {
    for (const id of CHARACTER_IDS) {
      for (const link of relationshipsFor(id)) {
        const back = relationshipsFor(link.otherId).some((l) => l.otherId === id)
        expect(back, `${id} -> ${link.otherId} has no return link`).toBe(true)
      }
    }
  })

  it('returns nothing for an id the archive does not have', () => {
    expect(relationshipsFor('nobody-at-all')).toEqual([])
  })
})

describe('relationshipsFor — synthetic tables', () => {
  const table: CharacterRelationship[] = [
    { characters: ['a', 'b'], type: 'spouse', label: 'Wife' },
    { characters: ['b', 'a'], type: 'spouse', label: 'Husband' },
    { characters: ['a', 'b'], type: 'spouse', label: 'Duplicate' },
    { characters: ['a', 'c'], type: 'mentor', label: 'Mentor', inverseLabel: 'Apprentice' },
    { characters: ['a', 'a'], type: 'ally', label: 'Self' },
    { characters: ['a', 'd'], type: 'ally' },
  ]

  it('dedupes a pair stated three times', () => {
    expect(relationshipsFor('a', table).filter((l) => l.otherId === 'b')).toHaveLength(1)
  })

  it('reads each side from the mirrored row', () => {
    expect(linkFor('a', 'b', table).label).toBe('Husband')
    expect(linkFor('b', 'a', table).label).toBe('Wife')
  })

  it('applies inverseLabel to the second character', () => {
    expect(linkFor('a', 'c', table).label).toBe('Apprentice')
    expect(linkFor('c', 'a', table).label).toBe('Mentor')
  })

  it('ignores a self-link', () => {
    expect(relationshipsFor('a', table).some((l) => l.otherId === 'a')).toBe(false)
  })

  it('uses the neutral type label when the only row has no label', () => {
    expect(linkFor('a', 'd', table).label).toBe('Ally')
    expect(linkFor('d', 'a', table).label).toBe('Ally')
  })

  it('counts a pair once regardless of how many rows describe it', () => {
    const counts = relationshipCounts(table)
    expect(counts.get('a')).toBe(3) // b, c, d — not the self-link
    expect(counts.get('b')).toBe(1)
  })
})

describe('the relationship table honours the label invariant', () => {
  it('keeps the authored rows in the table', () => {
    expect(CHARACTER_RELATIONSHIPS.length).toBe(40)
  })

  it('has no exact duplicate row', () => {
    const seen = new Set<string>()
    for (const rel of CHARACTER_RELATIONSHIPS) {
      const [a, b] = rel.characters
      const key = `${a}|${b}|${rel.type}`
      expect(seen.has(key), `duplicate ${a}/${b} (${rel.type})`).toBe(false)
      seen.add(key)
    }
  })
})

describe('record labels stay prose', () => {
  it('never prints a machine type where a word is expected', () => {
    for (const id of CHARACTER_IDS) {
      for (const label of labels(id)) {
        expect(label).not.toMatch(/^[a-z_]+$/)
      }
    }
  })
})
