import { describe, it, expect } from 'vitest'
import { validateCharacterArray } from '@/utils/validate'
import { PLANETS } from '@/data/static/planets'

describe('validateCharacterArray', () => {
  it('returns empty array for non-array input', () => {
    expect(validateCharacterArray(null)).toEqual([])
    expect(validateCharacterArray(undefined)).toEqual([])
    expect(validateCharacterArray(42)).toEqual([])
    expect(validateCharacterArray('string')).toEqual([])
  })

  it('filters out invalid entries', () => {
    const data = [
      { id: 'valid', name: 'Valid', planet: 'Roshar', description: 'A character' },
      { id: 'missing-name', planet: 'Roshar', description: 'No name' },
      { name: 'No ID', planet: 'Scadrial', description: 'Missing id' },
      null,
      42,
    ]

    const result = validateCharacterArray(data)
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('valid')
  })

  it('passes through valid entries', () => {
    const data = [
      {
        id: 'kaladin',
        name: 'Kaladin',
        planet: 'Roshar',
        description: 'Windrunner',
        image: '/img.jpg',
        requiredBooks: ['book1'],
      },
      { id: 'vin', name: 'Vin', planet: 'Scadrial', description: 'Mistborn', requiredBooks: [] },
    ]

    const result = validateCharacterArray(data)
    expect(result).toHaveLength(2)
    expect(result[0]!.id).toBe('kaladin')
    expect(result[0]!.image).toBe('/img.jpg')
    expect(result[0]!.requiredBooks).toEqual(['book1'])
  })

  it('filters entries missing planet field', () => {
    const data = [{ id: 'no-planet', name: 'No Planet', description: 'Missing planet' }]
    expect(validateCharacterArray(data)).toHaveLength(0)
  })

  it('filters entries missing description field', () => {
    const data = [{ id: 'no-desc', name: 'No Desc', planet: 'Roshar' }]
    expect(validateCharacterArray(data)).toHaveLength(0)
  })

  it('handles non-array requiredBooks as empty array', () => {
    const data = [{ id: 'a', name: 'A', planet: 'Roshar', description: 'Desc', requiredBooks: 'not-array' }]
    const result = validateCharacterArray(data)
    expect(result).toHaveLength(1)
    expect(result[0]!.requiredBooks).toEqual([])
  })

  it('filters non-string elements from requiredBooks', () => {
    const data = [{ id: 'a', name: 'A', planet: 'Roshar', description: 'Desc', requiredBooks: ['book1', 42, null] }]
    const result = validateCharacterArray(data)
    expect(result).toHaveLength(1)
    expect(result[0]!.requiredBooks).toEqual(['book1'])
  })

  it('removes image when it is not a string', () => {
    const data = [{ id: 'a', name: 'A', planet: 'Roshar', description: 'Desc', image: 123 }]
    const result = validateCharacterArray(data)
    expect(result[0]!.image).toBeUndefined()
  })

  it('does not deduplicate duplicate IDs', () => {
    const data = [
      { id: 'dup', name: 'First', planet: 'Roshar', description: 'Desc' },
      { id: 'dup', name: 'Second', planet: 'Scadrial', description: 'Desc' },
    ]
    const result = validateCharacterArray(data)
    expect(result).toHaveLength(2)
  })

  it('handles empty array', () => {
    expect(validateCharacterArray([])).toEqual([])
  })

  it('handles characters.json data', async () => {
    const data = await import('@/data/generated/characters.json')
    const result = validateCharacterArray(data.default ?? data)
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((c) => c.id && c.name && c.planet)).toBe(true)
  })
})

describe('investiture data integrity', () => {
  it('all planets with investiture have non-empty name', () => {
    for (const planet of PLANETS) {
      if (!planet.investiture) continue
      for (const sys of planet.investiture) {
        expect(sys.name).toBeTruthy()
      }
    }
  })

  it('all planets with investiture have non-empty description', () => {
    for (const planet of PLANETS) {
      if (!planet.investiture) continue
      for (const sys of planet.investiture) {
        expect(sys.description).toBeTruthy()
      }
    }
  })

  it('every planet has at least one investiture entry', () => {
    for (const planet of PLANETS) {
      expect(planet.investiture?.length, `planet "${planet.id}" has no investiture`).toBeGreaterThanOrEqual(1)
    }
  })

  it('no investiture name contains HTML or script tags', () => {
    for (const planet of PLANETS) {
      if (!planet.investiture) continue
      for (const sys of planet.investiture) {
        expect(sys.name).not.toMatch(/<[^>]*>/)
        expect(sys.description).not.toMatch(/<[^>]*>/)
      }
    }
  })
})
