import { describe, expect, it } from 'vitest'
import { fitShelf, GAP, MAX_SPINE, MIN_SPINE } from '@/utils/shelf-layout'

describe('fitShelf', () => {
  it('never returns a row wider than the space available', () => {
    // The property the old layout violated by 192px.
    for (const available of [200, 320, 480, 768, 1024, 1440, 1920, 2560]) {
      for (const count of [1, 5, 10, 22]) {
        const layout = fitShelf({ availableWidth: available, count, baseHeight: 300 })
        const widest = Math.min(count, layout.perRow)
        const rowWidth = layout.spineWidth * widest + GAP * (widest - 1)
        expect(
          rowWidth,
          `${count} books in ${available}px produced a ${rowWidth.toFixed(0)}px row`,
        ).toBeLessThanOrEqual(available + 0.5)
      }
    }
  })

  it('keeps every spine at or above the 24px readable minimum (B.5)', () => {
    for (const available of [120, 160, 200, 320, 768, 1440]) {
      const layout = fitShelf({ availableWidth: available, count: 22, baseHeight: 300 })
      expect(layout.spineWidth, `at ${available}px`).toBeGreaterThanOrEqual(MIN_SPINE)
    }
  })

  it('wraps to two rows rather than shrinking past readability', () => {
    const narrow = fitShelf({ availableWidth: 300, count: 22, baseHeight: 300 })
    expect(narrow.rows).toBeGreaterThan(1)
    expect(narrow.spineWidth).toBeGreaterThanOrEqual(MIN_SPINE)
  })

  it('uses a single row when there is room', () => {
    const wide = fitShelf({ availableWidth: 2000, count: 8, baseHeight: 300 })
    expect(wide.rows).toBe(1)
    expect(wide.perRow).toBe(8)
  })

  it('never exceeds the maximum spine width', () => {
    const wide = fitShelf({ availableWidth: 4000, count: 3, baseHeight: 300 })
    expect(wide.spineWidth).toBeLessThanOrEqual(MAX_SPINE)
  })

  it('grows the height with the spine so a row is never tall slivers', () => {
    const narrow = fitShelf({ availableWidth: 320, count: 22, baseHeight: 300 })
    const wide = fitShelf({ availableWidth: 2000, count: 8, baseHeight: 300 })
    expect(wide.height).toBeGreaterThanOrEqual(narrow.height)
  })

  it('handles the degenerate cases without throwing', () => {
    expect(fitShelf({ availableWidth: 0, count: 22, baseHeight: 300 }).spineWidth).toBe(MIN_SPINE)
    expect(fitShelf({ availableWidth: 500, count: 0, baseHeight: 300 }).rows).toBe(0)
    expect(fitShelf({ availableWidth: 500, count: 1, baseHeight: 300 }).perRow).toBe(1)
  })

  it('is deterministic', () => {
    const a = fitShelf({ availableWidth: 900, count: 11, baseHeight: 300 })
    const b = fitShelf({ availableWidth: 900, count: 11, baseHeight: 300 })
    expect(a).toEqual(b)
  })
})
