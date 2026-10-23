import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { HONORBLADES } from '@/data/static/aharietiam'
import {
  BLADE_FORMS,
  bladeHalfWidthAt,
  bladeOutline,
  fullerOutline,
  guardOutline,
  outlineToPath,
} from '@/components/aharietiam/blade-forms'
import SceneFallback from '@/components/aharietiam/SceneFallback'

describe('Aharietiam blade forms', () => {
  it('describes every Honorblade exactly once', () => {
    expect(Object.keys(BLADE_FORMS).sort()).toEqual(HONORBLADES.map((blade) => blade.id).sort())
    expect(HONORBLADES).toHaveLength(10)
  })

  it('gives the ten blades ten genuinely different silhouettes', () => {
    const signatures = HONORBLADES.map((blade) => {
      const form = BLADE_FORMS[blade.id]
      expect(form, `${blade.id} has no blade form`).toBeDefined()
      return JSON.stringify({
        length: form?.length,
        halfWidth: form?.halfWidth,
        profile: form?.profile,
        tipHalfWidth: form?.tipHalfWidth,
        asymmetry: form?.asymmetry,
        waveAmplitude: form?.waveAmplitude,
        waveCycles: form?.waveCycles,
        curve: form?.curve,
        guard: form?.guard,
        guardWidth: form?.guardWidth,
        guardDepth: form?.guardDepth,
        grip: form?.grip,
        pommel: form?.pommel,
      })
    })

    expect(new Set(signatures).size).toBe(10)
  })

  it('gives each Herald a distinct crossguard', () => {
    const guards = HONORBLADES.map((blade) => {
      const form = BLADE_FORMS[blade.id]
      return outlineToPath(guardOutline(form?.guard ?? 'bar', form?.guardWidth ?? 0.7))
    })
    expect(new Set(guards).size).toBe(10)
  })

  it('produces closed, non-degenerate outlines', () => {
    for (const blade of HONORBLADES) {
      const form = BLADE_FORMS[blade.id]
      expect(form).toBeDefined()
      if (!form) continue

      const outline = bladeOutline(form)
      expect(outline.length).toBeGreaterThan(20)
      expect(new Set(outline.map((point) => `${point.x.toFixed(5)},${point.y.toFixed(5)}`)).size).toBe(outline.length)

      for (let index = 0; index < outline.length; index++) {
        const point = outline[index]
        const next = outline[(index + 1) % outline.length]
        expect(point).toBeDefined()
        expect(next).toBeDefined()
        if (!point || !next) continue
        expect(point.y).toBeGreaterThanOrEqual(-0.001)
        expect(point.y).toBeLessThanOrEqual(form.length + 0.001)
        expect(Math.abs(point.x - next.x) + Math.abs(point.y - next.y)).toBeGreaterThan(0.000001)
      }

      expect(bladeHalfWidthAt(form, 0.5)).toBeGreaterThan(0)
      expect(outlineToPath(fullerOutline(form))).toMatch(/^M.* Z$/)
      expect(outlineToPath(outline)).toMatch(/^M.* Z$/)
    }
  })
})

describe('Aharietiam fallback', () => {
  it('draws the field and lists all ten blade names', () => {
    render(<SceneFallback reason="The field could not be drawn on this device." />)

    expect(screen.getByRole('heading', { level: 1, name: /aharietiam — the ten blades/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /ten Honorblades standing in a circle/i })).toBeInTheDocument()

    const list = screen.getByRole('list', { name: 'The ten Honorblades' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(10)
    for (const blade of HONORBLADES) {
      expect(within(list).getByText(blade.name)).toBeInTheDocument()
    }

    expect(screen.getByText('The field could not be drawn on this device.')).toBeInTheDocument()
  })
})
