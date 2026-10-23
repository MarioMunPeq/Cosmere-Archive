/**
 * BottomNav — the fixed bar below 768px. §5.1.
 *
 * Seven slots: Home, the five core destinations, and More. Every core piece is
 * present, including the Diagram and Aharietiam, so the mobile bar mirrors the
 * five spines on the desktop shelf. At 320px each slot is 45.7px wide, which
 * still clears the 44px target; the labels are `sr-only` so the icons are not
 * squeezed by text.
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

export default function BottomNav() {
  const { pathname } = useLocation()

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
      <ul className="mx-auto grid h-[var(--bottom-nav-h)] max-w-[560px] grid-cols-7">
        <BarItem to="/" icon="home" label="Home" active={pathname === '/'} />
        {CORE_DESTINATIONS.map((dest) => (
          <BarItem
            key={dest.id}
            to={dest.to}
            icon={dest.icon}
            label={dest.label}
            active={isDestinationActive(dest, pathname)}
          />
        ))}

        {/* "More" leads to the Historical Archive index, which lists the
            preserved sections and the secondary routes. A real link, not a
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
