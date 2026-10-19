/**
 * The canvas-to-DOM seam.
 *
 * §5.5.3's rule is that all the words live in the DOM. That only works if the
 * thing crossing the seam behaves: the canvas runs at 60Hz and the document
 * does not, so the interesting failures here are all about *not* re-rendering
 * sixty times a second, and about not going quiet when something did change.
 */

import { describe, expect, it } from 'vitest'
import { generateSoulField } from '@/components/shadesmar/SoulField'
import { PERPENDICULARITIES } from '@/components/shadesmar/types'
import { describeSoul, registerRealms, ShadesmarStore } from '@/components/shadesmar/store'
import type { SoulInfo } from '@/components/shadesmar/store'

const hasRecord = (id: string) => id !== 'chanarach'

function aSelection(x: number, y: number) {
  return {
    id: 'soul_kaladin',
    entityId: 'kaladin',
    name: 'Kaladin',
    kind: 'important_character' as const,
    realmId: 'roshar',
    realmName: 'Roshar',
    description: 'A bridgeman who keeps becoming something else.',
    hasRecord: true,
    x,
    y,
  }
}

function aSoul(id = 'soul_kaladin') {
  return {
    id,
    entityId: id,
    name: id.replace('soul_', ''),
    kind: 'character' as const,
    realmId: 'roshar',
    realmName: 'Roshar',
    description: '',
    hasRecord: true,
  }
}

describe('describeSoul', () => {
  it('strips the canvas prefix off the record id', () => {
    const soul = generateSoulField().find((s) => s.entityId === 'soul_kaladin')!
    expect(describeSoul(soul, hasRecord).entityId).toBe('kaladin')
  })

  it('knows when there is no record behind a soul', () => {
    // A Herald has a name, a surge list and nowhere to read about it. The
    // inspector uses this to withhold a link rather than offer a 404.
    const soul = generateSoulField().find((s) => s.entityId === 'soul_chanarach')!
    const info = describeSoul(soul, hasRecord)
    expect(info.name).toBeTruthy()
    expect(info.hasRecord).toBe(false)
  })

  it('names every soul after the realm it belongs to', () => {
    registerRealms(PERPENDICULARITIES)
    const souls = generateSoulField().filter((s) => s.name)
    expect(souls.length).toBeGreaterThan(90)
    for (const s of souls) {
      const info: SoulInfo = describeSoul(s, hasRecord)
      expect(info.realmName, info.id).not.toBe('')
      expect(info.name, info.id).not.toBe('')
    }
  })
})

/*
 * The re-render budget.
 *
 * The canvas calls into the store sixty times a second. Every one of these
 * asserts how *often* a listener hears about it, because that is the only thing
 * that decides whether the overlay is usable.
 */
describe('ShadesmarStore', () => {
  function counting() {
    const store = new ShadesmarStore()
    let calls = 0
    store.subscribe(() => {
      calls++
    })
    return { store, calls: () => calls }
  }

  it('says nothing when the hovered soul has not changed', () => {
    const { store, calls } = counting()
    for (let i = 0; i < 60; i++) store.setHovered(aSoul())
    // A fresh object every frame is what the canvas publishes; only the id is
    // compared, so sixty identical frames are silence.
    expect(calls()).toBe(1)
  })

  it('says something when it has', () => {
    const { store, calls } = counting()
    store.setHovered(aSoul())
    store.setHovered(aSoul('soul_vin'))
    expect(calls()).toBe(2)
  })

  it('stays silent while a bead drifts inside half a pixel', () => {
    const { store, calls } = counting()
    store.setSelected(aSelection(100, 100))
    expect(calls()).toBe(1)
    for (let i = 1; i <= 30; i++) store.setSelected(aSelection(100 + i * 0.01, 100))
    expect(calls()).toBe(1)
  })

  it('speaks once the bead has actually moved', () => {
    // The regression: an earlier version updated the state silently and expected
    // the panel to read it anyway. `useSyncExternalStore` only re-renders on a
    // notification, so the inspector froze where the bead was when you clicked
    // it, and S.6 measured a 21px gap instead of 28.
    const { store, calls } = counting()
    store.setSelected(aSelection(100, 100))
    store.setSelected(aSelection(140, 100))
    expect(calls()).toBe(2)
    expect(store.getSnapshot().selected?.x).toBe(140)
  })

  it('does not re-render when a set field is given the same value', () => {
    const { store, calls } = counting()
    store.setFocusedRealm('roshar')
    store.setFocusedRealm('roshar')
    store.setFocusedRealm('roshar')
    expect(calls()).toBe(1)
  })

  it('clears everything on reset, because the store outlives the route', () => {
    const store = new ShadesmarStore()
    store.setHovered(aSoul())
    store.setSelected(aSelection(10, 10))
    store.setFocusedRealm('roshar')
    store.setQuery('kal')
    store.reset()
    const s = store.getSnapshot()
    expect(s.hovered).toBeNull()
    expect(s.selected).toBeNull()
    expect(s.focusedRealmId).toBeNull()
    expect(s.query).toBe('')
  })

  it('stops notifying after unsubscribe', () => {
    const store = new ShadesmarStore()
    let calls = 0
    const off = store.subscribe(() => {
      calls++
    })
    store.setFocusedRealm('roshar')
    off()
    store.setFocusedRealm('scadrial')
    expect(calls).toBe(1)
  })
})
