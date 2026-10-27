/**
 * M2 · Block 3 — the landing page and the Historical index.
 *
 * The important assertion here is the one about the counters. §5.2 quotes
 * "22 / 93 / 103 / 118", and three of those match the data while one does not:
 * the Shadesmar catalog holds 47 souls, not 103. The test below recomputes
 * every figure from the same functions the component uses, so a counter that
 * drifts fails the build instead of quietly becoming a lie.
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import ArchiveDoors, { ARCHIVE_COUNTS } from '@/components/landing/ArchiveDoors'
import HistoricalPage from '@/pages/HistoricalPage'
import { BOOKS, SAGAS, ALL_CHARACTERS, PLANETS } from '@/data/static'
import { TIMELINE_EVENTS, ERAS } from '@/data/static/timeline'
import { buildEntityCatalog } from '@/components/shadesmar/entity-catalog'
import { CLUSTERS } from '@/components/shadesmar/types'
import { DIAGRAM_NOTES } from '@/data/static/diagram-notes'
import { CORE_DESTINATIONS, HISTORICAL_DESTINATIONS, SECONDARY_DESTINATIONS } from '@/navigation'

const wrap = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('archive counters', () => {
  it('are measured from the data, not typed by hand', () => {
    expect(ARCHIVE_COUNTS.volumes).toBe(BOOKS.length)
    expect(ARCHIVE_COUNTS.series).toBe(SAGAS.length)
    expect(ARCHIVE_COUNTS.records).toBe(ALL_CHARACTERS.length)
    expect(ARCHIVE_COUNTS.worlds).toBe(PLANETS.length)
    expect(ARCHIVE_COUNTS.souls).toBe(buildEntityCatalog().length)
    expect(ARCHIVE_COUNTS.realms).toBe(CLUSTERS.length)
    expect(ARCHIVE_COUNTS.events).toBe(TIMELINE_EVENTS.length)
    expect(ARCHIVE_COUNTS.eras).toBe(ERAS.length)
  })

  it('matches the figures §5.2 quotes, where the data agrees', () => {
    // The plan lists 22 volumes, 93 records and 118 events.
    expect(ARCHIVE_COUNTS.volumes).toBe(22)
    expect(ARCHIVE_COUNTS.records).toBe(93)
    expect(ARCHIVE_COUNTS.events).toBe(118)
    expect(ARCHIVE_COUNTS.eras).toBe(11)
  })

  it('records the Shadesmar figure as the catalog really holds it', () => {
    // §5.2 says "103 souls". The catalog defines 47 SoulDefs, so the number on
    // the door is 47. If the catalog grows, this still holds.
    expect(ARCHIVE_COUNTS.souls).toBe(buildEntityCatalog().length)
    expect(ARCHIVE_COUNTS.souls).toBeLessThan(103)
  })
})

describe('ArchiveDoors', () => {
  it('renders one door per core destination', () => {
    wrap(<ArchiveDoors />)
    const archiveLinks = CORE_DESTINATIONS.map((dest) =>
      screen.getByRole('link', { name: new RegExp(dest.label, 'i') }),
    )
    expect(new Set(archiveLinks).size).toBe(CORE_DESTINATIONS.length)
  })

  it('every door is a real link with an href', () => {
    wrap(<ArchiveDoors />)
    for (const dest of CORE_DESTINATIONS) {
      const link = screen.getByRole('link', { name: new RegExp(dest.label, 'i') })
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', dest.to)
    }
  })

  it('shows the real volume and series counts on the Library door', () => {
    wrap(<ArchiveDoors />)
    const library = screen.getByRole('link', { name: /Library/i })
    expect(library).toHaveAttribute(
      'aria-label',
      `Library: ${ARCHIVE_COUNTS.volumes} volumes in ${ARCHIVE_COUNTS.series} series`,
    )
  })

  it('shows the real record and event counts on their doors', () => {
    wrap(<ArchiveDoors />)
    expect(screen.getByRole('link', { name: /Records/i })).toHaveAttribute(
      'aria-label',
      `Records: ${ARCHIVE_COUNTS.records} biographies from ${ARCHIVE_COUNTS.worlds} worlds`,
    )
    expect(screen.getByRole('link', { name: /Taravangian Diagram/i })).toHaveAttribute(
      'aria-label',
      `Taravangian Diagram. ${DIAGRAM_NOTES.length} leaves: six deductions and three tallies.`,
    )
  })

  it('gives every door a description, not just a title', () => {
    wrap(<ArchiveDoors />)
    const doorLinks = CORE_DESTINATIONS.map((dest) => screen.getByRole('link', { name: new RegExp(dest.label, 'i') }))
    for (const link of doorLinks) {
      const accessibleDescription = link.getAttribute('aria-label')
      expect(accessibleDescription).toBeTruthy()
      expect(accessibleDescription!.length).toBeGreaterThan(8)
    }
  })
})

describe('HistoricalPage', () => {
  it('names itself', () => {
    wrap(<HistoricalPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Historical Archive' })).toBeInTheDocument()
  })

  it('lists all three sections as valid links', () => {
    wrap(<HistoricalPage />)
    for (const dest of HISTORICAL_DESTINATIONS) {
      const link = screen.getAllByRole('link', { name: new RegExp(dest.label, 'i') })[0]
      expect(link).toBeDefined()
      expect(link).toHaveAttribute('href', dest.to)
    }
  })

  it('keeps the secondary routes reachable', () => {
    wrap(<HistoricalPage />)
    for (const dest of SECONDARY_DESTINATIONS) {
      expect(screen.getAllByRole('link', { name: new RegExp(dest.label, 'i') })[0]).toHaveAttribute('href', dest.to)
    }
  })

  it('shows a status note on every archived section (A.3)', () => {
    wrap(<HistoricalPage />)
    expect(screen.getAllByText(/^(Legacy|Maintained)\./)).toHaveLength(HISTORICAL_DESTINATIONS.length)
  })
})
