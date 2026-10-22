import { describe, expect, it } from 'vitest'
import { getBookById } from '@/data/static/books'
import {
  buildLibraryLeaves,
  buildLibraryMobileSpreads,
  buildLibrarySpreads,
  splitText,
} from '@/components/library/library-book'

const BOOK = getBookById('the_way_of_kings')

describe('library pagination', () => {
  it('splits a synopsis at sentence ends without losing text', () => {
    const text = 'One sentence. Two sentence! Three sentence? Four sentence.'
    const chunks = splitText(text, 20, 26)

    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.join(' ').replace(/\s+/g, ' ')).toBe(text)
    for (const chunk of chunks.slice(1)) expect(chunk.length).toBeLessThanOrEqual(26)
  })

  it('builds a cover leaf and an entry for every section', () => {
    expect(BOOK).toBeDefined()
    const leaves = buildLibraryLeaves(BOOK!)

    expect(leaves[0]?.id).toBe('the_way_of_kings-cover')
    expect(leaves[0]?.header).toBe('Volume record')
    expect(new Set(leaves.map((leaf) => leaf.id)).size).toBe(leaves.length)
    expect(leaves.length).toBeGreaterThan(3)
  })

  it('pairs the cover with the synopsis in the first desk spread', () => {
    const spreads = buildLibrarySpreads(BOOK!)

    expect(spreads.length).toBeGreaterThan(1)
    expect(spreads[0]?.leftHeader).toBe('Volume record')
    expect(spreads[0]?.rightHeader).toBe('Synopsis')
    expect(spreads.every((spread) => spread.left !== null && spread.right !== null)).toBe(true)
  })

  it('gives a phone one leaf per spread with no left page', () => {
    const spreads = buildLibraryMobileSpreads(BOOK!)

    expect(spreads.length).toBeGreaterThan(1)
    expect(spreads.every((spread) => spread.left === null)).toBe(true)
    expect(spreads.every((spread) => spread.right !== null)).toBe(true)
  })
})
