import { describe, it, expect } from 'vitest'
import { PLANETS } from '@/data/static/planets'
import { BOOKS } from '@/data/static/books'
import { SAGAS } from '@/data/static/sagas'
import { TIMELINE_EVENTS } from '@/data/static/timeline/events'
import { CHARACTER_SPANS } from '@/data/static/timeline/character-lifespans'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline/worldhopper-journeys'
import { ERAS } from '@/data/static/timeline/eras'
import { ALL_CHARACTERS } from '@/data/static'

const PLANET_IDS = new Set(PLANETS.map((p) => p.id))
const BOOK_IDS = new Set(BOOKS.map((b) => b.id))
const SAGA_IDS = new Set(SAGAS.map((s) => s.id))
const EVENT_IDS = new Set(TIMELINE_EVENTS.map((e) => e.id))
const CHARACTER_IDS = new Set(ALL_CHARACTERS.map((c) => c.id))
const SPAN_IDS = new Set(CHARACTER_SPANS.map((s) => s.id))
const WH_IDS = new Set(WORLDHOPPER_MOVEMENTS.map((w) => w.id))
const ERA_IDS = new Set(ERAS.map((e) => e.id))

describe('data integrity — unique IDs', () => {
  it('PLANETS have unique ids', () => {
    expect(PLANETS.length).toBe(PLANET_IDS.size)
  })

  it('BOOKS have unique ids', () => {
    expect(BOOKS.length).toBe(BOOK_IDS.size)
  })

  it('SAGAS have unique ids', () => {
    expect(SAGAS.length).toBe(SAGA_IDS.size)
  })

  it('TIMELINE_EVENTS have unique ids', () => {
    expect(TIMELINE_EVENTS.length).toBe(EVENT_IDS.size)
  })
})

describe('data integrity — reference checks', () => {
  it('all event.planets exist in PLANETS', () => {
    for (const event of TIMELINE_EVENTS) {
      for (const pid of event.planets) {
        expect(PLANET_IDS.has(pid), `event "${event.id}" references unknown planet "${pid}"`).toBe(true)
      }
    }
  })

  it('all event.saga exists in SAGAS', () => {
    for (const event of TIMELINE_EVENTS) {
      expect(SAGA_IDS.has(event.saga), `event "${event.id}" references unknown saga "${event.saga}"`).toBe(true)
    }
  })

  it('no event has endYear < year', () => {
    for (const event of TIMELINE_EVENTS) {
      if (event.endYear !== undefined) {
        expect(
          event.endYear >= event.year,
          `event "${event.id}" has endYear (${event.endYear}) < year (${event.year})`,
        ).toBe(true)
      }
    }
  })

  it('all events have importance between 1 and 5', () => {
    for (const event of TIMELINE_EVENTS) {
      expect(event.importance).toBeGreaterThanOrEqual(1)
      expect(event.importance).toBeLessThanOrEqual(5)
    }
  })

  it('all planet.books exist in BOOKS', () => {
    for (const planet of PLANETS) {
      if (!planet.books) continue
      for (const bid of planet.books) {
        expect(BOOK_IDS.has(bid), `planet "${planet.id}" references unknown book "${bid}"`).toBe(true)
      }
    }
  })

  it('all planet.sagas exist in SAGAS', () => {
    for (const planet of PLANETS) {
      if (planet.sagas) {
        for (const sid of planet.sagas) {
          expect(SAGA_IDS.has(sid), `planet "${planet.id}" references unknown saga "${sid}"`).toBe(true)
        }
      }
    }
  })

  it('all book.saga exists in SAGAS', () => {
    for (const book of BOOKS) {
      expect(SAGA_IDS.has(book.saga), `book "${book.id}" references unknown saga "${book.saga}"`).toBe(true)
    }
  })

  it('all character.requiredBooks exist in BOOKS', () => {
    for (const char of ALL_CHARACTERS) {
      for (const bid of char.requiredBooks) {
        expect(BOOK_IDS.has(bid), `character "${char.id}" references unknown book "${bid}"`).toBe(true)
      }
    }
  })

  it('all character.planet exists in PLANETS (case-insensitive)', () => {
    const lowerPlanetIds = new Set(Array.from(PLANET_IDS).map((id) => id.toLowerCase()))
    for (const char of ALL_CHARACTERS) {
      const lower = char.planet.toLowerCase()
      expect(lowerPlanetIds.has(lower), `character "${char.id}" references unknown planet "${char.planet}"`).toBe(true)
    }
  })

  it('all worldhopper movement planets exist in PLANETS', () => {
    for (const wh of WORLDHOPPER_MOVEMENTS) {
      for (const pid of wh.planets) {
        expect(PLANET_IDS.has(pid), `worldhopper "${wh.id}" references unknown planet "${pid}"`).toBe(true)
      }
      for (const mv of wh.movements) {
        expect(PLANET_IDS.has(mv.planet), `worldhopper "${wh.id}" movement to unknown planet "${mv.planet}"`).toBe(true)
      }
    }
  })

  it('all worldhopper sagas exist in SAGAS', () => {
    for (const wh of WORLDHOPPER_MOVEMENTS) {
      for (const sid of wh.sagas) {
        expect(SAGA_IDS.has(sid), `worldhopper "${wh.id}" references unknown saga "${sid}"`).toBe(true)
      }
    }
  })

  it('all character spans have planets that exist in PLANETS (case-insensitive)', () => {
    const lowerPlanetIds = new Set(Array.from(PLANET_IDS).map((id) => id.toLowerCase()))
    for (const cs of CHARACTER_SPANS) {
      const lower = cs.planet.toLowerCase()
      expect(lowerPlanetIds.has(lower), `character span "${cs.id}" references unknown planet "${cs.planet}"`).toBe(true)
    }
  })

  it('all planet connectedPlanets exist in PLANETS', () => {
    for (const planet of PLANETS) {
      if (planet.connectedPlanets) {
        for (const cid of planet.connectedPlanets) {
          expect(PLANET_IDS.has(cid), `planet "${planet.id}" references unknown connected planet "${cid}"`).toBe(true)
        }
      }
    }
  })

  it('all characters have at least 1 requiredBook', () => {
    for (const char of ALL_CHARACTERS) {
      expect(
        char.requiredBooks.length,
        `character "${char.id}" (${char.name}) has zero requiredBooks`,
      ).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('data integrity — entity validity', () => {
  it('ALL_CHARACTERS have unique ids', () => {
    expect(ALL_CHARACTERS.length).toBe(CHARACTER_IDS.size)
  })

  it('CHARACTER_SPANS have unique ids', () => {
    expect(CHARACTER_SPANS.length).toBe(SPAN_IDS.size)
  })

  it('WORLDHOPPER_MOVEMENTS have unique ids', () => {
    expect(WORLDHOPPER_MOVEMENTS.length).toBe(WH_IDS.size)
  })

  it('ERAS have unique ids', () => {
    expect(ERAS.length).toBe(ERA_IDS.size)
  })

  it('all PLANETS have positive size', () => {
    for (const planet of PLANETS) {
      expect(planet.size, `planet "${planet.id}" has non-positive size ${planet.size}`).toBeGreaterThan(0)
    }
  })

  it('all PLANETS have valid viewBox coordinates (0-900 x 0-600)', () => {
    for (const planet of PLANETS) {
      expect(planet.x >= 0 && planet.x <= 900, `planet "${planet.id}" x=${planet.x} outside viewBox width`).toBe(true)
      expect(planet.y >= 0 && planet.y <= 600, `planet "${planet.id}" y=${planet.y} outside viewBox height`).toBe(true)
    }
  })

  it('all TIMELINE_EVENTS have non-empty title', () => {
    for (const event of TIMELINE_EVENTS) {
      expect(event.title?.trim(), `event "${event.id}" has empty title`).toBeTruthy()
    }
  })

  it('all TIMELINE_EVENTS have non-empty description', () => {
    for (const event of TIMELINE_EVENTS) {
      expect(event.description?.trim(), `event "${event.id}" has empty description`).toBeTruthy()
    }
  })

  it('all ERAS have endYear > startYear', () => {
    for (const era of ERAS) {
      expect(
        era.endYear > era.startYear,
        `era "${era.id}" has endYear (${era.endYear}) <= startYear (${era.startYear})`,
      ).toBe(true)
    }
  })

  it('all SAGAS have unique order values', () => {
    const orders = SAGAS.map((s) => s.order)
    expect(orders.length).toBe(new Set(orders).size)
  })

  it('all BOOKS have positive order values', () => {
    for (const book of BOOKS) {
      expect(book.order, `book "${book.id}" has non-positive order ${book.order}`).toBeGreaterThanOrEqual(1)
    }
  })

  it('all BOOKS have unique order values within each saga', () => {
    const sagaGroups = new Map<string, number[]>()
    for (const book of BOOKS) {
      const orders = sagaGroups.get(book.saga) ?? []
      orders.push(book.order)
      sagaGroups.set(book.saga, orders)
    }
    for (const [saga, orders] of sagaGroups) {
      expect(orders.length, `saga "${saga}" has books with duplicate orders`).toBe(new Set(orders).size)
    }
  })

  it('all PLANETS have non-empty investiture names', () => {
    for (const planet of PLANETS) {
      if (!planet.investiture) continue
      for (const sys of planet.investiture) {
        expect(sys.name?.trim(), `planet "${planet.id}" investiture has empty name`).toBeTruthy()
      }
    }
  })

  it('all PLANETS have non-empty investiture descriptions', () => {
    for (const planet of PLANETS) {
      if (!planet.investiture) continue
      for (const sys of planet.investiture) {
        expect(
          sys.description?.trim(),
          `planet "${planet.id}" investiture "${sys.name}" has empty description`,
        ).toBeTruthy()
      }
    }
  })

  it('all PLANETS have unique investiture names per planet', () => {
    for (const planet of PLANETS) {
      if (!planet.investiture) continue
      const names = planet.investiture.map((s) => s.name)
      expect(names.length, `planet "${planet.id}" has duplicate investiture names`).toBe(new Set(names).size)
    }
  })
})
