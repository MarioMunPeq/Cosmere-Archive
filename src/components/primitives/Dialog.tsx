/**
 * Dialog — a native `<dialog>` with the behaviour a modal needs.
 *
 * Native rather than a div with a backdrop, for three reasons that all matter
 * here:
 *
 *  1. Focus is trapped and `inert` is applied to the rest of the document by the
 *     browser. The old command palette hand-rolled this with `useFocusTrap`
 *     and missed it in one of its three copies.
 *  2. Escape closes it, and the top layer guarantees it paints above every
 *     z-index in the codebase.
 *  3. `showModal()` throws InvalidStateError if the dialog is already open, so
 *     the open/close transition is driven from a single effect that reads
 *     `open` as the source of truth.
 *
 * `onClose` fires for both the Escape key and the backdrop click, so callers
 * only implement one handler.
 */

import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import Icon, { CloseGlyph } from './Icon'

interface Props {
  open: boolean
  onClose: () => void
  /** Accessible name. Becomes aria-labelledby on the title element. */
  title: string
  /** Visually hidden instead of rendered, for palettes that need no heading. */
  hideTitle?: boolean
  description?: string
  children: ReactNode
  /** Footer row, typically the action buttons. */
  footer?: ReactNode
  /** Closes when the backdrop is clicked. Escape always closes. */
  closeOnBackdrop?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const WIDTH = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
} as const

const MAX_WIDTH = {
  sm: '28rem',
  md: '36rem',
  lg: '48rem',
} as const

export default function Dialog({
  open,
  onClose,
  title,
  hideTitle = false,
  description,
  children,
  footer,
  closeOnBackdrop = true,
  size = 'md',
  className = '',
}: Props) {
  const ref = useRef<HTMLDialogElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // showModal/close are absent in jsdom and in any engine older than the
    // top-layer spec. Calling them unguarded throws and takes the whole tree
    // down, so the plain `open` attribute is used as the fallback.
    const canModal = typeof el.showModal === 'function'
    if (open) {
      if (canModal && !el.open) el.showModal()
      else if (!canModal) el.setAttribute('open', '')
    } else if (el.open) {
      if (canModal && typeof el.close === 'function') el.close()
      else el.removeAttribute('open')
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? `${titleId}-desc` : undefined}
      // A click on the backdrop lands on the dialog element itself, because the
      // dialog box is the only child. Checking the geometry is what
      // distinguishes that from a click on the panel.
      onClick={(e) => {
        if (!closeOnBackdrop || e.target !== ref.current) return
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
        if (!inside) onClose()
      }}
      onClose={onClose}
      style={{ width: `min(calc(100vw - 2rem), ${MAX_WIDTH[size]})` }}
      className={[
        'fixed inset-0 z-[100] m-auto max-h-[85vh] rounded-[var(--radius-lg)] p-0',
        'border border-[var(--border-interactive)] bg-[var(--surface-raised)] text-[var(--text-primary)]',
        'shadow-[var(--shadow-3)] backdrop:bg-[color-mix(in_srgb,var(--surface-void)_78%,transparent)]',
        'backdrop:backdrop-blur-[3px]',
        'open:animate-[var(--dur-base)_var(--ease-decelerate)]',
        WIDTH[size],
        className,
      ].join(' ')}
    >
      <div className="flex items-start gap-md border-b border-[var(--border-subtle)] px-lg py-md">
        <div className="min-w-0 flex-1">
          <h2
            id={titleId}
            className={[
              'text-h4 font-[var(--fw-semibold)] leading-[var(--lh-heading)]',
              hideTitle ? 'sr-only' : '',
            ].join(' ')}
          >
            {title}
          </h2>
          {description && (
            <p id={`${titleId}-desc`} className="mt-1 text-meta text-[var(--text-secondary)]">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={[
            '-mr-2 -mt-1 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)]',
            'text-[var(--text-secondary)] transition-colors duration-[var(--dur-fast)] hover:bg-[var(--surface-base)] hover:text-[var(--text-primary)]',
            'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          ].join(' ')}
        >
          <Icon size={18}>
            <CloseGlyph />
          </Icon>
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto overscroll-contain px-lg py-md">{children}</div>

      {footer && (
        <div className="flex items-center justify-end gap-sm border-t border-[var(--border-subtle)] px-lg py-md">
          {footer}
        </div>
      )}
    </dialog>
  )
}
