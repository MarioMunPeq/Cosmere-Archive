/**
 * The navigation registry — the single source of truth for where you can go.
 *
 * Before this file there were four independent lists of destinations:
 *
 *   Layout.NAV_SHORTCUTS    11 entries
 *   ParchmentMenu.DRAWER_LINKS  10
 *   landing/Manuscript.CHAPTERS  10
 *   CommandPalette.PAGE_COMMANDS  13
 *
 * and they did not agree. The landing page had no `/books`; the drawer had no
 * Connections; the palette called `/celestial-charts` "home". Nothing could be
 * added without editing four files and hoping they stayed in sync.
 *
 * Everything that navigates now reads this: the bar, the bottom bar, the
 * Historical dropdown, the search results, the command palette and the landing
 * page. Adding a destination is a one-line change here.
 *
 * The three groups follow REBUILD_PLAN §5.1 (D-NAV), §5.2 (D-HOME) and
 * §5.7 (D-HIST).
 */

/**
 * Named by string rather than by component so this file stays plain data: it
 * is imported by the search-index generator, which runs in Node outside the
 * app. `DestinationIcon` maps these names to glyphs.
 */
export type IconName =
  | 'book'
  | 'person'
  | 'waves'
  | 'shard'
  | 'herald'
  | 'magic'
  | 'event'
  | 'diagram'
  | 'info'
  | 'compare'
  | 'planet'
  | 'search'
  | 'chevron'
  | 'more'
  | 'home'

export interface Destination {
  /** Stable id. Used for tests and for the view-transition name. */
  id: string
  /** Label as shown in the navigation. */
  label: string
  /** One-line description, used by the landing doors and the dropdown. */
  description: string
  /** Route. Always a real path; never a hash. */
  to: string
  /** Glyph. Drawn at 24×24 in the bottom bar. */
  icon: IconName
  /**
   * Short paths that should also mark this destination current, e.g. a
   * character's own page belongs to Records. Without this, /characters/kaladin
   * shows no active navigation item at all.
   */
  matchPrefixes?: string[]
}

/**
 * The four core pieces (D-D1..D-D4). These are the destinations the archive is
 * for, and they are the only ones in the top bar.
 */
export const CORE_DESTINATIONS: Destination[] = [
  {
    id: 'library',
    label: 'Library',
    description: 'The written record of the Cosmere, volume by volume.',
    to: '/library',
    icon: 'book',
  },
  {
    id: 'records',
    label: 'Records',
    description: 'Who lived where, and how they were connected.',
    to: '/characters',
    icon: 'person',
    // The Connections and Bloodlines chapters live inside Records.
    matchPrefixes: ['/characters'],
  },
  {
    id: 'shadesmar',
    label: 'Shadesmar',
    description: 'The ocean of souls that surrounds every world.',
    to: '/shadesmar',
    icon: 'waves',
  },
  {
    id: 'diagram',
    label: 'Taravangian Diagram',
    description: 'The shapes the Thirteenth Shard left behind.',
    to: '/taravangian',
    icon: 'shard',
  },
]

/**
 * Spine material and crop per series — M3 · block 2.
 *
 * Three values decide how a spine looks, and all three are here rather than in
 * the component because they are content decisions, not code:
 *
 *   ink    the colour the cover image is veiled with. This is what guarantees
 *          the spine title clears 4.5:1 *over the photograph*, rather than over
 *          a flat colour. A dark ink over a light cover and a light ink over a
 *          dark one is the whole job.
 *   foil   the title colour on top of the ink.
 *   crop   which part of the cover the spine strip shows. Every cover has its
 *          title in a different place, so the strip is cropped per series to
 *          land on it.
 *
 * `scrim` is how far the ink is laid over the image. It exists because ink
 * alone is not enough: two of the covers are pale across the whole upper third,
 * and a title on those needs a heavier veil to read. The values were calibrated
 * against the rendered spines by sampling real pixels, not estimated — see
 * e2e/library.spec.ts, criterion B.2, which fails if any title drops below
 * 4.5:1.
 */
export interface SpineMaterial {
  /** Veil colour over the cover strip. */
  ink: string
  /** Title colour on the ink. */
  foil: string
  /** `background-position` for the strip, as `X% Y%`. */
  crop: string
  /** Ink opacity at the top of the veil, 0–1. */
  scrimTop: number
  /** Ink opacity at the bottom of the veil, 0–1. */
  scrimBottom: number
}

/**
 * Calibrated against the shipped covers.
 *
 * `crop` is `object-position` for the strip, and it is set low on purpose. A
 * jacket has three bands: the author's name at the top, the title in the
 * middle, the illustration across the lower half. Showing the cover at its own
 * proportions means the spine shows all three, so the spines of a series read
 * as a row of repeated author names — twenty-two spines all saying
 * "ANDER SANDER". Pointing the crop at the artwork instead means each spine
 * shows a different piece of a different picture, which is what a spine has
 * room for and what makes the series legible by colour alone.
 *
 * `scrimBottom` is the value that carries the title: the spine title sits in
 * the lower two thirds, so the bottom of the veil is what decides the ratio.
 * Measured, not estimated — `pnpm shots` samples the rendered pixels, because
 * a stylesheet assertion cannot tell you what a title looks like over a
 * photograph. With the cover blurred, these numbers measure 11.5:1 at worst
 * against a 4.5:1 requirement, which is why the veil can be this light: there
 * is two and a half times the margin, and spending it on colour instead of on
 * caution is the right call. The first version of these values was 0.86 and
 * produced twenty-two grey spines.
 */
export const SPINE_MATERIAL: Record<string, SpineMaterial> = {
  stormlight: { ink: '#0b1418', foil: '#f2e6c4', crop: '50% 82%', scrimTop: 0.5, scrimBottom: 0.74 },
  'mistborn-era-1': { ink: '#1a0d0c', foil: '#f6e2c4', crop: '50% 82%', scrimTop: 0.46, scrimBottom: 0.7 },
  'mistborn-era-2': { ink: '#101318', foil: '#e8eef2', crop: '50% 82%', scrimTop: 0.5, scrimBottom: 0.74 },
  warbreaker: { ink: '#140f0a', foil: '#f6e9cc', crop: '50% 82%', scrimTop: 0.46, scrimBottom: 0.7 },
  elantris: { ink: '#0d1210', foil: '#eaf2e8', crop: '50% 82%', scrimTop: 0.5, scrimBottom: 0.74 },
  'white-sand': { ink: '#14161a', foil: '#f7f3ea', crop: '50% 82%', scrimTop: 0.56, scrimBottom: 0.8 },
  'secret-projects': { ink: '#120d16', foil: '#eee2f4', crop: '50% 82%', scrimTop: 0.46, scrimBottom: 0.68 },
  'arcanum-unbounded': { ink: '#0f1318', foil: '#eaf0f6', crop: '50% 82%', scrimTop: 0.5, scrimBottom: 0.74 },
  tress: { ink: '#08161a', foil: '#dcf2ec', crop: '50% 82%', scrimTop: 0.46, scrimBottom: 0.7 },
  yumi: { ink: '#150c14', foil: '#f5e2ee', crop: '50% 82%', scrimTop: 0.48, scrimBottom: 0.72 },
}

/** Used for any series without an entry, so a new series is never unstyled. */
export const FALLBACK_MATERIAL: SpineMaterial = {
  ink: '#0e1116',
  foil: '#eceae5',
  crop: '50% 82%',
  scrimTop: 0.5,
  scrimBottom: 0.74,
}

export function spineMaterial(seriesId: string): SpineMaterial {
  return SPINE_MATERIAL[seriesId] ?? FALLBACK_MATERIAL
}

/**
 * The Historical Archive (D-HIST). One route with an index, not five loose
 * routes. Each keeps its current implementation; only the container changes.
 */
export const HISTORICAL_DESTINATIONS: Destination[] = [
  {
    id: 'aharietiam',
    label: 'Aharietiam',
    description: 'Ten honorblades, still standing where they were set.',
    to: '/aharietiam',
    icon: 'herald',
  },
  {
    id: 'ars-arcanum',
    label: 'Ars Arcanum',
    description: 'The recorded magic of every shard and world.',
    to: '/magic',
    icon: 'magic',
  },
  {
    id: 'chronology',
    label: 'Chronology',
    description: 'Eleven eras of history, from Adonalsium onward.',
    to: '/chronology',
    icon: 'event',
  },
  {
    id: 'mind-map',
    label: 'Mind Map',
    description: 'How the worlds and people relate across the archive.',
    to: '/mind-map',
    icon: 'diagram',
  },
  {
    id: 'about',
    label: 'About',
    description: 'What this project is, and where its sources are.',
    to: '/about',
    icon: 'info',
  },
]

/**
 * Routes that are real and live but are not one of the four core pieces and do
 * not belong under Historical.
 *
 * `/books` is the standalone volume index; it is absorbed into the Library in
 * M3 and disappears then. `/compare` is the side-by-side character tool and is
 * reached from Records. They are listed here rather than dropped so that no
 * route becomes unreachable when the drawer is retired.
 */
export const SECONDARY_DESTINATIONS: Destination[] = [
  {
    id: 'books',
    label: 'Volumes',
    description: 'Every book, novella and novella series in order.',
    to: '/books',
    icon: 'book',
  },
  {
    id: 'compare',
    label: 'Compare',
    description: 'Put two characters side by side.',
    to: '/compare',
    icon: 'compare',
  },
  {
    id: 'charts',
    label: 'Celestial Charts',
    description: 'Where each world sits, and what shattered it.',
    to: '/celestial-charts',
    icon: 'planet',
  },
]

export const ALL_DESTINATIONS: Destination[] = [
  ...CORE_DESTINATIONS,
  ...HISTORICAL_DESTINATIONS,
  ...SECONDARY_DESTINATIONS,
]

const BY_ID = new Map(ALL_DESTINATIONS.map((d) => [d.id, d]))

export function getDestination(id: string): Destination | undefined {
  return BY_ID.get(id)
}

export function destinationByPath(path: string): Destination | undefined {
  return ALL_DESTINATIONS.find((d) => d.to === path)
}

/**
 * Whether a destination should be marked current for a given pathname.
 *
 * `matchPrefixes` exists because most records are not the index: `/characters?
 * tab=bloodlines` and `/characters/kaladin` are both Records. Matching on the
 * exact path alone left the navigation showing nothing at all on most pages.
 */
export function isDestinationActive(dest: Destination, pathname: string): boolean {
  if (dest.to === pathname) return true
  return (dest.matchPrefixes ?? []).some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

/** The destination that owns a given pathname, if any. */
export function activeDestination(pathname: string): Destination | undefined {
  return ALL_DESTINATIONS.find((d) => isDestinationActive(d, pathname))
}
