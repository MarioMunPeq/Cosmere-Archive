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
  it('renders the astronomical chart title', () => {
    renderPage()
    expect(screen.getByText('ASTRONOMICAL CHART')).toBeInTheDocument()
  })

  it('renders known planets', () => {
    renderPage()
    expect(screen.getByText(/roshar/i)).toBeInTheDocument()
    expect(screen.getByText(/scadrial/i)).toBeInTheDocument()
    expect(screen.getByText(/sel/i)).toBeInTheDocument()
    expect(screen.getByText(/nalthis/i)).toBeInTheDocument()
  })

  it('shows mode toggle buttons', () => {
    renderPage()
    expect(screen.getByText('Celestial Bodies')).toBeInTheDocument()
    expect(screen.getByText('Shardic Studies')).toBeInTheDocument()
  })

  it('shows shard reference on planet labels', () => {
    renderPage()
    expect(screen.getByText(/honor/i)).toBeInTheDocument()
    expect(screen.getByText(/preservation/i)).toBeInTheDocument()
  })

  it('shows the subtitle', () => {
    renderPage()
    expect(screen.getByText(/Cosmere Archive/i)).toBeInTheDocument()
    expect(screen.getByText(/Celestial Cartography/i)).toBeInTheDocument()
  })
})
