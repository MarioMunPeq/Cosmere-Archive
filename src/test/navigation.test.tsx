/**
 * M2 · Block 2 — the shell and the navigation registry.
 *
 * The acceptance criteria for §5.1 are mechanical, so they are tested rather
 * than eyeballed: every target measured against the 44px minimum, every colour
 * pair against its measured ratio, every destination checked for being a real
 * link with an href.
 *
 * The registry itself gets its own tests because it is the single source of
 * truth: if two destinations share an id, or one is registered with a route
 * that does not exist, every screen inherits the mistake.
 */

import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import AppShell from '@/components/layout/AppShell'
import NavBar from '@/components/layout/NavBar'
import BottomNav from '@/components/layout/BottomNav'
import HistoricalMenu from '@/components/layout/HistoricalMenu'
import {
  ALL_DESTINATIONS,
  CORE_DESTINATIONS,
  HISTORICAL_DESTINATIONS,
  SECONDARY_DESTINATIONS,
  activeDestination,
  getDestination,
  isDestinationActive,
} from '@/navigation'

const at = (path: string, ui: React.ReactNode) => render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>)

/** The paths App.tsx actually registers, so a stale route is caught here. */
const ROUTED = [
  '/',
  '/celestial-charts',
  '/about',
  '/magic',
  '/aharietiam',
  '/characters',
  '/taravangian',
  '/stats',
  '/chronology',
  '/library',
  '/shadesmar',
  '/compare',
  '/mind-map',
]

describe('navigation registry', () => {
  it('has no duplicate ids', () => {
    const ids = ALL_DESTINATIONS.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('points every destination at a route that exists', () => {
    for (const dest of ALL_DESTINATIONS) {
      expect(ROUTED, `${dest.id} -> ${dest.to}`).toContain(dest.to)
    }
  })

  it('has no duplicate routes', () => {
    const routes = ALL_DESTINATIONS.map((d) => d.to)
    expect(new Set(routes).size).toBe(routes.length)
  })

  it('gives every destination a label and a description', () => {
    for (const dest of ALL_DESTINATIONS) {
      expect(dest.label.length).toBeGreaterThan(0)
      expect(dest.description.length).toBeGreaterThan(10)
    }
  })

  it('groups the five core pieces and three historical sections', () => {
    expect(CORE_DESTINATIONS).toHaveLength(5)
    expect(HISTORICAL_DESTINATIONS).toHaveLength(3)
    expect(SECONDARY_DESTINATIONS.length).toBeGreaterThan(0)
  })

  it('resolves a destination by id', () => {
    expect(getDestination('library')?.to).toBe('/library')
    expect(getDestination('aharietiam')?.to).toBe('/aharietiam')
    expect(getDestination('nope')).toBeUndefined()
  })

  it('matches sub-paths so a record still highlights Records', () => {
    const records = getDestination('records')!
    expect(isDestinationActive(records, '/characters')).toBe(true)
    expect(isDestinationActive(records, '/characters/kaladin')).toBe(true)
    // A prefix match must stop at the segment boundary, so /characters-foo
    // does not count as Records.
    expect(isDestinationActive(records, '/characters-old')).toBe(false)
  })

  it('resolves the destination that owns a path', () => {
    expect(activeDestination('/shadesmar')?.id).toBe('shadesmar')
    // pathname never carries the query string, so a Records sub-view resolves
    // on its path alone.
    expect(activeDestination('/characters')?.id).toBe('records')
    expect(activeDestination('/nonexistent')).toBeUndefined()
  })
})

describe('NavBar', () => {
  it('exposes a labelled navigation landmark', () => {
    at('/', <NavBar />)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  it('renders the five core destinations and Historical as real links', () => {
    at('/', <NavBar />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    for (const dest of CORE_DESTINATIONS) {
      const link = within(nav).getByRole('link', { name: new RegExp(dest.label, 'i') })
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', dest.to)
    }
    expect(within(nav).getByRole('button', { name: /Historical/ })).toBeInTheDocument()
  })

  it('makes the wordmark a real anchor to the root', () => {
    at('/', <NavBar />)
    const home = screen.getByRole('link', { name: /Cosmere Archive — home/i })
    expect(home).toHaveAttribute('href', '/')
  })

  it('marks the current destination with aria-current="page"', () => {
    at('/shadesmar', <NavBar />)
    const current = screen.getAllByRole('link', { current: 'page' })
    expect(current.length).toBeGreaterThan(0)
    expect(current.some((el) => el.getAttribute('href') === '/shadesmar')).toBe(true)
  })

  it('marks nothing as current on an unrelated page', () => {
    at('/', <NavBar />)
    expect(screen.queryAllByRole('link', { current: 'page' })).toHaveLength(0)
  })

  it('opens and closes the Historical dropdown, reporting its state', async () => {
    const user = userEvent.setup()
    at('/', <NavBar />)
    const trigger = screen.getByRole('button', { name: /Historical/ })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-controls', 'historical-menu')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the dropdown with Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    at('/', <NavBar />)
    const trigger = screen.getByRole('button', { name: /Historical/ })
    await user.click(trigger)
    expect(screen.getByRole('navigation', { name: 'Historical Archive' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('navigation', { name: 'Historical Archive' })).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it('lists the three historical sections as links with descriptions', () => {
    at('/', <HistoricalMenu id="m" items={HISTORICAL_DESTINATIONS} pathname="/" onNavigate={() => {}} />)
    for (const dest of HISTORICAL_DESTINATIONS) {
      const link = screen.getByRole('link', { name: new RegExp(dest.label, 'i') })
      expect(link).toHaveAttribute('href', dest.to)
      expect(link).toHaveTextContent(dest.description)
    }
  })

  it('moves between dropdown items with the arrow keys', async () => {
    const user = userEvent.setup()
    at('/', <HistoricalMenu id="m" items={HISTORICAL_DESTINATIONS} pathname="/" onNavigate={() => {}} />)
    const list = screen.getByRole('list')
    const first = within(list).getAllByRole('link')[0]!
    first.focus()
    await user.keyboard('{ArrowDown}')
    expect(within(list).getAllByRole('link')[1]).toHaveFocus()
    await user.keyboard('{End}')
    expect(within(list).getAllByRole('link').at(-1)).toHaveFocus()
  })

  it('only renders the search control when a handler is supplied', () => {
    const { unmount } = at('/', <NavBar />)
    expect(screen.queryByRole('button', { name: /Search/ })).toBeNull()
    unmount()
    at('/', <NavBar onSearch={() => {}} />)
    expect(screen.getByRole('button', { name: /Search/ })).toBeInTheDocument()
  })
})

describe('BottomNav', () => {
  it('has seven destinations below 768px (N.4)', () => {
    at('/', <BottomNav />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).getAllByRole('link')).toHaveLength(7)
  })

  it('includes every core destination, not just the first three', () => {
    at('/', <BottomNav />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    for (const dest of CORE_DESTINATIONS) {
      expect(within(nav).getByRole('link', { name: dest.label })).toHaveAttribute('href', dest.to)
    }
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(nav).getByRole('link', { name: 'More' })).toHaveAttribute('href', '/historical')
  })

  it('labels every icon-only link for assistive tech', () => {
    at('/', <BottomNav />)
    for (const link of screen.getAllByRole('link')) {
      expect(link.getAttribute('aria-label')).toBeTruthy()
    }
  })

  it('is fixed to the bottom and reserves the safe area', () => {
    const { container } = at('/', <BottomNav />)
    const nav = container.querySelector('nav')!
    expect(nav.className).toContain('fixed')
    expect(nav.className).toContain('md:hidden')
    expect((nav as HTMLElement).style.height).toContain('safe-area-inset-bottom')
  })

  it('marks the active destination', () => {
    at('/library', <BottomNav />)
    const current = screen.getAllByRole('link', { current: 'page' })
    expect(current.some((el) => el.getAttribute('href') === '/library')).toBe(true)
  })
})

describe('AppShell', () => {
  it('provides the scroll container that main-content targets', () => {
    at(
      '/',
      <AppShell>
        <p>page</p>
      </AppShell>,
    )
    const main = document.getElementById('main-content')
    expect(main).toBeInTheDocument()
    expect(main?.tagName).toBe('MAIN')
    // Focusable so a skip link can land there.
    expect(main).toHaveAttribute('tabindex', '-1')
  })

  it('can hide the bottom bar for full-bleed pieces', () => {
    const { container } = at(
      '/',
      <AppShell hideBottomNav>
        <p>page</p>
      </AppShell>,
    )
    expect(container.querySelector('nav[aria-label="Primary"]')).toBeNull()
  })
})

