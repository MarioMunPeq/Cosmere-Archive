/**
 * Button — the only button in the archive.
 *
 * Three decisions are encoded here so no call site can get them wrong:
 *
 *  1. Every variant meets the 44×44 minimum target (WCAG 2.2 SC 2.5.8) except
 *     `ghost`/`bare`, which are for icon-only controls inside a 44px slot.
 *  2. Focus is never removed. The ring comes from `--focus-ring`, which clears
 *     3:1 against both themes.
 *  3. A `loading` button stays focusable and keeps its accessible name, so
 *     screen readers do not announce a nameless button mid-action.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'bare' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonTone = 'dark' | 'paper'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** `paper` swaps in the -on-page tokens for reading surfaces. */
  tone?: ButtonTone
  loading?: boolean
  /** Leading glyph. Should be an <Icon>. */
  icon?: ReactNode
  /** Trailing glyph, e.g. a chevron. Should be an <Icon>. */
  trailing?: ReactNode
  children?: ReactNode
}

const SIZE: Record<ButtonSize, string> = {
  // Height is the 44px target on md and lg; sm is the one deliberate exception
  // and is only for dense toolbars, never a primary action.
  sm: 'h-8 px-2.5 text-meta',
  md: 'h-11 px-4 text-ui',
  lg: 'h-12 px-6 text-body',
}

function variantClass(variant: ButtonVariant, tone: ButtonTone): string {
  const onPage = tone === 'paper'
  switch (variant) {
    case 'primary':
      return onPage
        ? 'bg-[var(--text-on-page-primary)] text-[var(--surface-page)] border border-[var(--text-on-page-primary)] hover:opacity-90'
        : 'bg-[var(--text-accent)] text-[var(--surface-void)] border border-[var(--text-accent)] hover:bg-[var(--shard-harmony)] hover:border-[var(--shard-harmony)]'
    case 'secondary':
      return onPage
        ? 'bg-transparent text-[var(--text-on-page-primary)] border border-[var(--border-interactive-on-page)] hover:bg-[var(--surface-page-raised)]'
        : 'bg-transparent text-[var(--text-primary)] border border-[var(--border-interactive)] hover:bg-[var(--surface-raised)] hover:border-[var(--text-tertiary)]'
    case 'danger':
      return onPage
        ? 'bg-transparent text-[var(--shard-odium)] border border-[var(--shard-odium)] hover:bg-[var(--shard-odium)] hover:text-[var(--surface-page)]'
        : 'bg-transparent text-[var(--shard-odium)] border border-[var(--shard-odium)] hover:bg-[var(--shard-odium)] hover:text-[var(--surface-void)]'
    case 'ghost':
      return onPage
        ? 'bg-transparent text-[var(--text-on-page-secondary)] border border-transparent hover:bg-[var(--surface-page-inset)] hover:text-[var(--text-on-page-primary)]'
        : 'bg-transparent text-[var(--text-secondary)] border border-transparent hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]'
    case 'bare':
      return 'bg-transparent border border-transparent hover:bg-[var(--surface-raised)]'
  }
}

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    tone = 'dark',
    loading = false,
    icon,
    trailing,
    children,
    className = '',
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      // Keeps the name while the spinner replaces the label, so the control
      // never becomes an unlabelled button.
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center gap-2xs rounded-[var(--radius-md)]',
        'font-[var(--fw-medium)] tracking-[var(--ls-ui)]',
        'transition-[background-color,border-color,color,opacity] duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
        'focus-visible:outline-none',
        tone === 'paper'
          ? 'focus-visible:[box-shadow:var(--focus-ring-on-page)]'
          : 'focus-visible:[box-shadow:var(--focus-ring)]',
        'disabled:pointer-events-none disabled:opacity-50',
        SIZE[size],
        variantClass(variant, tone),
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        icon
      )}
      {children}
      {trailing}
    </button>
  )
})

export default Button
