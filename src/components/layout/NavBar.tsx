/**
 * NavBar — the shelf.
 *
 * ## What this replaces
 *
 * A 56px bar with `backdropFilter: blur(12px)`, a wordmark, four text links
 * with an active filete, a dropdown button, and a search button. That is a
 * website's navigation in a library's costume, and D-DIEG does not allow it.
 *
 * ## What a shelf is
 *
 * A wooden plank across the top of the room. On it, one small book per
 * destination — a spine standing upright, its title rotated to read down the
 * spine, the active one pulled slightly out toward the reader. The wordmark
 * is a wax seal pressed into the wood at the left end: a glyph, not a
 * sentence, with the name revealed only when you bring your hand close. The
 * Historical section is a drawer in the shelf, opened by a brass pull. Search
 * is a brass magnifying glass resting on the rail.
 *
 * ## Accessibility
 *
 * Everything is still a real link or button. The spines are `<a>` with
 * `aria-current`. The drawer trigger is a `<button>` with `aria-expanded`.
 * The seal is an `<a>` with an `aria-label`. The magnifying glass is a
 * `<button>` with `aria-label="Search"`. Keyboard navigation, focus rings,
 * and screen-reader announcements are unchanged.
 */
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CORE_DESTINATIONS, HISTORICAL_DESTINATIONS, isDestinationActive } from '@/navigation'
import { BOOKS, PLANETS, ALL_CHARACTERS } from '@/data/static'
import DestinationIcon from './DestinationIcon'
import VisuallyHidden from '@/components/primitives/VisuallyHidden'
import HistoricalMenu from './HistoricalMenu'

interface Props {
  onSearch?: () => void
}

export default function NavBar({ onSearch }: Props) {
  const { pathname } = useLocation()
  const barRef = useRef<HTMLElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)

  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const menuOpen = openedAt !== null && openedAt === pathname
  const setMenuOpen = (next: boolean) => setOpenedAt(next ? pathname : null)

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
      className="relative z-[var(--z-nav)] shrink-0"
      style={{
        height: 'var(--nav-h)',
        background: 'linear-gradient(180deg, #3a2414 0%, #2a180c 60%, #1a0e06 100%)',
        boxShadow: 'inset 0 -2px 0 #0e0604, 0 4px 12px rgba(0,0,0,0.5)',
      }}
    >
      {/* Wood grain on the shelf. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(80,50,24,0.15) 0px, rgba(80,50,24,0.15) 1px, transparent 1px, transparent 6px)',
        }}
      />

      <div className="relative mx-auto flex h-full max-w-page items-center gap-2 px-[var(--gutter-md)] max-md:px-[var(--gutter)]">
        {/* The wax seal: the wordmark. */}
        <Link
          to="/"
          aria-label="Cosmere Archive — home"
          className="group relative flex h-[var(--target-min)] w-[var(--target-min)] shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          style={{
            background: 'radial-gradient(circle at 35% 30%, #6a2a1a 0%, #3a1208 55%, #1a0604 100%)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.6), inset 0 1px 0 rgba(190,100,80,0.15)',
            border: '1px solid #2a0a06',
          }}
        >
          <DestinationIcon name="shard" size={18} className="text-[#d8a080]" />
          <span className="sr-only">Cosmere Archive</span>
          <span
            aria-hidden
            className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-[2px] px-2 py-1 font-[var(--font-display)] text-[12px] tracking-[0.08em] text-[#d8b878] opacity-0 transition-opacity duration-[var(--dur-fast)] group-hover:opacity-100 group-focus-visible:opacity-100"
            style={{
              background: 'linear-gradient(180deg, #2a1a0e 0%, #1a0e06 100%)',
              border: '1px solid #5a3e1e',
            }}
          >
            COSMERE ARCHIVE
          </span>
        </Link>

        {/* The shelf of spines. */}
        <ul className="ml-2 hidden h-full items-end gap-1 pb-1 md:flex">
          {CORE_DESTINATIONS.map((dest) => (
            <li key={dest.id} className="h-full">
              <SpineLink dest={dest} pathname={pathname} />
            </li>
          ))}
        </ul>

        <div className="ml-auto flex h-full items-center gap-1">
          {/* Historical: a drawer pull. */}
          <div className="relative h-full">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-controls="historical-menu"
              className="flex h-[var(--target-min)] items-center gap-1.5 rounded-[2px] px-2 font-[var(--font-display)] text-[12px] text-[#d8b878] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] hover:text-[#f0d0a0]"
              style={{
                background: menuOpen ? 'linear-gradient(180deg, #3a2a14 0%, #24180a 100%)' : 'transparent',
                border: menuOpen ? '1px solid #5a3e1e' : '1px solid transparent',
              }}
            >
              Historical
              <DestinationIcon
                name="chevron"
                size={14}
                className={`text-[#5a3e1e] transition-transform duration-[var(--dur-fast)] ${menuOpen ? 'rotate-180' : ''}`}
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

          {/* Search: a brass magnifying glass. */}
          {onSearch && (
            <button
              type="button"
              onClick={onSearch}
              aria-label="Search"
              className="flex h-[var(--target-min)] min-w-[44px] items-center justify-center rounded-[2px] px-2 text-[#d8b878] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-standard)] hover:text-[#f0d0a0] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <DestinationIcon name="search" size={18} />
              <span className="sr-only">Search</span>
              <kbd
                data-hint="⌘K"
                className="search-hint hidden rounded-[2px] border border-[#5a3e1e] px-1.5 py-0.5 font-[var(--font-mono)] text-[11px] text-[#5a3e1e] xl:inline"
              />
            </button>
          )}
        </div>
      </div>

      <VisuallyHidden>
        {BOOKS.length} volumes across {PLANETS.length} worlds and {ALL_CHARACTERS.length} named souls
      </VisuallyHidden>
    </nav>
  )
}

/** One spine on the shelf. */
function SpineLink({ dest, pathname }: { dest: (typeof CORE_DESTINATIONS)[number]; pathname: string }) {
  const active = isDestinationActive(dest, pathname)
  return (
    <Link
      to={dest.to}
      aria-current={active ? 'page' : undefined}
      aria-label={dest.label}
      title={dest.label}
      className={[
        'relative flex h-full items-center justify-center px-2',
        'transition-transform duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
        active ? 'translate-y-0.5' : 'hover:translate-y-0.5',
      ].join(' ')}
      style={{ minWidth: 44 }}
    >
      {/* A book lying flat on the shelf: spine up, title horizontal. */}
      <span
        aria-hidden
        className="flex h-[26px] items-center rounded-[2px] px-3"
        style={{
          background: active
            ? 'linear-gradient(180deg, #5a3e1e 0%, #3a2414 100%)'
            : 'linear-gradient(180deg, #2a1a0e 0%, #1a0e06 100%)',
          border: '1px solid #0e0604',
          boxShadow: active ? '0 4px 8px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.4)',
        }}
      >
        <span className="whitespace-nowrap font-[var(--font-display)] text-[11px] tracking-[0.05em] text-[#d8b878]">
          {dest.label}
        </span>
      </span>
      <span className="sr-only">{dest.label}</span>
      {active && <span aria-hidden className="absolute bottom-1 left-2 right-2 h-0.5 rounded-t-full bg-[#d8b878]" />}
    </Link>
  )
}
