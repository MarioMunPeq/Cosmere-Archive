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
  it('renders the hero title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /cosmere in numbers/i })).toBeInTheDocument()
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

  it('renders word count section', () => {
    renderPage()
    expect(screen.getByText(/word count by book/i)).toBeInTheDocument()
  })

  it('renders publication timeline section', () => {
    renderPage()
    expect(screen.getByText(/publication timeline/i)).toBeInTheDocument()
  })

  it('renders shards section', () => {
    renderPage()
    expect(screen.getByText(/Shards Across the Cosmere/i)).toBeInTheDocument()
  })

  it('renders magic systems section', () => {
    renderPage()
    expect(screen.getByText(/Magic Systems by Category/i)).toBeInTheDocument()
  })

  it('renders timeline density section', () => {
    renderPage()
    expect(screen.getByText(/Timeline Event Density/i)).toBeInTheDocument()
  })

  it('renders the heralds section', () => {
    renderPage()
    expect(screen.getByText('The Heralds')).toBeInTheDocument()
  })

  it('has a back link to the map', () => {
    renderPage()
    expect(screen.getByText('Back to the map')).toBeInTheDocument()
  })
})
