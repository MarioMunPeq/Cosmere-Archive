import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StandaloneChronologyPage from '@/pages/StandaloneChronologyPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <StandaloneChronologyPage />
    </MemoryRouter>,
  )
}

describe('StandaloneChronologyPage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /cosmere chronology/i })).toBeInTheDocument()
  })

  it('renders the description', () => {
    renderPage()
    expect(screen.getByText(/anonymous archivist of silverlight/i)).toBeInTheDocument()
  })

  it('has a back link to the map', () => {
    renderPage()
    expect(screen.getByText('Back to the map')).toBeInTheDocument()
  })

  it('renders saga index tabs', () => {
    renderPage()
    expect(screen.getByText('Mistborn Era 1')).toBeInTheDocument()
    expect(screen.getByText('The Stormlight Archive')).toBeInTheDocument()
    expect(screen.getByText('Elantris')).toBeInTheDocument()
    expect(screen.getByText('Warbreaker')).toBeInTheDocument()
    expect(screen.getByText('White Sand')).toBeInTheDocument()
  })

  it('renders timeline events as interactive SVG groups', () => {
    renderPage()
    const events = screen.getAllByRole('button', { name: /adonalsium|shattering|creation/i })
    expect(events.length).toBeGreaterThanOrEqual(3)
  })
})
