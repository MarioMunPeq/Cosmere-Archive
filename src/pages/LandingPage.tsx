/**
 * / — the landing page. D-HOME, REBUILD_PLAN §5.2.
 *
 * Replaces Manuscript.tsx: a single sheet of paper listing ten chapters as
 * roman numerals at 1.46:1, each a `<button>` that navigated by hand. Ten
 * equal-weight entries for an archive that is really four pieces plus an
 * archive of leftovers.
 *
 * The structure is now the one §5.2 describes: four doors with real counters,
 * and beneath them a quieter band for the historical sections.
 */

import { useSEOMeta } from '@/hooks/useSEOMeta'
import ArchiveDoors from '@/components/landing/ArchiveDoors'
import HistoricalBand from '@/components/landing/HistoricalBand'
import ArchiveDust from '@/components/landing/ArchiveDust'

export default function LandingPage() {
  useSEOMeta({
    title: 'Cosmere Archive',
    description:
      'An archive of worlds, histories and shattered ideals from the Cosmere. Four records: the Library, the Biographical Records, the Shadesmar, and the Taravangian Diagram.',
  })

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto">
      {/* The archive hall: a cold void with one warm pool of light, so the
          doors sit in space rather than on a page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 70% at 50% -10%, rgba(200,169,106,0.07) 0%, transparent 55%), radial-gradient(ellipse 90% 60% at 50% 110%, rgba(90,169,230,0.05) 0%, transparent 60%)',
        }}
      />
      <ArchiveDust />

      <div className="relative z-10 mx-auto flex w-full max-w-[1040px] flex-col gap-2xl px-[var(--gutter-md)] py-3xl max-md:px-[var(--gutter)] max-md:py-2xl">
        <header className="flex flex-col items-center gap-sm text-center">
          <h1
            className={[
              'font-display font-[var(--fw-semibold)] tracking-[var(--ls-wordmark)]',
              'text-h1 lg:text-display',
              'leading-[var(--lh-display)] text-[var(--text-primary)]',
            ].join(' ')}
            style={{ wordSpacing: '0.18em' }}
          >
            COSMERE ARCHIVE
          </h1>
          <p className="max-w-[var(--measure)] text-lead leading-[var(--lh-body)] text-[var(--text-secondary)]">
            An archive of worlds, histories and shattered ideals.
          </p>
        </header>

        <ArchiveDoors />

        <HistoricalBand />
      </div>
    </div>
  )
}
