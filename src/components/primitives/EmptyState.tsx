/**
 * EmptyState — the one "nothing here" panel.
 *
 * Six places in the archive each wrote their own: a bare centred `<p>`, a
 * parchment card, a glyph plus a line, and three variants that said nothing
 * about what to do next. Those are four different meanings — no data yet, no
 * matches for a filter, an error, an empty state the user caused — and a single
 * grey sentence covers none of them well.
 *
 * This component takes the two things every one of them was missing: a title
 * that names the situation, and an action when there is something to do about
 * it.
 *
 * It replaces `src/components/ui/EmptyState.tsx`; the call sites are migrated
 * in the M2 EmptyState block.
 */

import type { ReactNode } from 'react'
import type { ReactElement } from 'react'

interface Props {
  /** Names the situation. Not generic: not "Nothing here". */
  title: string
  /** One sentence on what to do, or why there is nothing. */
  description?: string
  /** Usually an <Icon>. Sized to 32px by default. */
  icon?: ReactElement<{ size?: number }>
  /** Primary action, e.g. "Clear filters". */
  action?: ReactNode
  /** Secondary action, e.g. "Browse everything". */
  secondaryAction?: ReactNode
  size?: 'sm' | 'md'
  toneMode?: 'dark' | 'paper'
  className?: string
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  size = 'md',
  toneMode = 'dark',
  className = '',
}: Props) {
  const paper = toneMode === 'paper'
  return (
    <div
      className={[
        'flex w-full flex-col items-center justify-center text-center',
        size === 'sm' ? 'gap-xs py-lg' : 'gap-sm py-2xl',
        paper ? 'text-[var(--text-on-page-secondary)]' : 'text-[var(--text-secondary)]',
        className,
      ].join(' ')}
    >
      {icon && (
        <span aria-hidden className={paper ? 'text-[var(--text-on-page-disabled)]' : 'text-[var(--text-disabled)]'}>
          {icon}
        </span>
      )}

      <p
        className={[
          'font-[var(--fw-medium)] leading-[var(--lh-heading)]',
          paper ? 'text-[var(--text-on-page-primary)]' : 'text-[var(--text-primary)]',
          size === 'sm' ? 'text-ui' : 'text-h4',
        ].join(' ')}
      >
        {title}
      </p>

      {description && (
        <p
          className={[
            'max-w-[46ch] text-meta leading-[var(--lh-body)]',
            paper ? 'text-[var(--text-on-page-secondary)]' : 'text-[var(--text-tertiary)]',
          ].join(' ')}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-2xs flex flex-wrap items-center justify-center gap-sm">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
