import { describe, expect, it } from 'vitest'
import {
  buildSpreads,
  canonicalSpreadParams,
  folio,
  paginate,
  resolveLegacySpread,
  spreadIndexById,
  toRoman,
  type CodexLeaf,
  type CodexSection,
} from '@/utils/codex-pages'

function leaf(id: string, extra: Partial<CodexLeaf> = {}): CodexLeaf {
  return { id, title: id, ...extra }
}

function fixture(): CodexSection[] {
  return [
    {
      leaves: [
        leaf('contents', { title: 'Contents', frontMatter: true, view: 'contents' }),
        leaf('title', { title: 'Ars Arcanum', frontMatter: true }),
      ],
    },
    {
      leaves: [
        leaf('chapter-roshar', { title: 'Roshar', chapterId: 'roshar', view: 'chapter' }),
        leaf('system-surgebinding', { title: 'Surgebinding', chapterId: 'roshar', systemIds: ['surgebinding'] }),
        leaf('system-voidbinding', { title: 'Voidbinding', chapterId: 'roshar', systemIds: ['voidbinding'] }),
        leaf('system-old-magic', { title: 'Old Magic', chapterId: 'roshar', systemIds: ['old-magic'] }),
      ],
    },
    {
      leaves: [
        leaf('chapter-scadrial', { title: 'Scadrial', chapterId: 'scadrial', view: 'chapter' }),
        leaf('system-allomancy', { title: 'Allomancy', chapterId: 'scadrial', systemIds: ['allomancy'] }),
      ],
    },
    {
      leaves: [
        leaf('record-kaladin', { title: 'Kaladin', characterIds: ['kaladin'], view: 'records' }),
        leaf('record-shallan', { title: 'Shallan', characterIds: ['shallan'], view: 'records' }),
      ],
    },
    {
      leaves: [
        leaf('family-kholin', { title: 'Kholin', familyIds: ['kholin'], view: 'bloodlines' }),
        leaf('family-davar', { title: 'Davar', familyIds: ['davar'], view: 'bloodlines' }),
      ],
    },
    {
      leaves: [
        leaf('search', { title: 'Search', view: 'search' }),
        leaf('search-worlds', { title: 'Worlds', view: 'search' }),
      ],
    },
    {
      leaves: [
        leaf('index', { title: 'Index', view: 'index' }),
        leaf('index-world', { title: 'Index of Worlds', view: 'index' }),
      ],
    },
  ]
}

describe('codex pagination', () => {
  it('numbers the front matter in roman and restarts the body at 1', () => {
    expect(folio(1, 2)).toBe('i')
    expect(folio(2, 2)).toBe('ii')
    expect(folio(3, 2)).toBe('1')
    expect(folio(4, 2)).toBe('2')
    expect(folio(9, 2)).toBe('7')
  })

  it('prints roman numerals up to the table limit', () => {
    expect(toRoman(1)).toBe('I')
    expect(toRoman(4)).toBe('IV')
    expect(toRoman(9)).toBe('IX')
    expect(toRoman(14)).toBe('XIV')
    expect(toRoman(0)).toBe('0')
    expect(toRoman(4000)).toBe('4000')
  })

  it('rejects impossible folio arguments', () => {
    expect(() => folio(0)).toThrow(RangeError)
    expect(() => folio(1.5)).toThrow(RangeError)
    expect(() => paginate([1, 2], 0)).toThrow(RangeError)
  })

  it('chunks any list into pages', () => {
    expect(paginate([1, 2, 3, 4, 5])).toEqual([[1, 2], [3, 4], [5]])
    expect(paginate([1, 2, 3, 4, 5], 3)).toEqual([
      [1, 2, 3],
      [4, 5],
    ])
    expect(paginate([])).toEqual([])
  })

  it('pairs leaves inside a section and keeps chapters on a fresh spread', () => {
    const spreads = buildSpreads(fixture())

    expect(spreads).toHaveLength(8)
    expect(spreads[0]).toMatchObject({
      id: 'contents',
      number: 1,
      title: 'Contents',
      leftId: 'contents',
      rightId: 'title',
      folios: ['i', 'ii'],
      pageNumbers: [1, 2],
    })
    expect(spreads[1]).toMatchObject({
      id: 'chapter-roshar',
      title: 'Roshar',
      chapterId: 'roshar',
      systemIds: ['surgebinding'],
      folios: ['1', '2'],
      pageNumbers: [3, 4],
    })
    expect(spreads[2]).toMatchObject({
      id: 'system-voidbinding',
      title: 'Voidbinding',
      systemIds: ['voidbinding', 'old-magic'],
      folios: ['3', '4'],
      pageNumbers: [5, 6],
    })
    expect(spreads[3]).toMatchObject({
      id: 'chapter-scadrial',
      systemIds: ['allomancy'],
      folios: ['5', '6'],
    })
    expect(spreads[4]).toMatchObject({
      id: 'record-kaladin',
      characterIds: ['kaladin', 'shallan'],
      view: 'records',
      folios: ['7', '8'],
    })
    expect(spreads[5]).toMatchObject({
      id: 'family-kholin',
      familyIds: ['kholin', 'davar'],
      view: 'bloodlines',
      folios: ['9', '10'],
    })
    expect(spreads[6]).toMatchObject({
      id: 'search',
      view: 'search',
      folios: ['11', '12'],
    })
    expect(spreads[7]).toMatchObject({
      id: 'index',
      view: 'index',
      folios: ['13', '14'],
    })
    expect(spreads.every((spread, index) => spread.number === index + 1)).toBe(true)
  })

  it('leaves the recto empty without losing its page number', () => {
    const spreads = buildSpreads([
      {
        leaves: [leaf('contents', { frontMatter: true }), leaf('title', { frontMatter: true })],
      },
      {
        leaves: [leaf('chapter-solo', { title: 'Solo', chapterId: 'solo', view: 'chapter' })],
      },
      {
        leaves: [leaf('index', { title: 'Index', view: 'index' }), leaf('index-world')],
      },
    ])

    expect(spreads).toHaveLength(3)
    expect(spreads[1]).toMatchObject({
      id: 'chapter-solo',
      leftId: 'chapter-solo',
      rightId: null,
      folios: ['1', null],
      pageNumbers: [3, 4],
    })
    expect(spreads[2]).toMatchObject({
      folios: ['3', '4'],
      pageNumbers: [5, 6],
    })
  })

  it('accepts an explicit blank leaf but never uses its id', () => {
    const spreads = buildSpreads([
      {
        leaves: [
          leaf('blank-left', { blank: true, title: 'Blank' }),
          leaf('chapter-real', { title: 'Real', chapterId: 'real', view: 'chapter' }),
        ],
      },
    ])

    expect(spreads[0]).toMatchObject({
      id: 'chapter-real',
      leftId: 'blank-left',
      rightId: 'chapter-real',
      folios: [null, '2'],
    })
  })

  it('finds a spread by id', () => {
    const spreads = buildSpreads(fixture())
    expect(spreadIndexById(spreads, 'chapter-roshar')).toBe(1)
    expect(spreadIndexById(spreads, 'missing')).toBe(-1)
  })
})

describe('legacy codex URLs', () => {
  const spreads = buildSpreads(fixture())

  it('prefers a canonical spread id', () => {
    const params = new URLSearchParams('spread=chapter-scadrial&system=surgebinding')
    expect(resolveLegacySpread(spreads, params)?.id).toBe('chapter-scadrial')
  })

  it('maps a system to the spread that shows it', () => {
    expect(resolveLegacySpread(spreads, new URLSearchParams('system=voidbinding'))?.id).toBe('system-voidbinding')
    expect(resolveLegacySpread(spreads, new URLSearchParams('system=allomancy'))?.id).toBe('chapter-scadrial')
    expect(resolveLegacySpread(spreads, new URLSearchParams('system=nope'))).toBeUndefined()
  })

  it('maps character, family, tab and search parameters', () => {
    expect(resolveLegacySpread(spreads, new URLSearchParams('character=shallan'))?.id).toBe('record-kaladin')
    expect(resolveLegacySpread(spreads, new URLSearchParams('family=davar'))?.id).toBe('family-kholin')
    expect(resolveLegacySpread(spreads, new URLSearchParams('tab=contents'))?.id).toBe('contents')
    expect(resolveLegacySpread(spreads, new URLSearchParams('tab=characters'))?.id).toBe('record-kaladin')
    expect(resolveLegacySpread(spreads, new URLSearchParams('tab=relationships'))?.id).toBeUndefined()
    expect(resolveLegacySpread(spreads, new URLSearchParams('q=kaladin'))?.id).toBe('search')
  })

  it('returns nothing when no legacy parameter resolves', () => {
    expect(resolveLegacySpread(spreads, new URLSearchParams(''))).toBeUndefined()
    expect(resolveLegacySpread(spreads, new URLSearchParams('tab=unknown'))).toBeUndefined()
  })

  it('only keeps q on a search spread', () => {
    const search = spreads.find((spread) => spread.view === 'search')!
    const chapter = spreads.find((spread) => spread.id === 'chapter-roshar')!
    expect(canonicalSpreadParams(search, '  kaladin  ').toString()).toBe('spread=search&q=kaladin')
    expect(canonicalSpreadParams(chapter, 'kaladin').toString()).toBe('spread=chapter-roshar')
    expect(canonicalSpreadParams(chapter, '   ').toString()).toBe('spread=chapter-roshar')
  })
})
