/**
 * Tooltip — a label for things that cannot carry one.
 *
 * Built on no library. The behaviour that matters is keyboard parity: the
 * tooltip must appear on focus as well as hover, must be dismissible with
 * Escape, and must not be the only place the label exists — `title` is kept as
 * a fallback but `aria-label`/`aria-describedby` on the trigger is the real
 * answer, and a tooltip that only works with a mouse is not accessible at all.
 *
 * WCAG 1.4.13: hoverable and dismissible. The delay avoids firing while the
 * pointer travels across the trigger to the tip itself.
 */

import { useEffect, useId, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'

interface Props {
  content: ReactNode
  children: ReactElement
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /** Milliseconds before the tip appears on hover. Focus shows it immediately. */
  delay?: number
  className?: string
}

const POS = {
  top: 'bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2',
  bottom: 'top-[calc(100%+8px)] left-1/2 -translate-x-1/2',
  left: 'right-[calc(100%+8px)] top-1/2 -translate-y-1/2',
  right: 'left-[calc(100%+8px)] top-1/2 -translate-y-1/2',
} as const

export default function Tooltip({ content, children, placement = 'top', delay = 350, className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const id = useId()

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const show = (immediate: boolean) => {
    if (timer.current) clearTimeout(timer.current)
    if (immediate) setOpen(true)
    else timer.current = setTimeout(() => setOpen(true), delay)
  }

  const hide = () => {
    if (timer.current) clearTimeout(timer.current)
    setOpen(false)
  }

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => show(false)}
      // The tip itself is hoverable (WCAG 1.4.13), so leaving the trigger for
      // the tip must not close it.
      onMouseLeave={hide}
      onFocus={() => show(true)}
      onBlur={hide}
      onKeyDown={(e) => {
        if (e.key === 'Escape') hide()
      }}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={[
            'pointer-events-auto absolute z-[var(--z-toast)] w-max max-w-[260px]',
            'rounded-[var(--radius-md)] border border-[var(--border-interactive)]',
            'bg-[var(--surface-overlay)] px-2.5 py-1.5',
            'text-micro leading-[var(--lh-ui)] text-[var(--text-primary)]',
            'shadow-[var(--shadow-2)]',
            POS[placement],
          ].join(' ')}
        >
          {content}
        </span>
      )}
    </span>
  )
}
