/**
 * HistoricalBand — the archived sections, as a loose sheet on the workbench.
 */
import { Link } from 'react-router-dom'
import { HISTORICAL_DESTINATIONS } from '@/navigation'

export default function HistoricalBand() {
  return (
    <nav
      aria-labelledby="historical-band-title"
      className="w-full px-5 py-3"
      style={{
        background: 'linear-gradient(152deg, #f2e9d4 0%, #eae0c8 40%, #e0d4b6 76%, #d6c8a6 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transform: 'rotate(-0.5deg)',
      }}
    >
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <h2
          id="historical-band-title"
          className="shrink-0 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[#8a6840]"
        >
          Archived
        </h2>

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {HISTORICAL_DESTINATIONS.map((dest) => (
            <li key={dest.id}>
              <Link
                to={dest.to}
                className="font-[var(--font-display)] text-[13px] text-[#241a12] transition-colors duration-[var(--dur-fast)] hover:text-[#5a3e1e] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                {dest.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/historical"
          className="shrink-0 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.15em] text-[#8a6840] underline-offset-4 hover:underline sm:ml-auto"
        >
          Index
        </Link>
      </div>
    </nav>
  )
}
