import { describe, expect, it } from 'vitest'
import { FAMILY_TREES } from '@/data/static/family-data'
import { computeGenealogyLayout } from '@/utils/genealogy-layout'
import type { FamilyTree } from '@/utils/genealogy-layout'

const Kholin = FAMILY_TREES.find((f) => f.id.includes('kholin')) ?? FAMILY_TREES[0]!

describe('computeGenealogyLayout', () => {
  it('lays out every member exactly once', () => {
    for (const family of FAMILY_TREES) {
      const layout = computeGenealogyLayout(family)
      expect(layout.nodes.length, family.id).toBe(family.members.length)
      expect(new Set(layout.nodes.map((n) => n.member.id)).size).toBe(family.members.length)
    }
  })

  it('places a child below its parent', () => {
    const layout = computeGenealogyLayout(Kholin)
    const row = new Map(layout.nodes.map((n) => [n.member.id, n.y]))
    for (const edge of layout.edges) {
      const from = layout.nodes.find((n) => n.member.id === edge.from)!
      const to = layout.nodes.find((n) => n.member.id === edge.to)!
      expect(to.y, `${edge.from} -> ${edge.to}`).toBeGreaterThan(from.y)
      void row
    }
  })

  it('gives a married-in member their partner depth, not the root', () => {
    // Navani married into the house and has no recorded parents. Without the
    // married-in rule she would appear on the first row with Gavilar.
    const layout = computeGenealogyLayout(Kholin)
    const gavilar = layout.nodes.find((n) => n.member.id === 'gavilar')!
    const navani = layout.nodes.find((n) => n.member.id === 'navani')!
    expect(navani.y).toBe(gavilar.y)
  })

  it('is deterministic', () => {
    const a = computeGenealogyLayout(Kholin)
    const b = computeGenealogyLayout(Kholin)
    expect(a.nodes).toEqual(b.nodes)
    expect(a.edges).toEqual(b.edges)
  })

  it('does not hang on a cycle in the data', () => {
    const cyclic: FamilyTree = {
      id: 'cyclic',
      name: 'Cyclic',
      color: '#fff',
      description: 'a → b → a',
      rootIds: ['a'],
      members: [
        { id: 'a', name: 'A', parentIds: ['b'] },
        { id: 'b', name: 'B', parentIds: ['a'] },
      ],
    }
    const layout = computeGenealogyLayout(cyclic)
    expect(layout.nodes.length).toBe(2)
  })

  it('keeps every node inside the reported width', () => {
    for (const family of FAMILY_TREES) {
      const layout = computeGenealogyLayout(family)
      for (const n of layout.nodes) {
        expect(n.x, `${family.id} ${n.member.id} x`).toBeGreaterThanOrEqual(-0.5)
        expect(n.x + 152, `${family.id} ${n.member.id} right edge`).toBeLessThanOrEqual(layout.width + 0.5)
      }
    }
  })
})
