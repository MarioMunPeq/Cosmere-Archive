/**
 * shelf-layout — the geometry of a row of books.
 *
 * M3 · block 3. The rule here is that the function never returns a layout that
 * does not fit. The old one did, and the overflow was not a rounding error: it
 * was 192 px, which is exactly the horizontal padding, which is how the bug
 * survived review for as long as it did.
 *
 * Root cause, from the old CosmereLibrary:
 *
 *   availableWidth = containerWidth - 100
 *
 * against a container padded `px-24` (96 on each side = 192) plus two side
 * columns of 84. So the books were laid out in 100px more than the space they
 * had, and the row silently ran off the right edge, taking Dawnshard with it.
 * The number 100 does not correspond to anything on the page.
 *
 * Everything here is derived from one measured width. Nothing is assumed.
 */

/** Widest a spine may be, so a single volume never fills a shelf. */
export const MAX_SPINE = 92
/** Narrowest. Below 24px the title cannot be read (criterion B.5). */
export const MIN_SPINE = 24
/** Space between spines. */
export const GAP = 2

export interface ShelfLayout {
  /** Width of every spine in the row. */
  spineWidth: number
  /** Total width of the row, including gaps. */
  totalWidth: number
  /** Spines that fit on one row. */
  perRow: number
  /** Number of rows. */
  rows: number
  /** Spine height for this width. */
  height: number
}

export interface FitOptions {
  /** The width actually available for spines, measured on the real element. */
  availableWidth: number
  /** How many books the row holds in total. */
  count: number
  /** Base height before scaling. */
  baseHeight: number
}

/**
 * Fits `count` spines into `availableWidth`, and never returns a layout that
 * does not fit.
 *
 * The rule is one sentence: **when there is not enough room, add a row.** Never
 * narrow a spine below MIN_SPINE to avoid a second row, and never drop a book.
 * An earlier version clamped the width after clamping the rows, which at 120px
 * produced 10px spines for twenty-two books — unreadable, and eleven of them
 * still off the edge.
 *
 * Two steps, both provable:
 *
 *   1. How many spines fit at MIN_SPINE? That fixes the row length.
 *   2. Widen them into whatever space is left, up to MAX_SPINE.
 */
export function fitShelf({ availableWidth, count, baseHeight }: FitOptions): ShelfLayout {
  if (count <= 0 || availableWidth <= 0) {
    return { spineWidth: MIN_SPINE, totalWidth: 0, perRow: count, rows: 0, height: baseHeight }
  }

  // Step 1: the row holds as many spines as MIN_SPINE allows.
  const perRow = Math.max(1, Math.min(count, Math.floor((availableWidth + GAP) / (MIN_SPINE + GAP))))
  const rows = Math.ceil(count / perRow)

  // Step 2: widen into the remaining space, never past MAX_SPINE and never
  // past what the row can actually hold.
  const usable = (availableWidth - GAP * (perRow - 1)) / perRow
  const spineWidth = Math.round(Math.min(MAX_SPINE, Math.max(MIN_SPINE, usable)) * 100) / 100

  const widest = Math.min(count, perRow)
  const totalWidth = spineWidth * widest + GAP * (widest - 1)

  return {
    spineWidth,
    totalWidth,
    perRow,
    rows,
    // Height tracks the width so a shelf is never a row of tall thin slivers.
    height: Math.round(baseHeight * (0.78 + 0.22 * Math.min(1, spineWidth / MAX_SPINE))),
  }
}
