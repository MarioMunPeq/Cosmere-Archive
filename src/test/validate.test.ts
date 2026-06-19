import { describe, it, expect } from 'vitest'
import { validateCharacterArray } from '@/data/generated/validate'

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

  it('handles characters.json data', async () => {
    const data = await import('@/data/generated/characters.json')
    const result = validateCharacterArray(data.default ?? data)
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((c) => c.id && c.name && c.planet)).toBe(true)
  })
})
