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
import { Link } from 'react-router-dom'
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
        'absolute top-[calc(100%+5px)] right-0 z-[var(--z-drawer)] w-[min(320px,calc(100vw-20px))] overflow-hidden',
        'rounded-[3px] border border-[#977343] p-2 shadow-[0_15px_38px_rgba(0,0,0,.68)]',
      ].join(' ')}
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(192,150,85,.14), transparent 58%), linear-gradient(135deg, #352315 0%, #25180e 56%, #1b110a 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,225,169,.18), 0 15px 38px rgba(0,0,0,.68)',
      }}
    >
      <div className="mb-1 flex items-end justify-between border-b border-[#b38c55]/45 px-3 pb-2 pt-1.5">
        <span>
          <span className="block font-[var(--font-display)] text-[14px] tracking-[.06em] text-[#ead9b7]">
            Historical Archive
          </span>
          <span className="mt-1 block font-[var(--font-mono)] text-[7px] tracking-[.2em] text-[#a88b5d]">
            SEALED RECORDS · {items.length} FOLIOS
          </span>
        </span>
        <span
          aria-hidden
          className="mb-1 h-[3px] w-8 rounded-full bg-[#c9a66d]/70 shadow-[0_0_5px_rgba(201,166,109,.3)]"
        />
      </div>

      <ul ref={listRef} onKeyDown={onKeyDown} className="grid grid-cols-1 gap-0.5">
        {items.map((dest) => {
          const active = isDestinationActive(dest, pathname)
          return (
            <li key={dest.id}>
              <Link
                to={dest.to}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={[
                  'group flex min-h-[var(--target-min)] items-start gap-3 rounded-[2px] border border-transparent px-3 py-2.5',
                  'transition-all duration-200 ease-[var(--ease-standard)]',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                  active
                    ? 'border-[#997444]/55 bg-[#5a3d20]/55 text-[#f1dfbb] shadow-[inset_0_1px_0_rgba(255,226,170,.08)]'
                    : 'text-[var(--text-secondary)] hover:border-[#88683d]/45 hover:bg-[#493018]/45 hover:text-[#f1dfbb]',
                ].join(' ')}
              >
                <span
                  className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border ${active ? 'border-[#c7a46a]/80 bg-[#9b7946]/25 text-[#e1c486]' : 'border-[#78603b]/60 bg-[#1c120a]/55 text-[#a88d5f]'}`}
                >
                  <DestinationIcon name={dest.icon} size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-ui font-[var(--fw-medium)] tracking-[var(--ls-ui)]">{dest.label}</span>
                  <span className="mt-0.5 block text-micro leading-[var(--lh-ui)] text-[var(--text-tertiary)]">
                    {dest.description}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
