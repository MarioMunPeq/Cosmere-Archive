/**
 * Icon — the one place an SVG glyph is sized, coloured and aligned.
 *
 * Every icon in the archive is drawn on a 24×24 grid with a 1.6px stroke and
 * round caps, so a set icon beside a 14px label still reads at the same weight.
 * Passing the glyph through a component is what keeps that promise; inlining SVGs
 * per usage is how they drift apart.
 *
 * Icons are decorative by default (`aria-hidden`). A glyph that carries meaning
 * on its own — an unlabelled close button — must pass a `title`, which turns it
 * into an `img` with an accessible name.
 */

import type { ReactNode, SVGProps } from 'react'

export const ICON_VIEWBOX = '0 0 24 24'

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'name'> {
  children: ReactNode
  /** Accessible name. Omit for decorative glyphs. */
  title?: string
  /** Rendered size in px. Defaults to 20, which sits against --text-ui. */
  size?: number
  /**
   * `currentColor` inherits the surrounding text colour, which is what every
   * icon in the shell should do so it follows tone and hover states.
   */
  color?: string
  strokeWidth?: number
}

export default function Icon({
  children,
  title,
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.6,
  ...rest
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={ICON_VIEWBOX}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      style={{ flexShrink: 0, display: 'block' }}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

/* ── The set ─────────────────────────────────────────────────────────────────
   Kept here rather than in components/common/icons.tsx so that the whole
   primitive set is self-contained. components/common/icons.tsx keeps its
   existing exports until its call sites are migrated in M2.
   -------------------------------------------------------------------------- */

export function SearchGlyph() {
  return (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  )
}

export function CloseGlyph() {
  return (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  )
}

export function ChevronDownGlyph() {
  return <path d="M6 9.5l6 6 6-6" />
}

export function ChevronRightGlyph() {
  return <path d="M9.5 6l6 6-6 6" />
}

export function ArrowUpGlyph() {
  return (
    <>
      <path d="M12 19V5" />
      <path d="M5.5 11.5L12 5l6.5 6.5" />
    </>
  )
}

export function MenuGlyph() {
  return (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  )
}

export function ClockGlyph() {
  return (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  )
}

/**
 * The result-category marks. They share a 24×24 box and differ only in the
 * inner figure, so a result list reads as a single column instead of a mix of
 * unrelated glyphs.
 */
export function PlanetGlyph() {
  return (
    <>
      <circle cx="12" cy="12" r="6" />
      <ellipse cx="12" cy="12" rx="10.5" ry="3.6" transform="rotate(-18 12 12)" />
    </>
  )
}

export function PersonGlyph() {
  return (
    <>
      <circle cx="12" cy="9" r="3.4" />
      <path d="M5.5 20c0-3.6 2.9-5.5 6.5-5.5s6.5 1.9 6.5 5.5" />
    </>
  )
}

export function BookGlyph() {
  return (
    <>
      <path d="M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 0-3 3z" />
      <path d="M17 7.5h2v12H8" />
    </>
  )
}

export function EventGlyph() {
  return (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5.4l3.4 2" />
    </>
  )
}

export function MagicGlyph() {
  return (
    <>
      <path d="M12 3l1.9 5.4L19 10l-5.1 1.6L12 17l-1.9-5.4L5 10l5.1-1.6z" />
      <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </>
  )
}

export function HeraldGlyph() {
  return (
    <>
      <path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z" />
      <path d="M12 8.5v6M9.5 11.5h5" />
    </>
  )
}

export function ShardGlyph() {
  return (
    <>
      <path d="M12 3l6 5.5-2.2 11h-7.6L6 8.5z" />
      <path d="M12 3v16.5" />
    </>
  )
}

/** Result category → glyph. Search uses this instead of its own per-type JSX. */
export const RESULT_GLYPHS: Record<string, () => ReactNode> = {
  planet: PlanetGlyph,
  character: PersonGlyph,
  worldhopper: PersonGlyph,
  book: BookGlyph,
  event: EventGlyph,
  magic: MagicGlyph,
  herald: HeraldGlyph,
  shard: ShardGlyph,
}
