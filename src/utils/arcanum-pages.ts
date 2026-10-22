/**
 * Ars Arcanum · URL vocabulary for Volume III.
 *
 * The standalone Ars Arcanum used unprefixed spread ids (`contents`,
 * `chapter-roshar`). Volume III lives in the same bookcase and shares the
 * `?spread=` vocabulary with the other volumes, so its printed spreads carry
 * the `arcanum-` prefix. These helpers keep old bookmarks working when the
 * reader reaches the volume through the desk.
 */

export const ARCANUM_PREFIX = 'arcanum-'
export const ARCANUM_CONTENTS_ID = `${ARCANUM_PREFIX}contents`

/** Add the volume prefix once. Already-prefixed ids pass through untouched. */
export function toArcanumSpreadId(id: string): string {
  return id.startsWith(ARCANUM_PREFIX) ? id : `${ARCANUM_PREFIX}${id}`
}
