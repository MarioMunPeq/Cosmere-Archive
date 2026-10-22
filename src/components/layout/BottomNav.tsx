/**
 * BottomNav — the fixed bar below 768px. §5.1.
 *
 * Five destinations, 56×56 each, with env(safe-area-inset-bottom) so the last
 * row is not under the home indicator on iOS.
 *
 * The labels are `sr-only` rather than hidden with `display: none`, because the
 * icons carry the meaning visually and the label has to reach the accessibility
 * tree. Each link is a real anchor with `aria-label`, so middle-click and
 * "open in new tab" work here too.
 */

import { Link, useLocation } from 'react-router-dom'
import { CORE_DESTINATIONS, isDestinationActive } from '@/navigation'
import type { IconName } from '@/navigation'
import DestinationIcon from './DestinationIcon'

/**
 * Five slots, per §5.1: Home, the first three core pieces, and More.
 *
 * The Taravangian Diagram is the fourth core piece but is deliberately absent
 * from the bottom bar rather than displacing More: a 56px slot cannot carry
 * six destinations at 320px without the labels becoming unreadable, and More
 * leads to a page that lists everything. Nothing is unreachable.
 */
/**
 * Five slots, per §5.1: Home, three of the four core pieces, and More.
 *
 * The Taravangian Diagram is the fourth core piece but is deliberately absent
 * rather than displacing More: six 56px slots at 320px leaves each one under
 * the 44px minimum once the safe area is subtracted. More leads to the
 * Historical Archive index, which lists every destination, so nothing becomes
 * unreachable.
 */
export default function BottomNav() {
  const { pathname } = useLocation()

  // The three that fit. Diagram is reachable from More and from the top bar.
  const slots = CORE_DESTINATIONS.filter((d) => d.id !== 'diagram')

  return (
    <nav
      aria-label="Primary"
      className={['z-[var(--z-nav)] shrink-0 md:hidden', 'fixed inset-x-0 bottom-0'].join(' ')}
      style={{
        height: 'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'linear-gradient(180deg, rgba(34,39,35,.98) 0%, rgba(24,29,27,.99) 100%)',
        boxShadow: 'inset 0 1px 0 rgba(230,224,204,.06), 0 -1px 0 rgba(183,165,121,.2), 0 -6px 20px rgba(0,0,0,.3)',
      }}
    >
      <ul className="mx-auto grid h-[var(--bottom-nav-h)] max-w-[560px] grid-cols-5">
        <BarItem to="/" icon="home" label="Home" active={pathname === '/'} />
        {slots.map((dest) => (
          <BarItem
            key={dest.id}
            to={dest.to}
            icon={dest.icon}
            label={dest.label}
            active={isDestinationActive(dest, pathname)}
          />
        ))}

        {/* "More" leads to the Historical Archive index, which lists every
            destination including the Taravangian Diagram. A real link, not a
            button that opens a sheet, so it can be opened in a new tab. */}
        <BarItem to="/historical" icon="more" label="More" active={pathname.startsWith('/historical')} />
      </ul>
    </nav>
  )
}

interface ItemProps {
  to: string
  icon: IconName
  label: string
  active: boolean
}

function BarItem({ to, icon, label, active }: ItemProps) {
  return (
    <li className="min-w-0">
      <Link
        to={to}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={[
          'flex h-full min-h-[var(--target-min)] w-full flex-col items-center justify-center gap-1',
          'rounded-[var(--radius-md)] transition-colors duration-[var(--dur-fast)]',
          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          active ? 'text-[var(--text-accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
        ].join(' ')}
      >
        {icon === 'home' ? (
          <span
            aria-hidden
            className={`grid h-[26px] w-[26px] place-items-center rounded-full border bg-[#d4c69f] p-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,.55),0_2px_5px_rgba(0,0,0,.4)] ${active ? 'border-[#e9ddbc]' : 'border-[#8f907b]'}`}
          >
            <img
              src={`${import.meta.env.BASE_URL}images/brand/cosmere-mark.png`}
              alt=""
              className="h-full w-full object-contain"
            />
          </span>
        ) : (
          <DestinationIcon name={icon} size={24} />
        )}
        {/* The bar only exists below 768px, where there is no room for a label
            under every icon. It stays in the accessibility tree so the link is
            not announced as an unlabelled target. */}
        <span className="sr-only">{label}</span>
      </Link>
    </li>
  )
}
