/**
 * /404 — the route that catches an unknown hash.
 *
 * This is only half the problem. With HashRouter, the app never sees an unknown
 * *path* because there are no server paths: everything lives in the fragment.
 * What does produce a real 404 is a request for a path that does not exist on
 * GitHub Pages, and that is served by `public/404.html`, not by this component.
 * Both are here so neither half is mistaken for the other.
 */

import { useSEOMeta } from '@/hooks/useSEOMeta'
import PageHeader from '@/components/layout/PageHeader'
import Button from '@/components/primitives/Button'
import EmptyState from '@/components/primitives/EmptyState'
import DestinationIcon from '@/components/layout/DestinationIcon'
import { CORE_DESTINATIONS, HISTORICAL_DESTINATIONS } from '@/navigation'
import { Link } from 'react-router-dom'

export default function NotFound() {
  useSEOMeta({
    title: 'Record not found — Cosmere Archive',
    description: 'That page is not part of the archive.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Silverlight Archives"
        title="Record not found"
        description="No entry under that designation. It may have been filed elsewhere, or never recorded. Search reaches every record in the archive."
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--gutter-md)] py-[var(--spacing-2xl)] max-md:px-[var(--gutter)]">
        <div className="mx-auto flex max-w-[var(--page-max)] flex-col gap-[var(--spacing-2xl)]">
          {/* The way out, before the list of everything else. */}
          <div className="flex flex-wrap items-center gap-[var(--spacing-sm)]">
            <Link to="/">
              <Button variant="primary">Back to the archive</Button>
            </Link>
            <Button variant="secondary" onClick={() => window.history.back()}>
              Go back
            </Button>
            <span className="text-micro text-[var(--text-tertiary)]">
              Or press{' '}
              <kbd className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] px-1.5 py-0.5 font-[var(--font-mono)] text-nano">
                Ctrl
              </kbd>{' '}
              +{' '}
              <kbd className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] px-1.5 py-0.5 font-[var(--font-mono)] text-nano">
                K
              </kbd>{' '}
              to search.
            </span>
          </div>

          <section>
            <h2 className="mb-md text-nano tracking-[var(--ls-caps-wide)] text-[var(--text-tertiary)] uppercase">
              Core sections
            </h2>
            <ul className="grid grid-cols-1 gap-[var(--spacing-sm)] sm:grid-cols-2 lg:grid-cols-4">
              {CORE_DESTINATIONS.map((dest) => (
                <li key={dest.id}>
                  <Link
                    to={dest.to}
                    className="flex min-h-[var(--target-min)] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-base)] px-4 py-3 transition-colors hover:border-[var(--border-interactive)] hover:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                  >
                    <DestinationIcon name={dest.icon} size={20} className="text-[var(--text-accent)]" />
                    <span className="text-ui text-[var(--text-primary)]">{dest.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-md text-nano tracking-[var(--ls-caps-wide)] text-[var(--text-tertiary)] uppercase">
              Archived sections
            </h2>
            <ul className="flex flex-wrap gap-[var(--spacing-xs)]">
              {HISTORICAL_DESTINATIONS.map((dest) => (
                <li key={dest.id}>
                  <Link
                    to={dest.to}
                    className="inline-flex min-h-[var(--target-min)] items-center rounded-[var(--radius-sm)] px-3 text-ui text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                  >
                    {dest.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <EmptyState
            size="sm"
            title="Still looking?"
            description="Characters, worlds, volumes, magic, Heralds and events are all reachable with Ctrl+K."
            action={
              <Link to="/historical">
                <Button variant="secondary">Open the index</Button>
              </Link>
            }
          />
        </div>
      </div>
    </>
  )
}
