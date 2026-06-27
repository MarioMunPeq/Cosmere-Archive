import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StatsPage from '@/pages/StatsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <StatsPage />
    </MemoryRouter>,
  )
}

describe('StatsPage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /cosmere stats/i })).toBeInTheDocument()
  })

  it('renders stat cards with counts', () => {
    renderPage()
    expect(screen.getByText('Books')).toBeInTheDocument()
    expect(screen.getByText('Characters')).toBeInTheDocument()
    expect(screen.getByText('Planets')).toBeInTheDocument()
    expect(screen.getByText('Sagas')).toBeInTheDocument()
  })

  it('renders books by saga section', () => {
    renderPage()
    expect(screen.getByText('Books by Saga')).toBeInTheDocument()
  })

  it('renders characters by planet section', () => {
    renderPage()
    expect(screen.getByText('Characters by Planet')).toBeInTheDocument()
  })

  it('has a back link to the map', () => {
    renderPage()
    expect(screen.getByText('Back to the map')).toBeInTheDocument()
  })
})
