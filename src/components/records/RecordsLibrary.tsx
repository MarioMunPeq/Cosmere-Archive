/**
 * RecordsLibrary — the desk at the entrance to the Biographical Archives.
 *
 * Three closed volumes rest on the same walnut desk: the records of individual
 * lives, the houses-and-bonds companion, and Khrissalla's survey of Investiture.
 * The reader chooses by touching a cover, which is the most legible navigation
 * we can offer and the only one that needs no explanation. The covers are the
 * real CodexCover, not a card imitation, so the book that opens is visibly the
 * book that was chosen.
 */

import CodexCover, { type CodexCoverDetails } from '@/components/codex/CodexCover'
import CodexObject from '@/components/codex/CodexObject'
import { VOLUME_DETAILS, type ArchiveVolume } from './VolumeSwitcher'

interface Props {
  onOpen: (volume: ArchiveVolume) => void
}

const COVERS: Record<ArchiveVolume, CodexCoverDetails> = {
  records: {
    variant: 'volume',
    testId: 'volume-cover-records',
    kicker: 'Volume I',
    title: 'BIOGRAPHICAL RECORDS',
    subtitle: 'Lives of the Cosmere',
    byline: '93 records · 8 ranges',
    openLabel: 'Open Volume I: Biographical Records — Lives of the Cosmere, 93 records · 8 ranges',
  },
  lineages: {
    variant: 'volume',
    testId: 'volume-cover-lineages',
    kicker: 'Volume II',
    title: 'BLOODLINES',
    subtitle: '& Connections',
    byline: '7 houses · 25 people',
    openLabel: 'Open Volume II: Bloodlines & Connections — 7 houses · 25 people',
  },
  arcanum: {
    variant: 'volume',
    testId: 'volume-cover-arcanum',
    kicker: 'Volume III',
    title: 'ARS ARCANUM',
    subtitle: 'Investiture & Worlds',
    byline: '11 worlds · 20 manifestations',
    openLabel: 'Open Volume III: Ars Arcanum — 11 worlds · 20 manifestations',
  },
}

const COVER_TILT: Record<ArchiveVolume, string> = {
  records: '-rotate-[1.2deg]',
  lineages: 'rotate-[0.4deg]',
  arcanum: 'rotate-[1.2deg]',
}

export default function RecordsLibrary({ onOpen }: Props) {
  return (
    <CodexObject>
      <div
        data-records-library
        className="relative z-[3] flex min-h-0 flex-1 flex-col items-center justify-start gap-[clamp(18px,3.4vh,34px)] overflow-y-auto px-[clamp(16px,4vw,56px)] py-[clamp(22px,4.5vh,52px)] text-center lg:justify-center"
      >
        <header className="max-w-[62ch]">
          <p
            className="text-[11px] uppercase tracking-[0.3em] [font-family:var(--font-ui)]"
            style={{ color: 'var(--codex-brass-ink)', opacity: 0.72 }}
          >
            The Biographical Archives
          </p>
          <h2
            className="mt-2 text-balance text-[clamp(28px,4vw,54px)] font-semibold leading-[1.02] tracking-[0.01em] [font-family:var(--font-display)]"
            style={{ color: 'var(--codex-brass-ink)' }}
          >
            Three volumes rest on the desk
          </h2>
          <p
            className="mx-auto mt-3 max-w-[56ch] text-[13px] italic leading-relaxed [font-family:var(--font-display)]"
            style={{ color: 'rgb(236 217 173 / 0.7)' }}
          >
            Choose a cover. The records follow the name on the plate; the second follows the blood in the veins and the
            bonds recorded between them; the third follows the light of Investiture across the worlds.
          </p>
        </header>

        <div className="flex w-full flex-wrap items-center justify-center gap-[clamp(18px,3.8vw,56px)]">
          {(['records', 'lineages', 'arcanum'] as const).map((volume) => (
            <div key={volume} className="w-[clamp(196px,25vw,324px)]">
              <div
                className={[
                  'records-library-cover group relative aspect-[1.46/1] transition-transform duration-300 ease-out',
                  'hover:-translate-y-2 hover:rotate-0 focus-within:-translate-y-2 focus-within:rotate-0',
                  COVER_TILT[volume],
                ].join(' ')}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-[-6px] bottom-[-8px] top-[6px] rounded-[3px_6px_6px_3px] bg-[var(--codex-page-block)] shadow-[0_14px_26px_-14px_rgb(0_0_0/0.9)]"
                />
                <CodexCover phase="closed" onSkip={() => onOpen(volume)} details={COVERS[volume]} />
              </div>
              <p
                className="mt-4 text-[11px] uppercase tracking-[0.16em] [font-family:var(--font-ui)]"
                style={{ color: 'rgb(236 217 173 / 0.66)' }}
              >
                {VOLUME_DETAILS[volume].meta}
              </p>
            </div>
          ))}
        </div>

        <p
          className="max-w-[54ch] text-[11px] leading-relaxed [font-family:var(--font-ui)]"
          style={{ color: 'rgb(236 217 173 / 0.66)' }}
        >
          Choose a cover to open it. The ribbon remembers where you were reading.
        </p>
      </div>
    </CodexObject>
  )
}
