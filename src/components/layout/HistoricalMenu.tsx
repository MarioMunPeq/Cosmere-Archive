/**
 * HistoricalMenu — the dropdown under the Historical trigger.
 *
 * §5.1 calls for a 320px panel, Escape and click-outside to close, arrow-key
 * navigation and `role="menu"`.
 *
 * On `role="menu"`: the APG pattern for a menu of links expects each item to be
 * a `menuitem` wrapping a link, which needs two nested interactive elements per
 * row and breaks middle-click. Since every destination here is a plain link to
 * a route, this is a navigation list, not an application menu — so it is a
 * `<nav>` with a list of anchors and arrow-key roving between them. Same
 * keyboard behaviour, one interactive element per row, real hrefs throughout.
 */

import { useEffect, useRef } from 'react'
import type { Destination } from '@/navigation'
import { isDestinationActive } from '@/navigation'
import DestinationIcon from './DestinationIcon'

interface Props {
  id: string
  items: Destination[]
  pathname: string
  onNavigate: () => void
  /**
   * The trigger button. Clicks on it are ignored by the click-outside handler,
   * otherwise closing and reopening race: pointerdown fires the handler and
   * clears the state, then the trigger's own click reads the now-stale `false`
   * and opens it again, leaving a menu that cannot be dismissed with the mouse.
   */
  triggerRef?: React.RefObject<HTMLElement | null>
}

export default function HistoricalMenu({ id, items, pathname, onNavigate, triggerRef }: Props) {
  const panelRef = useRef<HTMLElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const panel = panelRef.current
      const trigger = triggerRef?.current
      const target = e.target as Node | null
      if (!panel || !target) return
      if (panel.contains(target) || trigger?.contains(target)) return
      onNavigate()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [onNavigate, triggerRef])

  /** Roving arrow navigation between the links. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const links = listRef.current ? Array.from(listRef.current.querySelectorAll<HTMLAnchorElement>('a[href]')) : []
    if (links.length === 0) return
    const current = links.indexOf(document.activeElement as HTMLAnchorElement)

    let next: number
    if (e.key === 'ArrowDown') next = current < 0 ? 0 : (current + 1) % links.length
    else if (e.key === 'ArrowUp') next = current < 0 ? links.length - 1 : (current - 1 + links.length) % links.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = links.length - 1
    else return

    e.preventDefault()
    links[next]?.focus()
  }

  return (
    <nav
      ref={panelRef}
      id={id}
      aria-label="Historical Archive"
      className={[
        'absolute top-[calc(100%+8px)] right-0 z-[var(--z-drawer)] w-[320px]',
        'rounded-[var(--radius-lg)] border border-[var(--border-interactive)]',
        'bg-[var(--surface-raised)] p-2 shadow-[var(--shadow-3)]',
      ].join(' ')}
    >
      <p className="px-3 pt-1.5 pb-2 text-[var(--text-nano)] tracking-[var(--ls-caps-wide)] text-[var(--text-tertiary)] uppercase">
        Historical Archive
      </p>

      <ul ref={listRef} onKeyDown={onKeyDown} className="grid grid-cols-1 gap-0.5">
        {items.map((dest) => {
          const active = isDestinationActive(dest, pathname)
          return (
            <li key={dest.id}>
              <a
                href={dest.to}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex min-h-[var(--target-min)] items-start gap-3 rounded-[var(--radius-md)] px-3 py-2.5',
                  'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                  active
                    ? 'bg-[var(--surface-base)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-base)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                <DestinationIcon
                  name={dest.icon}
                  size={20}
                  className={active ? 'mt-0.5 text-[var(--text-accent)]' : 'mt-0.5 text-[var(--text-tertiary)]'}
                />
                <span className="min-w-0">
                  <span className="block text-[var(--text-ui)] font-[var(--fw-medium)] tracking-[var(--ls-ui)]">
                    {dest.label}
                  </span>
                  <span className="mt-0.5 block text-[var(--text-micro)] leading-[var(--lh-ui)] text-[var(--text-tertiary)]">
                    {dest.description}
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
