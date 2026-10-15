/**
 * Tabs — a tablist with roving focus.
 *
 * Each page in the archive builds its own tab bar and none of them agree: some
 * use buttons without `role="tablist"`, some never move focus with the arrow
 * keys, and the Locations page renders both a bar and a `?tab=` deep link with
 * no shared state. This component takes the state machine in one place.
 *
 * ARIA pattern: the tabs own `tabIndex`, arrow keys move between them, Home/End
 * jump to the ends, and only the selected tab is in the page tab order. That is
 * the APG "tabs with manual activation" pattern; automatic activation is
 * deliberately avoided because some panels here trigger heavy work.
 */

import { useCallback, useId, useRef } from 'react'
import type { ReactNode } from 'react'

export interface TabItem {
  id: string
  label: string
  /** Optional count shown after the label. */
  count?: number
  /** Leading glyph. */
  icon?: ReactNode
  disabled?: boolean
}

interface Props {
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  /** Accessible name for the tablist. */
  label: string
  toneMode?: 'dark' | 'paper'
  size?: 'sm' | 'md'
  /** Stretch to fill the available width. */
  block?: boolean
  className?: string
}

export default function Tabs({
  items,
  value,
  onChange,
  label,
  toneMode = 'dark',
  size = 'md',
  block = false,
  className = '',
}: Props) {
  const uid = useId()
  const listRef = useRef<HTMLDivElement | null>(null)
  const paper = toneMode === 'paper'

  const enabled = items.filter((i) => !i.disabled)

  const focusAt = useCallback(
    (index: number) => {
      const next = enabled[(index + enabled.length) % enabled.length]
      if (!next) return
      onChange(next.id)
      // Roving tabindex: move DOM focus with the selection.
      requestAnimationFrame(() => {
        listRef.current?.querySelector<HTMLButtonElement>(`#${CSS.escape(`${uid}-${next.id}`)}`)?.focus()
      })
    },
    [enabled, onChange, uid],
  )

  const currentIndex = enabled.findIndex((i) => i.id === value)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        focusAt(currentIndex + 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        focusAt(currentIndex - 1)
        break
      case 'Home':
        e.preventDefault()
        focusAt(0)
        break
      case 'End':
        e.preventDefault()
        focusAt(enabled.length - 1)
        break
      default:
        break
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={[
        'flex items-center gap-[var(--space-3xs)] overflow-x-auto',
        paper
          ? 'rounded-[var(--radius-md)] border border-[var(--border-subtle-on-page)] bg-[var(--surface-page-raised)] p-1'
          : 'rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-1',
        block ? 'w-full' : 'w-max max-w-full',
        className,
      ].join(' ')}
    >
      {items.map((item) => {
        const selected = item.id === value
        return (
          <button
            key={item.id}
            id={`${uid}-${item.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`${uid}-${item.id}-panel`}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            className={[
              'inline-flex shrink-0 items-center gap-[var(--space-2xs)] rounded-[var(--radius-sm)] whitespace-nowrap',
              'cursor-pointer font-[var(--fw-medium)] tracking-[var(--ls-ui)]',
              'transition-[background-color,color] duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
              'focus-visible:outline-none',
              paper
                ? 'focus-visible:[box-shadow:var(--focus-ring-on-page)]'
                : 'focus-visible:[box-shadow:var(--focus-ring)]',
              size === 'sm' ? 'h-8 px-2.5 text-[var(--text-meta)]' : 'h-11 px-3.5 text-[var(--text-ui)]',
              selected
                ? paper
                  ? 'bg-[var(--surface-page)] text-[var(--text-on-page-primary)] shadow-[var(--shadow-1)]'
                  : 'bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-[var(--shadow-1)]'
                : paper
                  ? 'bg-transparent text-[var(--text-on-page-secondary)] hover:text-[var(--text-on-page-primary)]'
                  : 'bg-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
              item.disabled ? 'cursor-not-allowed opacity-40' : '',
            ].join(' ')}
          >
            {item.icon}
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span className={paper ? 'opacity-70' : 'text-[var(--text-tertiary)]'}>{item.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** The panel that goes with Tabs. Owns the id wiring Tabs points at. */
export function TabPanel({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  return (
    <div role="tabpanel" tabIndex={-1} id={`${id}-panel`} className={['min-h-0 flex-1', className].join(' ')}>
      {children}
    </div>
  )
}
