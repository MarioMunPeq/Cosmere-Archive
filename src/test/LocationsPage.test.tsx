import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LocationsPage from '@/pages/LocationsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <LocationsPage />
    </MemoryRouter>,
  )
}

describe('LocationsPage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /locations/i })).toBeInTheDocument()
  })

  it('renders known planets', () => {
    renderPage()
    expect(screen.getByText('Roshar')).toBeInTheDocument()
    expect(screen.getByText('Scadrial')).toBeInTheDocument()
    expect(screen.getByText('Sel')).toBeInTheDocument()
    expect(screen.getByText('Nalthis')).toBeInTheDocument()
  })

  it('shows shard info on planet cards', () => {
    renderPage()
    expect(screen.getByText(/honor.*cultivation.*odium/i)).toBeInTheDocument()
    expect(screen.getByText(/preservation.*ruin.*harmony/i)).toBeInTheDocument()
  })

  it('shows saga names for planets', () => {
    renderPage()
    expect(screen.getAllByText(/sagas:/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Mistborn Era 1/).length).toBeGreaterThanOrEqual(1)
  })

  it('has a back link to the map', () => {
    renderPage()
    expect(screen.getByText('Back to the map')).toBeInTheDocument()
  })
})
