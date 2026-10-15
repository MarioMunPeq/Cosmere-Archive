/**
 * SegmentedControl — a radio group in a bar.
 *
 * Used for binary view switches ("Shelves / List", "Grid / Network"). A plain
 * pair of buttons would leave the reader guessing how many options exist and
 * whether one is currently chosen, so this renders a real radiogroup with
 * arrow-key navigation and `aria-checked`.
 *
 * Distinct from Tabs: tabs switch panels inside a page, this switches a mode
 * that produces a different view of the same data.
 */

import { useCallback, useId, useRef } from 'react'
import type { ReactNode } from 'react'

export interface Segment {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

interface Props {
  segments: Segment[]
  value: string
  onChange: (value: string) => void
  /** Accessible name. */
  label: string
  size?: 'sm' | 'md'
  toneMode?: 'dark' | 'paper'
  className?: string
}

export default function SegmentedControl({
  segments,
  value,
  onChange,
  label,
  size = 'md',
  toneMode = 'dark',
  className = '',
}: Props) {
  const uid = useId()
  const ref = useRef<HTMLDivElement | null>(null)
  const paper = toneMode === 'paper'
  const index = segments.findIndex((s) => s.value === value)

  const move = useCallback(
    (from: number, step: number) => {
      const enabled = segments.filter((s) => !s.disabled)
      if (enabled.length === 0) return
      const next = enabled[(from + step + enabled.length) % enabled.length]
      if (!next) return
      onChange(next.value)
      requestAnimationFrame(() => {
        ref.current?.querySelector<HTMLButtonElement>(`#${CSS.escape(`${uid}-${next.value}`)}`)?.focus()
      })
    },
    [segments, onChange, uid],
  )

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          move(index, 1)
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault()
          move(index, -1)
        }
      }}
      className={[
        'inline-flex items-center gap-[var(--space-3xs)] rounded-[var(--radius-md)] border p-1',
        paper
          ? 'border-[var(--border-subtle-on-page)] bg-[var(--surface-page-raised)]'
          : 'border-[var(--border-subtle)] bg-[var(--surface-inset)]',
        className,
      ].join(' ')}
    >
      {segments.map((s) => {
        const checked = s.value === value
        return (
          <button
            key={s.value}
            id={`${uid}-${s.value}`}
            type="button"
            role="radio"
            aria-checked={checked}
            // Roving tabindex: the checked option is the only tab stop.
            tabIndex={checked ? 0 : -1}
            disabled={s.disabled}
            onClick={() => onChange(s.value)}
            className={[
              'inline-flex shrink-0 items-center gap-[var(--space-2xs)] rounded-[var(--radius-sm)] whitespace-nowrap',
              'cursor-pointer font-[var(--fw-medium)] tracking-[var(--ls-ui)]',
              'transition-[background-color,color] duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
              'focus-visible:outline-none',
              paper
                ? 'focus-visible:[box-shadow:var(--focus-ring-on-page)]'
                : 'focus-visible:[box-shadow:var(--focus-ring)]',
              size === 'sm' ? 'h-8 px-2.5 text-[var(--text-meta)]' : 'h-11 px-3.5 text-[var(--text-ui)]',
              checked
                ? paper
                  ? 'bg-[var(--surface-page)] text-[var(--text-on-page-primary)] shadow-[var(--shadow-1)]'
                  : 'bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-[var(--shadow-1)]'
                : paper
                  ? 'bg-transparent text-[var(--text-on-page-secondary)] hover:text-[var(--text-on-page-primary)]'
                  : 'bg-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
              s.disabled ? 'cursor-not-allowed opacity-40' : '',
            ].join(' ')}
          >
            {s.icon}
            <span>{s.label}</span>
          </button>
        )
      })}
    </div>
  )
}
