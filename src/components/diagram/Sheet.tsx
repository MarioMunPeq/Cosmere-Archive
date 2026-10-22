/**
 * A sheet of paper, nailed to a wall.
 *
 * ## What makes paper read as paper
 *
 * Four things, and none of them is a border radius:
 *
 *   **An edge.** Torn, not cut. A perfectly straight edge on a cream rectangle
 *   is a card; a slightly ragged one is a page out of a notebook.
 *   **A fastener.** Every sheet hangs from one brass tack at its top centre.
 *   The tack is also where the string is tied, so the wall's thread lands on
 *   something physical instead of floating over the paper.
 *   **A shadow.** Cast to the right, away from the candle at the low left.
 *   **Uneven tone.** Paper that has been handled: warmer where a hand has been,
 *   a faint foxing stain, a corner turned up, tape that has aged.
 *
 * Paper is drawn from the codex tokens — `--surface-page`, `--codex-page-block`,
 * `--codex-foxing`, `--codex-brass*` — so the wall's paper is the same paper as
 * the volume on the desk next door.
 */

import type { MouseEvent, ReactNode } from 'react'

export interface SheetProps {
  id: string
  /** Paper dimensions in wall units. */
  w: number
  h: number
  /** Crooked, in degrees. Clamped by the caller. */
  rotation?: number
  /** `true` for a ledger-sized fold-out. */
  large?: boolean
  label: string
  onClick?: (e: MouseEvent) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onFocus?: () => void
  onBlur?: () => void
  /** Lifted by a few pixels while the pointer is on it or it has focus. */
  raised?: boolean
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
  const stain = (seed >> 3) % 5
  const curl = ((seed >> 5) % 3) - 1
  const taped = (seed >> 7) % 3 === 0

  return (
    <div
      className="group absolute text-left"
      style={{
        left: 0,
        top: 0,
        width: w,
        height: h,
        transform: `rotate(${rotation ?? 0}deg) translateY(${raised ? -4 : 0}px)`,
        filter: raised
          ? 'drop-shadow(2px 16px 20px rgba(4,2,1,0.62)) drop-shadow(0 3px 5px rgba(4,2,1,0.45))'
          : 'drop-shadow(7px 12px 14px rgba(4,2,1,0.55)) drop-shadow(1px 3px 4px rgba(4,2,1,0.4))',
        transition: 'filter var(--dur-base) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
      }}
    >
      {/*
        The paper.
        The whole painted face is decorative to assistive tech: the button's
        `aria-label` is the sheet's name, and the excerpt is a glance, not the
        document. The document is the reader, opened with Enter.
      */}
      <span
        aria-hidden
        className="absolute inset-0 block overflow-hidden"
        style={{
          background: paperBackground(large),
          // The deckle. Four sides, each a slightly different wobble.
          clipPath: deckle(seed),
          borderRadius: '1px 2px 1px 3px',
        }}
      >
        {/* Ruled lines and a margin, as a page written on a board has. */}
        <span aria-hidden className="absolute inset-0 block" style={{ opacity: 0.55 }}>
          {Array.from({ length: large ? 30 : 24 }, (_, i) => (
            <span
              key={i}
              className="absolute block"
              style={{
                left: large ? 44 : 32,
                right: 14,
                top: large ? 58 + i * 13.6 : 42 + i * 10.4,
                height: 1,
                background: 'rgb(36 26 18 / 0.09)',
              }}
            />
          ))}
          <span
            className="absolute block"
            style={{
              left: large ? 34 : 24,
              top: 12,
              bottom: 10,
              width: 1,
              background: 'rgb(140 43 31 / 0.34)',
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
              background: `radial-gradient(closest-side, var(--codex-foxing), transparent)`,
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
                  ? 'linear-gradient(315deg, rgb(60 40 22 / 0.3) 0%, rgb(0 0 0 / 0) 62%)'
                  : 'linear-gradient(225deg, rgb(60 40 22 / 0.22) 0%, rgb(0 0 0 / 0) 62%)',
            }}
          />
        )}

        {/* The content, inset like a written page. */}
        <span
          className="absolute inset-0 block"
          style={{ padding: large ? '18px 24px 20px 44px' : '14px 16px 16px 32px' }}
        >
          {children}
        </span>
      </span>

      {/* Tape on the corners of one sheet in three. Never over the writing. */}
      {taped && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute block"
            style={{
              left: -16,
              top: 10,
              width: 54,
              height: 20,
              transform: 'rotate(-38deg)',
              background: 'linear-gradient(180deg, rgb(232 214 166 / 0.38), rgb(206 186 138 / 0.28))',
              boxShadow: '0 1px 2px rgb(4 2 1 / 0.35)',
              clipPath: 'polygon(2% 0%, 100% 3%, 98% 100%, 0% 96%)',
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute block"
            style={{
              right: -14,
              bottom: 16,
              width: 50,
              height: 18,
              transform: 'rotate(32deg)',
              background: 'linear-gradient(180deg, rgb(232 214 166 / 0.3), rgb(206 186 138 / 0.22))',
              boxShadow: '0 1px 2px rgb(4 2 1 / 0.3)',
              clipPath: 'polygon(0% 4%, 98% 0%, 100% 97%, 3% 100%)',
            }}
          />
        </>
      )}

      {/* The fastener: one brass tack, top centre. The string ties here. */}
      <span
        aria-hidden
        className="absolute block rounded-full"
        style={{
          left: '50%',
          top: -6,
          width: 14,
          height: 14,
          marginLeft: -7,
          background:
            'radial-gradient(circle at 34% 30%, var(--codex-brass-highlight) 0%, var(--codex-brass) 52%, var(--codex-thread) 100%)',
          boxShadow: '0 3px 5px rgb(4 2 1 / 0.7), inset 0 -1px 2px rgb(0 0 0 / 0.5)',
        }}
      />
      {/* Its shadow on the paper. */}
      <span
        aria-hidden
        className="absolute block rounded-full"
        style={{
          left: '50%',
          marginLeft: -4,
          top: -1,
          width: 14,
          height: 9,
          background: 'rgb(70 45 20 / 0.3)',
          filter: 'blur(3px)',
        }}
      />

      {/*
        The button is the *whole sheet*, laid over the paper rather than wrapped
        around it. A button may not contain headings or a table, and naming one
        by every word of a ledger would read the entire page aloud. This way the
        name is the sheet's name, the visible excerpt is a glance, and the
        document waits in the reader.
      */}
      <button
        type="button"
        aria-label={label}
        data-diagram-sheet={id}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        className="diagram-sheet absolute inset-0 z-20 cursor-pointer rounded-[2px] bg-transparent text-left focus-visible:outline-none"
      />
    </div>
  )
}

/** Cream, warmed and aged. Not white — white paper on a dark wall looks lit. */
function paperBackground(large: boolean): string {
  return large
    ? 'linear-gradient(152deg, var(--surface-page) 0%, var(--codex-page-block) 42%, var(--surface-page-inset) 100%)'
    : 'linear-gradient(152deg, var(--surface-page) 0%, var(--codex-page-block) 55%, var(--surface-page-inset) 100%)'
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
