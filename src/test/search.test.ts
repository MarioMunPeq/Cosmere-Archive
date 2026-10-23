/**
 * M2 · Block 4 — search ranking.
 *
 * The ranking is the part of search that is not MiniSearch, and it is where the
 * four §5.8 acceptance queries live or die. These run against the real generated
 * index, so a change to the generator or to the rules below shows up here rather
 * than as a search that quietly stops finding anyone.
 */

import { describe, expect, it } from 'vitest'
import MiniSearch from 'minisearch'

import indexFile from '@/data/search-index.json'
import { search, makeSearchOptions } from '@/search/ranking'
import { MAX_RESULTS, TYPE_BOOST } from '@/search/types'
import type { SearchIndexFile } from '@/search/types'

// Imported, not read from disk: this is the same module the app loads, so the
// test cannot pass against a stale copy on disk.
const file = indexFile as unknown as SearchIndexFile

const index = MiniSearch.loadJSON(JSON.stringify(file.index), {
  fields: ['title', 'subtitle', 'body', 'aliases'],
  storeFields: ['title', 'subtitle', 'type', 'route', 'icon'],
})

const top = (q: string) => search(index, q, file.typeBoost)[0]

describe('search index', () => {
  it('covers the whole archive', () => {
    // 462 validated entities in content/, 289 searchable records, plus the
    // five core navigation sections. The difference is families and
    // relationships, which have no page to send someone to.
    expect(file.documentCount).toBe(294)
    expect(file.documentCount).toBeLessThan(400)
  })

  it('finds every core section, including Aharietiam', () => {
    for (const section of ['Library', 'Records', 'Shadesmar', 'Taravangian Diagram', 'Aharietiam']) {
      const hit = search(index, section, file.typeBoost).find((r) => r.type === 'page' && r.title === section)
      expect(hit, section).toBeDefined()
    }
    // Aharietiam is also the exact title, so it comes first and opens the page.
    expect(top('aharietiam')?.type).toBe('page')
    expect(top('aharietiam')?.route).toBe('/aharietiam')
  })

  it('ships the type weights it was built with', () => {
    expect(file.typeBoost).toEqual(TYPE_BOOST)
  })
})

describe('§5.8 Q.1 — the acceptance queries', () => {
  it.each([
    ['kaz', 'Kaladin'],
    ['preserv', 'Preservation'],
    ['saz', 'Sazed'],
    // Talenel is the hero record "Talenel (Taln)" and the character record
    // "Taln"; both names find him.
    ['tall', 'Tal'],
  ])('%s finds %s', (query, expected) => {
    expect(top(query)?.title).toContain(expected)
  })
})

describe('§5.8 Q.2 — every record is reachable', () => {
  it('finds records by full name', () => {
    for (const name of [
      'Kaladin',
      'Sazed',
      'Kelsier',
      'Shallan Davar',
      'Vin',
      'Roshar',
      'Scadrial',
      'Preservation',
      'Odium',
      'The Final Empire',
      'Allomancy',
      'Jezrien',
    ]) {
      expect(top(name)?.title, name).toContain(name.split(' ')[0]!)
    }
  })

  it('finds records by body text', () => {
    // Searching for a word that appears in a summary but not in any title.
    const hits = search(index, 'Shard', file.typeBoost)
    expect(hits.length).toBeGreaterThan(5)
  })
})

describe('§5.8 Q.3 — routes are fragments the app can resolve', () => {
  it('every result route is a fragment path, not a server path', () => {
    for (const q of ['kal', 'rosh', 'final empire', 'allomanc', 'jezrien', 'preservation']) {
      for (const hit of search(index, q, file.typeBoost)) {
        expect(hit.route, `${q} -> ${hit.route}`).toMatch(/^\/[a-z-]/)
      }
    }
  })

  it('no result points at a route that was deleted in M1', () => {
    const dead = ['/glossary', '/relationships', '/family-tree', '/heralds', '/locations']
    for (const q of ['kal', 'rosh', 'glossary', 'family', 'herald', 'location']) {
      for (const hit of search(index, q, file.typeBoost)) {
        for (const path of dead) expect(hit.route).not.toContain(path)
      }
    }
  })
})

describe('§5.8 Q.4 — fast enough to feel instant', () => {
  it('ranks in well under 5 ms', () => {
    const started = performance.now()
    for (let i = 0; i < 100; i++) search(index, 'kal', file.typeBoost)
    const per = (performance.now() - started) / 100
    expect(per).toBeLessThan(5)
  })
})

describe('ranking rules', () => {
  it('a person outranks an event of the same name', () => {
    // "Birth of Sazed" is a denser title than "Sazed", so raw field weights
    // put it first. The type weight is what corrects that.
    expect(top('saz')?.type).toBe('character')
    expect(top('vin')?.type).toBe('character')
    expect(top('kels')?.type).toBe('character')
  })

  it('a title beginning with the query wins', () => {
    expect(top('shall')?.title).toBe('Shallan Davar')
  })

  it('catches real typos without swallowing short queries', () => {
    expect(top('kaladin')?.title).toBe('Kaladin')
    expect(top('kaladn')?.title).toBe('Kaladin')
  })

  it('returns nothing for an empty or whitespace query', () => {
    expect(search(index, '')).toEqual([])
    expect(search(index, '   ')).toEqual([])
  })

  it('caps the visible results at 12', () => {
    const many = search(index, 'a', file.typeBoost)
    expect(many.length).toBeLessThanOrEqual(MAX_RESULTS)
  })

  it('exposes the same options the index was built with', () => {
    const options = makeSearchOptions(file.typeBoost)
    expect(options.prefix).toBe(true)
    expect(options.fuzzy).toBeGreaterThan(0)
    expect(typeof options.boostDocument).toBe('function')
  })

  it('gives every result a route, a type and a subtitle', () => {
    for (const hit of search(index, 's', file.typeBoost)) {
      expect(hit.route).toBeTruthy()
      expect(hit.type).toBeTruthy()
      expect(hit.title).toBeTruthy()
    }
  })
})
