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

export default function LandingPage() {
  useSEOMeta({
    title: 'Cosmere Archive',
    description:
      'An archive of worlds, histories and shattered ideals from the Cosmere. Four records: the Library, the Biographical Records, the Shadesmar, and the Taravangian Diagram.',
  })

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto">
      {/* The workbench. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #2a180c 0%, #1a0e06 50%, #0e0804 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(80,50,24,0.12) 0px, rgba(80,50,24,0.12) 1px, transparent 1px, transparent 8px)',
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col gap-2xl px-[var(--gutter-md)] py-3xl max-md:px-[var(--gutter)] max-md:py-2xl">
        <header className="flex flex-col items-center gap-sm text-center">
          {/* A brass plate, not a heading. */}
          <div
            className="relative px-8 py-3"
            style={{
              background: 'linear-gradient(180deg, #3a2a14 0%, #24180a 100%)',
              border: '1px solid #5a3e1e',
              boxShadow: '0 6px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(190,150,100,0.12)',
            }}
          >
            <h1 className="font-[var(--font-display)] text-h1 tracking-[0.12em] text-[#d8b878] lg:text-display">
              COSMERE ARCHIVE
            </h1>
          </div>
          <p className="max-w-[var(--measure)] font-[var(--font-display)] text-[14px] italic leading-[var(--lh-body)] text-[#8a6840]">
            An archive of worlds, histories and shattered ideals.
          </p>
        </header>

        <ArchiveDoors />

        <HistoricalBand />
      </div>
    </div>
  )
}
