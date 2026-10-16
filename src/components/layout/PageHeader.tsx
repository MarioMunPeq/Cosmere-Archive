/**
 * PageHeader — the band that opens every non-core screen.
 *
 * Seven pages each open with their own title block: four use a gradient text
 * heading, two use an ArchivalViewer header, and one has none. The measurements
 * that mattered — the title size per breakpoint, the reading measure, the gap
 * to the content — were therefore whatever each page happened to have chosen.
 *
 * §5.2 fixes them: `--text-h1` below 768px, `--text-display` from 1024px,
 * `--text-lead` for the description, `--measure` for its width.
 *
 * `tabIndex={-1}` is not optional. Navigating to a new route moves the page but
 * not the focus, so a keyboard or screen-reader user is left at the top of the
 * document with no announcement that anything happened. Focusing the heading on
 * arrival is the fix, and it needs a real focus target.
 */

import type { ReactNode } from 'react'

interface Props {
  title: string
  /** One or two sentences. Optional, but every page in the archive has one. */
  description?: string
  /** Eyebrow above the title: the archive or chapter this belongs to. */
  eyebrow?: string
  /** Actions on the right at desktop, below the description at mobile. */
  actions?: ReactNode
  /** Breadcrumb or filter row under the header. */
  children?: ReactNode
  toneMode?: 'dark' | 'paper'
  className?: string
}

export default function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  children,
  toneMode = 'dark',
  className = '',
}: Props) {
  const paper = toneMode === 'paper'

  return (
    <header
      className={[
        'shrink-0 border-b px-[var(--gutter-md)] py-lg max-md:px-[var(--gutter)]',
        paper ? 'border-[var(--border-subtle-on-page)]' : 'border-[var(--border-subtle)]',
        className,
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-page flex-col gap-2xs lg:flex-row lg:items-end lg:justify-between lg:gap-lg">
        <div className="min-w-0">
          {eyebrow && (
            <p
              className={[
                'mb-1 text-nano tracking-[var(--ls-caps-wide)] uppercase',
                paper ? 'text-[var(--text-on-page-tertiary)]' : 'text-[var(--text-tertiary)]',
              ].join(' ')}
            >
              {eyebrow}
            </p>
          )}

          <h1
            tabIndex={-1}
            data-page-title
            className={[
              'font-display font-[var(--fw-semibold)]',
              'tracking-[var(--ls-display)] focus:outline-none',
              // 36px below 1024px, 48px from there up (§5.2).
              'text-h1 lg:text-display',
              'leading-[var(--lh-display)]',
              paper ? 'text-[var(--text-on-page-primary)]' : 'text-[var(--text-primary)]',
            ].join(' ')}
          >
            {title}
          </h1>

          {description && (
            <p
              className={[
                'mt-2 max-w-[var(--measure)] text-lead leading-[var(--lh-body)]',
                paper ? 'text-[var(--text-on-page-secondary)]' : 'text-[var(--text-secondary)]',
              ].join(' ')}
            >
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex shrink-0 flex-wrap items-center gap-sm lg:pb-1">{actions}</div>}
      </div>

      {children}
    </header>
  )
}
