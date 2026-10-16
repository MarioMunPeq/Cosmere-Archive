/**
 * Field — a labelled text input.
 *
 * The single reason this exists: the search input, the filter inputs and the
 * About contact field were three hand-built inputs, and only one of them had a
 * `<label>` associated with it. An unlabelled input is a WCAG 3.3.2 failure and
 * is invisible in a visual review.
 *
 * `label` is required. If the control genuinely has no visible label, pass
 * `label` anyway and set `hideLabel` — the text still reaches the accessibility
 * tree, which is the only reason `hideLabel` is allowed to exist.
 */

import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import Icon, { CloseGlyph, SearchGlyph } from './Icon'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  hideLabel?: boolean
  /** Rendered inside the field, before the text. */
  icon?: ReactNode
  /** Renders a clear button when the value is non-empty. */
  clearable?: boolean
  onClear?: () => void
  /** Help text, wired with aria-describedby. */
  hint?: string
  /** Validation message. Switches the field to its error state. */
  error?: string
  toneMode?: 'dark' | 'paper'
  /** Announce result counts through a polite live region. */
  status?: string
}

export default function Field({
  label,
  hideLabel = false,
  icon,
  clearable = false,
  onClear,
  hint,
  error,
  toneMode = 'dark',
  status,
  className = '',
  id,
  value,
  onChange,
  ...rest
}: Props) {
  const uid = useId()
  const inputId = id ?? uid
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const paper = toneMode === 'paper'
  const showClear = clearable && typeof value === 'string' && value.length > 0

  const field = (
    <input
      id={inputId}
      value={value}
      onChange={onChange}
      aria-invalid={error ? true : undefined}
      aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      className={[
        'h-11 w-full min-w-0 bg-transparent text-body',
        'placeholder:text-[var(--text-tertiary)]',
        'focus:outline-none',
        icon ? 'pl-10' : 'pl-3',
        showClear ? 'pr-11' : 'pr-3',
        className,
      ].join(' ')}
      {...rest}
    />
  )

  return (
    <div className="flex w-full flex-col gap-2xs">
      <label
        htmlFor={inputId}
        className={[
          'text-meta font-[var(--fw-medium)] tracking-[var(--ls-caps)] uppercase',
          hideLabel ? 'sr-only' : '',
          paper ? 'text-[var(--text-on-page-secondary)]' : 'text-[var(--text-secondary)]',
        ].join(' ')}
      >
        {label}
      </label>

      <div
        className={[
          'flex items-center rounded-[var(--radius-md)] border bg-[var(--surface-inset)]',
          'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
          'focus-within:[box-shadow:var(--focus-ring)]',
          error
            ? 'border-[var(--shard-odium)]'
            : paper
              ? 'border-[var(--border-interactive-on-page)]'
              : 'border-[var(--border-interactive)]',
          paper ? 'bg-[var(--surface-page-inset)]' : 'bg-[var(--surface-inset)]',
        ].join(' ')}
      >
        {icon ?? (
          <span aria-hidden className="pl-3 text-[var(--text-tertiary)]">
            <Icon size={18}>
              <SearchGlyph />
            </Icon>
          </span>
        )}

        {field}

        {showClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear"
            className={[
              'mr-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)]',
              'text-[var(--text-tertiary)] transition-colors duration-[var(--dur-fast)]',
              'hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
            ].join(' ')}
          >
            <Icon size={16}>
              <CloseGlyph />
            </Icon>
          </button>
        )}
      </div>

      {hint && !error && (
        <p id={hintId} className="text-micro text-[var(--text-tertiary)]">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-micro text-[var(--shard-odium)]">
          {error}
        </p>
      )}

      {/* Polite live region: result counts are announced without interrupting. */}
      {status && (
        <p role="status" aria-live="polite" className="sr-only">
          {status}
        </p>
      )}
    </div>
  )
}
