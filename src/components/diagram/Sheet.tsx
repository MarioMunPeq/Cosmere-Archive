/**
 * A sheet of paper, nailed to a wall.
 *
 * ## What makes paper read as paper
 *
 * Four things, and the old sheets had none of them:
 *
 *   **An edge.** Torn, not cut. A perfectly straight edge on a cream rectangle
 *   is a card; a slightly ragged one is a page out of a notebook.
 *   **A fastener.** A pin, a tack, or a strip of tape. Something is holding it
 *   to the wall, and that is the whole difference between "on" and "painted on".
 *   **A shadow.** Cast down and to the right, away from the candle at the left.
 *   **Uneven tone.** Paper that has been handled: warmer where a hand has been,
 *   a faint stain, a corner turned up.
 *
 * ## The sizes are not all the same
 *
 * A wall where every sheet is identical is a contact sheet. The nine are A-5
 * with a few larger ones — a fold-out chart, a plan — which is what a wall looks
 * like when someone has been working on it for years: some pages matter more
 * than others and got more paper.
 */

import type { MouseEvent, ReactNode } from 'react'

export interface SheetProps {
  id: string
  /** Paper dimensions in wall units. */
  w: number
  h: number
  /** Crooked, in degrees. Clamped by the caller. */
  rotation?: number
  /** `true` for a folded, larger chart. */
  large?: boolean
  label: string
  onClick?: (e: MouseEvent) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onFocus?: () => void
  onBlur?: () => void
  raised?: boolean
  dimmed?: boolean
  children: ReactNode
}

export function Sheet({
  id,
  w,
  h,
  rotation,
  large = false,
  label,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  raised = false,
  dimmed = false,
  children,
}: SheetProps) {
  /*
   * Deterministic from the id.
   *
   * Not `Math.random`, and not a module-level flag either: every sheet on this
   * wall is a place, and a place has to be the same place every time you come
   * back to it.
   */
  const seed = hash(id)
  const pinX = 26 + (seed % 3) * 8
  const stain = (seed >> 3) % 5
  const curl = ((seed >> 5) % 3) - 1

  return (
    <button
      type="button"
      aria-label={label}
      data-diagram-sheet={id}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      className={[
        'group absolute cursor-pointer text-left',
        'focus-visible:outline-none',
        'transition-[filter,opacity] duration-[var(--dur-base)]',
        dimmed ? 'brightness-[0.45] saturate-[0.4]' : '',
      ].join(' ')}
      style={{
        left: 0,
        top: 0,
        width: w,
        height: h,
        transform: `rotate(${rotation ?? 0}deg)`,
        filter: raised
          ? 'drop-shadow(-10px 18px 22px rgba(0,0,0,0.62)) drop-shadow(-2px 4px 6px rgba(0,0,0,0.4))'
          : 'drop-shadow(7px 13px 15px rgba(0,0,0,0.55)) drop-shadow(2px 3px 4px rgba(0,0,0,0.35))',
        transition: 'filter var(--dur-base) ease, transform var(--dur-base) ease',
      }}
    >
      {/* The paper. */}
      <span
        className="absolute inset-0 block overflow-hidden"
        style={{
          background: paperBackground(large),
          // The deckle. Four sides, each a slightly different wobble.
          clipPath: deckle(seed),
          borderRadius: '1px 2px 1px 3px',
        }}
      >
        {/* Ruled lines and a margin, as a notebook page has. */}
        <span aria-hidden className="absolute inset-0 block" style={{ opacity: 0.5 }}>
          {Array.from({ length: 26 }, (_, i) => (
            <span
              key={i}
              className="absolute block"
              style={{
                left: large ? 46 : 34,
                right: 14,
                top: large ? 62 + i * 15 : 44 + i * 12,
                height: 1,
                background: 'rgba(58,86,120,0.16)',
              }}
            />
          ))}
          <span
            className="absolute block"
            style={{
              left: large ? 38 : 28,
              top: 14,
              bottom: 12,
              width: 1,
              background: 'rgba(170,60,50,0.22)',
            }}
          />
        </span>

        {/* Handling: a stain, and a corner that has been turned. */}
        {stain > 0 && (
          <span
            aria-hidden
            className="absolute block"
            style={{
              right: `${6 + stain * 4}%`,
              bottom: `${8 + (stain % 3) * 5}%`,
              width: large ? 190 : 120,
              height: large ? 130 : 84,
              borderRadius: '50%',
              background: 'radial-gradient(closest-side, rgba(150,110,60,0.16), rgba(150,110,60,0))',
              filter: 'blur(2px)',
            }}
          />
        )}
        {curl !== 0 && (
          <span
            aria-hidden
            className="absolute block"
            style={{
              right: -1,
              bottom: -1,
              width: 46,
              height: 46,
              background:
                curl > 0
                  ? 'linear-gradient(315deg, rgba(60,40,22,0.30) 0%, rgba(0,0,0,0) 62%)'
                  : 'linear-gradient(225deg, rgba(60,40,22,0.22) 0%, rgba(0,0,0,0) 62%)',
            }}
          />
        )}

        {/* The content, inset like a written page. */}
        <span
          className="absolute inset-0 block"
          style={{ padding: large ? '18px 26px 22px 46px' : '14px 18px 16px 34px' }}
        >
          {children}
        </span>
      </span>

      {/* The fastener. A brass tack, head at the top centre-left. */}
      <span
        aria-hidden
        className="absolute block rounded-full"
        style={{
          left: pinX,
          top: -5,
          width: 13,
          height: 13,
          background: 'radial-gradient(circle at 34% 30%, #e8cf94 0%, #a8823c 52%, #4a3413 100%)',
          boxShadow: '0 3px 5px rgba(0,0,0,0.62), inset 0 -1px 2px rgba(0,0,0,0.45)',
        }}
      />
      {/* Its shadow on the paper. */}
      <span
        aria-hidden
        className="absolute block rounded-full"
        style={{
          left: pinX + 3,
          top: -1,
          width: 13,
          height: 9,
          background: 'rgba(70,45,20,0.28)',
          filter: 'blur(3px)',
        }}
      />
    </button>
  )
}

/** Cream, warmed and aged. Not white — white paper on a dark wall looks lit. */
function paperBackground(large: boolean): string {
  return large
    ? 'linear-gradient(152deg, #f0e6cf 0%, #e8dcc0 38%, #ded0ae 72%, #d4c49e 100%)'
    : 'linear-gradient(152deg, #f2e9d4 0%, #eae0c8 40%, #e0d4b6 76%, #d6c8a6 100%)'
}

/**
 * A torn edge, per side.
 *
 * Four independent polygons with slightly different displacement, so no two
 * sides line up and the page never reads as a rectangle with a wobble. Returns a
 * `clip-path` polygon; the values are percentages so they scale with the sheet.
 */
function deckle(seed: number): string {
  const j = (n: number) => (((seed >> n) % 7) - 3) / 2 // -1.5 .. 1.5
  const top = `0% ${j(0).toFixed(2)}%, 28% ${(j(1) * 0.6).toFixed(2)}%, 61% ${j(2).toFixed(2)}%, 100% ${(j(3) * 0.7).toFixed(2)}%`
  const right = `100% ${(j(4) * 0.7).toFixed(2)}%, ${(100 + j(5)).toFixed(2)}% 34%, ${(100 + j(6) * 0.6).toFixed(2)}% 68%, 100% ${(100 + j(7) * 0.5).toFixed(2)}%`
  const bottom = `100% ${(100 - j(8) * 0.7).toFixed(2)}%, 66% ${(100 - j(9)).toFixed(2)}%, 33% ${(100 - j(10) * 0.5).toFixed(2)}%, 0% ${(100 - j(11) * 0.8).toFixed(2)}%`
  const left = `0% ${(100 - j(12) * 0.8).toFixed(2)}%, ${j(13).toFixed(2)}% 62%, ${(j(14) * 0.6).toFixed(2)}% 30%, 0% ${(100 - j(15) * 0.6).toFixed(2)}%`
  return `polygon(${top}, ${right}, ${bottom}, ${left})`
}

/** Stable per-id hash. A place is the same place every time. */
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
  return Math.abs(h)
}
