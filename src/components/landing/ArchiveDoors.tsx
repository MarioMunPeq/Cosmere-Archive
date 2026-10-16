/**
 * ArchiveDoors — the four ways into the archive. D-HOME, REBUILD_PLAN §5.2.
 *
 * Replaces a table of contents: ten chapters listed as roman numerals at
 * 1.46:1, each a `<button>` that navigated by hand. Four of those ten are the
 * archive proper and the other six now live under Historical.
 *
 * Two rules this component exists to enforce:
 *
 *  1. Every door is a real `<a href>`. The old chapters were buttons, so none
 *     could be opened in a new tab, middle-clicked, or followed by a crawler.
 *  2. Every number on a door is counted from the data at render time. The plan
 *     quotes "22 / 93 / 103 / 118"; three of those were right and one was not
 *     — the Shadesmar catalog holds 47 souls, not 103. A counter that does not
 *     come from the data will drift, and then it is a lie.
 */

import { Link } from 'react-router-dom'
import { BOOKS, SAGAS, ALL_CHARACTERS, PLANETS } from '@/data/static'
import { TIMELINE_EVENTS, ERAS } from '@/data/static/timeline'
import { buildEntityCatalog } from '@/components/shadesmar/entity-catalog'
import { CLUSTERS } from '@/components/shadesmar/types'
import { CORE_DESTINATIONS } from '@/navigation'
import type { IconName } from '@/navigation'
import DestinationIcon from '@/components/layout/DestinationIcon'

/**
 * The counters, measured rather than typed.
 *
 * Exported so the tests can assert them against the same functions, which means
 * a counter that drifts fails the build instead of quietly going stale.
 */
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

/** Which figures belong to which door, and the words for them. */
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

/** The four doors, in the order §5.2 lists them. */
const DOOR_ICONS: Record<string, IconName> = {
  library: 'book',
  records: 'person',
  shadesmar: 'waves',
  diagram: 'shard',
}

export default function ArchiveDoors() {
  return (
    <ul aria-label="Core sections" className="grid w-full grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4 lg:gap-lg">
      {CORE_DESTINATIONS.map((dest, i) => {
        const stats = STATS[dest.id] ?? []
        return (
          <li key={dest.id} className="min-w-0">
            <Link
              to={dest.to}
              className={[
                'group flex h-full flex-col gap-sm rounded-[var(--radius-lg)] p-xl',
                'border border-[var(--border-subtle)] bg-[var(--surface-base)]',
                'shadow-[var(--shadow-1)] no-underline',
                'transition-[border-color,box-shadow,background-color] duration-[var(--dur-slow)] ease-[var(--ease-standard)]',
                'hover:border-[var(--border-interactive)] hover:bg-[var(--surface-raised)] hover:shadow-[var(--shadow-2)]',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              ].join(' ')}
            >
              {/* Staggered entrance, capped at 8 items per the motion tokens. */}
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-inset)] text-[var(--text-accent)]"
                style={{
                  animation: `var(--dur-slow) var(--ease-decelerate) both`,
                  animationDelay: `${Math.min(i, 7) * 40}ms`,
                }}
              >
                <DestinationIcon name={DOOR_ICONS[dest.id] ?? 'shard'} size={24} />
              </span>

              <span className="min-w-0">
                <span className="block font-display text-h3 leading-[var(--lh-heading)] font-[var(--fw-semibold)] text-[var(--text-primary)]">
                  {dest.label}
                </span>
                <span className="mt-1 block text-meta leading-[var(--lh-body)] text-[var(--text-secondary)]">
                  {dest.description}
                </span>
              </span>

              {stats.length > 0 && (
                <span className="mt-auto flex items-baseline gap-md pt-sm">
                  {stats.map((stat) => (
                    <span key={stat.label} className="flex items-baseline gap-1.5">
                      <span className="font-[var(--font-mono)] text-h4 text-[var(--text-accent)] tabular-nums">
                        {stat.value}
                      </span>
                      <span className="text-micro tracking-[var(--ls-caps)] text-[var(--text-tertiary)] uppercase">
                        {stat.label}
                      </span>
                    </span>
                  ))}
                </span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
