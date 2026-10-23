'use client'
import type { CSSProperties } from 'react'

interface Props {
  onClose: () => void
  /** Paper sheet gets an ink-outline mark instead of a pasted paper one. */
  ink?: boolean
  label?: string
}

export default function StepBackMark({ onClose, ink = false, label = 'Step back' }: Props) {
  const style: CSSProperties = ink
    ? {
        minHeight: 42,
        padding: '7px 11px',
        borderRadius: 1,
        border: '1px solid rgba(74, 56, 40, 0.62)',
        background: 'transparent',
        color: '#2b2118',
        boxShadow: 'inset 0 0 0 2px rgba(74, 56, 40, 0.1)',
        fontFamily: 'var(--font-display)',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        transform: 'rotate(-1.2deg)',
      }
    : {
        minHeight: 42,
        padding: '7px 11px',
        borderRadius: 2,
        border: '1px solid rgba(70, 50, 34, 0.55)',
        background: '#e9dcc4',
        color: '#2b2118',
        boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.18), 0 1px 0 rgba(0, 0, 0, 0.38)',
        fontFamily: 'var(--font-display)',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        transform: 'rotate(-1.2deg)',
      }

  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      className="group inline-flex shrink-0 cursor-pointer items-center gap-2 transition-[filter,background-color] duration-200 hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e6bd7e] motion-reduce:transition-none"
      style={style}
    >
      <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1, opacity: 0.75 }}>
        ←
      </span>
      <span>Step back</span>
    </button>
  )
}
