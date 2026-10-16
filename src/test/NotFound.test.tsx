/**
 * M2 · Block 5 — the 404 page.
 *
 * Rewritten from the ArchiveError "destroyed manuscript" to a recovery page.
 * The assertions changed with it, and deliberately: the old test checked for
 * "Restore Record", "Return to Archive" and "Open Index", which are three
 * flavours of the same two actions. What is worth pinning down is that a lost
 * URL can be recovered from, which means every core destination is offered.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFound from '@/pages/NotFound'
import { CORE_DESTINATIONS, HISTORICAL_DESTINATIONS } from '@/navigation'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/nope']}>
      <NotFound />
    </MemoryRouter>,
  )
}

describe('NotFound', () => {
  it('names the situation', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: /record not found/i })).toBeInTheDocument()
  })

  it('says what happened, not just that something did', () => {
    renderPage()
    expect(screen.getByText(/no entry under that designation/i)).toBeInTheDocument()
  })

  it('does not repeat the title or description for screen readers', () => {
    renderPage()
    // A VisuallyHidden summary of the same words would make a screen reader
    // announce the title and the description twice.
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      screen.getAllByText(/no entry under that designation/i),
      'the description is rendered once, in the header',
    ).toHaveLength(1)
  })

  it('offers a way back to the archive', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /back to the archive/i })).toHaveAttribute('href', '/')
  })

  it('lists every core destination, so nothing is a dead end', () => {
    renderPage()
    for (const dest of CORE_DESTINATIONS) {
      const link = screen.getAllByRole('link', { name: new RegExp(dest.label, 'i') })[0]
      expect(link, dest.label).toHaveAttribute('href', dest.to)
    }
  })

  it('lists the archived sections too', () => {
    renderPage()
    for (const dest of HISTORICAL_DESTINATIONS) {
      expect(screen.getAllByRole('link', { name: new RegExp(dest.label, 'i') })[0], dest.label).toHaveAttribute(
        'href',
        dest.to,
      )
    }
  })

  it('points at search, which reaches every record', () => {
    renderPage()
    expect(screen.getByText(/search reaches every record/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Ctrl/).length).toBeGreaterThan(0)
  })

  it('has exactly one h1', () => {
    renderPage()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
})
