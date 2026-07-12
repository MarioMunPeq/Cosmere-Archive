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
  it('renders the catalogue document', () => {
    renderPage()
    expect(screen.getByText('CATALOGUE')).toBeInTheDocument()
  })

  it('renders stat cards with counts', () => {
    renderPage()
    expect(screen.getAllByText('Books').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Sagas').length).toBeGreaterThanOrEqual(1)
  })

  it('renders volumes by cycle section', () => {
    renderPage()
    expect(screen.getByText('VOLUMES BY CYCLE')).toBeInTheDocument()
  })

  it('renders census section', () => {
    renderPage()
    expect(screen.getByText('CENSUS')).toBeInTheDocument()
  })

  it('renders word count note', () => {
    renderPage()
    expect(screen.getByText(/total words/i)).toBeInTheDocument()
  })

  it('renders chronology section', () => {
    renderPage()
    expect(screen.getByText('CHRONOLOGY')).toBeInTheDocument()
  })

  it('renders shards section', () => {
    renderPage()
    expect(screen.getByText('SHARDS')).toBeInTheDocument()
  })

  it('renders the heralds section', () => {
    renderPage()
    expect(screen.getByText('HERALDS')).toBeInTheDocument()
  })

  it('shows the Diagram title', () => {
    renderPage()
    expect(screen.getByText('THE DIAGRAM')).toBeInTheDocument()
  })
})
