/**
 * VisuallyHidden — keeps content in the accessibility tree while removing it
 * visually.
 *
 * Tailwind ships `sr-only`, but a component is needed where the content has to
 * become visible on focus (the skip links in the shell) or where the hidden
 * node is not a direct child. Both cases appear in M2, and both need the same
 * clipping technique, so it lives here rather than as a utility class.
 *
 * `as` keeps the element type correct for the document outline: a `<label>`
 * wrapper must stay a `<label>`.
 */

import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  /**
   * Show the content when this element receives focus. Used by skip links,
   * which must be invisible until tabbed to (WCAG 2.4.1 Bypass Blocks).
   */
  focusable?: boolean
  /** Tag to render. A `<label>` wrapper must stay a `<label>`. */
  as?: 'span' | 'div' | 'p' | 'label'
  className?: string
}

export default function VisuallyHidden({ children, focusable = false, as: Tag = 'span', className = '' }: Props) {
  return (
    <Tag
      className={
        focusable
          ? // The clip is lifted on focus and the box is pinned to the viewport
            // corner so the revealed text is actually visible.
            `absolute top-2 left-2 z-[var(--z-skip-link)] rounded-[var(--radius-md)] bg-[var(--surface-raised)] px-3 py-2 text-ui text-[var(--text-primary)] shadow-[var(--shadow-2)] [clip:auto] [clip-path:none] [height:auto] [width:auto] focus-visible:[clip:auto] focus-visible:[clip-path:none] focus-visible:[height:auto] focus-visible:[width:auto] ${className}`
          : `absolute h-px w-px overflow-hidden [clip:rect(0_0_0_0)] [clip-path:inset(50%)] [white-space:nowrap] ${className}`
      }
    >
      {children}
    </Tag>
  )
}
