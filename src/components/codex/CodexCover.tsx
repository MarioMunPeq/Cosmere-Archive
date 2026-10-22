/**
 * CodexCover — umber leather, blind-tooled glyph, brass bosses.
 *
 * The leaf is the ONLY element that carries a rotateY transform. Pages and all
 * reading text stay in flat, untransformed layers (see PageSurface), which is
 * what keeps the type crisp at every zoom level.
 *
 * Opening is a one-way state: once the caller flips to `open` this component is
 * unmounted, so no transformed text is ever left in the tree.
 */

export type CoverPhase = 'closed' | 'opening'

export interface CodexCoverDetails {
  /** Small line above the title, e.g. `Volume I` or `Silverlight edition`. */
  kicker?: string
  title?: string
  subtitle?: string
  byline?: string
  /** Accessible name for the whole-cover button. */
  openLabel?: string
  /** `volume` tightens the plate so two covers can rest side by side. */
  variant?: 'codex' | 'volume'
  testId?: string
}

interface Props {
  phase: CoverPhase
  onSkip: () => void
  details?: CodexCoverDetails
}

const DEFAULT_DETAILS: Required<Omit<CodexCoverDetails, 'variant' | 'testId'>> = {
  kicker: 'Silverlight edition',
  title: 'ARS ARCANUM',
  subtitle: 'Being an account of Investiture',
  byline: 'Khrissalla of Taldain',
  openLabel: 'Open the Ars Arcanum',
}

const SPOKES = Array.from({ length: 16 }, (_, index) => (index * 360) / 16)

function CosmereGlyph() {
  return (
    <svg className="codex-cover__glyph" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <g fill="none" strokeLinecap="round">
        <circle cx="100" cy="100" r="78" stroke="var(--codex-brass-ink)" strokeOpacity="0.5" strokeWidth="1.4" />
        <circle cx="100" cy="100" r="70" stroke="var(--codex-brass-ink)" strokeOpacity="0.28" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="44" stroke="var(--codex-brass-ink)" strokeOpacity="0.52" strokeWidth="1.1" />
        <circle
          cx="100"
          cy="100"
          r="52"
          stroke="var(--codex-brass-ink)"
          strokeOpacity="0.3"
          strokeWidth="0.8"
          strokeDasharray="1.6 6"
        />
        {SPOKES.map((angle) => (
          <g key={angle} transform={`rotate(${angle} 100 100)`}>
            <line
              x1="100"
              y1="52"
              x2="100"
              y2="27"
              stroke="var(--codex-brass-ink)"
              strokeOpacity="0.44"
              strokeWidth="1.2"
            />
            <circle cx="100" cy="21" r="1.7" fill="var(--codex-brass-ink)" fillOpacity="0.5" stroke="none" />
          </g>
        ))}
        <path
          d="M100 74 L124 100 L100 126 L76 100 Z"
          stroke="var(--codex-brass-ink)"
          strokeOpacity="0.62"
          strokeWidth="1.3"
        />
        <path
          d="M100 86 L113 100 L100 114 L87 100 Z"
          stroke="var(--codex-brass-ink)"
          strokeOpacity="0.4"
          strokeWidth="0.9"
        />
        <circle cx="100" cy="100" r="3.4" fill="var(--codex-brass-ink)" fillOpacity="0.7" stroke="none" />
      </g>
    </svg>
  )
}

const BOSSES = ['tl', 'tr', 'bl', 'br'] as const

export default function CodexCover({ phase, onSkip, details }: Props) {
  const d = { ...DEFAULT_DETAILS, ...details }

  return (
    <div
      className="codex-cover"
      data-phase={phase}
      data-variant={d.variant ?? 'codex'}
      data-testid={d.testId ?? 'codex-cover'}
    >
      <div className="codex-cover__leaf" aria-hidden="true">
        <div className="codex-cover__spine" />
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className="codex-cover__band" style={{ top: `${13 + index * 18}%` }} />
        ))}

        <div className="codex-cover__frame" />
        <div className="codex-cover__plate">
          <span className="codex-cover__kicker">{d.kicker}</span>
          <span className="codex-cover__title">{d.title}</span>
          <span className="codex-cover__subtitle">{d.subtitle}</span>
          <span className="codex-cover__byline">{d.byline}</span>
        </div>

        <div className="codex-cover__sigil">
          <CosmereGlyph />
        </div>

        {BOSSES.map((corner) => (
          <span key={corner} className={`codex-cover__boss codex-cover__boss--${corner}`} />
        ))}
      </div>

      <button type="button" className="codex-cover__skip" onClick={onSkip} aria-label={d.openLabel} />
    </div>
  )
}
