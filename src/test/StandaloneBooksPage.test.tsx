import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StandaloneBooksPage from '@/pages/StandaloneBooksPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <StandaloneBooksPage />
    </MemoryRouter>,
  )
}

describe('StandaloneBooksPage', () => {
  it('renders the page heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /cosmere books/i })).toBeInTheDocument()
  })

  it('renders the description', () => {
    renderPage()
    expect(screen.getByText(/All Cosmere books/i)).toBeInTheDocument()
  })

  it('has a back link to the map', () => {
    renderPage()
    expect(screen.getByText('Back to the map')).toBeInTheDocument()
  })

  it('renders book links', () => {
    renderPage()
    expect(screen.getAllByText('The Final Empire').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('The Way of Kings').length).toBeGreaterThanOrEqual(1)
  })

  it('renders saga filter buttons', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mistborn era 1/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /stormlight/i })).toBeInTheDocument()
  })
})
