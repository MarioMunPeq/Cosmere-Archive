/**
 * HistoricalBand — the quiet strip of archived sections. D-HOME, §5.2.
 *
 * Deliberately lower contrast than the four doors. These are the sections the
 * archive keeps but does not lead with, and making them shout would undo the
 * distinction that §5.1 draws between the core pieces and everything else.
 *
 * Links to /historical rather than straight to each section: D-HIST says one
 * index route, not five loose ones, and a reader who lands here without
 * context deserves the index.
 */

import { Link } from 'react-router-dom'
import { HISTORICAL_DESTINATIONS } from '@/navigation'

export default function HistoricalBand() {
  return (
    <nav
      aria-labelledby="historical-band-title"
      className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-base)] px-lg py-md"
    >
      <div className="flex flex-col items-start gap-sm sm:flex-row sm:items-center sm:gap-lg">
        <h2
          id="historical-band-title"
          className="shrink-0 text-nano tracking-[var(--ls-caps-wide)] text-[var(--text-tertiary)] uppercase"
        >
          Archived
        </h2>

        <ul className="flex flex-wrap items-center gap-x-md gap-y-xs">
          {HISTORICAL_DESTINATIONS.map((dest) => (
            <li key={dest.id}>
              <Link
                to={dest.to}
                className={[
                  'inline-flex min-h-[var(--target-min)] items-center rounded-[var(--radius-sm)]',
                  'text-ui text-[var(--text-secondary)]',
                  'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
                  'hover:text-[var(--text-primary)]',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                ].join(' ')}
              >
                {dest.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/historical"
          className="shrink-0 rounded-[var(--radius-sm)] text-meta text-[var(--text-tertiary)] underline decoration-[var(--border-interactive)] underline-offset-4 transition-colors hover:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] sm:ml-auto"
        >
          Index
        </Link>
      </div>
    </nav>
  )
}
