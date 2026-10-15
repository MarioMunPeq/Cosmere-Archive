/**
 * Chip — the small filter/label pill.
 *
 * Split into two components rather than one with a `toggle` flag. A single
 * component with a boolean inevitably gets used the wrong way at some call
 * site, and the failure is invisible: a filter that cannot be pressed, or a
 * label that announces itself as a button.
 *
 *  - `Chip` is a non-interactive label. Not focusable, no button semantics.
 *  - `ToggleChip` is a button that can be pressed, and owns `aria-pressed`.
 *
 * Heights are 24px/32px. The 44px touch target applies to the primary control
 * on a page, which is a different component; chips inside a filter row are
 * dense by design and get padding from their row instead.
 */

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

export type ChipTone = 'neutral' | 'accent' | 'shard'
export type ChipSize = 'sm' | 'md'

interface Common {
  children: ReactNode
  tone?: ChipTone
  size?: ChipSize
  toneMode?: 'dark' | 'paper'
  /** Leading dot, usually the entity colour. */
  dot?: string
  /** Right-hand count, e.g. a result total. */
  count?: number
  icon?: ReactNode
  className?: string
}

const SIZE: Record<ChipSize, string> = {
  sm: 'h-6 px-2 gap-1 text-[var(--text-micro)]',
  md: 'h-8 px-3 gap-[6px] text-[var(--text-meta)]',
}

const BASE =
  'inline-flex shrink-0 items-center rounded-[var(--radius-pill)] border font-[var(--fw-medium)] tracking-[var(--ls-ui)] transition-[background-color,border-color,color] duration-[var(--dur-fast)] ease-[var(--ease-standard)] whitespace-nowrap'

function classes(tone: ChipTone, on: boolean, paper: boolean): string {
  if (!on && tone === 'neutral') {
    return paper
      ? 'border-[var(--border-subtle-on-page)] bg-[var(--surface-page-raised)] text-[var(--text-on-page-secondary)]'
      : 'border-[var(--border-subtle)] bg-[var(--surface-inset)] text-[var(--text-secondary)]'
  }
  if (tone === 'shard') {
    return paper
      ? 'border-[var(--border-interactive-on-page)] bg-transparent text-[var(--text-on-page-secondary)]'
      : 'border-[var(--border-interactive)] bg-transparent text-[var(--text-secondary)]'
  }
  // tone === 'accent', on or off
  if (on) {
    return paper
      ? 'border-[var(--text-on-page-primary)] bg-[var(--text-on-page-primary)] text-[var(--surface-page)]'
      : 'border-[var(--text-accent)] bg-[color-mix(in_srgb,var(--text-accent)_14%,transparent)] text-[var(--text-accent)]'
  }
  return paper
    ? 'border-[var(--border-interactive-on-page)] bg-transparent text-[var(--text-on-page-secondary)] hover:border-[var(--text-on-page-tertiary)] hover:text-[var(--text-on-page-primary)]'
    : 'border-[var(--border-interactive)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
}

function inner({ dot, icon, children, count, paper }: Common & { paper: boolean }) {
  return (
    <>
      {dot && <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dot }} />}
      {icon}
      <span className="truncate">{children}</span>
      {typeof count === 'number' && (
        <span className={paper ? 'opacity-70' : 'text-[var(--text-tertiary)]'}>{count}</span>
      )}
    </>
  )
}

/** Non-interactive label. */
export default function Chip({
  tone = 'neutral',
  size = 'sm',
  toneMode = 'dark',
  className = '',
  ...rest
}: Common & HTMLAttributes<HTMLSpanElement>) {
  const paper = toneMode === 'paper'
  return (
    <span className={[BASE, SIZE[size], classes(tone, false, paper), className].join(' ')}>
      {inner({ ...rest, paper })}
    </span>
  )
}

/** A chip that can be pressed. Owns `aria-pressed`. */
export function ToggleChip({
  selected,
  tone = 'neutral',
  size = 'sm',
  toneMode = 'dark',
  className = '',
  ...rest
}: Common & { selected: boolean } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>) {
  const paper = toneMode === 'paper'
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...rest}
      className={[
        BASE,
        SIZE[size],
        classes(tone, selected, paper),
        'cursor-pointer focus-visible:outline-none',
        paper ? 'focus-visible:[box-shadow:var(--focus-ring-on-page)]' : 'focus-visible:[box-shadow:var(--focus-ring)]',
        className,
      ].join(' ')}
    >
      {inner({ ...rest, paper })}
    </button>
  )
}
