/**
 * /historical — the index of the Historical Archive. D-HIST, §5.7.
 *
 * One route with an index, not five loose routes. The five sections keep their
 * current implementations; only the container, the header and the breadcrumb
 * change, which is why each card carries a status note saying whether it is
 * maintained or legacy rather than presenting them as equal citizens.
 *
 * The old routes keep working. Nothing here redirects yet: `/aharietiam`,
 * `/mind-map`, `/magic`, `/chronology` and `/about` are all live and reachable,
 * so moving them would break external links for no gain.
 */

import { Link } from 'react-router-dom'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import PageHeader from '@/components/layout/PageHeader'
import { HISTORICAL_DESTINATIONS, SECONDARY_DESTINATIONS } from '@/navigation'
import type { Destination } from '@/navigation'
import DestinationIcon from '@/components/layout/DestinationIcon'

/**
 * Honest status per section (§5.7 asks for a visible note, "no marketing").
 *
 * `maintained` is rewritten as the rebuild reaches it; `legacy` means the
 * section works and is frozen until its milestone.
 */
const STATUS: Record<string, { note: string; tone: 'maintained' | 'legacy' }> = {
  aharietiam: { note: 'Legacy. Rebuilt in M6.', tone: 'legacy' },
  'ars-arcanum': { note: 'Maintained. Content validated.', tone: 'maintained' },
  chronology: { note: 'Legacy. Rebuilt in M6.', tone: 'legacy' },
  'mind-map': { note: 'Legacy. Rebuilt in M6.', tone: 'legacy' },
  about: { note: 'Maintained.', tone: 'maintained' },
}

export default function HistoricalPage() {
  useSEOMeta({
    title: 'Historical Archive — Cosmere Archive',
    description: 'Preserved sections of the Cosmere Archive: Aharietiam, Ars Arcanum, Chronology, Mind Map and About.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Silverlight Archives"
        title="Historical Archive"
        description="Preserved sections of the archive, kept in their original form. Each one still works; some are frozen until their rebuild."
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--gutter-md)] py-2xl max-md:px-[var(--gutter)]">
        <div className="mx-auto max-w-page">
          <Section title="Sections" items={HISTORICAL_DESTINATIONS} />
          <Section title="Elsewhere in the archive" items={SECONDARY_DESTINATIONS} />
        </div>
      </div>
    </>
  )
}

function Section({ title, items }: { title: string; items: Destination[] }) {
  return (
    <section className="mb-2xl last:mb-0">
      <h2 className="mb-md text-nano tracking-[var(--ls-caps-wide)] text-[var(--text-tertiary)] uppercase">{title}</h2>

      <ul className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
        {items.map((dest) => {
          const status = STATUS[dest.id]
          return (
            <li key={dest.id} className="min-w-0">
              <Link
                to={dest.to}
                className={[
                  'group flex h-full flex-col gap-xs rounded-[var(--radius-lg)] p-lg',
                  'border border-[var(--border-subtle)] bg-[var(--surface-base)]',
                  'transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
                  'hover:border-[var(--border-interactive)] hover:bg-[var(--surface-raised)]',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                ].join(' ')}
              >
                <DestinationIcon name={dest.icon} size={24} className="text-[var(--text-accent)]" />

                <span className="font-display text-h4 font-[var(--fw-semibold)] text-[var(--text-primary)]">
                  {dest.label}
                </span>

                <span className="text-meta leading-[var(--lh-body)] text-[var(--text-secondary)]">
                  {dest.description}
                </span>

                {status && (
                  <span
                    className={[
                      'mt-auto pt-sm text-micro',
                      status.tone === 'maintained' ? 'text-[var(--shard-cultivation)]' : 'text-[var(--text-tertiary)]',
                    ].join(' ')}
                  >
                    {status.note}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
