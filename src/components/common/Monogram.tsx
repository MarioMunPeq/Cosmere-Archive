/**
 * Monogram — decision D-DATA, REBUILD_PLAN §5.4.4.
 *
 * A character's placeholder when no portrait exists. 24 of the 85 characters
 * have one; for the rest this is the design, not a patch: initials over a
 * radial-gradient well tinted with the colour of the Shard the character is
 * bound to, inside a rectangular antique frame.
 *
 * It never loads anything, so a character with no portrait costs 0 KB and
 * produces 0 errors 404.
 */

import { SHARD_COLORS } from '@/data/static'

interface Props {
  name: string
  /** Planet id, used to pick the Shard accent. Falls back to a neutral ink. */
  planet?: string | null
  size?: number
  isDeceased?: boolean
  className?: string
}

/** Titles carry no information here, so they are dropped before initialising. */
const FIRST_WORD = /^(?:King|Queen|Lord|Lady|Prince|Princess|Highprince|Highprincess|Sir|Dame)\s+/i

/** Up to two letters, per §5.4.4. */
export function initialsOf(name: string): string {
  const stripped = (name ?? '').replace(FIRST_WORD, '').trim()
  const words = stripped.split(/[\s-]+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) {
    const only = words[0]!.replace(/[^a-zA-Z]/g, '')
    return only.slice(0, 2).toUpperCase() || '?'
  }
  const first = words[0]!.replace(/[^a-zA-Z]/g, '').charAt(0)
  const last = words[words.length - 1]!.replace(/[^a-zA-Z]/g, '').charAt(0)
  return ((first || '?') + (last || '')).toUpperCase()
}

export default function Monogram({ name, planet, size = 128, isDeceased, className }: Props) {
  const r = size / 2
  const letters = initialsOf(name)
  const id = `mg-${name.replace(/\W/g, '')}-${size}`
  const well = r - 4

  // Shard accent: the planet's colour when it is one of the ten Shard worlds,
  // otherwise the neutral ink so the monogram still reads as archival.
  const accent = (planet && SHARD_COLORS[planet]) || '#8a7a62'
  const letterSize = letters.length > 1 ? size * 0.26 : size * 0.34

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label={name}
      style={{
        filter: isDeceased ? 'grayscale(0.55) opacity(0.82)' : undefined,
      }}
    >
      <defs>
        <radialGradient id={`${id}-well`} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.04" />
        </radialGradient>
      </defs>

      {/* Frame — three hairlines, as on the paper frames of the archive */}
      <rect x="1.5" y="1.5" width={size - 3} height={size - 3} rx="3" fill="#e8dcc8" />
      <rect x="1.5" y="1.5" width={size - 3} height={size - 3} rx="3" fill={`url(#${id}-well)`} />
      <rect
        x="1.5"
        y="1.5"
        width={size - 3}
        height={size - 3}
        rx="3"
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeOpacity="0.55"
      />
      <rect
        x="5.5"
        y="5.5"
        width={size - 11}
        height={size - 11}
        rx="2"
        fill="none"
        stroke="#c4b08a"
        strokeWidth="0.5"
        strokeOpacity="0.5"
      />

      {/* SpineOrnament at 18 % (§5.4.4) — four corner strokes plus a centre rule */}
      <g stroke={accent} strokeOpacity="0.18" strokeWidth="1" fill="none">
        <path d={`M ${well * 0.28} ${r - well * 0.34} L ${well * 0.5} ${r}`} />
        <path d={`M ${size - well * 0.28} ${r - well * 0.34} L ${size - well * 0.5} ${r}`} />
        <path d={`M ${well * 0.28} ${r + well * 0.34} L ${well * 0.5} ${r}`} />
        <path d={`M ${size - well * 0.28} ${r + well * 0.34} L ${size - well * 0.5} ${r}`} />
      </g>

      {/* Initials */}
      <text
        x={r}
        y={r}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'EB Garamond Variable', Georgia, serif"
        fontSize={letterSize}
        letterSpacing="0.05em"
        fill="#4a3c2a"
        fillOpacity="0.85"
      >
        {letters}
      </text>
    </svg>
  )
}
