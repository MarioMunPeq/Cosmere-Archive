import { describe, it, expect } from 'vitest'
import { easeOutCubic, calculateFlyTarget } from '@/utils/fly-to'

describe('easeOutCubic', () => {
  it('returns 0 at t=0', () => {
    expect(easeOutCubic(0)).toBe(0)
  })

  it('returns 1 at t=1', () => {
    expect(easeOutCubic(1)).toBe(1)
  })

  it('returns 0.5 at t≈0.2063', () => {
    const result = easeOutCubic(0.2063)
    expect(result).toBeCloseTo(0.5, 1)
  })

  it('is monotonic between 0 and 1', () => {
    const samples: number[] = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]
    for (let i = 1; i < samples.length; i++) {
      expect(easeOutCubic(samples[i]!)).toBeGreaterThan(easeOutCubic(samples[i - 1]!))
    }
  })
})

describe('calculateFlyTarget', () => {
  it('centers a planet at given zoom', () => {
    const result = calculateFlyTarget(400, 300, 2)
    expect(result).toEqual({ x: -350, y: -300 })
  })

  it('uses default viewBox center of 450, 300', () => {
    const result = calculateFlyTarget(450, 300, 1)
    expect(result).toEqual({ x: 0, y: 0 })
  })

  it('accepts custom viewBox center', () => {
    const result = calculateFlyTarget(200, 200, 2, 500, 400)
    expect(result).toEqual({ x: 100, y: 0 })
  })

  it('handles zoom of 0.5 correctly', () => {
    const result = calculateFlyTarget(100, 100, 0.5)
    expect(result).toEqual({ x: 400, y: 250 })
  })

  it('handles zoom of 3 correctly', () => {
    const result = calculateFlyTarget(300, 200, 3)
    expect(result).toEqual({ x: -450, y: -300 })
  })
})
