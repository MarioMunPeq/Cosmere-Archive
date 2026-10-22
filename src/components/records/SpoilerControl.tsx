/**
 * SpoilerControl — the switch that makes the anti-spoiler system reachable.
 *
 * M4 · block 3. `useSpoilerMode` has existed since M1 with a toggle, a
 * read-books list, a panel flag and "mark all / mark none" — and **nothing
 * rendered it**. The system §5.4 calls "the core of our anti-spoiler system"
 * was unreachable: a hook with no caller, writing to localStorage keys no
 * screen ever read.
 *
 * So this is its first UI, and it is deliberately small: a toggle that says
 * what it does, and a panel that lets a reader declare which books they have
 * read. A record is only unhidden when *every* book it requires has been read,
 * so the panel is not a nicety — without it the toggle hides everything and
 * offers no way back.
 */

import Dialog from '@/components/primitives/Dialog'
import type { useSpoilerMode } from '@/hooks/useSpoilerMode'
import type { Book } from '@/types'

type Spoiler = ReturnType<typeof useSpoilerMode>

interface Props {
  spoiler: Spoiler
  /** Adds the small `Reading log` caption used on the codex desk tab. */
  label?: boolean
}

export default function SpoilerControl({ spoiler, label = false }: Props) {
  const {
    enabled,
    toggle,
    panelOpen,
    setPanelOpen,
    books,
    readBooks,
    toggleBook,
    isBookRead,
    markAllBooks,
    markNoBooks,
  } = spoiler

  const bySaga = books.reduce<Record<string, Book[]>>((acc, b) => {
    ;(acc[b.saga] ??= []).push(b)
    return acc
  }, {})

  return (
    <>
      {label && (
        <span className="records-spoiler__label" aria-hidden="true">
          Reading log
        </span>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        aria-label={enabled ? 'Spoilers on. Turn off spoiler protection' : 'Spoilers off. Turn on spoiler protection'}
        data-spoiler-toggle
        className={[
          'inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2',
          'text-[var(--text-meta)] transition-colors duration-[var(--dur-fast)]',
          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          enabled
            ? 'bg-[var(--surface-raised)] text-[var(--text-accent)]'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]',
        ].join(' ')}
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2.4" />
          {enabled && <path d="M4 20L20 4" strokeLinecap="round" />}
        </svg>
        <span>Spoilers</span>
      </button>

      {enabled && (
        <button
          type="button"
          onClick={() => setPanelOpen(!panelOpen)}
          aria-expanded={panelOpen}
          aria-label={`${readBooks.length} ${readBooks.length === 1 ? 'book' : 'books'} marked as read. ${panelOpen ? 'Close' : 'Open'} the reading log.`}
          data-spoiler-panel-toggle
          className="cursor-pointer whitespace-nowrap rounded-[var(--radius-md)] px-2 py-2 text-[var(--text-micro)] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          Books read · {readBooks.length}
        </button>
      )}

      <Dialog
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="Books you have read"
        description="A record opens once every book it requires is ticked. Nothing is sent anywhere; this lives in your browser."
      >
        <div className="flex flex-wrap items-center gap-2 pb-md">
          <button
            type="button"
            onClick={() => markAllBooks(books.map((b) => b.id))}
            className="cursor-pointer rounded-[var(--radius-md)] border border-[var(--border-interactive)] px-3 py-2 text-[var(--text-micro)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            Mark all {books.length}
          </button>
          <button
            type="button"
            onClick={() => markNoBooks()}
            className="cursor-pointer rounded-[var(--radius-md)] border border-[var(--border-interactive)] px-3 py-2 text-[var(--text-micro)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            Clear
          </button>
        </div>

        <div className="max-h-[50vh] space-y-lg overflow-y-auto">
          {Object.entries(bySaga).map(([saga, list]) => (
            <fieldset key={saga}>
              <legend className="pb-sm text-[var(--text-micro)] uppercase tracking-[var(--ls-caps-wide)] text-[var(--text-tertiary)]">
                {saga.replace(/-/g, ' ')}
              </legend>
              <ul className="grid gap-1">
                {list.map((b) => (
                  <li key={b.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 hover:bg-[var(--surface-inset)]">
                      <input
                        type="checkbox"
                        checked={isBookRead(b.id)}
                        onChange={() => toggleBook(b.id)}
                        className="size-4 accent-[var(--text-accent)]"
                      />
                      <span className="text-[var(--text-body-s)] text-[var(--text-primary)]">{b.title}</span>
                      {b.year && (
                        <span className="ml-auto text-[var(--text-micro)] tabular-nums text-[var(--text-tertiary)]">
                          {b.year}
                        </span>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          ))}
        </div>
      </Dialog>
    </>
  )
}
