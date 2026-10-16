/**
 * NavBar — the 56px bar. Replaces the 32px parchment strip whose only two
 * links were the wordmark and "About", at 2.43:1.
 *
 * Every measurement here comes from REBUILD_PLAN §5.1:
 *
 *   height            --nav-h (56px)
 *   background        --surface-base at 88% + 12px backdrop blur
 *   wordmark          16px, --ls-wordmark, --text-primary        15.29:1
 *   nav links         --text-ui, --text-secondary                9.89:1
 *   active link       --text-primary + 2px --text-accent filete  8.40:1
 *   Historical        --text-ui + 16px chevron, --text-tertiary  6.40:1
 *   every target      >= --target-min (44x44), SC 2.5.8
 *
 * The wordmark is a real `<a href="/">`. Every destination is a real link, so
 * middle-click, "open in new tab" and crawlers all work — the drawer it
 * replaces used `<button onClick>` for all ten, which broke every one of those.
 */

import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CORE_DESTINATIONS, HISTORICAL_DESTINATIONS, isDestinationActive } from '@/navigation'
import DestinationIcon from './DestinationIcon'
import VisuallyHidden from '@/components/primitives/VisuallyHidden'
import HistoricalMenu from './HistoricalMenu'

interface Props {
  /** Opens the global search dialog. Supplied by the search block. */
  onSearch?: () => void
}

export default function NavBar({ onSearch }: Props) {
  const { pathname } = useLocation()
  const barRef = useRef<HTMLElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)

  /**
   * The menu records the pathname it was opened on and is open only while the
   * pathname still matches. Deriving it here rather than closing it from an
   * effect means back/forward also dismisses it, and avoids a cascading render
   * on every navigation.
   */
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const menuOpen = openedAt !== null && openedAt === pathname
  const setMenuOpen = (next: boolean) => setOpenedAt(next ? pathname : null)

  // Escape closes and returns focus to the trigger (WCAG 2.1.2).
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenedAt(null)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen, pathname])

  return (
    <nav
      id="nav-bar"
      ref={barRef}
      aria-label="Main"
      className={['relative z-[var(--z-nav)] shrink-0', 'border-b border-[var(--border-subtle)]'].join(' ')}
      style={{
        height: 'var(--nav-h)',
        background: 'color-mix(in srgb, var(--surface-base) 88%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="mx-auto flex h-full max-w-page items-center gap-1 px-[var(--gutter-md)] max-md:px-[var(--gutter)]">
        {/* Wordmark — a real anchor, 44px tall so it meets the touch target. */}
        <Link
          to="/"
          aria-label="Cosmere Archive — home"
          className={[
            'flex h-[var(--target-min)] shrink-0 items-center gap-2 rounded-[var(--radius-md)] pr-3',
            'font-display text-[16px] tracking-[var(--ls-wordmark)] text-[var(--text-primary)]',
            'transition-opacity duration-[var(--dur-fast)] hover:opacity-75',
            'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          ].join(' ')}
        >
          <DestinationIcon name="shard" size={18} className="text-[var(--text-accent)]" />
          <span className="hidden sm:inline">COSMERE ARCHIVE</span>
        </Link>

        {/* The four core destinations. Hidden below 768px, where the bottom bar takes
            over. `md:flex` is required: `max-md:hidden` only narrows, and a bare
            `hidden` with nothing to override it stays hidden at every width. */}
        <ul className="ml-2 hidden h-full items-center gap-1 md:flex">
          {CORE_DESTINATIONS.map((dest) => (
            <li key={dest.id} className="h-full">
              <NavLinkItem dest={dest} pathname={pathname} />
            </li>
          ))}
        </ul>

        <div className="ml-auto flex h-full items-center gap-1">
          {/* Historical dropdown. */}
          <div className="relative h-full">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-controls="historical-menu"
              className={[
                'flex h-[var(--target-min)] items-center gap-1.5 rounded-[var(--radius-md)] px-3',
                'text-ui font-[var(--fw-medium)] tracking-[var(--ls-ui)]',
                'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                menuOpen
                  ? 'bg-[var(--surface-raised)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]',
              ].join(' ')}
            >
              Historical
              <DestinationIcon
                name="chevron"
                size={16}
                className={`text-[var(--text-tertiary)] transition-transform duration-[var(--dur-fast)] ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {menuOpen && (
              <HistoricalMenu
                id="historical-menu"
                items={HISTORICAL_DESTINATIONS}
                pathname={pathname}
                onNavigate={() => setMenuOpen(false)}
                triggerRef={menuButtonRef}
              />
            )}
          </div>

          {/* Search. 36px tall per the spec, but padded out to the 44px target
              by the row height so the hit area is the whole slot. */}
          {onSearch && (
            <button
              type="button"
              onClick={onSearch}
              // The word "Search" is `hidden lg:inline`, so below 1024px this
              // button is an icon with nothing to announce — axe `button-name`.
              // It is the only control on the bar that loses its name this way.
              aria-label="Search"
              className={[
                'flex h-[var(--target-min)] min-w-[44px] items-center gap-2 rounded-[var(--radius-md)] px-3',
                'text-ui text-[var(--text-secondary)]',
                'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
                'hover:bg-[var(--surface-inset)] hover:text-[var(--text-primary)]',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              ].join(' ')}
            >
              <DestinationIcon name="search" size={18} />
              <span className="hidden lg:inline">Search</span>
              {/* The shortcut hint is generated content. As a text node it
                  became part of the button's visible label while `aria-label`
                  said only "Search", which fails WCAG 2.5.3 the other way round.
                  See `.search-hint` in index.css. */}
              <kbd
                data-hint="⌘K"
                className="search-hint hidden rounded-[var(--radius-sm)] border border-[var(--border-subtle)] px-1.5 py-0.5 font-[var(--font-mono)] text-[11px] text-[var(--text-tertiary)] xl:inline"
              />
            </button>
          )}
        </div>
      </div>

      {/* Announced to screen readers, invisible on screen. The visual skip
          links live in the shell; this is the landmark description. */}
      <VisuallyHidden>
        {CORE_DESTINATIONS.length} core sections and {HISTORICAL_DESTINATIONS.length} archived sections
      </VisuallyHidden>
    </nav>
  )
}

/** One navigation link. Split out so the active filete is easy to find. */
function NavLinkItem({ dest, pathname }: { dest: (typeof CORE_DESTINATIONS)[number]; pathname: string }) {
  const active = isDestinationActive(dest, pathname)
  return (
    <Link
      to={dest.to}
      aria-current={active ? 'page' : undefined}
      className={[
        'relative flex h-full items-center px-3',
        'text-ui font-[var(--fw-medium)] tracking-[var(--ls-ui)]',
        'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
        active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
      ].join(' ')}
    >
      {dest.label}
      {active && (
        <span aria-hidden className="absolute inset-x-2 bottom-0 h-0.5 rounded-t-full bg-[var(--text-accent)]" />
      )}
    </Link>
  )
}
