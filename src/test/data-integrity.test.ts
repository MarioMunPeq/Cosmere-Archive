import { describe, it, expect } from 'vitest'
import { PLANETS } from '@/data/static/planets'
import { BOOKS } from '@/data/static/books'
import { SAGAS } from '@/data/static/sagas'
import { TIMELINE_EVENTS } from '@/data/static/timeline/events'
import { CHARACTER_SPANS } from '@/data/static/timeline/character-lifespans'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline/worldhopper-journeys'
import { ERAS } from '@/data/static/timeline/eras'
import { ALL_CHARACTERS } from '@/data/static'
import { HERALDS } from '@/data/static/heralds'
import {
  READING_ORDER,
  READING_ORDER_KEY,
  SHORTCUTS,
  CHARACTER_RELATIONSHIPS,
  FALLBACK_COLOR,
  SHARD_COLORS,
  SAGA_BG,
  SAGA_NAME_COLORS,
  TAILWIND_TO_HEX,
  EVENT_TYPE_BADGE_COLORS,
  TYPE_LABELS,
  hexToRgb,
} from '@/data/static'

const PLANET_IDS = new Set(PLANETS.map((p) => p.id))
const BOOK_IDS = new Set(BOOKS.map((b) => b.id))
const SAGA_IDS = new Set(SAGAS.map((s) => s.id))
const EVENT_IDS = new Set(TIMELINE_EVENTS.map((e) => e.id))
const CHARACTER_IDS = new Set(ALL_CHARACTERS.map((c) => c.id))
const SPAN_IDS = new Set(CHARACTER_SPANS.map((s) => s.id))
const WH_IDS = new Set(WORLDHOPPER_MOVEMENTS.map((w) => w.id))
const ERA_IDS = new Set(ERAS.map((e) => e.id))
const HERALD_IDS = new Set(HERALDS.map((h) => h.id))

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
      expect(book.order, `book "${book.id}" has negative order ${book.order}`).toBeGreaterThanOrEqual(0)
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

describe('data integrity — Heralds', () => {
  it('HERALDS have unique ids', () => {
    expect(HERALDS.length).toBe(HERALD_IDS.size)
  })

  it('all Heralds have character entries if characterId is set', () => {
    for (const h of HERALDS) {
      if (h.characterId) {
        expect(
          CHARACTER_IDS.has(h.characterId),
          `herald "${h.id}" references unknown character "${h.characterId}"`,
        ).toBe(true)
      }
    }
  })

  it('all Heralds have exactly 2 surges', () => {
    for (const h of HERALDS) {
      expect(h.surges.length, `herald "${h.id}" does not have exactly 2 surges`).toBe(2)
    }
  })

  it('each Herald has a unique order', () => {
    const orders = HERALDS.map((h) => h.order)
    expect(orders.length).toBe(new Set(orders).size)
  })
})

describe('data integrity — Reading Order', () => {
  it('all READING_ORDER book IDs exist in BOOKS', () => {
    for (const id of READING_ORDER) {
      expect(BOOK_IDS.has(id), `reading order references unknown book "${id}"`).toBe(true)
    }
  })

  it('READING_ORDER has unique entries', () => {
    expect(READING_ORDER.length).toBe(new Set(READING_ORDER).size)
  })
})

describe('static-data.ts barrel', () => {
  it('exports READING_ORDER_KEY as a string', () => {
    expect(typeof READING_ORDER_KEY).toBe('string')
    expect(READING_ORDER_KEY.length).toBeGreaterThan(0)
  })

  it('exports SHORTCUTS as a non-empty array', () => {
    expect(Array.isArray(SHORTCUTS)).toBe(true)
    expect(SHORTCUTS.length).toBeGreaterThan(0)
    for (const s of SHORTCUTS) {
      expect(typeof s.keys).toBe('string')
      expect(typeof s.label).toBe('string')
    }
  })

  it('exports CHARACTER_RELATIONSHIPS as a non-empty array', () => {
    expect(Array.isArray(CHARACTER_RELATIONSHIPS)).toBe(true)
    expect(CHARACTER_RELATIONSHIPS.length).toBeGreaterThan(0)
    for (const r of CHARACTER_RELATIONSHIPS) {
      expect(Array.isArray(r.characters)).toBe(true)
      expect(r.characters.length).toBe(2)
      expect(typeof r.type).toBe('string')
    }
  })

  it('all CHARACTER_RELATIONSHIPS character IDs exist in ALL_CHARACTERS', () => {
    for (const rel of CHARACTER_RELATIONSHIPS) {
      for (const cid of rel.characters) {
        expect(CHARACTER_IDS.has(cid), `relationship references unknown character "${cid}"`).toBe(true)
      }
    }
  })

  it('exports color constants as strings', () => {
    expect(typeof FALLBACK_COLOR).toBe('string')
    expect(FALLBACK_COLOR).toMatch(/^#/)
    expect(typeof SHARD_COLORS).toBe('object')
    expect(Object.keys(SHARD_COLORS).length).toBeGreaterThan(0)
    expect(typeof SAGA_BG).toBe('object')
    expect(Object.keys(SAGA_BG).length).toBeGreaterThan(0)
    expect(typeof SAGA_NAME_COLORS).toBe('object')
    expect(Object.keys(SAGA_NAME_COLORS).length).toBeGreaterThan(0)
  })

  it('exports TAILWIND_TO_HEX as a Record<string, string>', () => {
    expect(typeof TAILWIND_TO_HEX).toBe('object')
    for (const [k, v] of Object.entries(TAILWIND_TO_HEX)) {
      expect(typeof k).toBe('string')
      expect(v).toMatch(/^#/)
    }
  })

  it('exports EVENT_TYPE_BADGE_COLORS and TYPE_LABELS', () => {
    expect(typeof EVENT_TYPE_BADGE_COLORS).toBe('object')
    expect(Object.keys(EVENT_TYPE_BADGE_COLORS).length).toBeGreaterThan(0)
    expect(typeof TYPE_LABELS).toBe('object')
    expect(Object.keys(TYPE_LABELS).length).toBeGreaterThan(0)
  })

  it('hexToRgb converts hex to RGB tuple', () => {
    const result = hexToRgb('#a855f7')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(3)
    expect(result[0]).toBe(168)
    expect(result[1]).toBe(85)
    expect(result[2]).toBe(247)
  })
})
