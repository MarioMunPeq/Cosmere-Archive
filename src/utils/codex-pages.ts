/**
 * Codex pagination and URL vocabulary.
 *
 * The book is modelled as *leaves*, not pages-in-a-array: a chapter opens on a
 * verso (left) with its first manifestation facing it, and the remaining
 * manifestations pair off two at a time. That is why the model groups leaves by
 * section first and pairs within the section second — a chapter never spills
 * onto the same spread as the next one just because the arithmetic happened to
 * line up.
 *
 * Nothing here knows about React. The page supplies leaves and renders them;
 * this module only answers where a leaf sits, what it is called, which printed
 * folio it carries, and which spread a legacy parameter meant.
 */

export type CodexPartId = 'investiture' | 'records' | 'lineages'
export type CodexEdition = 'working' | 'printed' | 'restricted'

export interface CodexLeaf {
  /** Stable, URL-safe. The left leaf of a spread lends it its id. */
  id: string
  /** Running title for the live region and the spread landmark. */
  title: string
  /** Front matter is numbered i, ii; the body restarts at 1. */
  frontMatter?: boolean
  /** A deliberately empty page. It keeps its place in the numbering. */
  blank?: boolean
  chapterId?: string
  systemIds?: readonly string[]
  characterIds?: readonly string[]
  familyIds?: readonly string[]
  /** Semantic bucket used by legacy params (`tab`, `q`). */
  view?: string
}

export interface CodexSection {
  leaves: readonly CodexLeaf[]
}

export interface CodexSpread {
  id: string
  /** 1-based position in the part. */
  number: number
  title: string
  chapterId?: string
  view?: string
  systemIds: string[]
  characterIds: string[]
  familyIds: string[]
  leftId: string | null
  rightId: string | null
  /** Printed folios, roman for front matter and arabic for the body. */
  folios: readonly [string | null, string | null]
  /** Physical page numbers, before the front-matter offset. */
  pageNumbers: readonly [number, number]
}

const ROMAN_TABLE: readonly (readonly [number, string])[] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

export function toRoman(value: number): string {
  if (!Number.isInteger(value) || value <= 0 || value >= 4000) return String(value)
  let remaining = value
  let out = ''
  for (const [amount, glyph] of ROMAN_TABLE) {
    while (remaining >= amount) {
      out += glyph
      remaining -= amount
    }
  }
  return out
}

/** Chunk any list into pages. Kept generic for the record spreads in part II. */
export function paginate<T>(items: readonly T[], perPage = 2): T[][] {
  if (!Number.isInteger(perPage) || perPage < 1) {
    throw new RangeError('perPage must be a positive integer')
  }
  const pages: T[][] = []
  for (let index = 0; index < items.length; index += perPage) {
    pages.push(items.slice(index, index + perPage))
  }
  return pages
}

/**
 * Printed folio for a physical page. Front matter uses roman numerals, the
 * body restarts at 1 after it. A blank leaf is still a page in the count.
 */
export function folio(page: number, frontMatterPages = 0): string {
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError('page must be a positive integer')
  }
  const front = Math.max(0, Math.floor(frontMatterPages))
  return page <= front ? toRoman(page).toLowerCase() : String(page - front)
}

function leadingFrontMatter(sections: readonly CodexSection[]): number {
  let count = 0
  for (const section of sections) {
    for (const leaf of section.leaves) {
      if (!leaf.frontMatter) return count
      count += 1
    }
  }
  return count
}

function unique(values: readonly (string | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
}

/**
 * Build the ordered spreads. Sections are paired independently so a chapter
 * always opens on a fresh spread; an odd number of leaves leaves the last
 * recto empty, exactly as a printed chapter does.
 */
export function buildSpreads(sections: readonly CodexSection[]): CodexSpread[] {
  const frontMatterPages = leadingFrontMatter(sections)
  const spreads: CodexSpread[] = []
  let page = 1

  for (const section of sections) {
    for (const pair of paginate(section.leaves, 2)) {
      const left = pair[0] ?? null
      const right = pair[1] ?? null
      const pageNumbers: [number, number] = [page, page + 1]
      const leftFolio = left && !left.blank ? folio(pageNumbers[0], frontMatterPages) : null
      const rightFolio = right && !right.blank ? folio(pageNumbers[1], frontMatterPages) : null

      const id =
        (left && !left.blank ? left.id : undefined) ??
        (right && !right.blank ? right.id : undefined) ??
        `spread-${spreads.length + 1}`

      spreads.push({
        id,
        number: spreads.length + 1,
        title: left?.title ?? right?.title ?? 'Blank',
        chapterId: left?.chapterId ?? right?.chapterId,
        view: left?.view ?? right?.view,
        systemIds: unique([...(left?.systemIds ?? []), ...(right?.systemIds ?? [])]),
        characterIds: unique([...(left?.characterIds ?? []), ...(right?.characterIds ?? [])]),
        familyIds: unique([...(left?.familyIds ?? []), ...(right?.familyIds ?? [])]),
        leftId: left?.id ?? null,
        rightId: right?.id ?? null,
        folios: [leftFolio, rightFolio],
        pageNumbers,
      })

      page += 2
    }
  }

  return spreads
}

export function spreadIndexById(spreads: readonly CodexSpread[], id: string): number {
  return spreads.findIndex((spread) => spread.id === id)
}

export function findSpreadForSystem(spreads: readonly CodexSpread[], systemId: string): CodexSpread | undefined {
  return spreads.find((spread) => spread.systemIds.includes(systemId))
}

const LEGACY_TAB_VIEWS: Readonly<Record<string, string>> = {
  toc: 'contents',
  contents: 'contents',
  index: 'index',
  magic: 'investiture',
  investiture: 'investiture',
  records: 'records',
  characters: 'records',
  bloodlines: 'bloodlines',
  family: 'bloodlines',
  trees: 'bloodlines',
  connections: 'connections',
  relationships: 'connections',
  search: 'search',
}

/**
 * Resolve the old query vocabulary to a spread. The caller rewrites the URL
 * afterwards; nothing here mutates history.
 *
 * Precedence is deliberate: an explicit canonical id wins, then the most
 * specific record (system, character, family), then a section tab, then a bare
 * search. `q` only points at a search spread when one exists.
 */
export function resolveLegacySpread(spreads: readonly CodexSpread[], params: URLSearchParams): CodexSpread | undefined {
  const direct = params.get('spread')
  if (direct) {
    const found = spreads.find((spread) => spread.id === direct)
    if (found) return found
  }

  const system = params.get('system')
  if (system) {
    const found = findSpreadForSystem(spreads, system)
    if (found) return found
  }

  const character = params.get('character')
  if (character) {
    const found = spreads.find((spread) => spread.characterIds.includes(character))
    if (found) return found
  }

  const family = params.get('family')
  if (family) {
    const found = spreads.find((spread) => spread.familyIds.includes(family))
    if (found) return found
  }

  const tab = params.get('tab')
  if (tab) {
    const view = LEGACY_TAB_VIEWS[tab.toLowerCase()]
    if (view) {
      const found = spreads.find((spread) => spread.view === view)
      if (found) return found
    }
  }

  const query = params.get('q')?.trim()
  if (query) {
    const found = spreads.find((spread) => spread.view === 'search')
    if (found) return found
  }

  return undefined
}

/**
 * The only search string the codex writes. `q` survives only on a search
 * spread; everywhere else it would be a dangling filter.
 */
export function canonicalSpreadParams(spread: CodexSpread, query?: string | null): URLSearchParams {
  const params = new URLSearchParams()
  params.set('spread', spread.id)
  const trimmed = query?.trim()
  if (trimmed && spread.view === 'search') params.set('q', trimmed)
  return params
}
