/**
 * ArchiveDoors — the four ways into the archive, as open books on a workbench.
 *
 * ## What this replaces
 *
 * Four cards with a border, a shadow, and a hover lift: a website's grid in a
 * library's costume. The numbers were right; the presentation was a product page.
 *
 * ## What a workbench is
 *
 * A wooden surface with four open books on it, each opened to its first page.
 * The left page carries the title and the gliph; the right page carries the
 * counts and a one-line description. A reader standing over the table sees
 * four books and chooses one. There is no "door" and no "card": there is a
 * book, opened, waiting.
 *
 * Every number is counted from the data at render time, as before.
 */
import { Link } from 'react-router-dom'
import { BOOKS, SAGAS, ALL_CHARACTERS, PLANETS } from '@/data/static'
import { TIMELINE_EVENTS, ERAS } from '@/data/static/timeline'
import { buildEntityCatalog } from '@/components/shadesmar/entity-catalog'
import { CLUSTERS } from '@/components/shadesmar/types'
import { CORE_DESTINATIONS } from '@/navigation'

export const ARCHIVE_COUNTS = {
  volumes: BOOKS.length,
  series: SAGAS.length,
  records: ALL_CHARACTERS.length,
  worlds: PLANETS.length,
  souls: buildEntityCatalog().length,
  realms: CLUSTERS.length,
  events: TIMELINE_EVENTS.length,
  eras: ERAS.length,
} as const

interface DoorStat {
  value: number
  label: string
}

const STATS: Record<string, DoorStat[]> = {
  library: [
    { value: ARCHIVE_COUNTS.volumes, label: 'volumes' },
    { value: ARCHIVE_COUNTS.series, label: 'series' },
  ],
  records: [
    { value: ARCHIVE_COUNTS.records, label: 'records' },
    { value: ARCHIVE_COUNTS.worlds, label: 'worlds' },
  ],
  shadesmar: [
    { value: ARCHIVE_COUNTS.souls, label: 'souls' },
    { value: ARCHIVE_COUNTS.realms, label: 'realms' },
  ],
  diagram: [
    { value: ARCHIVE_COUNTS.events, label: 'events' },
    { value: ARCHIVE_COUNTS.eras, label: 'eras' },
  ],
}

const ROTATIONS = [-1.2, 0.8, -0.6, 1.4]

export default function ArchiveDoors() {
  return (
    <ul aria-label="Core sections" className="grid w-full grid-cols-1 gap-xl sm:grid-cols-2">
      {CORE_DESTINATIONS.map((dest, i) => {
        const stats = STATS[dest.id] ?? []
        const rot = ROTATIONS[i] ?? 0
        return (
          <li key={dest.id} className="min-w-0" style={{ transform: `rotate(${rot}deg)` }}>
            <Link
              to={dest.to}
              className={[
                'group block no-underline',
                'transition-transform duration-[var(--dur-slow)] ease-[var(--ease-standard)]',
                'hover:-translate-y-1',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              ].join(' ')}
            >
              {/* The open book. */}
              <div
                className="relative flex overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #3a2414 0%, #2a180c 100%)',
                  border: '1px solid #5a3e1e',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.4)',
                  minHeight: 260,
                }}
              >
                {/* Spine (the binding). */}
                <div
                  aria-hidden
                  className="w-4 shrink-0"
                  style={{
                    background: 'linear-gradient(90deg, #1a0e06 0%, #3a2414 50%, #1a0e06 100%)',
                  }}
                />

                {/* Left page: title + description. */}
                <div
                  className="flex flex-1 flex-col justify-between p-6"
                  style={{
                    background: 'linear-gradient(152deg, #f2e9d4 0%, #eae0c8 40%, #e0d4b6 76%, #d6c8a6 100%)',
                    borderRight: '1px solid rgba(60,40,20,0.25)',
                  }}
                >
                  <div>
                    <h2 className="font-[var(--font-display)] text-[26px] leading-[1.15] text-[#241a12]">
                      {dest.label}
                    </h2>
                    <p className="mt-2 font-[var(--font-display)] text-[14px] italic leading-[1.5] text-[#5a4028]">
                      {dest.description}
                    </p>
                  </div>
                </div>

                {/* Right page: counters. */}
                <div
                  className="flex flex-1 flex-col justify-end gap-4 p-6"
                  style={{
                    background: 'linear-gradient(152deg, #f2e9d4 0%, #eae0c8 40%, #e0d4b6 76%, #d6c8a6 100%)',
                  }}
                >
                  {stats.map((stat) => (
                    <div key={stat.label} className="flex items-baseline gap-3">
                      <span className="font-[var(--font-display)] text-[40px] leading-none text-[#241a12]">
                        {stat.value}
                      </span>
                      <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.15em] text-[#8a6840]">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
