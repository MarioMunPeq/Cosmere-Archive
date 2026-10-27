import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
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
    expect(screen.getByRole('heading', { name: /chronicon cosmerae/i })).toBeInTheDocument()
  })

  it('renders the description', () => {
    renderPage()
    expect(screen.getByText(/archives of Silverlight/i)).toBeInTheDocument()
  })

  it('has a back link to the map', () => {
    renderPage()
    expect(screen.getByText('Archive')).toBeInTheDocument()
  })

  it('renders one saga filter bar with every saga', () => {
    renderPage()
    const filters = screen.getByRole('group', { name: /saga filters/i })
    expect(within(filters).getByText('Mistborn Era 1')).toBeInTheDocument()
    expect(within(filters).getByText('The Stormlight Archive')).toBeInTheDocument()
    expect(within(filters).getByText('Elantris')).toBeInTheDocument()
    expect(within(filters).getByText('Warbreaker')).toBeInTheDocument()
    expect(within(filters).getByText('White Sand')).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /saga index/i })).not.toBeInTheDocument()
  })

  it('renders timeline events as interactive SVG groups', () => {
    renderPage()
    const events = screen.getAllByRole('button', { name: /adonalsium|shattering|creation/i })
    expect(events.length).toBeGreaterThanOrEqual(3)
  })
})
