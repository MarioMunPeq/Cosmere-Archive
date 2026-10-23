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
  const historicalActive = HISTORICAL_DESTINATIONS.some((destination) => isDestinationActive(destination, pathname))
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
      className="relative z-[var(--z-nav)] shrink-0 overflow-visible border-b border-[#83908a]/25"
      style={{
        height: 'var(--nav-h)',
        background: 'linear-gradient(180deg, rgba(34,39,35,.98) 0%, rgba(24,29,27,.99) 100%)',
        boxShadow: 'inset 0 1px 0 rgba(230,224,204,.06), inset 0 -1px 0 rgba(0,0,0,.5), 0 5px 18px rgba(0,0,0,.32)',
      }}
    >
      {/* Fine grain and a restrained archival inlay. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[.22]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(178,190,177,.025) 0px, rgba(178,190,177,.025) 1px, transparent 1px, transparent 11px), linear-gradient(180deg, transparent 0%, rgba(0,0,0,.22) 100%)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b7a579]/30 to-transparent"
      />

      <div className="relative mx-auto flex h-full max-w-page items-center gap-2 px-[var(--gutter-md)] max-md:px-[var(--gutter)] sm:gap-3 md:px-6 lg:px-[var(--gutter-md)]">
        {/* The attached Cosmere mark, mounted like a brass archive seal. */}
        <Link
          to="/"
          aria-label="Cosmere Archive — home"
          className="group relative flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full transition-transform duration-300 hover:-translate-y-0.5 hover:rotate-[2deg] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] sm:h-[46px] sm:w-[46px]"
          style={{
            background: 'radial-gradient(circle at 35% 25%, #e3d5ad 0%, #c4b184 72%, #8e8061 100%)',
            boxShadow:
              '0 3px 7px rgba(0,0,0,.58), inset 0 1px 1px rgba(255,245,205,.78), inset 0 -2px 3px rgba(70,42,18,.32)',
            border: '1px solid rgba(227,213,173,.72)',
          }}
        >
          <span aria-hidden className="absolute inset-[3px] rounded-full border border-[#58615a]/55" />
          <img
            src={`${import.meta.env.BASE_URL}images/brand/cosmere-mark.png`}
            alt=""
            className="relative h-[31px] w-[31px] object-contain sm:h-[34px] sm:w-[34px]"
          />
          <span className="sr-only">Cosmere Archive</span>
          <span
            aria-hidden
            className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-[2px] px-2 py-1 font-[var(--font-display)] text-[12px] tracking-[0.08em] text-[#e2d3ad] opacity-0 transition-opacity duration-[var(--dur-fast)] group-hover:opacity-100 group-focus-visible:opacity-100"
            style={{
              background: 'linear-gradient(180deg, #29302b 0%, #1a201d 100%)',
              border: '1px solid #596257',
            }}
          >
            COSMERE ARCHIVE
          </span>
        </Link>
        <div
          aria-hidden
          className="hidden h-8 w-px bg-gradient-to-b from-transparent via-[#9da18b]/35 to-transparent xl:block"
        />
        <div aria-hidden className="hidden min-w-[112px] flex-col leading-none xl:flex">
          <span className="font-[var(--font-display)] text-[11px] tracking-[.12em] text-[#e8e0cc]">COSMERE</span>
          <span className="mt-1 font-[var(--font-mono)] text-[7px] tracking-[.2em] text-[#9e9e89]">FIELD ARCHIVE</span>
        </div>

        {/* The archive's volumes, lifted slightly from their brass rail. */}
        <div className="relative ml-1 hidden h-full items-end px-1 pb-[7px] md:flex">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-[6px] h-px bg-gradient-to-r from-transparent via-[#b6a77e]/35 to-transparent"
          />
          <ul className="relative flex h-full items-end gap-1">
            {CORE_DESTINATIONS.map((dest) => (
              <li key={dest.id} className="h-full">
                <SpineLink dest={dest} pathname={pathname} />
              </li>
            ))}
          </ul>
        </div>

        <div className="ml-auto flex h-full items-center gap-1">
          {/* Historical: a brass drawer pull, lit when a leaf from the drawer is open. */}
          <div className="relative h-full">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-controls="historical-menu"
              aria-label="Historical"
              className="relative flex h-11 items-center gap-2 border-l border-[#a8a28a]/25 px-3 font-[var(--font-mono)] text-[12px] tracking-[.14em] text-[#c4b894] transition-all duration-300 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] hover:text-[#f0e5c9]"
              style={{
                background:
                  menuOpen || historicalActive
                    ? 'linear-gradient(180deg, rgba(111,111,82,.24), rgba(45,53,46,.22))'
                    : 'transparent',
                border: '1px solid transparent',
                boxShadow:
                  menuOpen || historicalActive
                    ? 'inset 0 1px 0 rgba(230,224,204,.08), 0 2px 6px rgba(0,0,0,.2)'
                    : 'none',
              }}
            >
              <span aria-hidden className="h-3 w-px bg-[#b6a77e]/55" />
              <span className="hidden lg:inline">Historical</span>
              <DestinationIcon
                name="chevron"
                size={14}
                className={`text-[#a8a58f] transition-transform duration-[var(--dur-fast)] ${menuOpen ? 'rotate-180' : ''}`}
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

          {/* Search: the small brass lens at the end of the shelf. */}
          {onSearch && (
            <button
              type="button"
              onClick={onSearch}
              aria-label="Search"
              className="relative ml-1 flex h-11 min-w-11 items-center justify-center border-l border-[#a8a28a]/25 px-2 text-[#c8bd9f] transition-all duration-300 hover:text-[#f2e9d4] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <DestinationIcon name="search" size={18} />
              <span className="sr-only">Search</span>
              <kbd
                data-hint="⌘K"
                className="search-hint hidden rounded-[2px] border border-[#5a3e1e] px-1.5 py-0.5 font-[var(--font-mono)] text-[12px] text-[#5a3e1e] xl:inline"
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
  const materials: Record<string, [string, string, string]> = {
    library: ['#56615d', '#343d3a', '#c6c1a8'],
    records: ['#655a4b', '#39342c', '#c9b995'],
    shadesmar: ['#4c625d', '#2e403d', '#bdc9b3'],
    diagram: ['#625a62', '#39343c', '#c8bca5'],
    // Cold steel with an ember foil: the stone circle at dusk. Measured
    // 5.62:1 at the top of the spine and 7.84:1 at the bottom, so the label
    // clears AA even on the lightest part of the gradient.
    aharietiam: ['#3b4b56', '#28353d', '#e8c79a'],
  }
  const [top, bottom, foil] = materials[dest.id] ?? ['#504b40', '#302e29', '#c6c1a8']
  return (
    <Link
      to={dest.to}
      aria-current={active ? 'page' : undefined}
      aria-label={dest.label}
      title={dest.label}
      className={[
        'relative flex h-full items-center justify-center border-b-2 px-2',
        'transition-[border-color,color] duration-300 ease-[var(--ease-standard)]',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
        active ? 'border-[#c8bc99]/75' : 'border-transparent hover:border-[#c8bc99]/30',
      ].join(' ')}
      style={{ minWidth: 48 }}
    >
      <span
        aria-hidden
        className="relative flex h-[31px] items-center border-l px-2 lg:px-3"
        style={{
          background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`,
          borderColor: active ? foil : 'rgba(201,166,105,.18)',
        }}
      >
        <span
          aria-hidden
          className="absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-[#e2d7b7]/35 to-transparent"
        />
        <span
          className="whitespace-nowrap font-[var(--font-display)] text-[12px] tracking-[0.08em]"
          style={{ color: active ? '#f3dfae' : foil }}
        >
          {dest.label}
        </span>
        <span
          aria-hidden
          className="absolute inset-x-2 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d1c6a7]/20 to-transparent"
        />
      </span>
      <span className="sr-only">{dest.label}</span>
      {active && (
        <span
          aria-hidden
          className="absolute bottom-0 left-2 right-2 h-px bg-[#ded1ad]/70 shadow-[0_0_8px_rgba(222,209,173,.25)]"
        />
      )}
    </Link>
  )
}
