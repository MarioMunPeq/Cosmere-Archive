/**
 * BookSpine — one volume on a shelf. M3 · block 2.
 *
 * Replaces a 633-line component whose fallback drew "a circle and four
 * ornaments", which is what seventeen of the twenty-two books showed. The cover
 * images existed the whole time, at 46 KB to 883 KB each, and were only used on
 * the book page.
 *
 * ## The layers
 *
 *   1. cloth     four gradients reduced from the old ten (§5.3.2)
 *   2. cover     the real cover, filling the spine, cropped per series
 *   3. scrim     the series ink laid over it. This is what the title is read
 *                against, and the reason the title clears 4.5:1 over a
 *                photograph rather than over a flat colour.
 *   4. type      the title in the series foil, plus the volume number
 *
 * ## On colour
 *
 * An earlier pass treated the cover as patina: desaturated, luminosity-blended,
 * at 26%. The reasoning was that the cover's own lettering would compete with
 * the title. The result was twenty-two grey spines, which threw away the only
 * thing the covers contribute — the Stormlight blue against the Mistborn red,
 * which tells you which world a book is in before you can read a word of it.
 *
 * So the colour now comes from the image itself at full strength, with the ink
 * scrim doing the work of holding the title down. The scrim is a *dark version
 * of the series colour*, so what comes through it is still that colour, dimmed —
 * the same way a book looks on a shelf under a warm lamp rather than in a
 * lightbox.
 *
 * ## The organic part, which is what makes a shelf read as a shelf
 *
 *   - every book leans by a small deterministic angle and sits at a slightly
 *     different height, so the row is not a picket fence. The variation is
 *     seeded from the book id, so it is stable across renders and reloads.
 *   - on hover the book lifts, leans towards the reader, and its immediate
 *     neighbours ease apart — the way a hand takes a book out of a run.
 */

import { memo } from 'react'
import type { CSSProperties } from 'react'
import { spineMaterial } from '@/navigation'
import type { SpineMaterial } from '@/navigation'
import type { Book } from '@/types'

interface Props {
  book: Book
  seriesLabel: string
  /** Position within its series, for the aria-label. */
  index: number
  total: number
  width: number
  height: number
  /** Set when this book is the one being pointed at. */
  active: boolean
  onOpen: (book: Book) => void
  onFocusBook: (book: Book) => void
  onBlurBook: () => void
  /** Arrow keys, Home and End within the run. Handled by the shelf. */
  onKeyDown: (e: React.KeyboardEvent) => void
  registerRef: (el: HTMLButtonElement | null) => void
}

/**
 * Deterministic per-book variation.
 *
 * `Math.random()` in a render is both wrong and visibly wrong: it would give a
 * different lean on every re-render. A hash of the id gives a stable one that
 * looks hand-placed.
 */
function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

/** Four gradients: base cloth, curvature, grain, edge. Section 5.3.2. */
function material(m: SpineMaterial): CSSProperties {
  return {
    backgroundImage: [
      // curvature — the light that says "round"
      'linear-gradient(90deg, rgb(0 0 0 / .60) 0%, rgb(0 0 0 / 0) 15%, rgb(255 255 255 / .06) 30%, rgb(0 0 0 / 0) 54%, rgb(255 255 255 / .02) 74%, rgb(0 0 0 / .52) 100%)',
      // grain — cloth weave
      'repeating-linear-gradient(88deg, rgb(255 255 255 / .016) 0 .5px, rgb(0 0 0 / .016) .5px 1px)',
      // base cloth
      `linear-gradient(180deg, color-mix(in srgb, ${m.ink} 82%, #000) 0%, ${m.ink} 42%, color-mix(in srgb, ${m.ink} 88%, #000) 100%)`,
    ].join(','),
  }
}

/**
 * Cover URLs.
 *
 * `<picture>` rather than a background-image so the browser can choose AVIF,
 * which is about 35% smaller than the WebP at the same quality.
 */
function coverSrc(base: string, id: string) {
  return {
    avif: `${base}images/covers/${id}.avif`,
    webp: `${base}images/covers/${id}.webp`,
  }
}

function BookSpineImpl({
  book,
  seriesLabel,
  index,
  total,
  width,
  height,
  active,
  onOpen,
  onFocusBook,
  onBlurBook,
  onKeyDown,
  registerRef,
}: Props) {
  const m = spineMaterial(book.saga)
  const lean = (hash(book.id) - 0.5) * 1.2 // ±0.6deg
  const settle = (hash(`${book.id}:y`) - 0.5) * 4 // ±2px
  const lift = active ? -11 : 0

  const { avif, webp } = coverSrc(import.meta.env.BASE_URL, book.id)

  const label = `${book.title} — ${seriesLabel}, volume ${index + 1} of ${total}`

  const titleSize = Math.max(11, Math.min(17, width * 0.155))

  return (
    <button
      ref={registerRef}
      type="button"
      onClick={() => onOpen(book)}
      onFocus={() => onFocusBook(book)}
      onBlur={onBlurBook}
      onKeyDown={onKeyDown}
      onMouseEnter={() => onFocusBook(book)}
      onMouseLeave={onBlurBook}
      aria-label={label}
      title={label}
      data-book-id={book.id}
      data-series={book.saga}
      data-active={active}
      className={[
        'group relative shrink-0 cursor-pointer overflow-hidden rounded-[2px]',
        'transition-[transform,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
        'focus-visible:z-20 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
      ].join(' ')}
      style={{
        width,
        // A few pixels taller than the nominal height so the head and tail read.
        height: height + 6,
        transform: `translate3d(0, ${settle + lift}px, 0) rotate(${active ? lean * 2.4 : lean}deg)`,
        boxShadow: active
          ? '0 14px 26px -8px rgb(0 0 0 / .8), inset 0 1px 0 rgb(255 255 255 / .08)'
          : '0 4px 9px -4px rgb(0 0 0 / .6), inset 0 1px 0 rgb(255 255 255 / .05)',
        zIndex: active ? 10 : 1,
      }}
    >
      {/* 1. cloth */}
      <span aria-hidden className="absolute inset-0" style={material(m)} />

      {/* 2. the cover, filling the spine.
          `loading="lazy"`: twenty-two covers is 1.45 MB, and on a 900px screen
          at most a dozen are ever on screen. Without it the library route
          fetches the whole shelf before it can paint the top of it. */}
      <picture>
        <source srcSet={avif} type="image/avif" />
        <img
          src={webp}
          alt=""
          aria-hidden
          draggable={false}
          loading="lazy"
          decoding="async"
          data-cover
          className="absolute inset-0 h-full w-full select-none object-cover"
          style={{
            // `object-position`, not `background-position`: the plan's per-series
            // crop was written for a `background-image`, and on an <img> with
            // object-fit it silently does nothing.
            objectPosition: m.crop,
            // Well over 1, so the spine shows a *band* of the jacket rather than
            // the whole jacket squeezed into 92px.
            /*
             * `scale` alone does not move the window. `object-position` is
             * resolved on the unscaled box and then the whole thing is zoomed
             * about its centre, so the two do not compose the way they read.
             * A `translateY` on top of the scale does move it — and was tried —
             * but it slid the window onto the publisher's band at the top of
             * the jacket, which is worse than what it replaced. The crop is
             * left to `object-position` alone.
             */
            transform: 'scale(2)',
            opacity: 1,
          }}
        />
      </picture>

      {/* 3. the scrim: the series ink, which is what the title is read against */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(180deg,
            color-mix(in srgb, ${m.ink} ${Math.round(m.scrimTop * 100)}%, transparent) 0%,
            color-mix(in srgb, ${m.ink} ${Math.round(((m.scrimTop + m.scrimBottom) / 2) * 100)}%, transparent) 44%,
            color-mix(in srgb, ${m.ink} ${Math.round(m.scrimBottom * 100)}%, transparent) 100%)`,
        }}
      />
      {/* A soft band behind the title only. The scrim holds the whole spine
          down; this holds just the title down, so the artwork above and below
          it stays at full colour while the words stay crisp. Feathered at both
          edges so there is no visible band, just a place where the light dips. */}
      <span
        aria-hidden
        className="absolute inset-x-0"
        style={{
          top: Math.round(height * 0.2),
          bottom: Math.round(height * 0.16),
          backgroundImage: `linear-gradient(180deg,
            transparent 0%,
            color-mix(in srgb, ${m.ink} 30%, transparent) 18%,
            color-mix(in srgb, ${m.ink} 62%, transparent) 50%,
            color-mix(in srgb, ${m.ink} 30%, transparent) 82%,
            transparent 100%)`,
        }}
      />
      {/* The curved edge of a round spine, over the image. */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgb(0 0 0 / .58) 0%, rgb(0 0 0 / 0) 16%, rgb(255 255 255 / .07) 31%, rgb(0 0 0 / 0) 56%, rgb(255 255 255 / .02) 76%, rgb(0 0 0 / .5) 100%)',
        }}
      />

      {/* head cap */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[8px]"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${m.foil} 30%, transparent), transparent)`,
        }}
      />
      {/* The stamped volume number, drawn by `.spine-volume` in index.css.
          Generated content rather than a text node: see the note there. */}
      <span
        aria-hidden
        className="spine-volume"
        data-volume={index + 1}
        style={{ color: m.foil, ['--spine-volume-size' as string]: `${Math.max(9, Math.min(12, width * 0.12))}px` }}
      />

      {/* 4. the title */}
      <span
        aria-hidden
        data-spine-title
        className={[
          'absolute inset-x-0 flex flex-col items-center',
          'px-[5px] text-center font-[var(--font-display)] leading-[1.12]',
        ].join(' ')}
        style={{
          top: Math.round(height * 0.2),
          bottom: Math.round(height * 0.16),
          overflow: 'hidden',
          justifyContent: 'center',
          color: m.foil,
          fontSize: titleSize,
          // A two-sided shadow: a tight one for legibility against the image and
          // a soft one for the sense that the letters are stamped into the cloth.
          textShadow: '0 1px 2px rgb(0 0 0 / .9), 0 2px 10px rgb(0 0 0 / .55)',
          hyphens: 'auto',
          overflowWrap: 'break-word',
        }}
      >
        {book.title}
      </span>

      {/* tail: the board the pages are bound into */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[9px]"
        style={{
          background: `linear-gradient(0deg, color-mix(in srgb, ${m.ink} 60%, #000), ${m.ink})`,
        }}
      />
      {/* fore-edge highlight, so the spine reads as round */}
      <span aria-hidden className="absolute inset-y-0 right-0 w-px" style={{ background: 'rgb(255 255 255 / .08)' }} />
      <span aria-hidden className="absolute inset-y-0 left-0 w-px" style={{ background: 'rgb(0 0 0 / .45)' }} />
    </button>
  )
}

export default memo(BookSpineImpl)
