/**
 * /historical — the index of the Historical Archive.
 *
 * ## Diegetic treatment
 *
 * An archive index is not a card grid. It is a cabinet of folders, each
 * labelled in ink on the tab, with a stamp showing whether it has been
 * maintained or left frozen. The reader opens a folder and finds the section
 * inside.
 */
import { Link } from 'react-router-dom'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { HISTORICAL_DESTINATIONS, SECONDARY_DESTINATIONS } from '@/navigation'
import type { Destination } from '@/navigation'

const STATUS: Record<string, { note: string; tone: 'maintained' | 'legacy' }> = {
  chronology: { note: 'Legacy. Rebuilt in M6.', tone: 'legacy' },
  about: { note: 'Maintained.', tone: 'maintained' },
}

export default function HistoricalPage() {
  useSEOMeta({
    title: 'Historical Archive — Cosmere Archive',
    description: 'Preserved sections of the Cosmere Archive: Chronology, Mind Map and About.',
  })

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[var(--surface-void)]">
      {/* The cabinet. */}
      <div
        className="relative flex shrink-0 flex-col items-center gap-2 px-5 pt-5 pb-3"
        style={{
          background: 'linear-gradient(180deg, rgb(8 10 14 / .9) 0%, rgb(8 10 14 / 0) 100%)',
        }}
      >
        <div
          className="relative px-6 py-2"
          style={{
            background: 'linear-gradient(180deg, #3a2a14 0%, #24180a 100%)',
            border: '1px solid #5a3e1e',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(190,150,100,0.12)',
          }}
        >
          <h1 className="font-[var(--font-display)] text-[var(--text-h3)] tracking-[0.04em] text-[#d8b878]">
            Historical Archive
          </h1>
        </div>
        <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[#8a6840]">
          Preserved sections, in their original form
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--gutter-md)] py-2xl max-md:px-[var(--gutter)]">
        <div className="mx-auto max-w-page">
          <FolderSection title="Sections" items={HISTORICAL_DESTINATIONS} />
          <FolderSection title="Elsewhere in the archive" items={SECONDARY_DESTINATIONS} />
        </div>
      </div>
    </div>
  )
}

function FolderSection({ title, items }: { title: string; items: Destination[] }) {
  return (
    <section className="mb-2xl last:mb-0">
      <h2 className="mb-md font-[var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[#8a6840]">{title}</h2>

      <ul className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
        {items.map((dest) => {
          const status = STATUS[dest.id]
          return (
            <li key={dest.id} className="min-w-0">
              <Link
                to={dest.to}
                className={[
                  'group block no-underline',
                  'transition-transform duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
                  'hover:-translate-y-0.5',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                ].join(' ')}
              >
                {/* A folder. */}
                <div
                  className="relative overflow-hidden p-5"
                  style={{
                    background: 'linear-gradient(152deg, #f2e9d4 0%, #eae0c8 40%, #e0d4b6 76%, #d6c8a6 100%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    transform: 'rotate(-0.5deg)',
                  }}
                >
                  {/* Folder tab. */}
                  <div
                    aria-hidden
                    className="absolute -top-2 left-4 h-4 w-24"
                    style={{
                      background: 'linear-gradient(180deg, #e0d4b6 0%, #d6c8a6 100%)',
                      border: '1px solid rgba(60,40,20,0.25)',
                      borderBottom: 'none',
                      borderRadius: '2px 2px 0 0',
                    }}
                  />
                  <span className="font-[var(--font-display)] text-[18px] leading-[1.15] text-[#241a12]">
                    {dest.label}
                  </span>
                  <p className="mt-1 font-[var(--font-display)] text-[12px] italic leading-[1.4] text-[#5a4028]">
                    {dest.description}
                  </p>
                  {status && (
                    <span
                      className="mt-3 inline-block font-[var(--font-mono)] text-[9px] uppercase tracking-[0.15em]"
                      style={{
                        color: status.tone === 'maintained' ? '#3a6a3a' : '#8a6840',
                      }}
                    >
                      {status.note}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
